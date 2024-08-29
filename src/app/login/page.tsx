
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
            <div className="flex flex-col items-center justify-center px-6 pt-8 mx-auto md:h-screen pt:mt-0 dark:bg-gray-900">
                <a href="#" className="flex items-center justify-center mb-8 text-2xl font-semibold lg:mb-10 dark:text-white">
                    <Image
                                src="/svgs/ArrowUp.svg"
                                alt="user photo"
                                width={50}
                                height={30}
                                className="mr-1 filter invert bg-blue-600"
                                priority
                                />
                                <span>eBite</span>
                    
                </a>
                <div className="w-full max-w-xl p-6 space-y-8 sm:p-8 bg-white rounded-lg shadow dark:bg-gray-800">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Inicio de sesión
                        </h2>
                        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                            <div className="">
                                <label htmlFor="email" className="form-label">Email</label>
                                <input type="email" name="email" id="email" className="form-control" placeholder="name@company.com" required />
                            </div>
                            <div className="">
                                <label htmlFor="password" className="form-label">Password</label>
                                <input type="password" name="password" id="password"  onKeyPress={handleKeyPress}
                                placeholder="••••••••" className="form-control" required />
                            </div>
                            
                            <div className="grid justify-end"><button type="submit" className="btn-default m-0">Login</button></div>

                            {error && <p className="text-sm font-light text-red-500 dark:text-red-400">{error}</p>}
                        </form>
                        
                </div>
            </div>
    )
}

export default LoginPage