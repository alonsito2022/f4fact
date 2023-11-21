import { IUser} from '@/app/types';

function UserList({users, modal, setModal, user, setUser}:any) {
    async function fetchUserByID(pk: number){
console.log(`
{
    userById(pk: ${pk}){
        id
        document
        firstName
        lastName
        email
        phone
        role
        password
        repeatPassword
        isActive
    }
}
`)
        await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
            method: 'POST',
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({
                query: `
                    {
                        userById(pk: ${pk}){
                            id
                            document
                            firstName
                            lastName
                            email
                            phone
                            role
                            password
                            repeatPassword
                            isActive
                        }
                    }
                `
            })
        })
        .then(res=>res.json())
        .then(data=>{
            setUser(data.data.userById);
        })
    }
    return (
        <>
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
                <th scope="col" className="px-6 py-3">
                    Nº
                </th>
                <th scope="col" className="px-6 py-3">
                    Documento
                </th>
                <th scope="col" className="px-6 py-3">
                    Nombres
                </th>
                <th scope="col" className="px-6 py-3">
                    Apellidos
                </th>
                <th scope="col" className="px-6 py-3">
                    Telefono
                </th>
                <th scope="col" className="px-6 py-3">
                    Correo
                </th>
                <th scope="col" className="px-6 py-3">
                    Rol
                </th>
                <th scope="col" className="px-6 py-3">
                    <span className="sr-only">Edit</span>
                </th>
            </tr>
        </thead>
        <tbody>
        {users.map((item:IUser) => 
            <tr key={item.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                {item.id}
                </th>
                <td className="px-6 py-4">
                {item.document}
                </td>
                <td className="px-6 py-4">
                {item.firstName}
                </td>
                <td className="px-6 py-4">
                {item.lastName}
                </td>
                <td className="px-6 py-4">
                {item.phone}
                </td>
                <td className="px-6 py-4">
                {item.email}
                </td>
                <td className="px-6 py-4">
                {item.roleName}
                </td>
                <td className="px-6 py-4 text-right">
                    <a href="#" className="font-medium text-blue-600 dark:text-blue-500 hover:underline" onClick={ async ()=>{
                    await fetchUserByID(item.id!);
                    modal.show();
                    }}>
                <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                    <path d="M12.687 14.408a3.01 3.01 0 0 1-1.533.821l-3.566.713a3 3 0 0 1-3.53-3.53l.713-3.566a3.01 3.01 0 0 1 .821-1.533L10.905 2H2.167A2.169 2.169 0 0 0 0 4.167v11.666A2.169 2.169 0 0 0 2.167 18h11.666A2.169 2.169 0 0 0 16 15.833V11.1l-3.313 3.308Zm5.53-9.065.546-.546a2.518 2.518 0 0 0 0-3.56 2.576 2.576 0 0 0-3.559 0l-.547.547 3.56 3.56Z"/>
                    <path d="M13.243 3.2 7.359 9.081a.5.5 0 0 0-.136.256L6.51 12.9a.5.5 0 0 0 .59.59l3.566-.713a.5.5 0 0 0 .255-.136L16.8 6.757 13.243 3.2Z"/>
                </svg></a>
                </td>
            </tr>
              )}
        </tbody>
    </table>
        </>
    )
}

export default UserList