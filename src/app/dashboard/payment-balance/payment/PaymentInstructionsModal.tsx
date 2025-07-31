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
            <div className="relative w-full max-w-4xl max-h-full">
                {/* Modal content */}
                <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow">
                    {/* Modal header */}
                    <div className="flex items-start justify-between p-4 border-b border-gray-200 dark:border-gray-700 rounded-t">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex-1 text-center">
                            Instrucciones de Pago Bancario
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
                    <div className="p-6 space-y-6">
                        {/* INFORMACIÓN GENERAL */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                            <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2">
                                ℹ️ Información Importante
                            </h4>
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                <strong>
                                    Izipay utiliza la cuenta de Interbank
                                </strong>{" "}
                                para procesar los pagos. Puede realizar el pago
                                directamente en Interbank o transferir desde
                                cualquier banco.
                            </p>
                        </div>

                        {/* OPCIÓN 1 - BCP */}
                        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
                                    1
                                </span>
                                Pago en BCP
                            </h4>
                            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p>
                                            <strong>CUENTA BCP SOLES:</strong>
                                        </p>
                                        <p className="font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded">
                                            215-70258081-0-53
                                        </p>
                                    </div>
                                    <div>
                                        <p>
                                            <strong>CCI BCP SOLES:</strong>
                                        </p>
                                        <p className="font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded">
                                            00221517025808105329
                                        </p>
                                    </div>
                                </div>
                                <p>
                                    <strong>TITULAR:</strong> SISTEMAS DE
                                    TECNOLOGIA 4 SOLUCIONES S.A.C.
                                </p>
                                <p>
                                    <strong>RUC:</strong> 20454702701
                                </p>
                            </div>
                        </div>

                        {/* OPCIÓN 2 - INTERBANK */}
                        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                                <span className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
                                    2
                                </span>
                                Pago en Interbank (Recomendado para Izipay)
                            </h4>
                            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p>
                                            <strong>
                                                CUENTA CORRIENTE SOLES:
                                            </strong>
                                        </p>
                                        <p className="font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded">
                                            300-3007091473
                                        </p>
                                    </div>
                                    <div>
                                        <p>
                                            <strong>CCI INTERBANK:</strong>
                                        </p>
                                        <p className="font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded">
                                            003-300-003007091473-11
                                        </p>
                                    </div>
                                </div>
                                <p>
                                    <strong>TITULAR:</strong> SISTEMAS DE
                                    TECNOLOGIA 4 SOLUCIONES S.A.C.
                                </p>
                                <p>
                                    <strong>RUC:</strong> 20454702701
                                </p>
                            </div>
                        </div>

                        {/* OPCIÓN 3 - YAPE */}
                        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                                <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
                                    3
                                </span>
                                Pago con Yape
                            </h4>
                            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                <div>
                                    <p>
                                        <strong>NÚMERO YAPE:</strong>
                                    </p>
                                    <p className="font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded">
                                        973 591 709
                                    </p>
                                </div>
                                <p>
                                    <strong>TITULAR:</strong> SISTEMAS DE
                                    TECNOLOGIA 4 SOLUCIONES S.A.C.
                                </p>
                                <p>
                                    <strong>RUC:</strong> 20454702701
                                </p>
                            </div>
                        </div>

                        {/* PASOS PARA TRANSFERENCIA */}
                        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-3">
                                📋 Pasos para Transferencia Bancaria
                            </h4>
                            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
                                    <p className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                                        ⚠️ Importante para Izipay:
                                    </p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>
                                            Use la cuenta de{" "}
                                            <strong>Interbank</strong> para
                                            pagos con Izipay
                                        </li>
                                        <li>Mantenga el comprobante de pago</li>
                                        <li>
                                            El pago se procesará automáticamente
                                        </li>
                                    </ul>
                                </div>

                                <div>
                                    <p className="font-semibold mb-2">
                                        Pasos generales:
                                    </p>
                                    <ol className="list-decimal list-inside space-y-1 ml-4">
                                        <li>
                                            Acceda a su banca en línea o
                                            aplicación móvil
                                        </li>
                                        <li>
                                            Seleccione
                                            &ldquo;Transferencias&rdquo; o
                                            &ldquo;Pagos&rdquo;
                                        </li>
                                        <li>
                                            Ingrese los datos de la cuenta
                                            correspondiente
                                        </li>
                                        <li>
                                            Verifique el monto y los datos antes
                                            de confirmar
                                        </li>
                                        <li>
                                            Complete la transacción y guarde el
                                            comprobante
                                        </li>
                                        <li>
                                            Suba el comprobante usando el botón
                                            de abajo
                                        </li>
                                    </ol>
                                </div>
                            </div>
                        </div>

                        {/* INFORMACIÓN ADICIONAL */}
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                                💡 Información Adicional
                            </h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                <li>
                                    Los pagos se procesan en 24-48 horas hábiles
                                </li>
                                <li>
                                    Mantenga su comprobante de pago como
                                    respaldo
                                </li>
                                <li>
                                    Para pagos urgentes, use tarjeta de
                                    crédito/débito
                                </li>
                                <li>
                                    En caso de problemas, contacte soporte
                                    técnico
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Modal footer */}
                    <div className="flex flex-col items-center p-6 space-y-3 border-t border-gray-200 dark:border-gray-700 rounded-b">
                        <button
                            type="button"
                            onClick={handleUploadProof}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                        >
                            📎 SUBIR CONSTANCIA DE PAGO
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
