import Excel from "@/components/icons/Excel";
import Filter from "@/components/icons/Filter";
import React, { ChangeEvent } from "react";

function KardexProductFilter({
    setFilterObj,
    filterObj,
    kardexProductsQuery,
    filteredKardexProductsLoading,
    filteredKardexProductsError,
    filteredKardexProductsData,
    user,
}: any) {
    const handleClickButton = async () => {
        const variables = {
            subsidiaryId: Number(filterObj.subsidiaryId),
            startDate: filterObj.startDate,
            endDate: filterObj.endDate,
        };
        kardexProductsQuery({
            variables,
        });
    };
    const handleInputChange = (
        event: ChangeEvent<
            HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = event.target;
        setFilterObj({ ...filterObj, [name]: value });
    };
    return (
        <>
            <div className="w-full mb-1 mt-2">
                <div className="flex items-center gap-2 mb-3">
                    <h1 className="text-3xl font-light text-gray-800 dark:text-white">
                        Movimientos de Inventario
                    </h1>
                </div>
                <div className="grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 items-start rounded-lg shadow-sm">
                    <input
                        type="date"
                        name="startDate"
                        onChange={handleInputChange}
                        value={filterObj.startDate}
                        className="filter-form-control h-10 w-full justify-self-start rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <input
                        type="date"
                        name="endDate"
                        onChange={handleInputChange}
                        value={filterObj.endDate}
                        className="filter-form-control h-10 w-full justify-self-start rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <button
                        id="btn-search"
                        type="button"
                        className="btn-blue h-8 px-3 flex items-center justify-center gap-1 rounded-full hover:opacity-90 transition-all duration-200 shadow-sm hover:shadow-md text-sm"
                        onClick={handleClickButton}
                        disabled={filteredKardexProductsLoading}
                    >
                        <Filter />
                        <span className="sm:inline">Filtrar</span>
                    </button>
                    <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 col-span-full">
                        <button
                            type="button"
                            onClick={() => {}}
                            title="Exportar kardex de productos a Excel"
                            className="btn-green h-8 px-3 flex items-center justify-center gap-1 rounded-full hover:opacity-90 transition-all duration-200 shadow-sm hover:shadow-md text-sm"
                        >
                            <Excel />
                            <span className="sm:inline">Exportar a Excel</span>
                            <span className="sm:hidden">Excel</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default KardexProductFilter;
