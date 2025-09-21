"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import { IOperation } from "@/app/types";
import { toast } from "react-toastify";
import LoadingIcon from "@/components/icons/LoadingIcon";
import { useRouter } from "next/navigation";
import { Modal, ModalOptions } from "flowbite";
import PdfPreviewModal from "../../PdfPreviewModal";
import WhatsAppModal from "../../WhatsAppModal";

const today = new Date().toISOString().split("T")[0];

const CANCEL_INVOICE = gql`
    mutation CancelInvoice($operationId: Int!, $lowDate: Date!) {
        cancelInvoice(operationId: $operationId, lowDate: $lowDate) {
            message
            success
        }
    }
`;

const SALE_QUERY_BY_ID = gql`
    query GetSaleById($id: ID!) {
        getSaleById(pk: $id) {
            id
            emitDate
            dueDate
            operationDate
            documentType
            documentTypeReadable
            serial
            correlative
            codeHash
            currencyType
            igvType
            igvPercentage
            operationType
            operationStatus
            operationStatusReadable
            sunatStatus
            sunatDescription
            sunatDescriptionLow
            linkCdr
            linkXml
            linkCdrLow
            linkXmlLow
            totalAmount
            totalTaxed
            totalIgv
            totalDiscount
            totalExonerated
            totalUnaffected
            totalFree
            totalPerception
            totalToPay
            totalPayed
            sendClient
            client {
                id
                names
                documentNumber
                email
                phone
                address
            }
            subsidiary {
                id
                company {
                    id
                    businessName
                    doc
                    address
                    phone
                }
            }
            operationdetailSet {
                id
                productName
                description
                quantity
                unitValue
                unitPrice
                totalValue
                totalIgv
                totalAmount
                discountPercentage
                totalDiscount
                igvPercentage
                typeAffectationId
                productId
                productTariffId
            }
        }
    }
`;

export default function ViewInvoicePage({
    params,
}: {
    params: { invoiceId: string };
}) {
    const { invoiceId } = params;
    const auth = useAuth();
    const router = useRouter();
    const [invoice, setInvoice] = useState<IOperation | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [pdfModal, setPdfModal] = useState<Modal | any>(null);
    const [pdfUrl, setPdfUrl] = useState<string>("");
    const [whatsappModal, setWhatsappModal] = useState<Modal | any>(null);
    const [cpe, setCpe] = useState<any>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const [cancelInvoice, { loading: cancelLoading, error: cancelError }] =
        useMutation(CANCEL_INVOICE);

    const authContext = {
        headers: {
            Authorization: `Bearer ${auth?.jwtToken}`,
        },
    };

    const [saleQuery] = useLazyQuery(SALE_QUERY_BY_ID, {
        context: authContext,
        fetchPolicy: "network-only",
        onCompleted: (data) => {
            const dataSale = data.getSaleById;
            const cleanDocumentType = dataSale?.documentType?.replace("A_", "");
            const dataSaleCopy = {
                ...dataSale,
                documentType: cleanDocumentType,
                operationStatus: dataSale?.operationStatus?.replace("A_", ""),
                fileNameXml: `${dataSale?.subsidiary?.company?.doc}-${cleanDocumentType}-${dataSale.serial}-${dataSale.correlative}.xml`,
                fileNameCdr: `R-${dataSale?.subsidiary?.company?.doc}-${cleanDocumentType}-${dataSale.serial}-${dataSale.correlative}.xml`,
            };
            setInvoice(dataSaleCopy);
            setIsLoading(false);
        },
        onError: (err) => {
            console.error("Error al cargar el comprobante:", err);
            toast.error("Error al cargar el comprobante");
            setIsLoading(false);
        },
    });

    useEffect(() => {
        if (invoiceId && auth?.jwtToken) {
            saleQuery({
                variables: { id: invoiceId },
            });
        }
    }, [invoiceId, auth?.jwtToken]);

    const handleDownload = (url: string, filename: string) => {
        if (!url || !filename) {
            toast.error("URL o nombre de archivo no válido");
            return;
        }

        fetch(url.toString().replace("http:", "https:"))
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error en la respuesta de la descarga");
                }
                return response.blob();
            })
            .then((blob) => {
                const downloadUrl = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = downloadUrl;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(downloadUrl);
                toast.success("Archivo descargado correctamente");
            })
            .catch((error) => {
                console.error("Error al descargar:", error);
                toast.error("Error al descargar el archivo");
            });
    };

    const handlePrint = () => {
        if (!invoice) {
            toast.error("No se puede imprimir: comprobante no disponible");
            return;
        }

        // Determinar el tipo de endpoint basándose en el tipo de documento
        const endpoint =
            invoice.documentType === "A_07"
                ? "print_credit_note"
                : "print_invoice";

        // Construir la URL del PDF para impresión
        const pdfUrl = `${process.env.NEXT_PUBLIC_BASE_API}/operations/${endpoint}/${invoice.id}/`;

        // Crear iframe en memoria para imprimir usando el proxy /api/pdf
        const printIframe = document.createElement("iframe");
        printIframe.style.display = "none";
        printIframe.src = `/api/pdf?url=${encodeURIComponent(pdfUrl)}`;

        // Agregar el iframe al DOM
        document.body.appendChild(printIframe);

        // Esperar a que se cargue el PDF y luego imprimir
        printIframe.onload = () => {
            try {
                // Activar la impresión
                printIframe.contentWindow?.print();

                // Limpiar el iframe después de un tiempo más largo para permitir que el diálogo permanezca abierto
                setTimeout(() => {
                    if (document.body.contains(printIframe)) {
                        document.body.removeChild(printIframe);
                    }
                }, 10000); // 10 segundos para dar tiempo al usuario de configurar la impresión
            } catch (error) {
                console.log("Error al imprimir:", error);
                toast.error("No se pudo activar la impresión automáticamente");

                // Limpiar el iframe en caso de error
                if (document.body.contains(printIframe)) {
                    document.body.removeChild(printIframe);
                }
            }
        };

        // Fallback: si el onload no se dispara, intentar imprimir después de un tiempo
        // setTimeout(() => {
        //     try {
        //         if (printIframe.contentWindow) {
        //             printIframe.contentWindow.print();
        //         } else {
        //             // Si no hay contentWindow, abrir en nueva ventana
        //             window.open(pdfUrl, "_blank");
        //             toast.info(
        //                 "Se abrió el PDF en una nueva ventana. Usa Ctrl+P para imprimir."
        //             );
        //         }

        //         // Limpiar el iframe después de un tiempo más largo
        //         setTimeout(() => {
        //             if (document.body.contains(printIframe)) {
        //                 document.body.removeChild(printIframe);
        //             }
        //         }, 10000); // 10 segundos para dar tiempo al usuario
        //     } catch (error) {
        //         console.log("Error en fallback de impresión:", error);
        //         // Limpiar el iframe
        //         if (document.body.contains(printIframe)) {
        //             document.body.removeChild(printIframe);
        //         }
        //     }
        // }, 2000);
    };

    const normalizeDate = (date: string) => {
        const normalized = new Date(date);
        normalized.setHours(0, 0, 0, 0);
        return normalized;
    };

    const handleCancelInvoice = (
        operationId: number,
        emitDate: string,
        documentType: string
    ) => {
        const limaDate = new Date(
            new Date().toLocaleString("en-US", { timeZone: "America/Lima" })
        );
        limaDate.setHours(0, 0, 0, 0); // Normalizar la fecha actual

        const emitDateObj = normalizeDate(emitDate);
        const fiveDaysAgo = new Date(limaDate);
        fiveDaysAgo.setDate(limaDate.getDate() - 6);
        const threeDaysAgo = new Date(limaDate);
        threeDaysAgo.setDate(limaDate.getDate() - 4);

        if (documentType === "03") {
            // Boleta
            if (emitDateObj < fiveDaysAgo || emitDateObj > limaDate) {
                toast.error(
                    "La fecha de emisión de la boleta debe estar entre 5 días antes y hoy. "
                );
                return;
            }
        } else if (documentType === "01") {
            // Factura
            if (emitDateObj < threeDaysAgo || emitDateObj > limaDate) {
                toast.error(
                    "La fecha de emisión de la factura debe estar entre 3 días antes y hoy. "
                );
                return;
            }
        }

        cancelInvoice({
            variables: {
                operationId,
                lowDate: today,
            },
            context: authContext,
        })
            .then((response) => {
                if (response.data.cancelInvoice.success) {
                    toast.success("Factura anulada correctamente.");
                    // Recargar los datos del invoice
                    saleQuery({
                        variables: { id: invoiceId },
                        context: authContext,
                    });
                } else {
                    toast.error(
                        `Error: ${response.data.cancelInvoice.message}`
                    );
                }
            })
            .catch((err) => {
                toast.error("Error al anular la factura.");
                console.error(err, {
                    operationId,
                    lowDate: today,
                });
            });
    };

    const handleWhatsAppClick = () => {
        if (!invoice) return;

        whatsappModal?.show();
        setCpe({
            ...cpe,
            id: Number(invoice.id),
            documentTypeDisplay:
                invoice.documentType === "01"
                    ? "FACTURA"
                    : invoice.documentType === "03"
                    ? "BOLETA"
                    : "NOTA DE CREDITO",
            serial: invoice.serial,
            correlative: invoice.correlative,
            clientName: invoice.client?.names,
            clientDoc: invoice.client?.documentNumber,
        });
    };

    const getDocumentTypeName = (documentType: string) => {
        switch (documentType) {
            case "A_01":
                return "FACTURA ELECTRÓNICA";
            case "A_03":
                return "BOLETA DE VENTA";
            case "A_07":
                return "NOTA DE CRÉDITO";
            default:
                return "COMPROBANTE";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "A_02":
                return "text-green-600";
            case "A_03":
                return "text-red-600";
            default:
                return "text-gray-600";
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingIcon />
                <span className="ml-2">Cargando comprobante...</span>
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-600 mb-4">
                        Comprobante no encontrado
                    </h2>
                    <button
                        onClick={() => router.back()}
                        className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 shadow-lg transform hover:scale-105 transition-all duration-200 font-medium"
                    >
                        <svg
                            className="w-5 h-5 mr-2 inline"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                        Volver
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
            {/* Banners de estado */}
            <div className="mb-6 space-y-3 max-w-5xl mx-auto">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl flex justify-between items-center shadow-lg">
                    <div className="flex items-center">
                        <svg
                            className="w-5 h-5 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <span className="font-semibold">
                            {invoice.subsidiary?.company?.businessName}
                        </span>
                    </div>
                    <button className="text-white hover:text-orange-200 transition-colors">
                        <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl flex justify-between items-center shadow-lg">
                    <div className="flex items-center">
                        <svg
                            className="w-5 h-5 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <span className="font-semibold">
                            {invoice.operationStatusReadable}
                        </span>
                    </div>
                    <button className="text-white hover:text-green-200 transition-colors">
                        <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Tarjeta principal del comprobante */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-5xl mx-auto border border-gray-200 dark:border-gray-700">
                {/* Encabezado del comprobante */}
                <div className="text-center mb-8">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl shadow-lg mb-4">
                        <h1 className="text-3xl font-bold mb-2">
                            {getDocumentTypeName(invoice.documentType)}
                        </h1>
                        <p className="text-xl font-semibold opacity-90">
                            {invoice.serial}-{invoice.correlative}
                        </p>
                    </div>
                </div>

                {/* Resumen financiero */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl p-1 mb-8 border border-gray-200 dark:border-gray-600">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-1 text-center">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                            <div className="flex items-center justify-center mb-2">
                                <svg
                                    className="w-6 h-6 text-gray-600 dark:text-gray-400 mr-2"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                    TOTAL
                                </p>
                            </div>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                S/ {Number(invoice.totalAmount).toFixed(2)}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                            <div className="flex items-center justify-center mb-2">
                                <svg
                                    className="w-6 h-6 text-green-600 mr-2"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                    IMPORTE PAGADO
                                </p>
                            </div>
                            <p className="text-3xl font-bold text-green-600">
                                S/ {Number(invoice.totalPayed).toFixed(2)}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                            <div className="flex items-center justify-center mb-2">
                                <svg
                                    className="w-6 h-6 text-blue-600 mr-2"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                    DIFERENCIA (VUELTO)
                                </p>
                            </div>
                            <p className="text-3xl font-bold text-blue-600">
                                S/{" "}
                                {(
                                    Number(invoice.totalPayed) -
                                    Number(invoice.totalAmount)
                                ).toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Botón principal de impresión */}
                <div className="text-center mb-8">
                    <button
                        onClick={handlePrint}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center mx-auto shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold text-lg"
                    >
                        <svg
                            className="w-6 h-6 mr-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z"
                                clipRule="evenodd"
                            />
                        </svg>
                        IMPRIMIR
                    </button>
                </div>

                {/* Botones de descarga */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <button
                        onClick={() => {
                            // Determinar el endpoint correcto basado en el tipo de documento
                            const endpoint =
                                invoice.documentType === "A_07"
                                    ? "print_credit_note"
                                    : "print_invoice";
                            // Construir la URL del PDF
                            const pdfUrl = `${process.env.NEXT_PUBLIC_BASE_API}/operations/${endpoint}/${invoice.id}/`;
                            // Establecer la URL y abrir el modal
                            setPdfUrl(pdfUrl);
                            pdfModal?.show();
                        }}
                        className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-3 rounded-xl hover:from-red-700 hover:to-red-800 flex items-center justify-center shadow-md transform hover:scale-105 transition-all duration-200 font-medium"
                    >
                        <svg
                            className="w-5 h-5 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                clipRule="evenodd"
                            />
                        </svg>
                        VER PDF
                    </button>
                    {invoice.operationStatus === "02" && (
                        <>
                            <button
                                onClick={() =>
                                    handleDownload(
                                        invoice.linkXml,
                                        invoice.fileNameXml
                                    )
                                }
                                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 rounded-xl hover:from-green-700 hover:to-green-800 flex items-center justify-center shadow-md transform hover:scale-105 transition-all duration-200 font-medium"
                            >
                                <svg
                                    className="w-5 h-5 mr-2"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                DESCARGAR XML
                            </button>
                            <button
                                onClick={() =>
                                    handleDownload(
                                        invoice.linkCdr,
                                        invoice.fileNameCdr
                                    )
                                }
                                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center justify-center shadow-md transform hover:scale-105 transition-all duration-200 font-medium"
                            >
                                <svg
                                    className="w-5 h-5 mr-2"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                DESCARGAR CDR
                            </button>
                        </>
                    )}
                </div>

                {/* Botones de acciones adicionales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <button
                        onClick={handleWhatsAppClick}
                        className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 rounded-xl hover:from-green-700 hover:to-green-800 flex items-center justify-center shadow-md transform hover:scale-105 transition-all duration-200 font-medium"
                    >
                        <svg
                            className="w-5 h-5 mr-2"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                        </svg>
                        Enviar por WhatsApp
                    </button>

                    <button
                        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center justify-center shadow-md transform hover:scale-105 transition-all duration-200 font-medium"
                        onClick={() => router.push("/dashboard/sales/new/01")}
                    >
                        <svg
                            className="w-5 h-5 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                clipRule="evenodd"
                            />
                        </svg>
                        GENERAR OTRA FACTURA
                    </button>
                    <button
                        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center justify-center shadow-md transform hover:scale-105 transition-all duration-200 font-medium"
                        onClick={() => router.push("/dashboard/sales/new/03")}
                    >
                        <svg
                            className="w-5 h-5 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                clipRule="evenodd"
                            />
                        </svg>
                        GENERAR OTRA BOLETA DE VENTA
                    </button>
                    <button
                        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center justify-center shadow-md transform hover:scale-105 transition-all duration-200 font-medium"
                        onClick={() => router.push("/dashboard/sales")}
                    >
                        VER TODAS LAS VENTAS
                    </button>
                </div>

                {/* Botón de anulación */}
                {invoice.operationStatus === "02" && (
                    <div className="text-center mb-6">
                        <button
                            onClick={() => {
                                if (!invoice) {
                                    toast.error(
                                        "No se puede anular: comprobante no disponible"
                                    );
                                    return;
                                }

                                const confirmDelete = window.confirm(
                                    "¿Estás seguro de que deseas anular esta factura? Esta acción no se puede deshacer."
                                );

                                if (confirmDelete) {
                                    handleCancelInvoice(
                                        Number(invoice.id),
                                        invoice.emitDate,
                                        invoice.documentType?.replace(
                                            "A_",
                                            ""
                                        ) || ""
                                    );
                                }
                            }}
                            disabled={cancelLoading}
                            className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-6 py-3 rounded-xl hover:from-orange-700 hover:to-orange-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
                        >
                            {cancelLoading
                                ? "Anulando..."
                                : "ANULAR O COMUNICAR DE BAJA"}
                        </button>
                    </div>
                )}
                {/* Estado SUNAT */}
                <div
                    className={`rounded-xl p-6 border ${
                        invoice.sendSunat && invoice.sunatStatus
                            ? "bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border-green-200 dark:border-green-700"
                            : invoice.sendSunat && !invoice.sunatStatus
                            ? "bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800 border-yellow-200 dark:border-yellow-700"
                            : "bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 border-red-200 dark:border-red-700"
                    }`}
                >
                    <div className="flex items-center justify-center mb-2">
                        <svg
                            className={`w-6 h-6 mr-2 ${
                                invoice.sendSunat
                                    ? "text-green-600"
                                    : "text-red-600"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <span
                            className={`font-semibold ${
                                invoice.sendSunat
                                    ? "text-green-800 dark:text-green-200"
                                    : "text-red-800 dark:text-red-200"
                            }`}
                        >
                            {invoice.sendSunat
                                ? "Enviada a la SUNAT"
                                : "No enviada a la SUNAT"}
                        </span>
                    </div>
                    <div className="flex items-center justify-center mb-2">
                        <svg
                            className={`w-6 h-6 mr-2 ${
                                invoice.sunatStatus
                                    ? "text-green-600"
                                    : invoice.sendSunat
                                    ? "text-yellow-600"
                                    : "text-gray-400"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <span
                            className={`font-semibold ${
                                invoice.sunatStatus
                                    ? "text-green-800 dark:text-green-200"
                                    : invoice.sendSunat
                                    ? "text-yellow-800 dark:text-yellow-200"
                                    : "text-gray-600 dark:text-gray-400"
                            }`}
                        >
                            {invoice.sunatStatus
                                ? "Aceptada por la SUNAT"
                                : invoice.sendSunat
                                ? "En proceso de aceptación por la SUNAT"
                                : "Pendiente de envío a la SUNAT"}
                        </span>
                    </div>
                    <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                        <p>{invoice.sunatDescription}</p>
                    </div>
                </div>
            </div>

            {/* Modal de PDF usando PdfPreviewModal */}
            <PdfPreviewModal
                pdfModal={pdfModal}
                setPdfModal={setPdfModal}
                pdfUrl={pdfUrl}
                setPdfUrl={setPdfUrl}
            />

            {/* Modal de WhatsApp */}
            <WhatsAppModal
                modalWhatsApp={whatsappModal}
                setModalWhatsApp={setWhatsappModal}
                cpe={cpe}
                setCpe={setCpe}
            />
        </div>
    );
}
