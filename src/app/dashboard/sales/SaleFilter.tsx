"use client"
import { ChangeEvent, FormEvent, useState, useEffect, useMemo } from "react";
import Add from '@/components/icons/Add'
import Search from '@/components/icons/Search'
import Filter from '@/components/icons/Filter'
import { useRouter } from 'next/navigation'
import { gql, useQuery } from "@apollo/client";
import { ISupplier } from "@/app/types";

const SUPPLIERS_QUERY = gql`
    query{
        allSuppliers{
            names
            id
            address
            documentNumber
        }
    }
`;

function SaleFilter({ setFilterObj, filterObj, saleQuery, filteredSaleLoading, jwtToken }: any) {
    const router = useRouter();
    const handleClickButton = async () => {
        saleQuery();
    }

    const handleInputChange = (event: ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;

        if (name === "supplierName" && event.target instanceof HTMLInputElement) {
            const dataList = event.target.list;
            if (dataList) {
                const option = Array.from(dataList.options).find(option => option.value === value);
                if (option) {
                    const selectedId = option.getAttribute("data-key");
                    setFilterObj({ ...filterObj, supplierId: Number(selectedId), supplierName: value });
                } else {
                    setFilterObj({ ...filterObj, supplierId: 0, supplierName: value });
                }
            } else {
                console.log('sin datalist')
            }
        } else
            setFilterObj({ ...filterObj, [name]: value });
    }
    const getAuthContext = () => ({
        headers: {
            "Content-Type": "application/json",
            "Authorization": jwtToken ? `JWT ${jwtToken}` : "",
        },
    });
    const { loading: suppliersLoading, error: suppliersError, data: suppliersData } = useQuery(SUPPLIERS_QUERY, {
        context: getAuthContext(),
        skip: !jwtToken,
    });

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
                        {suppliersError ? <div>Error: No autorizado o error en la consulta. {suppliersError.message}</div> :
                            <>
                                <input type="search" name="supplierName" onChange={handleInputChange} value={filterObj.supplierName}
                                    onFocus={(e) => e.target.select()} autoComplete="off" disabled={suppliersLoading}
                                    className="filter-form-control lg:w-96" list="supplierList"
                                    placeholder="Buscar por proveedor" />
                                <datalist id="supplierList">
                                    {suppliersData?.allSuppliers?.map((n: ISupplier, index: number) => (
                                        <option key={index} data-key={n.id} value={`${n.documentNumber} ${n.names}`} />
                                    ))}
                                </datalist>
                            </>
                        }

                        <input type="date" name="startDate" onChange={handleInputChange} value={filterObj.startDate}
                            className="filter-form-control" />

                        <input type="date" name="endDate" onChange={handleInputChange} value={filterObj.endDate}
                            className="filter-form-control" />

                    </div>
                </form>

                <div className="flex items-center w-full sm:justify-end ">

                    <div className="flex pl-2 space-x-1">
                        <a onClick={() => { }} className="inline-flex items-center justify-center p-1 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white me-6">

                            <Search />
                        </a>


                    </div>



                </div>

            </div>

            <div className="flex items-center w-full sm:justify-end gap-2">
                <button id="btn-search" type="button" className="btn-blue px-5 py-3 inline-flex items-center gap-2" onClick={handleClickButton} disabled={filteredSaleLoading}><Filter />Filtrar</button>
                <button id="createProductButton" type="button" onClick={() => { router.push(`/dashboard/sale/new`, { scroll: false }); }} className="btn-blue px-5 py-3 inline-flex items-center gap-2"><Add />Crear compra</button>
            </div>
        </div>
    )
}

export default SaleFilter
