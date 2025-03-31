import { Modal, ModalOptions } from "flowbite";
import React, { useEffect } from "react";

function PdfPreviewModal({ pdfModal, setPdfModal, pdfUrl, setPdfUrl }: any) {
    useEffect(() => {
        if (pdfModal == null) {
            const $targetEl = document.getElementById("pdf-preview-modal");
            const options: ModalOptions = {
                placement: "center",
                backdrop: "static",
                closable: true,
            };
            setPdfModal(new Modal($targetEl, options));
        }
    }, []);
    return (
        <div
            id="pdf-preview-modal"
            tabIndex={-1}
            aria-hidden="true"
            className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
        >
            <div className="relative p-4 w-full max-w-4xl max-h-full">
                <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                    <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Vista Previa PDF
                        </h3>
                        <button
                            type="button"
                            onClick={() => {
                                pdfModal?.hide();
                                setPdfUrl("");
                            }}
                            className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
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
                        </button>
                    </div>
                    <div className="p-4 md:p-5">
                        <iframe
                            src={pdfUrl}
                            className="w-full h-[calc(100vh-300px)]"
                            title="PDF Preview"
                        />
                    </div>
                    <div className="flex items-center justify-end p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
                        <a
                            href={pdfUrl}
                            target="_blank"
                            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                        >
                            Abrir en Nueva Pestaña
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PdfPreviewModal;
