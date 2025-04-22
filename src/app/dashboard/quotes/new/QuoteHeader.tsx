import { IOperationType } from "@/app/types";

function QuoteHeader({ sale, handleSale, operationTypesData }: any) {
    return (
        <fieldset className="border-2 border-blue-200 dark:border-blue-900 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 relative group transition-all duration-300 hover:shadow-blue-500/20 hover:shadow-2xl">
            <legend className="px-2 text-blue-600 dark:text-blue-400 font-semibold text-sm transition-all duration-300 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                <div className="flex items-center gap-2">
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    Información General
                </div>
            </legend>
            <div className="grid gap-6 lg:grid-cols-6 sm:grid-cols-1 md:grid-cols-3">
                {/* IGV % */}
                <div>
                    <label
                        htmlFor="igvType"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        IGV %{" "}
                    </label>
                    <select
                        value={sale.igvType}
                        name="igvType"
                        onChange={handleSale}
                        className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        required
                    >
                        <option value={18}>18%</option>
                        <option value={10}>10% (Ley 31556)</option>
                        <option value={4}>4% (IVAP)</option>
                    </select>
                </div>

                {/* Tipo operacion */}
                <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tipo operacion
                    </label>
                    <select
                        value={sale.operationType}
                        name="operationType"
                        onChange={handleSale}
                        className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm uppercase"
                        required
                    >
                        {operationTypesData?.allOperationTypes
                            ?.filter((o: IOperationType) =>
                                [
                                    "0101", // Venta interna
                                    // "0200", // Exportación
                                    // "0502", // Anticipos
                                    // "0401", // Ventas no domiciliados
                                    "1001", // Operación Sujeta a Detracción
                                    // "1002", // Operación Sujeta a Detracción- Recursos Hidrobiológicos
                                    // "1003", // Operación Sujeta a Detracción- Servicios de Transporte Pasajeros
                                    // "1004", // Operación Sujeta a Detracción- Servicios de Transporte Carga
                                    "2001", // Operación Sujeta a Percepción
                                ].includes(o.code)
                            )
                            .map((o: IOperationType, k: number) => (
                                <option key={k} value={o.code}>
                                    {`[${o.code}] `}
                                    {o.name}
                                </option>
                            ))}
                    </select>
                </div>
                {/* Fecha emisión */}
                <div>
                    <label
                        htmlFor="emitDate"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        Fecha emisión
                    </label>
                    <input
                        type="date"
                        name="emitDate"
                        id="emitDate"
                        value={sale.emitDate}
                        onChange={handleSale}
                        onFocus={(e) => e.target.select()}
                        className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        required
                    />
                </div>
                {/* Fecha vencimiento */}
                <div>
                    <label
                        htmlFor="dueDate"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        Fecha vencimiento
                    </label>
                    <input
                        type="date"
                        name="dueDate"
                        id="dueDate"
                        value={sale.dueDate}
                        onChange={handleSale}
                        onFocus={(e) => e.target.select()}
                        className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        required
                    />
                </div>
                {/* Moneda */}
                <div>
                    <label
                        htmlFor="currencyType"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        Moneda
                    </label>
                    <select
                        value={sale.currencyType}
                        name="currencyType"
                        onChange={handleSale}
                        className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                        <option value={0} disabled>
                            Moneda
                        </option>
                        <option value={"PEN"}>S/ PEN - SOLES</option>
                        <option value={"USD"}>
                            US$ USD - DÓLARES AMERICANOS
                        </option>
                        <option value={"EUR"}>€ EUR - EUROS</option>
                        <option value={"GBP"}>£ GBP - LIBRA ESTERLINA</option>
                    </select>
                </div>

                {sale.currencyType !== "PEN" && (
                    <>
                        {/* Tipo de Cambio */}
                        <div>
                            <label
                                htmlFor="saleExchangeRate"
                                className="text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Tipo de cambio
                            </label>
                            <input
                                type="text"
                                name="saleExchangeRate"
                                id="saleExchangeRate"
                                maxLength={10}
                                value={sale.saleExchangeRate}
                                onChange={handleSale}
                                onFocus={(e) => e.target.select()}
                                className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                autoComplete="off"
                            />
                        </div>
                    </>
                )}
            </div>
        </fieldset>
    );
}

export default QuoteHeader;
