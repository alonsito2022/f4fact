import Excel from "@/components/icons/Excel";
import React, { useEffect, useState } from "react";
import { Modal, ModalOptions } from "flowbite";
import { toast } from "react-toastify";

function MonthlySummaryFilter() {
    const [modalExcel, setModalExcel] = useState<Modal | any>(null);
    const [hostname, setHostname] = useState("");

    useEffect(() => {
        if (hostname == "") {
            setHostname(`${process.env.NEXT_PUBLIC_BASE_API}`);
        }
    }, [hostname]);

    useEffect(() => {
        if (modalExcel == null) {
            const $targetEl = document.getElementById("monthly-excel-modal");
            const options: ModalOptions = {
                placement: "center",
                backdrop: "static",
                closable: true,
            };
            setModalExcel(new Modal($targetEl, options));
        }
    }, []);

    const handleExportToExcel = () => {
        const url = `${hostname}/logistics/export-monthly-report-excel/?subsidiary_id=1`;
        window.open(url, "_blank");
    };

    return (
        <>
            <div className="w-full mb-1 mt-2">
                <div className="flex items-center gap-2 mb-3">
                    <h1 className="text-3xl font-light text-gray-800 dark:text-white">
                        Resumen Mensual de Ventas y Compras
                    </h1>
                </div>

                <div className="grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 items-start rounded-lg shadow-sm">
                    <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 col-span-full">
                        <button
                            type="button"
                            onClick={() => modalExcel?.show()}
                            title="Exportar resumen mensual a Excel"
                            className="btn-green h-8 px-3 flex items-center justify-center gap-1 rounded-full hover:opacity-90 transition-all duration-200 shadow-sm hover:shadow-md text-sm"
                        >
                            <Excel />
                            <span className="sm:inline">Exportar a Excel</span>
                            <span className="sm:hidden">Excel</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de Exportación Excel */}
            <div
                id="monthly-excel-modal"
                tabIndex={-1}
                aria-hidden="true"
                className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
            >
                <div className="relative p-4 w-full max-w-md max-h-full">
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Exportar Resumen Mensual
                            </h3>

                            <button
                                type="button"
                                onClick={() => modalExcel?.hide()}
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
                            <div className="mb-4">
                                <div className="flex items-center p-4 text-sm text-blue-800 border border-blue-300 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-800">
                                    <svg
                                        className="flex-shrink-0 inline w-4 h-4 me-3"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                                    </svg>
                                    <span className="sr-only">Info</span>
                                    <div>
                                        <span className="font-medium">
                                            Información:
                                        </span>{" "}
                                        El archivo se descargará con el resumen
                                        mensual completo de ventas y compras.
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="flex items-center p-4 text-sm text-green-800 border border-green-300 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400 dark:border-green-800">
                                    <svg
                                        className="flex-shrink-0 inline w-4 h-4 me-3"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                                    </svg>
                                    <span className="sr-only">Info</span>
                                    <div>
                                        <span className="font-medium">
                                            Contenido:
                                        </span>{" "}
                                        Incluye comparación de ventas y compras
                                        del mes actual vs mes anterior.
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    const url = `${hostname}/logistics/export-monthly-report-excel/?subsidiary_id=1`;
                                    window.open(url, "_blank");
                                    modalExcel?.hide();
                                }}
                                className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                            >
                                Descargar Excel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default MonthlySummaryFilter;
