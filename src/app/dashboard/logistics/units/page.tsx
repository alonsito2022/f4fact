"use client";
import { ChangeEvent, FormEvent, useState, useEffect, useMemo  } from "react";
import Breadcrumb from "@/components/Breadcrumb"
import { Modal, ModalOptions } from 'flowbite'
import { useSession } from 'next-auth/react'
import { IUnit, IUser } from '@/app/types';
import { toast } from "react-toastify";
import UnitList from "./UnitList";
import UnitForm from "./UnitForm";
import UnitFilter from "./UnitFilter";
const initialState = {
    id: 0,
    shortName: "",
    description: "",
    code: ""
}

function UnitPage() {
    const [units, setUnits] = useState< IUnit[]>([]);
    const [unit, setUnit] = useState(initialState);
    const [modal, setModal] = useState<Modal | any>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [searchField, setSearchField] = useState<'shortName' | 'code'>('shortName');
    const [accessToken, setAccessToken] = useState<string>('');
    const { data: session } = useSession();
    const u = session?.user as IUser;

    async function fetchUnits(){
        await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `JWT ${accessToken}`
            },
            body: JSON.stringify({
                query: `
                    {
                        allUnits {
                            id
                            shortName
                            description
                            code
                        }
                    }
                `
            })
        })
        .then(res=>res.json())
        .then(data=>{
            setUnits(data.data.allUnits);
        })
    }

    async function fetchUnitById(pk: number=0){

        await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `JWT ${accessToken}`
            },
            body: JSON.stringify({
                query: `
                    {
                        unitById(pk: ${pk}){
                            id
                            shortName
                            description
                            code
                        }
                    }
                `
            })
        })
        .then(res=>res.json())
        .then(data=>{
            setUnit(data.data.unitById);
        })
    }

    useEffect(() => {
        if (u !== undefined && u.token != undefined)
            setAccessToken(u.token);
    }, [u])

    useEffect(() => {
        if (accessToken.length > 0) {
            fetchUnits();
        }
    }, [accessToken]);

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

    const filteredUnits = useMemo(() => {
        return units?.filter((n:IUnit) => searchField === "shortName" ? n?.shortName?.toLowerCase().includes(searchTerm.toLowerCase()) : n?.code?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, searchField, units]);

    return (
        <>

            <div className="p-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 lg:mt-1.5 dark:bg-gray-800 dark:border-gray-700">
                <div className="w-full mb-1">
                    <Breadcrumb section={"Activos"} article={"Unidades"} />
                    <UnitFilter searchTerm={searchTerm} setSearchTerm={setSearchTerm} searchField={searchField} setSearchField={setSearchField} modal={modal} initialState={initialState} setUnit={setUnit} />
                </div>
            </div>

            <div className="flex flex-col">
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden shadow">
                            <UnitList filteredUnits={filteredUnits} modal={modal} fetchUnitById={fetchUnitById} />
                        </div>
                    </div>
                </div>
            </div>


            <UnitForm modal={modal} unit={unit} setUnit={setUnit} fetchUnits={fetchUnits} initialState={initialState} accessToken={accessToken} />

        </>
    )
}

export default UnitPage