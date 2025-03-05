import React from "react";

function GuideTranferData({ guide, handleGuide }: any) {
    return (
        <>
            <fieldset className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <legend className="px-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
                    DATOS DEL TRASLADO
                </legend>
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-5 ">
                    {/* Fecha de inicio de traslado */}
                    <div>
                        <label
                            htmlFor="transferDate"
                            className="text-sm font-medium text-gray-900 dark:text-gray-200"
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
                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    {/* Peso bruto total */}
                    <div>
                        <label className="text-sm text-gray-700 dark:text-gray-200">
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
                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    {/* Peso - unidad de medida */}
                    <div className="md:col-span-2">
                        <label className="text-sm text-gray-700 dark:text-gray-200">
                            Peso - unidad de medida
                        </label>
                        <select
                            value={guide.weightMeasurementUnitCode}
                            name="weightMeasurementUnitCode"
                            onChange={handleGuide}
                            className="text-lg w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value={"KGM"}>KGM - KILOGRAMO</option>
                            <option value={"TNE"}>
                                TNE - TONELADA (TONELADA MÉTRICA)
                            </option>
                        </select>
                    </div>
                    {/* Numero de bultos */}
                    <div>
                        <label className="text-sm text-gray-700 dark:text-gray-200">
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
                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>
            </fieldset>
        </>
    );
}

export default GuideTranferData;
