import { ChangeEvent, FormEvent, useState, useEffect, useMemo } from "react";
import Add from "@/components/icons/Add";
import Search from "@/components/icons/Search";
import Filter from "@/components/icons/Filter";
import { useRouter } from "next/navigation";
import { gql, useLazyQuery, useQuery } from "@apollo/client";
import { IPerson, ISubsidiary, ISupplier } from "@/app/types";
import Excel from "@/components/icons/Excel";
import ExcelModal from "../sales/ExcelModal";
import { Modal } from "flowbite";
import SearchInvoice from "../sales/SearchInvoice";
import InvoiceTypeModal from "../sales/new/InvoiceTypeModal";
import { useInvoiceTypeModal } from "@/components/context/InvoiceTypeModalContext";

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

const SUBSIDIARIES_QUERY = gql`
    query {
        subsidiaries {
            id
            address
            serial
            company {
                id
                businessName
            }
        }
    }
`;
function QuoteFilter({
    setFilterObj,
    filterObj,
    quotesQuery,
    quotesLoading,
    auth,
}: any) {
    const router = useRouter();
    const [modalExcel, setModalExcel] = useState<Modal | null>(null);
    const [clientSearch, setClientSearch] = useState("");
    const handleClickButton = async () => {
        // Reinicializa la página a 1
        setFilterObj({
            ...filterObj,
            page: 1,
        });

        // Llama a quotesQuery con la página reinicializada
        quotesQuery({
            variables: {
                subsidiaryId: Number(filterObj.subsidiaryId),
                clientId: Number(filterObj.clientId),
                startDate: filterObj.startDate,
                endDate: filterObj.endDate,
                documentType: filterObj.documentType,
                page: 1,
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

        if (
            name === "subsidiaryName" &&
            event.target instanceof HTMLInputElement
        ) {
            const dataList = event.target.list;
            if (dataList) {
                const option = Array.from(dataList.options).find(
                    (option) => option.value === value
                );
                if (option) {
                    const selectedId = option.getAttribute("data-key");
                    setFilterObj({
                        ...filterObj,
                        subsidiaryId: Number(selectedId),
                        subsidiaryName: value,
                    });
                } else {
                    setFilterObj({
                        ...filterObj,
                        subsidiaryId: 0,
                        subsidiaryName: value,
                    });
                }
            } else {
                console.log("sin datalist");
            }
        } else setFilterObj({ ...filterObj, [name]: value });
    };

    const getAuthContext = () => ({
        headers: {
            "Content-Type": "application/json",
            Authorization: auth?.jwtToken ? `JWT ${auth?.jwtToken}` : "",
        },
    });
    const {
        loading: subsidiariesLoading,
        error: subsidiariesError,
        data: subsidiariesData,
    } = useQuery(SUBSIDIARIES_QUERY, {
        context: getAuthContext(),
        skip: !auth?.jwtToken,
    });

    const [
        searchClientQuery,
        {
            loading: searchClientLoading,
            error: searchClientError,
            data: searchClientData,
        },
    ] = useLazyQuery(SEARCH_CLIENT_BY_PARAMETER, {
        context: {
            headers: {
                "Content-Type": "application/json",
                Authorization: auth?.jwtToken ? `JWT ${auth.jwtToken}` : "",
            },
        },
        fetchPolicy: "network-only",
        onError: (err) => console.error("Error in Search Client:", err),
    });
    useEffect(() => {
        if (auth?.user?.subsidiaryId && subsidiariesData?.subsidiaries) {
            const subsidiaryFound = subsidiariesData?.subsidiaries.find(
                (subsidiary: ISubsidiary) =>
                    Number(subsidiary.id) === Number(auth?.user?.subsidiaryId)
            );
            setFilterObj({
                ...filterObj,
                subsidiaryId: auth?.user?.subsidiaryId,
                subsidiaryName:
                    subsidiaryFound?.company?.businessName +
                    " " +
                    subsidiaryFound?.serial,
            });
        }
    }, [auth?.user?.subsidiaryId, subsidiariesData?.subsidiaries]);
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
                        Cotizaciones
                    </h1>
                    <button
                        type="button"
                        title="Crear nueva cotización"
                        className="btn-blue h-8 px-3 flex items-center justify-center gap-1 rounded-full hover:opacity-90 transition-all duration-200 shadow-xs hover:shadow-sm text-sm"
                        onClick={() => router.push("/dashboard/quotes/new")}
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
                    {auth?.user?.isSuperuser ? (
                        <>
                            <input
                                type="search"
                                name="subsidiaryName"
                                onChange={handleInputChange}
                                value={filterObj.subsidiaryName}
                                onFocus={(e) => e.target.select()}
                                autoComplete="off"
                                disabled={subsidiariesLoading}
                                className="filter-form-control h-10 w-full justify-self-start rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                list="subsidiaryList"
                                placeholder="🏢 Buscar por sede"
                            />
                            <datalist id="subsidiaryList">
                                {subsidiariesData?.subsidiaries?.map(
                                    (n: ISubsidiary, index: number) => (
                                        <option
                                            key={index}
                                            data-key={n.id}
                                            value={`${n.company?.businessName} ${n.serial}`}
                                        />
                                    )
                                )}
                            </datalist>
                        </>
                    ) : null}
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
                        disabled={quotesLoading}
                    >
                        <Filter />
                        Filtrar
                    </button>
                    <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 col-span-full">
                        <button
                            type="button"
                            onClick={() => modalExcel?.show()}
                            className="btn-green h-8 px-3 flex items-center justify-center gap-1 rounded-full hover:opacity-90 transition-all duration-200 shadow-sm hover:shadow-md text-sm"
                        >
                            <Excel />
                            <span className="sm:inline">Exportar a Excel</span>
                            <span className="sm:hidden">Excel</span>
                        </button>
                    </div>
                </div>
            </div>
            <ExcelModal
                modalExcel={modalExcel}
                setModalExcel={setModalExcel}
                setFilterObj={setFilterObj}
                filterObj={filterObj}
            />
        </>
    );
}

export default QuoteFilter;
