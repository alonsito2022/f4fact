import { ICompany } from "@/app/types";
import Check from "@/components/icons/Check";
import CloseCircle from "@/components/icons/CloseCircle";
import UserCircle from "@/components/icons/UserCircle";
import ImageCircle from "@/components/images/ImageCircle";
import React, { memo, useCallback, useMemo } from "react";
import { gql, useLazyQuery } from "@apollo/client";
import { useAuth } from "@/components/providers/AuthProvider";

/**
 * Detalle completo de la empresa. Se pide solo al pulsar "Editar", no en el
 * listado, para no inflar la carga inicial.
 */
const COMPANY_BY_ID_QUERY = gql`
    query CompanyById($pk: ID!) {
        companyById(pk: $pk) {
            id
            typeDoc
            doc
            businessName
            address
            email
            phone
            shortName
            logo
            isEnabled
            limit
            userSol
            keySol
            emissionInvoiceWithPreviousDate
            emissionReceiptWithPreviousDate
            includeIgv
            percentageIgv
            productionDate
            isProduction
            disabledDate
            certification
            certificationKey
            certificationExpirationDate
            deductionAccount
            guideClientId
            guideClientSecret
            withStock
            catalog
            invoiceF
            invoiceB
            guide
            app
            ose
            accountNumber
            comment
            disableContinuePay
            registerDate
            isRus
            isAgentRetention
            isAgentPerception
            showUser
        }
    }
`;

const DAYS_TO_EXPIRE = 20;

const STRING_FIELDS = [
    "doc",
    "businessName",
    "shortName",
    "address",
    "email",
    "phone",
    "certification",
    "certificationKey",
    "logo",
    "productionDate",
    "disabledDate",
    "accountNumber",
    "comment",
    "guideClientId",
    "guideClientSecret",
    "deductionAccount",
    "certificationExpirationDate",
    "registerDate",
    "userSol",
    "keySol",
];

const NUMBER_FIELDS = [
    "limit",
    "emissionInvoiceWithPreviousDate",
    "emissionReceiptWithPreviousDate",
];

const BOOLEAN_FIELDS = [
    "includeIgv",
    "isEnabled",
    "isProduction",
    "withStock",
    "catalog",
    "invoiceF",
    "invoiceB",
    "guide",
    "app",
    "ose",
    "disableContinuePay",
    "isRus",
    "isAgentRetention",
    "isAgentPerception",
];

/**
 * Deja la empresa con todos los campos que espera el formulario: lo que llega
 * null o undefined se convierte en su valor vacio ("" / 0 / false) para que los
 * inputs y selects no queden sin controlar.
 */
function normalizeCompany(raw: any) {
    const company: any = { ...raw };

    // percentageIgv debe ser numero para coincidir con los <option> del
    // formulario (p. ej. 10.5 en vez de "10.50").
    company.percentageIgv =
        company.percentageIgv === null ||
        company.percentageIgv === undefined ||
        company.percentageIgv === ""
            ? 18
            : parseFloat(company.percentageIgv);

    STRING_FIELDS.forEach((field) => {
        if (company[field] === null || company[field] === undefined) {
            company[field] = "";
        }
    });
    NUMBER_FIELDS.forEach((field) => {
        if (company[field] === null || company[field] === undefined) {
            company[field] = 0;
        }
    });
    BOOLEAN_FIELDS.forEach((field) => {
        if (company[field] === null || company[field] === undefined) {
            company[field] = false;
        }
    });

    return company;
}

/** Cuantos dias faltan para que expire el certificado. */
function daysToExpire(certificationExpirationDate?: string | null) {
    if (!certificationExpirationDate) return null;
    const expiration = new Date(certificationExpirationDate);
    if (isNaN(expiration.getTime())) return null;
    return (expiration.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
}

/** Fila de la tabla, memorizada: solo se repinta si cambian sus datos. */
const CompanyRow = memo(function CompanyRow({
    item,
    onEdit,
}: {
    item: ICompany;
    onEdit: (item: ICompany) => void;
}) {
    const remaining = daysToExpire(item.certificationExpirationDate);
    const isExpiring = remaining !== null && remaining <= DAYS_TO_EXPIRE;
    const isDisabled = !item.isEnabled;

    // El hover se oscurece segun el estado de la fila, de modo que siempre
    // se nota el cambio de fondo sin romper el contraste del texto.
    let rowClasses = "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50";
    if (isDisabled) {
        rowClasses =
            "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/40";
    } else if (isExpiring) {
        rowClasses =
            "bg-yellow-50 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-300 dark:hover:bg-yellow-900/40";
    }

    return (
        <tr
            className={`border-b border-gray-100 transition-colors duration-150 last:border-b-0 dark:border-gray-800 ${rowClasses}`}
        >
            <td className="px-3 py-2">
                <div className="flex items-center gap-1.5">
                    <span className="font-medium tabular-nums">{item.id}</span>
                    <span
                        title={item.isRus ? "Contribuyente" : "NoSpecified"}
                        className="inline-flex h-4 w-4 items-center justify-center text-[10px] font-bold text-gray-400 dark:text-gray-500"
                    >
                        {item.isRus ? "C" : "N"}
                    </span>
                </div>
            </td>
            <td className="px-3 py-2 font-medium tabular-nums">
                {item.doc}
            </td>
            <td className="px-3 py-2">
                <div
                    className="max-w-[260px] truncate font-medium"
                    title={item.businessName}
                >
                    {item.businessName}
                </div>
            </td>
            <td className="px-3 py-2">
                <div className="max-w-[140px] truncate" title={item.shortName}>
                    {item.shortName || "—"}
                </div>
            </td>
            <td className="px-3 py-2">
                <div
                    className="max-w-[200px] truncate text-[12px] opacity-80"
                    title={item.address}
                >
                    {item.address || "—"}
                </div>
            </td>
            <td className="px-3 py-2 tabular-nums">
                <div className="max-w-[110px] truncate">{item.phone || "—"}</div>
            </td>
            <td className="px-3 py-2">
                <div
                    className="max-w-[180px] truncate text-[12px]"
                    title={item.email}
                >
                    {item.email || "—"}
                </div>
            </td>
            <td className="px-3 py-2 text-right tabular-nums">
                {item.limit}
            </td>
            <td className="px-3 py-2 text-center">
                {item.isProduction ? (
                    <span
                        title="En producción"
                        className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300"
                    >
                        <Check />
                    </span>
                ) : (
                    <span
                        title="En pruebas"
                        className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-400"
                    >
                        <CloseCircle />
                    </span>
                )}
            </td>
            <td className="px-3 py-2 text-center">
                {item.isEnabled ? (
                    <span
                        title="Habilitada"
                        className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300"
                    >
                        <Check />
                    </span>
                ) : (
                    <span
                        title="Deshabilitada"
                        className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-400"
                    >
                        <CloseCircle />
                    </span>
                )}
            </td>
            <td className="px-3 py-2">
                <div className="flex items-center justify-center">
                    {item?.logo ? (
                        <ImageCircle
                            image={
                                item.id &&
                                (item.logo as string).search("base64") == -1
                                    ? `${process.env.NEXT_PUBLIC_BASE_API}/${item.logo}`
                                    : (item.logo as string)
                            }
                            className="!h-6 !w-6 rounded-full object-cover p-0 ring-1 ring-gray-200 dark:ring-gray-700"
                        />
                    ) : (
                        <span title="Sin logo">
                            <UserCircle />
                        </span>
                    )}
                </div>
            </td>
            <td className="px-3 py-2 text-right">
                <button
                    type="button"
                    onClick={() => onEdit(item)}
                    title="Editar"
                    aria-label={`Editar ${item.businessName}`}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-blue-500/60 dark:hover:bg-blue-500/10 dark:hover:text-blue-300 dark:focus:ring-blue-500/20"
                >
                    <svg
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                        fill="currentColor"
                        viewBox="0 0 20 18"
                    >
                        <path d="M12.687 14.408a3.01 3.01 0 0 1-1.533.821l-3.566.713a3 3 0 0 1-3.53-3.53l.713-3.566a3.01 3.01 0 0 1 .821-1.533L10.905 2H2.167A2.169 2.169 0 0 0 0 4.167v11.666A2.169 2.169 0 0 0 2.167 18h11.666A2.169 2.169 0 0 0 16 15.833V11.1l-3.313 3.308Zm5.53-9.065.546-.546a2.518 2.518 0 0 0 0-3.56 2.576 2.576 0 0 0-3.559 0l-.547.547 3.56 3.56Z" />
                        <path d="M13.243 3.2 7.359 9.081a.5.5 0 0 0-.136.256L6.51 12.9a.5.5 0 0 0 .59.59l3.566-.713a.5.5 0 0 0 .255-.136L16.8 6.757 13.243 3.2Z" />
                    </svg>
                </button>
            </td>
        </tr>
    );
});

function CompanyList({
    companies,
    modal,
    setModal,
    company,
    setCompany,
    loading,
    hasCachedData,
    error,
}: any) {
    const auth = useAuth();
    const authContext = useMemo(
        () => ({
            headers: {
                "Content-Type": "application/json",
                Authorization: auth?.jwtToken ? `JWT ${auth.jwtToken}` : "",
            },
        }),
        [auth?.jwtToken]
    );

    const [fetchCompanyById] = useLazyQuery(COMPANY_BY_ID_QUERY, {
        context: authContext,
        // network-only: al editar hay que tener SIEMPRE el dato completo y
        // actual. Con cache-first, Apollo puede devolver el objeto parcial que
        // ya esta normalizado en la cache desde la consulta del listado y el
        // formulario abre vacio.
        fetchPolicy: "network-only",
    });

    const openEditModal = useCallback(
        async (item: ICompany) => {
            // Se parte de los datos del listado como base: si la consulta de
            // detalle no llega, se abre igualmente con lo ultimo conocido y los
            // campos que falten se dejan vacios.
            let raw: any = { ...item };

            try {
                const { data } = await fetchCompanyById({
                    variables: { pk: String(item.id) },
                });
                if (data?.companyById) {
                    raw = data.companyById;
                }
            } catch (e: any) {
                console.error("No se pudo cargar el detalle de la empresa:", e);
            }

            setCompany(normalizeCompany(raw));
            modal.show();
        },
        [fetchCompanyById, modal, setCompany]
    );

    const showSkeleton = loading && !hasCachedData;
    const isEmpty = !loading && !error && companies.length === 0;

    const rows = useMemo(
        () =>
            companies?.map((item: ICompany) => (
                <CompanyRow key={item.id} item={item} onEdit={openEditModal} />
            )) ?? [],
        [companies, openEditModal]
    );

    const columns = [
        "ID",
        "RUC",
        "Razón Social",
        "Nombre",
        "Dirección",
        "Teléfono",
        "Correo",
        "Límite",
        "Prod.",
        "Estado",
        "Logo",
        "",
    ];

    return (
        <div className="mb-3 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700/70 dark:bg-gray-900/40">
            {/* Leyenda */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-gray-100 px-4 py-3 text-[11px] dark:border-gray-800">
                <span className="font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Estados
                </span>
                <span className="inline-flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                    <span className="h-2.5 w-2.5 rounded-sm bg-red-100 ring-1 ring-red-300 dark:bg-red-900/40 dark:ring-red-700" />
                    Empresa deshabilitada
                </span>
                <span className="inline-flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                    <span className="h-2.5 w-2.5 rounded-sm bg-yellow-100 ring-1 ring-yellow-400 dark:bg-yellow-900/40 dark:ring-yellow-700" />
                    Certificado por vencer (&le; {DAYS_TO_EXPIRE} días)
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-[13px] text-left">
                    <thead>
                        <tr className="bg-gray-50 text-[11px] uppercase tracking-wide text-gray-500 dark:bg-gray-800/60 dark:text-gray-400">
                            {columns.map((col, i) => (
                                <th
                                    key={`${col}-${i}`}
                                    scope="col"
                                    className={`px-3 py-2.5 font-semibold whitespace-nowrap ${
                                        i === 0 || i === 7 || i === 11
                                            ? "text-center"
                                            : i === columns.length - 1
                                              ? "text-right"
                                              : ""
                                    }`}
                                >
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {showSkeleton ? (
                        <tbody>
                            {Array.from({ length: 8 }).map((_, i) => (
                                <tr
                                    key={i}
                                    className="border-b border-gray-100 dark:border-gray-800"
                                >
                                    {columns.map((_, j) => (
                                        <td key={j} className="px-3 py-2.5">
                                            <div
                                                className={`h-3 animate-pulse rounded bg-gray-200 dark:bg-gray-700 ${
                                                    j === 2
                                                        ? "w-48"
                                                        : j === 5 || j === 6
                                                          ? "w-28"
                                                          : "w-14"
                                                }`}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    ) : isEmpty ? (
                        <tbody>
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-4 py-16 text-center"
                                >
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                                        <svg
                                            className="h-7 w-7 text-gray-300 dark:text-gray-600"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={1.2}
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
                                            />
                                        </svg>
                                    </div>
                                    <p className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
                                        No se encontraron empresas
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        Ajusta la búsqueda o crea una nueva
                                        empresa.
                                    </p>
                                </td>
                            </tr>
                        </tbody>
                    ) : (
                        <tbody>{rows}</tbody>
                    )}
                </table>
            </div>

            {/* Aviso de error, sin tirar la tabla */}
            {error && hasCachedData && (
                <p className="border-t border-gray-100 px-4 py-2 text-xs text-amber-600 dark:border-gray-800 dark:text-amber-400">
                    No se pudo actualizar la lista: {error.message}
                </p>
            )}
        </div>
    );
}

export default CompanyList;