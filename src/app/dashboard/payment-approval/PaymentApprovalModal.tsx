import { useState, useEffect } from "react";
import { gql, useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import { Modal, ModalOptions } from "flowbite";
import Check from "@/components/icons/Check";
import CloseCircle from "@/components/icons/CloseCircle";
import Edit from "@/components/icons/Edit";
import Close from "@/components/icons/Close";

// Mutaciones GraphQL
const APPROVE_PAYMENT_MUTATION = gql`
    mutation ApprovePayment(
        $paymentId: ID!
        $approvedBy: Int!
        $approvalNotes: String
    ) {
        approvePayment(
            paymentId: $paymentId
            approvedBy: $approvedBy
            approvalNotes: $approvalNotes
        ) {
            success
            message
            payment {
                id
                status
                statusName
            }
        }
    }
`;

const REJECT_PAYMENT_MUTATION = gql`
    mutation RejectPayment(
        $paymentId: ID!
        $rejectedBy: Int!
        $rejectionReason: String!
    ) {
        rejectPayment(
            paymentId: $paymentId
            rejectedBy: $rejectedBy
            rejectionReason: $rejectionReason
        ) {
            success
            message
            payment {
                id
                status
                statusName
            }
        }
    }
`;

const UPDATE_PAYMENT_STATUS_MUTATION = gql`
    mutation UpdatePaymentStatus(
        $paymentId: ID!
        $status: String!
        $updatedBy: Int!
        $notes: String
    ) {
        updatePaymentStatus(
            paymentId: $paymentId
            status: $status
            updatedBy: $updatedBy
            notes: $notes
        ) {
            success
            message
            payment {
                id
                status
                statusName
                updatedAt
            }
        }
    }
`;

type ActionType = "approve" | "reject" | "update-status";

export default function PaymentApprovalModal({
    modalApproval,
    setModalApproval,
    selectedPayment,
    onActionCompleted,
    authContext,
    currentUserId,
    onClose,
    showModal,
}: any) {
    const [actionType, setActionType] = useState<ActionType>("approve");
    const [notes, setNotes] = useState("");
    const [status, setStatus] = useState("PROCESSING");
    const [isProcessing, setIsProcessing] = useState(false);
    // Agregar estado para mostrar imagen
    const [showImage, setShowImage] = useState(false);
    // Mutaciones
    const [approvePayment] = useMutation(APPROVE_PAYMENT_MUTATION, {
        context: authContext,
        onError: (error) => {
            toast.error(`Error al aprobar pago: ${error.message}`);
            setIsProcessing(false);
        },
    });

    const [rejectPayment] = useMutation(REJECT_PAYMENT_MUTATION, {
        context: authContext,
        onError: (error) => {
            toast.error(`Error al rechazar pago: ${error.message}`);
            setIsProcessing(false);
        },
    });

    const [updatePaymentStatus] = useMutation(UPDATE_PAYMENT_STATUS_MUTATION, {
        context: authContext,
        onError: (error) => {
            toast.error(`Error al actualizar estado: ${error.message}`);
            setIsProcessing(false);
        },
    });

    const handleCloseModal = () => {
        setActionType("approve");
        setNotes("");
        setStatus("PROCESSING");
        setIsProcessing(false);
        onClose();
    };

    const handleAction = async () => {
        if (isProcessing) return;

        try {
            setIsProcessing(true);

            switch (actionType) {
                case "approve":
                    const approveResult = await approvePayment({
                        variables: {
                            paymentId: Number(selectedPayment.id),
                            approvedBy: Number(currentUserId),
                            approvalNotes: notes,
                        },
                    });

                    if (approveResult.data?.approvePayment?.success) {
                        toast.success("Pago aprobado exitosamente");
                        onActionCompleted();
                        handleCloseModal();
                    } else {
                        toast.error(
                            approveResult.data?.approvePayment?.message ||
                                "Error al aprobar pago"
                        );
                    }
                    break;

                case "reject":
                    if (!notes.trim()) {
                        toast.error("Debe proporcionar un motivo de rechazo");
                        setIsProcessing(false);
                        return;
                    }

                    const rejectResult = await rejectPayment({
                        variables: {
                            paymentId: Number(selectedPayment.id),
                            rejectedBy: Number(currentUserId),
                            rejectionReason: notes,
                        },
                    });

                    if (rejectResult.data?.rejectPayment?.success) {
                        toast.success("Pago rechazado exitosamente");
                        onActionCompleted();
                        handleCloseModal();
                    } else {
                        toast.error(
                            rejectResult.data?.rejectPayment?.message ||
                                "Error al rechazar pago"
                        );
                    }
                    break;

                case "update-status":
                    const updateResult = await updatePaymentStatus({
                        variables: {
                            paymentId: Number(selectedPayment.id),
                            status: status,
                            updatedBy: Number(currentUserId),
                            notes: notes,
                        },
                    });

                    if (updateResult.data?.updatePaymentStatus?.success) {
                        toast.success(
                            "Estado del pago actualizado exitosamente"
                        );
                        onActionCompleted();
                        handleCloseModal();
                    } else {
                        toast.error(
                            updateResult.data?.updatePaymentStatus?.message ||
                                "Error al actualizar estado"
                        );
                    }
                    break;
            }
        } catch (error) {
            console.error("Error en la acción:", error);
            toast.error("Error inesperado al procesar la acción");
        } finally {
            setIsProcessing(false);
        }
    };

    const getActionButton = () => {
        const buttonConfig = {
            approve: {
                text: "Aprobar Pago",
                icon: <Check />,
                color: "bg-green-600 hover:bg-green-700",
                disabled: false,
            },
            reject: {
                text: "Rechazar Pago",
                icon: <CloseCircle />,
                color: "bg-red-600 hover:bg-red-700",
                disabled: !notes.trim(),
            },
            "update-status": {
                text: "Actualizar Estado",
                icon: <Edit />,
                color: "bg-blue-600 hover:bg-blue-700",
                disabled: false,
            },
        };

        const config = buttonConfig[actionType];

        return (
            <button
                onClick={handleAction}
                disabled={config.disabled || isProcessing}
                className={`w-full px-4 py-2 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 ${config.color} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                {isProcessing ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                ) : (
                    config.icon
                )}
                {isProcessing ? "Procesando..." : config.text}
            </button>
        );
    };

    const getModalTitle = () => {
        switch (actionType) {
            case "approve":
                return "Aprobar Pago";
            case "reject":
                return "Rechazar Pago";
            case "update-status":
                return "Actualizar Estado del Pago";
            default:
                return "Acción de Pago";
        }
    };

    const getNotesLabel = () => {
        switch (actionType) {
            case "approve":
                return "Notas de Aprobación (opcional)";
            case "reject":
                return "Motivo de Rechazo *";
            case "update-status":
                return "Notas Adicionales (opcional)";
            default:
                return "Notas";
        }
    };

    const getNotesPlaceholder = () => {
        switch (actionType) {
            case "approve":
                return "Agregar comentarios sobre la aprobación...";
            case "reject":
                return "Explicar el motivo del rechazo...";
            case "update-status":
                return "Agregar notas sobre el cambio de estado...";
            default:
                return "Escribir notas...";
        }
    };

    // Solo renderizar si showModal es true
    if (!showModal || !selectedPayment) return null;
    return (
        <>
            {/* Backdrop manual */}
            {showModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={handleCloseModal}
                ></div>
            )}

            {/* Modal */}
            <div
                id="paymentApprovalModal"
                tabIndex={-1}
                className={`fixed top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full ${
                    showModal ? "block" : "hidden"
                }`}
            >
                <div className="relative w-full max-w-md mx-auto">
                    <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-600 rounded-t-xl">
                            <h3 className="text-xl font-semibold text-white">
                                {getModalTitle()}
                            </h3>
                            <button
                                onClick={handleCloseModal}
                                className="text-white bg-transparent hover:bg-white/20 rounded-lg text-sm w-8 h-8 flex items-center justify-center transition-colors duration-200"
                            >
                                <Close />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-6">
                            {/* Información del Pago */}
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                                    Información del Pago
                                </h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            Monto:
                                        </span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            S/{" "}
                                            {Number(
                                                selectedPayment?.amount
                                            ).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            Método:
                                        </span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {selectedPayment?.paymentMethodName}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            Estado:
                                        </span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {selectedPayment?.statusName}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            Referencia:
                                        </span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {selectedPayment?.reference ||
                                                "N/A"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {/* Imagen del Pago (si existe) */}
                            {selectedPayment?.attachment && (
                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                                        Comprobante de Pago
                                    </h4>
                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={() =>
                                                setShowImage(!showImage)
                                            }
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                                        >
                                            {showImage ? "Ocultar" : "Ver"}{" "}
                                            Imagen
                                        </button>
                                        <a
                                            href={`${process.env.NEXT_PUBLIC_BASE_API}/media/${selectedPayment.attachment}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                                        >
                                            Descargar
                                        </a>
                                    </div>
                                    {showImage && (
                                        <div className="mt-4">
                                            <img
                                                src={`${process.env.NEXT_PUBLIC_BASE_API}/media/${selectedPayment.attachment}`}
                                                alt="Comprobante de pago"
                                                className="max-w-full h-auto rounded-lg border border-gray-300 dark:border-gray-600"
                                                onError={(e) => {
                                                    const target =
                                                        e.currentTarget as HTMLImageElement;
                                                    target.style.display =
                                                        "none";
                                                    const nextElement =
                                                        target.nextElementSibling as HTMLElement;
                                                    if (nextElement) {
                                                        nextElement.style.display =
                                                            "block";
                                                    }
                                                }}
                                            />
                                            <div className="hidden text-center text-gray-500 dark:text-gray-400 py-4">
                                                No se pudo cargar la imagen
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Selector de Acción - Mejorado */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Selecciona la acción a realizar
                                </label>
                                <div className="space-y-3">
                                    <label className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                                        <input
                                            type="radio"
                                            name="actionType"
                                            value="approve"
                                            checked={actionType === "approve"}
                                            onChange={() =>
                                                setActionType("approve")
                                            }
                                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                                        />
                                        <div className="ml-3 flex items-center">
                                            <Check />
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                Aprobar Pago
                                            </span>
                                        </div>
                                    </label>

                                    <label className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                                        <input
                                            type="radio"
                                            name="actionType"
                                            value="reject"
                                            checked={actionType === "reject"}
                                            onChange={() =>
                                                setActionType("reject")
                                            }
                                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                                        />
                                        <div className="ml-3 flex items-center">
                                            <CloseCircle />
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                Rechazar Pago
                                            </span>
                                        </div>
                                    </label>

                                    <label className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                                        <input
                                            type="radio"
                                            name="actionType"
                                            value="update-status"
                                            checked={
                                                actionType === "update-status"
                                            }
                                            onChange={() =>
                                                setActionType("update-status")
                                            }
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                        />
                                        <div className="ml-3 flex items-center">
                                            <Edit />
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                Cambiar Estado
                                            </span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Selector de Estado (solo para update-status) */}
                            {actionType === "update-status" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Nuevo Estado
                                    </label>
                                    <select
                                        value={status}
                                        onChange={(e) =>
                                            setStatus(e.target.value)
                                        }
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="PENDING">
                                            Pendiente
                                        </option>
                                        <option value="PROCESSING">
                                            Procesando
                                        </option>
                                        <option value="APPROVED">
                                            Aprobado
                                        </option>
                                        <option value="REJECTED">
                                            Rechazado
                                        </option>
                                        <option value="CANCELLED">
                                            Cancelado
                                        </option>
                                    </select>
                                </div>
                            )}

                            {/* Campo de Notas */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {getNotesLabel()}
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder={getNotesPlaceholder()}
                                    rows={3}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                />
                            </div>

                            {/* Botón de Acción */}
                            {getActionButton()}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
