"use client"
import { ChangeEvent, FormEvent, useState, useEffect, useMemo } from "react";
import Add from '@/components/icons/Add'
import Search from '@/components/icons/Search'
import Filter from '@/components/icons/Filter'
import { useRouter } from 'next/navigation'

function PurchaseFilter({setFilterObj, filterObj, purchasesQuery, filteredPurchasesLoading}: any) {
    const router = useRouter();
    const handleClickButton = async () => {
        purchasesQuery();
    }
    
    const handleInputChange = ({target: {name, value} }: ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) => {
        setFilterObj({...filterObj, [name]: value});
    }
    return (
        <div className="items-center justify-between block sm:flex md:divide-x md:divide-gray-100 dark:divide-gray-700">

            <div className="flex items-center mb-4 sm:mb-0">
                <form className="sm:pr-3" action="#" method="GET">

                    <div className="relative inline-flex gap-2">
                        <select value={filterObj.documentType} name="documentType" onChange={handleInputChange} className="filter-form-control">
                            <option value={0} disabled>Filtrar por tipo de Doc.</option>
                            <option value={50}>FACTURA ELECTRÓNICA</option>
                            <option value={100}>BOLETA DE VENTA ELECTRÓNICA</option>
                            <option value={150}>NOTA DE CRÉDITO ELECTRÓNICA</option>
                            <option value={200}>NOTA DE DÉBITO ELECTRÓNICA</option>
                        </select>
                        
                        <input type="search" name="supplierName" onChange={handleInputChange} value={filterObj.supplierName} 
                            className="filter-form-control lg:w-96"
                            placeholder="Buscar por proveedor" />
                        
                        <input type="date" name="startDate" onChange={handleInputChange} value={filterObj.startDate}
                            className="filter-form-control" />
                        
                        <input type="date" name="endDate" onChange={handleInputChange} value={filterObj.endDate} 
                            className="filter-form-control" />

                    </div>
                </form>

                <div className="flex items-center w-full sm:justify-end ">

                    <div className="flex pl-2 space-x-1">
                        <a onClick={() => {  }} className="inline-flex items-center justify-center p-1 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white me-6">
                            
                            <Search />
                        </a>
                       
                       
                    </div>



                </div>

            </div>

            <div className="flex items-center w-full sm:justify-end gap-2">
                <button id="btn-search" type="button" className="btn-blue px-5 py-3 inline-flex items-center gap-2" onClick={handleClickButton} disabled={filteredPurchasesLoading}><Filter />Filtrar</button>
                <button id="createProductButton" type="button" onClick={() => {router.push(`/dashboard/purchases/new`, { scroll: false });}} className="btn-blue px-5 py-3 inline-flex items-center gap-2"><Add />Crear compra</button>
            </div>
        </div>
    )
}

export default PurchaseFilter
