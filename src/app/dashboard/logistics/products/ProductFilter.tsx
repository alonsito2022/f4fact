"use client";
import { ChangeEvent } from "react";
import { gql, useQuery } from "@apollo/client";

import Add from "@/components/icons/Add";
import Filter from "@/components/icons/Filter";
import Excel from "@/components/icons/Excel";
import { ISubsidiary } from "@/app/types";

const SUBSIDIARIES_QUERY = gql`
    query {
        subsidiaries {
            id
            address
            serial
            company {
                id
                businessName
            }
        }
    }
`;

const controlClass =
    "h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:placeholder-gray-500 dark:focus:border-blue-500 dark:focus:bg-gray-700";

const labelClass =
    "mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400";

function ProductFilter({
    productFilterObj,
    setProductFilterObj,
    modalCriteria,
    searchTerm,
    setSearchTerm,
    modalProduct,
    initialStateProduct,
    setProduct,
    fetchProducts,
    authContext,
    jwtToken,
    filteredProducts,
}: any) {
    const handleInputSearchChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setSearchTerm(event.target.value);
    };

    const handleClickButton = async () => {
        fetchProducts();
    };

    const handleInputChange = (
        event: ChangeEvent<
            HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = event.target;

        if (
            name === "subsidiaryName" &&
            event.target instanceof HTMLInputElement
        ) {
            const dataList = event.target.list;
            if (dataList) {
                const option = Array.from(dataList.options).find(
                    (option) => option.value === value
                );
                if (option) {
                    const selectedId = option.getAttribute("data-key");
                    setProductFilterObj({
                        ...productFilterObj,
                        subsidiaryId: Number(selectedId),
                        subsidiaryName: value,
                    });
                } else {
                    setProductFilterObj({
                        ...productFilterObj,
                        subsidiaryId: 0,
                        subsidiaryName: value,
                    });
                }
            } else {
                console.log("sin datalist");
            }
        } else setProductFilterObj({ ...productFilterObj, [name]: value });
    };

    const {
        loading: subsidiariesLoading,
        error: subsidiariesError,
        data: subsidiariesData,
    } = useQuery(SUBSIDIARIES_QUERY, {
        context: authContext,
        skip: !jwtToken,
    });

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="relative flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-4 py-4 dark:border-gray-700 sm:px-5">
                <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-70" />
                <div className="flex items-center gap-3 pt-1">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
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
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </span>
                    <div>
                        <h2 className="text-sm font-semibold text-slate-800 dark:text-white">
                            Filtros y acciones
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-gray-400">
                            Busca en el catálogo, exporta o registra un nuevo
                            producto.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {filteredProducts && filteredProducts.length > 0 && (
                        <button
                            id="exportExcelButton"
                            type="button"
                            onClick={() => {
                                const baseUrl =
                                    process.env.NEXT_PUBLIC_BASE_API;
                                const subsidiaryId =
                                    productFilterObj.subsidiaryId;
                                const exportUrl = `${baseUrl}/logistics/export_products_by_subsidiary/${subsidiaryId}/`;
                                window.open(exportUrl, "_blank");
                            }}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition-colors hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:border-orange-800 dark:hover:bg-orange-900/20 dark:hover:text-orange-300"
                        >
                            <Excel />
                            Exportar Excel
                        </button>
                    )}
                    <button
                        id="createProductButton"
                        type="button"
                        onClick={() => {
                            modalProduct.show();
                            setProduct(initialStateProduct);
                        }}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500/40 active:scale-[0.98]"
                    >
                        <Add />
                        Crear producto
                    </button>
                </div>
            </div>

            <div className="p-4 sm:p-5">
                <div className="flex flex-wrap items-end gap-3">
                    <div className="min-w-[220px] [flex:1_1_15rem]">
                        <label
                            htmlFor="products-search"
                            className={labelClass}
                        >
                            Buscar producto
                        </label>
                        <div className="relative">
                            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </span>
                            <input
                                type="search"
                                name="searchTerm"
                                id="products-search"
                                value={searchTerm}
                                onChange={handleInputSearchChange}
                                className={`${controlClass} pl-10 pr-3`}
                                placeholder="Buscar por nombre o código"
                            />
                        </div>
                    </div>

                    {productFilterObj.isSuperuser ? (
                        <div className="min-w-[220px] [flex:0_1_18rem]">
                            <label
                                htmlFor="subsidiaryName"
                                className={labelClass}
                            >
                                Sede
                            </label>
                            <div className="relative">
                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                    <svg
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                        />
                                    </svg>
                                </span>
                                <input
                                    type="search"
                                    id="subsidiaryName"
                                    name="subsidiaryName"
                                    onChange={handleInputChange}
                                    value={productFilterObj.subsidiaryName}
                                    onFocus={(e) => e.target.select()}
                                    autoComplete="off"
                                    disabled={subsidiariesLoading}
                                    className={`${controlClass} pl-10 pr-3 disabled:cursor-not-allowed disabled:opacity-60`}
                                    list="subsidiaryList"
                                    placeholder="Buscar por sede"
                                />
                                <datalist id="subsidiaryList">
                                    {subsidiariesData?.subsidiaries?.map(
                                        (
                                            n: ISubsidiary,
                                            index: number
                                        ) => (
                                            <option
                                                key={index}
                                                data-key={n.id}
                                                value={`${n.company?.businessName} ${n.serial}`}
                                            />
                                        )
                                    )}
                                </datalist>
                            </div>
                            {subsidiariesError && (
                                <p className="mt-1.5 text-[11px] text-rose-600 dark:text-rose-400">
                                    No se pudieron cargar las sedes.
                                </p>
                            )}
                        </div>
                    ) : null}

                    <button
                        id="btn-search"
                        type="button"
                        className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500/40 active:scale-[0.98]"
                        onClick={handleClickButton}
                    >
                        <Filter className="h-3.5 w-3.5" />
                        Filtrar
                    </button>
                </div>
            </div>
        </section>
    );
}

export default ProductFilter;
