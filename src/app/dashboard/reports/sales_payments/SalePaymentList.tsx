import React, { useMemo } from "react";

function SalePaymentList({
    filteredSalesPaymentsData,
    setFilterObj,
    filterObj,
    salesPaymentsQuery,
    user,
}: any) {
    const salesWithPayments =
        filteredSalesPaymentsData?.allSalesPayments?.salesWithPayments || [];
    const totals = filteredSalesPaymentsData?.allSalesPayments || {};

    // Determinar qué métodos de pago tienen datos
    const paymentMethodsWithData = useMemo(() => {
        const methods = {
            totalCash: { label: "Efectivo", key: "totalCash", hasData: false },
            totalYape: { label: "Yape", key: "totalYape", hasData: false },
            totalDue: { label: "Por Pagar", key: "totalDue", hasData: false },
            totalDebitCard: {
                label: "Tarjeta Débito",
                key: "totalDebitCard",
                hasData: false,
            },
            totalCreditCard: {
                label: "Tarjeta Crédito",
                key: "totalCreditCard",
                hasData: false,
            },
            totalTransfer: {
                label: "Transf.",
                key: "totalTransfer",
                hasData: false,
            },
            totalMonue: { label: "Giro", key: "totalMonue", hasData: false },
            totalCheck: { label: "Cheque", key: "totalCheck", hasData: false },
            totalCoupon: { label: "Cupón", key: "totalCoupon", hasData: false },
            totalOther: { label: "Otros", key: "totalOther", hasData: false },
        };

        // Verificar si hay datos en los totales
        Object.keys(methods).forEach((key) => {
            if (totals[key] && totals[key] > 0) {
                methods[key as keyof typeof methods].hasData = true;
            }
        });

        // Verificar si hay datos en las ventas individuales
        salesWithPayments.forEach((sale: any) => {
            Object.keys(methods).forEach((key) => {
                if (sale[key] && sale[key] > 0) {
                    methods[key as keyof typeof methods].hasData = true;
                }
            });
        });

        return methods;
    }, [salesWithPayments, totals]);

    // Obtener solo los métodos que tienen datos
    const activePaymentMethods = useMemo(() => {
        return Object.entries(paymentMethodsWithData)
            .filter(([_, method]) => method.hasData)
            .map(([key, method]) => ({ methodKey: key, ...method }));
    }, [paymentMethodsWithData]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("es-PE", {
            style: "currency",
            currency: "PEN",
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const formatDateTime = (date: string, time: string) => {
        try {
            const dateTime = new Date(`${date}T${time}`);
            return dateTime.toLocaleString("es-PE", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return `${date} ${time}`;
        }
    };

    const getPaymentMethodBadge = (amount: number, method: string) => {
        if (amount <= 0) return null;

        const colors = {
            totalCash:
                "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
            totalDebitCard:
                "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
            totalCreditCard:
                "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
            totalTransfer:
                "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
            totalMonue:
                "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
            totalCheck:
                "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
            totalCoupon:
                "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
            totalYape:
                "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
            totalDue:
                "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
            totalOther:
                "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
        };

        return (
            <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    colors[method as keyof typeof colors] || colors.totalOther
                }`}
            >
                {formatCurrency(amount)}
            </span>
        );
    };

    const getDocumentTypeBadge = (type: string) => {
        const colors = {
            FACTURA:
                "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
            BOLETA: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
            "VENTA INTERNA":
                "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
        };

        return (
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    colors[type as keyof typeof colors] || colors["FACTURA"]
                }`}
            >
                {type}
            </span>
        );
    };

    return (
        <div className="max-h-screen overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between d gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Reporte de Pagos de Ventas
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Mostrando {salesWithPayments.length}{" "}
                                transacciones
                            </p>
                        </div>

                        {/* Totales */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-sm">
                            {activePaymentMethods.slice(0, 5).map((method) => (
                                <div
                                    key={method.methodKey}
                                    className="text-center"
                                >
                                    <div
                                        className={`font-semibold ${
                                            method.methodKey === "totalCash"
                                                ? "text-green-600 dark:text-green-400"
                                                : method.methodKey ===
                                                  "totalYape"
                                                ? "text-teal-600 dark:text-teal-400"
                                                : method.methodKey ===
                                                  "totalDue"
                                                ? "text-red-600 dark:text-red-400"
                                                : method.methodKey ===
                                                      "totalDebitCard" ||
                                                  method.methodKey ===
                                                      "totalCreditCard"
                                                ? "text-blue-600 dark:text-blue-400"
                                                : method.methodKey ===
                                                  "totalTransfer"
                                                ? "text-indigo-600 dark:text-indigo-400"
                                                : "text-gray-600 dark:text-gray-400"
                                        }`}
                                    >
                                        {formatCurrency(
                                            totals[method.methodKey] || 0
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {method.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Tipo Comprobante
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Serie
                                    <br />
                                    Correlativo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Fecha/Hora
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Total a Pagar
                                </th>
                                {activePaymentMethods.map((method) => (
                                    <th
                                        key={method.methodKey}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                                    >
                                        {method.label}
                                    </th>
                                ))}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Usuario
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {salesWithPayments.map((sale: any) => (
                                <tr
                                    key={sale.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getDocumentTypeBadge(
                                            sale.documentTypeReadable
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                            {sale.serial}-{sale.correlative}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {formatDateTime(
                                                sale.emitDate,
                                                sale.emitTime
                                            )}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="font-semibold text-lg text-gray-900 dark:text-white">
                                            {formatCurrency(
                                                Number(sale.totalAmount)
                                            )}
                                        </span>
                                    </td>
                                    {activePaymentMethods.map((method) => (
                                        <td
                                            key={method.methodKey}
                                            className="px-6 py-4 whitespace-nowrap"
                                        >
                                            {getPaymentMethodBadge(
                                                sale[method.methodKey],
                                                method.methodKey
                                            )}
                                        </td>
                                    ))}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-900 dark:text-white">
                                            {sale.user?.fullName || "DESDE API"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Empty state */}
                {(!salesWithPayments || salesWithPayments.length === 0) && (
                    <div className="text-center py-12">
                        <div className="mx-auto h-12 w-12 text-gray-400">
                            <svg
                                className="w-full h-full"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                        </div>
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                            No se encontraron transacciones
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Intenta ajustar los filtros de fecha o sucursal.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SalePaymentList;
