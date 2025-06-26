import React from "react";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from "recharts";

function MonthlySummaryList({ monthlySummaryData }: any) {
    const data = monthlySummaryData?.monthlySalesAndPurchases;

    if (!data) {
        return (
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
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                    </svg>
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    No hay datos disponibles
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    No se encontraron datos para el resumen mensual.
                </p>
            </div>
        );
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("es-PE", {
            style: "currency",
            currency: "PEN",
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const formatNumber = (number: number) => {
        return new Intl.NumberFormat("es-PE").format(number);
    };

    // Preparar datos para el gráfico de torta
    const pieChartData =
        data.currentMonthProductsSold?.map((product: any) => ({
            name: product.productName,
            quantity: product.quantitySold,
            total: product.totalSold,
            value: product.totalSold, // Para el gráfico
        })) || [];

    // Colores para el gráfico de torta
    const COLORS = [
        "#0088FE",
        "#00C49F",
        "#FFBB28",
        "#FF8042",
        "#8884D8",
        "#82CA9D",
        "#FFC658",
        "#FF6B6B",
        "#4ECDC4",
        "#45B7D1",
    ];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                    <p className="font-medium text-gray-900 dark:text-white">{`${payload[0].payload.name}`}</p>
                    <p className="text-blue-600 dark:text-blue-400">{`Cantidad: ${formatNumber(
                        payload[0].payload.quantity
                    )}`}</p>
                    <p className="text-green-600 dark:text-green-400">{`Total: ${formatCurrency(
                        payload[0].payload.total
                    )}`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="max-h-screen overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Resumen Mensual de Ventas y Compras
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Comparación del mes actual vs mes anterior
                            </p>
                        </div>
                    </div>
                </div>

                {/* Summary Tables */}
                <div className="p-6 space-y-6">
                    {/* VENTAS (MES ACTUAL) */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="p-4 border-b border-blue-200 dark:border-blue-800">
                            <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                                VENTAS (MES ACTUAL)
                            </h4>
                        </div>
                        <div className="p-4">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-blue-200 dark:border-blue-800">
                                        <th className="text-left py-2 px-4 font-medium text-blue-700 dark:text-blue-300">
                                            Tipo
                                        </th>
                                        <th className="text-right py-2 px-4 font-medium text-blue-700 dark:text-blue-300">
                                            Cantidades
                                        </th>
                                        <th className="text-right py-2 px-4 font-medium text-blue-700 dark:text-blue-300">
                                            Totales (S/)
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-blue-100 dark:border-blue-900">
                                        <td className="py-2 px-4 text-blue-800 dark:text-blue-200">
                                            Total de facturas
                                        </td>
                                        <td className="py-2 px-4 text-right font-medium text-blue-800 dark:text-blue-200">
                                            {formatNumber(
                                                data.currentMonthSales?.invoices
                                                    ?.quantity || 0
                                            )}
                                        </td>
                                        <td className="py-2 px-4 text-right font-medium text-blue-800 dark:text-blue-200">
                                            {formatCurrency(
                                                data.currentMonthSales?.invoices
                                                    ?.total || 0
                                            )}
                                        </td>
                                    </tr>
                                    <tr className="border-b border-blue-100 dark:border-blue-900">
                                        <td className="py-2 px-4 text-blue-800 dark:text-blue-200">
                                            Total de boletas
                                        </td>
                                        <td className="py-2 px-4 text-right font-medium text-blue-800 dark:text-blue-200">
                                            {formatNumber(
                                                data.currentMonthSales?.tickets
                                                    ?.quantity || 0
                                            )}
                                        </td>
                                        <td className="py-2 px-4 text-right font-medium text-blue-800 dark:text-blue-200">
                                            {formatCurrency(
                                                data.currentMonthSales?.tickets
                                                    ?.total || 0
                                            )}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 px-4 text-blue-800 dark:text-blue-200">
                                            Total de notas de salida
                                        </td>
                                        <td className="py-2 px-4 text-right font-medium text-blue-800 dark:text-blue-200">
                                            {formatNumber(
                                                data.currentMonthSales
                                                    ?.exitNotes?.quantity || 0
                                            )}
                                        </td>
                                        <td className="py-2 px-4 text-right font-medium text-blue-800 dark:text-blue-200">
                                            {formatCurrency(
                                                data.currentMonthSales
                                                    ?.exitNotes?.total || 0
                                            )}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* COMPRAS (MES ACTUAL) */}
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="p-4 border-b border-green-200 dark:border-green-800">
                            <h4 className="text-lg font-semibold text-green-900 dark:text-green-100">
                                COMPRAS (MES ACTUAL)
                            </h4>
                        </div>
                        <div className="p-4">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-green-200 dark:border-green-800">
                                        <th className="text-left py-2 px-4 font-medium text-green-700 dark:text-green-300">
                                            Tipo
                                        </th>
                                        <th className="text-right py-2 px-4 font-medium text-green-700 dark:text-green-300">
                                            Cantidades
                                        </th>
                                        <th className="text-right py-2 px-4 font-medium text-green-700 dark:text-green-300">
                                            Totales (S/)
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-green-100 dark:border-green-900">
                                        <td className="py-2 px-4 text-green-800 dark:text-green-200">
                                            Total de facturas
                                        </td>
                                        <td className="py-2 px-4 text-right font-medium text-green-800 dark:text-green-200">
                                            {formatNumber(
                                                data.currentMonthPurchases
                                                    ?.invoices?.quantity || 0
                                            )}
                                        </td>
                                        <td className="py-2 px-4 text-right font-medium text-green-800 dark:text-green-200">
                                            {formatCurrency(
                                                data.currentMonthPurchases
                                                    ?.invoices?.total || 0
                                            )}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 px-4 text-green-800 dark:text-green-200">
                                            Total de boletas
                                        </td>
                                        <td className="py-2 px-4 text-right font-medium text-green-800 dark:text-green-200">
                                            {formatNumber(
                                                data.currentMonthPurchases
                                                    ?.tickets?.quantity || 0
                                            )}
                                        </td>
                                        <td className="py-2 px-4 text-right font-medium text-green-800 dark:text-green-200">
                                            {formatCurrency(
                                                data.currentMonthPurchases
                                                    ?.tickets?.total || 0
                                            )}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* VENTAS (MES ANTERIOR) */}
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="p-4 border-b border-purple-200 dark:border-purple-800">
                            <h4 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                                VENTAS (MES ANTERIOR)
                            </h4>
                        </div>
                        <div className="p-4">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-purple-200 dark:border-purple-800">
                                        <th className="text-left py-2 px-4 font-medium text-purple-700 dark:text-purple-300">
                                            Tipo
                                        </th>
                                        <th className="text-right py-2 px-4 font-medium text-purple-700 dark:text-purple-300">
                                            Cantidades
                                        </th>
                                        <th className="text-right py-2 px-4 font-medium text-purple-700 dark:text-purple-300">
                                            Totales (S/)
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-purple-100 dark:border-purple-900">
                                        <td className="py-2 px-4 text-purple-800 dark:text-purple-200">
                                            Total de facturas
                                        </td>
                                        <td className="py-2 px-4 text-right font-medium text-purple-800 dark:text-purple-200">
                                            {formatNumber(
                                                data.lastMonthSales?.invoices
                                                    ?.quantity || 0
                                            )}
                                        </td>
                                        <td className="py-2 px-4 text-right font-medium text-purple-800 dark:text-purple-200">
                                            {formatCurrency(
                                                data.lastMonthSales?.invoices
                                                    ?.total || 0
                                            )}
                                        </td>
                                    </tr>
                                    <tr className="border-b border-purple-100 dark:border-purple-900">
                                        <td className="py-2 px-4 text-purple-800 dark:text-purple-200">
                                            Total de boletas
                                        </td>
                                        <td className="py-2 px-4 text-right font-medium text-purple-800 dark:text-purple-200">
                                            {formatNumber(
                                                data.lastMonthSales?.tickets
                                                    ?.quantity || 0
                                            )}
                                        </td>
                                        <td className="py-2 px-4 text-right font-medium text-purple-800 dark:text-purple-200">
                                            {formatCurrency(
                                                data.lastMonthSales?.tickets
                                                    ?.total || 0
                                            )}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 px-4 text-purple-800 dark:text-purple-200">
                                            Total de notas de salida
                                        </td>
                                        <td className="py-2 px-4 text-right font-medium text-purple-800 dark:text-purple-200">
                                            {formatNumber(
                                                data.lastMonthSales?.exitNotes
                                                    ?.quantity || 0
                                            )}
                                        </td>
                                        <td className="py-2 px-4 text-right font-medium text-purple-800 dark:text-purple-200">
                                            {formatCurrency(
                                                data.lastMonthSales?.exitNotes
                                                    ?.total || 0
                                            )}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Gráfico de Torta - Productos Vendidos */}
                {pieChartData.length > 0 && (
                    <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="mb-4">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Gráfico de Productos Vendidos (MES ACTUAL)
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Distribución por total vendido en soles
                            </p>
                        </div>
                        <div className="h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieChartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) =>
                                            `${name} (${(
                                                (percent || 0) * 100
                                            ).toFixed(0)}%)`
                                        }
                                        outerRadius={120}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {pieChartData.map(
                                            (entry: any, index: number) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={
                                                        COLORS[
                                                            index %
                                                                COLORS.length
                                                        ]
                                                    }
                                                />
                                            )
                                        )}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Empty state for products */}
                {(!data.currentMonthProductsSold ||
                    data.currentMonthProductsSold.length === 0) && (
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
                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                />
                            </svg>
                        </div>
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                            No hay productos vendidos
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            No se registraron ventas de productos este mes.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MonthlySummaryList;
