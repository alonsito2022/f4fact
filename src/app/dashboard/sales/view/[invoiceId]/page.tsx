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
import { downloadCpeFile } from "@/lib/downloadCpeFile";

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
            driveFirmaId
            driveCdrId
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
    const [pdfFileName, setPdfFileName] = useState<string>("");
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

    // El envio a la SUNAT ocurre en segundo plano en el backend: al abrir la
    // vista el comprobante todavia puede estar pendiente. Se vuelve a consultar
    // por HTTP cada 4 segundos mientras siga pendiente y se detiene solo en
    // cuanto SUNAT responde (no requiere WebSocket ni Channels).
    const saleQueryRef = useRef(saleQuery);
    useEffect(() => {
        saleQueryRef.current = saleQuery;
    }, [saleQuery]);

    const sendSunat = invoice?.sendSunat;
    const sunatStatus = invoice?.sunatStatus;

    // El backend puede dejar sendSunat en false aunque la SUNAT ya haya
    // respondido, asi que el estado real se deriva de los codigos y no de ese
    // booleano: si ya no esta pendiente, el spinner y la barra se ocultan.
    const sunatAceptado =
        Boolean(sunatStatus) || invoice?.operationStatus === "02";
    const sunatRechazado =
        invoice?.operationStatus === "06" ||
        invoice?.operationStatus === "07" ||
        (Boolean(sendSunat) && !sunatStatus && invoice?.operationStatus !== "01");
    const sunatPendiente =
        invoice?.operationStatus === "01" ||
        (!sunatAceptado && !sunatRechazado);

    const textoValidacion = sunatAceptado
        ? "Aceptada por la SUNAT"
        : sunatPendiente
        ? "Pendiente de validación por la SUNAT"
        : "Rechazada por la SUNAT";

    useEffect(() => {
        if (!invoiceId) return;
        // Si la SUNAT ya resolvio el comprobante no se vuelve a consultar.
        if (!sunatPendiente) return;

        const INTERVALO_MS = 4000;
        const MAX_INTENTOS = 30; // ~2 minutos como tope de seguridad
        let timer: ReturnType<typeof setInterval> | null = null;
        let intentos = 0;

        const stop = () => {
            if (!timer) return;
            clearInterval(timer);
            timer = null;
        };

        const consultar = () =>
            saleQueryRef.current({ variables: { id: invoiceId } });

        const start = (refrescarAhora: boolean) => {
            if (timer || document.hidden) return;
            // Al volver a la pestana se consulta de inmediato en vez de esperar.
            if (refrescarAhora) consultar();
            timer = setInterval(() => {
                intentos += 1;
                consultar();
                if (intentos >= MAX_INTENTOS) stop();
            }, INTERVALO_MS);
        };

        const onVisibilidad = () => (document.hidden ? stop() : start(true));

        start(false);
        document.addEventListener("visibilitychange", onVisibilidad);

        return () => {
            stop();
            document.removeEventListener("visibilitychange", onVisibilidad);
        };
    }, [invoiceId, sunatPendiente]);

    const handleDownload = downloadCpeFile;

    const handlePrint = () => {
        if (!invoice) {
            toast.error("No se puede imprimir: comprobante no disponible");
            return;
        }

        // Determinar el tipo de endpoint basándose en el tipo de documento
        const endpoint =
            String(invoice.documentType).replace("A_", "") === "07"
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

    // Pastilla de estado de la barra superior (presentacion, no logica).
    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case "02":
                return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/25";
            case "01":
                return "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-400/10 dark:text-blue-300 dark:ring-blue-400/25";
            case "06":
                return "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/25";
            case "07":
                return "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/25";
            default:
                return "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200 dark:bg-white/10 dark:text-slate-300 dark:ring-white/15";
        }
    };

    // Enlaces de XML/CDR: llegan del backend junto con el estado, asi que con
    // el refresco automatico aparecen solos en cuanto la SUNAT responde.
    // Se acepta cualquiera de los dos enlaces (normal o *Low) para no dejar el
    // boton oculto si el backend devuelve solo uno de ellos.
    const useDriveXml =
        invoice?.operationStatus === "02" && Boolean(invoice?.driveFirmaId);
    const tieneXml =
        useDriveXml ||
        Boolean(invoice?.linkXml) ||
        Boolean(invoice?.linkXmlLow);
    const xmlUrl: string =
        invoice?.linkXml || invoice?.linkXmlLow || "";

    const useDriveCdr =
        invoice?.operationStatus === "02" && Boolean(invoice?.driveCdrId);
    const tieneCdr =
        useDriveCdr ||
        Boolean(invoice?.linkCdr) ||
        Boolean(invoice?.linkCdrLow);
    const cdrUrl: string = invoice?.linkCdr || invoice?.linkCdrLow || "";

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
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
            {/* Barra superior */}
            <div className="border-b border-slate-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300">
                            <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={1.7}
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0v.75h-15v-.75Z"
                                />
                            </svg>
                        </span>
                        <div className="min-w-0">
                            <p className="truncate text-[13px] font-semibold text-slate-900 dark:text-white">
                                {invoice.subsidiary?.company?.businessName}
                            </p>
                            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                {invoice.subsidiary?.company?.doc}
                            </p>
                        </div>
                    </div>
                    <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                            invoice.operationStatus,
                        )}`}
                    >
                        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                        {invoice.operationStatusReadable}
                    </span>
                </div>
            </div>

            <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-6">
                <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-3">
                    {/* Columna principal */}
                    <div className="space-y-5 lg:col-span-2">
                        {/* Identidad del comprobante */}
                        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-gray-800 dark:ring-white/10">
                            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 dark:border-gray-700">
                                <div className="min-w-0">
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        {invoice.documentTypeReadable ||
                                            getDocumentTypeName(
                                                invoice.documentType,
                                            )}
                                    </p>
                                    <h1 className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-white">
                                        {invoice.serial}-{invoice.correlative}
                                    </h1>
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600 dark:bg-white/10 dark:text-slate-300">
                                        {invoice.currencyType}
                                    </span>
                                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600 dark:bg-white/10 dark:text-slate-300">
                                        {invoice.igvPercentage}%
 IGV
                                    </span>
                                    {invoice.client?.documentNumber && (
                                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600 dark:bg-white/10 dark:text-slate-300">
                                            {invoice.client?.documentNumber}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <dl className="grid grid-cols-1 gap-x-6 gap-y-4 px-5 py-5 sm:grid-cols-2">
                                <div>
                                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        Cliente
                                    </dt>
                                    <dd className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                                        {invoice.client?.names || "-"}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        Fecha de emisión
                                    </dt>
                                    <dd className="mt-1 text-sm font-medium tabular-nums text-slate-900 dark:text-white">
                                        {invoice.emitDate}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        {/* Resumen financiero */}
                        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-gray-800 dark:ring-white/10">
                            <div className="border-b border-slate-100 px-5 py-3 dark:border-gray-700">
                                <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Resumen financiero
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0 dark:divide-gray-700">
                                <div className="px-5 py-4">
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        Total
                                    </p>
                                    <p className="mt-1.5 text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
                                        S/{" "}
                                        {Number(invoice.totalAmount).toFixed(2)}
                                    </p>
                                </div>
                                <div className="px-5 py-4">
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        Importe pagado
                                    </p>
                                    <p className="mt-1.5 text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                                        S/{" "}
                                        {Number(invoice.totalPayed).toFixed(2)}
                                    </p>
                                </div>
                                <div className="px-5 py-4">
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        Diferencia (vuelto)
                                    </p>
                                    <p className="mt-1.5 text-2xl font-bold tabular-nums text-blue-600 dark:text-blue-400">
                                        S/{" "}
                                        {(
                                            Number(invoice.totalPayed) -
                                            Number(invoice.totalAmount)
                                        ).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Anulación */}
                        {invoice.operationStatus === "02" && (
                            <div className="rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-rose-100 dark:bg-gray-800 dark:ring-rose-400/20">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                                            Anulación
                                        </h2>
                                        <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
                                            Anular el comprobante o comunicar la
                                            baja ante la SUNAT
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (!invoice) {
                                                toast.error(
                                                    "No se puede anular: comprobante no disponible",
                                                );
                                                return;
                                            }

                                            const confirmDelete =
                                                window.confirm(
                                                    "¿Estás seguro de que deseas anular esta factura? Esta acción no se puede deshacer.",
                                                );

                                            if (confirmDelete) {
                                                handleCancelInvoice(
                                                    Number(invoice.id),
                                                    invoice.emitDate,
                                                    invoice
                                                        .documentType?.replace(
                                                            "A_",
                                                            "",
                                                        ) || "",
                                                );
                                            }
                                        }}
                                        disabled={cancelLoading}
                                        className="inline-flex h-9 items-center justify-center rounded-lg border border-rose-200 bg-white px-4 text-[13px] font-semibold text-rose-700 shadow-sm transition-colors hover:border-rose-300 hover:bg-rose-50 focus:outline-none focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-400/40 dark:bg-transparent dark:text-rose-300 dark:hover:bg-rose-500/10 dark:focus:ring-rose-500/20"
                                    >
                                        {cancelLoading
                                            ? "Anulando..."
                                            : "ANULAR O COMUNICAR DE BAJA"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Columna lateral */}
                    <div className="space-y-5">
                        {/* Estado SUNAT */}
                        <div
                            className={`overflow-hidden rounded-2xl shadow-sm ring-1 ${
                                sunatAceptado
                                    ? "bg-emerald-50/70 ring-emerald-200 dark:bg-emerald-400/5 dark:ring-emerald-400/25"
                                    : sunatPendiente
                                    ? "bg-amber-50/70 ring-amber-200 dark:bg-amber-400/5 dark:ring-amber-400/25"
                                    : "bg-rose-50/70 ring-rose-200 dark:bg-rose-400/5 dark:ring-rose-400/25"
                            }`}
                        >
                            <div className="border-b border-white/70 px-5 py-3 dark:border-white/5">
                                <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/80 shadow-sm dark:bg-white/10">
                                        <svg
                                            className="h-3.5 w-3.5 text-slate-500 dark:text-slate-300"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={1.8}
                                            viewBox="0 0 24 24"
                                            aria-hidden="true"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
                                            />
                                        </svg>
                                    </span>
                                    Estado en la SUNAT
                                </h2>
                            </div>

                            <div className="space-y-3 px-5 py-4">
                                {/* Validación */}
                                <div className="flex items-start gap-3">
                                    <span
                                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                                            sunatAceptado
                                                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-400"
                                                : sunatPendiente
                                                ? "bg-amber-100 text-amber-600 dark:bg-amber-400/15 dark:text-amber-400"
                                                : "bg-rose-100 text-rose-600 dark:bg-rose-400/15 dark:text-rose-400"
                                        }`}
                                    >
                                        {sunatPendiente ? (
                                            <LoadingIcon />
                                        ) : sunatAceptado ? (
                                            <svg
                                                className="h-3.5 w-3.5"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                                viewBox="0 0 24 24"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="m4.5 12.75 6 6 9-13.5"
                                                />
                                            </svg>
                                        ) : (
                                            <svg
                                                className="h-3.5 w-3.5"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                                viewBox="0 0 24 24"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M6 18 18 6M6 6l12 12"
                                                />
                                            </svg>
                                        )}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                            Validación
                                        </p>
                                        <p className="mt-0.5 flex items-center gap-2 text-[13px] font-semibold text-slate-900 dark:text-white">
                                            {textoValidacion}
                                        </p>
                                    </div>
                                </div>

                                {invoice.sunatDescription && (
                                    <p className="border-t border-white/70 pt-3 text-[13px] leading-relaxed text-slate-600 dark:border-white/5 dark:text-slate-300">
                                        {invoice.sunatDescription}
                                    </p>
                                )}

                                {/* Botones de descarga de XML y CDR: aparecen
                                    solos cuando el refresco los trae */}
                                <div className="border-t border-white/70 pt-3 dark:border-white/5">
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        Descargas
                                    </p>
                                    <div className="mt-2 grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            disabled={!tieneXml}
                                            onClick={() =>
                                                handleDownload(
                                                    xmlUrl,
                                                    invoice.fileNameXml,
                                                    useDriveXml
                                                        ? "firma"
                                                        : undefined,
                                                    useDriveXml
                                                        ? invoice.id
                                                        : undefined,
                                                )
                                            }
                                            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-white/80 px-2 text-[12px] font-semibold text-emerald-700 shadow-sm transition-colors hover:border-emerald-300 hover:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-200/70 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-transparent disabled:text-slate-400 disabled:opacity-70 dark:border-emerald-400/40 dark:bg-transparent dark:text-emerald-300 dark:hover:bg-emerald-500/15 dark:focus:ring-emerald-500/30 dark:disabled:border-gray-700 dark:disabled:text-slate-600 [&>svg]:h-4 [&>svg]:w-4"
                                        >
                                            <svg
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            XML
                                        </button>
                                        <button
                                            type="button"
                                            disabled={!tieneCdr}
                                            onClick={() =>
                                                handleDownload(
                                                    cdrUrl,
                                                    invoice.fileNameCdr,
                                                    useDriveCdr
                                                        ? "cdr"
                                                        : undefined,
                                                    useDriveCdr
                                                        ? invoice.id
                                                        : undefined,
                                                )
                                            }
                                            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-white/80 px-2 text-[12px] font-semibold text-blue-700 shadow-sm transition-colors hover:border-blue-300 hover:bg-white focus:outline-none focus:ring-4 focus:ring-blue-200/70 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-transparent disabled:text-slate-400 disabled:opacity-70 dark:border-blue-400/40 dark:bg-transparent dark:text-blue-300 dark:hover:bg-blue-500/15 dark:focus:ring-blue-500/30 dark:disabled:border-gray-700 dark:disabled:text-slate-600 [&>svg]:h-4 [&>svg]:w-4"
                                        >
                                            <svg
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            CDR
                                        </button>
                                    </div>
                                    {(!tieneXml || !tieneCdr) && (
                                        <p className="mt-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                                            {tieneXml
                                                ? "El CDR estara disponible cuando la SUNAT responda"
                                                : "El XML estara disponible cuando la SUNAT responda"}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Acciones */}
                        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-gray-800 dark:ring-white/10">
                            <div className="border-b border-slate-100 px-5 py-3 dark:border-gray-700">
                                <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Acciones
                                </h2>
                            </div>
                            <div className="space-y-2 p-4">
                                <button
                                    onClick={handlePrint}
                                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/20 dark:bg-white dark:text-slate-900 dark:hover:bg-white/90 dark:focus:ring-white/25 [&>svg]:h-4 [&>svg]:w-4"
                                >
                                    <svg
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    IMPRIMIR
                                </button>

                                <button
                                    onClick={() => {
                                        const documentType = String(
                                            invoice.documentType,
                                        ).replace("A_", "");
                                        const endpoint =
                                            documentType === "07"
                                                ? "print_credit_note"
                                                : "print_invoice";
                                        const pdfUrl = `${process.env.NEXT_PUBLIC_BASE_API}/operations/${endpoint}/${invoice.id}/`;
                                        setPdfUrl(pdfUrl);
                                        setPdfFileName(
                                            `${invoice.subsidiary?.company?.doc}-${documentType}-${invoice.serial}-${invoice.correlative}.pdf`,
                                        );
                                        pdfModal?.show();
                                    }}
                                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 text-[13px] font-semibold text-rose-700 shadow-sm transition-colors hover:border-rose-300 hover:bg-rose-100 focus:outline-none focus:ring-4 focus:ring-rose-200/70 dark:border-rose-400/40 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20 dark:focus:ring-rose-500/30 [&>svg]:h-4 [&>svg]:w-4"
                                >
                                    <svg
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    VER PDF
                                </button>


                                <div className="!my-3 border-t border-slate-100 dark:border-gray-700" />

                                <button
                                    onClick={handleWhatsAppClick}
                                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-emerald-300 bg-emerald-100/80 px-4 text-[13px] font-semibold text-emerald-800 shadow-sm transition-colors hover:border-emerald-400 hover:bg-emerald-100 focus:outline-none focus:ring-4 focus:ring-emerald-200/80 dark:border-emerald-400/40 dark:bg-emerald-500/20 dark:text-emerald-200 dark:hover:bg-emerald-500/30 dark:focus:ring-emerald-500/30 [&>svg]:h-4 [&>svg]:w-4"
                                >
                                    <svg
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                                    </svg>
                                    Enviar por WhatsApp
                                </button>

                                <div className="grid grid-cols-1 gap-2">
                                    <button
                                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 text-[13px] font-medium text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-100 focus:outline-none focus:ring-4 focus:ring-blue-200/70 dark:border-blue-400/40 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20 dark:focus:ring-blue-500/20"
                                        onClick={() =>
                                            router.push(
                                                "/dashboard/sales/new/01",
                                            )
                                        }
                                    >
                                        GENERAR OTRA FACTURA
                                    </button>
                                    <button
                                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 text-[13px] font-medium text-indigo-700 transition-colors hover:border-indigo-300 hover:bg-indigo-100 focus:outline-none focus:ring-4 focus:ring-indigo-200/70 dark:border-indigo-400/40 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20 dark:focus:ring-indigo-500/20"
                                        onClick={() =>
                                            router.push(
                                                "/dashboard/sales/new/03",
                                            )
                                        }
                                    >
                                        GENERAR OTRA BOLETA DE VENTA
                                    </button>
                                    <button
                                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 text-[13px] font-medium text-sky-700 transition-colors hover:border-sky-300 hover:bg-sky-100 focus:outline-none focus:ring-4 focus:ring-sky-200/70 dark:border-sky-400/40 dark:bg-sky-500/10 dark:text-sky-300 dark:hover:bg-sky-500/20 dark:focus:ring-sky-500/20"
                                        onClick={() =>
                                            router.push("/dashboard/sales")
                                        }
                                    >
                                        VER TODAS LAS VENTAS
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de PDF usando PdfPreviewModal */}
            <PdfPreviewModal
                pdfModal={pdfModal}
                setPdfModal={setPdfModal}
                pdfUrl={pdfUrl}
                setPdfUrl={setPdfUrl}
                pdfFileName={pdfFileName}
                setPdfFileName={setPdfFileName}
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
