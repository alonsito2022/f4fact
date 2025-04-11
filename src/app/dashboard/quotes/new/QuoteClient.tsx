import { IPerson } from "@/app/types";
import Add from "@/components/icons/Add";
import SunatCancel from "@/components/icons/SunatCancel";
import { useLazyQuery } from "@apollo/client";
import React, { ChangeEvent, useEffect, useState } from "react";

function QuoteClient({
    sale,
    setSale,
    setPerson,
    initialStatePerson,
    clientInputRef,
    modalAddClient,
    authContext,
    SEARCH_CLIENT_BY_PARAMETER,
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
            setSale({
                ...sale,
                clientId: selectedData.id,
                clientName: selectedData.names,
                clientDocumentType: selectedData?.documentType?.replace(
                    "A_",
                    ""
                ),
            });
        }
    };
    useEffect(() => {
        if (clientSearch.length > 2) {
            const queryVariables = {
                search: clientSearch,
                isClient: true,
            };
            searchClientQuery({
                variables: queryVariables,
            });
        }
    }, [clientSearch]);
    return (
        <fieldset className="border-2 border-cyan-200 dark:border-cyan-900 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 relative group transition-all duration-300 hover:shadow-cyan-500/20 hover:shadow-2xl">
            <legend className="px-2 text-cyan-600 dark:text-cyan-400 font-semibold text-sm transition-all duration-300 group-hover:text-cyan-700 dark:group-hover:text-cyan-300">
                <div className="flex items-center gap-2">
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                    </svg>
                    <span className="flex items-center gap-2">
                        Datos del Cliente
                        <span className="text-xs font-normal text-cyan-500 dark:text-cyan-400">
                            (Buscar por RUC/DNI o Nombre)
                        </span>
                    </span>
                </div>
            </legend>
            <div className="grid gap-6 lg:grid-cols-4 sm:grid-cols-1 md:grid-cols-2">
                {/* Cliente */}

                <div className="md:col-span-4">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        Cliente
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                            {sale.clientId > 0
                                ? "✓ Cliente seleccionado"
                                : "⚠️ Seleccione un cliente"}
                        </span>
                    </label>
                    <div className="relative w-full mt-1 group">
                        <input
                            ref={clientInputRef}
                            type="text"
                            className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            maxLength={200}
                            value={clientSearch}
                            onChange={handleClientSearchChange}
                            onInput={handleClientSelect}
                            onFocus={(e) => e.target.select()}
                            autoComplete="off"
                            // disabled={
                            //     searchClientLoading
                            // }
                            placeholder="Buscar cliente..."
                            list="clientNameList"
                            required
                        />
                        <datalist
                            id="clientNameList"
                            className="custom-datalist"
                        >
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
                        <button
                            type="button"
                            className="absolute inset-y-0 right-10 px-2 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-400 focus:ring-2 focus:ring-gray-500"
                            onClick={() => {
                                setSale({
                                    ...sale,
                                    clientName: "",
                                    clientId: 0,
                                });
                                setClientSearch("");
                            }}
                        >
                            <SunatCancel />
                        </button>
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 px-2.5 py-2 bg-blue-600 dark:bg-cyan-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                            onClick={(e) => {
                                modalAddClient.show();
                                setPerson(initialStatePerson);
                            }}
                        >
                            <Add />
                        </button>
                    </div>
                </div>
                <style jsx>{`
                    .custom-datalist option {
                        background-color: #1f2937; /* Dark background */
                        color: #d1d5db; /* Light text */
                        padding: 8px;
                        border: 1px solid #374151; /* Border color */
                    }
                    .custom-datalist option:hover {
                        background-color: #4b5563; /* Hover background */
                        color: #ffffff; /* Hover text */
                    }
                `}</style>
            </div>
        </fieldset>
    );
}

export default QuoteClient;
