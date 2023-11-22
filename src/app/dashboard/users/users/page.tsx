"use client"
import { ChangeEvent, FormEvent ,useState, useEffect } from "react";
import { IUser } from '@/app/types';
import { toast } from "react-toastify";
import { it } from "node:test";
import  UserList  from "./UserList"
import  UserModal  from "./UserModal"
import { Modal, ModalOptions } from 'flowbite'
const initialState = {
    id: 0,
    email: "",
    password: "",
    repeatPassword: "",
    document: "",
    firstName: "",
    lastName: "",
    phone: "",
    role: "01",
    roleName: "",
    isActive: false,
    avatar: ""
}
function UserPage() {
    const [users, setUsers] = useState< IUser[]>([]);
    const [modal, setModal] = useState< Modal | any>(null);
    const [user, setUser] = useState(initialState);
    const [searchTerm, setSearchTerm] = useState<string>('');
   
    async function fetchUsers(){
        await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
            method: 'POST',
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({
                query: `
                    {
                        users {
                            id
                            document
                            firstName
                            lastName
                            phone
                            email
                            roleName
                        }
                    }
                `
            })
        })
        .then(res=>res.json())
        .then(data=>{
            setUsers(data.data.users);
        })
    }
    useEffect(() => {
        fetchUsers();
    }, []);




    
    useEffect(() => {
        if (searchTerm.length >= 3) {
            fetchUsersbyName(); // Realizar la llamada a la API cuando el término de búsqueda tiene al menos 3 caracteres
        }
        else{
            fetchUsers()
        }
      }, [searchTerm]);
    
    //   const fetchUserss = async () => {
    //     try {
    //       const response = await fetch(`/api/search-users?search=${encodeURI(searchTerm)}`);
    //       if (response.ok) {
    //         const data = await response.json();
    //         setUsers(data.users);
    //       }
    //     } catch (error) {
    //       console.error('Error fetching users:', error);
    //     }
    //   };
      async function fetchUsersbyName(){
        await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
            method: 'POST',
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({
                query: `
                    {
                        searchUsers(search: "${searchTerm}") {
                            id
                            document
                            firstName
                            lastName
                            phone
                            email
                            roleName
                        }
                    }
                `
            })
        })
        .then(res=>res.json())
        .then(data=>{
            setUsers(data.data.searchUsers);
        })
    }
    
      const handleInputSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
      };

    return (
        <>
         <h6 className="mb-3 text-3xl font-extrabold text-gray-900 dark:text-white md:text-5xl lg:text-6xl"><span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">USUARIOS</span></h6>   


    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
    <div className="flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
        <div>
        <button type="button"  onClick={(e)=>{modal.show();}}  className="btn-green">Crear usuario</button>
        
        </div>
        <div>
                    <label htmlFor="table-search" className="sr-only">Buscar</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path></svg>
                        </div>
                        <input type="text" id="table-search" value={searchTerm} onChange={handleInputSearchChange} className="block px-2 py-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Buscar nombre o apellido..." />
                        
                    </div>
                   
                    {/* <ul>
                            {users.map((user) => (
                            <li key={user.id}>{user.firstName} {user.lastName}</li>
                            // Puedes mostrar más detalles del usuario si lo necesitas
                            ))}
                        </ul> */}
                </div>
    </div>
    <UserList users={users} modal={modal}  setModal={setModal} user={user} setUser={setUser}/>
</div>
<UserModal modal={modal}  setModal={setModal} user={user} setUser={setUser} initialState={initialState} fetchUsers={fetchUsers}/>
        </>
    )
}

export default UserPage