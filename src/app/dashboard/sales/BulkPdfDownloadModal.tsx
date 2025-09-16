import React, { useEffect, useState } from "react";
import { Modal } from "flowbite";
import { toast } from "react-toastify";
import JSZip from "jszip";
import LoadingIcon from "@/components/icons/LoadingIcon";

interface Props {
    modalBulkPdf: Modal | null;
    setModalBulkPdf: (modal: Modal | null) => void;
    salesData: any[];
}

function BulkPdfDownloadModal({
    modalBulkPdf,
    setModalBulkPdf,
    salesData,
}: Props) {
    const [downloading, setDownloading] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const $modalElement = document.querySelector("#bulk-pdf-modal");
        if ($modalElement) {
            const modal = new Modal($modalElement as HTMLElement, {
                backdrop: "static",
                closable: false,
                onHide: () => {
                    setProgress(0);
                    setDownloading(false);
                },
            });
            setModalBulkPdf(modal);
        }
    }, [setModalBulkPdf]);

    const handleDownload = async () => {
        if (!salesData?.length) {
            toast.error("No hay documentos para descargar");
            return;
        }
        // Limpiar los atributos "A_" en documentType y operationStatus
        const cleanSalesData = salesData.map((sale) => ({
            ...sale,
            documentType: sale.documentType?.replace("A_", ""),
            operationStatus: sale.operationStatus?.replace("A_", ""),
        }));

        setDownloading(true);
        const zip = new JSZip();
        let completed = 0;

        try {
            // Crear un array de promesas para las descargas
            const downloadPromises = cleanSalesData.map(async (item) => {
                if (!item.documentType || !item.id) return;

                const baseUrl = process.env.NEXT_PUBLIC_BASE_API || "";
                const url = `${baseUrl}/operations/${
                    item.documentType === "07"
                        ? "print_credit_note"
                        : "print_invoice"
                }/${item.id}/`;

                try {
                    // No forzamos HTTPS en desarrollo
                    const finalUrl =
                        process.env.NODE_ENV === "development"
                            ? url
                            : url.toString().replace("http:", "https:");

                    const response = await fetch(finalUrl);
                    if (!response.ok)
                        throw new Error(`Error al descargar PDF ${item.id}`);

                    const blob = await response.blob();
                    // Modificamos el formato del nombre del archivo para incluir el RUC
                    const fileName = `${
                        item.subsidiary?.company?.doc
                    }-${item.documentType.replace("A_", "")}-${item.serial}-${
                        item.correlative
                    }.pdf`;
                    zip.file(fileName, blob);

                    completed++;
                    setProgress(
                        Math.round((completed / cleanSalesData.length) * 100)
                    );
                } catch (error) {
                    console.error(`Error descargando ${item.id}:`, error);
                    toast.error(
                        `Error al descargar el documento ${item.subsidiary?.company?.doc}-${item.documentType}-${item.serial}-${item.correlative}`
                    );
                }
            });

            // Esperar a que todas las descargas terminen
            await Promise.all(downloadPromises);

            // Generar y descargar el archivo ZIP
            const content = await zip.generateAsync({ type: "blob" });
            const downloadUrl = URL.createObjectURL(content);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = "comprobantes.zip";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(downloadUrl);

            toast.success("Descarga completada exitosamente");
        } catch (error) {
            console.error("Error en la descarga masiva:", error);
            toast.error("Error al descargar los documentos");
        } finally {
            setDownloading(false);
            setProgress(0);
            modalBulkPdf?.hide();
        }
    };

    return (
        <div
            id="bulk-pdf-modal"
            tabIndex={-1}
            aria-hidden="true"
            className="fixed top-0 left-0 right-0 z-50 hidden w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"
        >
            <div className="relative w-full max-w-2xl max-h-full">
                <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                    <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Descarga Masiva de PDFs
                        </h3>
                        <button
                            type="button"
                            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                            onClick={() => modalBulkPdf?.hide()}
                            disabled={downloading}
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
                    <div className="p-6 space-y-6">
                        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                            Se descargarán {salesData?.length || 0} documentos
                            en formato PDF. Los archivos se comprimirán en un
                            archivo ZIP para facilitar la descarga.
                        </p>
                        {downloading && (
                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                <div
                                    className="bg-blue-600 h-2.5 rounded-full"
                                    style={{ width: `${progress}%` }}
                                ></div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    Progreso: {progress}%
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600">
                        <button
                            onClick={handleDownload}
                            disabled={downloading}
                            type="button"
                            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-50 flex items-center gap-2"
                        >
                            {downloading ? (
                                <>
                                    <LoadingIcon />
                                    Descargando...
                                </>
                            ) : (
                                "Iniciar Descarga"
                            )}
                        </button>
                        <button
                            onClick={() => modalBulkPdf?.hide()}
                            disabled={downloading}
                            type="button"
                            className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600 disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BulkPdfDownloadModal;
