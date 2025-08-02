"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { usePaymentEvents } from "@/hooks/usePaymentEvents";

interface PaymentCancelData {
    operationId: number;
    amount: number;
    description: string;
    cardInfo: {
        cardType?: string;
        cardBrand?: string;
        lastFourDigits?: string;
        installments?: number;
        totalAmount?: number;
    };
    clientInfo: {
        ipAddress?: string;
        userAgent?: string;
    };
    paymentData: any;
    timestamp: string;
}

export default function PaymentCancelPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { events } = usePaymentEvents();

    const [paymentData, setPaymentData] = useState<PaymentCancelData | null>(
        null
    );
    const [isProcessing, setIsProcessing] = useState(false);

    // Parámetros de la URL de Izipay
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");
    const currency = searchParams.get("currency");
    const status = searchParams.get("status");

    // Función para recuperar datos guardados
    const retrieveStoredPaymentData = (): PaymentCancelData | null => {
        try {
            const storedData = localStorage.getItem("izipay_payment_data");
            if (storedData) {
                const data = JSON.parse(storedData);
                console.log("📥 Datos de pago cancelado recuperados:", data);
                return data;
            }
        } catch (error) {
            console.warn("Error al recuperar datos de pago cancelado:", error);
        }
        return null;
    };

    // Función para limpiar datos guardados
    const clearStoredPaymentData = () => {
        localStorage.removeItem("izipay_payment_data");
        console.log("🗑️ Datos de pago cancelado limpiados");
    };

    // Función para procesar el pago cancelado
    const processCancelledPayment = async (storedData: PaymentCancelData) => {
        setIsProcessing(true);

        try {
            console.log(
                "🎯 Procesando pago cancelado con datos completos:",
                storedData
            );

            // Evento: Usuario canceló el pago
            await events.userCancelledPayment(storedData.operationId, {
                orderId,
                amount: parseFloat(amount || "0"),
                currency: currency || "PEN",
                status: status || "CANCELLED",
                cardInfo: storedData.cardInfo,
                clientInfo: storedData.clientInfo,
                cardType: storedData.cardInfo.cardType,
                cardBrand: storedData.cardInfo.cardBrand,
                lastFourDigits: storedData.cardInfo.lastFourDigits,
                installments: storedData.cardInfo.installments,
                ipAddress: storedData.clientInfo.ipAddress,
                userAgent: storedData.clientInfo.userAgent,
                timestamp: storedData.timestamp,
            });

            console.log("✅ Pago cancelado procesado con éxito");
            toast.info("Pago cancelado por el usuario");

            // Limpiar datos guardados
            clearStoredPaymentData();
        } catch (error) {
            console.error("❌ Error al procesar pago cancelado:", error);
            toast.error("Error al procesar el pago cancelado");
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        // Recuperar datos guardados
        const storedData = retrieveStoredPaymentData();

        if (storedData) {
            setPaymentData(storedData);

            // Procesar el pago cancelado
            processCancelledPayment(storedData);
        } else {
            console.warn(
                "⚠️ No se encontraron datos de pago cancelado guardados"
            );
            toast.warning(
                "No se pudieron recuperar los datos del pago cancelado"
            );
        }
    }, []);

    if (isProcessing) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Procesando cancelación...
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Registrando información de cancelación
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            <div className="max-w-4xl mx-auto py-8 px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="mb-4">
                        <svg
                            className="w-16 h-16 text-orange-500 mx-auto"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Pago Cancelado
                    </h1>
                    <p className="text-xl text-gray-700 dark:text-gray-300 mb-6">
                        El pago ha sido cancelado por el usuario
                    </p>
                </div>

                {/* Payment Details */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Detalles de la Cancelación
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Información de la Transacción */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                Transacción
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        ID de Orden:
                                    </span>
                                    <span className="font-medium">
                                        {orderId}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Monto:
                                    </span>
                                    <span className="font-medium">
                                        S/ {amount}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Estado:
                                    </span>
                                    <span className="font-medium text-orange-600">
                                        {status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Información de la Tarjeta */}
                        {paymentData?.cardInfo && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                    Tarjeta
                                </h3>
                                <div className="space-y-2">
                                    {paymentData.cardInfo.cardType && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">
                                                Tipo:
                                            </span>
                                            <span className="font-medium">
                                                {paymentData.cardInfo.cardType}
                                            </span>
                                        </div>
                                    )}
                                    {paymentData.cardInfo.cardBrand && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">
                                                Marca:
                                            </span>
                                            <span className="font-medium">
                                                {paymentData.cardInfo.cardBrand}
                                            </span>
                                        </div>
                                    )}
                                    {paymentData.cardInfo.lastFourDigits && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">
                                                Últimos 4 dígitos:
                                            </span>
                                            <span className="font-medium">
                                                ****{" "}
                                                {
                                                    paymentData.cardInfo
                                                        .lastFourDigits
                                                }
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Información del Cliente */}
                    {paymentData?.clientInfo && (
                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                Información del Cliente
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {paymentData.clientInfo.ipAddress && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            IP:
                                        </span>
                                        <span className="font-medium text-sm">
                                            {paymentData.clientInfo.ipAddress}
                                        </span>
                                    </div>
                                )}
                                {paymentData.clientInfo.userAgent && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            Navegador:
                                        </span>
                                        <span className="font-medium text-sm truncate">
                                            {paymentData.clientInfo.userAgent}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="text-center space-y-4">
                    <button
                        onClick={() =>
                            router.push("/dashboard/payment-balance")
                        }
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                    >
                        Volver al Balance de Pagos
                    </button>
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                        Ir al Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}
