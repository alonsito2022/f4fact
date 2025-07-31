"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function PaymentSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const orderId = searchParams.get("orderId") || "";
    const amount = searchParams.get("amount") || "";
    const currency = searchParams.get("currency") || "PEN";
    const status = searchParams.get("status") || "";
    const transactionId = searchParams.get("transactionId") || "";

    const [isLoading, setIsLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        // Simular un pequeño delay para mostrar la animación
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    const handleReturnToBalance = () => {
        router.push("/dashboard/payment-balance");
    };

    const handleDownloadReceipt = async () => {
        setDownloading(true);
        try {
            // Opción 1: Generar PDF del lado del cliente (usando jsPDF)
            await generateClientSidePDF();

            // Opción 2: Solicitar PDF del servidor (descomenta si tienes un endpoint)
            // await downloadServerPDF();

            toast.success("Recibo descargado exitosamente");
        } catch (error) {
            console.error("Error descargando recibo:", error);
            toast.error("Error al descargar el recibo");
        } finally {
            setDownloading(false);
        }
    };

    const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    };

    const generateClientSidePDF = async () => {
        // Importar jsPDF dinámicamente
        const { jsPDF } = await import("jspdf");

        const doc = new jsPDF();

        // Configurar fuente y estilos
        doc.setFont("helvetica");

        // Intentar cargar el logo de Izipay en todo el ancho
        try {
            const logoUrl = "/images/logo-izipay-banner-1140x100.png";
            const img = await loadImage(logoUrl);
            // Usar el logo en todo el ancho del documento (210mm)
            doc.addImage(img, "PNG", 0, 10, 210, 20);
        } catch (error) {
            // Fallback: texto del logo centrado
            doc.setTextColor(220, 53, 69); // Rojo de Izipay
            doc.setFontSize(18);
            doc.setFont("helvetica", "bold");
            doc.text("izi", 85, 20);
            doc.setTextColor(32, 201, 151); // Color teal para "pay"
            doc.text("pay", 100, 20);
        }

        // Mensaje principal de confirmación (más espacio desde el logo)
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setFont("helvetica", "normal");
        doc.text(
            "Su solicitud de pago se ha registrado satisfactoriamente.",
            105,
            45,
            { align: "center" }
        );

        // Título de detalles del pago (más espacio)
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("Detalles del pago", 20, 65);

        // Línea separadora
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.line(20, 70, 190, 70);

        // Información de la tienda con mejor espaciado
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");

        let yPosition = 85;
        const lineHeight = 10; // Espaciado consistente entre líneas

        // TIENDA
        doc.setFont("helvetica", "bold");
        doc.text("TIENDA:", 20, yPosition);
        doc.setFont("helvetica", "normal");
        doc.text("IZI*4Soluciones SAC", 80, yPosition);

        yPosition += lineHeight;

        // Dirección URL
        doc.setFont("helvetica", "bold");
        doc.text("Dirección URL:", 20, yPosition);
        doc.setFont("helvetica", "normal");
        doc.text("https://secure.micuentaweb.pe", 80, yPosition);

        yPosition += lineHeight;

        // Identificador de la tienda
        doc.setFont("helvetica", "bold");
        doc.text("Identificador de la tienda:", 20, yPosition);
        doc.setFont("helvetica", "normal");
        doc.text("81325114", 80, yPosition);

        yPosition += lineHeight;

        // Referencia pedido
        doc.setFont("helvetica", "bold");
        doc.text("Referencia pedido:", 20, yPosition);
        doc.setFont("helvetica", "normal");
        doc.text(orderId, 80, yPosition);

        yPosition += lineHeight + 5; // Espacio extra antes de la línea separadora

        // Línea separadora antes del método de pago
        doc.line(20, yPosition, 190, yPosition);
        yPosition += lineHeight;

        // Método de pago y monto
        doc.setFont("helvetica", "bold");
        doc.text("Método de pago:", 20, yPosition);
        doc.setFont("helvetica", "normal");

        // Simular logo de tarjeta (texto simple)
        doc.setFontSize(10);
        doc.text("[TARJETA]", 80, yPosition);
        doc.text("Tarjeta de Crédito/Débito:", 110, yPosition);
        doc.setFont("helvetica", "bold");
        doc.text(formatAmount(amount), 160, yPosition);

        yPosition += lineHeight + 5;

        // Detalles de la transacción
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Detalles de la transacción:", 20, yPosition);

        yPosition += lineHeight;

        // Fecha y hora
        doc.setFont("helvetica", "bold");
        doc.text("Fecha / Hora:", 20, yPosition);
        doc.setFont("helvetica", "normal");
        doc.text(
            new Date().toLocaleDateString("es-PE", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            }) +
                " / " +
                new Date().toLocaleTimeString("es-PE", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                }) +
                " (GMT-5)",
            80,
            yPosition
        );

        yPosition += lineHeight;

        // Número de tarjeta (simulado)
        doc.setFont("helvetica", "bold");
        doc.text("Número de tarjeta:", 20, yPosition);
        doc.setFont("helvetica", "normal");
        doc.text("**** **** **** ****", 80, yPosition);

        yPosition += lineHeight;

        // Número de autorización
        if (transactionId) {
            doc.setFont("helvetica", "bold");
            doc.text("Número de autorización:", 20, yPosition);
            doc.setFont("helvetica", "normal");
            doc.text(transactionId.substring(0, 8), 80, yPosition);

            yPosition += lineHeight;
        }

        // Número de afiliación
        doc.setFont("helvetica", "bold");
        doc.text("Número de afiliación:", 20, yPosition);
        doc.setFont("helvetica", "normal");
        doc.text("5855595", 80, yPosition);

        yPosition += lineHeight;

        // Número de transacción
        doc.setFont("helvetica", "bold");
        doc.text("Número de transacción:", 20, yPosition);
        doc.setFont("helvetica", "normal");
        doc.text(transactionId || "N/A", 80, yPosition);

        yPosition += lineHeight;

        // Modo de pago
        doc.setFont("helvetica", "bold");
        doc.text("Modo de pago:", 20, yPosition);
        doc.setFont("helvetica", "normal");
        doc.text("Sin cuotas", 80, yPosition);

        yPosition += lineHeight;

        // Estado del pago
        doc.setFont("helvetica", "bold");
        doc.text("Estado:", 20, yPosition);
        doc.setFont("helvetica", "normal");
        doc.text(status === "PAID" ? "PAGADO" : status, 80, yPosition);

        // Información adicional al final (más espacio)
        yPosition += lineHeight + 10;
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(
            "Este documento es un comprobante de pago electrónico.",
            105,
            yPosition,
            { align: "center" }
        );

        yPosition += 8;
        doc.text("SISTEMAS DE TECNOLOGIA 4 SOLUCIONES S.A.C.", 105, yPosition, {
            align: "center",
        });

        yPosition += 8;
        doc.text("Gracias por su pago", 105, yPosition, { align: "center" });

        // Agregar marca de agua o sello de seguridad
        yPosition += 10;
        doc.setFontSize(8);
        doc.setTextColor(200, 200, 200);
        doc.text("Documento generado electrónicamente", 105, yPosition, {
            align: "center",
        });

        // Descargar el PDF
        doc.save(`comprobante-izipay-${orderId}.pdf`);
    };

    const downloadServerPDF = async () => {
        // Esta función se puede usar si tienes un endpoint en el servidor para generar PDFs
        const response = await fetch("/api/payment/receipt", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                orderId,
                amount,
                currency,
                status,
                transactionId,
            }),
        });

        if (!response.ok) {
            throw new Error("Error generando PDF");
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `recibo-${orderId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    const formatAmount = (amount: string) => {
        const numAmount = parseFloat(amount);
        return numAmount.toLocaleString("es-PE", {
            style: "currency",
            currency: currency,
            minimumFractionDigits: 2,
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">
                        Procesando pago...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            <div className="max-w-2xl mx-auto py-16 px-4">
                {/* Success Icon */}
                <div className="text-center mb-8">
                    <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 dark:bg-green-900 mb-6">
                        <svg
                            className="h-12 w-12 text-green-600 dark:text-green-400"
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
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        ¡Pago Exitoso!
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Tu pago ha sido procesado correctamente
                    </p>
                </div>

                {/* Payment Details */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
                        Detalles del Pago
                    </h2>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-gray-600 dark:text-gray-400 font-medium">
                                Estado:
                            </span>
                            <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium">
                                {status === "PAID" ? "PAGADO" : status}
                            </span>
                        </div>

                        <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-gray-600 dark:text-gray-400 font-medium">
                                Monto:
                            </span>
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                {formatAmount(amount)}
                            </span>
                        </div>

                        <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-gray-600 dark:text-gray-400 font-medium">
                                Número de Orden:
                            </span>
                            <span className="text-gray-900 dark:text-white font-mono">
                                {orderId}
                            </span>
                        </div>

                        {transactionId && (
                            <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                                <span className="text-gray-600 dark:text-gray-400 font-medium">
                                    ID de Transacción:
                                </span>
                                <span className="text-gray-900 dark:text-white font-mono text-sm">
                                    {transactionId}
                                </span>
                            </div>
                        )}

                        <div className="flex justify-between items-center py-3">
                            <span className="text-gray-600 dark:text-gray-400 font-medium">
                                Fecha:
                            </span>
                            <span className="text-gray-900 dark:text-white">
                                {new Date().toLocaleDateString("es-PE", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                    <button
                        onClick={handleDownloadReceipt}
                        disabled={downloading}
                        className={`w-full font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center ${
                            downloading
                                ? "bg-gray-400 cursor-not-allowed text-white"
                                : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
                        }`}
                    >
                        {downloading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Generando PDF...
                            </>
                        ) : (
                            <>
                                <svg
                                    className="w-5 h-5 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                                Descargar Recibo
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleReturnToBalance}
                        className="w-full bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                    >
                        Volver al Balance de Pagos
                    </button>
                </div>

                {/* Additional Information */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        ¿Necesitas ayuda?
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Contacta con nuestro equipo de soporte si tienes alguna
                        pregunta sobre tu pago.
                    </p>
                </div>
            </div>
        </div>
    );
}
