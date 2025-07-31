"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";

export default function PaymentSuccessPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");
    const currency = searchParams.get("currency");
    const status = searchParams.get("status");
    const transactionId = searchParams.get("transactionId");

    const [pdfGenerated, setPdfGenerated] = useState(false);

    // Función para formatear el monto correctamente
    const formatAmount = (amount: string | null) => {
        if (!amount) return "S/ 0.00";

        // Convertir de centavos a soles
        const numAmount = parseFloat(amount) / 100;

        return new Intl.NumberFormat("es-PE", {
            style: "currency",
            currency: "PEN",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(numAmount);
    };

    // Función para generar PDF del comprobante
    const generatePDF = () => {
        if (pdfGenerated) return;

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // Configurar fuente
        doc.setFont("helvetica");
        doc.setFontSize(24);

        // Título
        doc.setTextColor(34, 197, 94); // Verde
        doc.text("¡PAGO EXITOSO!", pageWidth / 2, 40, { align: "center" });

        // Información del pago
        doc.setFontSize(12);
        doc.setTextColor(55, 65, 81); // Gris oscuro

        let yPosition = 70;

        // Línea divisoria
        doc.setDrawColor(229, 231, 235);
        doc.line(20, yPosition - 10, pageWidth - 20, yPosition - 10);
        yPosition += 20;

        // Detalles del pago
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Detalles del Pago:", 20, yPosition);
        yPosition += 15;

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");

        // Monto
        doc.text("Monto:", 20, yPosition);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(59, 130, 246); // Azul
        doc.text(formatAmount(amount), pageWidth - 20, yPosition, {
            align: "right",
        });
        yPosition += 10;

        // Moneda
        doc.setFont("helvetica", "normal");
        doc.setTextColor(55, 65, 81);
        doc.text("Moneda:", 20, yPosition);
        doc.text(currency || "PEN", pageWidth - 20, yPosition, {
            align: "right",
        });
        yPosition += 10;

        // Estado
        doc.text("Estado:", 20, yPosition);
        doc.setTextColor(34, 197, 94); // Verde
        doc.text(status || "PAID", pageWidth - 20, yPosition, {
            align: "right",
        });
        yPosition += 15;

        // Información adicional
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(55, 65, 81);
        doc.text("Información Adicional:", 20, yPosition);
        yPosition += 15;

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");

        // Order ID
        doc.text("Order ID:", 20, yPosition);
        doc.text(orderId || "", pageWidth - 20, yPosition, { align: "right" });
        yPosition += 10;

        // Transaction ID
        doc.text("Transaction ID:", 20, yPosition);
        doc.text(transactionId || "", pageWidth - 20, yPosition, {
            align: "right",
        });
        yPosition += 15;

        // Fecha y hora
        const now = new Date();
        const formattedDate = now.toLocaleDateString("es-PE", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });

        doc.setFontSize(10);
        doc.setTextColor(107, 114, 128); // Gris claro
        doc.text(
            `Generado el: ${formattedDate}`,
            pageWidth / 2,
            pageHeight - 20,
            { align: "center" }
        );

        // Guardar PDF
        const fileName = `comprobante_pago_${orderId || "unknown"}.pdf`;
        doc.save(fileName);
        setPdfGenerated(true);
    };

    useEffect(() => {
        // Generar PDF automáticamente después de 2 segundos
        const timer = setTimeout(() => {
            generatePDF();
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
                {/* Icono de éxito */}
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <svg
                        className="w-8 h-8 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                </div>

                {/* Título */}
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    ¡Pago Exitoso!
                </h1>
                <p className="text-gray-600 mb-8">
                    Tu transacción ha sido procesada correctamente
                </p>

                {/* Detalles del pago */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Monto:</span>
                            <span className="text-2xl font-bold text-blue-600">
                                {formatAmount(amount)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Estado:</span>
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                {status || "PAID"}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Order ID:</span>
                            <span className="text-sm text-gray-500 font-mono">
                                {orderId || "N/A"}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">
                                Transaction ID:
                            </span>
                            <span className="text-sm text-gray-500 font-mono">
                                {transactionId || "N/A"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Botones */}
                <div className="space-y-3">
                    <button
                        onClick={generatePDF}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                    >
                        Descargar Comprobante
                    </button>
                    <button
                        onClick={() =>
                            (window.location.href =
                                "/dashboard/payment-balance")
                        }
                        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors"
                    >
                        Volver al Balance
                    </button>
                </div>

                {/* Información adicional */}
                <div className="mt-8 text-sm text-gray-500">
                    <p>
                        Un comprobante ha sido enviado a tu correo electrónico.
                    </p>
                    <p className="mt-2">
                        Si tienes alguna pregunta, contacta a nuestro soporte.
                    </p>
                </div>
            </div>
        </div>
    );
}
