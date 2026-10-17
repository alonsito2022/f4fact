"use client";
import { Modal } from "flowbite";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useInvoiceTypeModal } from "@/components/context/InvoiceTypeModalContext";

function InvoiceTypeModal() {
    const { modalInvoiceType, hideModal } = useInvoiceTypeModal();
    const router = useRouter();

    return (
        <div
            id="invoice-type-modal"
            tabIndex={-1}
            className="fixed top-0 left-0 right-0 z-50 hidden w-full overflow-x-hidden overflow-y-auto p-4"
        >
            <div className="relative mx-auto w-full max-w-md">
                <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
                    {/* Encabezado */}
                    <div className="flex items-start gap-3 border-b border-gray-100 px-5 py-4 dark:border-gray-700">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-400/20">
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
                                Nuevo comprobante
                            </h3>
                            <p className="mt-0.5 text-[13px] text-gray-500 dark:text-gray-400">
                                Selecciona el tipo de documento que vas a emitir
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => modalInvoiceType?.hide()}
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
                    <div className="space-y-2.5 p-5">
                        <button
                            type="button"
                            onClick={() => {
                                router.push("/dashboard/sales/new/01");
                                modalInvoiceType?.hide();
                            }}
                            className="group flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-left transition-colors hover:border-blue-300 hover:bg-blue-50/60 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900/40 dark:hover:border-blue-400/60 dark:hover:bg-blue-500/10 dark:focus:ring-blue-500/20"
                        >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-100 transition-colors group-hover:bg-emerald-100 dark:bg-emerald-400/10 dark:text-emerald-400 dark:ring-emerald-400/20">
                                <svg
                                    width="18"
                                    height="18"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={1.8}
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                                    />
                                </svg>
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                                    Factura electrónica
                                </span>
                                <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                                    Para venta a personas jurídicas con RUC
                                </span>
                            </span>
                            <svg
                                className="h-4 w-4 shrink-0 text-gray-300 transition-colors group-hover:translate-x-0.5 group-hover:text-blue-500 dark:text-gray-600 dark:group-hover:text-blue-400"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                                />
                            </svg>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                router.push("/dashboard/sales/new/03");
                                modalInvoiceType?.hide();
                            }}
                            className="group flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-left transition-colors hover:border-blue-300 hover:bg-blue-50/60 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900/40 dark:hover:border-blue-400/60 dark:hover:bg-blue-500/10 dark:focus:ring-blue-500/20"
                        >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600 ring-1 ring-inset ring-sky-100 transition-colors group-hover:bg-sky-100 dark:bg-sky-400/10 dark:text-sky-400 dark:ring-sky-400/20">
                                <svg
                                    width="18"
                                    height="18"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={1.8}
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12A1.125 1.125 0 0119.75 22H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
                                    />
                                </svg>
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                                    Boleta de venta electrónica
                                </span>
                                <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                                    Para venta a personas naturales con DNI
                                </span>
                            </span>
                            <svg
                                className="h-4 w-4 shrink-0 text-gray-300 transition-colors group-hover:translate-x-0.5 group-hover:text-blue-500 dark:text-gray-600 dark:group-hover:text-blue-400"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default InvoiceTypeModal;