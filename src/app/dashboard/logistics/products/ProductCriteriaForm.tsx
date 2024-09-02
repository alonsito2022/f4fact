import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { IUnit, ITypeAffectation } from "@/app/types";

function ProductCriteriaForm({ modalCriteria, filterObj, setFilterObj, typeAffectations, fetchProducts }: any) {


    const handleInputChange = ({ target: { name, value } }: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFilterObj({ ...filterObj, [name]: value });
    }

    const handleCheckboxChange = ({ target: { name, checked } }: ChangeEvent<HTMLInputElement>) => {
        setFilterObj({ ...filterObj, [name]: checked });
    }

    return (
        <div id="modalCriteria" tabIndex={-1} className="fixed top-0 left-0 right-0 z-50 hidden w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
            <div className="relative w-full max-w-md max-h-full">
                {/* Modal content */}
                <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                    {/* Modal header */}
                    <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                            Ajustes de busqueda
                        </h3>
                        <button type="button" onClick={() => { modalCriteria.hide() }} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>
                    {/* Modal body */}
                    <div className="p-4 md:p-5 space-y-4">
                        <div className="grid items-end gap-3 md:grid-cols-6">
                            <div className="sm:col-span-2">
                                <label htmlFor="criteria" className="form-label">Seleccione criterio</label>
                                <select name="criteria" id="criteria" onChange={handleInputChange} value={filterObj.criteria} className="form-control-sm" required>
                                    <option value={"name"}>Nombre</option>
                                    <option value={"code"}>Codigo</option>
                                    <option value={"ean"}>Ean</option>
                                </select>
                            </div>

                            <div className="sm:col-span-4">
                                <label htmlFor="searchText" className="text-sm">Ingrese texto</label>
                                <input
                                    type="search"
                                    name="searchText"
                                    value={filterObj.searchText}
                                    onChange={handleInputChange}
                                    onFocus={(e) => e.target.select()}
                                    autoComplete="off"
                                    className="form-control-sm"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="activeType2" className="form-label">Tipo mercaderia</label>
                                <select id="activeType2"
                                    name="activeType" value={filterObj.activeType} onChange={handleInputChange}
                                    className="form-control-sm">
                                    <option value={"01"}>PRODUCTO</option>
                                    <option value={"02"}>REGALO</option>
                                    <option value={"03"}>SERVICIO</option>
                                    <option value={"NA"}>NO APLICA</option>
                                </select>
                            </div>

                            <div className="sm:col-span-4">
                                <label htmlFor="typeAffectationId" className="form-label">Tipo afectacion</label>
                                <select name="typeAffectationId" onChange={handleInputChange} value={filterObj.typeAffectationId} className="form-control-sm" required>
                                    <option value={0}>Elegir tipo de afectacion</option>
                                    {typeAffectations?.map((o: ITypeAffectation, k: number) => (
                                        <option key={k} value={o.id}>{o.name}</option>
                                    ))}
                                </select>
                            </div>


                            <div className="sm:col-span-4 mb-2">
                                <input id="subjectPerception2" name="subjectPerception" checked={filterObj.subjectPerception} type="checkbox" onChange={handleCheckboxChange} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                <label htmlFor="subjectPerception2" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Sujeto a percepcion</label>
                            </div>


                        </div>
                        {/* Modal footer */}
                        <div className="flex gap-2 justify-end items-end border-t border-gray-200 rounded-b dark:border-gray-600 py-6 pb-0">

                            <button onClick={() => { modalCriteria.hide() }} type="button" className=" btn-dark">Cerrar</button>

                            <button onClick={() => { modalCriteria.hide(), fetchProducts() }} type="button" className=" btn-default">Buscar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductCriteriaForm
