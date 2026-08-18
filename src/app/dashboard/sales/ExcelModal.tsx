import React, { useEffect, useState } from "react";
import { Modal, ModalOptions } from "flowbite";
import { toast } from "react-toastify";
import { gql, useQuery } from "@apollo/client";

const USERS_QUERY = gql`
    query {
        users {
            id
            document
            fullName
            firstName
            lastName
            phone
            email
            roleName
            avatar
            avatarUrl
            subsidiary {
                id
                companyName
                serial
            }
            isActive
            isSuperuser
        }
    }
`;

function ExcelModal({
    modalExcel,
    setModalExcel,
    setFilterObj,
    filterObj,
    userLogged,
}: any) {
    const [hostname, setHostname] = useState("");
    const [filterByUser, setFilterByUser] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [isDownloading, setIsDownloading] = useState(false);

    const { data: usersData } = useQuery(USERS_QUERY, {
        fetchPolicy: "network-only",
    });

    const getFilteredUsers = () => {
        if (!usersData?.users || !userLogged?.subsidiaryId) return [];
        return usersData.users.filter(
            (user: any) =>
                user.subsidiary?.id === userLogged.subsidiaryId && user.isActive
        );
    };

    useEffect(() => {
        if (hostname == "") {
            setHostname(`${process.env.NEXT_PUBLIC_BASE_API}`);
        }
    }, [hostname]);

    useEffect(() => {
        if (!filterByUser) {
            setSelectedUserId("");
        }
    }, [filterByUser]);

    useEffect(() => {
        if (modalExcel == null) {
            const $targetEl = document.getElementById("excel-modal");
            const options: ModalOptions = {
                placement: "center",
                backdrop: "static",
                closable: true,
            };
            setModalExcel(new Modal($targetEl, options));
        }
    }, []);

    const handleDownload = async () => {
        if (!filterObj.reportType) {
            toast("Por favor seleccione un tipo de reporte", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
            });
            return;
        }

        if (filterByUser && !selectedUserId) {
            toast("Por favor seleccione un usuario", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
            });
            return;
        }

        let url = `${hostname}/operations/export_sales_to_excel/${filterObj.subsidiaryId}/${filterObj.startDate}/${filterObj.endDate}/${filterObj.documentType}/${filterObj.reportType}/`;

        if (filterByUser === true && selectedUserId && selectedUserId !== "") {
            url += `${selectedUserId}/`;
        }

        setIsDownloading(true);
        modalExcel?.hide();

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Error al descargar");

            const contentDisposition = response.headers.get("Content-Disposition");
            let filename = "reporte_ventas.xlsx";
            if (contentDisposition) {
                const match = contentDisposition.match(/filename="?([^"]+)"?/);
                if (match) filename = match[1];
            }

            const blob = await response.blob();
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);

            toast("Archivo descargado correctamente", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "success",
            });
        } catch {
            toast("Error al descargar el archivo. Intente de nuevo.", {
                hideProgressBar: true,
                autoClose: 3000,
                type: "error",
            });
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <>
            <div
                id="excel-modal"
                tabIndex={-1}
                aria-hidden="true"
                className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
            >
                <div className="relative p-4 w-full max-w-lg max-h-full">
                    <div className="relative bg-white rounded-xl shadow-2xl dark:bg-gray-800">
                        <div className="flex items-center gap-3 p-5 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                <svg
                                    className="w-5 h-5 text-blue-600 dark:text-blue-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Exportar a Excel
                            </h3>
                            <button
                                type="button"
                                onClick={() => modalExcel?.hide()}
                                className="ms-auto text-gray-400 bg-transparent hover:bg-gray-100 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
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

                        <div className="p-5 space-y-4">
                            <div>
                                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Rango de Fechas
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Desde</span>
                                        <input
                                            type="date"
                                            value={filterObj.startDate}
                                            onChange={(e) =>
                                                setFilterObj({
                                                    ...filterObj,
                                                    startDate: e.target.value,
                                                })
                                            }
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Hasta</span>
                                        <input
                                            type="date"
                                            value={filterObj.endDate}
                                            onChange={(e) =>
                                                setFilterObj({
                                                    ...filterObj,
                                                    endDate: e.target.value,
                                                })
                                            }
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Tipo de Reporte
                                </label>
                                <select
                                    value={filterObj.reportType}
                                    onChange={(e) =>
                                        setFilterObj({
                                            ...filterObj,
                                            reportType: e.target.value,
                                        })
                                    }
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                                    required
                                >
                                    <option value="">Seleccione un tipo</option>
                                    <option value="DETAIL">
                                        DETALLE COMPROBANTES (Solo cabeceras)
                                    </option>
                                    <option value="ITEMS">
                                        ITEMS DE COMPROBANTES
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
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
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                                >
                                    <option value={"NA"}>
                                        Filtrar por tipo de Doc.
                                    </option>
                                    <option value={"01"}>
                                        FACTURA ELECTRÓNICA
                                    </option>
                                    <option value={"03"}>
                                        BOLETA DE VENTA ELECTRÓNICA
                                    </option>
                                    <option value={"07"}>
                                        NOTA DE CRÉDITO ELECTRÓNICA
                                    </option>
                                </select>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <input
                                        id="filterByUser"
                                        type="checkbox"
                                        checked={filterByUser}
                                        onChange={(e) => {
                                            setFilterByUser(e.target.checked);
                                        }}
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                    />
                                    <label
                                        htmlFor="filterByUser"
                                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Filtrar por usuario
                                    </label>
                                </div>

                                {filterByUser && (
                                    <select
                                        value={selectedUserId}
                                        onChange={(e) =>
                                            setSelectedUserId(e.target.value)
                                        }
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                                        required
                                    >
                                        <option value="">
                                            Seleccione un usuario
                                        </option>
                                        {getFilteredUsers().map((user: any) => (
                                            <option key={user.id} value={user.id}>
                                                {user.fullName} - {user.email}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={handleDownload}
                                className="w-full flex items-center justify-center gap-2 text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-3 text-center transition-colors dark:bg-blue-600 dark:hover:bg-blue-700"
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
                                        strokeWidth="2"
                                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                    />
                                </svg>
                                Descargar Excel
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {isDownloading && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
                        <div className="relative mx-auto w-16 h-16 mb-5">
                            <div className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-900"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 animate-spin"></div>
                            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-blue-400 dark:border-t-blue-300 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }}></div>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Generando reporte
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Preparando su archivo Excel, esto puede tomar unos momentos...
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}

export default ExcelModal;
