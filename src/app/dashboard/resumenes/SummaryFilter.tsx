"use client";

import Filter from "@/components/icons/Filter";
import React, { ChangeEvent } from "react";

function formatLong(iso: string) {
    if (!iso) return "—";
    const [year, month, day] = iso.slice(0, 10).split("-");
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date.toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

function SummaryFilter({
    filterObj,
    setFilterObj,
    loading,
    onFilter,
}: {
    filterObj: {
        startDate: string;
        endDate: string;
        page: number;
        pageSize: number;
    };
    setFilterObj: (value: any) => void;
    loading: boolean;
    onFilter: () => void;
}) {
    const handleInputChange = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = event.target;
        setFilterObj({ ...filterObj, [name]: value });
    };

    return (
        <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-sm font-semibold text-slate-800 dark:text-white">
                        Período de consulta
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-gray-400">
                        {formatLong(filterObj.startDate)} —{" "}
                        {formatLong(filterObj.endDate)}
                    </p>
                </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <label className="flex-1">
                    <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                        Desde
                    </span>
                    <input
                        type="date"
                        name="startDate"
                        value={filterObj.startDate}
                        onChange={handleInputChange}
                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:ring-blue-900"
                    />
                </label>
                <div className="hidden pb-3 text-slate-300 sm:block">—</div>
                <label className="flex-1">
                    <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                        Hasta
                    </span>
                    <input
                        type="date"
                        name="endDate"
                        value={filterObj.endDate}
                        onChange={handleInputChange}
                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:ring-blue-900"
                    />
                </label>
                <button
                    id="btn-search"
                    type="button"
                    className="btn-blue inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5"
                    onClick={onFilter}
                    disabled={loading}
                >
                    <Filter />
                    <span>{loading ? "Consultando..." : "Filtrar"}</span>
                </button>
            </div>
        </section>
    );
}

export default SummaryFilter;
