import { useState } from "react";
import Filter from "@/components/icons/Filter";

function PaymentApprovalFilter({
    filterObj,
    setFilterObj,
    initialStateFilterObj,
    getPendingPayments,
    auth,
}: any) {
    return (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Fecha Inicio
                    </label>
                    <input
                        type="date"
                        value={filterObj.startDate}
                        onChange={(e) =>
                            setFilterObj({
                                ...filterObj,
                                startDate: e.target.value,
                            })
                        }
                        className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Fecha Fin
                    </label>
                    <input
                        type="date"
                        value={filterObj.endDate}
                        onChange={(e) =>
                            setFilterObj({
                                ...filterObj,
                                endDate: e.target.value,
                            })
                        }
                        className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Estado
                    </label>
                    <select
                        value={filterObj.status}
                        onChange={(e) =>
                            setFilterObj({
                                ...filterObj,
                                status: e.target.value,
                            })
                        }
                        className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700"
                    >
                        <option value="PENDING">Pendientes</option>
                        <option value="APPROVED">Aprobados</option>
                        <option value="REJECTED">Rechazados</option>
                        <option value="PROCESSING">En Proceso</option>
                        <option value="CANCELLED">Cancelados</option>
                        <option value="ALL">Todos</option>
                    </select>
                </div>

                <div className="flex items-end space-x-2">
                    <button
                        onClick={() => {
                            getPendingPayments({
                                variables: {
                                    subsidiaryId: Number(
                                        auth?.user?.subsidiaryId
                                    ),
                                    status: filterObj.status,
                                    startDate: filterObj.startDate,
                                    endDate: filterObj.endDate,
                                },
                            });
                            // setFilterObj(initialStateFilterObj);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Filter />
                        Filtrar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PaymentApprovalFilter;
