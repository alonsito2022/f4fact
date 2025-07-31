"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function PaymentReturnPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(true);
    const [paymentStatus, setPaymentStatus] = useState<string>("");

    useEffect(() => {
        // Procesar parámetros de retorno de Izipay
        const orderId = searchParams.get("kr-hash-key");
        const transactionId = searchParams.get("kr-hash");
        const status = searchParams.get("kr-status");
        const amount = searchParams.get("kr-amount");
        const currency = searchParams.get("kr-currency");
        const errorCode = searchParams.get("kr-error-code");
        const errorMessage = searchParams.get("kr-error-message");

        console.log("Retorno de pago:", {
            orderId,
            transactionId,
            status,
            amount,
            currency,
            errorCode,
            errorMessage,
        });

        setPaymentStatus(status || "UNKNOWN");

        // Mostrar mensaje según el estado
        switch (status) {
            case "SUCCESS":
                toast.success("¡Pago procesado exitosamente!");
                break;
            case "FAILED":
                toast.error(
                    `Pago fallido: ${errorMessage || "Error desconocido"}`
                );
                break;
            case "CANCELLED":
                toast.info("Pago cancelado por el usuario");
                break;
            default:
                toast.warning("Estado de pago desconocido");
        }

        setIsLoading(false);
    }, [searchParams]);

    const handleReturnToDashboard = () => {
        router.push("/dashboard/payment-balance");
    };

    const handleTryAgain = () => {
        router.push("/dashboard/payment-balance/payment");
    };

    const handleViewReceipt = () => {
        // Aquí iría la lógica para mostrar el recibo
        toast.info("Funcionalidad de recibo en desarrollo");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const getStatusIcon = () => {
        switch (paymentStatus) {
            case "SUCCESS":
                return (
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 mb-6">
                        <svg
                            className="h-8 w-8 text-green-600 dark:text-green-400"
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
                );
            case "FAILED":
                return (
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900 mb-6">
                        <svg
                            className="h-8 w-8 text-red-600 dark:text-red-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </div>
                );
            case "CANCELLED":
                return (
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 dark:bg-yellow-900 mb-6">
                        <svg
                            className="h-8 w-8 text-yellow-600 dark:text-yellow-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-900 mb-6">
                        <svg
                            className="h-8 w-8 text-gray-600 dark:text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                );
        }
    };

    const getStatusTitle = () => {
        switch (paymentStatus) {
            case "SUCCESS":
                return "¡Pago Exitoso!";
            case "FAILED":
                return "Pago Fallido";
            case "CANCELLED":
                return "Pago Cancelado";
            default:
                return "Estado de Pago Desconocido";
        }
    };

    const getStatusMessage = () => {
        switch (paymentStatus) {
            case "SUCCESS":
                return "Tu pago ha sido procesado correctamente. Recibirás una confirmación por email.";
            case "FAILED":
                return "El pago no pudo ser procesado. Por favor, verifica tus datos e intenta nuevamente.";
            case "CANCELLED":
                return "El pago ha sido cancelado. No se ha realizado ningún cargo a tu cuenta.";
            default:
                return "No se pudo determinar el estado del pago. Por favor, contacta a soporte.";
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            <div className="max-w-2xl mx-auto py-16 px-4">
                <div className="text-center">
                    {/* Icono de estado */}
                    {getStatusIcon()}

                    {/* Título */}
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        {getStatusTitle()}
                    </h1>

                    {/* Mensaje */}
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                        {getStatusMessage()}
                    </p>

                    {/* Detalles del pago */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            Detalles del Pago
                        </h2>
                        <div className="space-y-3 text-left">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">
                                    Estado:
                                </span>
                                <span
                                    className={`font-medium ${
                                        paymentStatus === "SUCCESS"
                                            ? "text-green-600 dark:text-green-400"
                                            : paymentStatus === "FAILED"
                                            ? "text-red-600 dark:text-red-400"
                                            : paymentStatus === "CANCELLED"
                                            ? "text-yellow-600 dark:text-yellow-400"
                                            : "text-gray-600 dark:text-gray-400"
                                    }`}
                                >
                                    {paymentStatus}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">
                                    ID de Transacción:
                                </span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {searchParams.get("kr-hash") || "N/A"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">
                                    Monto:
                                </span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    S/{" "}
                                    {searchParams.get("kr-amount")
                                        ? (
                                              parseInt(
                                                  searchParams.get("kr-amount")!
                                              ) / 100
                                          ).toFixed(2)
                                        : "N/A"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">
                                    Fecha:
                                </span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {new Date().toLocaleDateString("es-PE")}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="space-y-4">
                        {paymentStatus === "SUCCESS" && (
                            <button
                                onClick={handleViewReceipt}
                                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                            >
                                Ver Recibo
                            </button>
                        )}
                        {(paymentStatus === "FAILED" ||
                            paymentStatus === "CANCELLED") && (
                            <button
                                onClick={handleTryAgain}
                                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                            >
                                Intentar Pago Nuevamente
                            </button>
                        )}
                        <button
                            onClick={handleReturnToDashboard}
                            className="w-full bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                        >
                            Volver al Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
