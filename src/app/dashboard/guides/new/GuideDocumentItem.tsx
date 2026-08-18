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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                        className="w-full h-10 sm:h-11 px-3 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-600/80 bg-white dark:bg-gray-700/30 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                        className="w-full h-10 sm:h-11 px-3 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-600/80 bg-white dark:bg-gray-700/30 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tipo documento
                    </label>
                    <select
                        value={item.documentType}
                        name="documentType"
                        onChange={handleChange}
                        className="w-full h-10 sm:h-11 px-3 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-600/80 bg-white dark:bg-gray-700/30 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200"
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
                <div className="flex items-end justify-center pb-1">
                    <button
                        type="button"
                        onClick={onRemove}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Eliminar documento"
                    >
                        <Delete />
                    </button>
                </div>
            </div>
        </>
    );
};

export default GuideDocumentItem;
