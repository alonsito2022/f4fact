import { IOperationDetail, IProduct, IRelatedDocument } from "@/app/types";
import Delete from "@/components/icons/Delete";
import React, { ChangeEvent, useState } from "react";

interface GuideDocumentItemProps {
    index: number;
    item: IRelatedDocument;
    onRemove: () => void;
    onChange: (index: number, field: string, value: any) => void;
}

const GuideDocumentItem: React.FC<GuideDocumentItemProps> = ({
    index,
    item,
    onRemove,
    onChange,
}) => {
    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        let formattedValue = value;

        if (name === "correlative") {
            formattedValue = value.replace(/[^0-9]/g, "").slice(0, 6);
        }

        onChange(index, name, formattedValue);
    };
    return (
        <>
            <div className="grid sm:grid-cols-1 md:grid-cols-6 gap-4">
                <div className="md:col-span-2">
                    <label className="text-sm text-gray-700 dark:text-gray-200">
                        Serie
                    </label>
                    <input
                        type="text"
                        name="serial"
                        maxLength={4}
                        onFocus={(e) => e.target.select()}
                        value={item.serial}
                        onChange={handleChange}
                        autoComplete="off"
                        className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="text-sm text-gray-700 dark:text-gray-200">
                        Número
                    </label>
                    <input
                        type="number"
                        onWheel={(e) => e.currentTarget.blur()}
                        onFocus={(e) => e.target.select()}
                        name="correlative"
                        value={item.correlative}
                        onChange={handleChange}
                        autoComplete="off"
                        className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="text-sm text-gray-700 dark:text-gray-200">
                        Tipo documento
                    </label>
                    <select
                        value={item.documentType}
                        name="documentType"
                        onChange={handleChange}
                        className="text-lg w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value={"01"}>FACTURA</option>
                        <option value={"03"}>BOLETA DE VENTA</option>
                        <option value={"07"}>
                            NOTA DE CRÉDITO ELECTRÓNICA
                        </option>
                        <option value={"09"}>GUÍA DE REMISIÓN REMITENTE</option>
                        <option value={"31"}>
                            GUÍA DE REMISIÓN TRANSPORTISTA
                        </option>
                    </select>
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

export default GuideDocumentItem;
