import { IDocumentType } from "@/app/types";
import { gql, useMutation, useQuery } from "@apollo/client";
import React from "react";
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

function GuideReceiver({
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
            guide?.receiverDocumentType === "6" &&
            guide?.receiverDocumentNumber?.length !== 11
        ) {
            toast("Por favor ingrese un número RUC valido.", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
            });
            return;
        }
        if (
            guide.receiverDocumentType === "1" &&
            guide?.receiverDocumentNumber?.length !== 8
        ) {
            toast("Por favor ingrese un número DNI valido.", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
            });
            return;
        }
        const { data, errors } = await sntPersonMutation({
            variables: { document: guide.receiverDocumentNumber },
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
                receiverNames: data.sntPerson.person.sntNames,
            });

            toast(data.sntPerson.message, {
                hideProgressBar: true,
                autoClose: 2000,
                type: "success",
            });
        }
    };
    return (
        <>
            <fieldset className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <legend className="px-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
                    DATOS DEL DESTINATARIO
                </legend>
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-5 ">
                    {/* Tipo de documento */}
                    <div>
                        <label className="text-sm text-gray-700 dark:text-gray-200">
                            Tipo de documento del destinatario
                        </label>
                        <select
                            value={guide.receiverDocumentType}
                            name="receiverDocumentType"
                            onChange={handleGuide}
                            className="text-lg w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            {documentTypesData?.allDocumentTypes?.map(
                                (o: IDocumentType, k: number) => (
                                    <option key={k} value={o.code}>
                                        {o.name}
                                    </option>
                                )
                            )}
                        </select>
                    </div>
                    {/* Documento número */}
                    <div>
                        <label
                            htmlFor="receiverDocumentNumber"
                            className="text-sm font-medium text-gray-900 dark:text-gray-200"
                        >
                            Documento número{" "}
                            <span className="text-green-500">(dar enter)</span>
                        </label>
                        <input
                            type="text"
                            name="receiverDocumentNumber"
                            id="receiverDocumentNumber"
                            maxLength={
                                guide?.receiverDocumentType === "1"
                                    ? 8
                                    : guide?.receiverDocumentType === "6"
                                    ? 11
                                    : 25
                            }
                            value={guide.receiverDocumentNumber}
                            onChange={handleGuide}
                            onFocus={(e) => e.target.select()}
                            onKeyDown={(e) => {
                                if (
                                    e.key === "Enter" &&
                                    (guide?.receiverDocumentType === "1" ||
                                        guide?.receiverDocumentType === "6")
                                ) {
                                    e.preventDefault(); // Evita que el formulario se envíe si está dentro de un formulario
                                    handleSntDocument(); // Llamada a la función de consulta
                                }
                            }}
                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            autoComplete="off"
                        />
                    </div>
                    {/* Nombre del destinatario */}
                    <div>
                        <label
                            htmlFor="receiverNames"
                            className="text-sm font-medium text-gray-900 dark:text-gray-200"
                        >
                            Nombre del destinatario
                        </label>
                        <input
                            type="text"
                            name="receiverNames"
                            id="receiverNames"
                            maxLength={200}
                            value={guide.receiverNames}
                            onChange={handleGuide}
                            onFocus={(e) => e.target.select()}
                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            autoComplete="off"
                        />
                    </div>
                </div>
            </fieldset>
        </>
    );
}

export default GuideReceiver;
