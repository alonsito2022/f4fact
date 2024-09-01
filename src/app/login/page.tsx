
"use client"
import { FormEvent, KeyboardEvent, useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react';
import ArrowUp from '@/components/icons/ArrowUp'
import Image from 'next/image'

function LoginPage() {
    const [error, setError] = useState("");
    const router = useRouter();
    const { data: session, status } = useSession();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        const res = await signIn('credentials', {
            email: formData.get("email"),
            password: formData.get("password"),
            redirect: false
        });
        if (res?.error) return setError(res.error as string);
        if (res?.ok) return router.push('/dashboard')

    }

    const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {

        if (event.key === 'Enter') {
            console.log('Enter')

        }
    };

    useEffect(() => {
        if (status === 'authenticated') {
            router.push('/');
        }
    }, [status, router]);

    return (
        <div className="flex flex-col items-center justify-center px-6 pt-8 mx-auto md:h-screen pt:mt-0 dark:bg-gray-900 bg-gradient-to-r">

            {status === 'loading' && <p>Cargando...</p>}
            {status === 'unauthenticated' &&

                <>

                    <a href="#" className="flex items-center justify-center mb-8 text-2xl font-semibold lg:mb-10 dark:text-white">
                        {/* <Image
                            src="/images/logo.svg"
                            alt="user photo"
                            width={50}
                            height={30}
                            className="mr-1"
                            priority
                        />
                        <Add/> */}
                        <ArrowUp />
                        <span>eBite</span>

                    </a>
                    <div className="w-full max-w-xl p-6 space-y-6 sm:p-8 bg-white rounded-lg shadow dark:bg-gray-800 border border-gray-300">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-0">
                            Inicia sesión
                        </h2>
                        <span className=" text-xs text-gray-900 dark:text-white pt-0">Formulario para iniciar sesión</span>
                        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                            <div className="">
                                <label htmlFor="email" className="form-label">Correo</label>
                                <input type="email" name="email" id="email" className="form-control" placeholder="name@company.com" required />
                            </div>
                            <div className="">
                                <label htmlFor="password" className="form-label">Contraseña</label>
                                <input type="password" name="password" id="password" onKeyPress={handleKeyPress}
                                    placeholder="••••••••" className="form-control" required />
                            </div>

                            <div className="grid ">
                                <button type="submit" className="btn-default m-0">Iniciar sesión</button></div>
                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Te olvidaste tu contraseña? <a className="text-blue-700 hover:underline dark:text-blue-500">Contacta con un administrador</a>
                            </div>
                            {error && <p className="text-sm font-light text-red-500 dark:text-red-400">{error}</p>}
                        </form>

                    </div>
                </>
            }


        </div>
    )
}

export default LoginPage