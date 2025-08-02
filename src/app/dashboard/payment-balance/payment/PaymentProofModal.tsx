"use client";
import { Modal, ModalOptions } from "flowbite";
import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { useAuth } from "@/components/providers/AuthProvider";
import { usePaymentEvents } from "@/hooks/usePaymentEvents";

interface PaymentProofModalProps {
    modal: Modal | null;
    setModal: (modal: Modal | null) => void;
    operationId?: number;
    amount?: number;
}

export default function PaymentProofModal({
    modal,
    setModal,
    operationId,
    amount,
}: PaymentProofModalProps) {
    const auth = useAuth();
    const { events } = usePaymentEvents();
    const [files, setFiles] = useState<File[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState(amount || 0);
    const [notes, setNotes] = useState("");
    const [wayPay, setWayPay] = useState(4); // Default: TRANSFERENCIA
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Opciones de forma de pago
    const wayPayOptions = [
        // { value: 1, label: "EFECTIVO" },
        // { value: 2, label: "TARJETA DÉBITO" },
        // { value: 3, label: "TARJETA CRÉDITO" },
        { value: 4, label: "TRANSFERENCIA" },
        { value: 5, label: "GIRO" },
        { value: 6, label: "CHEQUE" },
        { value: 7, label: "CUPÓN" },
        { value: 8, label: "YAPE" },
        { value: 10, label: "OTROS" },
    ];

    const handleClose = () => {
        if (modal) {
            modal.hide();
        }
        // Reset form
        setFiles([]);
        setPaymentAmount(amount || 0);
        setNotes("");
        setWayPay(4); // Reset to default
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files || []);
        handleFiles(selectedFiles);
    };

    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragOver(false);
        const droppedFiles = Array.from(event.dataTransfer.files);
        handleFiles(droppedFiles);
    };

    const handleFiles = (newFiles: File[]) => {
        const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];

        const validFiles = newFiles.filter((file) => {
            if (!allowedTypes.includes(file.type)) {
                toast.error(
                    `Solo se permiten imágenes PNG, JPG o JPEG: ${file.name}`
                );
                return false;
            }
            if (file.size > 5 * 1024 * 1024) {
                // 5MB
                toast.error(`Archivo demasiado grande: ${file.name}`);
                return false;
            }
            return true;
        });

        if (files.length + validFiles.length > 1) {
            toast.error("Solo se permite 1 archivo por constancia");
            return;
        }

        setFiles((prev) => [...prev, ...validFiles]);
        toast.success(`${validFiles.length} archivo(s) agregado(s)`);
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (files.length === 0) {
            toast.error("Por favor selecciona una imagen de la constancia");
            return;
        }

        if (!operationId) {
            toast.error("Error: No se encontró el ID de la operación");
            return;
        }

        if (paymentAmount <= 0) {
            toast.error("Por favor ingresa el monto pagado");
            return;
        }

        if (!wayPay) {
            toast.error("Por favor selecciona la forma de pago");
            return;
        }

        if (!auth?.user?.id) {
            toast.error("Error: No se encontró el ID del usuario");
            return;
        }

        setIsUploading(true);

        try {
            const file = files[0]; // Solo un archivo por constancia

            // Validar que el archivo tenga el tipo correcto
            if (
                !file.type ||
                !["image/png", "image/jpeg", "image/jpg"].includes(file.type)
            ) {
                toast.error(
                    "Tipo de archivo no válido. Solo se permiten imágenes PNG, JPG o JPEG."
                );
                return;
            }

            // Validar que el archivo tenga un nombre
            if (!file.name) {
                toast.error("El archivo debe tener un nombre válido");
                return;
            }

            // Validar que el archivo no esté vacío
            if (file.size === 0) {
                toast.error("El archivo no puede estar vacío");
                return;
            }

            console.log("📤 Enviando archivo:", {
                name: file.name,
                type: file.type,
                size: file.size,
                operationId,
                total: paymentAmount,
                wayPay,
                notes,
            });

            console.log(
                "🔗 URL del endpoint:",
                `${process.env.NEXT_PUBLIC_BASE_API}/accounting/upload-payment-proof/`
            );
            console.log(
                "👤 ID del usuario:",
                auth?.user?.id ? auth.user.id : "No disponible"
            );
            console.log("📋 FormData creado con campos:", {
                operation_id: operationId,
                total: paymentAmount,
                way_pay: wayPay,
                currency: "PEN",
                notes: notes || `Constancia de pago por S/ ${paymentAmount}`,
                attachment: file.name,
                user_id: auth?.user?.id,
            });

            // Crear FormData para el upload
            const formData = new FormData();
            formData.append("operation_id", operationId.toString());
            formData.append("total", paymentAmount.toString());
            formData.append("way_pay", wayPay.toString());
            formData.append("currency", "PEN");
            formData.append(
                "notes",
                notes || `Constancia de pago por S/ ${paymentAmount}`
            );
            formData.append("attachment", file);
            formData.append("user_id", auth?.user?.id.toString());

            // Llamada REST API
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_API}/accounting/upload-payment-proof/`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error ${response.status}: ${errorText}`);
            }

            const result = await response.json();

            if (result.success) {
                toast.success("✅ Constancia de pago enviada correctamente");
                console.log("🎯 Constancia subida:", result);

                // Evento: PAYMENT_PROOF_UPLOADED
                await events.paymentProofUploaded(operationId, {
                    total: paymentAmount,
                    currency: "PEN",
                    wayPay: wayPay,
                    notes:
                        notes || `Constancia de pago por S/ ${paymentAmount}`,
                    filename: file.name,
                    fileSize: file.size,
                    status: "PENDING",
                    cashFlowId: result.cashFlow?.id,
                });

                handleClose();
            } else {
                toast.error("Error al subir la constancia");
            }
        } catch (error) {
            console.error("❌ Error al subir constancia:", error);

            // Mostrar mensaje de error más específico
            let errorMessage =
                "Error al subir la constancia. Por favor, inténtalo de nuevo.";

            const errorMessageStr =
                error instanceof Error ? error.message : String(error);

            if (errorMessageStr.includes("content_type")) {
                errorMessage =
                    "Error en el formato del archivo. Asegúrate de que sea una imagen válida.";
            } else if (errorMessageStr.includes("network")) {
                errorMessage =
                    "Error de conexión. Verifica tu conexión a internet.";
            } else if (errorMessageStr.includes("unauthorized")) {
                errorMessage =
                    "Error de autenticación. Por favor, inicia sesión nuevamente.";
            } else if (errorMessageStr.includes("validation")) {
                errorMessage =
                    "Error de validación. Verifica los datos ingresados.";
            }

            toast.error(errorMessage);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div
            id="payment-proof-modal"
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
                            📎 SUBIR CONSTANCIA DE PAGO
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
                        {/* Información */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                            <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2">
                                ℹ️ Información Importante
                            </h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
                                <li>
                                    Solo se permiten imágenes PNG, JPG o JPEG
                                </li>
                                <li>Tamaño máximo: 5MB por archivo</li>
                                <li>La constancia será revisada manualmente</li>
                                <li>
                                    Se registrará el evento
                                    PAYMENT_PROOF_UPLOADED
                                </li>
                                <li>Selecciona la forma de pago utilizada</li>
                            </ul>
                        </div>

                        {/* Monto */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                💰 Monto Pagado (S/)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={paymentAmount}
                                onChange={(e) =>
                                    setPaymentAmount(
                                        parseFloat(e.target.value) || 0
                                    )
                                }
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                placeholder="0.00"
                            />
                        </div>

                        {/* Forma de Pago */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                💳 Forma de Pago
                            </label>
                            <select
                                value={wayPay}
                                onChange={(e) =>
                                    setWayPay(parseInt(e.target.value))
                                }
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                            >
                                {wayPayOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Notas */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                📝 Notas (Opcional)
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                placeholder="Información adicional sobre el pago..."
                            />
                        </div>

                        {/* File Upload Area */}
                        <div
                            className={`border-2 border-dashed border-orange-400 dark:border-orange-500 rounded-lg p-8 text-center transition-colors ${
                                isDragOver
                                    ? "bg-orange-50 dark:bg-orange-900/20"
                                    : "bg-gray-50 dark:bg-gray-700"
                            }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="cursor-pointer">
                                <svg
                                    className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 48 48"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Subir o arrastrar imagen de constancia aquí
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    Solo PNG, JPG, JPEG - Máximo 5MB
                                </p>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".png,.jpg,.jpeg"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </div>

                        {/* File List */}
                        {files.length > 0 && (
                            <div className="mt-4">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                    📎 Archivo seleccionado:
                                </h4>
                                <div className="space-y-2">
                                    {files.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <svg
                                                    className="w-5 h-5 text-green-600 dark:text-green-400"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm2 1a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V4a1 1 0 00-1-1H6z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                                    {file.name} (
                                                    {(
                                                        file.size /
                                                        1024 /
                                                        1024
                                                    ).toFixed(2)}{" "}
                                                    MB)
                                                </span>
                                            </div>
                                            <button
                                                onClick={() =>
                                                    removeFile(index)
                                                }
                                                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Modal footer */}
                    <div className="flex justify-center p-6 border-t border-gray-200 dark:border-gray-700 rounded-b space-x-3">
                        <button
                            type="button"
                            onClick={handleUpload}
                            disabled={
                                isUploading ||
                                files.length === 0 ||
                                paymentAmount <= 0 ||
                                !wayPay
                            }
                            className={`font-medium py-2 px-6 rounded-lg transition-colors ${
                                isUploading ||
                                files.length === 0 ||
                                paymentAmount <= 0 ||
                                !wayPay
                                    ? "bg-gray-400 cursor-not-allowed text-white"
                                    : "bg-blue-600 hover:bg-blue-700 text-white"
                            }`}
                        >
                            {isUploading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Subiendo...
                                </div>
                            ) : (
                                "📤 Subir Constancia"
                            )}
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
