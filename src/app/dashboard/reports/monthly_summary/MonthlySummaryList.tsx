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
                    {/* VENTAS - Lado a lado */}
                    <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* VENTAS (MES ACTUAL) */}
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-700 shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="p-6 border-b border-blue-200 dark:border-blue-700 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                        <svg
                                            className="w-5 h-5 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                            />
                                        </svg>
                                    </div>
                                    <h4 className="text-xl font-bold text-white">
                                        VENTAS (MES ACTUAL)
                                    </h4>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                            <span className="font-medium text-blue-800 dark:text-blue-200">
                                                Facturas
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                                                {formatNumber(
                                                    data.currentMonthSales
                                                        ?.invoices?.quantity ||
                                                        0
                                                )}
                                            </div>
                                            <div className="text-sm text-blue-600 dark:text-blue-300">
                                                {formatCurrency(
                                                    data.currentMonthSales
                                                        ?.invoices?.total || 0
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                            <span className="font-medium text-blue-800 dark:text-blue-200">
                                                Boletas
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                                                {formatNumber(
                                                    data.currentMonthSales
                                                        ?.tickets?.quantity || 0
                                                )}
                                            </div>
                                            <div className="text-sm text-blue-600 dark:text-blue-300">
                                                {formatCurrency(
                                                    data.currentMonthSales
                                                        ?.tickets?.total || 0
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                            <span className="font-medium text-blue-800 dark:text-blue-200">
                                                Notas de Salida
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                                                {formatNumber(
                                                    data.currentMonthSales
                                                        ?.exitNotes?.quantity ||
                                                        0
                                                )}
                                            </div>
                                            <div className="text-sm text-blue-600 dark:text-blue-300">
                                                {formatCurrency(
                                                    data.currentMonthSales
                                                        ?.exitNotes?.total || 0
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* VENTAS (MES ANTERIOR) */}
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-700 shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="p-6 border-b border-purple-200 dark:border-purple-700 bg-gradient-to-r from-purple-500 to-purple-600 rounded-t-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                        <svg
                                            className="w-5 h-5 text-white"
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
                                    <h4 className="text-xl font-bold text-white">
                                        VENTAS (MES ANTERIOR)
                                    </h4>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-purple-100 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                            <span className="font-medium text-purple-800 dark:text-purple-200">
                                                Facturas
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-purple-900 dark:text-purple-100">
                                                {formatNumber(
                                                    data.lastMonthSales
                                                        ?.invoices?.quantity ||
                                                        0
                                                )}
                                            </div>
                                            <div className="text-sm text-purple-600 dark:text-purple-300">
                                                {formatCurrency(
                                                    data.lastMonthSales
                                                        ?.invoices?.total || 0
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-purple-100 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                            <span className="font-medium text-purple-800 dark:text-purple-200">
                                                Boletas
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-purple-900 dark:text-purple-100">
                                                {formatNumber(
                                                    data.lastMonthSales?.tickets
                                                        ?.quantity || 0
                                                )}
                                            </div>
                                            <div className="text-sm text-purple-600 dark:text-purple-300">
                                                {formatCurrency(
                                                    data.lastMonthSales?.tickets
                                                        ?.total || 0
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-purple-100 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                            <span className="font-medium text-purple-800 dark:text-purple-200">
                                                Notas de Salida
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-purple-900 dark:text-purple-100">
                                                {formatNumber(
                                                    data.lastMonthSales
                                                        ?.exitNotes?.quantity ||
                                                        0
                                                )}
                                            </div>
                                            <div className="text-sm text-purple-600 dark:text-purple-300">
                                                {formatCurrency(
                                                    data.lastMonthSales
                                                        ?.exitNotes?.total || 0
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* COMPRAS (MES ACTUAL) */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-700 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="p-6 border-b border-green-200 dark:border-green-700 bg-gradient-to-r from-green-500 to-green-600 rounded-t-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                    <svg
                                        className="w-5 h-5 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                        />
                                    </svg>
                                </div>
                                <h4 className="text-xl font-bold text-white">
                                    COMPRAS (MES ACTUAL)
                                </h4>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-green-100 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                        <span className="font-medium text-green-800 dark:text-green-200">
                                            Facturas
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-green-900 dark:text-green-100">
                                            {formatNumber(
                                                data.currentMonthPurchases
                                                    ?.invoices?.quantity || 0
                                            )}
                                        </div>
                                        <div className="text-sm text-green-600 dark:text-green-300">
                                            {formatCurrency(
                                                data.currentMonthPurchases
                                                    ?.invoices?.total || 0
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-green-100 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span className="font-medium text-green-800 dark:text-green-200">
                                            Boletas
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-green-900 dark:text-green-100">
                                            {formatNumber(
                                                data.currentMonthPurchases
                                                    ?.tickets?.quantity || 0
                                            )}
                                        </div>
                                        <div className="text-sm text-green-600 dark:text-green-300">
                                            {formatCurrency(
                                                data.currentMonthPurchases
                                                    ?.tickets?.total || 0
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
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
                                        innerRadius={60}
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
