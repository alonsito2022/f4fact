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
        email?: string;
        reference?: string;
    };
    paymentData: any;
    timestamp: string;
}

export default function PaymentSuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { events } = usePaymentEvents();

    // Extraer parámetros de la URL
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");
    const currency = searchParams.get("currency");
    const status = searchParams.get("status");
    const transactionId = searchParams.get("transactionId");
    const reference = searchParams.get("reference");

    const [isProcessing, setIsProcessing] = useState(false);

    // Función para procesar el pago exitoso usando datos de la URL
    const processSuccessfulPayment = async () => {
        setIsProcessing(true);

        try {
            console.log("🎯 Procesando pago exitoso con datos de URL:", {
                orderId,
                amount,
                currency,
                status,
                transactionId,
            });

            // Extraer operationId del orderId (formato: ORDER_1754333539106_rtyfvdrtd)
            let operationId = 0;

            if (orderId) {
                // Intentar extraer de customer.reference primero (más confiable)
                if (reference && !isNaN(parseInt(reference))) {
                    operationId = parseInt(reference);
                    console.log(
                        "✅ OperationId extraído de reference:",
                        operationId
                    );
                } else {
                    // Intentar extraer del orderId usando regex
                    const orderMatch = orderId.match(/ORDER_(\d+)_/);
                    if (orderMatch) {
                        operationId = parseInt(orderMatch[1]);
                        console.log(
                            "✅ OperationId extraído de orderId:",
                            operationId
                        );
                    } else {
                        // Fallback: usar el timestamp del orderId
                        const timestampMatch = orderId.match(/ORDER_(\d+)_/);
                        if (timestampMatch) {
                            operationId = parseInt(timestampMatch[1]);
                            console.log(
                                "⚠️ Usando timestamp como operationId:",
                                operationId
                            );
                        }
                    }
                }
            }

            if (!operationId) {
                console.error("❌ No se pudo extraer operationId del orderId");
                toast.error("Error: No se pudo identificar la operación");
                return;
            }

            // Evento: Pago exitoso con información básica
            await events.paymentSuccess(operationId, {
                orderId,
                transactionId,
                amount: parseFloat(amount || "0"),
                currency: currency || "PEN",
                status: status || "PAID",
                cardType: "CREDIT", // Por defecto, ya que no tenemos detalles específicos
                cardBrand: "UNKNOWN",
                lastFourDigits: "****",
                installments: 1,
                totalAmount: parseFloat(amount || "0"),
                ipAddress: "Capturado en servidor",
                userAgent: "Capturado en servidor",
                email: "cliente@ejemplo.com",
                reference: operationId.toString(),
                timestamp: new Date().toISOString(),
            });

            console.log("✅ Pago exitoso procesado con éxito");
            toast.success("¡Pago procesado exitosamente!");
        } catch (error) {
            console.error("❌ Error al procesar pago exitoso:", error);
            toast.error("Error al procesar el pago exitoso");
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        if (orderId && amount && status === "PAID") {
            processSuccessfulPayment();
        } else {
            console.warn("⚠️ Datos de pago incompletos en URL");
            toast.warning("Información de pago incompleta");
        }
    }, [orderId, amount, status]);

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
                        {/* This section is no longer populated from localStorage,
                            but the structure remains for consistency. */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                Tarjeta
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Tipo:
                                    </span>
                                    <span className="font-medium">CREDIT</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Marca:
                                    </span>
                                    <span className="font-medium">UNKNOWN</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Últimos 4 dígitos:
                                    </span>
                                    <span className="font-medium">****</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Cuotas:
                                    </span>
                                    <span className="font-medium">1</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Información del Cliente */}
                    {/* This section is no longer populated from localStorage,
                        but the structure remains for consistency. */}
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            Información del Cliente
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">
                                    IP:
                                </span>
                                <span className="font-medium text-sm">
                                    Capturado en servidor
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">
                                    Navegador:
                                </span>
                                <span className="font-medium text-sm truncate">
                                    Capturado en servidor
                                </span>
                            </div>
                        </div>
                    </div>
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
