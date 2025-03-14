import React from "react";

function SaleTotalList({ invoice, handleSale }: any) {
    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-6 md:grid-cols-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <div className="sm:col-span-3 text-right font-medium text-gray-700 dark:text-gray-300">
                    % Descuento Global
                </div>
                <div className="sm:col-span-1 text-right font-medium text-gray-700 dark:text-gray-300">
                    0.00
                </div>
                <div className="sm:col-span-3 text-right font-medium text-gray-700 dark:text-gray-300">
                    Descuento Global (-){" "}
                    {invoice.currencyType === "PEN"
                        ? "S/"
                        : invoice.currencyType === "USD"
                        ? "US$"
                        : invoice.currencyType === "EUR"
                        ? "€"
                        : invoice.currencyType === "GBP"
                        ? "£"
                        : null}
                </div>
                <div className="sm:col-span-1 text-right font-medium text-gray-700 dark:text-gray-300">
                    {invoice.discountGlobal}
                </div>
                <div className="sm:col-span-3 text-right font-medium text-gray-700 dark:text-gray-300">
                    Descuento por Item (-){" "}
                    {invoice.currencyType === "PEN"
                        ? "S/"
                        : invoice.currencyType === "USD"
                        ? "US$"
                        : invoice.currencyType === "EUR"
                        ? "€"
                        : invoice.currencyType === "GBP"
                        ? "£"
                        : null}
                </div>
                <div className="sm:col-span-1 text-right font-medium text-gray-700 dark:text-gray-300">
                    {invoice.discountForItem}
                </div>
                <div className="sm:col-span-3 text-right font-medium text-gray-700 dark:text-gray-300">
                    Descuento Total (-){" "}
                    {invoice.currencyType === "PEN"
                        ? "S/"
                        : invoice.currencyType === "USD"
                        ? "US$"
                        : invoice.currencyType === "EUR"
                        ? "€"
                        : invoice.currencyType === "GBP"
                        ? "£"
                        : null}
                </div>
                <div className="sm:col-span-1 text-right font-medium text-gray-700 dark:text-gray-300">
                    {invoice.totalDiscount}
                </div>
                <div className="sm:col-span-3 text-right font-medium text-gray-700 dark:text-gray-300">
                    Exonerada{" "}
                    {invoice.currencyType === "PEN"
                        ? "S/"
                        : invoice.currencyType === "USD"
                        ? "US$"
                        : invoice.currencyType === "EUR"
                        ? "€"
                        : invoice.currencyType === "GBP"
                        ? "£"
                        : null}
                </div>
                <div className="sm:col-span-1 text-right font-medium text-gray-700 dark:text-gray-300">
                    {invoice.totalExonerated || "0.00"}
                </div>
                <div className="sm:col-span-3 text-right font-medium text-gray-700 dark:text-gray-300">
                    Inafecta{" "}
                    {invoice.currencyType === "PEN"
                        ? "S/"
                        : invoice.currencyType === "USD"
                        ? "US$"
                        : invoice.currencyType === "EUR"
                        ? "€"
                        : invoice.currencyType === "GBP"
                        ? "£"
                        : null}
                </div>
                <div className="sm:col-span-1 text-right font-medium text-gray-700 dark:text-gray-300">
                    {invoice.totalUnaffected || "0.00"}
                </div>
                <div className="sm:col-span-3 text-right font-medium text-gray-700 dark:text-gray-300">
                    Gravada{" "}
                    {invoice.currencyType === "PEN"
                        ? "S/"
                        : invoice.currencyType === "USD"
                        ? "US$"
                        : invoice.currencyType === "EUR"
                        ? "€"
                        : invoice.currencyType === "GBP"
                        ? "£"
                        : null}
                </div>
                <div className="sm:col-span-1 text-right font-medium text-gray-700 dark:text-gray-300">
                    {invoice.totalTaxed}
                </div>
                <div className="sm:col-span-3 text-right font-medium text-gray-700 dark:text-gray-300">
                    IGV{" "}
                    {invoice.currencyType === "PEN"
                        ? "S/"
                        : invoice.currencyType === "USD"
                        ? "US$"
                        : invoice.currencyType === "EUR"
                        ? "€"
                        : invoice.currencyType === "GBP"
                        ? "£"
                        : null}
                </div>
                <div className="sm:col-span-1 text-right font-medium text-gray-700 dark:text-gray-300">
                    {invoice.totalIgv}
                </div>
                <div className="sm:col-span-3 text-right font-medium text-gray-700 dark:text-gray-300">
                    Gratuita{" "}
                    {invoice.currencyType === "PEN"
                        ? "S/"
                        : invoice.currencyType === "USD"
                        ? "US$"
                        : invoice.currencyType === "EUR"
                        ? "€"
                        : invoice.currencyType === "GBP"
                        ? "£"
                        : null}
                </div>
                <div className="sm:col-span-1 text-right font-medium text-gray-700 dark:text-gray-300">
                    {invoice.totalFree || "0.00"}
                </div>
                <div className="sm:col-span-3 text-right font-medium text-gray-700 dark:text-gray-300">
                    Otros Cargos{" "}
                    {invoice.currencyType === "PEN"
                        ? "S/"
                        : invoice.currencyType === "USD"
                        ? "US$"
                        : invoice.currencyType === "EUR"
                        ? "€"
                        : invoice.currencyType === "GBP"
                        ? "£"
                        : null}
                </div>
                <div className="sm:col-span-1 text-right font-medium text-gray-700 dark:text-gray-300">
                    0.00
                </div>
                <div className="sm:col-span-3 text-right font-medium text-gray-700 dark:text-gray-300">
                    Total{" "}
                    {invoice.currencyType === "PEN"
                        ? "S/"
                        : invoice.currencyType === "USD"
                        ? "US$"
                        : invoice.currencyType === "EUR"
                        ? "€"
                        : invoice.currencyType === "GBP"
                        ? "£"
                        : null}
                </div>
                <div className="sm:col-span-1 text-right font-medium text-gray-700 dark:text-gray-300">
                    {invoice.totalAmount}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                        type="checkbox"
                        name="hasPerception"
                        checked={invoice.hasPerception}
                        onChange={handleSale}
                        className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                        ¿Percepción?
                    </span>
                </label>
                {invoice?.hasPerception && (
                    <div className="grid sm:grid-cols-1 md:grid-cols-6 gap-4">
                        <div className="sm:col-span-2">
                            <label
                                htmlFor="totalPerception"
                                className="form-label text-gray-900 dark:text-gray-200"
                            >
                                Stock actual disponible
                            </label>
                            <input
                                type="number"
                                name="totalPerception"
                                onWheel={(e) => e.currentTarget.blur()}
                                value={invoice.totalPerception}
                                onChange={handleSale}
                                onFocus={(e) => e.target.select()}
                                className="form-control cursor-not-allowed dark:bg-gray-800 dark:text-gray-200"
                            />
                        </div>
                    </div>
                )}
                <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                        type="checkbox"
                        name="hasRetention"
                        checked={invoice.hasRetention}
                        onChange={handleSale}
                        className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                        ¿Retención?
                    </span>
                </label>

                {invoice?.hasRetention && (
                    <div className="grid sm:grid-cols-1 md:grid-cols-6 gap-4">
                        hasRetention
                    </div>
                )}
                <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                        type="checkbox"
                        name="hasDetraction"
                        checked={invoice.hasDetraction}
                        onChange={handleSale}
                        className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                        ¿Detracción?
                    </span>
                </label>

                {invoice?.hasDetraction && (
                    <div className="grid sm:grid-cols-1 md:grid-cols-6 gap-4">
                        hasDetraction
                    </div>
                )}
            </div>
        </>
    );
}

export default SaleTotalList;
