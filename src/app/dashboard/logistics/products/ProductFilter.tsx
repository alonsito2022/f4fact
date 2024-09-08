"use client"
import { ChangeEvent, FormEvent, useState, useEffect, useMemo } from "react";
import Add from '@/components/icons/Add'
import Filter from '@/components/icons/Filter'

function ProductFilter({ productFilterObj, setProductFilterObj, modalCriteria, searchTerm, setSearchTerm, searchField, setSearchField, modalProduct, initialStateProduct, setProduct, fetchProducts }: any) {

    const handleInputSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };
    const handleClickButton = async () => {
        fetchProducts()
    }
    return (
        <div className="items-center justify-between block sm:flex md:divide-x md:divide-gray-100 dark:divide-gray-700">
            <div className="flex items-center mb-4 sm:mb-0">
                <form className="sm:pr-3" action="#" method="GET">
                    <label htmlFor="products-search" className="sr-only">Search</label>

                    <div className="relative w-48 mt-1 sm:w-64 xl:w-96 inline-flex gap-2">


                        <label className="flex items-center">Registros</label>

                        <select
                            value={productFilterObj.limit}
                            onChange={(e) => setProductFilterObj({ ...productFilterObj, limit: e.target.value })}
                            className=" form-control"
                        >
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                            <option value={150}>150</option>
                            <option value={200}>200</option>
                        </select>
                        <input type="search" name="searchTerm" id="products-search" value={searchTerm} onChange={handleInputSearchChange}
                            className="form-control"
                            placeholder="Buscar productos" />

                        <select
                            value={searchField}
                            onChange={(e) => setSearchField(e.target.value as 'name' | 'code' | 'ean')}
                            className=" form-control"
                        >
                            <option value="name">Nombre</option>
                            <option value="code">Codigo</option>
                            <option value="ean">Ean</option>
                        </select>

                    </div>
                </form>

                <div className="flex items-center w-full sm:justify-end">
                    <div className="flex pl-2 space-x-1">
                        <a onClick={() => { modalCriteria.show() }} className="inline-flex items-center justify-center p-1 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                            <Filter />
                        </a>
                        <a href="#" className="inline-flex justify-center p-1 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                        </a>
                        <a href="#" className="inline-flex justify-center p-1 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                        </a>
                        <a href="#" className="inline-flex justify-center p-1 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
                        </a>
                    </div>



                </div>

            </div>

            <div className="flex items-center w-full sm:justify-end gap-2">
                <button id="btn-search" type="button" className="btn-blue px-5 py-3 inline-flex items-center gap-2" onClick={handleClickButton}><Filter />Filtrar</button>
                <button id="createProductButton" type="button" onClick={(e) => { modalProduct.show(); setProduct(initialStateProduct); }} className="btn-blue px-5 py-3 inline-flex items-center gap-2"><Add />Crear producto</button>
            </div>
        </div>
    )
}

export default ProductFilter
