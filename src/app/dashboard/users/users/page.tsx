"use client"
import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { IUser } from '@/app/types';
import { toast } from "react-toastify";
import { it } from "node:test";
import UserList from "./UserList"
import UserModal from "./UserModal"
import UserFilter from "./UserFilter"
import Breadcrumb from "@/components/Breadcrumb"
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
    const [users, setUsers] = useState<IUser[]>([]);
    const [modal, setModal] = useState<Modal | any>(null);
    const [user, setUser] = useState(initialState);
    const [searchTerm, setSearchTerm] = useState<string>('');

    async function fetchUsers() {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query: `
                    {
                        users {
                            id
                            document
                            fullName
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
            .then(res => res.json())
            .then(data => {
                setUsers(data.data.users);
            })
    }

    async function fetchUsersbyName() {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
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
            .then(res => res.json())
            .then(data => {
                setUsers(data.data.searchUsers);
            })
    }

    useEffect(() => {
        fetchUsers();
    }, []);


    useEffect(() => {
        if (searchTerm.length >= 3) {
            fetchUsersbyName(); // Realizar la llamada a la API cuando el término de búsqueda tiene al menos 3 caracteres
        }
        else {
            fetchUsers()
        }
    }, [searchTerm]);

  

    return (
        <>
            <div className="p-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 lg:mt-1.5 dark:bg-gray-800 dark:border-gray-700">
                <div className="w-full mb-1">
                    <Breadcrumb section={"Empresa"} article={"Usuarios"} />

                    <UserFilter searchTerm={searchTerm} setSearchTerm={setSearchTerm} modal={modal} />
                </div>
            </div>

            <div className="flex flex-col">
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden shadow">
                            <UserList users={users} modal={modal} setModal={setModal} user={user} setUser={setUser} />
                        </div>
                    </div>
                </div>
            </div>


            <UserModal modal={modal} setModal={setModal} user={user} setUser={setUser} initialState={initialState} fetchUsers={fetchUsers} />
        </>
    )
}

export default UserPage