"use client";

import { downloadCpeFile } from "@/lib/downloadCpeFile";
import { gql, useLazyQuery } from "@apollo/client";
import React, { useState } from "react";

const DETAIL_QUERY = gql`
    query TicketSummaryDetail($pk: ID!) {
        getTicketSummaryById(pk: $pk) {
            id
            rcId
            summaryDate
            documentsDate
            documentsCount
            ticket
            status
            sunatCode
            sunatDescription
            details {
                id
                conditionCode
                serial
                correlative
                emitDate
                documentType
                documentTypeReadable
                clientName
                clientDocument
                totalToPay
                totalTaxed
                totalIgv
            }
        }
    }
`;

const STATUS_LABEL: Record<
    string,
    { label: string; className: string }
> = {
    "01": {
        label: "Pendiente",
        className:
            "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:ring-amber-800",
    },
    "02": {
        label: "Enviado",
        className:
            "bg-sky-50 text-sky-800 ring-sky-200 dark:bg-sky-950 dark:text-sky-200 dark:ring-sky-800",
    },
    "03": {
        label: "Aceptado",
        className:
            "bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:ring-emerald-800",
    },
    "04": {
        label: "Rechazado",
        className:
            "bg-rose-50 text-rose-800 ring-rose-200 dark:bg-rose-950 dark:text-rose-200 dark:ring-rose-800",
    },
    "05": {
        label: "Fuera de plazo",
        className:
            "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-gray-700 dark:text-gray-200 dark:ring-gray-600",
    },
};

const CONDITION_LABEL: Record<string, string> = {
    "1": "Adicionar",
    "2": "Modificar",
    "3": "Anular",
};

function formatDate(iso?: string | null) {
    if (!iso) return "—";
    const [year, month, day] = iso.slice(0, 10).split("-");
    if (!year || !month || !day) return iso;
    return `${day}/${month}/${year}`;
}

function money(value?: number | string | null) {
    return Number(value || 0).toLocaleString("es-PE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function padCorr(value?: number | null) {
    return String(value ?? 0).padStart(2, "0");
}

function SummaryList({
    data,
    loading,
    error,
    filterObj,
    onPage,
    isSuperuser,
    companyName,
    companyDoc,
    authContext,
}: any) {
    const summaries = data?.allTicketSummaries?.summaries ?? [];
    const totalPages = data?.allTicketSummaries?.totalNumberOfPages ?? 0;
    const total = data?.allTicketSummaries?.totalNumberOfSummaries ?? 0;
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const [loadDetail, { data: detailData, loading: detailLoading }] =
        useLazyQuery(DETAIL_QUERY, {
            context: authContext,
            fetchPolicy: "network-only",
        });

    const openDetail = (id: string) => {
        setSelectedId(id);
        loadDetail({ variables: { pk: id } });
    };

    const downloadFile = (
        url: string,
        filename: string
    ) => {
        downloadCpeFile(url, filename);
    };

    if (!error && (loading || !data)) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center text-sm text-slate-500 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                Consultando resúmenes de boletas...
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-10 text-center text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">
                No se pudo cargar el reporte. {error.message}
            </div>
        );
    }

    const detail = detailData?.getTicketSummaryById;
    const detailRows = detail?.details ?? [];
    const detailTotals = detailRows.reduce(
        (acc: { taxed: number; igv: number; pay: number }, row: any) => ({
            taxed: acc.taxed + Number(row.totalTaxed || 0),
            igv: acc.igv + Number(row.totalIgv || 0),
            pay: acc.pay + Number(row.totalToPay || 0),
        }),
        { taxed: 0, igv: 0, pay: 0 }
    );

    return (
        <>
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-gray-700">
                    <p className="text-sm text-slate-600 dark:text-gray-300">
                        <span className="font-semibold text-slate-900 dark:text-white">
                            {total}
                        </span>{" "}
                        {total === 1 ? "resumen" : "resúmenes"} en el período
                    </p>
                    <p className="text-xs text-slate-400">
                        Página {filterObj.page} de {Math.max(totalPages, 1)}
                    </p>
                </div>

                {summaries.length === 0 ? (
                    <div className="px-6 py-16 text-center">
                        <p className="text-base font-medium text-slate-800 dark:text-white">
                            No hay resúmenes en este período
                        </p>
                        <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500 dark:text-gray-400">
                            {isSuperuser
                                ? "Ninguna empresa tiene resúmenes de boletas de venta entre las fechas seleccionadas."
                                : `${companyName || "La empresa"}${
                                      companyDoc ? ` (RUC ${companyDoc})` : ""
                                  } no tiene resúmenes de boletas de venta entre las fechas seleccionadas.`}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-[13px]">
                            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 dark:bg-gray-900 dark:text-gray-400">
                                <tr>
                                    {isSuperuser && (
                                        <th className="px-4 py-3 font-semibold">
                                            Empresa
                                        </th>
                                    )}
                                    <th className="px-4 py-3 font-semibold">
                                        Número
                                    </th>
                                    <th className="px-4 py-3 font-semibold">
                                        Fecha generación
                                    </th>
                                    <th className="px-4 py-3 font-semibold">
                                        Fecha docs.
                                    </th>
                                    <th className="px-4 py-3 text-center font-semibold">
                                        Documentos y detalle
                                    </th>
                                    <th className="px-4 py-3 font-semibold">
                                        Ticket (SUNAT)
                                    </th>
                                    <th className="px-3 py-3 text-center font-semibold">
                                        XML
                                    </th>
                                    <th className="px-3 py-3 text-center font-semibold">
                                        CDR
                                    </th>
                                    <th className="px-4 py-3 text-center font-semibold">
                                        Estado en la SUNAT
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
                                {summaries.map((item: any) => {
                                    const status =
                                        STATUS_LABEL[item.status] || {
                                            label:
                                                item.statusReadable ||
                                                item.status ||
                                                "—",
                                            className:
                                                "bg-slate-100 text-slate-700 ring-slate-200",
                                        };
                                    const xmlName = `${item.companyRuc || companyDoc}-RC-${item.number}-${padCorr(item.correlative)}.xml`;
                                    const cdrName = `R-${xmlName}`;
                                    return (
                                        <tr
                                            key={item.id}
                                            className="text-slate-700 hover:bg-slate-50/80 dark:text-gray-200 dark:hover:bg-gray-700/40"
                                        >
                                            {isSuperuser && (
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-slate-900 dark:text-white">
                                                        {item.companyName ||
                                                            "—"}
                                                    </p>
                                                    <p className="font-mono text-xs text-slate-500">
                                                        RUC{" "}
                                                        {item.companyRuc ||
                                                            "—"}
                                                    </p>
                                                </td>
                                            )}
                                            <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900 dark:text-white">
                                                {item.rcId ||
                                                    `RC-${item.number}-${padCorr(item.correlative)}`}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 tabular-nums">
                                                {formatDate(item.summaryDate)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 tabular-nums">
                                                {formatDate(
                                                    item.documentsDate
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <p className="font-semibold tabular-nums text-slate-900 dark:text-white">
                                                    {item.documentsCount ?? 0}
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openDetail(
                                                            String(item.id)
                                                        )
                                                    }
                                                    className="text-xs font-medium text-blue-700 hover:underline dark:text-blue-300"
                                                >
                                                    Ver detalle
                                                </button>
                                            </td>
                                            <td className="px-4 py-3 font-mono text-xs">
                                                {item.ticket || "—"}
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                {item.linkXml ? (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            downloadFile(
                                                                item.linkXml,
                                                                xmlName
                                                            )
                                                        }
                                                        className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[11px] font-semibold text-white hover:bg-emerald-700"
                                                    >
                                                        XML
                                                    </button>
                                                ) : (
                                                    <span className="text-slate-300">
                                                        —
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                {item.linkCdr ? (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            downloadFile(
                                                                item.linkCdr,
                                                                cdrName
                                                            )
                                                        }
                                                        className="rounded-full bg-slate-600 px-2.5 py-0.5 text-[11px] font-semibold text-white hover:bg-slate-700"
                                                    >
                                                        CDR
                                                    </button>
                                                ) : (
                                                    <span className="text-slate-300">
                                                        —
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span
                                                    title={
                                                        item.sunatDescription ||
                                                        status.label
                                                    }
                                                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${status.className}`}
                                                >
                                                    {status.label}
                                                    {item.sunatCode
                                                        ? ` · ${item.sunatCode}`
                                                        : ""}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-4 py-3 dark:border-gray-700">
                        <button
                            type="button"
                            disabled={filterObj.page <= 1 || loading}
                            onClick={() => onPage(filterObj.page - 1)}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 disabled:opacity-40 dark:border-gray-600 dark:text-gray-200"
                        >
                            Anterior
                        </button>
                        <button
                            type="button"
                            disabled={
                                filterObj.page >= totalPages || loading
                            }
                            onClick={() => onPage(filterObj.page + 1)}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 disabled:opacity-40 dark:border-gray-600 dark:text-gray-200"
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </section>

            {selectedId && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4">
                    <div className="flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800">
                        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 dark:border-gray-700">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700 dark:text-blue-300">
                                    Documentos del resumen
                                </p>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                    {detail?.rcId || "Detalle"}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-gray-400">
                                    Generación{" "}
                                    {formatDate(detail?.summaryDate)} ·
                                    Documentos{" "}
                                    {formatDate(detail?.documentsDate)}
                                    {detail?.ticket
                                        ? ` · Ticket ${detail.ticket}`
                                        : ""}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedId(null)}
                                className="rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-700"
                            >
                                Cerrar
                            </button>
                        </div>
                        <div className="overflow-auto">
                            {detailLoading ? (
                                <p className="px-5 py-12 text-center text-sm text-slate-500">
                                    Cargando comprobantes...
                                </p>
                            ) : detailRows.length === 0 ? (
                                <p className="px-5 py-12 text-center text-sm text-slate-500">
                                    Este resumen no tiene documentos
                                    asociados.
                                </p>
                            ) : (
                                <table className="min-w-full text-left text-[13px]">
                                    <thead className="sticky top-0 bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 dark:bg-gray-900 dark:text-gray-400">
                                        <tr>
                                            <th className="px-4 py-2">
                                                Comprobante
                                            </th>
                                            <th className="px-4 py-2">
                                                Fecha
                                            </th>
                                            <th className="px-4 py-2">
                                                Cliente
                                            </th>
                                            <th className="px-4 py-2">
                                                Condición
                                            </th>
                                            <th className="px-4 py-2 text-right">
                                                Gravada
                                            </th>
                                            <th className="px-4 py-2 text-right">
                                                IGV
                                            </th>
                                            <th className="px-4 py-2 text-right">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
                                        {detailRows.map((row: any) => (
                                            <tr
                                                key={row.id}
                                                className="text-slate-700 dark:text-gray-200"
                                            >
                                                <td className="whitespace-nowrap px-4 py-2 font-medium">
                                                    {row.documentTypeReadable ||
                                                        "Boleta"}{" "}
                                                    {row.serial}-
                                                    {row.correlative}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-2 tabular-nums">
                                                    {formatDate(row.emitDate)}
                                                </td>
                                                <td className="px-4 py-2">
                                                    <p>{row.clientName || "—"}</p>
                                                    <p className="font-mono text-xs text-slate-400">
                                                        {row.clientDocument ||
                                                            ""}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-2">
                                                    {CONDITION_LABEL[
                                                        row.conditionCode
                                                    ] || row.conditionCode}
                                                </td>
                                                <td className="px-4 py-2 text-right tabular-nums">
                                                    {money(row.totalTaxed)}
                                                </td>
                                                <td className="px-4 py-2 text-right tabular-nums">
                                                    {money(row.totalIgv)}
                                                </td>
                                                <td className="px-4 py-2 text-right font-medium tabular-nums">
                                                    {money(row.totalToPay)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-slate-50 text-slate-800 dark:bg-gray-900 dark:text-white">
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider"
                                            >
                                                {detailRows.length} documentos
                                            </td>
                                            <td className="px-4 py-2 text-right font-semibold tabular-nums">
                                                {money(detailTotals.taxed)}
                                            </td>
                                            <td className="px-4 py-2 text-right font-semibold tabular-nums">
                                                {money(detailTotals.igv)}
                                            </td>
                                            <td className="px-4 py-2 text-right font-semibold tabular-nums">
                                                {money(detailTotals.pay)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default SummaryList;
