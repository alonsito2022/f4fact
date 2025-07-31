"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function PaymentCancelPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Procesar parámetros de retorno de Izipay
        const orderId = searchParams.get("kr-hash-key");
        const status = searchParams.get("kr-status");
        const amount = searchParams.get("kr-amount");

        console.log("Pago cancelado:", {
            orderId,
            status,
            amount,
        });

        if (status === "CANCELLED") {
            toast.info("Pago cancelado por el usuario");
        }

        setIsLoading(false);
    }, [searchParams]);

    const handleReturnToPayment = () => {
        router.push("/dashboard/payment-balance/payment");
    };

    const handleReturnToDashboard = () => {
        router.push("/dashboard/payment-balance");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            <div className="max-w-2xl mx-auto py-16 px-4">
                <div className="text-center">
                    {/* Icono de cancelación */}
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

                    {/* Título */}
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Pago Cancelado
                    </h1>

                    {/* Mensaje */}
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                        El pago ha sido cancelado. No se ha realizado ningún
                        cargo a tu cuenta.
                    </p>

                    {/* Información adicional */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            ¿Necesitas ayuda?
                        </h2>
                        <div className="space-y-3 text-left">
                            <div className="flex items-start">
                                <svg
                                    className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span className="text-gray-600 dark:text-gray-300">
                                    Puedes intentar el pago nuevamente cuando lo
                                    desees
                                </span>
                            </div>
                            <div className="flex items-start">
                                <svg
                                    className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span className="text-gray-600 dark:text-gray-300">
                                    También puedes usar otros métodos de pago
                                    disponibles
                                </span>
                            </div>
                            <div className="flex items-start">
                                <svg
                                    className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span className="text-gray-600 dark:text-gray-300">
                                    Si tienes problemas, contacta a nuestro
                                    equipo de soporte
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="space-y-4">
                        <button
                            onClick={handleReturnToPayment}
                            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                        >
                            Intentar Pago Nuevamente
                        </button>
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
