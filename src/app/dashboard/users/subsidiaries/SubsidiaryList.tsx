import { ISubsidiary } from "@/app/types";
import React, { useMemo } from "react";

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
    setSubsidiaryDevices,
}: any) {
    async function fetchSubsidiaryByID(pk: number) {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_API}/graphql`,
                {
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
                            serialassignedSet {
                                id
                                documentType
                                serial
                                isGeneratedViaApi
                            }
                            pdfFormatForInvoices
                            pdfFormatForReceiptInvoices
                        	pdfFormatForGuides
                            fillColor
                            logo
                        }
                    }
                    `,
                    }),
                }
            );

            const result = await response.json();

            if (response.ok && result.data) {
                const subsidiary = result.data.subsidiaryById;
                // Modify serialassignedSet to remove A_ prefix
                if (subsidiary.serialassignedSet) {
                    subsidiary.serialassignedSet =
                        subsidiary.serialassignedSet.map((item: any) => ({
                            ...item,
                            documentType: item.documentType.replace("A_", ""),
                        }));
                }

                setSubsidiary(subsidiary);
            } else {
                console.error("Error fetching subsidiary:", result.errors);
                throw new Error(
                    result.errors
                        ? result.errors[0].message
                        : "Error fetching subsidiary"
                );
            }
        } catch (error) {
            console.error("Fetch error:", error);
        }
    }

    async function fetchDevicesBySubsidiaryID(pk: number, token: string) {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_API}/graphql`,
                {
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
                }
            );

            const result = await response.json();

            if (response.ok && result.data) {
                console.log("Sucursal:", result.data.devicesBySubsidiaryId);
                setSubsidiaryDevices({
                    devices: result.data.devicesBySubsidiaryId,
                    token: token,
                });
            } else {
                console.error("Error fetching subsidiary:", result.errors);
                throw new Error(
                    result.errors
                        ? result.errors[0].message
                        : "Error fetching dispositivos"
                );
            }
        } catch (error) {
            console.error("Fetch error:", error);
        }
    }

    const displayedSubsidiaries = useMemo(() => {
        // La consulta ya viene acotada: superusuario ve todas las sedes,
        // el resto ve todas las sedes de su empresa.
        return filteredSubsidiaries || [];
    }, [filteredSubsidiaries]);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200/80 dark:border-gray-700/70 overflow-hidden">
            {/* Sub-header de conteo y estado */}
            <div className="px-5 py-3.5 border-b border-gray-200/80 dark:border-gray-700/70 bg-gray-50/60 dark:bg-gray-800/60 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                        {displayedSubsidiaries.length}{" "}
                        {displayedSubsidiaries.length === 1
                            ? "local registrado"
                            : "locales registrados"}
                    </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                    {filterObj?.isSuperuser ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Vista Administrador (Todos los locales)
                        </span>
                    ) : (
                        <span>Locales de tu empresa</span>
                    )}
                </div>
            </div>

            {/* Tabla Principal */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-left text-sm">
                    <thead className="bg-gray-50/90 dark:bg-gray-700/60 text-[11px] font-semibold text-gray-600 uppercase tracking-wider dark:text-gray-300">
                        <tr>
                            <th scope="col" className="px-4 py-3.5 w-16">
                                Nº
                            </th>
                            <th scope="col" className="px-4 py-3.5 w-24">
                                Serie
                            </th>
                            <th scope="col" className="px-4 py-3.5 min-w-[200px]">
                                Local / Sucursal
                            </th>
                            <th scope="col" className="px-4 py-3.5 min-w-[220px]">
                                Dirección
                            </th>
                            <th scope="col" className="px-4 py-3.5">
                                Teléfono
                            </th>
                            <th scope="col" className="px-4 py-3.5">
                                Ubigeo
                            </th>
                            <th scope="col" className="px-4 py-3.5 min-w-[180px]">
                                Empresa
                            </th>
                            <th scope="col" className="px-4 py-3.5 text-center w-28">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 bg-white dark:bg-gray-800">
                        {displayedSubsidiaries.length > 0 ? (
                            displayedSubsidiaries.map((item: ISubsidiary) => {
                                const canEdit =
                                    filterObj?.isSuperuser ||
                                    Number(user?.companyId) === Number(item.companyId);

                                return (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-blue-50/40 dark:hover:bg-gray-700/50 transition-colors duration-150"
                                    >
                                        {/* ID */}
                                        <td className="px-4 py-3 font-mono text-xs font-medium text-gray-500 dark:text-gray-400">
                                            #{item.id}
                                        </td>

                                        {/* Serie */}
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200/70 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/60 tracking-wider">
                                                {item.serial}
                                            </span>
                                        </td>

                                        {/* Local / Sucursal */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2.5">
                                                {item.logo ? (
                                                    <img
                                                        src={
                                                            item.logo.startsWith("data:") || item.logo.includes("base64")
                                                                ? item.logo
                                                                : `${process.env.NEXT_PUBLIC_BASE_API}/${item.logo}`
                                                        }
                                                        alt={item.name || "Logo"}
                                                        className="w-7 h-7 rounded-lg object-contain bg-white dark:bg-gray-700 p-0.5 border border-gray-200 dark:border-gray-600 shadow-xs shrink-0"
                                                    />
                                                ) : (
                                                    <span
                                                        className="w-3.5 h-3.5 rounded-full ring-2 ring-white dark:ring-gray-700 shadow-xs shrink-0"
                                                        style={{
                                                            backgroundColor:
                                                                item.fillColor ||
                                                                "#D2D7DA",
                                                        }}
                                                        title={`Color distintivo: ${
                                                            item.fillColor ||
                                                            "#D2D7DA"
                                                        }`}
                                                    />
                                                )}
                                                <div
                                                    className="font-semibold text-gray-900 dark:text-white truncate max-w-[240px]"
                                                    title={item.name}
                                                >
                                                    {item.name}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Dirección */}
                                        <td className="px-4 py-3">
                                            <div
                                                className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 max-w-[260px]"
                                                title={
                                                    item.address ||
                                                    "Sin dirección registrada"
                                                }
                                            >
                                                <svg
                                                    className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                    />
                                                </svg>
                                                <span className="truncate">
                                                    {item.address || (
                                                        <span className="text-gray-400 italic">
                                                            No especificada
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Teléfono */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 tabular-nums">
                                                {item.phone ? (
                                                    <>
                                                        <svg
                                                            className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                                            />
                                                        </svg>
                                                        <span>{item.phone}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-gray-400">
                                                        —
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Ubigeo */}
                                        <td className="px-4 py-3">
                                            <span
                                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                                title={
                                                    item.districtId
                                                        ? `Ubigeo: ${item.districtId}`
                                                        : "Sin ubigeo"
                                                }
                                            >
                                                {item.districtId || "—"}
                                            </span>
                                        </td>

                                        {/* Empresa */}
                                        <td className="px-4 py-3">
                                            <div
                                                className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 max-w-[200px]"
                                                title={item.companyName}
                                            >
                                                <svg
                                                    className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                                    />
                                                </svg>
                                                <span className="truncate">
                                                    {item.companyName || "—"}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Acciones */}
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                {/* Botón Vincular Dispositivo */}
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        await fetchDevicesBySubsidiaryID(
                                                            item.id!,
                                                            item.token!
                                                        );
                                                        modalDevice.show();
                                                    }}
                                                    title="Vincular Dispositivos"
                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-gray-400 dark:hover:text-indigo-400 dark:hover:bg-gray-700/80 transition-all border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/50"
                                                >
                                                    <svg
                                                        className="w-4 h-4"
                                                        aria-hidden="true"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M12 8a1 1 0 0 0-1 1v10H9a1 1 0 1 0 0 2h11a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-8Zm4 10a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"
                                                            clipRule="evenodd"
                                                        />
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M5 3a2 2 0 0 0-2 2v6h6V9a3 3 0 0 1 3-3h8c.35 0 .687.06 1 .17V5a2 2 0 0 0-2-2H5Zm4 10H3v2a2 2 0 0 0 2 2h4v-4Z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                    <span className="sr-only">
                                                        Vincular dispositivo
                                                    </span>
                                                </button>

                                                {/* Botón Editar Local */}
                                                {canEdit && (
                                                    <button
                                                        type="button"
                                                        onClick={async () => {
                                                            await fetchSubsidiaryByID(
                                                                item.id!
                                                            );
                                                            modal.show();
                                                        }}
                                                        title="Editar Local"
                                                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:text-gray-400 dark:hover:text-emerald-400 dark:hover:bg-gray-700/80 transition-all border border-transparent hover:border-emerald-100 dark:hover:border-emerald-900/50"
                                                    >
                                                        <svg
                                                            className="w-4 h-4"
                                                            aria-hidden="true"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="currentColor"
                                                            viewBox="0 0 20 18"
                                                        >
                                                            <path d="M12.687 14.408a3.01 3.01 0 0 1-1.533.821l-3.566.713a3 3 0 0 1-3.53-3.53l.713-3.566a3.01 3.01 0 0 1 .821-1.533L10.905 2H2.167A2.169 2.169 0 0 0 0 4.167v11.666A2.169 2.169 0 0 0 2.167 18h11.666A2.169 2.169 0 0 0 16 15.833V11.1l-3.313 3.308Zm5.53-9.065.546-.546a2.518 2.518 0 0 0 0-3.56 2.576 2.576 0 0 0-3.559 0l-.547.547 3.56 3.56Z" />
                                                            <path d="M13.243 3.2 7.359 9.081a.5.5 0 0 0-.136.256L6.51 12.9a.5.5 0 0 0 .59.59l3.566-.713a.5.5 0 0 0 .255-.136L16.8 6.757 13.243 3.2Z" />
                                                        </svg>
                                                        <span className="sr-only">
                                                            Editar local
                                                        </span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={8} className="py-12 text-center">
                                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-gray-500 dark:text-gray-400">
                                        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-700/60 flex items-center justify-center text-gray-400 mb-3 shadow-inner">
                                            <svg
                                                className="w-6 h-6"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={1.5}
                                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                                />
                                            </svg>
                                        </div>
                                        <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                                            No se encontraron locales
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            No hay registros que coincidan con el término de búsqueda o filtros.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default SubsidiaryList;
