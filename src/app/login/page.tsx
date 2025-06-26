"use client";
import { FormEvent, KeyboardEvent, useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ArrowUp from "@/components/icons/ArrowUp";
import Lock from "@/components/icons/Lock";
import Image from "next/image";
import Search from "@/components/icons/Search";
import Link from "next/link";

function LoginPage() {
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const { data: session, status } = useSession();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(""); // Reset error state
        const formData = new FormData(e.currentTarget);

        const res = await signIn("credentials", {
            email: formData.get("email"),
            password: formData.get("password"),
            redirect: false, // 👈 Evita la redirección automática
        });
        if (res?.error) return setError(res.error as string);
        if (res?.ok) {
            router.replace("/dashboard/sales");
            router.refresh(); // 👈 Recarga la página para actualizar la sesión
        }
    };

    const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            console.log("Enter");
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <>
            <nav className="fixed z-30 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700  font-encodeSansCondensed">
                <div className="px-3 py-3 lg:px-5 lg:pl-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center justify-start">
                            <a href="/dashboard" className="flex ml-2 md:mr-24">
                                <img
                                    src="/images/4fact.svg"
                                    className="h-8 mr-3 dark:[filter:invert(100%)_sepia(100%)_brightness(100%)_contrast(300%)]"
                                    alt="FlowBite Logo"
                                />
                                <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white ">
                                    tuF4ct
                                </span>
                            </a>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link
                                href="/cpe"
                                className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
                            >
                                <Search /> Buscar cpe
                            </Link>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
                            >
                                <Search /> Ingresar
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex flex-col items-center justify-center px-6 pt-24 mx-auto  pt:mt-0 dark:bg-gray-900 bg-gradient-to-r  font-encodeSansCondensed">
                {status === "loading" && <p>Cargando...</p>}
                {status === "unauthenticated" && (
                    <>
                        {/* <a
                            href="#"
                            className="flex items-center justify-center mb-8 text-2xl font-semibold lg:mb-10 dark:text-white"
                        >
                            
                            <ArrowUp />
                            <span>fourSolution</span>
                        </a> */}
                        <div className="w-full max-w-sm p-6 space-y-3 sm:p-8 bg-white rounded-lg shadow dark:bg-gray-800 border border-gray-300">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                                Ingresar
                            </h2>
                            <h4 className="text-gray-900 dark:text-white pt-0 mb-0 text-center font-thin text-2xl">
                                VERSIÓN NUBE
                            </h4>
                            <h5 className="text-gray-900 dark:text-white pt-0 mb-0 text-center font-medium text-sm">
                                También puedes seguir usando tu email para
                                ingresar
                            </h5>
                            <form
                                className="mt-8 space-y-4"
                                onSubmit={handleSubmit}
                            >
                                <div className="">
                                    <label
                                        htmlFor="email"
                                        className="form-label"
                                    >
                                        Correo
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        className="form-control"
                                        required
                                    />
                                </div>
                                <div className="">
                                    <label
                                        htmlFor="password"
                                        className="form-label"
                                    >
                                        Contraseña
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            name="password"
                                            id="password"
                                            onKeyPress={handleKeyPress}
                                            className="form-control pr-10"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={togglePasswordVisibility}
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                                        >
                                            {showPassword ? (
                                                <svg
                                                    className="w-5 h-5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                                                    />
                                                </svg>
                                            ) : (
                                                <svg
                                                    className="w-5 h-5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                    />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid ">
                                    <button
                                        type="submit"
                                        className="btn-default m-0"
                                    >
                                        Iniciar sesión
                                    </button>
                                </div>
                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Te olvidaste tu contraseña?{" "}
                                    <a className="text-blue-700 hover:underline dark:text-blue-500">
                                        Contacta con un administrador
                                    </a>
                                </div>
                                {error && (
                                    <p className="text-sm font-light text-red-500 dark:text-red-400">
                                        {error}
                                    </p>
                                )}
                                <div className="w-full max-w-sm p-6 space-y-3 sm:p-8  text-center">
                                    <span className=" inline-flex items-center gap-2 bg-green-100 text-emerald-500 text-2xl font-extralight me-2 px-4 py-2.5 rounded dark:bg-gray-700 dark:text-green-400 border border-green-400">
                                        <Lock />
                                        Seguro
                                    </span>
                                    <div className="text-emerald-500 dark:text-green-400 dark:font-extralight text-sm">
                                        Protegido con un Certificado Digital SSL
                                        (https://), tus datos están
                                        completamente seguros.
                                    </div>
                                </div>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

export default LoginPage;
