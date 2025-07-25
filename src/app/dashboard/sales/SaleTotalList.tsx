import {
    IDetractionPaymentMethod,
    IDetractionType,
    IOperation,
    IPerceptionType,
    IRetentionType,
} from "@/app/types";
import { loadGetInitialProps } from "next/dist/shared/lib/utils";
import React, { useEffect } from "react";

function SaleTotalList({
    invoice,
    setSale,
    handleSale,
    perceptionTypesData,
    retentionTypesData,
    detractionTypesData,
    detractionPaymentMethodsData,
}: any) {
    useEffect(() => {
        if (invoice?.perceptionType) {
            let perceptionPercentage = 0;
            switch (Number(invoice?.perceptionType)) {
                case 1:
                    perceptionPercentage = 0.02;
                    break;
                case 2:
                    perceptionPercentage = 0.01;
                    break;
                case 3:
                    perceptionPercentage = 0.005;
                    break;
                default:
                    perceptionPercentage = 0;
            }
            let totalPerception =
                Number(invoice?.totalAmount) * perceptionPercentage;
            let totalToPay = Number(invoice?.totalAmount) + totalPerception;
            setSale((prevSale: IOperation) => ({
                ...prevSale,
                perceptionPercentage: (perceptionPercentage * 100).toFixed(3),
                totalPerception: totalPerception.toFixed(2),
                totalToPay: totalToPay.toFixed(2),
            }));
        }
    }, [invoice?.perceptionType, invoice?.totalAmount]);
    useEffect(() => {
        if (invoice?.retentionType) {
            let retentionPercentage = 0;
            switch (Number(invoice?.retentionType)) {
                case 1:
                    retentionPercentage = 0.03;
                    break;
                case 2:
                    retentionPercentage = 0.06;
                    break;
                default:
                    retentionPercentage = 0;
            }
            let totalRetention =
                Number(invoice?.totalAmount) * retentionPercentage;
            let totalToPay = Number(invoice?.totalAmount) - totalRetention;
            setSale((prevSale: IOperation) => ({
                ...prevSale,
                retentionPercentage: (retentionPercentage * 100).toFixed(3),
                totalRetention: totalRetention.toFixed(2),
                totalToPay: totalToPay.toFixed(2),
            }));
        }
    }, [invoice?.retentionType, invoice?.totalAmount]);
    useEffect(() => {
        if (invoice?.detractionPercentage) {
            let detractionPercentage = Number(invoice?.detractionPercentage);
            // Redondear al entero más cercano usando Math.round
            let totalDetraction = Math.round(
                Number(invoice?.totalAmount) * detractionPercentage * 0.01
            );

            setSale((prevSale: IOperation) => ({
                ...prevSale,
                totalDetraction: totalDetraction,
            }));
        } else if (invoice?.totalDetraction && invoice?.totalAmount) {
            // Calcular el porcentaje cuando cambia totalDetraction
            let calculatedPercentage =
                (Number(invoice.totalDetraction) /
                    Number(invoice.totalAmount)) *
                100;

            setSale((prevSale: IOperation) => ({
                ...prevSale,
                detractionPercentage: calculatedPercentage.toFixed(3),
            }));
        }
    }, [
        invoice?.detractionPercentage,
        invoice?.totalAmount,
        invoice?.totalDetraction,
    ]);

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

            {/* Checkboxes section with better organization */}
            {!["07", "48"].includes(invoice.documentType) && (
                <div className="mt-6 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                        Opciones Adicionales
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {/* Each checkbox in its own card */}
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg transition-all duration-300 hover:shadow-md">
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="hasPerception"
                                    checked={invoice.hasPerception}
                                    onChange={handleSale}
                                    className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800"
                                />
                                <span className="text-gray-700 dark:text-gray-300 font-medium">
                                    Percepción
                                </span>
                            </label>
                            {invoice?.hasPerception && (
                                <div className="grid sm:grid-cols-1 md:grid-cols-6 gap-4 py-4">
                                    {/* Perception fields */}
                                    <div className="sm:col-span-2">
                                        <label
                                            htmlFor="perceptionType"
                                            className="form-label text-gray-900 dark:text-gray-200"
                                        >
                                            Percepción Tipo
                                        </label>
                                        <select
                                            name="perceptionType"
                                            id="perceptionType"
                                            onChange={handleSale}
                                            value={invoice.perceptionType}
                                            className="form-control dark:bg-gray-800 dark:text-gray-200"
                                        >
                                            {perceptionTypesData?.allPerceptionTypes?.map(
                                                (
                                                    o: IPerceptionType,
                                                    k: number
                                                ) => (
                                                    <option
                                                        key={k}
                                                        value={o.code}
                                                    >
                                                        {o.name}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-600 dark:text-gray-400">
                                            Base Imponible Percepción
                                        </label>
                                        <input
                                            type="number"
                                            name="totalAmount"
                                            onWheel={(e) =>
                                                e.currentTarget.blur()
                                            }
                                            value={invoice.totalAmount}
                                            onChange={handleSale}
                                            onFocus={(e) => e.target.select()}
                                            disabled
                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-600 dark:text-gray-400">
                                            Total Percepción
                                        </label>
                                        <input
                                            type="number"
                                            name="totalPerception"
                                            onWheel={(e) =>
                                                e.currentTarget.blur()
                                            }
                                            value={invoice.totalPerception}
                                            onChange={handleSale}
                                            onFocus={(e) => e.target.select()}
                                            disabled
                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-600 dark:text-gray-400">
                                            Total Incluido Percepción
                                        </label>
                                        <input
                                            type="number"
                                            name="totalToPay"
                                            value={invoice.totalToPay}
                                            onChange={handleSale}
                                            disabled
                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
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
                                <div className="grid sm:grid-cols-1 md:grid-cols-6 gap-4 py-4">
                                    <div className="sm:col-span-2">
                                        <label
                                            htmlFor="retentionType"
                                            className="form-label text-gray-900 dark:text-gray-200"
                                        >
                                            Retencion Tipo
                                        </label>
                                        <select
                                            name="retentionType"
                                            id="retentionType"
                                            onChange={handleSale}
                                            value={invoice.retentionType}
                                            className="form-control dark:bg-gray-800 dark:text-gray-200"
                                        >
                                            {retentionTypesData?.allRetentionTypes?.map(
                                                (
                                                    o: IRetentionType,
                                                    k: number
                                                ) => (
                                                    <option
                                                        key={k}
                                                        value={o.code}
                                                    >
                                                        {o.name}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-600 dark:text-gray-400">
                                            Base Imponible Retención
                                        </label>
                                        <input
                                            type="number"
                                            name="totalAmount"
                                            onWheel={(e) =>
                                                e.currentTarget.blur()
                                            }
                                            value={invoice.totalAmount}
                                            onChange={handleSale}
                                            onFocus={(e) => e.target.select()}
                                            disabled
                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-600 dark:text-gray-400">
                                            Total Retención
                                        </label>
                                        <input
                                            type="number"
                                            name="totalRetention"
                                            onWheel={(e) =>
                                                e.currentTarget.blur()
                                            }
                                            value={invoice.totalRetention}
                                            onChange={handleSale}
                                            onFocus={(e) => e.target.select()}
                                            disabled
                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            )}

                            {invoice?.operationType === "1001" && (
                                <>
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
                                        <div className="grid sm:grid-cols-1 md:grid-cols-6 gap-4 py-4">
                                            <div className="sm:col-span-2">
                                                <label
                                                    htmlFor="detractionType"
                                                    className="form-label text-gray-900 dark:text-gray-200"
                                                >
                                                    Tipo de detracción
                                                </label>
                                                <select
                                                    name="detractionType"
                                                    id="detractionType"
                                                    onChange={handleSale}
                                                    value={
                                                        invoice.detractionType
                                                    }
                                                    className="form-control dark:bg-gray-800 dark:text-gray-200"
                                                    required
                                                >
                                                    {detractionTypesData?.allDetractionTypes?.map(
                                                        (
                                                            o: IDetractionType,
                                                            k: number
                                                        ) => (
                                                            <option
                                                                key={k}
                                                                value={o.code}
                                                            >
                                                                {o.name}
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label
                                                    htmlFor="detractionPaymentMethod"
                                                    className="form-label text-gray-900 dark:text-gray-200"
                                                >
                                                    Medio de Pago
                                                </label>
                                                <select
                                                    name="detractionPaymentMethod"
                                                    id="detractionPaymentMethod"
                                                    onChange={handleSale}
                                                    value={
                                                        invoice.detractionPaymentMethod
                                                    }
                                                    className="form-control dark:bg-gray-800 dark:text-gray-200"
                                                    required
                                                >
                                                    {detractionPaymentMethodsData?.allDetractionPaymentMethods?.map(
                                                        (
                                                            o: IDetractionPaymentMethod,
                                                            k: number
                                                        ) => (
                                                            <option
                                                                key={k}
                                                                value={o.code}
                                                            >
                                                                {o.name}
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm text-gray-600 dark:text-gray-400">
                                                    Porcentaje detracción (%)
                                                </label>
                                                <input
                                                    type="number"
                                                    name="detractionPercentage"
                                                    onWheel={(e) =>
                                                        e.currentTarget.blur()
                                                    }
                                                    value={
                                                        invoice.detractionPercentage
                                                    }
                                                    onChange={handleSale}
                                                    onFocus={(e) =>
                                                        e.target.select()
                                                    }
                                                    className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm text-gray-600 dark:text-gray-400">
                                                    Total detracción
                                                </label>
                                                <input
                                                    type="number"
                                                    name="totalDetraction"
                                                    onWheel={(e) =>
                                                        e.currentTarget.blur()
                                                    }
                                                    value={
                                                        invoice.totalDetraction
                                                    }
                                                    onChange={handleSale}
                                                    onFocus={(e) =>
                                                        e.target.select()
                                                    }
                                                    disabled
                                                    className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default SaleTotalList;
