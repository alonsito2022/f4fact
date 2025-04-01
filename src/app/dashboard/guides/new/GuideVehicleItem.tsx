import {
    IOperationDetail,
    IProduct,
    IRelatedDocument,
    IVehicle,
} from "@/app/types";
import Delete from "@/components/icons/Delete";
import React, { ChangeEvent, useState } from "react";
interface GuideVehicleItemProps {
    index: number;
    item: IVehicle;
    onRemove: () => void;
    onChange: (index: number, field: string, value: any) => void;
}

const GuideVehicleItem: React.FC<GuideVehicleItemProps> = ({
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

        onChange(index, name, value);
    };
    return (
        <>
            <div className="md:col-span-2 lg:col-span-2">
                <label className="text-sm text-gray-700 dark:text-gray-200">
                    Transportista placa numero
                </label>
                <input
                    type="text"
                    name="licensePlate"
                    maxLength={10}
                    onFocus={(e) => e.target.select()}
                    value={item.licensePlate}
                    onChange={handleChange}
                    // autoComplete="off"
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
        </>
    );
};

export default GuideVehicleItem;
