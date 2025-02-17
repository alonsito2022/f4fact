"use client";
import { FormEvent, useEffect, useState, ChangeEvent } from "react";
import Link from "next/link";
import Search from "@/components/icons/Search";
import Lock from "@/components/icons/Lock";
import { gql, useLazyQuery } from "@apollo/client";
import { useSession } from "next-auth/react";
import { IUser } from "@/app/types";

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
                }
            }
        }
    }
`;

function Cpe() {
    const [filterObj, setFilterObj] = useState(initialStateFilterObj);
    const [showForm, setShowForm] = useState(true);

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

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        // Validar que los valores no sean cadenas vacías antes de realizar la consulta
        if (
            !filterObj.doc ||
            !filterObj.documentType ||
            !filterObj.serial ||
            !filterObj.correlative ||
            !filterObj.totalToPay
        ) {
            console.error("Todos los campos son obligatorios");
            return;
        }

        saleQuery();
        setShowForm(false);
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
        variables: {
            doc: filterObj.doc,
            documentType: filterObj.documentType,
            serial: filterObj.serial,
            correlative: filterObj.correlative,
            totalToPay: filterObj.totalToPay,
        },
        fetchPolicy: "network-only",
        onCompleted(data) {
            console.log("object", data);
        },
        onError: (err) =>
            console.error("Error in Sale:", err, {
                doc: filterObj.doc,
                documentType: filterObj.documentType,
                serial: filterObj.serial,
                correlative: filterObj.correlative,
                totalToPay: filterObj.totalToPay,
            }),
    });

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
                            <form
                                className="mt-8 space-y-4"
                                onSubmit={handleSubmit}
                            >
                                <div className="">
                                    <label htmlFor="doc" className="form-label">
                                        RUC del emisor
                                    </label>
                                    <input
                                        type="text"
                                        name="doc"
                                        id="doc"
                                        value={filterObj.doc}
                                        maxLength={11}
                                        onChange={handleInputChange}
                                        className="form-control"
                                        autoComplete="off"
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
                                        maxLength={4}
                                        onChange={handleInputChange}
                                        className="form-control"
                                        autoComplete="off"
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
                                        maxLength={6}
                                        onChange={handleInputChange}
                                        className="form-control"
                                        autoComplete="off"
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
                                        maxLength={20}
                                        onChange={handleInputChange}
                                        className="form-control"
                                        autoComplete="off"
                                        required
                                    />
                                </div>

                                <div className="grid ">
                                    <button
                                        type="submit"
                                        className="btn-default m-0"
                                    >
                                        Buscar
                                    </button>
                                </div>
                            </form>
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
                    {filteredSaleData &&
                    filteredSaleData.getSaleByParameters ? (
                        <div className="flex flex-col items-center justify-center px-6 pt-24 mx-auto  pt:mt-0 dark:bg-gray-900 bg-gradient-to-r">
                            <div className="w-full max-w-sm p-6 space-y-3 sm:p-8 bg-white rounded-lg shadow dark:bg-gray-800 border border-gray-300">
                                <h2 className="text-lg  text-gray-900 dark:text-white mb-4 text-center">
                                    {
                                        filteredSaleData.getSaleByParameters
                                            .subsidiary.company.businessName
                                    }
                                </h2>
                                <h2 className="text-lg  text-gray-900 dark:text-white mb-4 text-center">
                                    {filteredSaleData.getSaleByParameters
                                        .documentTypeReadable +
                                        " ELECTRONICA: " +
                                        filteredSaleData.getSaleByParameters
                                            .serial +
                                        " - " +
                                        filteredSaleData.getSaleByParameters
                                            .correlative}
                                </h2>
                                <h2 className="text-lg  text-gray-900 dark:text-white mb-4 text-center">
                                    {"Fecha de emisión: " +
                                        filteredSaleData.getSaleByParameters
                                            .emitDate}
                                </h2>
                                <h2 className="text-lg  text-gray-900 dark:text-white mb-4 text-center">
                                    {"Total: " +
                                        filteredSaleData.getSaleByParameters
                                            .totalToPay}
                                </h2>
                                <h2 className="text-lg  text-gray-900 dark:text-white mb-4 text-center">
                                    {"Cliente: " +
                                        filteredSaleData.getSaleByParameters
                                            .client.names}
                                </h2>
                                <div className="flex flex-col gap-2">
                                    <a
                                        href={
                                            process.env.NEXT_PUBLIC_BASE_API +
                                            "/operations/print_invoice/" +
                                            filteredSaleData.getSaleByParameters
                                                .id +
                                            "/"
                                        }
                                        className="btn-default m-0 text-center"
                                        target="_blank"
                                    >
                                        Ver en PDF
                                    </a>
                                    <a
                                        href={
                                            filteredSaleData.getSaleByParameters.operationStatus.replace(
                                                "A_",
                                                ""
                                            ) === "02"
                                                ? filteredSaleData
                                                      .getSaleByParameters
                                                      .linkXml
                                                : filteredSaleData
                                                      .getSaleByParameters
                                                      .linkXmlLow
                                        }
                                        className="btn-default m-0 text-center"
                                        target="_blank"
                                    >
                                        Descargar XML
                                    </a>
                                    <a
                                        href={
                                            filteredSaleData.getSaleByParameters.operationStatus.replace(
                                                "A_",
                                                ""
                                            ) === "02"
                                                ? filteredSaleData
                                                      .getSaleByParameters
                                                      .linkXmlLow
                                                : filteredSaleData
                                                      .getSaleByParameters
                                                      .linkCdrLow
                                        }
                                        className="btn-default m-0 text-center"
                                        target="_blank"
                                    >
                                        Descargar CDR
                                    </a>
                                    <button
                                        onClick={handleBackToForm}
                                        className="btn-default m-0 text-center"
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
