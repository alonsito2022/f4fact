"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { Modal, ModalOptions } from "flowbite";
import PaymentInstructionsModal from "./PaymentInstructionsModal";
import PaymentProofModal from "./PaymentProofModal";
import IzipayPaymentModal from "./IzipayPaymentModal";
import { usePaymentEvents } from "@/hooks/usePaymentEvents";
import { currentConfig, IZIPAY_URLS } from "@/lib/izipay-config";
import "./izipay-form.css";

interface PaymentPageProps {
    documentId?: string;
    amount?: string;
    orderNumber?: string;
}

// Variables globales para controlar la carga de scripts
let scriptLoaded = false;
let scriptLoading = false;

export default function PaymentPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const documentId = searchParams.get("documentId");
    const amount = searchParams.get("amount") || "120.00";
    const orderNumber = searchParams.get("orderNumber") || "OP-269122";
    const description = searchParams.get("description") || "Factura";

    // Hook para eventos de pago
    const { events, loading: paymentEventLoading } = usePaymentEvents();

    const [instructionsModal, setInstructionsModal] = useState<Modal | null>(
        null
    );
    const [proofModal, setProofModal] = useState<Modal | null>(null);
    const [paymentModal, setPaymentModal] = useState<Modal | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [formToken, setFormToken] = useState<string>("");
    // Calcular monto con recargo para tarjeta
    const calculateCardAmount = (originalAmount: string) => {
        const numAmount = parseFloat(originalAmount);
        const commissionRate = 0.05; // 5%
        const commissionAmount = numAmount * commissionRate;
        const finalAmount = numAmount + commissionAmount;

        return {
            original: numAmount,
            commission: commissionAmount,
            final: finalAmount,
            commissionRate: commissionRate * 100, // 5%
        };
    };
    // Función para formatear el monto correctamente
    const formatAmount = (amount: string) => {
        const numAmount = parseFloat(amount);

        // El monto ya viene en soles desde la URL
        return new Intl.NumberFormat("es-PE", {
            style: "currency",
            currency: "PEN",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(numAmount);
    };

    // Función optimizada para cargar los scripts de Izipay
    const loadIzipayScripts = async (): Promise<boolean> => {
        if (typeof window === "undefined") return false;

        // Si ya están cargados, retornar true
        if (scriptLoaded && window.KR) {
            return true;
        }

        // Si ya se están cargando, esperar
        if (scriptLoading) {
            return new Promise((resolve) => {
                const checkLoaded = () => {
                    if (scriptLoaded && window.KR) {
                        resolve(true);
                    } else {
                        setTimeout(checkLoaded, 100);
                    }
                };
                checkLoaded();
            });
        }

        scriptLoading = true;

        try {
            // Cargar el script principal de Izipay
            const mainScript = document.createElement("script");
            mainScript.type = "text/javascript";
            mainScript.src = IZIPAY_URLS.jsUrl;
            mainScript.setAttribute("kr-public-key", currentConfig.publicKey);
            mainScript.setAttribute(
                "kr-post-url-success",
                `/api/payment/success`
            );
            mainScript.setAttribute(
                "kr-post-url-cancel",
                `/api/payment/cancel`
            );
            mainScript.setAttribute(
                "kr-post-url-refused",
                `/api/payment/refused`
            );
            mainScript.setAttribute("kr-language", "es-ES");

            // Cargar los estilos CSS
            const cssLink = document.createElement("link");
            cssLink.rel = "stylesheet";
            cssLink.href =
                "https://static.micuentaweb.pe/static/js/krypton-client/V4.0/ext/classic.css";

            // Cargar el script classic.js
            const classicScript = document.createElement("script");
            classicScript.type = "text/javascript";
            classicScript.src =
                "https://static.micuentaweb.pe/static/js/krypton-client/V4.0/ext/classic.js";

            // Agregar los elementos al head
            document.head.appendChild(cssLink);
            document.head.appendChild(mainScript);
            document.head.appendChild(classicScript);

            return new Promise((resolve, reject) => {
                mainScript.onload = () => {
                    scriptLoaded = true;
                    scriptLoading = false;
                    resolve(true);
                };

                mainScript.onerror = () => {
                    scriptLoading = false;
                    reject(new Error("Error al cargar el formulario de pago"));
                };
            });
        } catch (error) {
            scriptLoading = false;
            throw error;
        }
    };

    const handleCardPayment = async () => {
        setIsLoading(true);

        try {
            // Calcular monto con recargo
            const cardAmounts = calculateCardAmount(amount);
            // Generar ID de orden único
            const orderId = `ORDER_${Date.now()}_${Math.random()
                .toString(36)
                .substr(2, 9)}`;

            // 1. Evento: Usuario inició pago
            const operationId = Number(documentId) || 0;
            await events.userInitiatedPayment(operationId, {
                orderId,
                amount: cardAmounts.final, // Usar monto final
                description,
            });

            // 2. Evento: Solicitud de pago creada
            await events.createPaymentRequest(operationId, cardAmounts.final, {
                orderId,
                amount: cardAmounts.final, // Usar monto final
                currency: "PEN",
                customer: {
                    email: "cliente@ejemplo.com",
                    reference: documentId || "DOC001",
                },
            });

            // Crear la transacción en Izipay
            const paymentData = {
                orderId: orderId,
                amount: cardAmounts.final, // Usar monto final
                currency: "PEN",
                customer: {
                    email: "cliente@ejemplo.com",
                    reference: documentId || "DOC001",
                },
                orderDetails: {
                    orderId: orderId,
                    orderInfo: description,
                    orderMetaData: {
                        documentId: documentId,
                        orderNumber: orderNumber,
                        originalAmount: cardAmounts.original,
                        commissionAmount: cardAmounts.commission,
                        commissionRate: cardAmounts.commissionRate,
                    },
                },
            };

            // Crear la transacción
            const response = await fetch("/api/payment/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(paymentData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(
                    `Error al crear la transacción: ${response.status} - ${errorText}`
                );
            }

            const result = await response.json();

            if (result.success && result.formToken) {
                setFormToken(result.formToken);

                // 3. Evento: FormToken generado exitosamente
                await events.createPaymentSuccess(
                    operationId,
                    result.formToken,
                    result
                );

                // 4. Evento: Formulario de pago mostrado
                await events.paymentFormDisplayed(operationId);
                // Cargar scripts y mostrar formulario embebido
                await loadIzipayScripts();
                // Mostrar modal de pago con Izipay
                paymentModal?.show();
            } else {
                throw new Error(
                    result.message || "Error en la respuesta del servidor"
                );
            }
        } catch (error) {
            console.error("❌ Error en el pago:", error);

            // Evento: Falló la creación del pago
            const operationId = Number(documentId) || 0;
            await events.createPaymentFailed(operationId, {
                error: error instanceof Error ? error.message : String(error),
                amount: parseFloat(amount),
            });

            toast.error(
                "Error al procesar el pago. Por favor, inténtalo de nuevo."
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Inicializar modales
    useEffect(() => {
        if (!instructionsModal) {
            const $targetEl = document.getElementById(
                "payment-instructions-modal"
            ) as HTMLElement;
            const options: ModalOptions = {
                placement: "center" as const,
                backdrop: "static" as const,
                closable: true,
            };
            const modal = new Modal($targetEl, options);
            setInstructionsModal(modal);
        }

        if (!proofModal) {
            const $targetEl = document.getElementById(
                "payment-proof-modal"
            ) as HTMLElement;
            const options: ModalOptions = {
                placement: "center" as const,
                backdrop: "static" as const,
                closable: true,
            };
            const modal = new Modal($targetEl, options);
            setProofModal(modal);
        }

        if (!paymentModal) {
            const $targetEl = document.getElementById(
                "izipay-payment-modal"
            ) as HTMLElement;
            const options: ModalOptions = {
                placement: "top-center" as const,
                backdrop: "static" as const,
                backdropClasses:
                    "bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40",
                closable: false,
            };
            const modal = new Modal($targetEl, options);
            setPaymentModal(modal);
        }
    }, [instructionsModal, proofModal, paymentModal]);

    const handleClosePaymentForm = () => {
        // El modal se maneja internamente en IzipayPaymentModal
        paymentModal?.hide();
    };

    const handleViewPaymentInstructions = () => {
        instructionsModal?.show();
    };

    const handleUploadProof = () => {
        proofModal?.show();
    };

    const handleContactRequest = () => {
        toast.info("Solicitud de contacto enviada");
    };

    const handleViewDocument = () => {
        toast.info("Abriendo documento");
    };
    // Función para abrir WhatsApp
    const handleWhatsAppContact = () => {
        const phoneNumber = "973591709";
        const countryCode = "51";
        const message = `Hola, Deseo que me llamen o escriban`;

        const whatsappURL = `https://web.whatsapp.com/send?phone=${countryCode}${phoneNumber}&text=${encodeURIComponent(
            message
        )}`;
        window.open(whatsappURL, "_blank");
    };
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            <div className="max-w-4xl mx-auto py-8 px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Pagar
                    </h2>
                    <p className="text-xl text-gray-700 dark:text-gray-300 mb-2">
                        {description}
                    </p>
                    <button
                        onClick={handleViewDocument}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium mb-2"
                    >
                        VER DOCUMENTO
                    </button>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Los pagos CON tarjeta o Yape se procesan más rápido.
                    </p>
                </div>

                {/* Payment Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Card/Yape Payment */}
                    <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                            Pagar con tarjeta
                        </h3>

                        {/* Payment Method Logos */}
                        <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
                            <div className="text-blue-600 dark:text-blue-400 font-bold text-lg">
                                VISA
                            </div>
                            <div className="text-red-600 dark:text-red-400 font-bold text-lg">
                                Mastercard
                            </div>
                            <div className="text-green-600 dark:text-green-400 font-bold text-sm">
                                AMERICAN EXPRESS
                            </div>
                            <div className="text-gray-600 dark:text-gray-400 font-bold text-sm">
                                Diners Club International
                            </div>
                        </div>

                        {/* Información del recargo */}
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6">
                            <div className="text-center">
                                <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-2">
                                    ⚠️ Recargo por comisión bancaria
                                </p>
                                <div className="space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                                    <div className="flex justify-between">
                                        <span>Monto original:</span>
                                        <span className="font-medium">
                                            {formatAmount(amount)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>
                                            Comisión (
                                            {
                                                calculateCardAmount(amount)
                                                    .commissionRate
                                            }
                                            %):
                                        </span>
                                        <span className="font-medium">
                                            {formatAmount(
                                                calculateCardAmount(
                                                    amount
                                                ).commission.toString()
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-t border-yellow-300 dark:border-yellow-600 pt-1">
                                        <span className="font-semibold">
                                            Total a pagar:
                                        </span>
                                        <span className="font-bold text-lg">
                                            {formatAmount(
                                                calculateCardAmount(
                                                    amount
                                                ).final.toString()
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                            Paga en línea de manera segura
                        </p>

                        <button
                            onClick={handleCardPayment}
                            disabled={isLoading || paymentEventLoading}
                            type="button"
                            className={`w-full font-bold py-3 px-6 rounded-lg text-lg transition-colors ${
                                isLoading || paymentEventLoading
                                    ? "bg-gray-400 cursor-not-allowed text-white"
                                    : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
                            }`}
                        >
                            {isLoading || paymentEventLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Procesando...
                                </div>
                            ) : (
                                `PAGAR ${formatAmount(
                                    calculateCardAmount(amount).final.toString()
                                )}`
                            )}
                        </button>
                    </div>

                    {/* Bank Payment */}
                    <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                            Pagar en cuenta bancaria o Yape
                        </h3>

                        {/* Bank Logos */}
                        <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
                            <div className="text-blue-600 dark:text-blue-400 font-bold text-lg">
                                BCP
                            </div>
                            <div className="text-orange-600 dark:text-orange-400 font-bold text-lg">
                                Interbank
                            </div>
                            <div className="bg-purple-600 dark:bg-purple-500 text-white px-3 py-1 rounded-lg font-bold text-sm">
                                S/ yape
                            </div>
                        </div>

                        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                            Transferencia, depósito, agente, interbancario, Etc.
                        </p>

                        {/* Información adicional para pagos bancarios */}
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-6">
                            <div className="text-center">
                                <p className="text-sm text-green-800 dark:text-green-200 font-medium mb-2">
                                    ✅ Sin recargos adicionales
                                </p>
                                <p className="text-sm text-green-700 dark:text-green-300">
                                    Paga exactamente {formatAmount(amount)}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <button
                                onClick={handleViewPaymentInstructions}
                                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                            >
                                VER INSTRUCCIONES DE PAGO
                            </button>
                            <button
                                onClick={handleUploadProof}
                                className="w-full bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                            >
                                SUBIR CONSTANCIA DE PAGO
                            </button>
                        </div>
                    </div>
                </div>

                {/* Contact Section */}
                <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                        ¿Deseas que te contactemos por Teléfono o WhatsApp?
                    </h3>
                    <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
                        Hemos automatizado el proceso de pagos, sin embargo
                        estamos atentos para ayudarte.
                    </p>
                    <div className="flex items-center justify-center">
                        <button
                            onClick={handleWhatsAppContact}
                            className="ml-3 bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                            </svg>
                            Deseo que me llamen o escriban
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de formulario de pago embebido */}
            <IzipayPaymentModal
                modal={paymentModal}
                setModal={setPaymentModal}
                formToken={formToken}
                operationId={Number(documentId)}
                amount={parseFloat(amount)}
                description={description}
                onPaymentSuccess={(paymentData) => {
                    console.log("✅ Pago exitoso:", paymentData);
                    toast.success("Pago procesado correctamente");
                }}
                onPaymentError={(error) => {
                    console.error("❌ Error en pago:", error);
                    toast.error("Error al procesar el pago");
                }}
            />

            {/* Modal de instrucciones de pago */}
            <PaymentInstructionsModal
                modal={instructionsModal}
                setModal={setInstructionsModal}
                onUploadProof={handleUploadProof}
            />

            {/* Modal de constancia de pago */}
            <PaymentProofModal
                modal={proofModal}
                setModal={setProofModal}
                operationId={Number(documentId)}
                amount={parseFloat(amount)}
            />
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
