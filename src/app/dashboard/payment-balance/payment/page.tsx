"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Modal, ModalOptions } from "flowbite";
import PaymentInstructionsModal from "./PaymentInstructionsModal";
import PaymentProofModal from "./PaymentProofModal";

interface PaymentPageProps {
    documentId?: string;
    amount?: string;
    orderNumber?: string;
}

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

    const handleCardPayment = () => {
        toast.info("Redirigiendo a pasarela de pago...");
        // Aquí iría la lógica para redirigir a la pasarela de pago
        // window.location.href = "https://tu-pasarela-de-pago.com";
    };
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
    }, [instructionsModal]);

    const handleViewPaymentInstructions = () => {
        if (instructionsModal) {
            instructionsModal.show();
        }
    };
    useEffect(() => {
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
    }, [proofModal]);

    const handleUploadProof = () => {
        if (proofModal) {
            proofModal.show();
        }
    };

    const handleContactRequest = () => {
        toast.info("Solicitud de contacto enviada");
        // Aquí iría la lógica para solicitar contacto
    };

    const handleViewDocument = () => {
        toast.info("Abriendo documento");
        // Aquí iría la lógica para ver el documento
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
                            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors"
                        >
                            PAGAR S/{amount}
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

            {/* Modal de instrucciones de pago - Siempre presente pero oculto */}
            <PaymentInstructionsModal
                modal={instructionsModal}
                setModal={setInstructionsModal}
                onUploadProof={handleUploadProof}
            />

            {/* Modal de constancia de pago - Siempre presente pero oculto */}
            <PaymentProofModal modal={proofModal} setModal={setProofModal} />
        </div>
    );
}
