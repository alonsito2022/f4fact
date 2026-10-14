"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ICompany } from "@/app/types";
import CompanyList from "./CompanyList";
import CompanyModal from "./CompanyModal";
import { Modal } from "flowbite";
import CompanyFilter from "./CompanyFilter";
import { gql, useQuery } from "@apollo/client";
import { useAuth } from "@/components/providers/AuthProvider";

const initialState = {
    id: 0,
    typeDoc: "6",
    doc: "",
    shortName: "",
    businessName: "",
    address: "",
    email: "",
    phone: "",
    logo: "",
    userSol: "",
    keySol: "",
    limit: 500,
    emissionInvoiceWithPreviousDate: 0,
    emissionReceiptWithPreviousDate: 0,
    includeIgv: false,
    percentageIgv: 18,
    guideClientId: "",
    guideClientSecret: "",
    deductionAccount: "",
    isEnabled: false,
    isProduction: false,
    productionDate: "",
    disabledDate: "",
    certificationKey: "",
    certification: "",
    certificationExpirationDate: "",
    withStock: false,
    catalog: false,
    invoiceF: false,
    invoiceB: false,
    guide: false,
    app: false,
    ose: false,
    accountNumber: "",
    comment: "",
    disableContinuePay: false,
    registerDate: "",
    isRus: false,
    isAgentRetention: false,
    isAgentPerception: false
};

/**
 * Unica consulta del listado.
 *
 * Antes se hacia con fetch() plano y el query rebuilding en cada llamada, por lo
 * que no habia cache: cada entrada a la pagina volvia a pedir todo. Ahora pasa
 * por Apollo (cache-and-network): pinta al instante desde la cache y refresca
 * en segundo plano.
 *
 * Solo se piden los campos que la tabla usa; el resto lo carga el modal al
 * editar una empresa.
 *
 * Este mismo query se le pasa al modal para que, tras crear o editar, se
 * refresque la lista (antes se refrescaba `companies`, que no es la lista).
 */
const COMPANIES_QUERY = gql`
    query CompaniesByUser {
        companiesByUser {
            id
            typeDoc
            doc
            businessName
            shortName
            address
            email
            phone
            logo
            isProduction
            isEnabled
            limit
            isRus
            certificationExpirationDate
        }
    }
`;

function CompanyPage() {
    const [modal, setModal] = useState<Modal | any>(null);
    const [company, setCompany] = useState(initialState);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [debouncedSearch, setDebouncedSearch] = useState<string>("");

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

    const {
        data,
        loading: companiesLoading,
        error: companiesError,
        refetch,
    } = useQuery(COMPANIES_QUERY, {
        context: authContext,
        skip: !auth?.jwtToken,
        fetchPolicy: "cache-and-network",
        nextFetchPolicy: "cache-first",
    });

    const companies: ICompany[] = useMemo(
        () => data?.companiesByUser ?? [],
        [data]
    );

    // La búsqueda se aplica con retardo para no filtrar en cada tecla.
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 250);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const filteredCompanies = useMemo(() => {
        const term = debouncedSearch.trim().toLowerCase();
        if (!term) return companies;
        return companies.filter((c: ICompany) =>
            `${c?.businessName ?? ""} ${c?.doc ?? ""} ${c?.shortName ?? ""}`
                .toLowerCase()
                .includes(term)
        );
    }, [debouncedSearch, companies]);

    // Se mantiene la firma que espera CompanyModal.
    const fetchCompanies = useCallback(async () => {
        await refetch();
    }, [refetch]);

    if (auth?.status === "loading") {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 dark:border-blue-800 dark:border-t-blue-400" />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    Cargando sesión...
                </span>
            </div>
        );
    }

    if (auth?.status === "unauthenticated") {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
                    <svg
                        className="h-6 w-6 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                        />
                    </svg>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                    No autorizado
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Inicie sesión para acceder a esta página
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-800">
            <div className="container mx-auto px-3 pb-16 sm:px-4 lg:px-6">
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12">
                        {/* Encabezado (reemplaza al Breadcrumb) */}
                        <div className="mb-4 mt-5 w-full">
                            <div className="flex flex-wrap items-end justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2.5">
                                        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
                                            Empresas
                                        </h1>
                                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600 tabular-nums dark:bg-gray-700/60 dark:text-gray-300">
                                            {companiesLoading && !data
                                                ? "..."
                                                : companies.length}
                                        </span>
                                    </div>
                                    <p className="mt-0.5 text-[13px] text-gray-500 dark:text-gray-400">
                                        Administra las empresas emisoras y sus
                                        credenciales ante SUNAT
                                    </p>
                                </div>

                                <CompanyFilter
                                    searchTerm={searchTerm}
                                    setSearchTerm={setSearchTerm}
                                    modal={modal}
                                    user={auth?.user}
                                    resultCount={filteredCompanies.length}
                                />
                            </div>
                        </div>

                        <CompanyList
                            companies={filteredCompanies}
                            modal={modal}
                            setModal={setModal}
                            company={company}
                            setCompany={setCompany}
                            loading={companiesLoading}
                            hasCachedData={Boolean(data)}
                            error={companiesError}
                        />
                    </div>
                </div>
            </div>

            <CompanyModal
                auth={auth}
                COMPANIES_QUERY={COMPANIES_QUERY}
                modal={modal}
                setModal={setModal}
                company={company}
                setCompany={setCompany}
                initialState={initialState}
                fetchCompanies={fetchCompanies}
            />
        </div>
    );
}

export default CompanyPage;