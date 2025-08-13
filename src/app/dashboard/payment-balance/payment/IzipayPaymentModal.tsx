"use client";
import { Modal, ModalOptions } from "flowbite";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { usePaymentEvents } from "@/hooks/usePaymentEvents";
import { useRouter } from "next/navigation";

interface IzipayPaymentModalProps {
    modal: Modal | null;
    setModal: (modal: Modal | null) => void;
    formToken: string;
    operationId: number;
    amount: number;
    description: string;
    onPaymentSuccess?: (paymentData: any) => void;
    onPaymentError?: (error: any) => void;
}

interface CardInfo {
    cardType?: string; // "VISA", "MASTERCARD", "AMEX", etc.
    cardBrand?: string; // "VISA", "MASTERCARD", "AMEX", etc.
    lastFourDigits?: string;
    installments?: number;
    totalAmount?: number;
}

export default function IzipayPaymentModal({
    modal,
    setModal,
    formToken,
    operationId,
    amount,
    description,
    onPaymentSuccess,
    onPaymentError,
}: IzipayPaymentModalProps) {
    const { events } = usePaymentEvents();
    const [isProcessing, setIsProcessing] = useState(false);
    const [cardInfo, setCardInfo] = useState<CardInfo>({});
    const [customerEmail, setCustomerEmail] = useState("");
    const router = useRouter();

    // Función para extraer información de la tarjeta del formulario
    const extractCardInfo = (paymentData: any): CardInfo => {
        try {
            // Intentar extraer información de la respuesta de Izipay
            const krAnswer = paymentData["kr-answer"];
            const transactions = krAnswer?.transactions?.[0];
            const cardDetails = transactions?.transactionDetails?.cardDetails;

            const cardInfo: CardInfo = {};

            // Extraer información de la tarjeta desde la respuesta de Izipay
            if (cardDetails) {
                cardInfo.cardBrand = cardDetails.effectiveBrand; // VISA, MASTERCARD, AMEX, etc.
                cardInfo.lastFourDigits = cardDetails.pan?.replace(
                    /.*XXXXXX/,
                    ""
                ); // Extraer últimos 4 dígitos
                cardInfo.installments = cardDetails.installmentNumber || 1;
                cardInfo.cardType = cardDetails.productCategory; // CREDIT, DEBIT, etc.
            }

            // Si no hay información en la respuesta, intentar extraer del formulario
            if (!cardInfo.cardBrand) {
                const cardBrandElement = document.querySelector(
                    "[data-kr-card-brand]"
                ) as HTMLElement;
                if (cardBrandElement) {
                    cardInfo.cardBrand =
                        cardBrandElement.getAttribute("data-kr-card-brand") ||
                        undefined;
                }
            }

            if (!cardInfo.lastFourDigits) {
                const lastDigitsElement = document.querySelector(
                    "[data-kr-last-digits]"
                ) as HTMLElement;
                if (lastDigitsElement) {
                    cardInfo.lastFourDigits =
                        lastDigitsElement.getAttribute("data-kr-last-digits") ||
                        undefined;
                }
            }

            if (!cardInfo.installments) {
                const installmentsElement = document.querySelector(
                    "[data-kr-installments]"
                ) as HTMLElement;
                if (installmentsElement) {
                    const installments = installmentsElement.getAttribute(
                        "data-kr-installments"
                    );
                    cardInfo.installments = installments
                        ? parseInt(installments)
                        : 1;
                }
            }

            // Calcular monto total con cuotas si aplica
            if (cardInfo.installments && cardInfo.installments > 1) {
                cardInfo.totalAmount = amount * cardInfo.installments;
            } else {
                cardInfo.totalAmount = amount;
            }

            console.log("💳 Información de tarjeta extraída:", cardInfo);
            return cardInfo;
        } catch (error) {
            console.warn(
                "No se pudo extraer información de la tarjeta:",
                error
            );
            return {};
        }
    };

    // Función para extraer información del cliente desde la respuesta de Izipay
    const extractClientInfo = (paymentData: any) => {
        try {
            const krAnswer = paymentData["kr-answer"];
            const customer = krAnswer?.customer;
            const extraDetails = customer?.extraDetails;

            const clientInfo = {
                ipAddress: extraDetails?.ipAddress,
                userAgent: extraDetails?.browserUserAgent,
                email: customer?.email,
                reference: customer?.reference,
            };

            console.log("👤 Información del cliente extraída:", clientInfo);
            return clientInfo;
        } catch (error) {
            console.warn("No se pudo extraer información del cliente:", error);
            return {
                ipAddress: undefined,
                userAgent: undefined,
                email: undefined,
                reference: undefined,
            };
        }
    };

    // Función para capturar datos antes de la redirección
    const capturePaymentData = (
        paymentData: any,
        cardInfo: CardInfo,
        clientInfo: any
    ) => {
        const paymentInfo = {
            operationId,
            amount,
            description,
            cardInfo,
            clientInfo,
            paymentData,
            timestamp: new Date().toISOString(),
        };

        // Guardar en localStorage para recuperar en la página de éxito
        localStorage.setItem(
            "izipay_payment_data",
            JSON.stringify(paymentInfo)
        );

        console.log("💾 Datos de pago guardados:", paymentInfo);
        return paymentInfo;
    };

    // Función para recuperar datos guardados
    const retrievePaymentData = () => {
        try {
            const storedData = localStorage.getItem("izipay_payment_data");
            if (storedData) {
                const data = JSON.parse(storedData);
                console.log("📥 Datos de pago recuperados:", data);
                return data;
            }
        } catch (error) {
            console.warn("Error al recuperar datos de pago:", error);
        }
        return null;
    };

    // Función para limpiar datos guardados
    const clearPaymentData = () => {
        localStorage.removeItem("izipay_payment_data");
        console.log("🗑️ Datos de pago limpiados");
    };

    // Función para manejar el envío del formulario
    const handleFormSubmit = async (paymentData: any) => {
        setIsProcessing(true);

        // Extraer información de la tarjeta al inicio
        const extractedCardInfo = extractCardInfo(paymentData);
        setCardInfo(extractedCardInfo);

        // Extraer información del cliente
        const clientInfo = extractClientInfo(paymentData);
        // Agregar el email del cliente si fue proporcionado
        if (customerEmail.trim()) {
            clientInfo.email = customerEmail.trim();
        }
        // Capturar datos antes de la redirección
        const capturedData = capturePaymentData(
            paymentData,
            extractedCardInfo,
            clientInfo
        );

        try {
            console.log("💳 Datos de pago recibidos:", paymentData);
            console.log(
                "💳 Información de tarjeta extraída:",
                extractedCardInfo
            );
            console.log("👤 Información del cliente:", clientInfo);

            // Evento: Pago enviado por el cliente
            await events.paymentSubmitted(operationId, {
                ...paymentData,
                cardInfo: extractedCardInfo,
                clientInfo: clientInfo,
                amount: amount,
                description: description,
                customerEmail: customerEmail.trim() || undefined,
            });

            // Evento: Pago exitoso con información completa de tarjeta
            await events.cardPaymentSuccess(operationId, {
                ...paymentData,
                cardInfo: extractedCardInfo,
                clientInfo: clientInfo,
                amount: amount,
                currency: "PEN",
                cardType: extractedCardInfo.cardType,
                cardBrand: extractedCardInfo.cardBrand,
                lastFourDigits: extractedCardInfo.lastFourDigits,
                installments: extractedCardInfo.installments,
                totalAmount: extractedCardInfo.totalAmount,
                ipAddress: clientInfo.ipAddress,
                userAgent: clientInfo.userAgent,
                email: clientInfo.email,
                reference: clientInfo.reference,
                transactionId: paymentData.transactionId || paymentData.id,
                orderId: paymentData.orderId,
                customerEmail: customerEmail.trim() || undefined,
            });

            toast.success("✅ Pago procesado exitosamente");

            // Llamar callback de éxito si existe
            if (onPaymentSuccess) {
                onPaymentSuccess({
                    ...paymentData,
                    cardInfo: extractedCardInfo,
                    clientInfo: clientInfo,
                    customerEmail: customerEmail.trim() || undefined,
                });
            }

            // Limpiar datos guardados después del éxito
            clearPaymentData();

            // Cerrar modal
            handleClose();
        } catch (error) {
            console.error("❌ Error al procesar pago:", error);

            // Evento: Error en el pago con tarjeta
            await events.cardPaymentError(operationId, {
                ...paymentData,
                error: error instanceof Error ? error.message : String(error),
                amount: amount,
                cardInfo: extractedCardInfo,
                clientInfo: clientInfo,
                cardType: extractedCardInfo.cardType,
                cardBrand: extractedCardInfo.cardBrand,
                lastFourDigits: extractedCardInfo.lastFourDigits,
                installments: extractedCardInfo.installments,
                ipAddress: clientInfo.ipAddress,
                userAgent: clientInfo.userAgent,
                email: clientInfo.email,
                reference: clientInfo.reference,
                customerEmail: customerEmail.trim() || undefined,
            });

            toast.error("Error al procesar el pago");

            // Llamar callback de error si existe
            if (onPaymentError) {
                onPaymentError(error);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    // Función para manejar errores del formulario
    const handleFormError = async (error: any) => {
        console.error("❌ Error en formulario de pago:", error);

        try {
            // Evento: Error en el pago
            await events.paymentFailed(operationId, {
                error: error instanceof Error ? error.message : String(error),
                amount: amount,
                description: description,
            });

            toast.error("Error en el formulario de pago");

            // Llamar callback de error si existe
            if (onPaymentError) {
                onPaymentError(error);
            }
        } catch (eventError) {
            console.error("Error al registrar evento:", eventError);
        }
    };

    // Configurar eventos de Izipay cuando el modal se muestra
    useEffect(() => {
        if (modal && formToken && window.KR) {
            // Configurar evento de envío exitoso
            window.KR.onSubmit((paymentData) => {
                handleFormSubmit(paymentData);
            });

            // Configurar evento de error
            window.KR.onError((error) => {
                handleFormError(error);
            });
        }
    }, [modal, formToken]);

    const handleClose = () => {
        if (modal) {
            modal.hide();
        }
        router.push("/dashboard/payment-balance");
    };

    return (
        <div
            tabIndex={-1}
            className="fixed top-0 left-0 right-0 z-50 hidden w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"
            id="izipay-payment-modal"
        >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm w-full max-h-[90vh] overflow-y-auto mx-auto p-0 m-0">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        💳 Pago con Tarjeta
                    </h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        disabled={isProcessing}
                    >
                        <svg
                            className="w-5 h-5"
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
                    </button>
                </div>

                <div className="p-0 m-0">
                    <div
                        id="micuentawebstd_rest_wrapper"
                        className="flex flex-col items-center justify-center"
                    >
                        {isProcessing && (
                            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                                    <p className="text-sm text-gray-600">
                                        Procesando pago...
                                    </p>
                                </div>
                            </div>
                        )}

                        <div
                            className="kr-embedded"
                            kr-form-token={formToken}
                        ></div>
                    </div>

                    {/* Campo de correo electrónico opcional */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Correo electrónico (opcional)
                            </label>
                            <input
                                type="email"
                                value={customerEmail}
                                onChange={(e) =>
                                    setCustomerEmail(e.target.value)
                                }
                                placeholder="tucorreo@email.com"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                disabled={isProcessing}
                            />
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Recibirás una confirmación de tu pago
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Declarar el tipo global para KR
declare global {
    interface Window {
        KR: {
            onSubmit: (callback: (data: any) => void) => void;
            onError: (callback: (error: any) => void) => void;
        };
    }
}
