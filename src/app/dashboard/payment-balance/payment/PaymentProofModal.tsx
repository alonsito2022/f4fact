"use client";
import { Modal, ModalOptions } from "flowbite";
import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";

interface PaymentProofModalProps {
    modal: Modal | null;
    setModal: (modal: Modal | null) => void;
}

export default function PaymentProofModal({
    modal,
    setModal,
}: PaymentProofModalProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleClose = () => {
        if (modal) {
            modal.hide();
        }
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
        const allowedTypes = [
            "image/png",
            "image/jpeg",
            "image/jpg",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ];

        const validFiles = newFiles.filter((file) => {
            if (!allowedTypes.includes(file.type)) {
                toast.error(`Tipo de archivo no soportado: ${file.name}`);
                return false;
            }
            if (file.size > 5 * 1024 * 1024) {
                // 5MB
                toast.error(`Archivo demasiado grande: ${file.name}`);
                return false;
            }
            return true;
        });

        if (files.length + validFiles.length > 6) {
            toast.error("Máximo 6 archivos permitidos");
            return;
        }

        setFiles((prev) => [...prev, ...validFiles]);
        toast.success(`${validFiles.length} archivo(s) agregado(s)`);
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleUpload = () => {
        if (files.length === 0) {
            toast.error("Por favor selecciona al menos un archivo");
            return;
        }

        // Aquí iría la lógica para subir los archivos
        console.log("Archivos a subir:", files);
        toast.success("Constancia de pago enviada correctamente");
        setFiles([]);
        handleClose();
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
                            CONSTANCIA DE PAGO
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
                    <div className="p-6">
                        {/* Instructions */}
                        <div className="mb-6 text-center">
                            <p className="text-gray-700 dark:text-gray-300 mb-2">
                                Puedes subir o arrastrar{" "}
                                <strong>CONSTANCIA DE PAGO</strong>.
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Soporta formatos PNG, JPG, JPEG, PDF, WORD,
                                EXCEL. Hasta 6 archivos de 5MB cada uno.
                            </p>
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
                                    Subir o arrastrar archivo aquí
                                </p>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept=".png,.jpg,.jpeg,.pdf,.doc,.docx,.xls,.xlsx"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </div>

                        {/* File List */}
                        {files.length > 0 && (
                            <div className="mt-4">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                    Archivos seleccionados ({files.length}/6):
                                </h4>
                                <div className="space-y-2">
                                    {files.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-600 rounded"
                                        >
                                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                                {file.name}
                                            </span>
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
                    <div className="flex justify-center p-6 border-t border-gray-200 dark:border-gray-700 rounded-b">
                        <button
                            type="button"
                            onClick={handleUpload}
                            className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-lg transition-colors mr-3"
                        >
                            Subir
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
