
"use client"
import { FormEvent, KeyboardEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation'
import Image from 'next/image'

function LoginPage() {
  const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new  FormData(e.currentTarget)
        
        const res = await signIn('credentials', {
          email: formData.get("email"),
          password: formData.get("password"),
          redirect: false
        });
        if(res?.error) return setError(res.error as string);
        if(res?.ok) return router.push('/dashboard')

    }

    const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {

        if (event.key === 'Enter') {
            console.log('Enter')

        }
      };

    return (
        <section className="bg-gray-50 dark:bg-gray-900">
            <div className="flex flex-col items-center justify-center px-6 py-2 mx-auto md:h-screen lg:py-0">
                <a href="#" className="flex items-center text-2xl font-semibold text-gray-900 dark:text-white">
                    <Image
                                src="/imagotipo.png"
                                alt="user photo"
                                width={300}
                                height={79}
                                priority
                                />
                    
                </a>
                <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-full xl:p-0 lg:max-w-lg dark:bg-gray-800 dark:border-gray-700">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                            Inicio de sesión
                        </h1>
                        <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
                                <input type="email" name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="name@company.com" required />
                            </div>
                            <div>
                                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                                <input type="password" name="password" id="password" 
                                onKeyPress={handleKeyPress}
                                placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
                            </div>
                            
                            <button type="submit" className="w-full text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Login</button>

                            {error && <p className="text-sm font-light text-red-500 dark:text-red-400">{error}</p>}
                        </form>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default LoginPage