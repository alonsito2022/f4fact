import React from "react";

function KardexProductList({ filteredKardexProductsData }: any) {
    const kardexProducts =
        filteredKardexProductsData?.productStockMovement || [];

    const formatNumber = (number: number) => {
        return new Intl.NumberFormat("es-PE").format(number);
    };

    const getStockStatusBadge = (stock: number) => {
        if (stock > 10) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    <span className="w-2 h-2 rounded-full bg-green-400 mr-1.5"></span>
                    {formatNumber(stock)} unidades
                </span>
            );
        } else if (stock > 0) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                    <span className="w-2 h-2 rounded-full bg-yellow-400 mr-1.5"></span>
                    {formatNumber(stock)} unidades
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                    <span className="w-2 h-2 rounded-full bg-red-400 mr-1.5"></span>
                    Sin stock
                </span>
            );
        }
    };

    const getMovementBadge = (quantity: number, type: "bought" | "sold") => {
        if (quantity === 0) {
            return (
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                    -
                </span>
            );
        }

        const colors =
            type === "bought"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";

        const icon = type === "bought" ? "↗" : "↘";

        return (
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors}`}
            >
                <span className="mr-1">{icon}</span>
                {formatNumber(quantity)} unidades
            </span>
        );
    };

    return (
        <div className="max-h-screen overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Reporte de Movimientos de Inventario
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Control de stock, compras y ventas por período
                            </p>
                        </div>

                        {/* Summary Stats */}
                        <div className="flex flex-wrap gap-4 text-sm">
                            <div className="text-center">
                                <div className="font-semibold text-blue-600 dark:text-blue-400">
                                    {formatNumber(
                                        kardexProducts.reduce(
                                            (sum: number, product: any) =>
                                                sum + (product.bought || 0),
                                            0
                                        )
                                    )}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Total Comprado
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="font-semibold text-green-600 dark:text-green-400">
                                    {formatNumber(
                                        kardexProducts.reduce(
                                            (sum: number, product: any) =>
                                                sum + (product.sold || 0),
                                            0
                                        )
                                    )}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Total Vendido
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="font-semibold text-purple-600 dark:text-purple-400">
                                    {formatNumber(
                                        kardexProducts.reduce(
                                            (sum: number, product: any) =>
                                                sum + (product.stock || 0),
                                            0
                                        )
                                    )}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Stock Total
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stock Status Legend */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <div className="flex flex-wrap items-center gap-6 text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                            Estado del Stock:
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-green-400"></span>
                            <span className="text-gray-600 dark:text-gray-400">
                                Stock Alto (&gt;10 unidades)
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                            <span className="text-gray-600 dark:text-gray-400">
                                Stock Bajo (1-10 unidades)
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-red-400"></span>
                            <span className="text-gray-600 dark:text-gray-400">
                                Sin Stock (0 unidades)
                            </span>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    #
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Código
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Nombre del Producto
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Stock Actual
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Comprado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Vendido
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {kardexProducts.map(
                                (product: any, index: number) => (
                                    <tr
                                        key={product.productId}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {index + 1}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                                {product.productCode || "-"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col max-w-xs min-w-0">
                                                <span className="font-medium text-gray-900 dark:text-white break-words leading-relaxed line-clamp-2">
                                                    {product.productName}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    ID: {product.productId}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStockStatusBadge(product.stock)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getMovementBadge(
                                                product.bought,
                                                "bought"
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getMovementBadge(
                                                product.sold,
                                                "sold"
                                            )}
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Empty state */}
                {(!kardexProducts || kardexProducts.length === 0) && (
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
                            No se encontraron productos
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

export default KardexProductList;
