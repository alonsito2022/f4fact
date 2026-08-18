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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Transportista placa numero
                </label>
                <input
                    type="text"
                    name="licensePlate"
                    maxLength={7}
                    onFocus={(e) => e.target.select()}
                    value={item.licensePlate}
                    onChange={handleChange}
                    className="w-full h-10 sm:h-11 px-3 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-600/80 bg-white dark:bg-gray-700/30 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200"
                />
            </div>

            <div className="flex items-end justify-center pb-1">
                <button
                    type="button"
                    onClick={onRemove}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Eliminar vehículo"
                >
                    <Delete />
                </button>
            </div>
        </>
    );
};

export default GuideVehicleItem;
