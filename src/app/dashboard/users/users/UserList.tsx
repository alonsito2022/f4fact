import { IUser } from '@/app/types';
import Edit from '@/components/icons/Edit'

function UserList({ users, modal, setModal, user, setUser }: any) {

    async function fetchUserByID(pk: number) {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
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
                            avatar
                            avatarUrl
                        }
                    }
                `
            })
        })
            .then(res => res.json())
            .then(data => {

                setUser(data.data.userById);
            })
    }
    return (
        <>
            <table className="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-600">
                <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                            Usuario
                        </th>
                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                            Documento
                        </th>
                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                            Nombres
                        </th>
                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                            Apellidos
                        </th>
                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                            Telefono
                        </th>
                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                            Rol usuario
                        </th>
                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                           Editar
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {users.map((item: IUser) =>
                        <tr key={item.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                            <td className="flex items-center p-2 mr-5 space-x-4 whitespace-nowrap">
                                <img className="w-10 h-10 rounded-full" src="/images/users/{{ .avatar }}" alt="{{ .name }} avatar"/>
                                <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                    <div className="text-base font-semibold text-gray-900 dark:text-white">{item.firstName} {item.lastName}</div>
                                    <div className="text-sm font-normal text-gray-500 dark:text-gray-400">{item.email}</div>
                                </div>
                            </td>
                            <td className="p-3 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {item.document}
                            </td>
                            <td className="p-3 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {item.firstName}
                            </td>
                            <td className="p-3 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {item.lastName}
                            </td>
                            <td className="p-3 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {item.phone}
                            </td>
                            <td className="p-3 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {item.roleName}
                            </td>
                            <td className="p-3 text-2xl font-medium text-gray-900 whitespace-nowrap dark:text-white text-center">
                                <a href="#" className="hover:underline" onClick={async () => {
                                    await fetchUserByID(item.id!);
                                    modal.show();
                                }}>
                                    <Edit />
                                </a>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </>
    )
}

export default UserList