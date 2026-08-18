import React from "react";

function GuideTranferData({ guide, handleGuide }: any) {
    return (
        <div className="relative bg-white dark:bg-gray-800/80 backdrop-blur rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.1)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)] overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-60" />
            <div className="p-5 sm:p-6">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-5">
                    Datos del Traslado
                </h2>
                <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-5">
                    {/* Fecha de inicio de traslado */}
                    <div>
                        <label
                            htmlFor="transferDate"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                            Fecha de inicio de traslado
                        </label>
                        <input
                            type="date"
                            name="transferDate"
                            id="transferDate"
                            value={guide.transferDate}
                            onChange={handleGuide}
                            onFocus={(e) => e.target.select()}
                            className="w-full h-10 sm:h-11 px-3 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-600/80 bg-gray-50/50 dark:bg-gray-700/30 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200"
                            required
                        />
                    </div>

                    {/* Peso bruto total */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Peso bruto total
                        </label>
                        <input
                            type="number"
                            onWheel={(e) => e.currentTarget.blur()}
                            onFocus={(e) => e.target.select()}
                            name="totalWeight"
                            value={guide.totalWeight}
                            onChange={handleGuide}
                            autoComplete="off"
                            className="w-full h-10 sm:h-11 px-3 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-600/80 bg-gray-50/50 dark:bg-gray-700/30 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200"
                        />
                    </div>
                    {/* Peso - unidad de medida */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Peso - unidad de medida
                        </label>
                        <select
                            value={guide.weightMeasurementUnitCode}
                            name="weightMeasurementUnitCode"
                            onChange={handleGuide}
                            className="w-full h-10 sm:h-11 px-3 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-600/80 bg-gray-50/50 dark:bg-gray-700/30 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200"
                        >
                            <option value={"KGM"}>KGM - KILOGRAMO</option>
                            <option value={"TNE"}>
                                TNE - TONELADA (TONELADA MÉTRICA)
                            </option>
                        </select>
                    </div>
                    {/* Numero de bultos */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Numero de bultos
                        </label>
                        <input
                            type="number"
                            onWheel={(e) => e.currentTarget.blur()}
                            onFocus={(e) => e.target.select()}
                            name="quantityPackages"
                            value={guide.quantityPackages}
                            onChange={handleGuide}
                            autoComplete="off"
                            className="w-full h-10 sm:h-11 px-3 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-600/80 bg-gray-50/50 dark:bg-gray-700/30 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GuideTranferData;
