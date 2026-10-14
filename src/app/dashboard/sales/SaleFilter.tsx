"use client";
import { ChangeEvent, FormEvent, useState, useEffect, useMemo, useRef } from "react";
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
    filteredSalesLoading,
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
            // El usuario pide datos frescos al filtrar: fuerza red aunque
            // el resultado anterior siga cacheado.
            fetchPolicy: "network-only",
        });
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
        fetchPolicy: "cache-and-network",
        onError: (err) => console.error("Error in Search Client:", err),
    });
    const {
        loading: usersLoading,
        error: usersError,
        data: usersData,
    } = useQuery(USERS_QUERY, {
        context: getAuthContext(),
        fetchPolicy: "cache-and-network",
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
    // Add client search effect (con debounce: antes se consultaba en cada tecla)
    useEffect(() => {
        if (clientSearch.length <= 2) return;
        const timer = setTimeout(() => {
            searchClientQuery({
                variables: {
                    search: clientSearch,
                    isClient: true,
                },
            });
        }, 300);
        return () => clearTimeout(timer);
    }, [clientSearch]);
    const isFiltering = Boolean(filteredSalesLoading ?? filteredSaleLoading);

    const controlClass =
        "filter-form-control h-9 w-full !bg-white !rounded-xl border-gray-300 text-[13px] text-gray-800 focus:ring-blue-500 focus:border-blue-500 dark:!bg-gray-800 dark:text-gray-100";

    const dateControlClass = `${controlClass} min-w-[7.5rem] !rounded-none text-xs !border-0 !bg-transparent !px-2.5 !py-0 focus:outline-none focus:ring-0 md:min-w-[7.75rem] md:text-[12.5px] lg:min-w-[8.25rem] lg:text-[13px] dark:!bg-transparent`;

    const softButtonClass =
        "inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-xl border px-3.5 text-[13px] font-medium leading-none shadow-sm transition-colors duration-150 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60";

    const primarySoftButtonClass = `${softButtonClass} border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300 hover:bg-blue-100 focus:ring-blue-200/70 dark:border-blue-400/40 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:border-blue-400/70 dark:hover:bg-blue-500/20 dark:focus:ring-blue-500/30`;

    const amberSoftButtonClass = `${softButtonClass} gap-1.5 border-amber-200 bg-amber-50 px-2.5 text-xs text-amber-700 hover:border-amber-300 hover:bg-amber-100 focus:ring-amber-200/70 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-300 dark:hover:border-amber-400/70 dark:hover:bg-amber-400/20 dark:focus:ring-amber-500/30`;

    const emeraldSoftButtonClass = `${softButtonClass} gap-1.5 border-emerald-200 bg-emerald-50 px-2.5 text-xs text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100 focus:ring-emerald-200/70 dark:border-emerald-400/40 dark:bg-emerald-400/10 dark:text-emerald-300 dark:hover:border-emerald-400/70 dark:hover:bg-emerald-400/20 dark:focus:ring-emerald-500/30`;

    const roseSoftButtonClass = `${softButtonClass} gap-1.5 border-rose-200 bg-rose-50 px-2.5 text-xs text-rose-700 hover:border-rose-300 hover:bg-rose-100 focus:ring-rose-200/70 dark:border-rose-400/40 dark:bg-rose-400/10 dark:text-rose-300 dark:hover:border-rose-400/70 dark:hover:bg-rose-400/20 dark:focus:ring-rose-500/30`;

    const filterRowTemplate =
        "grid-cols-1 items-center gap-2 sm:grid-cols-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_7.5rem_6.5rem_6.5rem_6.5rem] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_8.5rem_9.5rem_9.5rem_9.5rem]";

    const renderDraftToggle = () => (
        <div className="flex h-9 w-full items-center justify-start gap-2 rounded-xl border border-gray-300 bg-white px-3 transition-colors hover:border-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600">
            <label className="relative inline-flex cursor-pointer items-center">
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
                    className="peer sr-only"
                />
                <div className="relative h-5 w-9 shrink-0 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/30 dark:bg-gray-600"></div>
                <span className="ml-2 whitespace-nowrap text-[13px] font-medium text-gray-700 dark:text-gray-300">
                    Solo borradores
                </span>
            </label>
        </div>
    );

    return (
        <>
            <div className="mb-3 mt-4 w-full">
                {/* Encabezado */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
                        Comprobantes
                    </h1>
                    <button
                        type="button"
                        title="Crear nueva venta"
                        onClick={showModal}
                        className={`${primarySoftButtonClass} px-4`}
                    >
                        <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 4.5v15m7.5-7.5h-15"
                            />
                        </svg>
                        <span className="hidden sm:inline">Agregar Nuevo</span>
                        <span className="sm:hidden">Nuevo</span>
                    </button>
                    <p className="w-full text-[13px] text-gray-500 dark:text-gray-400">
                        Filtra, exporta y descarga tus comprobantes electrónicos
                    </p>
                </div>

                {/* Panel de filtros: 2 filas que ocupan todo el ancho */}
                <div className="grid gap-2 rounded-xl border border-gray-200 bg-gray-50/70 p-2 shadow-sm dark:border-gray-700/80 dark:bg-gray-900/40 sm:p-2.5">
                    {/* Fila 1: fechas + Filtrar + Buscar Documento + Excel + PDFs */}
                    <div className={`grid ${filterRowTemplate}`}>
                        <div
                            className="col-span-2 flex h-9 items-stretch divide-x divide-gray-200 overflow-hidden rounded-xl border border-gray-300 bg-white transition-colors focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20 dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800 md:col-start-1"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleClickButton();
                            }}
                        >
                            <input
                                type="date"
                                name="startDate"
                                onChange={handleInputChange}
                                value={filterObj.startDate}
                                aria-label="Fecha de inicio"
                                className={dateControlClass}
                            />
                            <input
                                type="date"
                                name="endDate"
                                onChange={handleInputChange}
                                value={filterObj.endDate}
                                aria-label="Fecha de fin"
                                className={dateControlClass}
                            />
                        </div>

                        <button
                            id="btn-search"
                            type="button"
                            onClick={handleClickButton}
                            disabled={isFiltering}
                            className={`${primarySoftButtonClass} col-span-2 font-semibold md:col-start-3 md:col-span-1`}
                        >
                            {isFiltering ? (
                                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600 dark:border-blue-800 dark:border-t-blue-400" />
                            ) : (
                                <Filter className="h-3.5 w-3.5" />
                            )}
                            <span>
                                {isFiltering ? "Filtrando..." : "Filtrar"}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => modalSearchInvoice?.show()}
                            title="Buscar documento por serie y número"
                            className={`${amberSoftButtonClass} w-full`}
                        >
                            <Search className="h-3.5 w-3.5" />
                            <span className="lg:hidden">Buscar</span>
                            <span className="hidden lg:inline">
                                Buscar Documento
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => modalExcel?.show()}
                            title="Exportar ventas a Excel"
                            className={`${emeraldSoftButtonClass} w-full`}
                        >
                            <span className="flex items-center text-sm leading-none">
                                <Excel />
                            </span>
                            <span className="lg:hidden">Excel</span>
                            <span className="hidden lg:inline">
                                Exportar a Excel
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => modalBulkPdf?.show()}
                            title="Descargar PDFs en masa"
                            className={`${roseSoftButtonClass} w-full`}
                        >
                            <span className="flex items-center text-sm leading-none">
                                <Download />
                            </span>
                            <span className="lg:hidden">PDFs</span>
                            <span className="hidden lg:inline">
                                Descargar PDFs
                            </span>
                        </button>
                    </div>

                    {/* Fila 2: tipo de documento, entidad, sede, usuario y solo borradores */}
                    <div className={`grid ${filterRowTemplate}`}>
                        <select
                            value={filterObj.documentType}
                            name="documentType"
                            onChange={handleInputChange}
                            aria-label="Tipo de documento"
                            className={`${controlClass} cursor-pointer md:col-start-1`}
                        >
                            <option value={"NA"}>Tipo de documento</option>
                            <option value={"01"}>
                                Factura electrónica
                            </option>
                            <option value={"03"}>
                                Boleta de venta electrónica
                            </option>
                            <option value={"07"}>
                                Nota de crédito electrónica
                            </option>
                        </select>
                        {/* Add client search input */}
                        <div className="min-w-0 md:col-start-2 md:col-span-1">
                            <input
                                type="text"
                                list="clientList"
                                className={controlClass}
                                placeholder="Buscar por entidad (nombre o doc)"
                                aria-label="Buscar por entidad"
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
                                className="relative col-span-2 min-w-0 md:col-start-3 md:col-span-2"
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
                                    aria-label="Buscar por sede"
                                    className={`${controlClass} pr-9`}
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
                                        aria-label="Limpiar sede"
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-gray-400 transition-colors hover:bg-gray-200/70 hover:text-gray-600 dark:hover:bg-gray-600/50 dark:hover:text-gray-200"
                                    >
                                        <svg
                                            className="h-3.5 w-3.5"
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
                                            className="absolute z-[100] mt-1.5 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800"
                                            style={{ maxHeight: "15rem" }}
                                        >
                                            {filteredSubsidiaries.map(
                                                (
                                                    s: ISubsidiary,
                                                    index: number
                                                ) => (
                                                    <div
                                                        key={s.id}
                                                        data-option
                                                        className={`cursor-pointer border-b border-gray-100 px-4 py-2.5 last:border-b-0 dark:border-gray-700 ${
                                                            index ===
                                                            selectedSubsidiaryIndex
                                                                ? "bg-blue-50 dark:bg-blue-900/40"
                                                                : "hover:bg-gray-50 dark:hover:bg-gray-700/60"
                                                        }`}
                                                        onClick={() =>
                                                            handleSubsidiarySelect(
                                                                s
                                                            )
                                                        }
                                                    >
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="truncate text-sm font-medium text-gray-800 dark:text-gray-200">
                                                                {s.company
                                                                    ?.businessName ||
                                                                    ""}
                                                            </span>
                                                            <span className="whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                                                                {s.serial}
                                                            </span>
                                                        </div>
                                                        {s.company?.doc && (
                                                            <div className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
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
                                        <div className="absolute z-[100] mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500 shadow-lg dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                            No se encontraron sedes
                                        </div>
                                    )}
                            </div>
                        ) : null}
                        {usersLoading ? (
                            <div className="col-span-2 flex h-9 items-center justify-center rounded-xl border border-gray-200 bg-white dark:border-gray-700/70 dark:bg-gray-800/50 md:col-start-5 md:col-span-1">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600 dark:border-blue-800 dark:border-t-blue-400" />
                            </div>
                        ) : (
                            <div className="col-span-2 min-w-0 md:col-start-5 md:col-span-1">
                                <input
                                    type="text"
                                    name="userName"
                                    onChange={handleInputChange}
                                    value={filterObj.userName}
                                    onFocus={(e) => e.target.select()}
                                    autoComplete="off"
                                    className={controlClass}
                                    list="userList"
                                    aria-label="Buscar por usuario"
                                    placeholder="Buscar por usuario"
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
                            </div>
                        )}
                        {auth?.user?.isSuperuser && (
                            <div className="col-span-2 min-w-0 md:col-start-6 md:col-span-1">
                                {renderDraftToggle()}
                            </div>
                        )}
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
                filterObj={filterObj}
                auth={auth}
                totalSales={filteredSalesData?.allSales?.totalNumberOfSales || 0}
            />
        </>
    );
}

export default SaleFilter;
