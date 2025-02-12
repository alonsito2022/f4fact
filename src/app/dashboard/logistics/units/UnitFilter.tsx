"use client";
import { ChangeEvent, FormEvent, useState, useEffect, useMemo } from "react";
import Add from "@/components/icons/Add";

function UnitFilter({
    searchTerm,
    setSearchTerm,
    searchField,
    setSearchField,
    modal,
    initialState,
    setUnit,
    filterObj,
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
                placeholder="Buscar unidades"
            />

            <select
                value={searchField}
                onChange={(e) =>
                    setSearchField(e.target.value as "shortName" | "code")
                }
                className="filter-form-control w-full justify-self-start"
            >
                <option value="shortName">Nombre</option>
                <option value="code">Codigo</option>
            </select>
            {filterObj?.isSuperuser ? (
                <button
                    id="createProductButton"
                    type="button"
                    onClick={(e) => {
                        modal.show();
                        setUnit(initialState);
                    }}
                    className="btn-blue px-5 py-3 inline-flex items-center gap-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800 w-full sm:w-auto"
                >
                    <Add />
                    Crear Unidad
                </button>
            ) : null}
        </div>
    );
}

export default UnitFilter;
