"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { Modal, ModalOptions } from "flowbite";
import PaymentInstructionsModal from "./PaymentInstructionsModal";
import PaymentProofModal from "./PaymentProofModal";

interface PaymentPageProps {
    documentId?: string;
    amount?: string;
    orderNumber?: string;
}

// Configuración de Izipay
const IZIPAY_CONFIG = {
    // URLs
    apiUrl: "https://api.micuentaweb.pe",
    paymentUrl:
        "https://api.micuentaweb.pe/api-payment/V4/Charge/CreatePayment",
    jsUrl: "https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js",

    // Credenciales de test
    test: {
        username: "81325114",
        password: "testpassword_LlOkH8bsEV6VavZxPxg8kfDeFzoQDZhuG201WEcaOMMo0",
        publicKey:
            "81325114:testpublickey_4VfiAtUJdrZI97FxPU41vgaNAbm0GVWEkmWIX4vnnAhM2",
    },

    // Credenciales de producción
    production: {
        username: "81325114",
        password: "prodpassword_CKAvckvYUJd3UCquAG44VRzB8JaIFKPcmqNPubOhgQV2y",
        publicKey:
            "81325114:publickey_2DdsrTALR3DnARWKhzNXN2aPUsjXazw5WeqLddEv2RH6l",
    },
};

// Determinar si estamos en modo test o producción
const isProduction = process.env.NODE_ENV === "production";
const currentConfig = isProduction
    ? IZIPAY_CONFIG.production
    : IZIPAY_CONFIG.test;

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

    const [instructionsModal, setInstructionsModal] = useState<Modal | null>(
        null
    );
    const [proofModal, setProofModal] = useState<Modal | null>(null);
    const [paymentModal, setPaymentModal] = useState<Modal | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [formToken, setFormToken] = useState<string>("");

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
            mainScript.src = IZIPAY_CONFIG.jsUrl;
            mainScript.setAttribute("kr-public-key", currentConfig.publicKey);
            mainScript.setAttribute(
                "kr-post-url-success",
                "/api/payment/success"
            );
            mainScript.setAttribute(
                "kr-post-url-cancel",
                "/api/payment/cancel"
            );
            mainScript.setAttribute(
                "kr-post-url-refused",
                "/api/payment/refused"
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
                    console.log("✅ Scripts de Izipay cargados exitosamente");
                    scriptLoaded = true;
                    scriptLoading = false;
                    resolve(true);
                };

                mainScript.onerror = () => {
                    console.error("❌ Error al cargar los scripts de Izipay");
                    scriptLoading = false;
                    reject(new Error("Error al cargar el formulario de pago"));
                };
            });
        } catch (error) {
            console.error("❌ Error al crear los scripts:", error);
            scriptLoading = false;
            throw error;
        }
    };

    const handleCardPayment = async () => {
        setIsLoading(true);
        console.log("🚀 Iniciando proceso de pago...");

        try {
            // Generar ID de orden único
            const orderId = `ORDER_${Date.now()}_${Math.random()
                .toString(36)
                .substr(2, 9)}`;
            console.log("🆔 Order ID generado:", orderId);

            // Crear la transacción en Izipay
            const paymentData = {
                orderId: orderId,
                amount: parseFloat(amount) * 100, // Convertir a centavos
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
                    },
                },
            };

            console.log("📤 Enviando datos a la API:", paymentData);

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
            console.log("🎯 Resultado de la API:", result);

            if (result.success && result.formToken) {
                console.log("✅ FormToken recibido:", result.formToken);
                setFormToken(result.formToken);

                // Cargar scripts y mostrar formulario
                await loadIzipayScripts();
                paymentModal?.show();
            } else {
                throw new Error(
                    result.message || "Error en la respuesta del servidor"
                );
            }
        } catch (error) {
            console.error("❌ Error en el pago:", error);
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
                "payment-form-modal"
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
                            Pagar con tarjeta o Yape
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
                            <div className="bg-purple-600 dark:bg-purple-500 text-white px-3 py-1 rounded-lg font-bold text-sm">
                                S/ yape
                            </div>
                        </div>

                        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                            Paga en línea de manera segura
                        </p>

                        <button
                            onClick={handleCardPayment}
                            disabled={isLoading}
                            type="button"
                            className={`w-full font-bold py-3 px-6 rounded-lg text-lg transition-colors ${
                                isLoading
                                    ? "bg-gray-400 cursor-not-allowed text-white"
                                    : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
                            }`}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Procesando...
                                </div>
                            ) : (
                                `PAGAR S/${amount}`
                            )}
                        </button>
                    </div>

                    {/* Bank Payment */}
                    <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                            Pagar en cuenta bancaria
                        </h3>

                        {/* Bank Logos */}
                        <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
                            <div className="text-blue-600 dark:text-blue-400 font-bold text-lg">
                                BCP
                            </div>
                            <div className="text-blue-800 dark:text-blue-300 font-bold text-lg">
                                BBVA
                            </div>
                            <div className="text-red-600 dark:text-red-400 font-bold text-lg">
                                Scotiabank
                            </div>
                            <div className="text-orange-600 dark:text-orange-400 font-bold text-lg">
                                Interbank
                            </div>
                        </div>

                        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                            Transferencia, depósito, agente, interbancario, Etc.
                        </p>

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
                    <div className="text-center">
                        <button
                            onClick={handleContactRequest}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                        >
                            Deseo que me llamen o escriban
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de formulario de pago embebido */}
            <div
                tabIndex={-1}
                className="fixed top-0 left-0 right-0 z-50 hidden w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"
                id="payment-form-modal"
            >
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Formulario de Pago
                        </h3>
                        <button
                            onClick={handleClosePaymentForm}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <svg
                                className="w-6 h-6"
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
                    <div className="p-6">
                        <div id="micuentawebstd_rest_wrapper">
                            <div
                                className="kr-embedded"
                                kr-form-token={formToken}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de instrucciones de pago */}
            <PaymentInstructionsModal
                modal={instructionsModal}
                setModal={setInstructionsModal}
                onUploadProof={handleUploadProof}
            />

            {/* Modal de constancia de pago */}
            <PaymentProofModal modal={proofModal} setModal={setProofModal} />
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
