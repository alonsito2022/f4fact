import { useState, useEffect } from "react";
import Edit from "@/components/icons/Edit";
import { IUnit } from "@/app/types";

function UnitList({ filteredUnits, modal, setUnit, unit, filterObj }: any) {
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
                    Mostrando {filteredUnits?.length} registros
                </p>
            </div>
            <table className="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-600">
                <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                        <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                        >
                            ID
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
                            DESCRIPCION
                        </th>
                        <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                        >
                            CODIGO SUNAT
                        </th>
                        {filterObj?.isSuperuser ? (
                            <th
                                scope="col"
                                className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                            >
                                ACCION
                            </th>
                        ) : null}
                    </tr>
                </thead>
                <tbody>
                    {filteredUnits?.map((item: IUnit) => (
                        <tr
                            key={item.id}
                            className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {item.id}
                            </td>
                            <td className="px-4 py-2">{item.shortName}</td>
                            <td className="px-4 py-2">{item.description}</td>
                            <td className="px-4 py-2">{item.code}</td>
                            {filterObj?.isSuperuser ? (
                                <td className="px-4 py-2">
                                    <a
                                        href="#"
                                        className="text-blue-600 hover:underline dark:text-blue-400"
                                        onClick={async () => {
                                            setUnit({ ...unit, id: item.id });
                                            modal.show();
                                        }}
                                    >
                                        <Edit />
                                    </a>
                                </td>
                            ) : null}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default UnitList;
