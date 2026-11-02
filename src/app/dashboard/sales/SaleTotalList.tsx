import {
    IDetractionPaymentMethod,
    IDetractionType,
    IOperation,
    IPerceptionType,
    IRetentionType,
} from "@/app/types";
import { loadGetInitialProps } from "next/dist/shared/lib/utils";
import React, { useEffect, useState } from "react";

function SaleTotalList({
    invoice,
    setSale,
    handleSale,
    perceptionTypesData,
    retentionTypesData,
    detractionTypesData,
    detractionPaymentMethodsData,
}: any) {
    // Estados locales para los inputs de descuento global
    const [localDiscountPercentage, setLocalDiscountPercentage] =
        React.useState(invoice.discountPercentageGlobal || "");
    const [localDiscountGlobal, setLocalDiscountGlobal] = React.useState(
        invoice.discountGlobal || ""
    );
    // "net"   → el usuario ingresa sobre el valor neto (sin IGV) — comportamiento SUNAT
    // "gross" → el usuario ingresa sobre el precio final (con IGV incluido)
    const [discountMode, setDiscountMode] = React.useState<"net" | "gross">("net");

    // Convierte el monto ingresado a valor neto según el modo activo.
    // Se trabaja con precisión completa (sin redondear aquí) para evitar
    // que el centavo se pierda en calculateTotal.
    const toNetDiscount = (rawValue: number): number => {
        if (discountMode === "gross") {
            const igvFactor = 1 + (Number(invoice?.igvType) || 18) * 0.01;
            // Devolvemos la división exacta; SaleDetailList redondeará al final
            return rawValue / igvFactor;
        }
        return rawValue;
    };

    // Sincronizar estados locales cuando cambie el invoice
    React.useEffect(() => {
        setLocalDiscountPercentage(invoice.discountPercentageGlobal || "");
        setLocalDiscountGlobal(invoice.discountGlobal || "");
    }, [invoice.discountPercentageGlobal, invoice.discountGlobal]);

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
        if (invoice?.currencyType === "USD") return;
        if (invoice?.detractionPercentage) {
            let detractionPercentage = Number(invoice?.detractionPercentage);
            // Redondear al entero más cercano usando Math.round
            let totalDetraction = (
                Number(invoice?.totalAmount) *
                detractionPercentage *
                0.01
            ).toFixed(2);
            // let totalToPay = Number(invoice?.totalAmount) - totalDetraction;
            setSale((prevSale: IOperation) => ({
                ...prevSale,
                totalDetraction: totalDetraction,
                // totalToPay: totalToPay.toFixed(2),
            }));
        } else if (invoice?.totalDetraction && invoice?.totalAmount) {
            // Calcular el porcentaje cuando cambia totalDetraction
            let calculatedPercentage =
                (Number(invoice.totalDetraction) /
                    Number(invoice.totalAmount)) *
                100;
            // let totalToPay =
            //     Number(invoice?.totalAmount) - invoice?.totalDetraction;
            setSale((prevSale: IOperation) => ({
                ...prevSale,
                detractionPercentage: calculatedPercentage.toFixed(3),
                // totalToPay: totalToPay.toFixed(2),
            }));
        }
    }, [
        invoice?.detractionPercentage,
        invoice?.totalAmount,
        invoice?.totalDetraction,
        invoice?.currencyType,
    ]);
    useEffect(() => {
        if (invoice?.currencyType !== "USD") return;
        if (
            !invoice?.hasRetention &&
            !invoice?.hasPerception &&
            !invoice?.hasDetraction
        ) {
            return;
        }
        const total = Number(invoice?.totalAmount) || 0;
        const exchangeRate = Number(invoice?.saleExchangeRate) || 0;
        let net = total;
        const patch: Record<string, string> = {};
        if (invoice?.hasRetention) {
            const rate =
                Number(invoice?.retentionType) === 1
                    ? 0.03
                    : Number(invoice?.retentionType) === 2
                    ? 0.06
                    : 0;
            const amount = total * rate;
            net -= amount;
            patch.totalRetention = amount.toFixed(2);
            patch.retentionPercentage = (rate * 100).toFixed(3);
        }
        if (invoice?.hasPerception) {
            const rate =
                Number(invoice?.perceptionType) === 1
                    ? 0.02
                    : Number(invoice?.perceptionType) === 2
                    ? 0.01
                    : Number(invoice?.perceptionType) === 3
                    ? 0.005
                    : 0;
            const amount = total * rate;
            net += amount;
            patch.totalPerception = amount.toFixed(2);
            patch.perceptionPercentage = (rate * 100).toFixed(3);
        }
        if (
            invoice?.hasDetraction &&
            Number(invoice?.detractionPercentage) > 0 &&
            exchangeRate > 0
        ) {
            const detractionPen = Math.round(
                (total * exchangeRate * Number(invoice.detractionPercentage)) /
                    100,
            );
            net -= detractionPen / exchangeRate;
            patch.totalDetraction = detractionPen.toFixed(2);
        }
        patch.totalToPay = net.toFixed(2);
        setSale((prevSale: IOperation) => ({
            ...prevSale,
            ...patch,
        }));
    }, [
        invoice?.currencyType,
        invoice?.totalAmount,
        invoice?.saleExchangeRate,
        invoice?.hasRetention,
        invoice?.retentionType,
        invoice?.hasPerception,
        invoice?.perceptionType,
        invoice?.hasDetraction,
        invoice?.detractionPercentage,
    ]);

    const optionLabelClass =
        "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300";
    const optionControlClass =
        "block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:disabled:bg-gray-900/60 dark:disabled:text-gray-400";
    const showDetraction = invoice?.operationType === "1001";

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
                        <div className="col-span-4">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={localDiscountPercentage}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        // Permitir valores vacíos y números
                                        if (
                                            value === "" ||
                                            /^\d*\.?\d*$/.test(value)
                                        ) {
                                            setLocalDiscountPercentage(value);
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            const value =
                                                Number(
                                                    localDiscountPercentage
                                                ) || 0;

                                            setSale((prevSale: any) => ({
                                                ...prevSale,
                                                discountPercentageGlobal: value,
                                                discountGlobal: 0, // Limpiar el monto directo para evitar conflictos
                                                discountGlobalWithIgv: 0,
                                            }));

                                            setLocalDiscountGlobal("0");
                                        }
                                    }}
                                    onFocus={(e) => e.target.select()}
                                    placeholder="0.00"
                                    className="flex-1 rounded-full text-right font-medium bg-white dark:bg-gray-700 text-black-800 dark:text-white border border-gray-300 dark:border-gray-600 py-1 px-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 dark:hover:border-blue-500 cursor-text transition-all duration-200"
                                />
                                <button
                                    onClick={() => {
                                        const value =
                                            Number(localDiscountPercentage) ||
                                            0;

                                        setSale((prevSale: any) => ({
                                            ...prevSale,
                                            discountPercentageGlobal: value,
                                            discountGlobal: 0, // Limpiar el monto directo para evitar conflictos
                                            discountGlobalWithIgv: 0,
                                        }));

                                        // Actualizar también el estado local del descuento global
                                        setLocalDiscountGlobal("0");
                                    }}
                                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                >
                                    ✓
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-4"></div>
                        <div className="col-span-4 text-right text-gray-600 dark:text-gray-400 group hover:bg-gray-50 dark:hover:bg-gray-700 py-1 px-2 transition-colors">
                            <div className="flex items-center justify-end gap-2">
                                <span>
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
                                </span>
                                {/* Toggle neto / con IGV */}
                                <button
                                    type="button"
                                    title={
                                        discountMode === "net"
                                            ? "Modo actual: valor neto (sin IGV). Click para ingresar con IGV incluido"
                                            : "Modo actual: precio final (con IGV). Click para ingresar valor neto"
                                    }
                                    onClick={() =>
                                        setDiscountMode((m) =>
                                            m === "net" ? "gross" : "net"
                                        )
                                    }
                                    className={`text-xs px-1.5 py-0.5 rounded font-semibold border transition-colors ${
                                        discountMode === "gross"
                                            ? "bg-amber-500 text-white border-amber-600 hover:bg-amber-600"
                                            : "bg-gray-200 text-gray-600 border-gray-300 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500"
                                    }`}
                                >
                                    {discountMode === "gross" ? "+IGV" : "neto"}
                                </button>
                            </div>
                        </div>
                        <div className="col-span-4">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={localDiscountGlobal}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (
                                            value === "" ||
                                            /^\d*\.?\d*$/.test(value)
                                        ) {
                                            setLocalDiscountGlobal(value);
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            const raw = Number(localDiscountGlobal) || 0;
                                            const netValue = toNetDiscount(raw);
                                            setSale((prevSale: any) => ({
                                                ...prevSale,
                                                discountGlobal: netValue,
                                                // Monto con IGV ingresado: permite calcular el IGV por diferencia
                                                discountGlobalWithIgv: discountMode === "gross" ? raw : 0,
                                                discountPercentageGlobal: 0,
                                            }));
                                            setLocalDiscountPercentage("0");
                                        }
                                    }}
                                    onFocus={(e) => e.target.select()}
                                    placeholder="0.00"
                                    className={`flex-1 rounded-full text-right font-medium bg-white dark:bg-gray-700 text-black-800 dark:text-white border py-1 px-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 dark:hover:border-blue-500 cursor-text transition-all duration-200 ${
                                        discountMode === "gross"
                                            ? "border-amber-400 dark:border-amber-500"
                                            : "border-gray-300 dark:border-gray-600"
                                    }`}
                                />
                                <button
                                    onClick={() => {
                                        const raw = Number(localDiscountGlobal) || 0;
                                        const netValue = toNetDiscount(raw);
                                        setSale((prevSale: any) => ({
                                            ...prevSale,
                                            discountGlobal: netValue,
                                            // Monto con IGV ingresado: permite calcular el IGV por diferencia
                                            discountGlobalWithIgv: discountMode === "gross" ? raw : 0,
                                            discountPercentageGlobal: 0,
                                        }));
                                        setLocalDiscountPercentage("0");
                                    }}
                                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                >
                                    ✓
                                </button>
                            </div>
                            {/* Indicador visual cuando modo gross está activo */}
                            {discountMode === "gross" && Number(localDiscountGlobal) > 0 && (
                                <p className="text-xs text-amber-600 dark:text-amber-400 text-right mt-0.5">
                                    Neto: {toNetDiscount(Number(localDiscountGlobal)).toFixed(2)}
                                </p>
                            )}
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
                            Anticipo (-){" "}
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
                            {invoice.totalAnticipation}
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

            {!["07", "48"].includes(invoice.documentType) && (
                <fieldset className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <legend className="px-2 text-[13px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Opciones adicionales
                    </legend>

                    <div
                        className={`grid grid-cols-1 gap-3 ${
                            showDetraction ? "sm:grid-cols-3" : "sm:grid-cols-2"
                        }`}
                    >
                        <label
                            className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 transition-colors ${
                                invoice.hasPerception
                                    ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500/30 dark:border-blue-400 dark:bg-blue-500/10"
                                    : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white dark:border-gray-600 dark:bg-gray-900/30 dark:hover:border-gray-500"
                            }`}
                        >
                            <input
                                type="checkbox"
                                name="hasPerception"
                                checked={invoice.hasPerception}
                                onChange={handleSale}
                                className="h-4 w-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-800"
                            />
                            <span className="min-w-0">
                                <span className="block text-sm font-semibold text-gray-800 dark:text-gray-100">
                                    Percepción
                                </span>
                                <span className="block text-xs text-gray-500 dark:text-gray-400">
                                    {invoice.hasPerception
                                        ? "Activada"
                                        : "Sin aplicar"}
                                </span>
                            </span>
                        </label>

                        <label
                            className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 transition-colors ${
                                invoice.hasRetention
                                    ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500/30 dark:border-blue-400 dark:bg-blue-500/10"
                                    : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white dark:border-gray-600 dark:bg-gray-900/30 dark:hover:border-gray-500"
                            }`}
                        >
                            <input
                                type="checkbox"
                                name="hasRetention"
                                checked={invoice.hasRetention}
                                onChange={handleSale}
                                className="h-4 w-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-800"
                            />
                            <span className="min-w-0">
                                <span className="block text-sm font-semibold text-gray-800 dark:text-gray-100">
                                    Retención
                                </span>
                                <span className="block text-xs text-gray-500 dark:text-gray-400">
                                    {invoice.hasRetention
                                        ? "Activada"
                                        : "Sin aplicar"}
                                </span>
                            </span>
                        </label>

                        {showDetraction && (
                            <label
                                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 transition-colors ${
                                    invoice.hasDetraction
                                        ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500/30 dark:border-blue-400 dark:bg-blue-500/10"
                                        : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white dark:border-gray-600 dark:bg-gray-900/30 dark:hover:border-gray-500"
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    name="hasDetraction"
                                    checked={invoice.hasDetraction}
                                    onChange={handleSale}
                                    className="h-4 w-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-800"
                                />
                                <span className="min-w-0">
                                    <span className="block text-sm font-semibold text-gray-800 dark:text-gray-100">
                                        Detracción
                                    </span>
                                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                                        {invoice.hasDetraction
                                            ? "Activada"
                                            : "Sin aplicar"}
                                    </span>
                                </span>
                            </label>
                        )}
                    </div>

                    {invoice?.hasPerception && (
                        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/30">
                            <h4 className="mb-4 text-sm font-semibold text-gray-800 dark:text-gray-100">
                                Datos de percepción
                            </h4>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label
                                        htmlFor="perceptionType"
                                        className={optionLabelClass}
                                    >
                                        Tipo de percepción
                                    </label>
                                    <select
                                        name="perceptionType"
                                        id="perceptionType"
                                        onChange={handleSale}
                                        value={invoice.perceptionType}
                                        className={optionControlClass}
                                    >
                                        {perceptionTypesData?.allPerceptionTypes?.map(
                                            (
                                                o: IPerceptionType,
                                                k: number
                                            ) => (
                                                <option key={k} value={o.code}>
                                                    {o.name}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <div>
                                        <label className={optionLabelClass}>
                                            Base imponible
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
                                            className={optionControlClass}
                                        />
                                    </div>
                                    <div>
                                        <label className={optionLabelClass}>
                                            Total percepción
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
                                            className={optionControlClass}
                                        />
                                    </div>
                                    <div>
                                        <label className={optionLabelClass}>
                                            Total incluido
                                        </label>
                                        <input
                                            type="number"
                                            name="totalToPay"
                                            value={invoice.totalToPay}
                                            onChange={handleSale}
                                            disabled
                                            className={optionControlClass}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {invoice?.hasRetention && (
                        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/30">
                            <h4 className="mb-4 text-sm font-semibold text-gray-800 dark:text-gray-100">
                                Datos de retención
                            </h4>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label
                                        htmlFor="retentionType"
                                        className={optionLabelClass}
                                    >
                                        Tipo de retención
                                    </label>
                                    <select
                                        name="retentionType"
                                        id="retentionType"
                                        onChange={handleSale}
                                        value={invoice.retentionType}
                                        className={optionControlClass}
                                    >
                                        {retentionTypesData?.allRetentionTypes?.map(
                                            (o: IRetentionType, k: number) => (
                                                <option key={k} value={o.code}>
                                                    {o.name}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className={optionLabelClass}>
                                            Base imponible
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
                                            className={optionControlClass}
                                        />
                                    </div>
                                    <div>
                                        <label className={optionLabelClass}>
                                            Total retención
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
                                            className={optionControlClass}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {showDetraction && invoice?.hasDetraction && (
                        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/30">
                            <h4 className="mb-4 text-sm font-semibold text-gray-800 dark:text-gray-100">
                                Datos de detracción
                            </h4>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="detractionType"
                                        className={optionLabelClass}
                                    >
                                        Tipo de detracción
                                    </label>
                                    <select
                                        name="detractionType"
                                        id="detractionType"
                                        onChange={handleSale}
                                        value={invoice.detractionType}
                                        className={optionControlClass}
                                        required
                                    >
                                        {detractionTypesData?.allDetractionTypes?.map(
                                            (
                                                o: IDetractionType,
                                                k: number
                                            ) => (
                                                <option key={k} value={o.code}>
                                                    {o.name}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>
                                <div>
                                    <label
                                        htmlFor="detractionPaymentMethod"
                                        className={optionLabelClass}
                                    >
                                        Medio de pago
                                    </label>
                                    <select
                                        name="detractionPaymentMethod"
                                        id="detractionPaymentMethod"
                                        onChange={handleSale}
                                        value={invoice.detractionPaymentMethod}
                                        className={optionControlClass}
                                        required
                                    >
                                        {detractionPaymentMethodsData?.allDetractionPaymentMethods?.map(
                                            (
                                                o: IDetractionPaymentMethod,
                                                k: number
                                            ) => (
                                                <option key={k} value={o.code}>
                                                    {o.name}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>
                                <div>
                                    <label
                                        htmlFor="detractionPercentage"
                                        className={optionLabelClass}
                                    >
                                        Porcentaje (%)
                                    </label>
                                    <input
                                        type="number"
                                        id="detractionPercentage"
                                        name="detractionPercentage"
                                        onWheel={(e) => e.currentTarget.blur()}
                                        value={invoice.detractionPercentage}
                                        onChange={handleSale}
                                        onFocus={(e) => e.target.select()}
                                        className={optionControlClass}
                                    />
                                </div>
                                <div>
                                    <label className={optionLabelClass}>
                                        {invoice.currencyType === "USD"
                                            ? "Total detracción (S/)"
                                            : "Total detracción"}
                                    </label>
                                    <input
                                        type="number"
                                        name="totalDetraction"
                                        onWheel={(e) => e.currentTarget.blur()}
                                        value={invoice.totalDetraction}
                                        onChange={handleSale}
                                        onFocus={(e) => e.target.select()}
                                        disabled
                                        className={optionControlClass}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </fieldset>
            )}
        </>
    );
}

export default SaleTotalList;
