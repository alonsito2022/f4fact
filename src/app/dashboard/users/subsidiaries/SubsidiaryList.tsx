import { ISubsidiary } from "@/app/types";
import React from "react";

function SubsidiaryList({
    filteredSubsidiaries,
    modal,
    setModal,
    subsidiary,
    setSubsidiary,
    filterObj,
    user,
    modalDevice,
    setModalDevice,
    setSubsidiaryDevices
}: any) {
    async function fetchSubsidiaryByID(pk: number) {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    query: `
                    {
                        subsidiaryById(pk: ${pk}) {
                            id
                            serial
                            name
                            address
                            phone
                            districtId
                            districtName
                            companyId
                            token
                        }
                    }
                    `,
                }),
            });

            const result = await response.json();

            if (response.ok && result.data) {
                console.log("Sucursal:", result.data.subsidiaryById);
                setSubsidiary(result.data.subsidiaryById);
            } else {
                console.error("Error fetching subsidiary:", result.errors);
                throw new Error(result.errors ? result.errors[0].message : "Error fetching subsidiary");
            }
        } catch (error) {
            console.error("Fetch error:", error);
        }
    }
    async function fetchDevicesBySubsidiaryID(pk: number, token: string) {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    query: `
                    {
                        devicesBySubsidiaryId(pk: ${pk}) {
                            id
                            mobileDescription
                            subsidiaryId
                        }
                    }
                    `,
                }),
            });

            const result = await response.json();

            if (response.ok && result.data) {
                console.log("Sucursal:", result.data.devicesBySubsidiaryId);
                setSubsidiaryDevices({
                    devices: result.data.devicesBySubsidiaryId,
                    token: token,
                });
            } else {
                console.error("Error fetching subsidiary:", result.errors);
                throw new Error(result.errors ? result.errors[0].message : "Error fetching dispositivos");
            }
        } catch (error) {
            console.error("Fetch error:", error);
        }
    }
    return (
        <div className="overflow-x-auto">
            <div className="p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Mostrando {filteredSubsidiaries?.length} registros
                </p>
            </div>
            <table className="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-600">
                <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                        <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                        >
                            Nº
                        </th>
                        <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                        >
                            Serie
                        </th>
                        <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                        >
                            Descripcion
                        </th>
                        <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                        >
                            Direccion
                        </th>
                        <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                        >
                            Telefono
                        </th>
                        <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                        >
                            Ubigeo
                        </th>
                        <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                        >
                            Empresa
                        </th>
                        <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                        >
                            <span className="sr-only">Edit</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {filteredSubsidiaries
                        ?.filter(
                            (s: ISubsidiary) =>
                                filterObj.subsidiaryId === "0" || // Si es superusuario, muestra todos
                                Number(s?.id) === Number(filterObj.subsidiaryId) // Si no, filtra por sucursal
                        )
                        .map((item: ISubsidiary) => (
                            <tr
                                key={item.id}
                                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                <th
                                    scope="row"
                                    className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                                >
                                    {item.id}
                                </th>
                                <td className="px-4 py-2">{item.serial}</td>
                                <td className="px-4 py-2">{item.name}</td>
                                <td className="px-4 py-2">{item.address}</td>
                                <td className="px-4 py-2">{item.phone}</td>
                                <td className="px-4 py-2">
                                    {item.districtId ? item.districtId : "-"}
                                </td>
                                <td className="px-4 py-2">
                                    {item.companyName}
                                </td>
                                {filterObj?.isSuperuser ? (
                                <td className="px-4 py-2 text-center">
                                    <div className="flex justify-center space-x-2">
                                        <a
                                            href="#"
                                            className="hover:underline"
                                            onClick={async () => {
                                                await fetchDevicesBySubsidiaryID(item.id!, item.token!);
                                                modalDevice.show();
                                            }}
                                        >
                                            <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                                <path fillRule="evenodd" d="M12 8a1 1 0 0 0-1 1v10H9a1 1 0 1 0 0 2h11a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-8Zm4 10a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" clipRule="evenodd"/>
                                                <path fillRule="evenodd" d="M5 3a2 2 0 0 0-2 2v6h6V9a3 3 0 0 1 3-3h8c.35 0 .687.06 1 .17V5a2 2 0 0 0-2-2H5Zm4 10H3v2a2 2 0 0 0 2 2h4v-4Z" clipRule="evenodd"/>
                                            </svg>
                                        </a>
                                        <a
                                            href="#"
                                            className="hover:underline"
                                            onClick={async () => {
                                                await fetchSubsidiaryByID(item.id!);
                                                modal.show();
                                            }}
                                        >
                                            <svg
                                                className="w-6 h-6 text-green-500 dark:text-white"
                                                aria-hidden="true"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="currentColor"
                                                viewBox="0 0 20 18"
                                            >
                                                <path d="M12.687 14.408a3.01 3.01 0 0 1-1.533.821l-3.566.713a3 3 0 0 1-3.53-3.53l.713-3.566a3.01 3.01 0 0 1 .821-1.533L10.905 2H2.167A2.169 2.169 0 0 0 0 4.167v11.666A2.169 2.169 0 0 0 2.167 18h11.666A2.169 2.169 0 0 0 16 15.833V11.1l-3.313 3.308Zm5.53-9.065.546-.546a2.518 2.518 0 0 0 0-3.56 2.576 2.576 0 0 0-3.559 0l-.547.547 3.56 3.56Z" />
                                                <path d="M13.243 3.2 7.359 9.081a.5.5 0 0 0-.136.256L6.51 12.9a.5.5 0 0 0 .59.59l3.566-.713a.5.5 0 0 0 .255-.136L16.8 6.757 13.243 3.2Z" />
                                            </svg>
                                        </a>
                                    </div>
                                </td>
                                ) : Number(user?.subsidiaryId) === Number(item.id) ? (
                                    <td className="px-4 py-2 text-center">
                                        <div className="flex justify-center space-x-2">
                                            <a
                                                href="#"
                                                className="hover:underline"
                                                onClick={async () => {
                                                    await fetchDevicesBySubsidiaryID(item.id!, item.token!);
                                                    modalDevice.show();
                                                }}
                                            >
                                                <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                                    <path fillRule="evenodd" d="M12 8a1 1 0 0 0-1 1v10H9a1 1 0 1 0 0 2h11a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-8Zm4 10a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" clipRule="evenodd"/>
                                                    <path fillRule="evenodd" d="M5 3a2 2 0 0 0-2 2v6h6V9a3 3 0 0 1 3-3h8c.35 0 .687.06 1 .17V5a2 2 0 0 0-2-2H5Zm4 10H3v2a2 2 0 0 0 2 2h4v-4Z" clipRule="evenodd"/>
                                                </svg>
                                            </a>
                                            <a
                                                href="#"
                                                className="hover:underline"
                                                onClick={async () => {
                                                    await fetchSubsidiaryByID(item.id!);
                                                    modal.show();
                                                }}
                                            >
                                                <svg
                                                    className="w-6 h-6 text-green-500 dark:text-white"
                                                    aria-hidden="true"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 18"
                                                >
                                                    <path d="M12.687 14.408a3.01 3.01 0 0 1-1.533.821l-3.566.713a3 3 0 0 1-3.53-3.53l.713-3.566a3.01 3.01 0 0 1 .821-1.533L10.905 2H2.167A2.169 2.169 0 0 0 0 4.167v11.666A2.169 2.169 0 0 0 2.167 18h11.666A2.169 2.169 0 0 0 16 15.833V11.1l-3.313 3.308Zm5.53-9.065.546-.546a2.518 2.518 0 0 0 0-3.56 2.576 2.576 0 0 0-3.559 0l-.547.547 3.56 3.56Z" />
                                                    <path d="M13.243 3.2 7.359 9.081a.5.5 0 0 0-.136.256L6.51 12.9a.5.5 0 0 0 .59.59l3.566-.713a.5.5 0 0 0 .255-.136L16.8 6.757 13.243 3.2Z" />
                                                </svg>
                                            </a>
                                        </div>
                                    </td>
                                ) : (
                                    <td className="px-4 py-2 text-center">
                                        <div className="flex justify-center space-x-2">
                                            <a
                                                href="#"
                                                className="hover:underline"
                                                onClick={async () => {
                                                    await fetchDevicesBySubsidiaryID(item.id!, item.token!);
                                                    modalDevice.show();
                                                }}
                                            >
                                                <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                                    <path fillRule="evenodd" d="M12 8a1 1 0 0 0-1 1v10H9a1 1 0 1 0 0 2h11a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-8Zm4 10a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" clipRule="evenodd"/>
                                                    <path fillRule="evenodd" d="M5 3a2 2 0 0 0-2 2v6h6V9a3 3 0 0 1 3-3h8c.35 0 .687.06 1 .17V5a2 2 0 0 0-2-2H5Zm4 10H3v2a2 2 0 0 0 2 2h4v-4Z" clipRule="evenodd"/>
                                                </svg>
                                            </a>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
}

export default SubsidiaryList;
