"use client";
import { ChangeEvent, FormEvent, useState, useEffect, useMemo } from "react";
import Add from "@/components/icons/Add";

function WarehouseFilter({
    searchTerm,
    setSearchTerm,
    searchField,
    setSearchField,
    modal,
    initialState,
    setWarehouse,
}: any) {
    const handleInputSearchChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setSearchTerm(event.target.value);
    };

    return (
        <div className="grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <label htmlFor="products-search" className="sr-only">
                Search
            </label>

            <input
                type="search"
                name="searchTerm"
                id="products-search"
                value={searchTerm}
                onChange={handleInputSearchChange}
                className="filter-form-control w-full justify-self-start"
                placeholder="Buscar almacenes"
            />

            <select
                value={searchField}
                onChange={(e) =>
                    setSearchField(e.target.value as "name" | "subsidiaryName")
                }
                className="filter-form-control w-full justify-self-start"
            >
                <option value="name">Nombre</option>
                <option value="subsidiaryName">Sede</option>
            </select>

            <button
                id="createProductButton"
                type="button"
                onClick={(e) => {
                    modal.show();
                    setWarehouse(initialState);
                }}
                className="btn-blue px-5 py-3 flex items-center justify-center gap-2 w-full"
            >
                <Add />
                Crear almacen
            </button>
        </div>
    );
}

export default WarehouseFilter;
