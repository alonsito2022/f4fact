import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Eye from "@/components/icons/Eye";
import { useAuth } from "@/components/providers/AuthProvider";
import PaymentApprovalModal from "./PaymentApprovalModal";
import { Modal, ModalOptions } from "flowbite";
import {
    DocumentTextIcon,
    UserIcon,
    CalendarIcon,
    CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { XCircleIcon } from "@heroicons/react/24/solid";

export default function PaymentApprovalList({
    filterObj,
    authContext,
    currentUserId,
    pendingPaymentsData,
    pendingPaymentsLoading,
    pendingPaymentsError,
    getPendingPayments,
}: any) {
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [modalApproval, setModalApproval] = useState<Modal | null>(null);
    const [showModal, setShowModal] = useState(false);
    // Buscador por nombre de cliente
    const [searchClient, setSearchClient] = useState("");
    const auth = useAuth();

    useEffect(() => {
        if (modalApproval == null) {
            const $targetEl = document.getElementById("paymentApprovalModal");
            if ($targetEl) {
                const options: ModalOptions = {
                    placement: "top-center",
                    backdrop: "static",
                    backdropClasses:
                        "bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40",
                    closable: false,
                };
                const newModal = new Modal($targetEl, options);
                setModalApproval(newModal);
            }
        }
    }, [modalApproval]);

    const handleActionCompleted = () => {
        getPendingPayments({
            variables: {
                subsidiaryId: Number(auth?.user?.subsidiaryId) || 0,
                status: filterObj.status === "ALL" ? null : filterObj.status,
                startDate: filterObj.startDate || null,
                endDate: filterObj.endDate || null,
            },
        });
        setShowModal(false);
    };

    const openApprovalModal = (payment: any) => {
        setSelectedPayment(payment);
        setShowModal(true);
        modalApproval?.show();
    };

    const closeModal = () => {
        setShowModal(false);
        modalApproval?.hide();
        setSelectedPayment(null);
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            PENDING: {
                bg: "bg-yellow-100 dark:bg-yellow-900",
                text: "text-yellow-800 dark:text-yellow-200",
                border: "border-yellow-200 dark:border-yellow-700",
                label: "Pendiente",
            },
            APPROVED: {
                bg: "bg-green-100 dark:bg-green-900",
                text: "text-green-800 dark:text-green-200",
                border: "border-green-200 dark:border-green-700",
                label: "Aprobado",
            },
            REJECTED: {
                bg: "bg-red-100 dark:bg-red-900",
                text: "text-red-800 dark:text-red-200",
                border: "border-red-200 dark:border-red-700",
                label: "Rechazado",
            },
            PROCESSING: {
                bg: "bg-blue-100 dark:bg-blue-900",
                text: "text-blue-800 dark:text-blue-200",
                border: "border-blue-200 dark:border-blue-700",
                label: "Procesando",
            },
        };

        const config =
            statusConfig[status as keyof typeof statusConfig] ||
            statusConfig.PENDING;

        return (
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text} ${config.border}`}
            >
                {config.label}
            </span>
        );
    };

    if (pendingPaymentsLoading) {
        return (
            <div className="p-8 text-center">
                <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-blue-500 hover:bg-blue-400 transition ease-in-out duration-150 cursor-not-allowed">
                    <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                    Cargando pagos pendientes...
                </div>
            </div>
        );
    }

    if (pendingPaymentsError) {
        return (
            <div className="p-8 text-center">
                <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-red-500">
                    <XCircleIcon className="w-5 h-5 mr-2" />
                    Error: {pendingPaymentsError.message}
                </div>
            </div>
        );
    }

    const payments = pendingPaymentsData?.pendingPayments || [];
    // Filtrar por nombre de cliente

    if (payments.length === 0) {
        return (
            <div className="p-8 text-center">
                <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                    <DocumentTextIcon className="w-5 h-5 mr-2" />
                    No hay pagos pendientes para mostrar
                </div>
            </div>
        );
    }

    const filteredPayments = payments?.filter((payment: any) =>
        payment.operation?.client?.names
            ?.toLowerCase()
            .includes(searchClient.toLowerCase())
    );

    // Contador de registros
    const paymentsCount = filteredPayments.length;
    if (paymentsCount === 0) {
        return (
            <div className="p-8 text-center">
                <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                    <DocumentTextIcon className="w-5 h-5 mr-2" />
                    No hay pagos pendientes para mostrar
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Buscador y contador */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <input
                        type="search"
                        placeholder="Buscar por nombre de cliente..."
                        value={searchClient}
                        onChange={(e) => setSearchClient(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-200"
                    />
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                    Registros:{" "}
                    <span className="font-bold">{paymentsCount}</span>
                </div>
            </div>
            <div className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                >
                                    Información del Pago
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                >
                                    Operación
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                >
                                    Estado
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                >
                                    Fecha
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                >
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {payments.map((payment: any) => (
                                <tr
                                    key={payment.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex-shrink-0">
                                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                                    <CurrencyDollarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    S/{" "}
                                                    {Number(
                                                        payment.amount
                                                    ).toFixed(2)}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                                    <span className="truncate">
                                                        {
                                                            payment.paymentMethodName
                                                        }
                                                    </span>
                                                </div>
                                                {payment.description && (
                                                    <div className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-xs">
                                                        {payment.description}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex-shrink-0">
                                                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                                    <DocumentTextIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {
                                                        payment.operation
                                                            ?.documentTypeReadable
                                                    }{" "}
                                                    {payment.operation?.serial}-
                                                    {
                                                        payment.operation
                                                            ?.correlative
                                                    }
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                                    <UserIcon className="w-4 h-4 mr-1" />
                                                    <span className="truncate max-w-xs">
                                                        {
                                                            payment.operation
                                                                ?.client?.names
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(payment.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center">
                                            <CalendarIcon className="w-4 h-4 mr-2" />
                                            {new Date(
                                                payment.createdAt
                                            ).toLocaleDateString("es-ES", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() =>
                                                openApprovalModal(payment)
                                            }
                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                                        >
                                            <Eye />
                                            Gestionar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <PaymentApprovalModal
                modalApproval={modalApproval}
                setModalApproval={setModalApproval}
                selectedPayment={selectedPayment}
                onActionCompleted={handleActionCompleted}
                onClose={closeModal}
                showModal={showModal}
                authContext={authContext}
                currentUserId={currentUserId}
            />
        </>
    );
}
