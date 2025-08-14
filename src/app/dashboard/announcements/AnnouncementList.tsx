import { useQuery, useMutation } from "@apollo/client";
import React, { useState } from "react";

interface AnnouncementListProps {
    GET_ALL_ANNOUNCEMENTS: any;
    UPDATE_ANNOUNCEMENT: any;
    onEditAnnouncement?: (announcement: any) => void;
}

function AnnouncementList({
    GET_ALL_ANNOUNCEMENTS,
    UPDATE_ANNOUNCEMENT,
    onEditAnnouncement,
}: AnnouncementListProps) {
    const { data, loading, error } = useQuery(GET_ALL_ANNOUNCEMENTS);
    const [updateAnnouncement] = useMutation(UPDATE_ANNOUNCEMENT, {
        refetchQueries: [{ query: GET_ALL_ANNOUNCEMENTS }],
    });

    const handleToggleActive = async (id: string, isActive: boolean) => {
        try {
            await updateAnnouncement({
                variables: {
                    id,
                    isActive: !isActive,
                },
            });
        } catch (error) {
            console.error("Error al cambiar estado:", error);
        }
    };

    const getMessageTypeIcon = (type: string) => {
        switch (type) {
            case "INFO":
                return "ℹ️";
            case "WARNING":
                return "⚠️";
            case "URGENT":
                return "🚨";
            default:
                return "📢";
        }
    };

    const getMessageTypeColor = (type: string) => {
        switch (type) {
            case "INFO":
                return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700";
            case "WARNING":
                return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700";
            case "URGENT":
                return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700";
            default:
                return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600";
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("es-ES", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading)
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">
                    Cargando anuncios...
                </span>
            </div>
        );

    if (error)
        return (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
                <div className="text-red-600 dark:text-red-400 text-lg font-semibold mb-2">
                    ❌ Error al cargar anuncios
                </div>
                <div className="text-red-500 dark:text-red-400">
                    {error.message}
                </div>
            </div>
        );

    if (!data?.allAnnouncements?.length) {
        return (
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-12 text-center">
                <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">
                    📢
                </div>
                <div className="text-gray-600 dark:text-gray-300 text-xl font-medium mb-2">
                    No hay anuncios
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                    Crea tu primer anuncio usando el formulario de arriba
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Estadísticas rápidas */}
            <div className="grid sm:grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg p-4 text-white">
                    <div className="text-2xl font-bold">
                        {data.allAnnouncements.length}
                    </div>
                    <div className="text-blue-100 dark:text-blue-200">
                        Total Anuncios
                    </div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-lg p-4 text-white">
                    <div className="text-2xl font-bold">
                        {
                            data.allAnnouncements.filter((a: any) => a.isActive)
                                .length
                        }
                    </div>
                    <div className="text-green-100 dark:text-green-200">
                        Activos
                    </div>
                </div>
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700 rounded-lg p-4 text-white">
                    <div className="text-2xl font-bold">
                        {
                            data.allAnnouncements.filter(
                                (a: any) => a.messageType === "WARNING"
                            ).length
                        }
                    </div>
                    <div className="text-yellow-100 dark:text-yellow-200">
                        Advertencias
                    </div>
                </div>
                <div className="bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 rounded-lg p-4 text-white">
                    <div className="text-2xl font-bold">
                        {
                            data.allAnnouncements.filter(
                                (a: any) => a.messageType === "URGENT"
                            ).length
                        }
                    </div>
                    <div className="text-red-100 dark:text-red-200">
                        Urgentes
                    </div>
                </div>
            </div>

            {/* Lista de anuncios */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Anuncio
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Tipo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Fechas
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {data.allAnnouncements.map((announcement: any) => (
                                <tr
                                    key={announcement.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="max-w-xs">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                                                {announcement.message}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                ID: {announcement.id}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getMessageTypeColor(
                                                announcement.messageType
                                            )} dark:bg-opacity-20 dark:border-opacity-50`}
                                        >
                                            {getMessageTypeIcon(
                                                announcement.messageType
                                            )}{" "}
                                            {announcement.messageType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                        <div className="space-y-1">
                                            {announcement.startDate && (
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    <span className="font-medium">
                                                        Inicio:
                                                    </span>{" "}
                                                    {formatDate(
                                                        announcement.startDate
                                                    )}
                                                </div>
                                            )}
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                <span className="font-medium">
                                                    Fin:
                                                </span>{" "}
                                                {formatDate(
                                                    announcement.endDate
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() =>
                                                handleToggleActive(
                                                    announcement.id,
                                                    announcement.isActive
                                                )
                                            }
                                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                                                announcement.isActive
                                                    ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 border border-green-300 dark:border-green-700"
                                                    : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 border border-red-300 dark:border-red-700"
                                            }`}
                                        >
                                            {announcement.isActive
                                                ? "✅ Activo"
                                                : "❌ Inactivo"}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() =>
                                                    onEditAnnouncement?.(
                                                        announcement
                                                    )
                                                }
                                                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors"
                                            >
                                                ✏️ Editar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AnnouncementList;
