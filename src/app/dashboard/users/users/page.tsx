"use client";
import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

import { IUser } from "@/app/types";
import { toast } from "react-toastify";
import { it } from "node:test";
import UserList from "./UserList";
import UserModal from "./UserModal";
import UserFilter from "./UserFilter";
import Breadcrumb from "@/components/Breadcrumb";
import { Modal, ModalOptions } from "flowbite";
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
    avatar: "",
    subsidiaryId: "",
    subsidiarySerial: "",
    subsidiaryName: "",
    companyId: "",
    companyName: "",
};
const initialStateUserLogged = {
    id: 0,
    email: "",
    subsidiaryId: "",
    subsidiarySerial: "",
    subsidiaryName: "",
    companyId: 0,
    companyName: "",
    isSuperuser: false,
};
function UserPage() {
    const { data: session } = useSession();
    const [users, setUsers] = useState<IUser[]>([]);
    const [modal, setModal] = useState<Modal | any>(null);
    const [user, setUser] = useState(initialState);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [userLogged, setUserLogged] = useState(initialStateUserLogged);

    async function fetchUsers() {
        let querys = `
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
                avatar
                avatarUrl
                subsidiary{
                    id
                    companyName
                    serial
                    
                }
                isActive
                isSuperuser
            }
        }
    `;
        await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query: querys,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                setUsers(data.data.users);
            });
    }

    async function fetchUsersbyName() {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query: `
                    {
                        searchUsers(search: "${searchTerm}") {
                            id
                            document
                            fullName
                            firstName
                            lastName
                            phone
                            email
                            roleName
                            avatar
                            avatarUrl
                            subsidiary{
                                id
                                companyName
                                serial
                            }
                            isActive
                            isSuperuser
                        }
                    }
                `,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                setUsers(data.data.searchUsers);
            });
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        // Solo hacer llamada al backend si no hay usuarios cargados o si el término de búsqueda es muy específico
        if (users.length === 0) {
            fetchUsers();
        }
        // El filtrado local se encarga del resto
    }, [searchTerm]);

    // Función para filtrar usuarios localmente por companyName y email
    const filteredUsers = users.filter((user: IUser) => {
        if (searchTerm.length < 3) return true; // Si el término de búsqueda es muy corto, mostrar todos

        const searchLower = searchTerm.toLowerCase();
        return (
            user.fullName?.toLowerCase().includes(searchLower) ||
            user.firstName?.toLowerCase().includes(searchLower) ||
            user.lastName?.toLowerCase().includes(searchLower) ||
            user.email?.toLowerCase().includes(searchLower) ||
            user.subsidiary?.companyName?.toLowerCase().includes(searchLower) ||
            user.document?.toLowerCase().includes(searchLower) ||
            user.phone?.toLowerCase().includes(searchLower) ||
            user.roleName?.toLowerCase().includes(searchLower)
        );
    });

    useEffect(() => {
        if (session?.user) {
            const user = session.user as IUser;

            console.log(user);

            setUserLogged((prev) => ({
                ...prev,
                subsidiaryId:
                    prev.subsidiaryId ||
                    (user.isSuperuser ? "0" : user.subsidiaryId!),
                subsidiarySerial: user.subsidiarySerial || "",
                subsidiaryName: user.subsidiaryName || "",
                companyId: user.companyId || 0,
                companyName: user.companyName || "",
                isSuperuser: user.isSuperuser ?? false, // Asegura que isSuperuser sea siempre booleano
            }));
        }
    }, [session]);

    return (
        <>
            <div className="p-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 lg:mt-1.5 dark:bg-gray-800 dark:border-gray-700">
                <div className="w-full mb-1">
                    <Breadcrumb section={"Empresa"} article={"Usuarios"} />

                    <UserFilter
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        modal={modal}
                        setUser={setUser}
                        initialState={initialState}
                        userLogged={userLogged}
                    />
                </div>
            </div>

            <div className="flex flex-col">
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden shadow">
                            <UserList
                                users={filteredUsers}
                                modal={modal}
                                setModal={setModal}
                                user={user}
                                setUser={setUser}
                                userLogged={userLogged}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <UserModal
                modal={modal}
                setModal={setModal}
                user={user}
                setUser={setUser}
                initialState={initialState}
                fetchUsers={fetchUsers}
                userLogged={userLogged}
            />
        </>
    );
}

export default UserPage;
