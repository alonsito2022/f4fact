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
                <label className="text-sm text-gray-700 dark:text-gray-200">
                    Tipo de documento
                </label>
                <select
                    value={item.documentType}
                    name="documentType"
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
                <label className="text-sm font-medium text-gray-900 dark:text-gray-200">
                    Documento número{" "}
                    <span className="text-green-500">(dar enter)</span>
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
                            e.preventDefault(); // Evita que el formulario se envíe si está dentro de un formulario
                            handleSntDocument(); // Llamada a la función de consulta
                        }
                    }}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    // autoComplete="off"
                />
            </div>
            {/* Nombres y Apellidos del conductor */}
            <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-200">
                    Nombres y Apellidos del conductor
                </label>
                <input
                    type="text"
                    name="names"
                    maxLength={200}
                    value={item.names}
                    onChange={handleChange}
                    onFocus={(e) => e.target.select()}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    // autoComplete="off"
                />
            </div>
            {/* Licencia de conducir */}
            <div>
                <label className="text-sm font-medium text-gray-900 dark:text-gray-200">
                    Licencia de conducir
                </label>
                <input
                    type="text"
                    name="driverLicense"
                    maxLength={25}
                    value={item.driverLicense}
                    onChange={handleChange}
                    onFocus={(e) => e.target.select()}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    // autoComplete="off"
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
