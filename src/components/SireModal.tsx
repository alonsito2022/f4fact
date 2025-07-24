// src/components/SireModal.tsx
"use client";
import { useEffect, useState } from "react";
import { Modal } from "flowbite";
import { toast } from "react-toastify";

function SireModal({
    modalSire,
    setModalSire,
    subsidiaryId,
    ruc,
}: {
    modalSire: Modal | null;
    setModalSire: (modal: Modal | null) => void;
    subsidiaryId: number;
    ruc: string;
}) {
    const [book, setBook] = useState("080400");
    const [month, setMonth] = useState("1");
    const [year, setYear] = useState(new Date().getFullYear().toString());
    useEffect(() => {
        const $modalElement = document.querySelector("#sire-modal");
        if ($modalElement) {
            const modal = new Modal($modalElement as HTMLElement, {
                backdrop: "static",
                closable: false,
            });
            setModalSire(modal);
        }
    }, [setModalSire]);

    const handleDownload = async () => {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_BASE_API || "";

            let url = "";
            if (book === "080400") {
                url = `${baseUrl}/operations/export_purchases_to_sire_txt/${subsidiaryId}/${year}/${month}/`;
            } else if (book === "140400") {
                url = `${baseUrl}/operations/export_sales_to_sire_txt/${subsidiaryId}/${year}/${month}/`;
            }

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error("Error al descargar archivo SIRE");
            }

            const blob = await response.blob();
            const contentDisposition = response.headers.get(
                "Content-Disposition"
            );

            // Extraer el nombre de archivo de forma más robusta
            let filename = "sire_export.txt";

            // Si no hay Content-Disposition, generar nombre basado en parámetros
            if (!contentDisposition) {
                const period = `${year}${month.padStart(2, "0")}`;

                // Generar nombre según el tipo de libro
                if (book === "140400") {
                    // SIRE Registro de Ventas
                    filename = `LE${ruc}${period}00140400021112.TXT`;
                } else if (book === "080400") {
                    // SIRE Registro de Compras
                    filename = `LE${ruc}${period}00080400021012.TXT`;
                }
            } else {
                // Buscar el patrón filename="nombre_archivo.txt"
                const filenameMatch =
                    contentDisposition.match(/filename="([^"]+)"/);

                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1];
                } else {
                    // Fallback: buscar después de filename=
                    const filenameStart =
                        contentDisposition.indexOf("filename=") + 9;

                    if (filenameStart > 9) {
                        const filenameEnd = contentDisposition.indexOf(
                            ";",
                            filenameStart
                        );
                        const extractedFilename = contentDisposition
                            .substring(
                                filenameStart,
                                filenameEnd !== -1 ? filenameEnd : undefined
                            )
                            .replace(/["']/g, "");

                        if (
                            extractedFilename &&
                            extractedFilename !== "filename="
                        ) {
                            filename = extractedFilename;
                        }
                    }
                }
            }

            // Crear ZIP con el archivo
            const JSZip = (await import("jszip")).default;
            const zip = new JSZip();
            zip.file(filename, blob);

            const content = await zip.generateAsync({ type: "blob" });
            const zipUrl = URL.createObjectURL(content);

            const link = document.createElement("a");
            link.href = zipUrl;
            const zipFilename = filename.replace(/\.txt$/i, ".zip");
            link.download = zipFilename;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("Archivo SIRE descargado correctamente");
            modalSire?.hide();
            // Reiniciar el formulario
            setBook("080400");
            setMonth("1");
            setYear(new Date().getFullYear().toString());
        } catch (error) {
            console.error("Error en handleDownload:", error);
            toast.error("Error al descargar archivo SIRE");
        }
    };
    return (
        <div
            id="sire-modal"
            tabIndex={-1}
            aria-hidden="true"
            className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
        >
            <div className="relative p-4 w-full max-w-4xl max-h-full">
                <div className="relative bg-white rounded-lg shadow-xl dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-t-lg">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                <svg
                                    className="w-6 h-6 text-blue-600 dark:text-blue-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Descargar SIRE
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Sistema Integrado de Registros Electrónicos
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white transition-colors"
                            onClick={() => modalSire?.hide()}
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Description */}
                        <div className="text-center">
                            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Indica el Libro y periodo que deseas descargar
                            </p>
                            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                <svg
                                    className="w-4 h-4 mr-2"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                Versión Beta
                            </div>
                        </div>

                        {/* Important Information */}
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                            <div className="flex items-start">
                                <svg
                                    className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <div>
                                    <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                                        IMPORTANTE:
                                    </h4>
                                    <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                                        <li>
                                            • Asegúrate de que todos los
                                            comprobantes estén enviados a la
                                            SUNAT.
                                        </li>
                                        <li>
                                            • Los comprobantes rechazados se
                                            descargan como anulados (códigos:
                                            200, 132, 2108, 1033, 1032, etc.)
                                        </li>
                                        <li>
                                            • Usa estos archivos solo si NO
                                            estás de acuerdo con la "propuesta"
                                            de SUNAT.
                                        </li>
                                        <li>
                                            • Tu razón social debe ser
                                            "exactamente igual a Consulta RUC".
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Usage Instructions */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <div className="flex items-start">
                                <svg
                                    className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <div>
                                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                                        FORMA DE USO:
                                    </h4>
                                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                                        <li>
                                            • <strong>Opción 1:</strong> SUNAT
                                            en línea con Clave SOL → "Sistema
                                            Integrado de Registros Electrónicos"
                                            SIRE
                                        </li>
                                        <li>
                                            • <strong>Opción 2:</strong> Cliente
                                            MIGE → opciones "RVIE" o "RCE"
                                        </li>
                                        <li>
                                            • Sube el archivo usando "Comparar"
                                            o "Reemplazar"
                                        </li>
                                        <li>
                                            • Confirma el preliminar y completa
                                            los pasos de SUNAT
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                <svg
                                    className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                Configuración de Descarga
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Libro o registro */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        Libro o registro
                                    </label>
                                    <select
                                        value={book}
                                        onChange={(e) =>
                                            setBook(e.target.value)
                                        }
                                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-colors"
                                    >
                                        <option value="080400" className="py-2">
                                            📊 SIRE Registro de Compras 080400
                                        </option>
                                        <option value="140400" className="py-2">
                                            📈 SIRE Registro de Ventas 140400
                                        </option>
                                    </select>
                                </div>

                                {/* Mes */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        Mes
                                    </label>
                                    <select
                                        value={month}
                                        onChange={(e) =>
                                            setMonth(e.target.value)
                                        }
                                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-colors"
                                    >
                                        {Array.from(
                                            { length: 12 },
                                            (_, i) => i + 1
                                        ).map((m) => (
                                            <option
                                                key={m}
                                                value={m}
                                                className="py-1"
                                            >
                                                {new Date(
                                                    2000,
                                                    m - 1,
                                                    1
                                                ).toLocaleString("es-PE", {
                                                    month: "long",
                                                })}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Año */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        Año
                                    </label>
                                    <select
                                        value={year}
                                        onChange={(e) =>
                                            setYear(e.target.value)
                                        }
                                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-colors"
                                    >
                                        {Array.from(
                                            { length: 10 },
                                            (_, i) => i + 2020
                                        ).map((y) => (
                                            <option
                                                key={y}
                                                value={y}
                                                className="py-1"
                                            >
                                                {y}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Download Button */}
                            <div className="mt-6 text-center">
                                <button
                                    type="button"
                                    onClick={handleDownload}
                                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg text-sm transition-all duration-200 transform hover:scale-105 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg hover:shadow-xl"
                                >
                                    <svg
                                        className="w-5 h-5 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                    Descargar [en formato .ZIP]
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SireModal;
