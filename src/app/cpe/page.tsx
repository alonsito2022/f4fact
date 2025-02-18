"use client";
import { FormEvent, useEffect, useState, ChangeEvent, MouseEvent } from "react";

import Link from "next/link";
import Search from "@/components/icons/Search";
import Lock from "@/components/icons/Lock";
import { gql, useLazyQuery } from "@apollo/client";
import { useSession } from "next-auth/react";
import { IOperation, IUser } from "@/app/types";
import { toast } from "react-toastify";
const today = new Date().toISOString().split("T")[0];
const initialStateFilterObj = {
    doc: "",
    documentType: "01",
    serial: "",
    correlative: "",
    totalToPay: "",
};
const SALE_QUERY = gql`
    query (
        $doc: String!
        $documentType: String!
        $serial: String!
        $correlative: String!
        $totalToPay: String!
    ) {
        getSaleByParameters(
            doc: $doc
            documentType: $documentType
            serial: $serial
            correlative: $correlative
            totalToPay: $totalToPay
        ) {
            id
            emitDate
            operationDate
            currencyType
            documentType
            documentTypeReadable
            serial
            correlative
            totalAmount
            totalTaxed
            totalDiscount
            totalExonerated
            totalUnaffected
            totalFree
            totalIgv
            totalToPay
            totalPayed
            operationStatus
            operationStatusReadable
            sendClient

            linkXml
            linkXmlLow
            linkCdr
            linkCdrLow
            sunatStatus
            sunatDescription
            sunatDescriptionLow
            client {
                names
            }
            subsidiary {
                company {
                    businessName
                    doc
                }
            }
        }
    }
`;
function Cpe() {
    const [filterObj, setFilterObj] = useState(initialStateFilterObj);
    const [showForm, setShowForm] = useState(true);
    const [transformedSaleData, setTransformedSaleData] =
        useState<IOperation | null>(null);

    const handleInputChange = (
        event: ChangeEvent<
            HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = event.target;

        // Validar que solo se ingresen dígitos en el campo "doc"
        if (name === "doc" && !/^\d*$/.test(value)) {
            return;
        }

        // Validar que solo se ingresen dígitos y máximo 6 caracteres en el campo "correlative"
        if (
            name === "correlative" &&
            (!/^\d*$/.test(value) || value.length > 6)
        ) {
            return;
        }

        // Validar que solo se ingresen dígitos, decimales y máximo 20 caracteres en el campo "totalToPay"
        if (
            name === "totalToPay" &&
            (!/^\d*\.?\d*$/.test(value) || value.length > 20)
        ) {
            return;
        }

        setFilterObj({ ...filterObj, [name]: value });
    };

    const handleClick = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        // Validar que los campos no estén vacíos
        if (!filterObj.doc || filterObj.doc.length < 11) {
            toast.error("El campo RUC del emisor es obligatorio");
            return;
        }
        if (!filterObj.serial) {
            toast.error("El campo Serie es obligatorio");
            return;
        }
        if (!filterObj.correlative) {
            toast.error("El campo Numero es obligatorio");
            return;
        }
        if (!filterObj.totalToPay) {
            toast.error("El campo Total es obligatorio");
            return;
        }

        // Ejecutar la consulta solo cuando se hace clic y los campos están completos
        saleQuery({
            variables: {
                doc: filterObj.doc,
                documentType: filterObj.documentType,
                serial: filterObj.serial,
                correlative: filterObj.correlative,
                totalToPay: filterObj.totalToPay,
            },
        });
    };
    const handleBackToForm = () => {
        setFilterObj(initialStateFilterObj); // Reinicializa los valores por defecto
        setShowForm(true);
    };

    const [
        saleQuery,
        {
            loading: filteredSaleLoading,
            error: filteredSaleError,
            data: filteredSaleData,
        },
    ] = useLazyQuery(SALE_QUERY, {
        fetchPolicy: "network-only",
        onCompleted(data) {
            if (data.getSaleByParameters === null && filterObj.doc !== "") {
                toast.error("No se encontró el comprobante");
            } else if (
                data.getSaleByParameters !== null &&
                filterObj.doc !== ""
            ) {
                toast.success("Comprobante encontrado");
                setShowForm(false);
                const transformedData = {
                    ...data,
                    getSaleByParameters: {
                        ...data.getSaleByParameters,
                        operationStatus:
                            data.getSaleByParameters.operationStatus.replace(
                                "A_",
                                ""
                            ),
                        documentType:
                            data.getSaleByParameters.documentType.replace(
                                "A_",
                                ""
                            ),
                        fileNameXml: `${data.getSaleByParameters?.subsidiary?.company?.doc}-${data.getSaleByParameters?.documentType}-${data.getSaleByParameters.serial}-${data.getSaleByParameters.correlative}.xml`,
                        fileNameCdr: `R-${data.getSaleByParameters?.subsidiary?.company?.doc}-${data.getSaleByParameters?.documentType}-${data.getSaleByParameters.serial}-${data.getSaleByParameters.correlative}.xml`,
                    },
                };
                setTransformedSaleData(transformedData.getSaleByParameters);
            }
        },
        onError: (err) => console.error("Error in Sale:", err),
    });
    const downloadFile = async (
        url: string | null | undefined,
        fileName: string | null | undefined
    ): Promise<void> => {
        if (!url) {
            console.error("No hay un enlace disponible para la descarga.");
            return;
        }
        // 20611894067-01-F001-517.xml
        // R-20611894067-01-F001-517.xml
        try {
            const response = await fetch(
                url.toString().replace("http:", "https:")
            );
            if (!response.ok) throw new Error("Error al descargar el archivo");

            const blob = await response.blob();
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = fileName ? fileName : "factura.xml"; // Puedes cambiar el nombre si es necesario
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error en la descarga:", error);
        }
    };
    return (
        <>
            <nav className="fixed z-30 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                <div className="px-3 py-3 lg:px-5 lg:pl-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center justify-start">
                            <a href="/dashboard" className="flex ml-2 md:mr-24">
                                <img
                                    src="/images/logo.svg"
                                    className="h-8 mr-3"
                                    alt="FlowBite Logo"
                                />
                                <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white">
                                    4Fact
                                </span>
                            </a>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link
                                href="/cpe"
                                className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
                            >
                                <Search /> Buscar cpe
                            </Link>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
                            >
                                <Search /> Ingresar
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {filteredSaleError ? (
                <div>{filteredSaleError.message}</div>
            ) : filteredSaleLoading ? (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div
                            className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full"
                            role="status"
                        >
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            ) : showForm ? (
                <>
                    <div className="flex flex-col items-center justify-center px-6 pt-24 mx-auto  pt:mt-0 dark:bg-gray-900 bg-gradient-to-r">
                        <div className="w-full max-w-sm p-6 space-y-3 sm:p-8 bg-white rounded-lg shadow dark:bg-gray-800 border border-gray-300">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                                Buscar comprobante
                            </h2>
                            <h4 className="text-gray-900 dark:text-white pt-0 mb-0 text-center font-thin text-2xl">
                                VERSIÓN NUBE
                            </h4>
                            <div className="mt-8 space-y-4">
                                <div className="">
                                    <label htmlFor="doc" className="form-label">
                                        RUC del emisor
                                    </label>
                                    <input
                                        type="text"
                                        name="doc"
                                        id="doc"
                                        value={filterObj.doc}
                                        onChange={handleInputChange}
                                        className="form-control"
                                        autoComplete="off"
                                        maxLength={11}
                                        required
                                    />
                                </div>

                                <div className="">
                                    <label
                                        htmlFor="documentType"
                                        className="form-label"
                                    >
                                        Tipo de comprobante
                                    </label>
                                    <select
                                        value={filterObj.documentType}
                                        name="documentType"
                                        onChange={handleInputChange}
                                        className="form-control-sm"
                                        required
                                    >
                                        <option value={"01"}>
                                            FACTURA ELECTRÓNICA
                                        </option>
                                        <option value={"03"}>
                                            BOLETA DE VENTA ELECTRÓNICA
                                        </option>
                                        <option value={"07"}>
                                            NOTA DE CRÉDITO ELECTRÓNICA
                                        </option>
                                        <option value={"08"}>
                                            NOTA DE DÉBITO ELECTRÓNICA
                                        </option>
                                        <option value={"09"}>
                                            GUIA DE REMISIÓN REMITENTE
                                        </option>
                                    </select>
                                </div>

                                <div className="">
                                    <label
                                        htmlFor="serial"
                                        className="form-label"
                                    >
                                        Serie
                                    </label>
                                    <input
                                        type="text"
                                        name="serial"
                                        id="serial"
                                        value={filterObj.serial}
                                        onChange={handleInputChange}
                                        className="form-control"
                                        autoComplete="off"
                                        maxLength={4}
                                        required
                                    />
                                </div>

                                <div className="">
                                    <label
                                        htmlFor="correlative"
                                        className="form-label"
                                    >
                                        Numero
                                    </label>
                                    <input
                                        type="text"
                                        name="correlative"
                                        id="correlative"
                                        value={filterObj.correlative}
                                        onChange={handleInputChange}
                                        className="form-control"
                                        autoComplete="off"
                                        maxLength={6}
                                        required
                                    />
                                </div>

                                <div className="">
                                    <label
                                        htmlFor="totalToPay"
                                        className="form-label"
                                    >
                                        Total
                                    </label>
                                    <input
                                        type="text"
                                        name="totalToPay"
                                        id="totalToPay"
                                        value={filterObj.totalToPay}
                                        onChange={handleInputChange}
                                        className="form-control"
                                        autoComplete="off"
                                        maxLength={20}
                                        required
                                    />
                                </div>

                                <div className="grid ">
                                    <button
                                        onClick={handleClick}
                                        className="btn-default m-0"
                                    >
                                        Buscar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center px-6 pt-4">
                        <div className="w-full max-w-sm p-6 space-y-3 sm:p-8  text-center">
                            <span className=" inline-flex items-center gap-2 bg-green-100 text-green-800 text-2xl font-extralight me-2 px-4 py-2.5 rounded dark:bg-gray-700 dark:text-green-400 border border-green-400">
                                <Lock />
                                Seguro
                            </span>
                            <div className="text-green-400 font-extralight text-sm">
                                Protegido con un Certificado Digital SSL
                                (https://), tus datos están completamente
                                seguros.
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    {transformedSaleData && transformedSaleData ? (
                        <div className="flex flex-col items-center justify-center px-6 pt-24 mx-auto  pt:mt-0 dark:bg-gray-900 bg-gradient-to-r">
                            <div className="w-full max-w-sm p-6 space-y-3 sm:p-8 bg-white rounded-lg shadow dark:bg-gray-800 border border-gray-300">
                                <h2 className="text-lg  text-gray-900 dark:text-white mb-4 text-center">
                                    {
                                        transformedSaleData?.subsidiary?.company
                                            ?.businessName
                                    }
                                </h2>
                                <h2 className="text-lg  text-gray-900 dark:text-white mb-4 text-center">
                                    {transformedSaleData?.documentTypeReadable +
                                        " ELECTRONICA: " +
                                        transformedSaleData.serial +
                                        " - " +
                                        transformedSaleData.correlative}
                                </h2>
                                <h2 className="text-lg  text-gray-900 dark:text-white mb-4 text-center">
                                    {"Fecha de emisión: " +
                                        transformedSaleData?.emitDate}
                                </h2>
                                <h2 className="text-lg  text-gray-900 dark:text-white mb-4 text-center">
                                    {"Total: " +
                                        Number(
                                            transformedSaleData?.totalToPay
                                        ).toFixed(2)}
                                </h2>
                                <h2 className="text-lg  text-gray-900 dark:text-white mb-4 text-center">
                                    {"Cliente: " +
                                        transformedSaleData?.client?.names}
                                </h2>
                                <div className="flex flex-col gap-2">
                                    <a
                                        href={
                                            process.env.NEXT_PUBLIC_BASE_API +
                                            "/operations/print_invoice/" +
                                            transformedSaleData.id +
                                            "/"
                                        }
                                        className="btn-default m-0 text-center"
                                        target="_blank"
                                    >
                                        Ver en PDF
                                    </a>
                                    <a
                                        href="#"
                                        className="btn-default m-0 text-center"
                                        onClick={() => {
                                            const url =
                                                transformedSaleData.operationStatus ===
                                                "02"
                                                    ? transformedSaleData.linkXml
                                                    : transformedSaleData.linkXmlLow;
                                            downloadFile(
                                                url,
                                                transformedSaleData.fileNameXml
                                            );
                                        }}
                                    >
                                        Descargar XML
                                    </a>
                                    <a
                                        href="#"
                                        onClick={() => {
                                            const url =
                                                transformedSaleData.operationStatus ===
                                                "02"
                                                    ? transformedSaleData.linkCdr
                                                    : transformedSaleData.linkCdrLow;
                                            downloadFile(
                                                url,
                                                transformedSaleData.fileNameCdr
                                            );
                                        }}
                                        className="btn-default m-0 text-center"
                                    >
                                        Descargar CDR
                                    </a>
                                    <button
                                        onClick={handleBackToForm}
                                        className="btn-default m-0 text-center"
                                        type="button"
                                    >
                                        Volver al formulario
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </>
            )}
        </>
    );
}

export default Cpe;
