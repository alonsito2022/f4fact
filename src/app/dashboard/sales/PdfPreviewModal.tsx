import { Modal, ModalOptions } from "flowbite";
import React, { useEffect, useRef, useState } from "react";

function PdfPreviewModal({ pdfModal, setPdfModal, pdfUrl, setPdfUrl }: any) {
    const printFrameRef = useRef<HTMLIFrameElement>(null);
    const blobUrlRef = useRef<string>("");
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");

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

    useEffect(() => {
        return () => {
            if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current);
                blobUrlRef.current = "";
            }
        };
    }, []);

    useEffect(() => {
        if (!pdfUrl) {
            if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current);
                blobUrlRef.current = "";
            }
            setPreviewUrl("");
            setError("");
            setLoading(false);
            return;
        }

        let cancelled = false;

        setLoading(true);
        setError("");

        fetch(`/api/pdf?url=${encodeURIComponent(pdfUrl)}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("No se pudo cargar el PDF");
                }
                return response.blob();
            })
            .then((blob) => {
                if (cancelled) return;

                if (blobUrlRef.current) {
                    URL.revokeObjectURL(blobUrlRef.current);
                }

                blobUrlRef.current = URL.createObjectURL(blob);
                setPreviewUrl(blobUrlRef.current);
            })
            .catch((err) => {
                if (!cancelled) {
                    setError(err.message || "Error al cargar el PDF");
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [pdfUrl]);

    useEffect(() => {
        if (pdfUrl && pdfModal) {
            pdfModal.show();
        }
    }, [pdfUrl, pdfModal]);

    const handleClose = () => {
        pdfModal?.hide();
        setPdfUrl("");
    };

    const handlePrint = () => {
        if (!previewUrl && !pdfUrl) return;

        const printSrc =
            previewUrl ||
            `/api/pdf?url=${encodeURIComponent(pdfUrl)}`;

        if (printFrameRef.current) {
            printFrameRef.current.src = printSrc;
            printFrameRef.current.onload = () => {
                try {
                    printFrameRef.current?.contentWindow?.print();
                } catch {
                    window.open(printSrc, "_blank");
                }
            };
            return;
        }

        window.open(printSrc, "_blank");
    };

    const openInNewTabUrl =
        previewUrl ||
        (pdfUrl
            ? `/api/pdf?url=${encodeURIComponent(pdfUrl)}`
            : "");

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
                            onClick={handleClose}
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
                    <div className="p-4 md:p-5 min-h-[calc(100vh-300px)]">
                        {loading && (
                            <div className="flex h-[calc(100vh-300px)] items-center justify-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Cargando PDF...
                                </p>
                            </div>
                        )}
                        {error && !loading && (
                            <div className="flex h-[calc(100vh-300px)] flex-col items-center justify-center gap-3">
                                <p className="text-sm text-red-600 dark:text-red-400">
                                    {error}
                                </p>
                                <a
                                    href={pdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                                >
                                    Abrir PDF directamente
                                </a>
                            </div>
                        )}
                        {previewUrl && !loading && !error && (
                            <embed
                                src={previewUrl}
                                type="application/pdf"
                                className="w-full h-[calc(100vh-300px)]"
                            />
                        )}
                    </div>
                    <div className="flex items-center justify-between p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
                        <button
                            onClick={handlePrint}
                            disabled={loading || !!error || !previewUrl}
                            className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50 disabled:cursor-not-allowed dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 flex items-center"
                        >
                            <svg
                                className="w-4 h-4 mr-2"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            Imprimir
                        </button>
                        <a
                            href={openInNewTabUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                        >
                            Abrir en Nueva Pestaña
                        </a>
                    </div>
                </div>
            </div>
            <iframe
                ref={printFrameRef}
                className="hidden"
                title="PDF Print"
            />
        </div>
    );
}

export default PdfPreviewModal;
