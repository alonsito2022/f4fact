import { IPerson } from "@/app/types";
import Add from "@/components/icons/Add";
import Excel from "@/components/icons/Excel";
import Filter from "@/components/icons/Filter";
import Search from "@/components/icons/Search";
import { gql, useLazyQuery } from "@apollo/client";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, useEffect, useState } from "react";
// Add the search client query
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

function ExitNoteFilter({
    filterObj,
    setFilterObj,
    exitNotesQuery,
    filteredExitNotesLoading,
    auth,
    authContext,
}: any) {
    const [clientSearch, setClientSearch] = useState("");
    const router = useRouter();
    const handleClickButton = async () => {
        // Reinicializa la página a 1
        setFilterObj({
            ...filterObj,
            page: 1,
        });

        // Llama a salesQuery con la página reinicializada
        exitNotesQuery({
            variables: {
                subsidiaryId: Number(filterObj.subsidiaryId),
                clientId: Number(filterObj.clientId),
                startDate: filterObj.startDate,
                endDate: filterObj.endDate,
                page: 1, // Asegúrate de pasar la página como 1 aquí también
                pageSize: Number(filterObj.pageSize),
            },
        });
    };
    const handleInputChange = (
        event: ChangeEvent<
            HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = event.target;
        setFilterObj({ ...filterObj, [name]: value });
    };

    // Add client search query
    const [searchClientQuery, { data: searchClientData }] = useLazyQuery(
        SEARCH_CLIENT_BY_PARAMETER,
        {
            context: authContext,
            fetchPolicy: "network-only",
            onError: (err) => console.error("Error in Search Client:", err),
        }
    );
    const handleClientSelect = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedOption = event.target.value;
        const selectedData = searchClientData?.searchClientByParameter?.find(
            (person: IPerson) =>
                `${person.documentNumber} ${person.names}` === selectedOption
        );
        if (selectedData) {
            setFilterObj({
                ...filterObj,
                clientId: selectedData.id,
                page: 1, // Reset page when changing client
            });
            setClientSearch(
                `${selectedData.documentNumber} ${selectedData.names}`
            );
        }
    };
    // Add client search handlers
    const handleClientSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setClientSearch(value);
        // Only reset clientId if the search field is cleared
        if (!value.trim()) {
            setFilterObj({
                ...filterObj,
                clientId: 0,
            });
        }
    };
    // Add client search effect
    useEffect(() => {
        if (clientSearch.length > 2) {
            searchClientQuery({
                variables: {
                    search: clientSearch,
                    isClient: true,
                },
            });
        }
    }, [clientSearch]);
    return (
        <>
            <div className="w-full mb-1 mt-2">
                <div className="flex items-center gap-2 mb-3">
                    <h1 className="text-3xl font-light text-gray-800 dark:text-white">
                        Notas de salida
                    </h1>
                    <button
                        type="button"
                        title="Crear nueva nota de salida"
                        className="btn-blue h-8 px-3 flex items-center justify-center gap-1 rounded-full hover:opacity-90 transition-all duration-200 shadow-xs hover:shadow-sm text-sm"
                        onClick={() =>
                            router.push("/dashboard/sales/exit_note/new")
                        }
                    >
                        <Add />
                        <span className="sm:inline">Agregar Nuevo</span>
                        <span className="sm:hidden">Nuevo</span>
                    </button>
                </div>
                <div className="grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 items-start rounded-lg shadow-sm">
                    {/* Add client search input */}
                    <div>
                        <input
                            type="text"
                            list="clientList"
                            className="filter-form-control h-10 w-full justify-self-start rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="Buscar por entidad (nombre o doc)"
                            value={clientSearch}
                            onChange={handleClientSearchChange}
                            onInput={handleClientSelect}
                        />
                        <datalist id="clientList">
                            {searchClientData?.searchClientByParameter?.map(
                                (person: IPerson) => (
                                    <option
                                        key={person.id}
                                        value={`${person.documentNumber} ${person.names}`}
                                        data-key={person.id}
                                    />
                                )
                            )}
                        </datalist>
                    </div>

                    <input
                        type="date"
                        name="startDate"
                        onChange={handleInputChange}
                        value={filterObj.startDate}
                        className="filter-form-control h-10 w-full justify-self-start rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <input
                        type="date"
                        name="endDate"
                        onChange={handleInputChange}
                        value={filterObj.endDate}
                        className="filter-form-control h-10 w-full justify-self-start rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <button
                        id="btn-search"
                        type="button"
                        className="btn-blue h-8 px-3 flex items-center justify-center gap-1 rounded-full hover:opacity-90 transition-all duration-200 shadow-sm hover:shadow-md text-sm"
                        onClick={handleClickButton}
                        disabled={filteredExitNotesLoading}
                    >
                        <Filter />
                        <span className="sm:inline">Filtrar</span>
                    </button>
                    <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 col-span-full">
                        <button
                            type="button"
                            disabled={true}
                            title="Exportar ventas a Excel"
                            className="btn-green h-8 px-3 flex items-center justify-center gap-1 rounded-full hover:opacity-90 transition-all duration-200 shadow-sm hover:shadow-md text-sm"
                        >
                            <Excel />
                            <span className="sm:inline">Exportar a Excel</span>
                            <span className="sm:hidden">Excel</span>
                        </button>

                        <button
                            type="button"
                            disabled={true}
                            title="Buscar documento por serie y número"
                            className="bg-orange-400 h-8 px-3 flex items-center justify-center gap-1 rounded-full hover:opacity-90 transition-all duration-200 shadow-sm hover:shadow-md text-sm text-white"
                        >
                            <Search />
                            <span className="sm:inline">Buscar Documento</span>
                            <span className="sm:hidden">Buscar</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ExitNoteFilter;
