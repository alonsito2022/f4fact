import { IProduct } from "@/app/types";
import Add from "@/components/icons/Add";
import React, { ChangeEvent } from "react";

function QuoteSearchProduct({
    modalProduct,
    product,
    productsLoading,
    productsData,
    setProduct,
    initialStateProduct,
    modalAddDetail,
    setSaleDetail,
    initialStateSaleDetail,
}: any) {
    const handleProduct = (
        event: ChangeEvent<
            HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = event.target;

        if (name === "name" && event.target instanceof HTMLInputElement) {
            const dataList = event.target.list;
            if (dataList) {
                const normalizedValue = value.replace(/[\n\r\s]+/g, " ").trim();
                const option = Array.from(dataList.options).find((option) => {
                    const normalizedOptionValue = option.value
                        .replace(/[\n\r\s]+/g, " ")
                        .trim();
                    return (
                        normalizedValue === normalizedOptionValue ||
                        normalizedValue.startsWith(normalizedOptionValue) ||
                        normalizedOptionValue.startsWith(normalizedValue)
                    );
                });
                if (option) {
                    const selectedId = option.getAttribute("data-key");
                    setProduct({
                        ...product,
                        id: Number(selectedId),
                        name: value,
                    });

                    modalAddDetail.show();
                    // setPurchaseDetail({...purchaseDetail, id: 0});
                } else {
                    setProduct({ ...product, id: 0, name: value });
                }
            } else {
                console.log("sin datalist");
            }
        } else setProduct({ ...product, [name]: value });
    };
    return (
        <div className="p-6 border-2 border-emerald-200 dark:border-emerald-900 bg-white dark:bg-gray-900 rounded-xl shadow-lg relative group transition-all duration-300 hover:shadow-emerald-500/20 hover:shadow-2xl">
            <div className="flex items-center gap-2 mb-4 text-emerald-600 dark:text-emerald-400">
                <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
                <h3 className="font-semibold text-sm">Búsqueda de Productos</h3>
            </div>
            <div className="relative w-full">
                <input
                    type="text"
                    className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    maxLength={100}
                    value={product.name}
                    name="name"
                    onChange={handleProduct}
                    onFocus={(e) => e.target.select()}
                    autoComplete="off"
                    disabled={productsLoading}
                    placeholder="Buscar Producto..."
                    list="productNameList"
                    required
                />
                <datalist id="productNameList">
                    {productsData?.allProducts?.map(
                        (n: IProduct, index: number) => (
                            <option
                                key={index}
                                data-key={n.id}
                                value={n.name.replace(/[\n\r\s]+/g, " ").trim()}
                            />
                        )
                    )}
                </datalist>
                <button
                    type="button"
                    className="absolute inset-y-0 right-0 px-2.5 py-2 bg-blue-600 dark:bg-cyan-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                    onClick={(e) => {
                        modalProduct.show();
                        setProduct({
                            ...initialStateProduct,
                            onSaveSuccess: () => {
                                modalProduct.hide();
                                modalAddDetail.show();
                                setSaleDetail(initialStateSaleDetail);
                            },
                        });
                    }}
                >
                    <Add />
                </button>
            </div>
        </div>
    );
}

export default QuoteSearchProduct;
