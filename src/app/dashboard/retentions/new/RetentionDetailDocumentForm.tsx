import { ChangeEvent, FormEvent, useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import Save from "@/components/icons/Save";
import { Modal, ModalOptions } from "flowbite";
import {
    IOperation,
    IQuota,
    IRelatedDocument,
    IRetentionType,
} from "@/app/types";
import { gql, useQuery } from "@apollo/client";
const limaDate = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Lima" })
);
const today =
    limaDate.getFullYear() +
    "-" +
    String(limaDate.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(limaDate.getDate()).padStart(2, "0");

function RetentionDetailDocumentForm({
    modalAddDetail,
    setModalAddDetail,
    retention,
    setRetention,
    retentionDetail,
    setRetentionDetail,
    initialStateRetentionDetail,
    retentionTypesData,
}: any) {
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    // Modify the modal close function
    const handleCloseModal = () => {
        // Remove focus from any element inside the modal before closing
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
        setRetentionDetail(initialStateRetentionDetail);
        modalAddDetail.hide();
    };

    useEffect(() => {
        if (modalAddDetail == null) {
            const $targetEl = document.getElementById("modalAddDetail");
            const options: ModalOptions = {
                placement: "top-center",
                backdrop: "static",
                backdropClasses:
                    "bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40",
                closable: false,
            };
            setModalAddDetail(new Modal($targetEl, options));
        }
    }, [modalAddDetail, setModalAddDetail]);

    const handleAddDetail = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Validate document information
        if (!retentionDetail.serial || retentionDetail.serial.length !== 4) {
            toast.warning("La serie debe tener exactamente 4 dígitos");
            return;
        }

        if (
            !retentionDetail.correlative ||
            Number(retentionDetail.correlative) <= 0
        ) {
            toast.warning("El número debe ser mayor a cero");
            return;
        }

        if (
            !retentionDetail.totalAmount ||
            Number(retentionDetail.totalAmount) <= 0
        ) {
            toast.warning(
                "El importe total es obligatorio y debe ser mayor a cero"
            );
            return;
        }

        // Validate payment quotas
        if (!retentionDetail.quotas || retentionDetail.quotas.length === 0) {
            toast.warning("Debe agregar al menos un pago");
            return;
        }

        // Validate each quota
        for (let i = 0; i < retentionDetail.quotas.length; i++) {
            const quota = retentionDetail.quotas[i];
            if (!quota.total || Number(quota.total) <= 0) {
                toast.warning(
                    `El importe del pago ${
                        i + 1
                    } debe ser un valor válido mayor a cero`
                );
                return;
            }
        }

        // Validate retention amount
        if (
            !retentionDetail.totalRetention ||
            Number(retentionDetail.totalRetention) <= 0
        ) {
            toast.warning(
                "El importe de retención es obligatorio y debe ser mayor a cero"
            );
            return;
        }

        // If all validations pass, proceed with the existing logic
        if (Number(retentionDetail?.temporaryId) > 0) {
            // Combina la eliminación y la edición en una sola operación
            const newSaleDetail = {
                ...retentionDetail,
                temporaryId: retentionDetail.temporaryId,
            };

            setRetention((prevRetention: IOperation) => ({
                ...prevRetention,
                relatedDocuments: prevRetention?.relatedDocuments?.map(
                    (detail: IRelatedDocument) =>
                        detail.temporaryId === newSaleDetail.temporaryId
                            ? newSaleDetail
                            : detail
                ),
            }));
        } else {
            let newSaleDetail = {
                ...retentionDetail,
                temporaryId: retention.relatedDocuments.length + 1,
            };
            setRetention((prevRetention: IOperation) => ({
                ...prevRetention,
                relatedDocuments: [
                    ...prevRetention.relatedDocuments!,
                    newSaleDetail,
                ],
            }));
        }

        // Use the new close function
        handleCloseModal();
    };
    const handleInputChangeSaleDetail = async (
        event: ChangeEvent<
            HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = event.target;
        setRetentionDetail({ ...retentionDetail, [name]: value });
    };

    // Add these handlers near your other handlers
    const handleAddQuota = () => {
        if (retentionDetail.quotas.length >= 60) {
            toast.warning("No se pueden agregar más de 60 cuotas");
            return;
        }

        setRetentionDetail({
            ...retentionDetail,
            quotas: [
                ...retentionDetail.quotas,
                {
                    paymentDate: today,
                    number: `${retentionDetail.quotas.length + 1}`,
                    total: "",
                },
            ],
        });
    };

    const handleRemoveQuota = (index: number) => {
        const newQuotas = retentionDetail.quotas.filter(
            (_: IQuota, i: number) => i !== index
        );
        setRetentionDetail({
            ...retentionDetail,
            quotas: newQuotas,
        });
    };

    const handleQuotaChange = (index: number, field: string, value: string) => {
        const newQuotas = retentionDetail.quotas.map(
            (quota: IQuota, i: number) => {
                if (i === index) {
                    return { ...quota, [field]: value };
                }
                return quota;
            }
        );
        setRetentionDetail({
            ...retentionDetail,
            quotas: newQuotas,
        });
    };

    return (
        <>
            {/* Large Modal */}
            <div
                id="modalAddDetail"
                // ref={modalRef}
                tabIndex={-1}
                className="fixed top-0 left-0 right-0 z-50 hidden w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"
            >
                <div className="relative w-full max-w-4xl max-h-full">
                    {/* Modal content */}
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                        {/* Modal header */}
                        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                            <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                                Datos del comprobante relacionado
                            </h3>
                            <button
                                ref={closeButtonRef}
                                type="button"
                                onClick={handleCloseModal}
                                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                            >
                                <svg
                                    className="w-3 h-3"
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
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>
                        {/* Modal body */}

                        <form onSubmit={handleAddDetail}>
                            <div className="p-6 space-y-6">
                                {/* Document Information Section */}
                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">
                                        Información del Comprobante
                                    </h4>
                                    <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* CPE Tipo documento */}
                                        <div className="col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Tipo documento
                                            </label>
                                            <select
                                                value={
                                                    retentionDetail?.documentType
                                                }
                                                onChange={
                                                    handleInputChangeSaleDetail
                                                }
                                                name="documentType"
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                            >
                                                <option value="01">
                                                    FACTURA
                                                </option>
                                                <option value="03">
                                                    BOLETA
                                                </option>
                                            </select>
                                        </div>

                                        {/* Serie */}
                                        <div className="col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Serie
                                            </label>
                                            <input
                                                type="text"
                                                name="serial"
                                                maxLength={4}
                                                value={retentionDetail.serial}
                                                onChange={
                                                    handleInputChangeSaleDetail
                                                }
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                autoComplete="off"
                                            />
                                        </div>

                                        {/* Numero */}
                                        <div className="col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Numero
                                            </label>
                                            <input
                                                type="text"
                                                name="correlative"
                                                maxLength={10}
                                                value={
                                                    retentionDetail.correlative
                                                }
                                                onChange={
                                                    handleInputChangeSaleDetail
                                                }
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                autoComplete="off"
                                            />
                                        </div>

                                        {/* Fecha emisión */}
                                        <div className="col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Fecha emisión
                                            </label>
                                            <input
                                                type="date"
                                                name="emitDate"
                                                value={retentionDetail.emitDate}
                                                onChange={
                                                    handleInputChangeSaleDetail
                                                }
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                required
                                            />
                                        </div>

                                        {/* Tipo de moneda */}
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Tipo de moneda
                                            </label>
                                            <select
                                                value={
                                                    retentionDetail.currencyType
                                                }
                                                name="currencyType"
                                                onChange={
                                                    handleInputChangeSaleDetail
                                                }
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                            >
                                                <option value={0} disabled>
                                                    Moneda
                                                </option>
                                                <option value={"PEN"}>
                                                    S/ PEN - SOLES
                                                </option>
                                                <option value={"USD"}>
                                                    US$ USD - DÓLARES AMERICANOS
                                                </option>
                                                <option value={"EUR"}>
                                                    € EUR - EUROS
                                                </option>
                                                <option value={"GBP"}>
                                                    £ GBP - LIBRA ESTERLINA
                                                </option>
                                            </select>
                                        </div>

                                        {/* Tipo de Cambio */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Tipo de cambio
                                            </label>
                                            <input
                                                type="text"
                                                name="saleExchangeRate"
                                                maxLength={10}
                                                value={
                                                    retentionDetail.saleExchangeRate
                                                }
                                                onChange={
                                                    handleInputChangeSaleDetail
                                                }
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                autoComplete="off"
                                            />
                                        </div>

                                        {/* Fecha de cambio */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Fecha de cambio
                                            </label>
                                            <input
                                                type="date"
                                                name="currencyDateChange"
                                                value={
                                                    retentionDetail.currencyDateChange
                                                }
                                                onChange={
                                                    handleInputChangeSaleDetail
                                                }
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                required
                                            />
                                        </div>

                                        {/* Importe total */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Importe total del comprobante
                                            </label>
                                            <input
                                                type="number"
                                                name="totalAmount"
                                                onWheel={(e) =>
                                                    e.currentTarget.blur()
                                                }
                                                value={
                                                    retentionDetail.totalAmount
                                                }
                                                onChange={
                                                    handleInputChangeSaleDetail
                                                }
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Quotas Section */}
                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                            Datos del pago
                                        </h4>
                                        <button
                                            type="button"
                                            onClick={handleAddQuota}
                                            className="px-3 py-1 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-300"
                                        >
                                            Agregar Pago
                                        </button>
                                    </div>

                                    {retentionDetail.quotas.map(
                                        (quota: IQuota, index: number) => (
                                            <div
                                                key={index}
                                                className="mb-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg"
                                            >
                                                <div className="grid sm:grid-cols-1 md:grid-cols-4 gap-6">
                                                    <div className="col-span-1">
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Fecha de pago
                                                        </label>
                                                        <input
                                                            type="date"
                                                            value={
                                                                quota.paymentDate
                                                            }
                                                            onChange={(e) =>
                                                                handleQuotaChange(
                                                                    index,
                                                                    "paymentDate",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                            required
                                                        />
                                                    </div>

                                                    <div className="col-span-1">
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Numero correlativo
                                                        </label>
                                                        <input
                                                            type="text"
                                                            maxLength={10}
                                                            value={quota.number}
                                                            onChange={(e) =>
                                                                handleQuotaChange(
                                                                    index,
                                                                    "number",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                            autoComplete="off"
                                                        />
                                                    </div>

                                                    <div className="col-span-1">
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Importe de pago
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={quota.total}
                                                            onFocus={(e) =>
                                                                e.target.select()
                                                            }
                                                            onChange={(e) =>
                                                                handleQuotaChange(
                                                                    index,
                                                                    "total",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                            required
                                                        />
                                                    </div>

                                                    <div className="col-span-1 flex items-end">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleRemoveQuota(
                                                                    index
                                                                )
                                                            }
                                                            className="px-3 py-3 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-300"
                                                        >
                                                            Eliminar Pago
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                                {/* Datos de la retención */}
                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">
                                        Datos de la retención
                                    </h4>
                                    <div className="grid sm:grid-cols-1 md:grid-cols-4 gap-6">
                                        {/* Régimen de Retención */}
                                        <div className="sm:col-span-2">
                                            <label
                                                htmlFor="retentionType"
                                                className="form-label text-gray-900 dark:text-gray-200"
                                            >
                                                Régimen de Retención
                                            </label>
                                            <select
                                                name="retentionType"
                                                id="retentionType"
                                                onChange={
                                                    handleInputChangeSaleDetail
                                                }
                                                value={
                                                    retentionDetail.retentionType
                                                }
                                                className="form-control dark:bg-gray-800 dark:text-gray-200"
                                            >
                                                {retentionTypesData?.allRetentionTypes?.map(
                                                    (
                                                        o: IRetentionType,
                                                        k: number
                                                    ) => (
                                                        <option
                                                            key={k}
                                                            value={o.code}
                                                        >
                                                            {o.name}
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        </div>
                                        {/* Importe retenido (S/) */}
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-600 dark:text-gray-400">
                                                Importe retenido (S/)
                                            </label>
                                            <input
                                                type="number"
                                                name="totalRetention"
                                                onWheel={(e) =>
                                                    e.currentTarget.blur()
                                                }
                                                value={
                                                    retentionDetail.totalRetention
                                                }
                                                onChange={
                                                    handleInputChangeSaleDetail
                                                }
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        {/* Fecha de retención */}
                                        <div className="col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Fecha de retención
                                            </label>
                                            <input
                                                type="date"
                                                name="retentionDate"
                                                value={
                                                    retentionDetail.retentionDate
                                                }
                                                onChange={
                                                    handleInputChangeSaleDetail
                                                }
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                required
                                            />
                                        </div>
                                        {/* Importe neto pagado (deducida la retención) (S/) */}
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Importe neto pagado (deducida la
                                                retención) (S/)
                                            </label>
                                            <input
                                                type="number"
                                                value={Number(
                                                    Number(
                                                        retentionDetail.totalAmount
                                                    ) -
                                                        Number(
                                                            retentionDetail.totalRetention
                                                        )
                                                ).toFixed(2)}
                                                disabled
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal footer */}
                            <div className="flex items-center justify-end p-6 space-x-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                                >
                                    Cerrar
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center gap-2"
                                >
                                    <Save /> Aceptar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

export default RetentionDetailDocumentForm;
