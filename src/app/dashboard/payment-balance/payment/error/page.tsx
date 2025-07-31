"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PaymentErrorPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const message =
        searchParams.get("message") ||
        "Ha ocurrido un error durante el proceso de pago";
    const orderId = searchParams.get("orderId") || "";

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simular un pequeño delay para mostrar la animación
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    const handleTryAgain = () => {
        router.back();
    };

    const handleReturnToBalance = () => {
        router.push("/dashboard/payment-balance");
    };

    const handleContactSupport = () => {
        // Aquí puedes implementar el contacto con soporte
        window.open(
            "mailto:soporte@empresa.com?subject=Error en pago",
            "_blank"
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">
                        Procesando...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            <div className="max-w-2xl mx-auto py-16 px-4">
                {/* Error Icon */}
                <div className="text-center mb-8">
                    <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100 dark:bg-red-900 mb-6">
                        <svg
                            className="h-12 w-12 text-red-600 dark:text-red-400"
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
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Error en el Pago
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        {message}
                    </p>
                </div>

                {/* Error Details */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
                        ¿Qué puedes hacer?
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 dark:text-blue-400 text-sm font-bold">
                                        1
                                    </span>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900 dark:text-white">
                                    Verificar información
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Asegúrate de que los datos de tu tarjeta
                                    sean correctos y que tengas fondos
                                    suficientes.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 dark:text-blue-400 text-sm font-bold">
                                        2
                                    </span>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900 dark:text-white">
                                    Intentar nuevamente
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Puedes intentar realizar el pago nuevamente
                                    con la misma o una tarjeta diferente.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 dark:text-blue-400 text-sm font-bold">
                                        3
                                    </span>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900 dark:text-white">
                                    Contactar soporte
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Si el problema persiste, contacta con
                                    nuestro equipo de soporte para obtener
                                    ayuda.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                    <button
                        onClick={handleTryAgain}
                        className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                    >
                        Intentar Nuevamente
                    </button>

                    <button
                        onClick={handleContactSupport}
                        className="w-full bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                    >
                        Contactar Soporte
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
                        Información adicional
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Si tienes alguna pregunta sobre este error, no dudes en
                        contactarnos. Estamos aquí para ayudarte.
                    </p>
                </div>
            </div>
        </div>
    );
}
