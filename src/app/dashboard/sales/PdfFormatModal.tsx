import React, { useEffect } from "react";
import { Modal, ModalOptions } from "flowbite";

interface PdfFormatModalProps {
    modalPdfFormat: Modal | null;
    setModalPdfFormat: (modal: Modal | null) => void;
    pdfFormat: number;
    setPdfFormat: (format: number) => void;
}

const FORMAT_OPTIONS = [
    {
        value: 0,
        label: "Por defecto",
        description: "Usa la plantilla configurada en la empresa",
    },
    {
        value: 1,
        label: "Tamaño A4",
        description: "Hoja completa, ideal para archivo e impresión",
    },
    {
        value: 3,
        label: "Tamaño ticket",
        description: "Formato angosto para impresión en ticketera",
    },
];

function PdfFormatModal({
    modalPdfFormat,
    setModalPdfFormat,
    pdfFormat,
    setPdfFormat,
}: PdfFormatModalProps) {
    useEffect(() => {
        if (modalPdfFormat == null) {
            const $targetEl = document.getElementById("pdf-format-modal");
            const options: ModalOptions = {
                placement: "center",
                backdrop: "static",
                closable: true,
            };
            setModalPdfFormat(new Modal($targetEl, options));
        }
    }, []);

    const handleSave = () => {
        modalPdfFormat?.hide();
    };

    return (
        <div
            id="pdf-format-modal"
            tabIndex={-1}
            aria-hidden="true"
            className="fixed left-0 right-0 top-0 z-50 hidden h-[calc(100%-1rem)] max-h-full w-full items-center justify-center overflow-x-hidden overflow-y-auto"
        >
            <div className="relative max-h-full w-full max-w-lg p-4">
                <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
                    {/* Encabezado */}
                    <div className="flex items-start gap-3 border-b border-gray-100 px-5 py-4 dark:border-gray-700">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-400/20">
                            <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={1.7}
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19.5 14.25v-2.63c0-1.14-.93-2.06-2.06-2.06h-1.88a1.13 1.13 0 01-1.13-1.13V6.69c0-1.14-.93-2.06-2.06-2.06h-.5M9.75 21v-4.5m0-3.75H4.5m14.25 3.75H12M7.5 21H4.5a1.5 1.5 0 01-1.5-1.5V6.75a1.5 1.5 0 011.5-1.5h6a1.5 1.5 0 011.5 1.5v12.75a1.5 1.5 0 01-1.5 1.5z"
                                />
                            </svg>
                        </span>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-base font-semibold leading-tight text-gray-900 dark:text-white">
                                Formato del PDF
                            </h3>
                            <p className="mt-0.5 text-[13px] text-gray-500 dark:text-gray-400">
                                Elige cómo se imprimirá el comprobante
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => modalPdfFormat?.hide()}
                            aria-label="Cerrar"
                            className="-mr-1.5 -mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:hover:bg-gray-700 dark:hover:text-gray-300 dark:focus:ring-blue-500/30"
                        >
                            <svg
                                className="h-3.5 w-3.5"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 14 14"
                                aria-hidden="true"
                            >
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Opciones */}
                    <div className="space-y-2 p-5">
                        {FORMAT_OPTIONS.map((option) => {
                            const selected = Number(pdfFormat) === option.value;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setPdfFormat(option.value)}
                                    className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors focus:outline-none focus:ring-4 ${
                                        selected
                                            ? "border-blue-300 bg-blue-50/70 ring-blue-100 dark:border-blue-400/60 dark:bg-blue-500/10 dark:ring-blue-500/20"
                                            : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900/40 dark:hover:border-gray-600 dark:hover:bg-gray-700/40 dark:focus:ring-blue-500/20"
                                    }`}
                                >
                                    <span
                                        className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                                            selected
                                                ? "border-blue-600 bg-blue-600"
                                                : "border-gray-300 dark:border-gray-600"
                                        }`}
                                        >
                                        {selected && (
                                            <svg
                                                className="h-2.5 w-2.5 text-white"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth={3}
                                                viewBox="0 0 24 24"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M4.5 12.75l6 6 9-13.5"
                                                />
                                            </svg>
                                        )}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span
                                            className={`block text-sm font-medium ${
                                                selected
                                                    ? "text-blue-800 dark:text-blue-200"
                                                    : "text-gray-900 dark:text-white"
                                            }`}
                                        >
                                            {option.label}
                                        </span>
                                        <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                                            {option.description}
                                        </span>
                                    </span>
                                </button>
                            );
                        })}

                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => modalPdfFormat?.hide()}
                                className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 text-[13px] font-medium text-gray-700 shadow-sm transition-colors hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-700/70 dark:focus:ring-gray-700"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                className="inline-flex h-9 items-center justify-center rounded-lg border border-blue-600 bg-blue-50 px-4 text-[13px] font-semibold text-blue-700 shadow-sm transition-colors hover:border-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-4 focus:ring-blue-200/70 dark:border-blue-400/40 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:border-blue-400/70 dark:hover:bg-blue-500/20 dark:focus:ring-blue-500/30"
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PdfFormatModal;