"use client";
import { useState, useEffect, useMemo } from "react";
import WarehouseList from "./WarehouseList";
import WarehouseForm from "./WarehouseForm";
import WarehouseFilter from "./WarehouseFilter";
import Breadcrumb from "@/components/Breadcrumb";
import { Modal, ModalOptions } from "flowbite";
import { useAuth } from "@/components/providers/AuthProvider";

import { IUser, IWarehouse } from "@/app/types";

const initialState = {
    id: 0,
    name: "",
    subsidiaryId: 0,
    category: "NA",
};

function WarehousePage() {
    const [warehouse, setWarehouse] = useState(initialState);
    const [warehouses, setWarehouses] = useState<IWarehouse[]>([]);
    const [modal, setModal] = useState<Modal | any>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [searchField, setSearchField] = useState<"name" | "subsidiaryName">(
        "name"
    );
    const auth = useAuth();

    async function fetchWarehouses() {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `JWT ${auth?.jwtToken}`,
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
                `,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                setWarehouses(data.data.allWarehouses);
            });
    }

    async function fetchWarehouseById(pk: number = 0) {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `JWT ${auth?.jwtToken}`,
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
                `,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                setWarehouse(data.data.warehouseById);
            });
    }

    useEffect(() => {
        if (auth?.user) fetchWarehouses();
    }, [auth?.user]);

    useEffect(() => {
        if (modal == null) {
            const $targetEl = document.getElementById("defaultModal");
            const options: ModalOptions = {
                placement: "bottom-right",
                backdrop: "static",
                backdropClasses:
                    "bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40",
                closable: false,
            };

            setModal(new Modal($targetEl, options));
        }
    }, []);

    const filteredWarehouses = useMemo(() => {
        return warehouses.filter((w: IWarehouse) =>
            searchField === "name"
                ? w?.name?.toLowerCase().includes(searchTerm.toLowerCase())
                : w?.subsidiaryName
                      ?.toLowerCase()
                      .includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, searchField, warehouses]);

    return (
        <>
            <div className="p-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                <div className="w-full">
                    <Breadcrumb section={"Productos"} article={"Almacenes"} />
                    <WarehouseFilter
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        searchField={searchField}
                        setSearchField={setSearchField}
                        modal={modal}
                        initialState={initialState}
                        setWarehouse={setWarehouse}
                    />
                </div>
            </div>

            <div className="flex flex-col">
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden shadow">
                            <WarehouseList
                                filteredWarehouses={filteredWarehouses}
                                modal={modal}
                                fetchWarehouseById={fetchWarehouseById}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <WarehouseForm
                modal={modal}
                warehouse={warehouse}
                setWarehouse={setWarehouse}
                fetchWarehouses={fetchWarehouses}
                initialState={initialState}
                jwtToken={auth?.jwtToken}
            />
        </>
    );
}
export default WarehousePage;
