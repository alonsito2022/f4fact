import React from "react";

function PaymentApprovalStats({ filterObj }: any) {
    return (
        <div className="p-4">
            <div className="grid sm:grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Total Pendientes
                    </div>
                    <div className="text-2xl font-bold text-yellow-600">0</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Total Aprobados
                    </div>
                    <div className="text-2xl font-bold text-green-600">0</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Total Rechazados
                    </div>
                    <div className="text-2xl font-bold text-red-600">0</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Monto Pendiente
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                        S/ 0.00
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PaymentApprovalStats;
