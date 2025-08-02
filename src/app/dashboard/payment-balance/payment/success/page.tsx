"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { usePaymentEvents } from "@/hooks/usePaymentEvents";

interface PaymentSuccessData {
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

export default function PaymentSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { events } = usePaymentEvents();

    const [paymentData, setPaymentData] = useState<PaymentSuccessData | null>(
        null
    );
    const [isProcessing, setIsProcessing] = useState(false);

    // Parámetros de la URL de Izipay
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");
    const currency = searchParams.get("currency");
    const status = searchParams.get("status");
    const transactionId = searchParams.get("transactionId");

    // Función para recuperar datos guardados
    const retrieveStoredPaymentData = (): PaymentSuccessData | null => {
        try {
            const storedData = localStorage.getItem("izipay_payment_data");
            if (storedData) {
                const data = JSON.parse(storedData);
                console.log(
                    "📥 Datos de pago recuperados en página de éxito:",
                    data
                );
                return data;
            }
        } catch (error) {
            console.warn("Error al recuperar datos de pago:", error);
        }
        return null;
    };

    // Función para limpiar datos guardados
    const clearStoredPaymentData = () => {
        localStorage.removeItem("izipay_payment_data");
        console.log("🗑️ Datos de pago limpiados desde página de éxito");
    };

    // Función para procesar el pago exitoso
    const processSuccessfulPayment = async (storedData: PaymentSuccessData) => {
        setIsProcessing(true);

        try {
            console.log(
                "🎯 Procesando pago exitoso con datos completos:",
                storedData
            );

            // Evento: Pago exitoso con información completa
            await events.cardPaymentSuccess(storedData.operationId, {
                orderId,
                transactionId,
                amount: parseFloat(amount || "0"),
                currency: currency || "PEN",
                status: status || "PAID",
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

            console.log("✅ Pago exitoso procesado con éxito");
            toast.success("¡Pago procesado exitosamente!");

            // Limpiar datos guardados
            clearStoredPaymentData();
        } catch (error) {
            console.error("❌ Error al procesar pago exitoso:", error);
            toast.error("Error al procesar el pago exitoso");
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        // Recuperar datos guardados
        const storedData = retrieveStoredPaymentData();

        if (storedData) {
            setPaymentData(storedData);

            // Procesar el pago exitoso
            processSuccessfulPayment(storedData);
        } else {
            console.warn("⚠️ No se encontraron datos de pago guardados");
            toast.warning("No se pudieron recuperar los datos del pago");
        }
    }, []);

    if (isProcessing) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Procesando pago exitoso...
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Registrando información de tarjeta y cliente
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
                            className="w-16 h-16 text-green-500 mx-auto"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        ¡Pago Exitoso!
                    </h1>
                    <p className="text-xl text-gray-700 dark:text-gray-300 mb-6">
                        Tu pago ha sido procesado correctamente
                    </p>
                </div>

                {/* Payment Details */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Detalles del Pago
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
                                        ID de Transacción:
                                    </span>
                                    <span className="font-medium">
                                        {transactionId}
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
                                    <span className="font-medium text-green-600">
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
                                    {paymentData.cardInfo.installments &&
                                        paymentData.cardInfo.installments >
                                            1 && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    Cuotas:
                                                </span>
                                                <span className="font-medium">
                                                    {
                                                        paymentData.cardInfo
                                                            .installments
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
