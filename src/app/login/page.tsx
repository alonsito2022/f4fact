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
    const router = useRouter();
    const { data: session, status } = useSession();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const res = await signIn("credentials", {
            email: formData.get("email"),
            password: formData.get("password"),
            redirect: false,
        });
        if (res?.error) return setError(res.error as string);
        if (res?.ok) return router.push("/dashboard/sales");
    };

    const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            console.log("Enter");
        }
    };

    useEffect(() => {
        if (status === "authenticated") {
            router.push("/");
        }
    }, [status, router]);

    return (
        <>
            <nav className="fixed z-30 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700  font-encodeSansCondensed">
                <div className="px-3 py-3 lg:px-5 lg:pl-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center justify-start">
                            <a href="/dashboard" className="flex ml-2 md:mr-24">
                                <img
                                    src="/images/logo.svg"
                                    className="h-8 mr-3"
                                    alt="FlowBite Logo"
                                />
                                <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white ">
                                    4Fact
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
                                    <input
                                        type="password"
                                        name="password"
                                        id="password"
                                        onKeyPress={handleKeyPress}
                                        className="form-control"
                                        required
                                    />
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
