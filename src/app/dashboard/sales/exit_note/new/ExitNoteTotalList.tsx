import React from "react";

function ExitNoteTotalList({ invoice, setInvoice, handleInvoice }: any) {
    return (
        <>
            <div className="bg-white-100 dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
                <div className="bg-gray-50 border-b border-gray-200 dark:border-gray-700 p-4 dark:bg-gray-800 text-right">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-400">
                        Resumen de Venta
                    </h3>
                </div>
                <div className="p-2 space-y-0">
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-8 text-right text-gray-600 dark:text-gray-400 group hover:bg-gray-50 dark:hover:bg-gray-700 py-1 px-2 transition-colors">
                            % Descuento Global
                        </div>
                        <div
                            className="col-span-4 rounded-full text-right font-medium bg-gray-300 text-black-800 dark:text-black group-hover:text-blue-600 dark:group-hover:text-blue-400 py-1 px-2"
                            style={{ border: "1px solid rgb(179, 178, 173)" }}
                        >
                            0.00
                        </div>
                    </div>
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-4"></div>
                        <div className="col-span-4 text-right text-gray-600 dark:text-gray-400 group hover:bg-gray-50 dark:hover:bg-gray-700 py-1 px-2 transition-colors">
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
                        <div
                            className="col-span-4 rounded-full text-right font-medium bg-gray-300 text-black-800 dark:text-black group-hover:text-blue-600 dark:group-hover:text-blue-400 py-1 px-2"
                            style={{ border: "1px solid rgb(179, 178, 173)" }}
                        >
                            {invoice.discountGlobal}
                        </div>
                    </div>
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-4"></div>
                        <div className="col-span-4 text-right text-gray-600 dark:text-gray-400 group hover:bg-gray-50 dark:hover:bg-gray-700 py-1 px-2 transition-colors">
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
                        <div
                            className="col-span-4 rounded-full text-right font-medium bg-gray-300 text-black-800 dark:text-black group-hover:text-blue-600 dark:group-hover:text-blue-400 py-1 px-2"
                            style={{ border: "1px solid rgb(179, 178, 173)" }}
                        >
                            {invoice.discountForItem}
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-4"></div>
                        <div className="col-span-4 text-right text-gray-600 dark:text-gray-400 group hover:bg-gray-50 dark:hover:bg-gray-700 py-1 px-2 transition-colors">
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
                        <div
                            className="col-span-4 rounded-full text-right font-medium bg-gray-300 text-black-800 dark:text-black group-hover:text-blue-600 dark:group-hover:text-blue-400 py-1 px-2"
                            style={{ border: "1px solid rgb(179, 178, 173)" }}
                        >
                            {invoice.totalDiscount}
                        </div>
                    </div>
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-4"></div>
                        <div className="col-span-4 text-right text-gray-600 dark:text-gray-400 group hover:bg-gray-50 dark:hover:bg-gray-700 py-1 px-2 transition-colors">
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
                        <div
                            className="col-span-4 rounded-full text-right font-medium bg-gray-300 text-black-800 dark:text-black group-hover:text-blue-600 dark:group-hover:text-blue-400 py-1 px-2"
                            style={{ border: "1px solid rgb(179, 178, 173)" }}
                        >
                            {invoice.totalExonerated || "0.00"}
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-4"></div>
                        <div className="col-span-4 text-right text-gray-600 dark:text-gray-400 group hover:bg-gray-50 dark:hover:bg-gray-700 py-1 px-2 transition-colors">
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
                        <div
                            className="col-span-4 rounded-full text-right font-medium bg-gray-300 text-black-800 dark:text-black group-hover:text-blue-600 dark:group-hover:text-blue-400 py-1 px-2"
                            style={{ border: "1px solid rgb(179, 178, 173)" }}
                        >
                            {invoice.totalUnaffected || "0.00"}
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-4"></div>
                        <div className="col-span-4 text-right text-gray-600 dark:text-gray-400 group hover:bg-gray-50 dark:hover:bg-gray-700 py-1 px-2 transition-colors">
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
                        <div
                            className="col-span-4 rounded-full text-right font-medium bg-gray-300 text-black-800 dark:text-black group-hover:text-blue-600 dark:group-hover:text-blue-400 py-1 px-2"
                            style={{ border: "1px solid rgb(179, 178, 173)" }}
                        >
                            {invoice.totalTaxed}
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-4"></div>
                        <div className="col-span-4 text-right text-gray-600 dark:text-gray-400 group hover:bg-gray-50 dark:hover:bg-gray-700 py-1 px-2 transition-colors">
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
                        <div
                            className="col-span-4 rounded-full text-right font-medium bg-gray-300 text-black-800 dark:text-black group-hover:text-blue-600 dark:group-hover:text-blue-400 py-1 px-2"
                            style={{ border: "1px solid rgb(179, 178, 173)" }}
                        >
                            {invoice.totalIgv}
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-4"></div>
                        <div className="col-span-4 text-right text-gray-600 dark:text-gray-400 group hover:bg-gray-50 dark:hover:bg-gray-700 py-1 px-2 transition-colors">
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
                        <div
                            className="col-span-4 rounded-full text-right font-medium bg-gray-300 text-black-800 dark:text-black group-hover:text-blue-600 dark:group-hover:text-blue-400 py-1 px-2"
                            style={{ border: "1px solid rgb(179, 178, 173)" }}
                        >
                            {invoice.totalFree || "0.00"}
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-4"></div>
                        <div className="col-span-4 text-right text-gray-600 dark:text-gray-400 group hover:bg-gray-50 dark:hover:bg-gray-700 py-1 px-2 transition-colors">
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
                        <div
                            className="col-span-4 rounded-full text-right font-medium bg-gray-300 text-black-800 dark:text-black group-hover:text-blue-600 dark:group-hover:text-blue-400 py-1 px-2"
                            style={{ border: "1px solid rgb(179, 178, 173)" }}
                        >
                            0.00
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-4"></div>
                        <div className="col-span-4 text-right text-gray-600 dark:text-gray-400 group hover:bg-gray-50 dark:hover:bg-gray-700 py-1 px-2 transition-colors">
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
                        <div
                            className="col-span-4 rounded-full text-right font-medium bg-gray-300 text-black-800 dark:text-black group-hover:text-blue-600 dark:group-hover:text-blue-400 py-1 px-2"
                            style={{ border: "1px solid rgb(179, 178, 173)" }}
                        >
                            {invoice.totalAmount}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ExitNoteTotalList;
