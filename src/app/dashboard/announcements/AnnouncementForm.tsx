import { gql, useMutation } from "@apollo/client";
import React, { useState, useEffect } from "react";

// Función para obtener la fecha y hora actual en zona horaria de Lima
const getLimaDateTime = () => {
    const limaDate = new Date(
        new Date().toLocaleString("en-US", { timeZone: "America/Lima" })
    );

    // Formatear para datetime-local: YYYY-MM-DDTHH:mm
    const year = limaDate.getFullYear();
    const month = String(limaDate.getMonth() + 1).padStart(2, "0");
    const day = String(limaDate.getDate()).padStart(2, "0");
    const hours = String(limaDate.getHours()).padStart(2, "0");
    const minutes = String(limaDate.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Función para convertir fecha ISO a formato datetime-local
const isoToDateTimeLocal = (isoString: string) => {
    if (!isoString) return "";

    try {
        const date = new Date(isoString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
        console.error("Error al convertir fecha:", error);
        return "";
    }
};

const CREATE_ANNOUNCEMENT = gql`
    mutation CreateAnnouncement(
        $message: String!
        $messageType: String!
        $endDate: DateTime!
    ) {
        createAnnouncement(
            message: $message
            messageType: $messageType
            endDate: $endDate
        ) {
            announcement {
                id
                message
            }
        }
    }
`;

export const UPDATE_ANNOUNCEMENT = gql`
    mutation UpdateAnnouncement(
        $id: ID!
        $message: String
        $messageType: String
        $endDate: DateTime
        $isActive: Boolean
    ) {
        updateAnnouncement(
            id: $id
            message: $message
            messageType: $messageType
            endDate: $endDate
            isActive: $isActive
        ) {
            announcement {
                id
                message
            }
        }
    }
`;

interface AnnouncementFormProps {
    GET_ALL_ANNOUNCEMENTS: any;
    announcementToEdit?: any;
    onCancelEdit?: () => void;
}

function AnnouncementForm({
    GET_ALL_ANNOUNCEMENTS,
    announcementToEdit,
    onCancelEdit,
}: AnnouncementFormProps) {
    const [formData, setFormData] = useState({
        message: "",
        messageType: "INFO",
        endDate: getLimaDateTime(), // Fecha y hora actual de Lima
        isActive: true,
    });

    const [isEditing, setIsEditing] = useState(false);

    const [createAnnouncement] = useMutation(CREATE_ANNOUNCEMENT, {
        refetchQueries: [{ query: GET_ALL_ANNOUNCEMENTS }],
    });

    const [updateAnnouncement] = useMutation(UPDATE_ANNOUNCEMENT, {
        refetchQueries: [{ query: GET_ALL_ANNOUNCEMENTS }],
    });

    // Efecto para cargar datos cuando se está editando
    useEffect(() => {
        if (announcementToEdit) {
            setIsEditing(true);
            setFormData({
                message: announcementToEdit.message || "",
                messageType: announcementToEdit.messageType || "INFO",

                endDate: announcementToEdit.endDate
                    ? isoToDateTimeLocal(announcementToEdit.endDate)
                    : getLimaDateTime(),
                isActive:
                    announcementToEdit.isActive !== undefined
                        ? announcementToEdit.isActive
                        : true,
            });
        } else {
            setIsEditing(false);
            setFormData({
                message: "",
                messageType: "INFO",
                endDate: getLimaDateTime(),
                isActive: true,
            });
        }
    }, [announcementToEdit]);

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? (e.target as HTMLInputElement).checked
                    : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (isEditing && announcementToEdit) {
                await updateAnnouncement({
                    variables: {
                        id: announcementToEdit.id,
                        message: formData.message,
                        messageType: formData.messageType,
                        endDate: new Date(formData.endDate).toISOString(),
                        isActive: formData.isActive,
                    },
                });
            } else {
                console.log("formData", {
                    message: formData.message,
                    messageType: formData.messageType,
                    endDate: new Date(formData.endDate).toISOString(),
                });
                await createAnnouncement({
                    variables: {
                        message: formData.message,
                        messageType: formData.messageType,
                        endDate: new Date(formData.endDate).toISOString(),
                    },
                });
            }

            // Limpiar formulario después de envío exitoso
            if (!isEditing) {
                setFormData({
                    message: "",
                    messageType: "INFO",
                    endDate: getLimaDateTime(),
                    isActive: true,
                });
            }

            if (onCancelEdit) {
                onCancelEdit();
            }
        } catch (error) {
            console.error("Error al guardar anuncio:", error);
        }
    };

    const handleCancel = () => {
        if (onCancelEdit) {
            onCancelEdit();
        }
        setIsEditing(false);
        setFormData({
            message: "",
            messageType: "INFO",
            endDate: getLimaDateTime(),
            isActive: true,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mensaje */}
            <div>
                <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                    Mensaje del Anuncio
                </label>
                <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Escribe aquí tu mensaje..."
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-colors resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
            </div>

            {/* Tipo de mensaje y Estado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label
                        htmlFor="messageType"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                        Tipo de Mensaje
                    </label>
                    <select
                        id="messageType"
                        name="messageType"
                        value={formData.messageType}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                        <option value="INFO">ℹ️ Información</option>
                        <option value="WARNING">⚠️ Advertencia</option>
                        <option value="URGENT">🚨 Urgente</option>
                    </select>
                </div>
                <div>
                    <label
                        htmlFor="endDate"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                        Fecha y Hora de Fin{" "}
                        <span className="text-red-500 dark:text-red-400">
                            *
                        </span>
                    </label>
                    <input
                        type="datetime-local"
                        id="endDate"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Zona horaria: Lima (GMT-5)
                    </p>
                </div>
                {isEditing && (
                    <div>
                        <label
                            htmlFor="isActive"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                            Estado
                        </label>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isActive"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:ring-offset-gray-800"
                            />
                            <label
                                htmlFor="isActive"
                                className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                            >
                                {formData.isActive ? "Activo" : "Inactivo"}
                            </label>
                        </div>
                    </div>
                )}
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                    {isEditing ? "💾 Actualizar Anuncio" : "✨ Crear Anuncio"}
                </button>

                {isEditing && (
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                    >
                        ❌ Cancelar
                    </button>
                )}
            </div>
        </form>
    );
}

export default AnnouncementForm;
