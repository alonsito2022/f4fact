"use client";
import { ChangeEvent, FormEvent, useState, useEffect, useMemo } from "react";
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

    if (subsidiariesLoading) return <p>Loading...</p>;
    if (subsidiariesError) return <p>Error: {subsidiariesError.message}</p>;

    return (
        <div className="grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4 xl:flex xl:flex-wrap">
            <input
                type="search"
                name="searchTerm"
                id="products-search"
                value={searchTerm}
                onChange={handleInputSearchChange}
                className="filter-form-control w-full justify-self-start p-2 border border-gray-300 rounded-md dark:border-gray-700"
                placeholder="Buscar por nombre o código"
            />

            {productFilterObj.isSuperuser ? (
                <>
                    <input
                        type="search"
                        name="subsidiaryName"
                        onChange={handleInputChange}
                        value={productFilterObj.subsidiaryName}
                        onFocus={(e) => e.target.select()}
                        autoComplete="off"
                        disabled={subsidiariesLoading}
                        className="filter-form-control w-full justify-self-start p-2 border border-gray-300 rounded-md dark:border-gray-700"
                        list="subsidiaryList"
                        placeholder="Buscar por sede"
                    />
                    <datalist id="subsidiaryList">
                        {subsidiariesData?.subsidiaries?.map(
                            (n: ISubsidiary, index: number) => (
                                <option
                                    key={index}
                                    data-key={n.id}
                                    value={`${n.company?.businessName} ${n.serial}`}
                                />
                            )
                        )}
                    </datalist>
                </>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 col-span-full lg:col-span-3 xl:col-span-5 mt-4 xl:flex xl:flex-wrap">
                <button
                    id="btn-search"
                    type="button"
                    className="btn-blue px-5 py-3 flex items-center justify-center gap-2 w-full bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    onClick={handleClickButton}
                >
                    <Filter />
                    Filtrar
                </button>
                <button
                    id="createProductButton"
                    type="button"
                    onClick={(e) => {
                        modalProduct.show();
                        setProduct(initialStateProduct);
                    }}
                    className="btn-green px-5 py-3 flex items-center justify-center gap-2 w-full bg-green-500 text-white rounded-md hover:bg-green-600 m-0"
                >
                    <Add />
                    Crear producto
                </button>
                {filteredProducts && filteredProducts.length > 0 && (
                    <button
                        id="exportExcelButton"
                        type="button"
                        onClick={() => {
                            const baseUrl = process.env.NEXT_PUBLIC_BASE_API;
                            const subsidiaryId = productFilterObj.subsidiaryId;
                            const exportUrl = `${baseUrl}/logistics/export_products_by_subsidiary/${subsidiaryId}/`;
                            window.open(exportUrl, "_blank");
                        }}
                        className="btn-orange px-5 py-3 flex items-center justify-center gap-2 w-full bg-orange-500 text-white rounded-md hover:bg-orange-600 m-0"
                    >
                        <Excel />
                        Exportar Excel
                    </button>
                )}
            </div>
        </div>
    );
}

export default ProductFilter;
