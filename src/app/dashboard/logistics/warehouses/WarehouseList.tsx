import { useState, useEffect } from "react";
import Edit from "@/components/icons/Edit";
import { IWarehouse } from "@/app/types";

function WarehouseList({ filteredWarehouses, modal, fetchWarehouseById }: any) {
    const [hostname, setHostname] = useState("");

    useEffect(() => {
        if (hostname == "") {
            setHostname(`${process.env.NEXT_PUBLIC_BASE_API}`);
        }
    }, [hostname]);

    return (
        <div className="overflow-x-auto">
            <div className="p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Mostrando {filteredWarehouses?.length} registros
                </p>
            </div>
            <table className="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-600">
                <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                        <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                        >
                            ID{" "}
                        </th>
                        <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                        >
                            NOMBRE
                        </th>
                        <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                        >
                            CATEGORIA
                        </th>
                        <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                        >
                            SEDE
                        </th>
                        <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                        >
                            ACCION
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {filteredWarehouses?.map((item: IWarehouse) => (
                        <tr
                            key={item.id}
                            className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {item.id}
                            </td>
                            <td className="px-4 py-2">{item.name}</td>
                            <td className="px-4 py-2">
                                {item.categoryReadable}
                            </td>
                            <td className="px-4 py-2">{item.subsidiaryName}</td>
                            <td className="px-4 py-2">
                                <>
                                    <a
                                        href="#"
                                        className="hover:underline"
                                        onClick={async () => {
                                            await fetchWarehouseById(item.id);
                                            modal.show();
                                        }}
                                    >
                                        <Edit />
                                    </a>
                                </>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default WarehouseList;
