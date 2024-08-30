import { useState, useEffect } from "react";
import Edit from '@/components/icons/Edit'
export interface IWarehouse {
    id?: number
    name?: string
    category?: string
    categoryReadable?: string
    subsidiaryId?: number
    subsidiaryName?: string
    truckId?: number
    truckLicensePlate?: string
}
function WarehouseList({warehouses, modal, fetchWarehouseById}:any) {
    const [hostname, setHostname] = useState("");

    useEffect(() => {
        if(hostname == ""){
            setHostname(`${process.env.NEXT_PUBLIC_BASE_API}`)
        }
    }, [hostname]);

    return (
        <>
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="px-4 py-2">ID </th>
                        <th scope="col" className="px-4 py-2">NOMBRE</th>
                        <th scope="col" className="px-4 py-2">CATEGORIA</th>
                        <th scope="col" className="px-4 py-2">VEHICULO</th>
                        <th scope="col" className="px-4 py-2">SEDE</th>
                        <th scope="col" className="px-4 py-2">ACCION</th>
                    </tr>
                </thead>
                <tbody>
                {warehouses?.map((item: IWarehouse) => 
                    <tr key={item.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                        <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">{item.id}</td>
                        <td className="px-4 py-2">{item.name}</td>
                        <td className="px-4 py-2">{item.categoryReadable}</td>
                        <td className="px-4 py-2">{item.truckLicensePlate}</td>
                        <td className="px-4 py-2">{item.subsidiaryName}</td>
                        <td className="px-4 py-2">
                            <>
                                <button type="button" onClick={async () => {
                                    await fetchWarehouseById(item.id);
                                    modal.show();

                                    document.getElementById("modal-title")!.innerHTML = "Editar Almacen";
                                    document.getElementById("btn-save")!.innerHTML = "Actualizar Almacen";

                                }}
                                    className="btn-blue border px-5 py-2 inline-flex">
                                        <Edit />Editar</button>
                               
                            </>
                            
                        </td>
                    </tr>
                    )}
                </tbody>
            </table>
        </>
    )
}

export default WarehouseList
