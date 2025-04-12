import { Modal, ModalOptions } from "flowbite";
import React, { useEffect } from "react";
import { toast } from "react-toastify";

function SearchInvoice({
    modalSearchInvoice,
    setModalSearchInvoice,
    setFilterObj,
    filterObj,
    salesQuery,
    filteredSaleLoading,
}: any) {
    const handleClickButton = async () => {
        if (filterObj.documentType == "NA") {
            toast("Por favor seleccione un tipo de documento", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
            });
            return;
        }
        if (filterObj.serial == "") {
            toast("Por favor ingrese una serie", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
            });
            return;
        }
        if (filterObj.correlative == "") {
            toast("Por favor ingrese un número", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
            });
            return;
        }
        salesQuery({
            variables: {
                subsidiaryId: Number(filterObj.subsidiaryId),
                clientId: Number(filterObj.clientId),
                startDate: filterObj.startDate,
                endDate: filterObj.endDate,
                documentType: filterObj.documentType,
                page: 1, // Asegúrate de pasar la página como 1 aquí también
                pageSize: Number(filterObj.pageSize),
                serial: String(filterObj.serial),
                correlative: Number(filterObj.correlative),
            },
        });
        setFilterObj({
            ...filterObj,
            serial: "",
            correlative: "",
            documentType: "NA",
        });
        modalSearchInvoice?.hide();
    };
    useEffect(() => {
        if (modalSearchInvoice == null) {
            const $targetEl = document.getElementById("search-invoice-modal");
            const options: ModalOptions = {
                placement: "center",
                backdrop: "static",
                closable: true,
            };
            setModalSearchInvoice(new Modal($targetEl, options));
        }
    }, []);
    return (
        <>
            <div
                id="search-invoice-modal"
                tabIndex={-1}
                aria-hidden="true"
                className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
            >
                <div className="relative p-4 w-full max-w-md max-h-full">
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Buscar Documento
                            </h3>
                            <button
                                type="button"
                                onClick={() => modalSearchInvoice?.hide()}
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
                            {/* Serie (4 dígitos, Ejm. F001/B001/T001/RRR1/PPP1) */}
                            <div className="mb-4">
                                <label
                                    htmlFor="serial"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Serie (4 dígitos, Ejm.
                                    F001/B001/T001/RRR1/PPP1)
                                </label>
                                <input
                                    type="text"
                                    name="serial"
                                    maxLength={4}
                                    value={filterObj.serial}
                                    onChange={(e) =>
                                        setFilterObj({
                                            ...filterObj,
                                            serial: e.target.value,
                                        })
                                    }
                                    onFocus={(e) => e.target.select()}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                    autoComplete="off"
                                />
                            </div>
                            {/* Numero */}
                            <div className="mb-4">
                                <label
                                    htmlFor="correlative"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Número (1 hasta 8 díditos)
                                </label>
                                <input
                                    type="text"
                                    name="correlative"
                                    maxLength={8}
                                    value={filterObj.correlative}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(
                                            /\D/g,
                                            ""
                                        ); // Only keeps digits
                                        setFilterObj({
                                            ...filterObj,
                                            correlative: value,
                                        });
                                    }}
                                    onFocus={(e) => e.target.select()}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                    autoComplete="off"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Tipo de Comprobante
                                </label>
                                <select
                                    value={filterObj.documentType}
                                    onChange={(e) =>
                                        setFilterObj({
                                            ...filterObj,
                                            documentType: e.target.value,
                                        })
                                    }
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                >
                                    <option value={"NA"}>
                                        📄 Filtrar por tipo de Doc.
                                    </option>
                                    <option value={"01"}>
                                        🧾 FACTURA ELECTRÓNICA
                                    </option>
                                    <option value={"03"}>
                                        🧾 BOLETA DE VENTA ELECTRÓNICA
                                    </option>
                                    <option value={"07"}>
                                        📝 NOTA DE CRÉDITO ELECTRÓNICA
                                    </option>
                                </select>
                            </div>
                            <button
                                type="button"
                                onClick={handleClickButton}
                                disabled={filteredSaleLoading}
                                className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                            >
                                Buscar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default SearchInvoice;
