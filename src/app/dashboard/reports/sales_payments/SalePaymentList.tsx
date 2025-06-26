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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Reporte de Pagos de Ventas
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Mostrando {salesWithPayments.length} transacciones
                        </p>
                    </div>

                    {/* Totales */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-sm">
                        <div className="text-center">
                            <div className="font-semibold text-green-600 dark:text-green-400">
                                {formatCurrency(totals.totalCash || 0)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Efectivo
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="font-semibold text-blue-600 dark:text-blue-400">
                                {formatCurrency(
                                    (totals.totalDebitCard || 0) +
                                        (totals.totalCreditCard || 0)
                                )}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Tarjetas
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="font-semibold text-teal-600 dark:text-teal-400">
                                {formatCurrency(totals.totalYape || 0)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Yape
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="font-semibold text-indigo-600 dark:text-indigo-400">
                                {formatCurrency(totals.totalTransfer || 0)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Transferencia
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="font-semibold text-red-600 dark:text-red-400">
                                {formatCurrency(totals.totalDue || 0)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Por Pagar
                            </div>
                        </div>
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
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Correlativo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Usuario
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Fecha/Hora
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Total a Pagar
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Efectivo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Tarjeta Débito
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Tarjeta Crédito
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Transferencia
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Giro
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Cheque
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Cupón
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Yape
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Por Pagar
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Otros
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
                                        {sale.serial}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="font-mono text-sm text-gray-900 dark:text-white">
                                        {sale.correlative}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm text-gray-900 dark:text-white">
                                        {sale.user?.fullName ||
                                            "ENVIADO DESDE API"}
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
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getPaymentMethodBadge(
                                        sale.totalCash,
                                        "totalCash"
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getPaymentMethodBadge(
                                        sale.totalDebitCard,
                                        "totalDebitCard"
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getPaymentMethodBadge(
                                        sale.totalCreditCard,
                                        "totalCreditCard"
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getPaymentMethodBadge(
                                        sale.totalTransfer,
                                        "totalTransfer"
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getPaymentMethodBadge(
                                        sale.totalMonue,
                                        "totalMonue"
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getPaymentMethodBadge(
                                        sale.totalCheck,
                                        "totalCheck"
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getPaymentMethodBadge(
                                        sale.totalCoupon,
                                        "totalCoupon"
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getPaymentMethodBadge(
                                        sale.totalYape,
                                        "totalYape"
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getPaymentMethodBadge(
                                        sale.totalDue,
                                        "totalDue"
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getPaymentMethodBadge(
                                        sale.totalOther,
                                        "totalOther"
                                    )}
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
    );
}

export default SalePaymentList;
