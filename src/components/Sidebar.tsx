"use client";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";
import { IUser } from "@/app/types";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { saveFortnightValue } from "@/redux/features/fortnitghtSlice";
import { initFlowbite, Modal } from "flowbite";
import { useSidebar } from "@/components/context/SidebarContext";
import InvoiceTypeModal from "@/app/dashboard/sales/new/InvoiceTypeModal";
import { useInvoiceTypeModal } from "@/components/context/InvoiceTypeModalContext";
import { useAuth } from "./providers/AuthProvider";

function Sidebar() {
    const { showModal } = useInvoiceTypeModal();
    const auth = useAuth();
    // const { data: session } = useSession();
    // const u = session?.user as IUser;
    const { isSidebarOpen, toggleSidebar } = useSidebar();
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    // Función para manejar el click en los botones del menú
    const handleMenuToggle = (menuId: string) => {
        const menu = document.getElementById(menuId);
        if (!menu) return;

        // Si el menú clickeado es el que está activo, lo cerramos
        if (activeMenu === menuId) {
            menu.classList.add("hidden");
            setActiveMenu(null);
        } else {
            // Si hay un menú activo, lo cerramos primero
            if (activeMenu) {
                const prevMenu = document.getElementById(activeMenu);
                if (prevMenu) {
                    prevMenu.classList.add("hidden");
                }
            }
            // Abrimos el nuevo menú
            menu.classList.remove("hidden");
            setActiveMenu(menuId);
        }
    };

    return (
        <>
            <aside
                id="sidebar"
                className={`fixed top-0 left-0 w-64 bg-gray-100 dark:bg-gray-800 transition-all duration-300 ease-in-out transform h-screen border-r border-gray-200 dark:border-gray-700 ${
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                } z-50`}
            >
                <div className="flex flex-col h-full">
                    {/* Header info */}
                    <div className="p-4 pb-0 border-gray-200 dark:border-gray-700">
                        <div className="text-sm border-b pb-1 font-medium text-gray-800 dark:text-gray-100">
                            {auth?.user?.companyName}
                        </div>
                        <div className="text-sm pt-1 text-gray-600 dark:text-gray-400">
                            {auth?.user?.email}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 overflow-y-auto">
                        <ul className="space-y-0.5 py-2">
                            {/* Menú items */}
                            <li className="border-t border-gray-300 dark:border-gray-700">
                                <button
                                    type="button"
                                    className="flex items-center w-full py-1.5 px-2 text-sm text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-lg"
                                    onClick={() =>
                                        handleMenuToggle("dropdown-layouts")
                                    }
                                >
                                    <svg
                                        className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg"
                                        aria-hidden="true"
                                    >
                                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path>
                                    </svg>
                                    <span className="flex-1 ml-3 text-left whitespace-nowrap">
                                        Empresa
                                    </span>
                                    <svg
                                        className="w-6 h-6"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        ></path>
                                    </svg>
                                </button>
                                <ul
                                    id="dropdown-layouts"
                                    className="hidden py-2 space-y-2"
                                >
                                    <li>
                                        <Link
                                            href="/dashboard/users/companies"
                                            className="flex items-center p-0 text-base text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                                            onClick={toggleSidebar}
                                        >
                                            Mostrar Todas
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/dashboard/users/users"
                                            className="flex items-center p-0 text-base text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                                            onClick={toggleSidebar}
                                        >
                                            Usuarios
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/dashboard/users/subsidiaries"
                                            className="flex items-center p-0 text-base text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                                            onClick={toggleSidebar}
                                        >
                                            Sedes/locales
                                        </Link>
                                    </li>
                                </ul>
                            </li>

                            {/* Productos */}
                            <li className="border-t border-gray-300 dark:border-gray-700">
                                <button
                                    type="button"
                                    className="flex items-center w-full py-1.5 px-2 text-sm text-gray-900 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                                    onClick={() =>
                                        handleMenuToggle("dropdown-crud")
                                    }
                                >
                                    <svg
                                        className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg"
                                        aria-hidden="true"
                                    >
                                        <path
                                            clipRule="evenodd"
                                            fillRule="evenodd"
                                            d="M.99 5.24A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25l.01 9.5A2.25 2.25 0 0116.76 17H3.26A2.267 2.267 0 011 14.74l-.01-9.5zm8.26 9.52v-.625a.75.75 0 00-.75-.75H3.25a.75.75 0 00-.75.75v.615c0 .414.336.75.75.75h5.373a.75.75 0 00.627-.74zm1.5 0a.75.75 0 00.627.74h5.373a.75.75 0 00.75-.75v-.615a.75.75 0 00-.75-.75H11.5a.75.75 0 00-.75.75v.625zm6.75-3.63v-.625a.75.75 0 00-.75-.75H11.5a.75.75 0 00-.75.75v.625c0 .414.336.75.75.75h5.25a.75.75 0 00.75-.75zm-8.25 0v-.625a.75.75 0 00-.75-.75H3.25a.75.75 0 00-.75.75v.625c0 .414.336.75.75.75H8.5a.75.75 0 00.75-.75zM17.5 7.5v-.625a.75.75 0 00-.75-.75H11.5a.75.75 0 00-.75.75V7.5c0 .414.336.75.75.75h5.25a.75.75 0 00.75-.75zm-8.25 0v-.625a.75.75 0 00-.75-.75H3.25a.75.75 0 00-.75.75V7.5c0 .414.336.75.75.75H8.5a.75.75 0 00.75-.75z"
                                        ></path>
                                    </svg>
                                    <span className="flex-1 ml-3 text-left whitespace-nowrap">
                                        Productos
                                    </span>
                                    <svg
                                        className="w-6 h-6"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        ></path>
                                    </svg>
                                </button>
                                <ul
                                    id="dropdown-crud"
                                    className="hidden py-2 space-y-2"
                                >
                                    <li>
                                        <Link
                                            href="/dashboard/logistics/products"
                                            className="text-base text-gray-900 rounded-lg flex items-center p-0 group hover:bg-gray-100 transition duration-75 pl-11 dark:text-gray-200 dark:hover:bg-gray-700 "
                                            onClick={toggleSidebar}
                                        >
                                            Mostrar Todos
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/dashboard/logistics/units"
                                            className="text-base text-gray-900 rounded-lg flex items-center p-0 group hover:bg-gray-100 transition duration-75 pl-11 dark:text-gray-200 dark:hover:bg-gray-700 "
                                            onClick={toggleSidebar}
                                        >
                                            Unidades
                                        </Link>
                                    </li>

                                    <li>
                                        <Link
                                            href="/dashboard/logistics/warehouses"
                                            className="text-base text-gray-900 rounded-lg flex items-center p-0 group hover:bg-gray-100 transition duration-75 pl-11 dark:text-gray-200 dark:hover:bg-gray-700 "
                                            onClick={toggleSidebar}
                                        >
                                            Almacenes
                                        </Link>
                                    </li>
                                </ul>
                            </li>

                            {/* Clientes y Proveedores */}
                            <li className="border-t border-gray-300 dark:border-gray-700">
                                <button
                                    type="button"
                                    className="flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                                    aria-controls="dropdown-persons"
                                    data-collapse-toggle="dropdown-persons"
                                    onClick={() =>
                                        handleMenuToggle("dropdown-persons")
                                    }
                                >
                                    {/* <svg className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 002-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path></svg> */}

                                    <svg
                                        className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 2a3 3 0 0 0-3 3v1H5a3 3 0 0 0-3 3v2.382l1.447.723.005.003.027.013.12.056c.108.05.272.123.486.212.429.177 1.056.416 1.834.655C7.481 13.524 9.63 14 12 14c2.372 0 4.52-.475 6.08-.956.78-.24 1.406-.478 1.835-.655a14.028 14.028 0 0 0 .606-.268l.027-.013.005-.002L22 11.381V9a3 3 0 0 0-3-3h-2V5a3 3 0 0 0-3-3h-4Zm5 4V5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v1h6Zm6.447 7.894.553-.276V19a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-5.382l.553.276.002.002.004.002.013.006.041.02.151.07c.13.06.318.144.557.242.478.198 1.163.46 2.01.72C7.019 15.476 9.37 16 12 16c2.628 0 4.98-.525 6.67-1.044a22.95 22.95 0 0 0 2.01-.72 15.994 15.994 0 0 0 .707-.312l.041-.02.013-.006.004-.002.001-.001-.431-.866.432.865ZM12 10a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2H12Z"
                                            clipRule="evenodd"
                                        />
                                    </svg>

                                    <span className="flex-1 ml-3 text-left whitespace-nowrap">
                                        Clientes y Proveedores
                                    </span>
                                    <svg
                                        className="w-6 h-6"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        ></path>
                                    </svg>
                                </button>
                                <ul
                                    id="dropdown-persons"
                                    className="hidden py-2 space-y-2"
                                >
                                    <li>
                                        <Link
                                            href="/dashboard/persons"
                                            className="text-base text-gray-900 rounded-lg flex items-center p-0 group hover:bg-gray-100 transition duration-75 pl-11 dark:text-gray-200 dark:hover:bg-gray-700 "
                                            onClick={toggleSidebar}
                                        >
                                            Mostrar Todos
                                        </Link>
                                    </li>
                                    {/* <li>
                                        <Link href="/dashboard/persons/new" className="text-base text-gray-900 rounded-lg flex items-center p-2 group hover:bg-gray-100 transition duration-75 pl-11 dark:text-gray-200 dark:hover:bg-gray-700 ">
                                            Nuevo Cliente/Proveedor
                                        </Link>
                                    </li> */}
                                </ul>
                            </li>

                            {/* Compras */}
                            <li className="border-t border-gray-300 dark:border-gray-700">
                                <button
                                    type="button"
                                    className="flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                                    aria-controls="dropdown-purchases"
                                    data-collapse-toggle="dropdown-purchases"
                                    onClick={() =>
                                        handleMenuToggle("dropdown-purchases")
                                    }
                                >
                                    <svg
                                        className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M4 4a1 1 0 0 1 1-1h1.5a1 1 0 0 1 .979.796L7.939 6H19a1 1 0 0 1 .979 1.204l-1.25 6a1 1 0 0 1-.979.796H9.605l.208 1H17a3 3 0 1 1-2.83 2h-2.34a3 3 0 1 1-4.009-1.76L5.686 5H5a1 1 0 0 1-1-1Z"
                                            clipRule="evenodd"
                                        />
                                    </svg>

                                    <span className="flex-1 ml-3 text-left whitespace-nowrap">
                                        Compras
                                    </span>
                                    <svg
                                        className="w-6 h-6"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        ></path>
                                    </svg>
                                </button>
                                <ul
                                    id="dropdown-purchases"
                                    className="hidden py-2 space-y-2"
                                >
                                    <li>
                                        <Link
                                            href="/dashboard/purchases"
                                            className="text-base text-gray-900 rounded-lg flex items-center p-0 group hover:bg-gray-100 transition duration-75 pl-11 dark:text-gray-200 dark:hover:bg-gray-700 "
                                            onClick={toggleSidebar}
                                        >
                                            Mostrar Todas
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/dashboard/purchases/new"
                                            className="text-base text-gray-900 rounded-lg flex items-center p-0 group hover:bg-gray-100 transition duration-75 pl-11 dark:text-gray-200 dark:hover:bg-gray-700 "
                                            onClick={toggleSidebar}
                                        >
                                            Nueva Compra
                                        </Link>
                                    </li>
                                </ul>
                            </li>

                            {/* Cotizaciones */}
                            <li className="border-t border-gray-300 dark:border-gray-700">
                                <button
                                    type="button"
                                    className="flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                                    aria-controls="dropdown-quotes"
                                    data-collapse-toggle="dropdown-quotes"
                                    onClick={() =>
                                        handleMenuToggle("dropdown-quotes")
                                    }
                                >
                                    <svg
                                        className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                        />
                                    </svg>
                                    <span className="flex-1 ml-3 text-left whitespace-nowrap">
                                        Cotizaciones
                                    </span>
                                    <svg
                                        className="w-6 h-6"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        ></path>
                                    </svg>
                                </button>
                                <ul
                                    id="dropdown-quotes"
                                    className="hidden py-2 space-y-2"
                                >
                                    <li>
                                        <Link
                                            href="/dashboard/quotes"
                                            className="text-base text-gray-900 rounded-lg flex items-center p-0 group hover:bg-gray-100 transition duration-75 pl-11 dark:text-gray-200 dark:hover:bg-gray-700 "
                                            onClick={toggleSidebar}
                                        >
                                            Mostrar todas
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/dashboard/quotes/new"
                                            className="text-base text-gray-900 rounded-lg flex items-center p-0 group hover:bg-gray-100 transition duration-75 pl-11 dark:text-gray-200 dark:hover:bg-gray-700 "
                                            onClick={toggleSidebar}
                                        >
                                            Nueva Cotización
                                        </Link>
                                    </li>
                                </ul>
                            </li>

                            {/* Ventas */}
                            <li className="border-t border-gray-300 dark:border-gray-700">
                                <button
                                    type="button"
                                    className="flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                                    aria-controls="dropdown-sales"
                                    data-collapse-toggle="dropdown-sales"
                                    onClick={() =>
                                        handleMenuToggle("dropdown-sales")
                                    }
                                >
                                    <svg
                                        className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z"
                                            clipRule="evenodd"
                                        ></path>
                                    </svg>
                                    <span className="flex-1 ml-3 text-left whitespace-nowrap">
                                        Ventas
                                    </span>
                                    <svg
                                        className="w-6 h-6"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        ></path>
                                    </svg>
                                </button>
                                <ul
                                    id="dropdown-sales"
                                    className="hidden py-2 space-y-2"
                                >
                                    <li>
                                        <Link
                                            href="/dashboard/sales"
                                            className="text-base text-gray-900 rounded-lg flex items-center p-0 group hover:bg-gray-100 transition duration-75 pl-11 dark:text-gray-200 dark:hover:bg-gray-700 "
                                            onClick={toggleSidebar}
                                        >
                                            Comprobantes
                                        </Link>
                                    </li>
                                    <li>
                                        {/* <Link
                                            href="/dashboard/sales/new"
                                            className="text-base text-gray-900 rounded-lg flex items-center p-0 group hover:bg-gray-100 transition duration-75 pl-11 dark:text-gray-200 dark:hover:bg-gray-700 "
                                            onClick={handleLinkClick}
                                        >
                                            Nuevo comprobante
                                        </Link> */}
                                        <button
                                            className="text-base text-gray-900 rounded-lg flex items-center p-0 group hover:bg-gray-100 transition duration-75 pl-11 dark:text-gray-200 dark:hover:bg-gray-700 "
                                            onClick={() => {
                                                toggleSidebar();
                                                showModal();
                                            }}
                                        >
                                            Nuevo Comprobante
                                        </button>
                                    </li>
                                </ul>
                            </li>

                            {/* Guías de Remisión */}
                            <li className="border-t border-gray-300 dark:border-gray-700">
                                <button
                                    type="button"
                                    className="flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                                    aria-controls="dropdown-guides"
                                    data-collapse-toggle="dropdown-guides"
                                    onClick={() =>
                                        handleMenuToggle("dropdown-guides")
                                    }
                                >
                                    <svg
                                        className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8.5 18.5h6M5 16.5h2a1 1 0 011 1v1H4v-1a1 1 0 011-1zm11 0h2a1 1 0 011 1v1h-4v-1a1 1 0 011-1zm-6-3h4m-9-4h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2z"
                                        />
                                    </svg>

                                    <span className="flex-1 ml-3 text-left whitespace-nowrap">
                                        Guías de Remisión
                                    </span>
                                    <svg
                                        className="w-6 h-6"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        ></path>
                                    </svg>
                                </button>
                                <ul
                                    id="dropdown-guides"
                                    className="hidden py-2 space-y-2"
                                >
                                    <li>
                                        <Link
                                            href="/dashboard/guides"
                                            className="text-base text-gray-900 rounded-lg flex items-center p-0 group hover:bg-gray-100 transition duration-75 pl-11 dark:text-gray-200 dark:hover:bg-gray-700 "
                                            onClick={toggleSidebar}
                                        >
                                            Ver Guías
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/dashboard/guides/new"
                                            className="text-base text-gray-900 rounded-lg flex items-center p-0 group hover:bg-gray-100 transition duration-75 pl-11 dark:text-gray-200 dark:hover:bg-gray-700 "
                                            onClick={toggleSidebar}
                                        >
                                            Nueva Guía
                                        </Link>
                                    </li>
                                </ul>
                            </li>

                            {/* Comprobante de retencion */}
                            <li className="border-t border-b border-gray-300 dark:border-gray-700">
                                <button
                                    type="button"
                                    className="flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                                    aria-controls="dropdown-retentions"
                                    data-collapse-toggle="dropdown-retentions"
                                    onClick={() =>
                                        handleMenuToggle("dropdown-retentions")
                                    }
                                >
                                    <svg
                                        className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3-3 3 3 3-3 3 3z"
                                        />
                                    </svg>

                                    <span className="flex-1 ml-3 text-left whitespace-nowrap">
                                        Comprobante de retencion
                                    </span>
                                    <svg
                                        className="w-6 h-6"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        ></path>
                                    </svg>
                                </button>
                                <ul
                                    id="dropdown-retentions"
                                    className="hidden py-2 space-y-2"
                                >
                                    <li>
                                        <Link
                                            href="/dashboard/retentions"
                                            className="text-base text-gray-900 rounded-lg flex items-center p-0 group hover:bg-gray-100 transition duration-75 pl-11 dark:text-gray-200 dark:hover:bg-gray-700 "
                                            onClick={toggleSidebar}
                                        >
                                            Ver comprobantes de retencion
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/dashboard/retentions/new"
                                            className="text-base text-gray-900 rounded-lg flex items-center p-0 group hover:bg-gray-100 transition duration-75 pl-11 dark:text-gray-200 dark:hover:bg-gray-700 "
                                            onClick={toggleSidebar}
                                        >
                                            Nuevo comprobante de retencion
                                        </Link>
                                    </li>
                                </ul>
                            </li>

                            {/* <li>
                                <a
                                    href="/"
                                    className="flex items-center p-2 text-base text-gray-900 rounded-lg hover:bg-gray-100 group dark:text-gray-200 dark:hover:bg-gray-700    bg-gray-100 dark:bg-gray-700"
                                >
                                    <svg
                                        className="w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg"
                                        aria-hidden="true"
                                    >
                                        <path
                                            clipRule="evenodd"
                                            fillRule="evenodd"
                                            d="M8.34 1.804A1 1 0 009.32 1h1.36a1 1 0 01.98.804l.295 1.473c.497.144.971.342 1.416.587l1.25-.834a1 1 0 011.262.125l.962.962a1 1 0 01.125 1.262l-.834 1.25c.245.445.443.919.587 1.416l1.473.294a1 1 0 01.804.98v1.361a1 1 0 01-.804.98l-1.473.295a6.95 6.95 0 01-.587 1.416l.834 1.25a1 1 0 01-.125 1.262l-.962.962a1 1 0 01-1.262.125l-.962-.962a1 1 0 01-.125-1.262l.834-1.25a6.957 6.957 0 01-.587-1.416l-1.473-.294A1 1 0 011 10.68V9.32a1 1 0 01.804-.98l1.473-.295c.144-.497.342-.971.587-1.416l-.834-1.25a1 1 0 01.125-1.262l.962-.962A1 1 0 015.38 3.03l1.25.834a6.957 6.957 0 011.416-.587l.294-1.473zM13 10a3 3 0 11-6 0 3 3 0 016 0z"
                                        ></path>
                                    </svg>
                                    <span className="ml-3">Caja</span>
                                </a>
                            </li> */}
                        </ul>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-300 dark:border-gray-700">
                        <div className="text-sm">Soporte</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            www.4soluciones.net
                        </div>
                        <div className="text-sm font-medium mt-1">
                            SISTEMAS DE TECNOLOGIA 4 SOLUCIONES S.A.C.
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
