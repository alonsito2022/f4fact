"use client";
import { createContext, useContext, useState } from "react";

// 1️⃣ Definir el tipo del contexto
interface SidebarContextType {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
}

// 2️⃣ Crear el contexto
const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// 3️⃣ Crear el proveedor
export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
    };

    return (
        <SidebarContext.Provider value={{ isSidebarOpen, toggleSidebar }}>
            {children}
        </SidebarContext.Provider>
    );
}

// 4️⃣ Hook personalizado para usar el contexto
export function useSidebar() {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar debe ser usado dentro de SidebarProvider");
    }
    return context;
}
