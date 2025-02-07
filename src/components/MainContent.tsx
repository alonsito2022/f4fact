"use client"; // 👈 Esto es clave para que funcione el hook

import { useSidebar } from "@/components/context/SidebarContext";

export default function MainContent({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isSidebarOpen, toggleSidebar } = useSidebar();

    return (
        <div className="relative w-full h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 font-encodeSansCondensed">
            {/* Fondo translúcido cuando el Sidebar está abierto */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 transition-opacity z-40"
                    onClick={toggleSidebar} // Oculta el sidebar al hacer clic
                ></div>
            )}
            {children}
        </div>
    );
}
