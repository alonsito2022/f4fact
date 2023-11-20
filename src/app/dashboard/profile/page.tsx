"use client"
import {useSession, signOut} from 'next-auth/react'

function ProfilePage() {
    const {data: session, status } = useSession();

    return (
        <div className='justify-center  flex flex-col items-center gap-y-5'>
            <h1 className='font-bold text-3xl'>Profile</h1>
            <pre className='bg-zinc-800 p-4 text-white'>
                {
                    JSON.stringify(
                        {session, status}, null, 2
                    )
                }
            </pre>


            
<h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Password requirements:</h2>
<ul className="max-w-md space-y-1 text-gray-500 list-inside dark:text-gray-400">
    <li className="flex items-center">
        <svg className="w-3.5 h-3.5 mr-2 text-green-500 dark:text-green-400 flex-shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
         </svg>
        At least 10 characters
    </li>
    <li className="flex items-center">
        <svg className="w-3.5 h-3.5 mr-2 text-green-500 dark:text-green-400 flex-shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
         </svg>
         production of cheeses
    </li>
    <li className="flex items-center">
        <svg className="w-3.5 h-3.5 mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
         </svg>
         Milk Collection Center Development - Services
    </li>
</ul>

            
            <button className='bg-zinc-800 px-4 py-2 block mb-2 text-white' onClick={()=>{signOut();}}>logout</button>
        </div>
    )
}

export default ProfilePage