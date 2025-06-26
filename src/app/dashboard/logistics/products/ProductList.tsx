import { useCallback, useState } from "react";
import Edit from "@/components/icons/Edit";
import { IProduct } from "@/app/types";
import { gql, useLazyQuery } from "@apollo/client";
import Filter from "@/components/icons/Filter";
import Search from "@/components/icons/Search";

const PRODUCT_QUERY = gql`
    query ($pk: ID!) {
        productById(pk: $pk) {
            id
            name
            code
            barcode
            available
            activeType
            ean
            weightInKilograms
            typeAffectationId
            subjectPerception
            observation
            priceWithIgv1
            priceWithoutIgv1
            priceWithIgv2
            priceWithoutIgv2
            priceWithIgv3
            priceWithoutIgv3
            priceWithIgv4
            priceWithoutIgv4
            minimumUnitId
            maximumUnitId
            maximumFactor
            minimumFactor
            stock
        }
    }
`;

type ColumnName = keyof typeof initialVisibleColumns;

const initialVisibleColumns = {
    id: true,
    name: true,
    code: true,
    barcode: true,
    price3WithIgv: true,
    price3WithoutIgv: true,
    price1WithIgv: true,
    price1WithoutIgv: true,
    stock: true,
} as const;

function ProductList({
    filteredProducts,
    modalProduct,
    setProduct,
    authContext,
}: any) {
    const [visibleColumns, setVisibleColumns] = useState(initialVisibleColumns);
    const [showColumnControls, setShowColumnControls] = useState(false);
    const [availabilityFilter, setAvailabilityFilter] = useState<
        "available" | "unavailable" | "all"
    >("available");

    const toggleColumn = (columnName: ColumnName) => {
        setVisibleColumns((prev) => ({
            ...prev,
            [columnName]: !prev[columnName],
        }));
    };

    // Filtrar productos según la disponibilidad seleccionada
    const filteredProductsByAvailability = filteredProducts?.filter(
        (product: IProduct) => {
            switch (availabilityFilter) {
                case "available":
                    return product.available === true;
                case "unavailable":
                    return product.available === false;
                case "all":
                    return true;
                default:
                    return true;
            }
        }
    );

    const [
        productQuery,
        {
            loading: foundProductLoading,
            error: foundProductError,
            data: foundProductData,
        },
    ] = useLazyQuery(PRODUCT_QUERY, {
        context: authContext,
        fetchPolicy: "network-only",
    });

    const handleEditProduct = useCallback(
        async (productId: number) => {
            const { data } = await productQuery({
                variables: { pk: Number(productId) },
            });
            const productFound = data.productById;
            console.log("productFound", productFound);
            const updatedProduct = {
                ...productFound,
                code: productFound?.code ?? "",
                ean: productFound?.ean ?? "",
                barcode: productFound?.barcode ?? "",
                typeAffectationId: productFound?.typeAffectationId ?? 0,
                maximumUnitId: productFound?.maximumUnitId ?? 0,
                activeType: String(productFound?.activeType).replace("A_", ""),
                priceWithIgv1: Number(productFound?.priceWithIgv1).toFixed(2),
                priceWithoutIgv1: Number(
                    productFound?.priceWithoutIgv1
                ).toFixed(2),
                priceWithIgv3: Number(productFound?.priceWithIgv3).toFixed(2),
                priceWithoutIgv3: Number(
                    productFound?.priceWithoutIgv3
                ).toFixed(2),
                priceWithIgv4: Number(productFound?.priceWithIgv4).toFixed(2),
                priceWithoutIgv4: Number(
                    productFound?.priceWithoutIgv4
                ).toFixed(2),
            };
            setProduct(updatedProduct);
            modalProduct.show();
        },
        [productQuery, setProduct, modalProduct]
    );

    const getCellClassName = useCallback((available: boolean) => {
        return `px-6 py-4 font-medium whitespace-nowrap ${
            !available
                ? "text-red-500 line-through"
                : "text-gray-900 dark:text-white"
        }`;
    }, []);

    const getStatusBadge = (available: boolean) => {
        return (
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    available
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                }`}
            >
                <span
                    className={`w-2 h-2 rounded-full mr-1.5 ${
                        available ? "bg-green-400" : "bg-red-400"
                    }`}
                ></span>
                {available ? "Activo" : "Inactivo"}
            </span>
        );
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("es-PE", {
            style: "currency",
            currency: "PEN",
            minimumFractionDigits: 2,
        }).format(price);
    };

    if (foundProductLoading)
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                    Cargando...
                </span>
            </div>
        );

    if (foundProductError)
        return (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-200">
                    Error: {foundProductError.message}
                </p>
            </div>
        );

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            {/* Header with controls */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Lista de Productos
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Mostrando {filteredProductsByAvailability?.length}{" "}
                            productos
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() =>
                                setShowColumnControls(!showColumnControls)
                            }
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Columnas
                        </button>
                    </div>
                </div>

                {/* Availability Filter */}
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-3">
                        Filtrar por Disponibilidad:
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                name="availability"
                                value="available"
                                checked={availabilityFilter === "available"}
                                onChange={(e) =>
                                    setAvailabilityFilter(
                                        e.target.value as
                                            | "available"
                                            | "unavailable"
                                            | "all"
                                    )
                                }
                                className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-blue-700 dark:text-blue-300">
                                Disponibles
                            </span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                name="availability"
                                value="unavailable"
                                checked={availabilityFilter === "unavailable"}
                                onChange={(e) =>
                                    setAvailabilityFilter(
                                        e.target.value as
                                            | "available"
                                            | "unavailable"
                                            | "all"
                                    )
                                }
                                className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-blue-700 dark:text-blue-300">
                                No Disponibles
                            </span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                name="availability"
                                value="all"
                                checked={availabilityFilter === "all"}
                                onChange={(e) =>
                                    setAvailabilityFilter(
                                        e.target.value as
                                            | "available"
                                            | "unavailable"
                                            | "all"
                                    )
                                }
                                className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-blue-700 dark:text-blue-300">
                                Todos
                            </span>
                        </label>
                    </div>
                </div>

                {/* Stock Status Legend */}
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
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

                {/* Column controls panel */}
                {showColumnControls && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Mostrar/Ocultar Columnas:
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            <label className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    checked={visibleColumns.id}
                                    onChange={() => toggleColumn("id")}
                                    className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                    ID
                                </span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    checked={visibleColumns.name}
                                    onChange={() => toggleColumn("name")}
                                    className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                    Nombre
                                </span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    checked={visibleColumns.code}
                                    onChange={() => toggleColumn("code")}
                                    className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                    Código
                                </span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    checked={visibleColumns.barcode}
                                    onChange={() => toggleColumn("barcode")}
                                    className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                    Código de Barras
                                </span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    checked={visibleColumns.price3WithIgv}
                                    onChange={() =>
                                        toggleColumn("price3WithIgv")
                                    }
                                    className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                    P.U.V C/IGV
                                </span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    checked={visibleColumns.price3WithoutIgv}
                                    onChange={() =>
                                        toggleColumn("price3WithoutIgv")
                                    }
                                    className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                    P.U.V S/IGV
                                </span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    checked={visibleColumns.price1WithIgv}
                                    onChange={() =>
                                        toggleColumn("price1WithIgv")
                                    }
                                    className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                    P.U.C C/IGV
                                </span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    checked={visibleColumns.price1WithoutIgv}
                                    onChange={() =>
                                        toggleColumn("price1WithoutIgv")
                                    }
                                    className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                    P.U.C S/IGV
                                </span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    checked={visibleColumns.stock}
                                    onChange={() => toggleColumn("stock")}
                                    className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                    Stock
                                </span>
                            </label>
                        </div>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            {visibleColumns.id && (
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                                >
                                    ID
                                </th>
                            )}
                            {visibleColumns.name && (
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                                >
                                    Nombre del Producto
                                </th>
                            )}
                            {visibleColumns.code && (
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                                >
                                    Código
                                </th>
                            )}
                            {visibleColumns.barcode && (
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                                >
                                    Código de Barras
                                </th>
                            )}
                            {visibleColumns.price3WithIgv && (
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                                >
                                    P.U.V C/IGV
                                </th>
                            )}
                            {visibleColumns.price3WithoutIgv && (
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                                >
                                    P.U.V S/IGV
                                </th>
                            )}
                            {visibleColumns.price1WithIgv && (
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                                >
                                    P.U.C C/IGV
                                </th>
                            )}
                            {visibleColumns.price1WithoutIgv && (
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                                >
                                    P.U.C S/IGV
                                </th>
                            )}
                            {visibleColumns.stock && (
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                                >
                                    Stock
                                </th>
                            )}
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                            >
                                Estado
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                            >
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredProductsByAvailability?.map(
                            (item: IProduct) => (
                                <tr
                                    key={item.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                                >
                                    {visibleColumns.id && (
                                        <td
                                            className={getCellClassName(
                                                item.available
                                            )}
                                        >
                                            <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
                                                #{item.id}
                                            </span>
                                        </td>
                                    )}
                                    {visibleColumns.name && (
                                        <td
                                            className={getCellClassName(
                                                item.available
                                            )}
                                        >
                                            <div className="flex flex-col max-w-xs min-w-0">
                                                <span className="font-medium text-gray-900 dark:text-white break-words leading-relaxed line-clamp-2">
                                                    {item.name}
                                                </span>
                                                {item.observation && (
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 break-words leading-relaxed line-clamp-2">
                                                        {item.observation}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                    {visibleColumns.code && (
                                        <td
                                            className={getCellClassName(
                                                item.available
                                            )}
                                        >
                                            <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                                {item.code || "-"}
                                            </span>
                                        </td>
                                    )}
                                    {visibleColumns.barcode && (
                                        <td
                                            className={getCellClassName(
                                                item.available
                                            )}
                                        >
                                            <span className="font-mono text-sm">
                                                {item.barcode || "-"}
                                            </span>
                                        </td>
                                    )}
                                    {visibleColumns.price3WithIgv && (
                                        <td
                                            className={getCellClassName(
                                                item.available
                                            )}
                                        >
                                            <span className="font-semibold text-green-600 dark:text-green-400">
                                                {formatPrice(
                                                    Number(item.priceWithIgv3)
                                                )}
                                            </span>
                                        </td>
                                    )}
                                    {visibleColumns.price3WithoutIgv && (
                                        <td
                                            className={getCellClassName(
                                                item.available
                                            )}
                                        >
                                            <span className="text-gray-600 dark:text-gray-400">
                                                {formatPrice(
                                                    Number(
                                                        item.priceWithoutIgv3
                                                    )
                                                )}
                                            </span>
                                        </td>
                                    )}
                                    {visibleColumns.price1WithIgv && (
                                        <td
                                            className={getCellClassName(
                                                item.available
                                            )}
                                        >
                                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                                                {formatPrice(
                                                    Number(item.priceWithIgv1)
                                                )}
                                            </span>
                                        </td>
                                    )}
                                    {visibleColumns.price1WithoutIgv && (
                                        <td
                                            className={getCellClassName(
                                                item.available
                                            )}
                                        >
                                            <span className="text-gray-600 dark:text-gray-400">
                                                {formatPrice(
                                                    Number(
                                                        item.priceWithoutIgv1
                                                    )
                                                )}
                                            </span>
                                        </td>
                                    )}
                                    {visibleColumns.stock && (
                                        <td
                                            className={getCellClassName(
                                                item.available
                                            )}
                                        >
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    Number(item.stock) > 10
                                                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                                        : Number(item.stock) > 0
                                                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                                }`}
                                            >
                                                {item.stock} unidades
                                            </span>
                                        </td>
                                    )}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(item.available)}
                                    </td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        <button
                                            onClick={() =>
                                                handleEditProduct(item.id)
                                            }
                                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                                        >
                                            <Edit />
                                            Editar
                                        </button>
                                    </td>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>
            </div>

            {/* Empty state */}
            {(!filteredProductsByAvailability ||
                filteredProductsByAvailability.length === 0) && (
                <div className="text-center py-12">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                        <Search className="w-full h-full" />
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                        No se encontraron productos
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Intenta ajustar los filtros de búsqueda o
                        disponibilidad.
                    </p>
                </div>
            )}
        </div>
    );
}

export default ProductList;
