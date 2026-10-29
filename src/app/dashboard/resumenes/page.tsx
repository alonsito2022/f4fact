"use client";

import Breadcrumb from "@/components/Breadcrumb";
import { useAuth } from "@/components/providers/AuthProvider";
import { gql, useLazyQuery } from "@apollo/client";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import SummaryFilter from "./SummaryFilter";
import SummaryList from "./SummaryList";

const limaDate = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Lima" })
);
const pad = (value: number) => String(value).padStart(2, "0");
const today = `${limaDate.getFullYear()}-${pad(limaDate.getMonth() + 1)}-${pad(
    limaDate.getDate()
)}`;
const monthStart = `${limaDate.getFullYear()}-${pad(limaDate.getMonth() + 1)}-01`;

const initialFilter = {
    startDate: monthStart,
    endDate: today,
    page: 1,
    pageSize: 20,
};

const SUMMARIES_QUERY = gql`
    query AllTicketSummaries(
        $companyId: Int!
        $startDate: Date!
        $endDate: Date!
        $page: Int!
        $pageSize: Int!
    ) {
        allTicketSummaries(
            companyId: $companyId
            startDate: $startDate
            endDate: $endDate
            page: $page
            pageSize: $pageSize
        ) {
            summaries {
                id
                rcId
                number
                correlative
                summaryDate
                documentsDate
                documentsCount
                ticket
                status
                statusReadable
                sunatCode
                sunatDescription
                linkXml
                linkCdr
                companyName
                companyRuc
            }
            totalNumberOfPages
            totalNumberOfSummaries
        }
    }
`;

function TicketSummariesPage() {
    const auth = useAuth();
    const [filterObj, setFilterObj] = useState(initialFilter);
    const companyId = Number(auth?.user?.companyId || 0);
    const hasCompany = companyId > 0;

    const authContext = useMemo(
        () => ({
            headers: {
                "Content-Type": "application/json",
                Authorization: auth?.jwtToken ? `JWT ${auth.jwtToken}` : "",
            },
        }),
        [auth?.jwtToken]
    );

    const [loadSummaries, { loading, error, data }] = useLazyQuery(
        SUMMARIES_QUERY,
        {
            context: authContext,
            fetchPolicy: "network-only",
            onError: (err) =>
                console.error("Error al consultar resúmenes:", err),
        }
    );

    const runQuery = (next = filterObj) => {
        if (!hasCompany || !auth?.jwtToken) return;
        if (next.startDate > next.endDate) {
            toast.warning(
                "La fecha inicial no puede ser posterior a la fecha final."
            );
            return;
        }
        loadSummaries({
            variables: {
                companyId,
                startDate: next.startDate,
                endDate: next.endDate,
                page: Number(next.page),
                pageSize: Number(next.pageSize),
            },
        });
    };

    useEffect(() => {
        if (auth?.status === "authenticated" && auth?.jwtToken && hasCompany) {
            runQuery(initialFilter);
        }
        // La carga inicial depende de la sesión, no de cada cambio de filtro.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth?.status, auth?.jwtToken, hasCompany]);

    if (auth?.status === "loading") {
        return <p className="text-center py-16">Cargando sesión...</p>;
    }
    if (auth?.status === "unauthenticated") {
        return (
            <p className="text-center text-red-500 py-16">No autorizado</p>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
            <div className="mx-auto max-w-[1400px] px-4 pb-16 pt-2 sm:px-6">
                <Breadcrumb
                    section="Resúmenes"
                    article="Resúmenes de Boletas de Venta"
                />
                <header className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-5 dark:border-gray-700 sm:flex-row sm:items-end sm:justify-between">
                    <p className="max-w-2xl text-sm text-slate-500 dark:text-gray-400">
                        Comunicación de resumen diario (RC) de las boletas de
                        venta enviadas a la SUNAT. El número corresponde al
                        identificador RC-fecha-correlativo.
                    </p>
                    {hasCompany && (
                        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <p className="text-[11px] uppercase tracking-wider text-slate-400">
                                Empresa
                            </p>
                            <p className="text-sm font-semibold text-slate-800 dark:text-white">
                                {auth?.user?.companyName}
                            </p>
                            <p className="font-mono text-xs text-slate-500 dark:text-gray-400">
                                RUC {auth?.user?.companyDoc || "—"}
                            </p>
                        </div>
                    )}
                </header>

                {!hasCompany ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-gray-600 dark:bg-gray-800">
                        <p className="text-lg font-medium text-slate-800 dark:text-white">
                            Este reporte corresponde a una empresa
                        </p>
                        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-gray-400">
                            Ingrese con una empresa para consultar sus
                            resúmenes de boletas de venta. Sin una empresa
                            activa no hay comprobantes que mostrar.
                        </p>
                    </div>
                ) : (
                    <>
                        <SummaryFilter
                            filterObj={filterObj}
                            setFilterObj={setFilterObj}
                            loading={loading}
                            onFilter={() => {
                                const next = { ...filterObj, page: 1 };
                                setFilterObj(next);
                                runQuery(next);
                            }}
                        />
                        <SummaryList
                            data={data}
                            loading={loading}
                            error={error}
                            filterObj={filterObj}
                            onPage={(page: number) => {
                                const next = { ...filterObj, page };
                                setFilterObj(next);
                                runQuery(next);
                            }}
                            isSuperuser={Boolean(auth?.user?.isSuperuser)}
                            companyName={auth?.user?.companyName || ""}
                            companyDoc={auth?.user?.companyDoc || ""}
                            authContext={authContext}
                        />
                    </>
                )}
            </div>
        </div>
    );
}

export default TicketSummariesPage;
