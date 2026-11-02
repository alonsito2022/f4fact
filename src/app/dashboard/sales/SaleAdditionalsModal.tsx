import React, { ChangeEvent, useEffect } from "react";
import { Modal, ModalOptions } from "flowbite";

interface SaleAdditionalsModalProps {
    modalAdditionals: Modal | null;
    setModalAdditionals: (modal: Modal | null) => void;
    purchaseOrder: string;
    vehiclePlate: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

function SaleAdditionalsModal({
    modalAdditionals,
    setModalAdditionals,
    purchaseOrder,
    vehiclePlate,
    onChange,
}: SaleAdditionalsModalProps) {
    useEffect(() => {
        if (modalAdditionals == null) {
            const $targetEl = document.getElementById("sale-additionals-modal");
            const options: ModalOptions = {
                placement: "center",
                backdrop: "static",
                closable: true,
            };
            setModalAdditionals(new Modal($targetEl, options));
        }
    }, []);

    const fieldClass =
        "mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100";

    return (
        <div
            id="sale-additionals-modal"
            tabIndex={-1}
            aria-hidden="true"
            className="fixed left-0 right-0 top-0 z-50 hidden h-[calc(100%-1rem)] max-h-full w-full items-center justify-center overflow-x-hidden overflow-y-auto"
        >
            <div className="relative max-h-full w-full max-w-lg p-4">
                <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-start gap-3 border-b border-gray-100 px-5 py-4 dark:border-gray-700">
                        <div className="min-w-0 flex-1">
                            <h3 className="text-base font-semibold uppercase tracking-wide text-gray-900 dark:text-white">
                                Adicionales
                            </h3>
                            <p className="mt-0.5 text-[13px] text-gray-500 dark:text-gray-400">
                                Datos opcionales del comprobante
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => modalAdditionals?.hide()}
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

                    <div className="space-y-4 p-5">
                        <div>
                            <label
                                htmlFor="purchaseOrder"
                                className="text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Orden de compra / servicio
                            </label>
                            <input
                                type="text"
                                name="purchaseOrder"
                                id="purchaseOrder"
                                maxLength={50}
                                value={purchaseOrder}
                                onChange={onChange}
                                onFocus={(e) => e.target.select()}
                                className={fieldClass}
                                autoComplete="off"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="vehiclePlate"
                                className="text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Placa de vehículo. Venta de combustible o
                                mantenimiento
                            </label>
                            <input
                                type="text"
                                name="vehiclePlate"
                                id="vehiclePlate"
                                maxLength={20}
                                value={vehiclePlate}
                                onChange={onChange}
                                onFocus={(e) => e.target.select()}
                                className={fieldClass}
                                autoComplete="off"
                            />
                        </div>

                        <div className="flex items-center justify-end pt-1">
                            <button
                                type="button"
                                onClick={() => modalAdditionals?.hide()}
                                className="inline-flex h-9 items-center justify-center rounded-lg border border-blue-600 bg-blue-50 px-4 text-[13px] font-semibold text-blue-700 shadow-sm transition-colors hover:border-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-4 focus:ring-blue-200/70 dark:border-blue-400/40 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:border-blue-400/70 dark:hover:bg-blue-500/20 dark:focus:ring-blue-500/30"
                            >
                                Listo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SaleAdditionalsModal;
