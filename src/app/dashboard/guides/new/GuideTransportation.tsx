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
        <div className="relative bg-white dark:bg-gray-800/80 backdrop-blur rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.1)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)] overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-60" />
            <div className="p-5 sm:p-6">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-5">
                    Datos del Transportista
                </h2>
                <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-5">
                    {guide?.guideModeTransfer === "01" && (
                        <>
                            {/* Tipo de documento del transportista */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Tipo de documento del transportista
                                </label>
                                <select
                                    value={
                                        guide.transportationCompanyDocumentType
                                    }
                                    name="transportationCompanyDocumentType"
                                    onChange={handleGuide}
                                    className="w-full h-10 sm:h-11 px-3 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-600/80 bg-gray-50/50 dark:bg-gray-700/30 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200"
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
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                >
                                    Documento número{" "}
                                    <span className="text-xs text-green-500 font-normal">
                                        (Enter)
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
                                            e.preventDefault();
                                            handleSntDocument();
                                        }
                                    }}
                                    className="w-full h-10 sm:h-11 px-3 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-600/80 bg-gray-50/50 dark:bg-gray-700/30 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200"
                                    autoComplete="off"
                                />
                            </div>
                            {/* Transportista denominacion */}
                            <div className="md:col-span-2">
                                <label
                                    htmlFor="transportationCompanyNames"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
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
                                    className="w-full h-10 sm:h-11 px-3 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-600/80 bg-gray-50/50 dark:bg-gray-700/30 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200"
                                    autoComplete="off"
                                />
                            </div>
                        </>
                    )}

                    {/* Número de registro MTC (condicional) */}
                    <div className="hidden">
                        <label
                            htmlFor="transportationCompanyMtcRegistrationNumber"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
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
                            className="w-full h-10 sm:h-11 px-3 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-600/80 bg-gray-50/50 dark:bg-gray-700/30 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200"
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
                                    <fieldset className="border border-gray-200/80 dark:border-gray-600/60 p-4 rounded-xl bg-gray-50/70 dark:bg-gray-700/20">
                                        <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Datos del Vehículo Principal
                                        </legend>
                                        <div className="grid sm:grid-cols-1 md:grid-cols-6 gap-4">
                                            {/* Transportista placa numero */}
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                                                    className="w-full h-10 sm:h-11 px-3 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-600/80 bg-white dark:bg-gray-700/30 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200"
                                                />
                                            </div>
                                        </div>
                                    </fieldset>
                                    {(guide?.documentType === "09" ||
                                        guide?.documentType === "31") && (
                                        <fieldset className="border border-gray-200/80 dark:border-gray-600/60 p-4 rounded-xl bg-gray-50/70 dark:bg-gray-700/20">
                                            <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                Datos de los Vehículos Secundarios (Máximo 2)
                                            </legend>
                                            <div className="grid gap-4">
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
                                {(guide?.documentType === "09" ||
                                    guide?.documentType === "31") && (
                                    <button
                                        type="button"
                                        className="group relative inline-flex items-center justify-center gap-2 h-10 px-5 bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300 rounded-xl font-medium text-sm border-2 border-dashed border-blue-300/80 dark:border-blue-500/40 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-md active:scale-[0.98] transition-all duration-200"
                                        onClick={handleAddVehicle}
                                    >
                                        <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/25">
                                            <svg
                                                className="w-3.5 h-3.5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={2.5}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M12 4v16m8-8H4"
                                                />
                                            </svg>
                                        </span>
                                        Agregar vehículo
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default GuideTransportation;
