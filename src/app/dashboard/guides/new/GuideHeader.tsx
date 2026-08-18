import {
  IGuideModeType,
  IGuideReasonType,
  IPerson,
  ISerialAssigned,
} from "@/app/types";
import { gql, useLazyQuery, useQuery } from "@apollo/client";
import React, { ChangeEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";

const SEARCH_CLIENT_BY_PARAMETER = gql`
  query SearchClient(
    $search: String!
    $documentType: String
    $operationDocumentType: String
    $isClient: Boolean
    $isDriver: Boolean
    $isSupplier: Boolean
    $isReceiver: Boolean
  ) {
    searchClientByParameter(
      search: $search
      documentType: $documentType
      operationDocumentType: $operationDocumentType
      isClient: $isClient
      isDriver: $isDriver
      isSupplier: $isSupplier
      isReceiver: $isReceiver
    ) {
      id
      names
      documentNumber
      documentType
    }
  }
`;
const GUIDE_REASON_QUERY = gql`
  query {
    allGuideReasons {
      code
      name
    }
  }
`;
const SERIALS_QUERY = gql`
  query ($subsidiaryId: Int) {
    allSerials(subsidiaryId: $subsidiaryId) {
      documentType
      documentTypeReadable
      serial
      isGeneratedViaApi
    }
  }
`;
const GUIDE_MODE_QUERY = gql`
  query {
    allGuideModes {
      code
      name
    }
  }
`;
function GuideHeader({
  guide,
  setGuide,
  handleGuide,
  auth,
  authContext,
  initialClientData,
}: any) {
  const [clientSearch, setClientSearch] = useState("");
  const [
    searchClientQuery,
    {
      loading: searchClientLoading,
      error: searchClientError,
      data: searchClientData,
    },
  ] = useLazyQuery(SEARCH_CLIENT_BY_PARAMETER, {
    context: authContext,
    fetchPolicy: "network-only",
    onError: (err) => console.error("Error in Search Client:", err),
  });

  const {
    loading: guideReasonsLoading,
    error: guideReasonsError,
    data: guideReasonsData,
  } = useQuery(GUIDE_REASON_QUERY, {
    context: authContext,
    skip: !auth?.jwtToken,
  });

  const {
    loading: guideModesLoading,
    error: guideModesError,
    data: guideModesData,
  } = useQuery(GUIDE_MODE_QUERY, {
    context: authContext,
    skip: !auth?.jwtToken,
  });

  const {
    loading: serialsAssignedLoading,
    error: serialsAssignedError,
    data: serialsAssignedData,
  } = useQuery(SERIALS_QUERY, {
    context: authContext,
    fetchPolicy: "network-only",
    variables: {
      subsidiaryId: Number(auth?.user?.subsidiaryId),
    },
    skip: !auth?.jwtToken,
  });
  useEffect(() => {
    if (serialsAssignedData?.allSerials?.length > 0) {
      const filteredSeries = serialsAssignedData.allSerials.filter(
        (s: ISerialAssigned) =>
          s.documentType === `A_${guide.documentType}` && !s.isGeneratedViaApi
      );

      if (filteredSeries.length > 0) {
        setGuide((prev: any) => ({
          ...prev,
          serial: filteredSeries[0].serial,
        }));
      } else {
        setGuide((prev: any) => ({
          ...prev,
          serial: "",
        }));
      }
    }
  }, [serialsAssignedData, guide.documentType]);
  const toastId = "itinerantTransferToast";
  const validateClientSelection = (clientIdentifier: string) => {
    if (
      guide.guideReasonTransfer !== "18" &&
      guide.guideReasonTransfer !== "02"
    ) {
      const companyDoc = auth?.user?.companyDoc; // 20611894067
      if (clientIdentifier.includes(companyDoc)) {
        if (!toast.isActive(toastId)) {
          toast(
            "Cuando el motivo no es TRASLADO EMISOR ITINERANTE CP. o COMPRA El cliente debe ser diferente al RUC del emisor. " +
              companyDoc,
            {
              hideProgressBar: true,
              autoClose: 2000,
              type: "error",
              toastId: toastId,
            }
          );
        }
        return false;
      }
    }
    // if (guide.guideReasonTransfer === "01") {
    //     const companyDoc = auth?.user?.companyDoc; // 20611894067
    //     if (clientIdentifier.includes(companyDoc)) {
    //         if (!toast.isActive(toastId)) {
    //             toast(
    //                 "Cuando el motivo es VENTA. El cliente debe ser diferente al RUC del emisor. " +
    //                     companyDoc,
    //                 {
    //                     hideProgressBar: true,
    //                     autoClose: 2000,
    //                     type: "error",
    //                     toastId: toastId,
    //                 }
    //             );
    //         }
    //         return false;
    //     }
    // }
    return true;
  };

  const handleClientSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const clientSearchValue = event.target.value;
    if (!validateClientSelection(clientSearchValue)) return;
    setClientSearch(clientSearchValue);
  };

  const handleClientSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedOption = event.target.value;
    const selectedData = searchClientData?.searchClientByParameter?.find(
      (person: IPerson) =>
        `${person.documentNumber} ${person.names}` === selectedOption
    );

    if (!validateClientSelection(selectedOption)) return;

    if (selectedData) {
      setGuide({
        ...guide,
        clientId: selectedData.id,
        clientName: selectedData.names,
      });
    }
  };

  // Add this useEffect to handle initialClientData
  useEffect(() => {
    if (
      initialClientData &&
      initialClientData.id !== 0 &&
      initialClientData.documentNumber &&
      initialClientData.names
    ) {
      const clientSearchValue = `${initialClientData.documentNumber} ${initialClientData.names}`;
      setClientSearch(clientSearchValue);
      setGuide({
        ...guide,
        clientId: initialClientData.id,
        clientName: initialClientData.names,
      });
    }
  }, [initialClientData]);

  useEffect(() => {
    console.log(auth?.jwtToken);
    if (clientSearch.length > 2) {
      const queryVariables: {
        search: string;
        documentType?: string;
        isClient: boolean;
      } = {
        search: clientSearch,
        isClient: true,
      };

      if (guide?.documentType === "31") {
        queryVariables.documentType = "6";
      }

      searchClientQuery({
        variables: queryVariables,
      });
    }
  }, [clientSearch]);

  useEffect(() => {
    if (
      (guide?.guideReasonTransfer === "02" ||
        guide?.guideReasonTransfer === "04") &&
      guide?.guideModeTransfer === "02"
    ) {
      searchClientQuery({
        variables: {
          search: auth?.user?.companyDoc,
          isClient: true,
        },
        onCompleted: (data) => {
          const clientFound = data?.searchClientByParameter[0];
          if (clientFound) {
            const selectedOption = `${clientFound.documentNumber} ${clientFound.names}`;
            setClientSearch(selectedOption);
            setGuide({
              ...guide,
              clientId: clientFound.id,
              clientName: clientFound.names,
            });
          }
        },
      });
    } else if (!initialClientData) {
      setClientSearch("");
      setGuide({
        ...guide,
        clientId: "",
        clientName: "",
      });
    }
  }, [guide?.guideReasonTransfer, guide?.guideModeTransfer]);

  useEffect(() => {
    if (guide?.documentType === "31" && !initialClientData) {
      setGuide({
        ...guide,
        guideModeTransfer: "02",
        clientId: "",
        clientName: "",
      });
    }
  }, [guide?.documentType]);

  return (
    <div className="relative bg-white dark:bg-gray-800/80 backdrop-blur rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.1)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)] overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-60" />
      <div className="p-5 sm:p-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-5">
          Datos del Documento
        </h2>
        <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-5">
          {/* CPE Tipo documento */}
          <div>
            <label
              htmlFor="invoiceDocumentType"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Tipo documento
            </label>
            <select
              value={guide?.documentType}
              onChange={handleGuide}
              id="invoiceDocumentType"
              name="documentType"
              className="w-full h-10 sm:h-11 px-3 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-600/80 bg-gray-50/50 dark:bg-gray-700/30 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200"
            >
              <option value="09">GUIA DE REMISIÓN REMITENTE ELECTRÓNICA</option>
              <option value="31">GUÍA DE REMISIÓN TRANSPORTISTA</option>
            </select>
          </div>
          {guide?.documentType === "09" && (
            <>
              {/* Tipo de transporte */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo de transporte
                </label>
                <select
                  name="guideModeTransfer"
                  onChange={handleGuide}
                  value={guide.guideModeTransfer}
                  className="w-full h-10 sm:h-11 px-3 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-600/80 bg-gray-50/50 dark:bg-gray-700/30 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200"
                  required
                >
                  {guideModesData?.allGuideModes?.map(
                    (o: IGuideModeType, k: number) => (
                      <option key={k} value={o.code}>
                        {o.name}
                      </option>
                    )
                  )}
                </select>
              </div>
              {/* Motivo de traslado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Motivo de traslado
                </label>
                <select
                  name="guideReasonTransfer"
                  onChange={handleGuide}
                  value={guide.guideReasonTransfer}
                  className="w-full h-10 sm:h-11 px-3 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-600/80 bg-gray-50/50 dark:bg-gray-700/30 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200"
                  required
                >
                  {guideReasonsData?.allGuideReasons?.map(
                    (o: IGuideReasonType, k: number) => (
                      <option key={k} value={o.code}>
                        {o.name}
                      </option>
                    )
                  )}
                </select>
              </div>
            </>
          )}
          {/* CPE Cliente */}
          <div className="md:col-span-1 lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cliente
            </label>
            <input
              type="search"
              maxLength={100}
              onFocus={(e) => e.target.select()}
              value={clientSearch}
              onChange={handleClientSearchChange}
              onInput={handleClientSelect}
              list="clientList"
              autoComplete="off"
              className="w-full h-10 sm:h-11 px-3 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-600/80 bg-gray-50/50 dark:bg-gray-700/30 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200"
            />
            <datalist id="clientList">
              {searchClientData?.searchClientByParameter?.map(
                (n: IPerson, index: number) => (
                  <option
                    key={index}
                    data-key={n.id}
                    value={`${n.documentNumber} ${n.names}`}
                  />
                )
              )}
            </datalist>
          </div>

          {/* Serie */}
          <div>
            <label
              htmlFor="serial"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Serie
            </label>
            <select
              name="serial"
              id="serial"
              value={guide.serial}
              onChange={handleGuide}
              className="w-full h-10 sm:h-11 px-3 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-600/80 bg-gray-50/50 dark:bg-gray-700/30 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200"
              required
            >
              {serialsAssignedData?.allSerials
                ?.filter(
                  (s: ISerialAssigned) =>
                    s.documentType === `A_${guide.documentType}` &&
                    !s.isGeneratedViaApi
                )
                .map((s: ISerialAssigned) => (
                  <option key={s.serial} value={s.serial}>
                    {s.serial}
                  </option>
                )) || <option value="">No hay series disponibles</option>}
            </select>
            {serialsAssignedData?.allSerials?.filter(
              (s: ISerialAssigned) =>
                s.documentType === `A_${guide.documentType}` &&
                !s.isGeneratedViaApi
            ).length === 0 && (
              <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                No hay series asignadas para este tipo de documento
              </p>
            )}
          </div>
          {/* Numero */}
          <div>
            <label
              htmlFor="correlative"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Numero
            </label>
            <input
              type="text"
              name="correlative"
              id="correlative"
              maxLength={10}
              value={guide.correlative}
              onChange={handleGuide}
              onFocus={(e) => e.target.select()}
              placeholder="Automático"
              disabled
              className="w-full h-10 sm:h-11 px-3 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-600/80 bg-gray-100 dark:bg-gray-600/50 text-gray-500 dark:text-gray-400 cursor-not-allowed transition-all duration-200"
              autoComplete="off"
            />
          </div>
          {/* Fecha emisión */}
          <div>
            <label
              htmlFor="emitDate"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Fecha emisión
            </label>
            <input
              type="date"
              name="emitDate"
              id="emitDate"
              value={guide.emitDate}
              onChange={handleGuide}
              onFocus={(e) => e.target.select()}
              className="w-full h-10 sm:h-11 px-3 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-600/80 bg-gray-50/50 dark:bg-gray-700/30 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
              required
              disabled
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuideHeader;
