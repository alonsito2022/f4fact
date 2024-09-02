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

import { useQuery, gql } from "@apollo/client";

// import createApolloClient  from '@/lib/apollo-client';

const initialState = {
    id: 0,
    shortName: "",
    description: "",
    code: ""
}

// async function loadData() {
//     const client = createApolloClient();
//     const {data} = await client.query({
//         query: gql`
//             query Units {
//                 allUnits {
//                     id
//                     shortName
//                     description
//                     code
//                 }
//             }
//         `
//     });

    // return {
    //     props: {
    //       countries: data.allUnits.slice(0, 4),
    //     },
    //   };
// }

const UNITS_QUERY = gql`
  query Units {
        allUnits {
            id
            shortName
            description
            code
        }
    }
`;

const UNIT_QUERY = gql`
    query Unit($pk: ID!) {
        unitById(pk: $pk){
            id
            shortName
            description
            code
        }
    }
`;

function UnitPage() {


    const [units, setUnits] = useState< IUnit[]>([]);
    const [unit, setUnit] = useState(initialState);
    const [modal, setModal] = useState<Modal | any>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [searchField, setSearchField] = useState<'shortName' | 'code'>('shortName');
    const { data: session, status } = useSession();
    const [jwtToken, setJwtToken] = useState<string | null>(null);

    useEffect(() => {
        if (session?.user) {
            const user = session.user as IUser;
            setJwtToken(user.accessToken as string);
        }
    }, [session]);


    const { loading: unitsLoading, error: unitsError, data: unitsData } = useQuery(UNITS_QUERY, {
        context: {
            headers: {
                "Content-Type": "application/json",
                "Authorization": jwtToken ? `JWT ${jwtToken}` : "",
            },
          },
          skip: !jwtToken, // Esto evita que la consulta se ejecute si no hay token
    });

    const {loading: unitLoading, error: unitError, data: unitData } = useQuery(UNIT_QUERY, {
        context: {
            headers: {
                "Content-Type": "application/json",
                "Authorization": jwtToken ? `JWT ${jwtToken}` : "",
            },
          },
          variables: { pk: unit.id },
          onError: (err) => console.error("Error to get unit:", err), // Log the error for debugging
          skip: unit.id === 0
    });

    useEffect(() => {
        if(unitData?.unitById) 
            setUnit(unitData?.unitById)
    }, [unitData]);

    useEffect(() => {
        if(unitsData?.allUnits)
            setUnits(unitsData?.allUnits)
    }, [unitsData]);

    const filteredUnits = useMemo(() => {
        return units?.filter((n:IUnit) => searchField === "shortName" ? n?.shortName?.toLowerCase().includes(searchTerm.toLowerCase()) : n?.code?.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm, searchField, units]);

    useEffect(() => {

    },[]);

    return (
        <>

            <div className="p-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 lg:mt-1.5 dark:bg-gray-800 dark:border-gray-700">
                <div className="w-full mb-1">
                    <Breadcrumb section={"Productos"} article={"Unidades"} />
                    <UnitFilter searchTerm={searchTerm} setSearchTerm={setSearchTerm} searchField={searchField} setSearchField={setSearchField} modal={modal} initialState={initialState} setUnit={setUnit} />
                </div>
            </div>

            <div className="flex flex-col">
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden shadow">
                            {unitsLoading ? <div>Cargando...</div> : unitsError? <div>Error: No autorizado o error en la consulta. {unitsError.message}</div> : <UnitList filteredUnits={filteredUnits} modal={modal} setUnit={setUnit} unit={unit} />}
                        </div>
                    </div>
                </div>
            </div>


            <UnitForm modal={modal} setModal={setModal} unit={unit} setUnit={setUnit} initialState={initialState} jwtToken={jwtToken} UNITS_QUERY={UNITS_QUERY} />

        </>
    )
}

export default UnitPage