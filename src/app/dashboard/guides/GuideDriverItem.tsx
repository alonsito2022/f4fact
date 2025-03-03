import {
    IDocumentType,
    IOperationDetail,
    IPerson,
    IProduct,
    IRelatedDocument,
    IVehicle,
} from "@/app/types";
import Delete from "@/components/icons/Delete";
import React, { ChangeEvent, useState } from "react";

interface GuideDriverItemProps {
    index: number;
    item: IPerson;
    onRemove: () => void;
    onChange: (index: number, field: string, value: any) => void;
    documentTypes: IDocumentType[];
}

const GuideDriverItem: React.FC<GuideDriverItemProps> = ({
    index,
    item,
    onRemove,
    onChange,
    documentTypes,
}) => {
    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;

        onChange(index, name, value);
    };
    return (
        <>
            <div>
                <label className="text-sm text-gray-700 dark:text-gray-200">
                    Tipo de documento
                </label>
                <select
                    value={item.mainDriverDocumentType}
                    name="mainDriverDocumentType"
                    onChange={handleChange}
                    className="text-lg w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                    {documentTypes?.map((o: IDocumentType, k: number) => (
                        <option key={k} value={o.code}>
                            {o.name}
                        </option>
                    ))}
                </select>
            </div>
            {/* Documento número */}
            <div>
                <label
                    htmlFor="mainDriverDocumentNumber"
                    className="text-sm font-medium text-gray-900 dark:text-gray-200"
                >
                    Documento número
                </label>
                <input
                    type="text"
                    name="mainDriverDocumentNumber"
                    id="mainDriverDocumentNumber"
                    maxLength={
                        item?.mainDriverDocumentType === "1"
                            ? 8
                            : item?.mainDriverDocumentType === "6"
                            ? 11
                            : 25
                    }
                    value={item.mainDriverDocumentNumber}
                    onChange={handleChange}
                    onFocus={(e) => e.target.select()}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    autoComplete="off"
                />
            </div>
            {/* Nombres y Apellidos del conductor */}
            <div>
                <label
                    htmlFor="mainDriverNames"
                    className="text-sm font-medium text-gray-900 dark:text-gray-200"
                >
                    Nombres y Apellidos del conductor
                </label>
                <input
                    type="text"
                    name="mainDriverNames"
                    id="mainDriverNames"
                    maxLength={200}
                    value={item.mainDriverNames}
                    onChange={handleChange}
                    onFocus={(e) => e.target.select()}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    autoComplete="off"
                />
            </div>
            {/* Licencia de conducir */}
            <div>
                <label
                    htmlFor="mainDriverDriverLicense"
                    className="text-sm font-medium text-gray-900 dark:text-gray-200"
                >
                    Licencia de conducir
                </label>
                <input
                    type="text"
                    name="mainDriverDriverLicense"
                    id="mainDriverDriverLicense"
                    maxLength={200}
                    value={item.mainDriverDriverLicense}
                    onChange={handleChange}
                    onFocus={(e) => e.target.select()}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    autoComplete="off"
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
        </>
    );
};

export default GuideDriverItem;
