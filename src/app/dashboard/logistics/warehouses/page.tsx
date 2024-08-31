"use client";
import { useState, useEffect, useMemo  } from "react";
import WarehouseList from './WarehouseList'
import WarehouseForm from "./WarehouseForm";
import WarehouseFilter from "./WarehouseFilter";
import Breadcrumb from "@/components/Breadcrumb"
import { Modal, ModalOptions } from 'flowbite'
import { useSession } from 'next-auth/react'
import { IUser, IWarehouse } from '@/app/types';


const initialState = {
    id: 0,
    name: "",
    subsidiaryId: 0,
    category: "NA",
}

function WarehousePage() {
    const [warehouse, setWarehouse] = useState(initialState);
    const [warehouses, setWarehouses] = useState<IWarehouse[]>([]);
    const [modal, setModal] = useState<Modal | any>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [searchField, setSearchField] = useState<'name' | 'subsidiaryName'>('name');
    const [accessToken, setAccessToken] = useState<string>('');
    const { data: session } = useSession();
    const u = session?.user as IUser;

    async function fetchWarehouses() {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `JWT ${accessToken}`
            },
            body: JSON.stringify({
                query: `
                    query {
                        allWarehouses {
                            id
                            name
                            category
                            categoryReadable
                            subsidiaryName
                        }
                    }
                `
            })
        })
            .then(res => res.json())
            .then(data => {
                console.log(data.data.allWarehouses)
                setWarehouses(data.data.allWarehouses);
            })
    }

    async function fetchWarehouseById(pk: number = 0) {

        await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `JWT ${accessToken}`
            },
            body: JSON.stringify({
                query: `
                    {
                        warehouseById(pk: ${pk}){
                            id
                            name
                            category
                            subsidiaryId
                        }
                    }
                `
            })
        })
            .then(res => res.json())
            .then(data => {
                setWarehouse(data.data.warehouseById);
            })
    }

    useEffect(() => {
        if (u !== undefined && u.token != undefined)
            setAccessToken(u.token);
    }, [u])

    useEffect(() => {

        if (modal == null) {

            const $targetEl = document.getElementById('defaultModal');
            const options: ModalOptions = {
                placement: 'bottom-right',
                backdrop: 'static',
                backdropClasses: 'bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
                closable: false,

            };

            setModal(new Modal($targetEl, options))
        }



    }, []);

    useEffect(() => {
        if (accessToken.length > 0) {
            fetchWarehouses();
        }
    }, [accessToken]);

    const filteredWarehouses = useMemo(() => {
        return warehouses.filter((w:IWarehouse) => searchField === "name" ? w?.name?.toLowerCase().includes(searchTerm.toLowerCase()) : w?.subsidiaryName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, searchField, warehouses]);

    return (
        <>
            <div className="p-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 lg:mt-1.5 dark:bg-gray-800 dark:border-gray-700">
                <div className="w-full mb-1">
                    <Breadcrumb section={"Activos"} article={"Almacenes"} />
                    <WarehouseFilter searchTerm={searchTerm} setSearchTerm={setSearchTerm} searchField={searchField} setSearchField={setSearchField} modal={modal} initialState={initialState} setWarehouse={setWarehouse} />
                </div>
            </div>

            <div className="flex flex-col">
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden shadow">
                            <WarehouseList filteredWarehouses={filteredWarehouses} modal={modal} fetchWarehouseById={fetchWarehouseById} />
                        </div>
                    </div>
                </div>
            </div>


            <WarehouseForm modal={modal} warehouse={warehouse} setWarehouse={setWarehouse} fetchWarehouses={fetchWarehouses} initialState={initialState} accessToken={accessToken} />
        </>
    )
}
export default WarehousePage