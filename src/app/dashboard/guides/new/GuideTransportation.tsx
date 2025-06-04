import React from "react";
import GuideVehicleItem from "./GuideVehicleItem";
import { IVehicle } from "@/app/types";
import { toast } from "react-toastify";
import { gql, useMutation } from "@apollo/client";

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

function GuideTransportation({
    guide,
    setGuide,
    authContext,
    handleGuide,
}: any) {
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
        if (
            guide.transportationCompanyDocumentType === "6" &&
            guide.transportationCompanyDocumentNumber.length !== 11
        ) {
            toast("Por favor ingrese un número RUC valido.", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
            });
            return;
        }
        const { data, errors } = await sntPersonMutation({
            variables: { document: guide.transportationCompanyDocumentNumber },
        });
        if (errors) {
            toast(errors.toString(), {
                hideProgressBar: true,
                autoClose: 2000,
                type: "error",
            });
        } else {
            setGuide({
                ...guide,
                transportationCompanyNames: data.sntPerson.person.sntNames,
            });
            toast(data.sntPerson.message, {
                hideProgressBar: true,
                autoClose: 2000,
                type: "success",
            });
        }
    };
    const handleRemoveVehicle = (index: number) => {
        if (window.confirm("¿Estás seguro de eliminar este vehiculo?")) {
            setGuide({
                ...guide,
                othersVehicles: guide.othersVehicles.filter(
                    (_: IVehicle, i: number) => i !== index
                ),
            });
        }
    };

    const handleVehicleChange = (index: number, field: string, value: any) => {
        const newItems = [...guide.othersVehicles];
        newItems[index] = { ...newItems[index], [field]: value };
        setGuide({ ...guide, othersVehicles: newItems });
    };

    const handleAddVehicle = () => {
        if (guide.othersVehicles.length < 2) {
            setGuide({
                ...guide,
                othersVehicles: [
                    ...guide.othersVehicles,
                    {
                        index: guide.othersVehicles.length,
                        licensePlate: "",
                        id: 0,
                    },
                ],
            });
        } else {
            toast("Máximo 2 vehículos.", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
            });
        }
    };

    return (
        <>
            {/* DATOS DEL TRANSPORTISTA */}
            <fieldset className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <legend className="px-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
                    DATOS DEL TRANSPORTISTA
                </legend>
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-5 ">
                    {guide?.guideModeTransfer === "01" && (
                        <>
                            {/* Tipo de documento del transportista */}
                            <div>
                                <label className="text-sm text-gray-700 dark:text-gray-200">
                                    Tipo de documento del transportista
                                </label>
                                <select
                                    value={
                                        guide.transportationCompanyDocumentType
                                    }
                                    name="transportationCompanyDocumentType"
                                    onChange={handleGuide}
                                    className="text-lg w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value={"6"}>
                                        RUC - REGISTRO ÚNICO DE CONTRIBUYENTE
                                    </option>
                                </select>
                            </div>
                            {/* Documento número */}
                            <div>
                                <label
                                    htmlFor="transportationCompanyDocumentNumber"
                                    className="text-sm font-medium text-gray-900 dark:text-gray-200"
                                >
                                    Documento número{" "}
                                    <span className="text-green-500">
                                        (dar enter)
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    name="transportationCompanyDocumentNumber"
                                    id="transportationCompanyDocumentNumber"
                                    maxLength={11}
                                    value={
                                        guide.transportationCompanyDocumentNumber
                                    }
                                    onChange={handleGuide}
                                    onFocus={(e) => e.target.select()}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault(); // Evita que el formulario se envíe si está dentro de un formulario
                                            handleSntDocument(); // Llamada a la función de consulta
                                        }
                                    }}
                                    className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    autoComplete="off"
                                />
                            </div>
                            {/* Transportista denominacion */}
                            <div className="md:col-span-2">
                                <label
                                    htmlFor="transportationCompanyNames"
                                    className="text-sm font-medium text-gray-900 dark:text-gray-200"
                                >
                                    Transportista denominacion
                                </label>
                                <input
                                    type="text"
                                    name="transportationCompanyNames"
                                    id="transportationCompanyNames"
                                    maxLength={150}
                                    value={guide.transportationCompanyNames}
                                    onChange={handleGuide}
                                    onFocus={(e) => e.target.select()}
                                    className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    autoComplete="off"
                                />
                            </div>
                        </>
                    )}

                    {/* Número de registro MTC (condicional) */}
                    <div className="hidden">
                        <label
                            htmlFor="transportationCompanyMtcRegistrationNumber"
                            className="text-sm font-medium text-gray-900 dark:text-gray-200"
                        >
                            Número de registro MTC (condicional)
                        </label>
                        <input
                            type="text"
                            name="transportationCompanyMtcRegistrationNumber"
                            id="transportationCompanyMtcRegistrationNumber"
                            maxLength={10}
                            value={
                                guide.transportationCompanyMtcRegistrationNumber
                            }
                            onChange={handleGuide}
                            onFocus={(e) => e.target.select()}
                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            autoComplete="off"
                        />
                    </div>
                    {guide?.guideModeTransfer === "02" && (
                        <>
                            {/* Botón Agregar Vehiculo */}
                            <div className="md:col-span-3 lg:col-span-5">
                                <div
                                    id="other_vehicles"
                                    className="w-full grid gap-4 mb-4"
                                >
                                    <fieldset className="border border-gray-300 dark:border-gray-600 p-4 rounded-lg shadow-sm bg-white dark:bg-gray-800">
                                        <legend className="px-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
                                            Datos del Vehículo Principal
                                        </legend>
                                        <div className="grid sm:grid-cols-1 md:grid-cols-6 gap-4">
                                            {/* Transportista placa numero */}
                                            <div className="md:col-span-2">
                                                <label className="text-sm text-gray-700 dark:text-gray-200">
                                                    Transportista placa numero
                                                </label>
                                                <input
                                                    type="text"
                                                    name="mainVehicleLicensePlate"
                                                    maxLength={7}
                                                    onFocus={(e) =>
                                                        e.target.select()
                                                    }
                                                    value={
                                                        guide.mainVehicleLicensePlate
                                                    }
                                                    onChange={handleGuide}
                                                    autoComplete="on"
                                                    className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </fieldset>
                                    {guide?.documentType === "09" && (
                                        <fieldset className="border border-gray-300 dark:border-gray-600 p-4 rounded-lg shadow-sm bg-white dark:bg-gray-800">
                                            <legend className="px-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
                                                Datos de los Vehículos
                                                Secundarios (Máximo 2 vehículos)
                                            </legend>
                                            <div className="grid  gap-4">
                                                {guide.othersVehicles.map(
                                                    (
                                                        item: IVehicle,
                                                        index: number
                                                    ) => (
                                                        <div
                                                            key={index}
                                                            className="grid md:grid-cols-6 lg:grid-cols-6 gap-4"
                                                        >
                                                            <GuideVehicleItem
                                                                index={index}
                                                                item={item}
                                                                onRemove={() =>
                                                                    handleRemoveVehicle(
                                                                        index
                                                                    )
                                                                }
                                                                onChange={
                                                                    handleVehicleChange
                                                                }
                                                            />
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </fieldset>
                                    )}
                                </div>
                                {guide?.documentType === "09" && (
                                    <button
                                        type="button"
                                        className="px-5 py-2 bg-blue-600 dark:bg-cyan-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
                                        onClick={handleAddVehicle}
                                    >
                                        AGREGAR VEHÍCULO
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </fieldset>
        </>
    );
}

export default GuideTransportation;
