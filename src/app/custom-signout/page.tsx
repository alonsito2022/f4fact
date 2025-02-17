"use client";
import { signOut } from "next-auth/react";
import Link from "next/link";
function CustomSignOut() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Esta página caducó
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Debes volver a la página de origen o ingresar a tu cuenta.
                </p>
                <div className="mt-6 space-x-4">
                    <Link
                        href="/"
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
                    >
                        Ir al inicio
                    </Link>
                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600"
                    >
                        Iniciar sesión
                    </button>
                </div>
            </div>
        </div>
    );
}
export default CustomSignOut;
