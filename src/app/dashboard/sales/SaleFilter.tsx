"use client";
import { ChangeEvent, FormEvent, useState, useEffect, useMemo, useRef } from "react";
import Add from "@/components/icons/Add";
import Search from "@/components/icons/Search";
import Filter from "@/components/icons/Filter";
import { useRouter } from "next/navigation";
import { gql, useLazyQuery, useQuery } from "@apollo/client";
import { IPerson, ISubsidiary, ISupplier, IUser } from "@/app/types";
// import { initFlowbite } from "flowbite";
import Excel from "@/components/icons/Excel";
import ExcelModal from "./ExcelModal";
import { Modal } from "flowbite";
import SearchInvoice from "./SearchInvoice";
import InvoiceTypeModal from "./new/InvoiceTypeModal";
import { useInvoiceTypeModal } from "@/components/context/InvoiceTypeModalContext";
import BulkPdfDownloadModal from "./BulkPdfDownloadModal";
import Download from "@/components/icons/Download";
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

const SUBSIDIARIES_WITH_SALES_QUERY = gql`
    query {
        subsidiariesWithSales {
            id
            serial
            company {
                id
                businessName
                doc
            }
        }
    }
`;
const USERS_QUERY = gql`
    query ($subsidiaryId: Int) {
        usersBySubsidiaryId(subsidiaryId: $subsidiaryId) {
            id
            fullName
            role
        }
    }
`;
function SaleFilter({
    setFilterObj,
    filterObj,
    salesQuery,
    filteredSaleLoading,
    auth,
    filteredSalesData,
}: any) {
    const router = useRouter();
    const { showModal } = useInvoiceTypeModal();
    const [modalExcel, setModalExcel] = useState<Modal | null>(null);
    const [modalSearchInvoice, setModalSearchInvoice] = useState<Modal | null>(
        null
    );
    const [modalBulkPdf, setModalBulkPdf] = useState<Modal | null>(null);
    const [clientSearch, setClientSearch] = useState("");
    const [subsidiarySearch, setSubsidiarySearch] = useState("");
    const [showSubsidiaryDropdown, setShowSubsidiaryDropdown] = useState(false);
    const [selectedSubsidiaryIndex, setSelectedSubsidiaryIndex] = useState(-1);
    const subsidiaryDropdownRef = useRef<HTMLDivElement>(null);
    const subsidiaryInputRef = useRef<HTMLInputElement>(null);
    const subsidiaryListRef = useRef<HTMLDivElement>(null);

    const handleClickButton = async () => {
        // Reinicializa la página a 1
        setFilterObj({
            ...filterObj,
            page: 1,
        });

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
                userId: Number(filterObj.userId),
                onlyDraft: filterObj.onlyDraft || undefined,
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
            name === "userName" &&
            event.target instanceof HTMLInputElement
        ) {
            const dataList = event.target.list;
            if (dataList) {
                const option = Array.from(dataList.options).find(
                    (option) =>
                        String(option.value).toUpperCase() ===
                        String(value).toUpperCase()
                );
                if (option) {
                    const selectedId = option.getAttribute("data-key");
                    setFilterObj({
                        ...filterObj,
                        userId: Number(selectedId),
                        userName: value,
                    });
                } else {
                    setFilterObj({
                        ...filterObj,
                        userId: "",
                        userName: value,
                    });
                }
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
    } = useQuery(SUBSIDIARIES_WITH_SALES_QUERY, {
        context: getAuthContext(),
        skip: !auth?.jwtToken,
    });

    const subsidiaries: ISubsidiary[] =
        subsidiariesData?.subsidiariesWithSales || [];

    const getSubsidiaryLabel = (s: ISubsidiary) =>
        `${s.company?.businessName || ""} ${s.serial || ""}`.trim();

    const filteredSubsidiaries = useMemo(() => {
        if (!subsidiarySearch.trim()) return subsidiaries;
        const term = subsidiarySearch.toLowerCase();
        return subsidiaries.filter((s: ISubsidiary) => {
            const label = getSubsidiaryLabel(s).toLowerCase();
            const doc = s.company?.doc || "";
            return label.includes(term) || doc.includes(term);
        });
    }, [subsidiaries, subsidiarySearch]);

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
    const {
        loading: usersLoading,
        error: usersError,
        data: usersData,
    } = useQuery(USERS_QUERY, {
        context: getAuthContext(),
        fetchPolicy: "network-only",
        variables: {
            subsidiaryId: Number(filterObj.subsidiaryId),
        },

        skip: !auth?.jwtToken || !filterObj.subsidiaryId,
    });
    useEffect(() => {
        if (
            auth?.user?.subsidiaryId &&
            subsidiaries.length > 0 &&
            !auth?.user?.isSuperuser
        ) {
            const subsidiaryFound = subsidiaries.find(
                (s: ISubsidiary) =>
                    Number(s.id) === Number(auth?.user?.subsidiaryId)
            );
            if (subsidiaryFound) {
                const label = getSubsidiaryLabel(subsidiaryFound);
                setFilterObj({
                    ...filterObj,
                    subsidiaryId: auth?.user?.subsidiaryId,
                    subsidiaryName: label,
                });
                setSubsidiarySearch(label);
            }
        }
    }, [auth?.user?.subsidiaryId, subsidiaries.length]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                subsidiaryDropdownRef.current &&
                !subsidiaryDropdownRef.current.contains(event.target as Node) &&
                subsidiaryInputRef.current &&
                !subsidiaryInputRef.current.contains(event.target as Node)
            ) {
                setShowSubsidiaryDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        setSelectedSubsidiaryIndex(-1);
    }, [subsidiarySearch]);

    useEffect(() => {
        if (selectedSubsidiaryIndex >= 0 && subsidiaryListRef.current) {
            const items =
                subsidiaryListRef.current.querySelectorAll("[data-option]");
            if (items[selectedSubsidiaryIndex]) {
                items[selectedSubsidiaryIndex].scrollIntoView({
                    block: "nearest",
                });
            }
        }
    }, [selectedSubsidiaryIndex]);

    const handleSubsidiarySelect = (subsidiary: ISubsidiary) => {
        const label = getSubsidiaryLabel(subsidiary);
        setFilterObj({
            ...filterObj,
            subsidiaryId: Number(subsidiary.id),
            subsidiaryName: label,
        });
        setSubsidiarySearch(label);
        setShowSubsidiaryDropdown(false);
        setSelectedSubsidiaryIndex(-1);
    };

    const handleClearSubsidiary = () => {
        setSubsidiarySearch("");
        setFilterObj({
            ...filterObj,
            subsidiaryId: 0,
            subsidiaryName: "",
        });
        subsidiaryInputRef.current?.focus();
    };

    const handleSubsidiaryKeyDown = (e: React.KeyboardEvent) => {
        if (!showSubsidiaryDropdown || !filteredSubsidiaries.length) {
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                setShowSubsidiaryDropdown(true);
            }
            return;
        }
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setSelectedSubsidiaryIndex((prev) =>
                    prev < filteredSubsidiaries.length - 1 ? prev + 1 : 0
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setSelectedSubsidiaryIndex((prev) =>
                    prev > 0
                        ? prev - 1
                        : filteredSubsidiaries.length - 1
                );
                break;
            case "Enter":
                e.preventDefault();
                if (
                    selectedSubsidiaryIndex >= 0 &&
                    selectedSubsidiaryIndex < filteredSubsidiaries.length
                ) {
                    handleSubsidiarySelect(
                        filteredSubsidiaries[selectedSubsidiaryIndex]
                    );
                } else if (filteredSubsidiaries.length === 1) {
                    handleSubsidiarySelect(filteredSubsidiaries[0]);
                }
                break;
            case "Escape":
                e.preventDefault();
                setShowSubsidiaryDropdown(false);
                setSelectedSubsidiaryIndex(-1);
                break;
        }
    };

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
                        Comprobantes
                    </h1>
                    <button
                        type="button"
                        title="Crear nueva venta"
                        className="btn-blue h-8 px-3 flex items-center justify-center gap-1 rounded-full hover:opacity-90 transition-all duration-200 shadow-xs hover:shadow-sm text-sm"
                        //onClick={() => router.push("/dashboard/sales/new")}
                        //onClick={() => modalInvoiceType?.show()}
                        onClick={showModal}
                    >
                        <Add />
                        <span className="sm:inline">Agregar Nuevo</span>
                        <span className="sm:hidden">Nuevo</span>
                    </button>
                </div>
                <div className="grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 items-start rounded-lg shadow-sm">
                    <select
                        value={filterObj.documentType}
                        name="documentType"
                        onChange={handleInputChange}
                        className="filter-form-control h-10 w-full justify-self-start rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-[13px]"
                    >
                        <option value={"NA"} className="text-[13px]">
                            📄 Filtrar por tipo de Doc.
                        </option>
                        <option value={"01"} className="text-[13px]">
                            🧾 FACTURA ELECTRÓNICA
                        </option>
                        <option value={"03"} className="text-[13px]">
                            🧾 BOLETA DE VENTA ELECTRÓNICA
                        </option>
                        <option value={"07"} className="text-[13px]">
                            📝 NOTA DE CRÉDITO ELECTRÓNICA
                        </option>
                    </select>
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
                        <div
                            className="relative"
                            ref={subsidiaryDropdownRef}
                        >
                            <input
                                ref={subsidiaryInputRef}
                                type="text"
                                value={subsidiarySearch}
                                onChange={(e) => {
                                    setSubsidiarySearch(e.target.value);
                                    setShowSubsidiaryDropdown(true);
                                    if (!e.target.value.trim()) {
                                        setFilterObj({
                                            ...filterObj,
                                            subsidiaryId: 0,
                                            subsidiaryName: "",
                                        });
                                    }
                                }}
                                onKeyDown={handleSubsidiaryKeyDown}
                                onFocus={() =>
                                    setShowSubsidiaryDropdown(true)
                                }
                                autoComplete="off"
                                disabled={subsidiariesLoading}
                                className="filter-form-control h-10 w-full justify-self-start rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm pr-8"
                                placeholder={
                                    subsidiariesLoading
                                        ? "Cargando sedes..."
                                        : "Buscar por sede"
                                }
                            />
                            {subsidiarySearch && (
                                <button
                                    type="button"
                                    onClick={handleClearSubsidiary}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            )}
                            {showSubsidiaryDropdown &&
                                filteredSubsidiaries.length > 0 && (
                                    <div
                                        ref={subsidiaryListRef}
                                        className="absolute z-[100] w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                                    >
                                        {filteredSubsidiaries.map(
                                            (
                                                s: ISubsidiary,
                                                index: number
                                            ) => (
                                                <div
                                                    key={s.id}
                                                    data-option
                                                    className={`px-4 py-2.5 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                                                        index ===
                                                        selectedSubsidiaryIndex
                                                            ? "bg-blue-50 dark:bg-blue-600"
                                                            : "hover:bg-gray-50 dark:hover:bg-gray-700"
                                                    }`}
                                                    onClick={() =>
                                                        handleSubsidiarySelect(
                                                            s
                                                        )
                                                    }
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                                            {s.company
                                                                ?.businessName || ""}
                                                        </span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 whitespace-nowrap">
                                                            {s.serial}
                                                        </span>
                                                    </div>
                                                    {s.company?.doc && (
                                                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                                            RUC:{" "}
                                                            {s.company.doc}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            {showSubsidiaryDropdown &&
                                subsidiarySearch.trim() &&
                                filteredSubsidiaries.length === 0 &&
                                !subsidiariesLoading && (
                                    <div className="absolute z-[100] w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                        No se encontraron sedes
                                    </div>
                                )}
                        </div>
                    ) : null}
                    {usersLoading ? (
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <>
                            <input
                                type="text"
                                name="userName"
                                onChange={handleInputChange}
                                value={filterObj.userName}
                                onFocus={(e) => e.target.select()}
                                autoComplete="off"
                                className="filter-form-control h-10 w-full justify-self-start rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                list="userList"
                                placeholder="👤 Buscar por usuario"
                            />
                            <datalist id="userList">
                                {usersData?.usersBySubsidiaryId?.map(
                                    (user: IUser) => (
                                        <option
                                            key={user.id}
                                            value={String(
                                                user.fullName
                                            ).toUpperCase()}
                                            data-key={user.id}
                                        />
                                    )
                                )}
                            </datalist>
                        </>
                    )}

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
                    {auth?.user?.isSuperuser && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="onlyDraft"
                                    checked={filterObj.onlyDraft || false}
                                    onChange={(e) =>
                                        setFilterObj({
                                            ...filterObj,
                                            onlyDraft: e.target.checked,
                                        })
                                    }
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Solo borradores
                                </span>
                            </label>
                        </div>
                    )}
                    <button
                        id="btn-search"
                        type="button"
                        className="btn-blue h-8 px-3 flex items-center justify-center gap-1 rounded-full hover:opacity-90 transition-all duration-200 shadow-sm hover:shadow-md text-sm"
                        onClick={handleClickButton}
                        disabled={filteredSaleLoading}
                    >
                        <Filter />
                        <span className="sm:inline">Filtrar</span>
                    </button>
                    <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 col-span-full">
                        <button
                            type="button"
                            onClick={() => modalExcel?.show()}
                            title="Exportar ventas a Excel"
                            className="btn-green h-8 px-3 flex items-center justify-center gap-1 rounded-full hover:opacity-90 transition-all duration-200 shadow-sm hover:shadow-md text-sm"
                        >
                            <Excel />
                            <span className="sm:inline">Exportar a Excel</span>
                            <span className="sm:hidden">Excel</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => modalBulkPdf?.show()}
                            title="Descargar PDFs en masa"
                            className="btn-red h-8 px-3 flex items-center justify-center gap-1 rounded-full hover:opacity-90 transition-all duration-200 shadow-sm hover:shadow-md text-sm"
                        >
                            <Download />
                            <span className="sm:inline">Descargar PDFs</span>
                            <span className="sm:hidden">PDFs</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => modalSearchInvoice?.show()}
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
            <ExcelModal
                modalExcel={modalExcel}
                setModalExcel={setModalExcel}
                setFilterObj={setFilterObj}
                filterObj={filterObj}
                userLogged={auth?.user}
            />
            <SearchInvoice
                modalSearchInvoice={modalSearchInvoice}
                setModalSearchInvoice={setModalSearchInvoice}
                setFilterObj={setFilterObj}
                filterObj={filterObj}
                salesQuery={salesQuery}
                filteredSaleLoading={filteredSaleLoading}
            />
            <BulkPdfDownloadModal
                modalBulkPdf={modalBulkPdf}
                setModalBulkPdf={setModalBulkPdf}
                salesData={filteredSalesData?.allSales?.sales || []}
            />
        </>
    );
}

export default SaleFilter;
