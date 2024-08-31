import { IUser } from '@/app/types';
import Check from '@/components/icons/Check';
import Close from '@/components/icons/Close';
import CloseCircle from '@/components/icons/CloseCircle';
import Delete from '@/components/icons/Delete';
import Edit from '@/components/icons/Edit'
import UserCircle from '@/components/icons/UserCircle';
import ImageCircle from '@/components/images/ImageCircle';

function UserList({ users, modal, setModal, user, setUser }: any) {

    async function fetchUserByID(pk: number) {
        let querys = `
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
        console.log(querys)
        await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query: querys
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
                            Estado
                        </th>
                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                            Acción
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {users.map((item: IUser) =>
                        <tr key={item.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                            <td className="flex items-center p-1 mr-3 space-x-4 whitespace-nowrap">
                                {item.avatarUrl?  
                                    <>
                                    <ImageCircle image={ item.id&&(item.avatarUrl as string).search("base64")==-1?`${process.env.NEXT_PUBLIC_BASE_API}/${item.avatarUrl}`:item.avatarUrl as string}/>                   
                                    </>                                 
                                    :
                                    <>
                                    <UserCircle/>                 
                                    </>
                                }
                                <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                    <div className="text-base font-semibold text-gray-900 dark:text-white">{item.fullName}</div>
                                    <div className="text-sm font-normal text-gray-500 dark:text-gray-400">{item.email}</div>
                                </div>
                            </td>
                            <td className="p-3 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white text-center">
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
                            <td className="p-3 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {item.isActive?
                                <>
                                <Check/>
                                </>
                                :
                                <>
                                <CloseCircle/>
                                </>
                                }
                            </td>
                            <td className="flex items-center justify-center">
                                <a href="#" className="hover:underline" onClick={async () => {
                                    await fetchUserByID(item.id!);
                                    modal.show();
                                }}>
                                    <Edit />
                                </a>
                                <a href="#" className="hover:underline" onClick={async () => {
                                    await fetchUserByID(item.id!);
                                }}>
                                    <Delete />
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