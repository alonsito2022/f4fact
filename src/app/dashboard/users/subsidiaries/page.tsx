"use client";
import { ChangeEvent, FormEvent, useState, useEffect, useMemo } from "react";
import { ISerialAssigned, ISubsidiary, IUser } from "@/app/types";
import SubsidiaryList from "./SubsidiaryList";
import SubsidiaryModal from "./SubsidiaryModal";
import { Modal } from "flowbite";
import { gql, useLazyQuery } from "@apollo/client";
import { useAuth } from "@/components/providers/AuthProvider";
import DevicesModal from "./DevicesModal";

const initialState = {
    id: 0,
    serial: "",
    name: "",
    address: "",
    phone: "",
    districtId: "",
    companyId: 0,
    token: "",
    serialassignedSet: [] as ISerialAssigned[],
    pdfFormatForInvoices: 1,
    pdfFormatForReceiptInvoices: 1,
    pdfFormatForGuides: 1,
    fillColor: "#D2D7DA",
    logo: "",
};

const SUBSIDIARIES_QUERY = gql`
    query {
        subsidiaries {
            id
            serial
            name
            address
            phone
            districtId
            districtName
            companyId
            companyName
            logo
        }
    }
`;

const SEARCH_SUBSIDIARIES_QUERY = gql`
    query ($searchTerm: String!) {
        searchSubsidiaries(search: $searchTerm) {
            id
            serial
            name
            address
            phone
            districtId
            districtName
            companyId
            companyName
            token
            logo
        }
    }
`;

const SUBSIDIARIES_QUERY_BY_COMPANY_ID = gql`
    query ($companyId: ID!) {
        subsidiariesByCompanyId(companyId: $companyId) {
            id
            serial
            name
            address
            phone
            districtId
            districtName
            companyId
            companyName
            token
            pdfFormatForInvoices
            pdfFormatForReceiptInvoices
            pdfFormatForGuides
            fillColor
            logo
        }
    }
`;

const initialStateFilterObj = {
    subsidiaryId: "",
    isSuperuser: false,
};

const initialStateDevices = {
    devices: [],
    token: "",
};

function SubsidiaryPage() {
    const [filterObj, setFilterObj] = useState(initialStateFilterObj);
    const [modal, setModal] = useState<Modal | any>(null);
    const [modalDevice, setModalDevice] = useState<Modal | any>(null);
    const [subsidiary, setSubsidiary] = useState(initialState);
    const [subsidiaryDevices, setSubsidiaryDevices] =
        useState(initialStateDevices);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [searchField, setSearchField] = useState<"name" | "serial">("name");

    // Obtenemos sesión y token desde el AuthProvider
    const auth = useAuth();

    // Memorizamos el contexto de autorización para evitar recreaciones innecesarias
    const authContext = useMemo(
        () => ({
            headers: {
                "Content-Type": "application/json",
                Authorization: auth?.jwtToken ? `JWT ${auth.jwtToken}` : "",
            },
        }),
        [auth?.jwtToken]
    );

    useEffect(() => {
        if (auth?.user) {
            const user = auth?.user as IUser;
            setFilterObj((prev) => ({
                ...prev,
                subsidiaryId:
                    prev.subsidiaryId ||
                    (user.isSuperuser ? "0" : user.subsidiaryId!),
                isSuperuser: user.isSuperuser ?? false,
            }));
        }
    }, [auth?.user]);

    const [
        subsidiariesQuery,
        {
            loading: subsidiariesLoading,
            error: subsidiariesError,
            data: subsidiariesData,
        },
    ] = useLazyQuery(SUBSIDIARIES_QUERY_BY_COMPANY_ID, {
        context: authContext,
        fetchPolicy: "network-only",
        onError: (err) => console.error("Error:", err, auth?.jwtToken),
    });

    useEffect(() => {
        if (auth?.user?.companyId) {
            subsidiariesQuery({
                variables: { companyId: Number(auth?.user?.companyId) },
            });
        }
    }, [auth?.user]);

    const filteredSubsidiaries = useMemo(() => {
        if (subsidiariesData) {
            let newdata = subsidiariesData.subsidiariesByCompanyId?.filter(
                (w: ISubsidiary) =>
                    searchField === "name"
                        ? w?.name
                              ?.toLowerCase()
                              .includes(searchTerm.toLowerCase())
                        : w?.serial
                              ?.toString()
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase())
            );
            return newdata;
        }
    }, [searchTerm, searchField, subsidiariesData]);

    const handleInputSearchChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setSearchTerm(event.target.value);
    };

    if (auth?.status === "loading") {
        return (
            <div className="min-h-[400px] flex items-center justify-center p-6">
                <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium">
                    <svg
                        className="animate-spin h-5 w-5 text-blue-600"
                        xmlns="http://www.w3.org/2000/svg"
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
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                    Cargando sesión...
                </div>
            </div>
        );
    }

    if (auth?.status === "unauthenticated") {
        return (
            <div className="min-h-[400px] flex items-center justify-center p-6">
                <div className="p-6 max-w-sm w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-red-200 dark:border-red-900/40 text-center">
                    <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-3">
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        Acceso No Autorizado
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Por favor inicia sesión con una cuenta válida para acceder a los locales.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 space-y-5">
            {/* Encabezado Principal y Barra de Herramientas */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200/80 dark:border-gray-700/70 p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Acciones y Búsqueda */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        {/* Selector de campo de búsqueda */}
                        <div className="inline-flex rounded-xl bg-gray-100 dark:bg-gray-700/60 p-1 border border-gray-200/60 dark:border-gray-600/50 self-start sm:self-auto">
                            <button
                                type="button"
                                onClick={() => setSearchField("name")}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                                    searchField === "name"
                                        ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-xs"
                                        : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                                }`}
                            >
                                Por Nombre
                            </button>
                            <button
                                type="button"
                                onClick={() => setSearchField("serial")}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                                    searchField === "serial"
                                        ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-xs"
                                        : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                                }`}
                            >
                                Por Serie
                            </button>
                        </div>

                        {/* Input de Búsqueda */}
                        <div className="relative flex-1 sm:w-72">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                                <svg
                                    className="w-4 h-4 text-gray-400 dark:text-gray-500"
                                    aria-hidden="true"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </div>
                            <input
                                type="text"
                                name="searchTerm"
                                value={searchTerm}
                                onChange={handleInputSearchChange}
                                className="block w-full pl-10 pr-9 py-2 text-sm text-gray-900 border border-gray-200 rounded-xl bg-gray-50/80 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-700/60 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:bg-gray-700 dark:focus:ring-blue-500/30 transition-all placeholder:text-gray-400"
                                placeholder={
                                    searchField === "name"
                                        ? "Buscar por nombre del local..."
                                        : "Buscar por código de serie..."
                                }
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm("")}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
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
                        </div>

                        {/* Botón Crear Local */}
                        {filterObj?.isSuperuser && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSubsidiary(initialState);
                                    modal.show();
                                }}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-sm hover:shadow transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2.5}
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                                <span>Crear Local</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Listado / Loading / Error */}
            <div>
                {subsidiariesLoading ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200/80 dark:border-gray-700/70 p-6 space-y-4">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700/60">
                            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-40 animate-pulse"></div>
                            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-28 animate-pulse"></div>
                        </div>
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="grid grid-cols-12 gap-4 items-center py-3 border-b border-gray-50 dark:border-gray-700/40 last:border-0"
                            >
                                <div className="col-span-1 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                <div className="col-span-1 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                <div className="col-span-3 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                <div className="col-span-3 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                <div className="col-span-2 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                <div className="col-span-2 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                ) : subsidiariesError ? (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
                        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-2">
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <h4 className="text-sm font-semibold text-red-800 dark:text-red-300">
                            Error al cargar los locales
                        </h4>
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            {subsidiariesError.message}
                        </p>
                    </div>
                ) : (
                    <SubsidiaryList
                        filteredSubsidiaries={filteredSubsidiaries}
                        modal={modal}
                        setModal={setModal}
                        subsidiary={subsidiary}
                        setSubsidiary={setSubsidiary}
                        filterObj={filterObj}
                        user={auth?.user}
                        modalDevice={modalDevice}
                        setModalDevice={setModalDevice}
                        setSubsidiaryDevices={setSubsidiaryDevices}
                    />
                )}
            </div>

            {/* Modales */}
            <SubsidiaryModal
                modal={modal}
                setModal={setModal}
                subsidiary={subsidiary}
                setSubsidiary={setSubsidiary}
                initialState={initialState}
                subsidiariesQuery={subsidiariesQuery}
                user={auth?.user}
            />
            <DevicesModal
                modalDevice={modalDevice}
                setModalDevice={setModalDevice}
                subsidiaryDevices={subsidiaryDevices}
                setSubsidiaryDevices={setSubsidiaryDevices}
                initialStateDevices={initialStateDevices}
            />
        </div>
    );
}

export default SubsidiaryPage;
