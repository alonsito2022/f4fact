import { IOperationDetail, IProduct } from "@/app/types";
import Delete from "@/components/icons/Delete";
import React, { ChangeEvent, useState } from "react";

interface GuideDetailItemProps {
    index: number;
    item: IOperationDetail;
    onRemove: () => void;
    onChange: (index: number, field: string, value: any) => void;
    products: IProduct[];
}
const GuideDetailItem: React.FC<GuideDetailItemProps> = ({
    index,
    item,
    onRemove,
    onChange,
    products,
}) => {
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        let formattedValue = value;

        if (name === "quantity") {
            const [integerPart, decimalPart] = value.split(".");
            formattedValue = decimalPart
                ? `${integerPart.slice(0, 6)}.${decimalPart.slice(0, 4)}`
                : integerPart.slice(0, 6);
        }
        if (name === "productName" && e.target instanceof HTMLInputElement) {
            formattedValue = value.replace(/[\n\r\s]+/g, " ").trim();
        }
        onChange(index, name, formattedValue);
    };

    return (
        <>
            <div className="grid sm:grid-cols-1 md:grid-cols-6 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Producto - Servicio
                    </label>
                    <input
                        type="search"
                        name="productName"
                        maxLength={100}
                        onFocus={(e) => e.target.select()}
                        value={item.productName}
                        onChange={handleChange}
                        list="productList"
                        autoComplete="off"
                        className="w-full h-10 sm:h-11 px-3 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-600/80 bg-white dark:bg-gray-700/30 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200"
                    />
                    <datalist id="productList">
                        {products?.map((n: IProduct, index: number) => (
                            <option
                                key={index}
                                data-key={n.id}
                                value={`${n.code ? n.code + " " : ""}${n.name
                                    .replace(/[\n\r\s]+/g, " ")
                                    .trim()} ${n.minimumUnitName}`.trim()}
                            />
                        ))}
                    </datalist>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Detalle adicional
                    </label>
                    <input
                        type="text"
                        name="description"
                        maxLength={300}
                        onFocus={(e) => e.target.select()}
                        value={item.description}
                        onChange={handleChange}
                        autoComplete="off"
                        className="w-full h-10 sm:h-11 px-3 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-600/80 bg-white dark:bg-gray-700/30 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Cantidad
                    </label>
                    <input
                        type="number"
                        onWheel={(e) => e.currentTarget.blur()}
                        onFocus={(e) => e.target.select()}
                        name="quantity"
                        value={item.quantity}
                        onChange={handleChange}
                        autoComplete="off"
                        className="w-full h-10 sm:h-11 px-3 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-600/80 bg-white dark:bg-gray-700/30 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200"
                    />
                </div>
                <div className="flex items-end justify-center pb-1">
                    <button
                        type="button"
                        onClick={onRemove}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Eliminar ítem"
                    >
                        <Delete />
                    </button>
                </div>
            </div>
        </>
    );
};

export default GuideDetailItem;
