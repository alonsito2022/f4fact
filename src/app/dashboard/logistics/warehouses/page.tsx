"use client";
import { ChangeEvent, FormEvent ,useState, useEffect } from "react";
import WarehouseList from './WarehouseList'
import WarehouseForm from "./WarehouseForm";
import Breadcrumb from "@/components/Breadcrumb"
import { Modal, ModalOptions } from 'flowbite'
import Add from '@/components/icons/Add'

export interface IWarehouse {
    id?: number
    name?: string
    category?: string
    categoryReadable?: string
    subsidiaryId?: number
    subsidiaryName?: string
    truckId?: number
    truckLicensePlate?: string
}


const initialState = {
    id: 0,
    name: "",
    subsidiaryId: 0,
    truckId: 0,
    truckLicensePlate: "",
    category: "NA",
}

function WarehousePage() {
    const [warehouse, setWarehouse] = useState(initialState);
    const [warehouses, setWarehouses] = useState< IWarehouse[]>([]);
    const [modal, setModal] = useState< Modal | any>(null);

    async function fetchWarehouses(){
        // const token = Cookies.get('accessToken');
        await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                // "Authorization": `JWT ${Cookies.get('accessToken')}`
            },
            body: JSON.stringify({
                query: `
                    query {
                        allWarehouses {
                            id
                            name
                            category
                            categoryReadable
                            truckLicensePlate
                            subsidiaryName
                        }
                    }
                `
            })
        })
        .then(res=>res.json())
        .then(data=>{
            setWarehouses(data.data.allWarehouses);
        })
    }

    async function fetchWarehouseById(pk: number=0){

        await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                // "Authorization": `JWT ${Cookies.get('accessToken')}`
            },
            body: JSON.stringify({
                query: `
                    {
                        warehouseById(pk: ${pk}){
                            id
                            name
                            category
                            subsidiaryId
                            truckLicensePlate
                        }
                    }
                `
            })
        })
        .then(res=>res.json())
        .then(data=>{
            setWarehouse(data.data.warehouseById);
        })
    }

    useEffect(() => {
        
        if(modal == null){

            const $targetEl = document.getElementById('defaultModal');
            const options: ModalOptions = {
                placement: 'bottom-right',
                backdrop: 'static',
                backdropClasses: 'bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
                closable: false ,

            };

            setModal(new Modal($targetEl, options))
        }
        
    }, []);

    return (
        <>
        
            <Breadcrumb section={"Logística"} article={"Almacenes"} />

            <div className="relative overflow-x-auto shadow-md sm:rounded-lg mt-3">
                <div className="flex items-center justify-end bg-gray-200 p-2 border border-gray-200">
                    <button id="btn-new" onClick={(e)=>{
                        modal.show();
                        document.getElementById("modal-title")!.innerHTML = "Nuevo Almacen";
                        document.getElementById("btn-save")!.innerHTML = "Guardar Almacen";
                        setWarehouse(initialState);

                    }} className="btn-blue border px-5 py-2 inline-flex" type="button">
                    <Add />Crear Almacen 
                    </button>
                </div>
                <WarehouseList warehouses={warehouses} modal={modal} fetchWarehouseById={fetchWarehouseById} />
            </div>

            <WarehouseForm modal={modal} warehouse={warehouse} setWarehouse={setWarehouse} fetchWarehouses={fetchWarehouses} initialState={initialState} />
        </>
    )
}
export default WarehousePage