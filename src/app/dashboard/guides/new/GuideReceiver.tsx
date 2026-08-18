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
        <div className="relative bg-white dark:bg-gray-800/80 backdrop-blur rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.1)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)] overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-60" />
            <div className="p-5 sm:p-6">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-5">
                    Datos del Destinatario
                </h2>
                <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-5">
                    {/* Tipo de documento */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Tipo de documento del destinatario
                        </label>
                        <select
                            value={guide.receiverDocumentType}
                            name="receiverDocumentType"
                            onChange={handleGuide}
                            className="w-full h-10 sm:h-11 px-3 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-600/80 bg-gray-50/50 dark:bg-gray-700/30 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200"
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
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                            Documento número{" "}
                            <span className="text-xs text-green-500 font-normal">(Enter)</span>
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
                                    e.preventDefault();
                                    handleSntDocument();
                                }
                            }}
                            className="w-full h-10 sm:h-11 px-3 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-600/80 bg-gray-50/50 dark:bg-gray-700/30 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200"
                            autoComplete="off"
                        />
                    </div>
                    {/* Nombre del destinatario */}
                    <div>
                        <label
                            htmlFor="receiverNames"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
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
                            className="w-full h-10 sm:h-11 px-3 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-600/80 bg-gray-50/50 dark:bg-gray-700/30 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200"
                            autoComplete="off"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GuideReceiver;
