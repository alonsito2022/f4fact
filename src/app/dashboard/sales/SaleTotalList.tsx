import React from "react";

function SaleTotalList({ invoice }: any) {
    return (
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
    );
}

export default SaleTotalList;
