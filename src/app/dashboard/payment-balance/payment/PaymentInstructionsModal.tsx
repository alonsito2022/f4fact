"use client";
import { Modal, ModalOptions } from "flowbite";
import { useEffect, useState } from "react";

interface PaymentInstructionsModalProps {
    modal: Modal | null;
    setModal: (modal: Modal | null) => void;
    onUploadProof?: () => void;
}

export default function PaymentInstructionsModal({
    modal,
    setModal,
    onUploadProof,
}: PaymentInstructionsModalProps) {
    const handleClose = () => {
        if (modal) {
            modal.hide();
        }
    };

    const handleUploadProof = () => {
        if (onUploadProof) {
            onUploadProof();
        }
        handleClose();
    };

    return (
        <div
            id="payment-instructions-modal"
            tabIndex={-1}
            aria-hidden="true"
            className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
        >
            <div className="relative w-full max-w-2xl max-h-full">
                {/* Modal content */}
                <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow">
                    {/* Modal header */}
                    <div className="flex items-start justify-between p-4 border-b border-gray-200 dark:border-gray-700 rounded-t">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex-1 text-center">
                            Opciones de pago
                        </h3>
                        <button
                            type="button"
                            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center"
                            onClick={handleClose}
                        >
                            <svg
                                className="w-3 h-3"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 14 14"
                            >
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                                />
                            </svg>
                            <span className="sr-only">Cerrar modal</span>
                        </button>
                    </div>

                    {/* Modal body */}
                    <div className="p-6 space-y-4">
                        {/* OPCIÓN 1 */}
                        <div className="border-b border-gray-200 dark:border-gray-600 pb-4">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                                OPCIÓN 1) Acercándose a una AGENCIA u OFICINA
                                del BANCO BCP
                            </h4>
                            <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                <p>
                                    <strong>CUENTA NÚMERO:</strong>{" "}
                                    194-2336551-0-24
                                </p>
                                <p>
                                    <strong>TITULAR DE LA CUENTA:</strong>{" "}
                                    NUBEFACT SA
                                </p>
                                <p>
                                    <strong>CÓDIGO DE IDENTIFICACIÓN:</strong>{" "}
                                    RUC DE SU EMPRESA
                                </p>
                            </div>
                        </div>

                        {/* OPCIÓN 2 */}
                        <div className="border-b border-gray-200 dark:border-gray-600 pb-4">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                                OPCIÓN 2) Acercándose a un AGENTE BCP (Ubicado
                                en Boticas, Ferreterías, Bodegas, etc.)
                            </h4>
                            <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                <p>
                                    <strong>CUENTA NÚMERO:</strong>{" "}
                                    194-2336551-0-24
                                </p>
                                <p>
                                    <strong>TITULAR DE LA CUENTA:</strong>{" "}
                                    NUBEFACT SA
                                </p>
                                <p>
                                    <strong>CÓDIGO DE AGENTE:</strong> 14716
                                </p>
                                <p>
                                    <strong>CÓDIGO DE IDENTIFICACIÓN:</strong>{" "}
                                    RUC DE SU EMPRESA
                                </p>
                            </div>
                        </div>

                        {/* OPCIÓN 3 */}
                        <div className="border-b border-gray-200 dark:border-gray-600 pb-4">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                                OPCIÓN 3) Ingresando a la pagina web
                                www.viabcp.com.pe y realizar la transferencia
                                correspondiente
                            </h4>
                            <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                <p>
                                    <strong>Instructions:</strong>
                                </p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>Ingresar a www.viabcp.com.pe</li>
                                    <li>Ir a la opción "Pago de Servicios"</li>
                                    <li>
                                        Buscar en el directorio a "nubefact" y
                                        continuar
                                    </li>
                                    <li>
                                        En el campo "ruc de la empresa" ingresar
                                        el RUC DE SU EMPRESA
                                    </li>
                                    <li>Pagar usando su clave token</li>
                                </ul>
                            </div>
                        </div>

                        {/* OPCIÓN 4 */}
                        <div className="pb-4">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                                OPCIÓN 4) Transferencia desde OTROS BANCOS
                            </h4>
                            <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                <p>
                                    <strong>
                                        CÓDIGO DE CUENTA INTERBANCARIO:
                                    </strong>{" "}
                                    00219400233655102499
                                </p>
                                <p>
                                    <strong>TITULAR DE LA CUENTA:</strong>{" "}
                                    NUBEFACT SA
                                </p>
                                <p>
                                    <strong>RUC DE NUBEFACT:</strong>{" "}
                                    20600695771
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Modal footer */}
                    <div className="flex flex-col items-center p-6 space-y-3 border-t border-gray-200 dark:border-gray-700 rounded-b">
                        <button
                            type="button"
                            onClick={handleUploadProof}
                            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                        >
                            SUBIR CONSTANCIA DE PAGO
                        </button>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
