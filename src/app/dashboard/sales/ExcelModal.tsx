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

    // Consulta para obtener usuarios
    const { data: usersData } = useQuery(USERS_QUERY, {
        fetchPolicy: "network-only",
    });

    // Filtrar usuarios por sucursal del usuario logueado
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

    // Limpiar selectedUserId cuando se desmarca la casilla
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

    return (
        <div
            id="excel-modal"
            tabIndex={-1}
            aria-hidden="true"
            className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
        >
            <div className="relative p-4 w-full max-w-md max-h-full">
                <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                    <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Opciones de Exportación
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
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Rango de Fechas
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <input
                                        type="date"
                                        value={filterObj.startDate}
                                        onChange={(e) =>
                                            setFilterObj({
                                                ...filterObj,
                                                startDate: e.target.value,
                                            })
                                        }
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="date"
                                        value={filterObj.endDate}
                                        onChange={(e) =>
                                            setFilterObj({
                                                ...filterObj,
                                                endDate: e.target.value,
                                            })
                                        }
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
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
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                required
                            >
                                <option value="">Seleccione un tipo</option>
                                <option value="DETAIL">
                                    DETALLE COMPROBANTES (Solo cabeceras)
                                </option>
                                <option value="ITEMS">
                                    ITEMS DE COMPROBANTES (Nuevo)
                                </option>
                            </select>
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

                        <div className="mb-4">
                            <div className="flex items-center mb-2">
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
                                    className="ml-2 text-sm font-medium text-gray-900 dark:text-white"
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
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
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
                            onClick={() => {
                                if (!filterObj.reportType) {
                                    toast(
                                        "Por favor seleccione un tipo de reporte",
                                        {
                                            hideProgressBar: true,
                                            autoClose: 2000,
                                            type: "warning",
                                        }
                                    );
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

                                // Construir URL con o sin user_id
                                let url = `${hostname}/operations/export_sales_to_excel/${filterObj.subsidiaryId}/${filterObj.startDate}/${filterObj.endDate}/${filterObj.documentType}/${filterObj.reportType}/`;

                                // Solo agregar user_id si la casilla está marcada Y hay un usuario seleccionado
                                if (
                                    filterByUser === true &&
                                    selectedUserId &&
                                    selectedUserId !== ""
                                ) {
                                    url += `${selectedUserId}/`;
                                }

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
    );
}

export default ExcelModal;
