import React, { useEffect } from "react";
import { Modal, ModalOptions } from "flowbite";
import Close from "@/components/icons/Close";

interface PdfFormatModalProps {
    modalPdfFormat: Modal | null;
    setModalPdfFormat: (modal: Modal | null) => void;
    pdfFormat: number;
    setPdfFormat: (format: number) => void;
}

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

    const pdfFormatOptions = [
        { value: 0, label: "POR DEFECTO" },
        { value: 1, label: "TAMAÑO A4" },
        /*{ value: 2, label: "TAMAÑO A5 (MITAD DE A4)" },*/
        { value: 3, label: "TAMAÑO TICKET" },
    ];

    return (
        <div
            id="pdf-format-modal"
            tabIndex={-1}
            aria-hidden="true"
            className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
        >
            <div className="relative p-4 w-full max-w-md max-h-full">
                <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                    <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Formato de PDF
                        </h3>
                        <button
                            type="button"
                            onClick={() => modalPdfFormat?.hide()}
                            className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                        >
                            <Close />
                        </button>
                    </div>
                    <div className="p-4 md:p-5">
                        <div className="mb-4">
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Formato de PDF
                            </label>
                            <select
                                value={pdfFormat}
                                onChange={(e) =>
                                    setPdfFormat(Number(e.target.value))
                                }
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                {pdfFormatOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                        >
                            Guardar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PdfFormatModal;

