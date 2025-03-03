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
            formattedValue = value.replace(/[^0-9]/g, "").slice(0, 6);
        }

        onChange(index, name, formattedValue);
    };

    return (
        <>
            <div className="grid sm:grid-cols-1 md:grid-cols-6 gap-4">
                <div className="md:col-span-2">
                    <label className="text-sm text-gray-700 dark:text-gray-200">
                        Producto - Servicio
                    </label>
                    <input
                        type="text"
                        name="productName"
                        maxLength={100}
                        onFocus={(e) => e.target.select()}
                        value={item.productName}
                        onChange={handleChange}
                        list="productList"
                        autoComplete="off"
                        className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                    <datalist id="productList">
                        {products?.map((n: IProduct, index: number) => (
                            <option
                                key={index}
                                data-key={n.id}
                                value={`${n.code ? n.code + " " : ""}${
                                    n.name
                                } ${n.minimumUnitName}`}
                            />
                        ))}
                    </datalist>
                </div>
                <div className="md:col-span-2">
                    <label className="text-sm text-gray-700 dark:text-gray-200">
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
                        className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div className="">
                    <label className="text-sm text-gray-700 dark:text-gray-200">
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
                        className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div className="flex items-center justify-center">
                    <button
                        type="button"
                        onClick={onRemove}
                        className="text-red-600 hover:text-red-800 text-sm px-2 py-1"
                    >
                        <Delete />
                    </button>
                </div>
            </div>
        </>
    );
};

export default GuideDetailItem;
