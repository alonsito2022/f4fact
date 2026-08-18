import { Modal, ModalOptions } from "flowbite";
import React, { useEffect, useRef, useState } from "react";

function buildProxyUrl(url: string, fileName?: string, download = false) {
    if (!url) return "";
    const safeName = (fileName || "documento.pdf").replace(/["\\\r\n]/g, "").trim();
    const params = new URLSearchParams({ url });
    if (download) params.set("download", "1");
    return `/api/pdf/file/${encodeURIComponent(safeName)}?${params.toString()}`;
}

function PdfPreviewModal({ pdfModal, setPdfModal, pdfUrl, setPdfUrl, pdfFileName, setPdfFileName }: any) {
    const modalRef = useRef<Modal | null>(null);
    const printFrameRef = useRef<HTMLIFrameElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");

    const initModal = () => {
        if (modalRef.current) {
            return modalRef.current;
        }

        const $targetEl = document.getElementById("pdf-preview-modal");
        if (!$targetEl) {
            return null;
        }

        const options: ModalOptions = {
            placement: "center",
            backdrop: "static",
            closable: true,
        };

        const modal = new Modal($targetEl, options);
        modalRef.current = modal;

        if (pdfModal == null) {
            setPdfModal(modal);
        }

        return modal;
    };

    useEffect(() => {
        initModal();
    }, []);

    useEffect(() => {
        if (!pdfUrl) {
            setPreviewUrl("");
            setError("");
            setLoading(false);
            return;
        }

        const modal = initModal();
        modal?.show();

        setLoading(true);
        setError("");
        setPreviewUrl(buildProxyUrl(pdfUrl, pdfFileName));
    }, [pdfUrl, pdfFileName]);

    const handleClose = () => {
        modalRef.current?.hide();
        pdfModal?.hide();
        setPdfUrl("");
        setPdfFileName?.("");
    };

    const handlePrint = () => {
        if (!previewUrl && !pdfUrl) return;

        const printSrc = previewUrl || buildProxyUrl(pdfUrl, pdfFileName);

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

    const handleDownload = async () => {
        if (!pdfUrl) return;
        const filename = pdfFileName || "documento.pdf";

        try {
            const response = await fetch(buildProxyUrl(pdfUrl, filename, true));
            if (!response.ok) {
                throw new Error("No se pudo descargar el PDF");
            }

            const blob = await response.blob();
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al descargar el PDF");
        }
    };

    const openInNewTabUrl = previewUrl || (pdfUrl ? buildProxyUrl(pdfUrl, pdfFileName) : "");

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
                    <div className="p-4 md:p-5 min-h-[calc(100vh-300px)] relative">
                        {loading && (
                            <div className="absolute inset-4 md:inset-5 z-10 flex items-center justify-center bg-white/80 dark:bg-gray-700/80">
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
                        {previewUrl && !error && (
                            <iframe
                                src={previewUrl}
                                className="w-full h-[calc(100vh-300px)] border-0"
                                title="PDF Preview"
                                onLoad={() => setLoading(false)}
                                onError={() => {
                                    setLoading(false);
                                    setError("No se pudo cargar el PDF");
                                }}
                            />
                        )}
                    </div>
                    <div className="flex items-center justify-between gap-3 p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
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
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={handleDownload}
                                disabled={loading || !!error || !pdfUrl}
                                className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50 disabled:cursor-not-allowed dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
                            >
                                Descargar
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
