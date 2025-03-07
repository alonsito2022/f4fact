import { IGuideModeType, IGuideReasonType, IPerson } from "@/app/types";
import { gql, useLazyQuery, useQuery } from "@apollo/client";
import React, { ChangeEvent, useEffect, useState } from "react";

const SEARCH_CLIENT_BY_PARAMETER = gql`
    query ($search: String!) {
        searchClientByParameter(search: $search) {
            id
            documentType
            documentNumber
            names
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

const GUIDE_MODE_QUERY = gql`
    query {
        allGuideModes {
            code
            name
        }
    }
`;
function GuideHeader({ guide, setGuide, handleGuide, auth, authContext }: any) {
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

    const handleClientSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        setClientSearch(event.target.value);
    };
    const handleClientSelect = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedOption = event.target.value;

        const selectedData = searchClientData?.searchClientByParameter?.find(
            (person: IPerson) =>
                `${person.documentNumber} ${person.names}` === selectedOption
        );

        if (selectedData) {
            setGuide({
                ...guide,
                clientId: selectedData.id,
                clientName: selectedData.names,
            });
        }
    };
    useEffect(() => {
        if (clientSearch.length > 2) {
            searchClientQuery({
                variables: { search: clientSearch },
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
                variables: { search: auth?.user?.companyDoc },
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
        } else {
            setClientSearch("");
            setGuide({
                ...guide,
                clientId: "",
                clientName: "",
            });
        }
    }, [guide?.guideReasonTransfer, guide?.guideModeTransfer]);
    return (
        <>
            <fieldset className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-5 ">
                    {/* CPE Cliente */}
                    <div className="md:col-span-1 lg:col-span-2">
                        <label
                            htmlFor="invoiceClientName"
                            className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Cliente
                        </label>
                        <input
                            type="search"
                            id="invoiceClientName"
                            maxLength={100}
                            onFocus={(e) => e.target.select()}
                            value={clientSearch}
                            onChange={handleClientSearchChange}
                            onInput={handleClientSelect}
                            list="clientList"
                            autoComplete="off"
                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
                    {/* CPE Tipo documento */}
                    <div>
                        <label
                            htmlFor="invoiceDocumentType"
                            className="text-sm font-medium text-gray-900 dark:text-gray-200"
                        >
                            Tipo documento
                        </label>
                        <select
                            value={guide?.documentType}
                            onChange={handleGuide}
                            id="invoiceDocumentType"
                            name="documentType"
                            className="text-lg w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="09">
                                GUIA DE REMISIÓN REMITENTE ELECTRÓNICA
                            </option>
                            <option value="31">
                                GUÍA DE REMISIÓN TRANSPORTISTA
                            </option>
                        </select>
                    </div>
                    {/* Serie */}
                    <div>
                        <label
                            htmlFor="serial"
                            className="text-sm font-medium text-gray-900 dark:text-gray-200"
                        >
                            Serie
                        </label>
                        <input
                            type="text"
                            name="serial"
                            id="serial"
                            maxLength={4}
                            value={guide.serial}
                            onChange={handleGuide}
                            onFocus={(e) => e.target.select()}
                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            autoComplete="off"
                        />
                    </div>
                    {/* Numero */}
                    <div>
                        <label
                            htmlFor="correlative"
                            className="text-sm font-medium text-gray-900 dark:text-gray-200"
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
                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            autoComplete="off"
                        />
                    </div>
                    {/* Fecha emisión */}
                    <div>
                        <label
                            htmlFor="emitDate"
                            className="text-sm font-medium text-gray-900 dark:text-gray-200"
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
                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    {guide?.documentType === "09" && (
                        <>
                            {/* Tipo de transporte */}
                            <div>
                                <label className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                    Tipo de transporte
                                </label>
                                <select
                                    name="guideModeTransfer"
                                    onChange={handleGuide}
                                    value={guide.guideModeTransfer}
                                    className="text-lg w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
                                <label className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                    Motivo de traslado
                                </label>
                                <select
                                    name="guideReasonTransfer"
                                    onChange={handleGuide}
                                    value={guide.guideReasonTransfer}
                                    className="text-lg w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
                </div>
            </fieldset>
        </>
    );
}

export default GuideHeader;
