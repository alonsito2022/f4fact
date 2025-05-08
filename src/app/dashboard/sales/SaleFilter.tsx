"use client";
import { ChangeEvent, FormEvent, useState, useEffect, useMemo } from "react";
import Add from "@/components/icons/Add";
import Search from "@/components/icons/Search";
import Filter from "@/components/icons/Filter";
import { useRouter } from "next/navigation";
import { gql, useLazyQuery, useQuery } from "@apollo/client";
import { IPerson, ISubsidiary, ISupplier } from "@/app/types";
// import { initFlowbite } from "flowbite";
import Excel from "@/components/icons/Excel";
import ExcelModal from "./ExcelModal";
import { Modal } from "flowbite";
import SearchInvoice from "./SearchInvoice";
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
const SUPPLIERS_QUERY = gql`
    query {
        allSuppliers {
            names
            id
            address
            documentNumber
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

function SaleFilter({
    setFilterObj,
    filterObj,
    salesQuery,
    filteredSaleLoading,
    auth,
}: any) {
    const router = useRouter();
    const [modalExcel, setModalExcel] = useState<Modal | null>(null);
    const [modalSearchInvoice, setModalSearchInvoice] = useState<Modal | null>(
        null
    );
    const [clientSearch, setClientSearch] = useState("");

    const handleClickButton = async () => {
        // Reinicializa la página a 1
        setFilterObj({
            ...filterObj,
            page: 1,
        });
        console.log("clientId", filterObj.clientId);

        // Llama a salesQuery con la página reinicializada
        salesQuery({
            variables: {
                subsidiaryId: Number(filterObj.subsidiaryId),
                clientId: Number(filterObj.clientId),
                startDate: filterObj.startDate,
                endDate: filterObj.endDate,
                documentType: filterObj.documentType,
                page: 1, // Asegúrate de pasar la página como 1 aquí también
                pageSize: Number(filterObj.pageSize),
                // serial: String(filterObj.serial),
                // correlative: Number(filterObj.correlative),
            },
        });
        // initFlowbite();
    };

    const handleInputChange = (
        event: ChangeEvent<
            HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = event.target;

        if (
            name === "supplierName" &&
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
                        supplierId: Number(selectedId),
                        supplierName: value,
                    });
                } else {
                    setFilterObj({
                        ...filterObj,
                        supplierId: 0,
                        supplierName: value,
                    });
                }
            } else {
                console.log("sin datalist");
            }
        } else if (
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
        loading: suppliersLoading,
        error: suppliersError,
        data: suppliersData,
    } = useQuery(SUPPLIERS_QUERY, {
        context: getAuthContext(),
        skip: !auth?.jwtToken,
    });
    const {
        loading: subsidiariesLoading,
        error: subsidiariesError,
        data: subsidiariesData,
    } = useQuery(SUBSIDIARIES_QUERY, {
        context: getAuthContext(),
        skip: !auth?.jwtToken,
    });

    // Add client search query
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
        console.log("selectedData", selectedData);
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
            <div className="grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 items-start  rounded-lg shadow-sm">
                <select
                    value={filterObj.documentType}
                    name="documentType"
                    onChange={handleInputChange}
                    className="filter-form-control w-full justify-self-start rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value={"NA"}>📄 Filtrar por tipo de Doc.</option>
                    <option value={"01"}>🧾 FACTURA ELECTRÓNICA</option>
                    <option value={"03"}>🧾 BOLETA DE VENTA ELECTRÓNICA</option>
                    <option value={"07"}>📝 NOTA DE CRÉDITO ELECTRÓNICA</option>
                </select>
                {/* Add client search input */}
                <div>
                    <input
                        type="text"
                        list="clientList"
                        className="filter-form-control w-full justify-self-start rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
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
                            className="filter-form-control w-full justify-self-start rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
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
                    className="filter-form-control w-full justify-self-start rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                    type="date"
                    name="endDate"
                    onChange={handleInputChange}
                    value={filterObj.endDate}
                    className="filter-form-control w-full justify-self-start rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                    id="btn-search"
                    type="button"
                    className="btn-blue px-5 py-3 flex items-center justify-center gap-2 w-full rounded-lg hover:opacity-90 transition-all duration-200 shadow-sm"
                    onClick={handleClickButton}
                    disabled={filteredSaleLoading}
                >
                    <Filter />
                    Filtrar
                </button>
                <div className="grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 col-span-full">
                    {/* <a
                    href={`${hostname}/operations/export_sales_to_excel/${filterObj.subsidiaryId}/${filterObj.startDate}/${filterObj.endDate}/${filterObj.documentType}/`}
                    target="_blank"
                    title="Descargar EXCEL"
                    download
                    className="btn-green px-5 py-3 flex items-center justify-center gap-2 w-full m-0 rounded-lg hover:opacity-90 transition-all duration-200 shadow-sm"
                >
                    <Excel />
                    Exportar a Excel
                </a> */}
                    <button
                        type="button"
                        onClick={() => modalExcel?.show()}
                        title="Exportar ventas a Excel"
                        className="btn-green px-5 py-3 flex items-center justify-center gap-2 w-full m-0 rounded-lg hover:opacity-90 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        <Excel />
                        <span className=" sm:inline">Exportar a Excel</span>
                        <span className="sm:hidden">Excel</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => modalSearchInvoice?.show()}
                        title="Buscar documento por serie y número"
                        className=" bg-orange-400 px-5 py-3 flex items-center justify-center gap-2 w-full m-0 rounded-lg hover:opacity-90 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        <Search />
                        <span className=" sm:inline">Buscar Documento</span>
                        <span className="sm:hidden">Buscar</span>
                    </button>

                    <button
                        type="button"
                        title="Crear nueva venta"
                        className="btn-blue px-5 py-3 flex items-center justify-center gap-2 w-full rounded-lg hover:opacity-90 transition-all duration-200 shadow-md hover:shadow-lg"
                        onClick={() => router.push("/dashboard/sales/new")}
                    >
                        <Add />
                        <span className=" sm:inline">Nueva Venta</span>
                        <span className="sm:hidden">Nuevo</span>
                    </button>
                </div>
            </div>
            <ExcelModal
                modalExcel={modalExcel}
                setModalExcel={setModalExcel}
                setFilterObj={setFilterObj}
                filterObj={filterObj}
            />
            <SearchInvoice
                modalSearchInvoice={modalSearchInvoice}
                setModalSearchInvoice={setModalSearchInvoice}
                setFilterObj={setFilterObj}
                filterObj={filterObj}
                salesQuery={salesQuery}
                filteredSaleLoading={filteredSaleLoading}
            />
        </>
    );
}

export default SaleFilter;
