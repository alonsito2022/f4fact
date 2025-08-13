"use client";
import { Modal } from "flowbite";
import { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import PdfPreviewModal from "../sales/PdfPreviewModal";

interface Document {
    id: number;
    date: string;
    description: string;
    total: number;
    status: string;
    documentType: string;
    serial: string;
    correlative: number;
}

interface Payment {
    id: number;
    date: string;
    description: string;
    total: number;
    wayPay: string;
}

interface PaymentBalanceProps {
    totalPending: number;
    lastUpdate: string;
    documents: Document[];
    payments: Payment[];
}

export default function PaymentBalanceComponent({
    totalPending,
    lastUpdate,
    documents,
    payments,
}: PaymentBalanceProps) {
    const router = useRouter();
    const [pdfModal, setPdfModal] = useState<Modal | null>(null);

    const [pdfUrl, setPdfUrl] = useState<string>("");

    const handlePayAll = () => {
        toast.info("Funcionalidad de pago en desarrollo");
    };

    const handleAutoPayment = () => {
        toast.info("Funcionalidad de pago automático en desarrollo");
    };

    const handlePayDocument = (
        documentId: number,
        total: number,
        description: string,
        serial: string,
        correlative: number
    ) => {
        // Redirigir a la página de pago con los parámetros necesarios
        const params = new URLSearchParams({
            documentId: documentId.toString(),
            amount: total.toFixed(2),
            orderNumber: `${serial}-${correlative}`,
            description: description,
        });

        router.push(`/dashboard/payment-balance/payment?${params.toString()}`);
    };

    const handleViewPDF = (doc: Document) => {
        toast.info(`Abriendo PDF para ${doc.description}`);
    };

    const handleViewDetails = (doc: Document) => {
        toast.info(`Mostrando detalles para ${doc.description}`);
    };

    return (
        <>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Balance de pagos
                    </h1>
                    <p className="text-xl text-gray-700 dark:text-gray-300 mb-6">
                        SISTEMAS DE TECNOLOGIA 4 SOLUCIONES S.A.C.
                    </p>
                    <div className="mb-6">
                        <div className="text-5xl font-bold text-red-600 mb-2">
                            S/{totalPending?.toFixed(2)}
                        </div>
                        <div className="flex items-center justify-center text-red-600">
                            <span className="text-lg">
                                Saldo por pagar S/{totalPending?.toFixed(2)}
                            </span>
                            <svg
                                className="w-5 h-5 ml-2"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                    </div>
                    <div className="space-y-4 mb-6">
                        <button
                            onClick={handlePayAll}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
                        >
                            PAGAR TODO S/{totalPending?.toFixed(2)}
                        </button>
                        <div>
                            <button
                                onClick={handleAutoPayment}
                                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg flex items-center mx-auto transition-colors"
                            >
                                <svg
                                    className="w-5 h-5 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                </svg>
                                AFILIARSE A PAGO AUTOMÁTICO
                            </button>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Última actualización: {lastUpdate}
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                    {/* Columna izquierda - Documentos */}
                    <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
                            DOCUMENTOS
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-600">
                                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Fecha
                                        </th>
                                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Descripción
                                        </th>
                                        <th className="text-right py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            TOTAL
                                        </th>
                                        <th className="text-center py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            PAGAR
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {documents?.map((doc) => (
                                        <tr
                                            key={doc.id}
                                            className="border-b border-gray-100 dark:border-gray-600"
                                        >
                                            <td className="py-3 px-2 text-sm text-gray-900 dark:text-white">
                                                {doc.date}
                                            </td>
                                            <td className="py-3 px-2 text-sm text-gray-900 dark:text-white">
                                                <div className="flex items-center space-x-2">
                                                    <span>
                                                        {doc.description}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            handleViewDetails(
                                                                doc
                                                            )
                                                        }
                                                        className="text-gray-500 hover:text-blue-600"
                                                        title="Ver detalles"
                                                    >
                                                        <svg
                                                            className="w-4 h-4"
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setPdfUrl(
                                                                `${process.env.NEXT_PUBLIC_BASE_API}/operations/print_invoice/${doc.id}/`
                                                            );
                                                            pdfModal?.show();
                                                        }}
                                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                                        title="Ver PDF"
                                                        type="button"
                                                    >
                                                        [PDF]
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="py-3 px-2 text-sm text-right text-gray-900 dark:text-white font-medium">
                                                S/{doc.total.toFixed(2)}
                                            </td>
                                            <td className="py-3 px-2 text-center">
                                                {doc.status === "PENDIENTE" ? (
                                                    <button
                                                        onClick={() =>
                                                            handlePayDocument(
                                                                doc.id,
                                                                doc.total,
                                                                doc.description,
                                                                doc.serial,
                                                                doc.correlative
                                                            )
                                                        }
                                                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1 rounded transition-colors"
                                                    >
                                                        PENDIENTE
                                                    </button>
                                                ) : doc.status ===
                                                  "EN VALIDACIÓN" ? (
                                                    <span className="bg-green-600 text-white text-xs font-medium px-3 py-1 rounded whitespace-nowrap">
                                                        EN VALIDACIÓN
                                                    </span>
                                                ) : doc.status === "PAGADO" ? (
                                                    <span className="bg-red-600 text-white text-xs font-medium px-3 py-1 rounded">
                                                        PAGADO
                                                    </span>
                                                ) : (
                                                    <span className="bg-red-600 text-white text-xs font-medium px-3 py-1 rounded">
                                                        CANCELADO
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {/* Columna derecha - Pagos realizados */}
                    <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
                            PAGOS O DEPÓSITOS EFECTUADOS
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-600">
                                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Fecha
                                        </th>
                                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Descripción
                                        </th>
                                        <th className="text-right py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            TOTAL
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments?.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={3}
                                                className="text-center py-6 text-gray-400"
                                            >
                                                No hay pagos registrados.
                                            </td>
                                        </tr>
                                    ) : (
                                        payments?.map((payment) => (
                                            <tr
                                                key={payment.id}
                                                className="border-b border-gray-100 dark:border-gray-600"
                                            >
                                                <td className="py-3 px-2 text-sm text-gray-900 dark:text-white">
                                                    {payment.date}
                                                </td>
                                                <td className="py-3 px-2 text-sm text-gray-900 dark:text-white">
                                                    {payment.description}
                                                </td>
                                                <td className="py-3 px-2 text-sm text-right text-gray-900 dark:text-white font-medium">
                                                    S/{payment.total.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <PdfPreviewModal
                pdfModal={pdfModal}
                setPdfModal={setPdfModal}
                pdfUrl={pdfUrl}
                setPdfUrl={setPdfUrl}
            />
        </>
    );
}
