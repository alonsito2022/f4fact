"use client";
import React, { useState } from "react";
import { gql, useQuery } from "@apollo/client";
import AnnouncementForm from "./AnnouncementForm";
import AnnouncementList from "./AnnouncementList";

export const GET_ALL_ANNOUNCEMENTS = gql`
    query GetAllAnnouncements {
        allAnnouncements {
            id
            message
            messageType
            startDate
            endDate
            isActive
        }
    }
`;

export default function AnnouncementsPage() {
    const [announcementToEdit, setAnnouncementToEdit] = useState<any>(null);
    const [isFormVisible, setIsFormVisible] = useState(false);

    const handleEditAnnouncement = (announcement: any) => {
        setAnnouncementToEdit(announcement);
        setIsFormVisible(true); // Mostrar formulario cuando se edita
        // Scroll suave hacia el formulario
        document.getElementById("announcement-form")?.scrollIntoView({
            behavior: "smooth",
        });
    };

    const handleCancelEdit = () => {
        setAnnouncementToEdit(null);
        if (!announcementToEdit) {
            setIsFormVisible(false); // Ocultar formulario si no hay edición
        }
    };

    const toggleFormVisibility = () => {
        setIsFormVisible(!isFormVisible);
        if (announcementToEdit) {
            setAnnouncementToEdit(null); // Limpiar edición al ocultar
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Estilos CSS personalizados */}
            <style jsx>{`
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .announcement-card {
                    transition: all 0.3s ease;
                }

                .announcement-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                }

                .dark .announcement-card:hover {
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
                }
            `}</style>

            {/* Header con Breadcrumb */}
            <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-6">
                        <div className="mt-2">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Gestión de Anuncios
                            </h1>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Administra y comunica información importante a
                                tu equipo
                            </p>
                            {/* Indicador del estado del formulario */}
                            <div className="mt-3 flex items-center">
                                <div
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                        isFormVisible
                                            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-700"
                                            : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                                    }`}
                                >
                                    <span className="mr-1">
                                        {isFormVisible ? "📝" : "👁️"}
                                    </span>
                                    {isFormVisible
                                        ? "Formulario Visible"
                                        : "Formulario Oculto"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Botón para mostrar/ocultar formulario */}
                <div className="mb-6 flex justify-center">
                    <button
                        onClick={toggleFormVisibility}
                        className={`inline-flex items-center px-6 py-3 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 ${
                            isFormVisible
                                ? "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 dark:from-gray-600 dark:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-800 text-white"
                                : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white"
                        }`}
                    >
                        {isFormVisible ? (
                            <>
                                <span className="mr-2">👁️</span>
                                Ocultar Formulario
                            </>
                        ) : (
                            <>
                                <span className="mr-2">✨</span>
                                Mostrar Formulario
                            </>
                        )}
                    </button>
                </div>

                {/* Sección del formulario */}
                {isFormVisible && (
                    <div
                        id="announcement-form"
                        className="mb-8 animate-in slide-in-from-top-4 duration-300"
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden announcement-card">
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                                    <span className="mr-2">
                                        {announcementToEdit ? "✏️" : "✨"}
                                    </span>
                                    {announcementToEdit
                                        ? "Editar Anuncio"
                                        : "Crear Nuevo Anuncio"}
                                </h2>
                                {announcementToEdit && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        Editando anuncio: "
                                        {announcementToEdit.message.substring(
                                            0,
                                            50
                                        )}
                                        ..."
                                    </p>
                                )}
                            </div>
                            <div className="p-6">
                                <AnnouncementForm
                                    GET_ALL_ANNOUNCEMENTS={
                                        GET_ALL_ANNOUNCEMENTS
                                    }
                                    announcementToEdit={announcementToEdit}
                                    onCancelEdit={handleCancelEdit}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Sección de la lista */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden announcement-card">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                            <span className="mr-2">📋</span>
                            Lista de Anuncios
                        </h2>
                    </div>
                    <div className="p-6">
                        <AnnouncementList
                            GET_ALL_ANNOUNCEMENTS={GET_ALL_ANNOUNCEMENTS}
                            onEditAnnouncement={handleEditAnnouncement}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
