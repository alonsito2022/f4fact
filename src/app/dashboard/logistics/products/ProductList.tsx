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
            retailQuantityThreshold
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

const columnOptions: { key: ColumnName; label: string }[] = [
    { key: "id", label: "ID" },
    { key: "name", label: "Nombre" },
    { key: "code", label: "Código" },
    { key: "barcode", label: "Código de barras" },
    { key: "price3WithIgv", label: "P.U.V C/IGV" },
    { key: "price3WithoutIgv", label: "P.U.V S/IGV" },
    { key: "price1WithIgv", label: "P.U.C C/IGV" },
    { key: "price1WithoutIgv", label: "P.U.C S/IGV" },
    { key: "stock", label: "Stock" },
];

const roundedPrice = (value: unknown) =>
    Number(Number(value) || 0).toFixed(2);

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
                priceWithIgv1: roundedPrice(productFound?.priceWithIgv1),
                priceWithoutIgv1: roundedPrice(productFound?.priceWithoutIgv1),
                priceWithIgv2: roundedPrice(productFound?.priceWithIgv2),
                priceWithoutIgv2: roundedPrice(productFound?.priceWithoutIgv2),
                priceWithIgv3: roundedPrice(productFound?.priceWithIgv3),
                priceWithoutIgv3: roundedPrice(productFound?.priceWithoutIgv3),
                priceWithIgv4: roundedPrice(productFound?.priceWithIgv4),
                priceWithoutIgv4: roundedPrice(productFound?.priceWithoutIgv4),
            };
            setProduct(updatedProduct);
            modalProduct.show();
        },
        [productQuery, setProduct, modalProduct]
    );

    const getTextClass = useCallback((available: boolean) => {
        return available
            ? "text-slate-700 dark:text-gray-200"
            : "text-slate-400 line-through dark:text-gray-500";
    }, []);

    const getStatusBadge = (available: boolean) => {
        return (
            <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    available
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-800"
                        : "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:ring-rose-800"
                }`}
            >
                <span
                    className={`h-1.5 w-1.5 rounded-full ${
                        available ? "bg-emerald-500" : "bg-rose-500"
                    }`}
                />
                {available ? "Activo" : "Inactivo"}
            </span>
        );
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("es-PE", {
            style: "currency",
            currency: "PEN",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(Number(price) || 0);
    };

    const getStockBadge = (stock: number) => {
        const value = Number(stock) || 0;
        const variant =
            value > 10
                ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-800"
                : value > 0
                ? "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-800"
                : "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:ring-rose-800";
        return (
            <span
                className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${variant}`}
            >
                {value} und.
            </span>
        );
    };

    if (foundProductLoading)
        return (
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-16 text-sm text-slate-500 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                Cargando producto...
            </div>
        );

    if (foundProductError)
        return (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">
                Error: {foundProductError.message}
            </div>
        );

    const headClass =
        "px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400";
    const cellClass = "px-4 py-3.5 align-middle";

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            {/* Header with controls */}
            <div className="border-b border-slate-100 px-4 py-4 dark:border-gray-700 sm:px-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
                            <svg
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                                />
                            </svg>
                        </span>
                        <div>
                            <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
                                Lista de productos
                            </h3>
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-gray-400">
                                Mostrando{" "}
                                <span className="font-semibold text-slate-700 dark:text-gray-200">
                                    {filteredProductsByAvailability?.length ?? 0}
                                </span>{" "}
                                de {filteredProducts?.length ?? 0} productos
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowColumnControls(!showColumnControls)}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    >
                        <Filter className="h-3.5 w-3.5" />
                        Columnas
                        <svg
                            className={`h-4 w-4 text-slate-400 transition-transform ${
                                showColumnControls ? "rotate-180" : ""
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </button>
                </div>

                {/* Availability Filter */}
                <div className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-gray-600 dark:bg-gray-700/30 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="mr-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                            Disponibilidad
                        </span>
                        {[
                            {
                                value: "available" as const,
                                label: "Disponibles",
                                dot: "bg-emerald-500",
                            },
                            {
                                value: "unavailable" as const,
                                label: "No disponibles",
                                dot: "bg-rose-500",
                            },
                            {
                                value: "all" as const,
                                label: "Todos",
                                dot: "bg-slate-400",
                            },
                        ].map((option) => {
                            const active = availabilityFilter === option.value;
                            return (
                                <label
                                    key={option.value}
                                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                                        active
                                            ? "border-blue-500 bg-white text-blue-700 shadow-sm dark:border-blue-500 dark:bg-gray-800 dark:text-blue-300"
                                            : "border-transparent text-slate-500 hover:bg-white hover:text-slate-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="availability"
                                        value={option.value}
                                        checked={active}
                                        onChange={(e) =>
                                            setAvailabilityFilter(
                                                e.target.value as
                                                    | "available"
                                                    | "unavailable"
                                                    | "all"
                                            )
                                        }
                                        className="sr-only"
                                    />
                                    <span
                                        className={`h-1.5 w-1.5 rounded-full ${option.dot}`}
                                    />
                                    {option.label}
                                </label>
                            );
                        })}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-gray-400">
                        <span className="font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                            Stock
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Alto (&gt;10)
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            Bajo (1-10)
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            Sin stock
                        </span>
                    </div>
                </div>

                {/* Column controls panel */}
                {showColumnControls && (
                    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-gray-600 dark:bg-gray-700/30">
                        <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                            Mostrar u ocultar columnas
                        </p>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                            {columnOptions.map((column) => (
                                <label
                                    key={column.key}
                                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-slate-600 transition-colors hover:bg-white dark:text-gray-300 dark:hover:bg-gray-600"
                                >
                                    <input
                                        type="checkbox"
                                        checked={visibleColumns[column.key]}
                                        onChange={() =>
                                            toggleColumn(column.key)
                                        }
                                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/30 dark:border-gray-500 dark:bg-gray-700"
                                    />
                                    {column.label}
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {filteredProductsByAvailability &&
            filteredProductsByAvailability.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100 dark:divide-gray-700">
                        <thead className="bg-slate-50/80 dark:bg-gray-900/40">
                            <tr>
                                {visibleColumns.id && (
                                    <th
                                        scope="col"
                                        className={`${headClass} text-left`}
                                    >
                                        ID
                                    </th>
                                )}
                                {visibleColumns.name && (
                                    <th
                                        scope="col"
                                        className={`${headClass} text-left`}
                                    >
                                        Nombre del producto
                                    </th>
                                )}
                                {visibleColumns.code && (
                                    <th
                                        scope="col"
                                        className={`${headClass} text-left`}
                                    >
                                        Código
                                    </th>
                                )}
                                {visibleColumns.barcode && (
                                    <th
                                        scope="col"
                                        className={`${headClass} text-left`}
                                    >
                                        Código de barras
                                    </th>
                                )}
                                {visibleColumns.price3WithIgv && (
                                    <th
                                        scope="col"
                                        className={`${headClass} text-right`}
                                    >
                                        P.U.V C/IGV
                                    </th>
                                )}
                                {visibleColumns.price3WithoutIgv && (
                                    <th
                                        scope="col"
                                        className={`${headClass} text-right`}
                                    >
                                        P.U.V S/IGV
                                    </th>
                                )}
                                {visibleColumns.price1WithIgv && (
                                    <th
                                        scope="col"
                                        className={`${headClass} text-right`}
                                    >
                                        P.U.C C/IGV
                                    </th>
                                )}
                                {visibleColumns.price1WithoutIgv && (
                                    <th
                                        scope="col"
                                        className={`${headClass} text-right`}
                                    >
                                        P.U.C S/IGV
                                    </th>
                                )}
                                {visibleColumns.stock && (
                                    <th
                                        scope="col"
                                        className={`${headClass} text-center`}
                                    >
                                        Stock
                                    </th>
                                )}
                                <th
                                    scope="col"
                                    className={`${headClass} text-center`}
                                >
                                    Estado
                                </th>
                                <th
                                    scope="col"
                                    className={`${headClass} text-right`}
                                >
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white dark:divide-gray-700 dark:bg-gray-800">
                            {filteredProductsByAvailability.map(
                                (item: IProduct) => (
                                    <tr
                                        key={item.id}
                                        className="transition-colors hover:bg-slate-50/80 dark:hover:bg-gray-700/40"
                                    >
                                        {visibleColumns.id && (
                                            <td className={cellClass}>
                                                <span className="font-mono text-xs text-slate-400">
                                                    #{item.id}
                                                </span>
                                            </td>
                                        )}
                                        {visibleColumns.name && (
                                            <td
                                                className={`${cellClass} max-w-md`}
                                            >
                                                <div className="flex max-w-xs flex-col">
                                                    <span
                                                        className={`text-sm font-medium ${getTextClass(
                                                            item.available
                                                        )}`}
                                                    >
                                                        {item.name}
                                                    </span>
                                                    {item.observation && (
                                                        <span className="mt-0.5 line-clamp-2 text-xs text-slate-500 dark:text-gray-400">
                                                            {item.observation}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                        {visibleColumns.code && (
                                            <td className={cellClass}>
                                                <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600 dark:bg-gray-700 dark:text-gray-300">
                                                    {item.code || "-"}
                                                </span>
                                            </td>
                                        )}
                                        {visibleColumns.barcode && (
                                            <td className={cellClass}>
                                                <span className="font-mono text-xs text-slate-500 dark:text-gray-400">
                                                    {item.barcode || "-"}
                                                </span>
                                            </td>
                                        )}
                                        {visibleColumns.price3WithIgv && (
                                            <td
                                                className={`${cellClass} text-right`}
                                            >
                                                <span className="text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                                                    {formatPrice(
                                                        Number(
                                                            item.priceWithIgv3
                                                        )
                                                    )}
                                                </span>
                                            </td>
                                        )}
                                        {visibleColumns.price3WithoutIgv && (
                                            <td
                                                className={`${cellClass} text-right`}
                                            >
                                                <span className="text-sm tabular-nums text-slate-600 dark:text-gray-400">
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
                                                className={`${cellClass} text-right`}
                                            >
                                                <span className="text-sm font-semibold tabular-nums text-blue-600 dark:text-blue-400">
                                                    {formatPrice(
                                                        Number(
                                                            item.priceWithIgv1
                                                        )
                                                    )}
                                                </span>
                                            </td>
                                        )}
                                        {visibleColumns.price1WithoutIgv && (
                                            <td
                                                className={`${cellClass} text-right`}
                                            >
                                                <span className="text-sm tabular-nums text-slate-600 dark:text-gray-400">
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
                                                className={`${cellClass} text-center`}
                                            >
                                                {getStockBadge(item.stock)}
                                            </td>
                                        )}
                                        <td
                                            className={`${cellClass} text-center`}
                                        >
                                            {getStatusBadge(item.available)}
                                        </td>
                                        <td
                                            className={`${cellClass} text-right`}
                                        >
                                            <button
                                                onClick={() =>
                                                    handleEditProduct(item.id)
                                                }
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/40"
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
            ) : (
                /* Empty state */
                <div className="px-6 py-16 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-gray-700 dark:text-gray-500">
                        <Search className="h-5 w-5" />
                    </div>
                    <h3 className="mt-3 text-sm font-semibold text-slate-800 dark:text-white">
                        No se encontraron productos
                    </h3>
                    <p className="mx-auto mt-1 max-w-lg text-sm text-slate-500 dark:text-gray-400">
                        Intenta ajustar los filtros de búsqueda o
                        disponibilidad.
                    </p>
                </div>
            )}
        </section>
    );
}

export default ProductList;
