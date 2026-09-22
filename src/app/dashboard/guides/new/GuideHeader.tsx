import {
  IGuideModeType,
  IGuideReasonType,
  IPerson,
  ISerialAssigned,
} from "@/app/types";
import { gql, useLazyQuery, useQuery } from "@apollo/client";
import React, {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [hasFocusedInput, setHasFocusedInput] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          s.documentType === `A_${guide.documentType}` && !s.isGeneratedViaApi,
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
      const companyDoc = auth?.user?.companyDoc;
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
            },
          );
        }
        return false;
      }
    }
    return true;
  };

  const clientOptions: IPerson[] = useMemo(
    () => searchClientData?.searchClientByParameter || [],
    [searchClientData],
  );

  const getInitials = (name: string) => {
    if (!name) return "●";
    const parts = name.trim().split(/\s+/).slice(0, 2);
    return parts
      .map((p) => p.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);
  };

  const docTypeBadge = (docType: string) => {
    switch (String(docType)) {
      case "6":
        return {
          label: "RUC",
          cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20",
        };
      case "1":
        return {
          label: "DNI",
          cls: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400 border border-sky-200/60 dark:border-sky-500/20",
        };
      case "4":
        return {
          label: "CE",
          cls: "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400 border border-purple-200/60 dark:border-purple-500/20",
        };
      case "7":
        return {
          label: "PASS",
          cls: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20",
        };
      default:
        return {
          label: "DOC",
          cls: "bg-gray-100 text-gray-700 dark:bg-gray-500/15 dark:text-gray-400 border border-gray-200/60 dark:border-gray-500/20",
        };
    }
  };

  const avatarGradient = (seed: string) => {
    const palettes = [
      "from-blue-500 to-indigo-600",
      "from-purple-500 to-fuchsia-600",
      "from-pink-500 to-rose-600",
      "from-amber-500 to-orange-600",
      "from-emerald-500 to-teal-600",
      "from-sky-500 to-cyan-600",
    ];
    let hash = 0;
    for (let i = 0; i < seed.length; i++)
      hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    return palettes[hash % palettes.length];
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const re = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "ig",
    );
    const parts = text.split(re);
    return parts.map((p, i) =>
      re.test(p) ? (
        <span
          key={i}
          className="text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-500/10 rounded px-0.5"
        >
          {p}
        </span>
      ) : (
        <span key={i}>{p}</span>
      ),
    );
  };

  const selectClient = (person: IPerson) => {
    const combo = `${person.documentNumber} ${person.names}`;
    if (!validateClientSelection(combo)) return;
    setClientSearch(combo);
    setGuide({
      ...guide,
      clientId: person.id,
      clientName: person.names,
      clientDocumentNumber: person.documentNumber,
      clientDocumentType: person.documentType,
    });
    setShowDropdown(false);
    setHighlightedIndex(-1);
  };

  const clearClient = () => {
    setClientSearch("");
    setGuide({
      ...guide,
      clientId: "",
      clientName: "",
      clientDocumentNumber: "",
      clientDocumentType: "",
    });
    setHighlightedIndex(-1);
  };

  const handleClientSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const clientSearchValue = event.target.value;
    if (!validateClientSelection(clientSearchValue)) return;
    setClientSearch(clientSearchValue);
    setHighlightedIndex(-1);
    setShowDropdown(true);
  };

  const handleClientKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setShowDropdown(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < clientOptions.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      if (highlightedIndex >= 0 && clientOptions[highlightedIndex]) {
        e.preventDefault();
        selectClient(clientOptions[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setHighlightedIndex(-1);
    }
  };

  const isClientSelected = Boolean(
    guide?.clientId && Number(guide.clientId) > 0 && guide?.clientName,
  );

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
        clientDocumentNumber: initialClientData.documentNumber,
        clientDocumentType: initialClientData.documentType,
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
              clientDocumentNumber: clientFound.documentNumber,
              clientDocumentType: clientFound.documentType,
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
        clientDocumentNumber: "",
        clientDocumentType: "",
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
    <div className={`relative overflow-visible ${showDropdown ? "z-30" : "z-10"}`}>
      <div className="bg-white dark:bg-gray-800/80 backdrop-blur rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.1)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)] overflow-visible">
        <div className="h-1 rounded-t-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-60" />
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
                <option value="09">
                  GUIA DE REMISIÓN REMITENTE ELECTRÓNICA
                </option>
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
                      ),
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
                    {guideReasonsData?.allGuideReasons
                      ?.filter((o: IGuideReasonType) => String(o.code) !== "NA")
                      .map((o: IGuideReasonType, k: number) => (
                        <option key={k} value={o.code}>
                          {o.name}
                        </option>
                      ))}
                  </select>
                </div>
              </>
            )}
            {/* CPE Cliente */}
            <div
              className="md:col-span-1 lg:col-span-2 relative"
              ref={wrapperRef}
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cliente
                {isClientSelected && (
                  <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Seleccionado
                  </span>
                )}
              </label>
              <div className="relative group">
                <div
                  className={`pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-indigo-500/0 to-purple-500/0 transition-all duration-300 ${
                    showDropdown
                      ? "from-blue-500/20 via-indigo-500/20 to-purple-500/20 -inset-[1px] blur-[2px]"
                      : "group-focus-within:from-blue-500/10 group-focus-within:via-indigo-500/10 group-focus-within:to-purple-500/10 group-focus-within:-inset-[1px] group-focus-within:blur-[1px]"
                  }`}
                />
                <div className="relative">
                  <input
                    type="search"
                    name="clientSearch"
                    id="clientSearch"
                    maxLength={100}
                    onFocus={(e) => {
                      e.target.select();
                      setShowDropdown(true);
                      setHasFocusedInput(true);
                    }}
                    value={clientSearch}
                    onChange={handleClientSearchChange}
                    onKeyDown={handleClientKeyDown}
                    placeholder={
                      isClientSelected
                        ? undefined
                        : "Buscar por RUC, DNI o nombre..."
                    }
                    autoComplete="off"
                    spellCheck={false}
                    className={`w-full h-10 sm:h-11 pl-3 ${
                      clientSearch && isClientSelected
                        ? "pr-16"
                        : clientSearch
                          ? "pr-10"
                          : "pr-3"
                    } text-sm rounded-xl border-2 ${
                      isClientSelected
                        ? "border-emerald-300 dark:border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-500/5"
                        : "border-gray-200 dark:border-gray-600/80 bg-gray-50/50 dark:bg-gray-700/30"
                    } text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200`}
                  />
                  {clientSearch && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        clearClient();
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:bg-gray-200/80 dark:hover:bg-gray-600/60 hover:text-gray-700 dark:hover:text-gray-200 transition-colors z-10"
                      title="Limpiar"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                  {isClientSelected && clientSearch && !searchClientLoading && (
                    <span className="absolute right-11 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                      <div
                        className={`w-6 h-6 rounded-full bg-gradient-to-br ${avatarGradient(
                          guide.clientDocumentNumber || guide.clientName || "",
                        )} flex items-center justify-center text-[10px] font-bold text-white shadow-sm`}
                      >
                        {getInitials(guide.clientName || "")}
                      </div>
                    </span>
                  )}
                  {searchClientLoading && (
                    <span className="absolute right-11 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                      <svg
                        className="w-4 h-4 animate-spin text-blue-500"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    </span>
                  )}
                </div>
              </div>
              {showDropdown && hasFocusedInput && (
                <div className="absolute z-[9999] mt-2 w-full left-0 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/70 shadow-[0_20px_60px_-12px_rgba(15,23,42,0.25)] dark:shadow-[0_25px_65px_-15px_rgba(0,0,0,0.75)] backdrop-blur overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-70" />
                  <div className="max-h-[340px] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700/60 py-1">
                    {searchClientLoading && clientOptions.length === 0 && (
                      <div className="px-4 py-6 flex items-center justify-center gap-3 text-gray-500 dark:text-gray-400 text-sm">
                        <svg
                          className="w-5 h-5 animate-spin text-blue-500"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span className="font-medium">
                          Buscando clientes...
                        </span>
                      </div>
                    )}
                    {!searchClientLoading &&
                      clientOptions.length === 0 &&
                      clientSearch.length > 2 && (
                        <div className="px-5 py-8 flex flex-col items-center justify-center text-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700/60 flex items-center justify-center text-gray-400 dark:text-gray-500 mb-1">
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={1.8}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            No se encontraron clientes
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 max-w-[240px]">
                            Intenta con otra búsqueda por número de documento o
                            razón social.
                          </p>
                        </div>
                      )}
                    {!searchClientLoading &&
                      clientOptions.length === 0 &&
                      clientSearch.length <= 2 && (
                        <div className="px-5 py-6 flex flex-col items-center justify-center text-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500 dark:text-blue-400 mb-1">
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={1.8}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                          </div>
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Escribe para buscar un cliente
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            Usa al menos 3 caracteres para comenzar.
                          </p>
                        </div>
                      )}
                    {clientOptions.map((person: IPerson, index: number) => {
                      const pNames = person.names || "";
                      const pDocType = person.documentType || "";
                      const pDocNumber = person.documentNumber || "";
                      const badge = docTypeBadge(pDocType);
                      const active = highlightedIndex === index;
                      return (
                        <button
                          type="button"
                          key={`${person.id}-${index}`}
                          onMouseEnter={() => setHighlightedIndex(index)}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            selectClient(person);
                          }}
                          className={`w-full text-left px-3 py-2.5 flex items-center gap-3 transition-all duration-150 ${
                            active
                              ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 [&_*]:!no-underline"
                              : "hover:bg-gray-50 dark:hover:bg-gray-700/40"
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                                {highlightMatch(pNames, clientSearch)}
                              </p>
                              <span
                                className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wide ${badge.cls}`}
                              >
                                {badge.label}
                              </span>
                            </div>
                            <p className="mt-0.5 text-xs font-mono font-medium text-gray-500 dark:text-gray-400">
                              {highlightMatch(pDocNumber, clientSearch)}
                            </p>
                          </div>
                          <div
                            className={`flex-shrink-0 p-2 rounded-lg transition-all ${
                              active
                                ? "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                : "text-gray-300 dark:text-gray-600"
                            }`}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2.2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {clientOptions.length > 0 && (
                    <div className="px-4 py-2 bg-gradient-to-b from-gray-50/0 to-gray-50 dark:from-gray-700/0 dark:to-gray-700/30 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-[9px] font-semibold">
                          ↑↓
                        </kbd>
                        Navegar
                      </span>
                      <span className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-[9px] font-semibold">
                          Enter
                        </kbd>
                        Seleccionar
                      </span>
                      <span className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-[9px] font-semibold">
                          Esc
                        </kbd>
                        Cerrar
                      </span>
                    </div>
                  )}
                </div>
              )}
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
                      !s.isGeneratedViaApi,
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
                  !s.isGeneratedViaApi,
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
    </div>
  );
}

export default GuideHeader;
