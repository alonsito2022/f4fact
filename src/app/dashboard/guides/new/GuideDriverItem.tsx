import {
    IDocumentType,
    IOperationDetail,
    IPerson,
    IProduct,
    IRelatedDocument,
    IVehicle,
} from "@/app/types";
import Delete from "@/components/icons/Delete";
import { gql, useMutation } from "@apollo/client";
import React, { ChangeEvent, useState } from "react";
import { toast } from "react-toastify";

interface GuideDriverItemProps {
    index: number;
    item: IPerson;
    onRemove: () => void;
    onChange: (index: number, field: string, value: any) => void;
    documentTypes: IDocumentType[];
    authContext: any;
}
const SNT_PERSON_MUTATION = gql`
    mutation ($document: String!) {
        sntPerson(document: $document) {
            success
            message
            person {
                sntDocument
                sntNames
                sntAddress
                sntDepartment
                sntProvince
                sntDistrict
            }
        }
    }
`;
const GuideDriverItem: React.FC<GuideDriverItemProps> = ({
    index,
    item,
    onRemove,
    onChange,
    documentTypes,
    authContext,
}) => {
    const [
        sntPersonMutation,
        {
            loading: foundSntPersonLoading,
            error: foundSntPersonError,
            data: foundSntPersonData,
        },
    ] = useMutation(SNT_PERSON_MUTATION, {
        context: authContext,
    });
    const handleSntDocument = async () => {
        if (item?.documentType === "6" && item?.documentNumber?.length !== 11) {
            toast("Por favor ingrese un número RUC valido.", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
            });
            return;
        }
        if (item.documentType === "1" && item?.documentNumber?.length !== 8) {
            toast("Por favor ingrese un número DNI valido.", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
            });
            return;
        }
        const { data, errors } = await sntPersonMutation({
            variables: { document: item.documentNumber },
        });
        if (errors) {
            toast(errors.toString(), {
                hideProgressBar: true,
                autoClose: 2000,
                type: "error",
            });
        } else {
            onChange(index, "names", data.sntPerson.person.sntNames);

            toast(data.sntPerson.message, {
                hideProgressBar: true,
                autoClose: 2000,
                type: "success",
            });
        }
    };
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo de documento
                </label>
                <select
                    value={item.documentType}
                    name="documentType"
                    onChange={handleChange}
                    className="w-full h-10 sm:h-11 px-3 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-600/80 bg-white dark:bg-gray-700/30 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Documento número{" "}
                    <span className="text-xs text-green-500 font-normal">(Enter)</span>
                </label>
                <input
                    type="text"
                    name="documentNumber"
                    maxLength={
                        item?.documentType === "1"
                            ? 8
                            : item?.documentType === "6"
                            ? 11
                            : 25
                    }
                    value={item.documentNumber}
                    onChange={handleChange}
                    onFocus={(e) => e.target.select()}
                    onKeyDown={(e) => {
                        if (
                            e.key === "Enter" &&
                            (item?.documentType === "1" ||
                                item?.documentType === "6")
                        ) {
                            e.preventDefault();
                            handleSntDocument();
                        }
                    }}
                    className="w-full h-10 sm:h-11 px-3 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-600/80 bg-white dark:bg-gray-700/30 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200"
                />
            </div>
            {/* Nombres y Apellidos del conductor */}
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombres y Apellidos del conductor
                </label>
                <input
                    type="text"
                    name="names"
                    maxLength={200}
                    value={item.names}
                    onChange={handleChange}
                    onFocus={(e) => e.target.select()}
                    className="w-full h-10 sm:h-11 px-3 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-600/80 bg-white dark:bg-gray-700/30 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200"
                />
            </div>
            {/* Licencia de conducir */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Licencia de conducir
                </label>
                <input
                    type="text"
                    name="driverLicense"
                    maxLength={12}
                    value={item.driverLicense}
                    onChange={handleChange}
                    onFocus={(e) => e.target.select()}
                    className="w-full h-10 sm:h-11 px-3 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-600/80 bg-white dark:bg-gray-700/30 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200"
                />
            </div>

            <div className="flex items-end justify-center pb-1">
                <button
                    type="button"
                    onClick={onRemove}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Eliminar conductor"
                >
                    <Delete />
                </button>
            </div>
        </>
    );
};

export default GuideDriverItem;
