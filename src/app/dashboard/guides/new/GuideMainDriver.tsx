import React from "react";
import GuideDriverItem from "./GuideDriverItem";
import { IDocumentType, IPerson } from "@/app/types";
import { gql, useMutation, useQuery } from "@apollo/client";
import { toast } from "react-toastify";
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
                sntDriverLicense
            }
        }
    }
`;
const DOCUMENT_TYPE_QUERY = gql`
    query {
        allDocumentTypes {
            code
            name
        }
    }
`;

function GuideMainDriver({
    guide,
    setGuide,
    handleGuide,
    authContext,
    auth,
}: any) {
    const {
        loading: documentTypesLoading,
        error: documentTypesError,
        data: documentTypesData,
    } = useQuery(DOCUMENT_TYPE_QUERY, {
        context: authContext,
        skip: !auth?.jwtToken,
    });
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
            guide.mainDriverDocumentType === "6" &&
            guide.mainDriverDocumentNumber.length !== 11
        ) {
            toast("Por favor ingrese un número RUC valido.", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
            });
            return;
        }
        if (
            guide.mainDriverDocumentType === "1" &&
            guide.mainDriverDocumentNumber.length !== 8
        ) {
            toast("Por favor ingrese un número DNI valido.", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
            });
            return;
        }
        const { data, errors } = await sntPersonMutation({
            variables: { document: guide.mainDriverDocumentNumber },
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
                mainDriverNames: data.sntPerson.person.sntNames,
                mainDriverDriverLicense: data.sntPerson.person.sntDriverLicense,
            });
            toast(data.sntPerson.message, {
                hideProgressBar: true,
                autoClose: 2000,
                type: "success",
            });
        }
    };
    const handleAddDriver = () => {
        if (guide.othersDrivers.length < 2) {
            setGuide({
                ...guide,
                othersDrivers: [
                    ...guide.othersDrivers,
                    {
                        index: guide.othersDrivers.length,
                        documentType: "1",
                        documentNumber: "",
                        names: "",
                        driverLicense: "",
                    },
                ],
            });
        } else {
            toast("Máximo 2 conductores.", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
            });
        }
    };

    const handleRemoveDriver = (index: number) => {
        if (window.confirm("¿Estás seguro de eliminar este conductor?")) {
            setGuide({
                ...guide,
                othersDrivers: guide.othersDrivers.filter(
                    (_: IPerson, i: number) => i !== index
                ),
            });
        }
    };
    const handleDriverChange = (index: number, field: string, value: any) => {
        const newItems = [...guide.othersDrivers];
        newItems[index] = { ...newItems[index], [field]: value };
        setGuide({ ...guide, othersDrivers: newItems });
    };

    return (
        <>
            <fieldset className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <legend className="px-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
                    DATOS DEL CONDUCTOR
                </legend>
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-5 ">
                    {/* Botón Agregar Vehiculo */}
                    <div className="md:col-span-3 lg:col-span-5">
                        <div
                            id="other_vehicles"
                            className="w-full grid gap-4 mb-4"
                        >
                            <fieldset className="border border-gray-300 dark:border-gray-600 p-4 rounded-lg shadow-sm bg-white dark:bg-gray-800">
                                <legend className="px-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
                                    Datos del Conductor Principal
                                </legend>
                                <div className="grid sm:grid-cols-1 md:grid-cols-6 gap-4">
                                    {/* Tipo de documento */}
                                    <div>
                                        <label className="text-sm text-gray-700 dark:text-gray-200">
                                            Tipo de documento
                                        </label>
                                        <select
                                            value={guide.mainDriverDocumentType}
                                            name="mainDriverDocumentType"
                                            onChange={handleGuide}
                                            className="text-lg w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {documentTypesData?.allDocumentTypes?.map(
                                                (
                                                    o: IDocumentType,
                                                    k: number
                                                ) => (
                                                    <option
                                                        key={k}
                                                        value={o.code}
                                                    >
                                                        {o.name}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>
                                    {/* Documento número */}
                                    <div>
                                        <label
                                            htmlFor="mainDriverDocumentNumber"
                                            className="text-sm font-medium text-gray-900 dark:text-gray-200"
                                        >
                                            Documento número{" "}
                                            <span className="text-green-500">
                                                (dar enter)
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            name="mainDriverDocumentNumber"
                                            id="mainDriverDocumentNumber"
                                            maxLength={
                                                guide?.mainDriverDocumentType ===
                                                "1"
                                                    ? 8
                                                    : guide?.mainDriverDocumentType ===
                                                      "6"
                                                    ? 11
                                                    : 25
                                            }
                                            value={
                                                guide.mainDriverDocumentNumber
                                            }
                                            onChange={handleGuide}
                                            onFocus={(e) => e.target.select()}
                                            onKeyDown={(e) => {
                                                if (
                                                    e.key === "Enter" &&
                                                    (guide?.mainDriverDocumentType ===
                                                        "1" ||
                                                        guide?.mainDriverDocumentType ===
                                                            "6")
                                                ) {
                                                    e.preventDefault(); // Evita que el formulario se envíe si está dentro de un formulario
                                                    handleSntDocument(); // Llamada a la función de consulta
                                                }
                                            }}
                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            autoComplete="off"
                                        />
                                    </div>
                                    {/* Nombres y Apellidos del conductor */}
                                    <div className="md:col-span-2">
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
                                            value={guide.mainDriverNames}
                                            onChange={handleGuide}
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
                                            value={
                                                guide.mainDriverDriverLicense
                                            }
                                            onChange={handleGuide}
                                            onFocus={(e) => e.target.select()}
                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            autoComplete="off"
                                        />
                                    </div>
                                </div>
                            </fieldset>
                            <fieldset className="border border-gray-300 dark:border-gray-600 p-4 rounded-lg shadow-sm bg-white dark:bg-gray-800">
                                <legend className="px-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
                                    Datos de los Conductores Secundarios (Máximo
                                    2 conductores)
                                </legend>
                                <div className="grid  gap-4">
                                    {guide.othersDrivers.map(
                                        (item: IPerson, index: number) => (
                                            <div
                                                key={index}
                                                className="grid md:grid-cols-6 lg:grid-cols-6 gap-4"
                                            >
                                                <GuideDriverItem
                                                    index={index}
                                                    item={item}
                                                    onRemove={() =>
                                                        handleRemoveDriver(
                                                            index
                                                        )
                                                    }
                                                    onChange={
                                                        handleDriverChange
                                                    }
                                                    documentTypes={
                                                        documentTypesData?.allDocumentTypes ||
                                                        []
                                                    }
                                                    authContext={authContext}
                                                />
                                            </div>
                                        )
                                    )}
                                </div>
                            </fieldset>
                        </div>

                        <button
                            type="button"
                            className="px-5 py-2 bg-blue-600 dark:bg-cyan-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
                            onClick={handleAddDriver}
                        >
                            AGREGAR CONDUCTOR
                        </button>
                    </div>
                </div>
            </fieldset>
        </>
    );
}

export default GuideMainDriver;
