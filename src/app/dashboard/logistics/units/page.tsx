"use client";
import { ChangeEvent, FormEvent, useState, useEffect, useMemo } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import { Modal, ModalOptions } from "flowbite";
import { useSession } from "next-auth/react";
import { IUnit, IUser } from "@/app/types";
import { toast } from "react-toastify";
import UnitList from "./UnitList";
import UnitForm from "./UnitForm";
import UnitFilter from "./UnitFilter";

import { useQuery, gql } from "@apollo/client";

const initialState = {
    id: 0,
    shortName: "",
    description: "",
    code: "",
};

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
        unitById(pk: $pk) {
            id
            shortName
            description
            code
        }
    }
`;

const initialStateFilterObj = {
    subsidiaryId: "",
    isSuperuser: false,
};

function UnitPage() {
    const [filterObj, setFilterObj] = useState(initialStateFilterObj);
    const [units, setUnits] = useState<IUnit[]>([]);
    const [unit, setUnit] = useState(initialState);
    const [modal, setModal] = useState<Modal | any>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [searchField, setSearchField] = useState<"shortName" | "code">(
        "shortName"
    );
    const { data: session, status } = useSession();
    const [jwtToken, setJwtToken] = useState<string | null>(null);

    useEffect(() => {
        if (session?.user) {
            const user = session.user as IUser;
            setJwtToken((prev) => prev || (user.accessToken as string)); // Solo cambia si es null

            setFilterObj((prev) => ({
                ...prev,
                subsidiaryId:
                    prev.subsidiaryId ||
                    (user.isSuperuser ? "0" : user.subsidiaryId!),
                isSuperuser: user.isSuperuser ?? false, // Asegura que isSuperuser sea siempre booleano
            }));
        }
    }, [session]);

    const {
        loading: unitsLoading,
        error: unitsError,
        data: unitsData,
    } = useQuery(UNITS_QUERY, {
        context: {
            headers: {
                "Content-Type": "application/json",
                Authorization: jwtToken ? `JWT ${jwtToken}` : "",
            },
        },
        skip: !jwtToken, // Esto evita que la consulta se ejecute si no hay token
    });

    const {
        loading: unitLoading,
        error: unitError,
        data: unitData,
    } = useQuery(UNIT_QUERY, {
        context: {
            headers: {
                "Content-Type": "application/json",
                Authorization: jwtToken ? `JWT ${jwtToken}` : "",
            },
        },
        variables: { pk: unit.id },
        onError: (err) => console.error("Error to get unit:", err), // Log the error for debugging
        skip: unit.id === 0,
    });

    useEffect(() => {
        if (unitData?.unitById) setUnit(unitData?.unitById);
    }, [unitData]);

    useEffect(() => {
        if (unitsData?.allUnits) setUnits(unitsData?.allUnits);
    }, [unitsData]);

    const filteredUnits = useMemo(() => {
        return units?.filter((n: IUnit) =>
            searchField === "shortName"
                ? n?.shortName?.toLowerCase().includes(searchTerm.toLowerCase())
                : n?.code?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, searchField, units]);

    return (
        <>
            <div className="p-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 lg:mt-1.5 dark:bg-gray-800 dark:border-gray-700">
                <div className="w-full mb-1">
                    <Breadcrumb section={"Productos"} article={"Unidades"} />
                    <UnitFilter
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        searchField={searchField}
                        setSearchField={setSearchField}
                        modal={modal}
                        initialState={initialState}
                        setUnit={setUnit}
                        filterObj={filterObj}
                    />
                </div>
            </div>

            <div className="flex flex-col">
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden shadow rounded-lg">
                            {unitsLoading ? (
                                <div className="p-4 text-center">
                                    Cargando...
                                </div>
                            ) : unitsError ? (
                                <div className="p-4 text-center text-red-500">
                                    Error: No autorizado o error en la consulta.{" "}
                                    {unitsError.message}
                                </div>
                            ) : (
                                <UnitList
                                    filteredUnits={filteredUnits}
                                    modal={modal}
                                    setUnit={setUnit}
                                    unit={unit}
                                    filterObj={filterObj}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <UnitForm
                modal={modal}
                setModal={setModal}
                unit={unit}
                setUnit={setUnit}
                initialState={initialState}
                jwtToken={jwtToken}
                UNITS_QUERY={UNITS_QUERY}
            />
        </>
    );
}

export default UnitPage;
