"use client";
import { ChangeEvent, FormEvent, useState, useEffect, useMemo } from "react";
import Add from "@/components/icons/Add";
import Search from "@/components/icons/Search";
import Filter from "@/components/icons/Filter";
import { useRouter } from "next/navigation";
import { gql, useQuery } from "@apollo/client";
import { ISupplier } from "@/app/types";
import { initFlowbite } from "flowbite";
import Excel from "@/components/icons/Excel";

const SUPPLIERS_QUERY = gql`
    query {
        allSuppliers {
            names
            id
            address
            documentNumber
        }
    }
`;

function SaleFilter({
    setFilterObj,
    filterObj,
    salesQuery,
    filteredSaleLoading,
    jwtToken,
}: any) {
    const router = useRouter();
    const [hostname, setHostname] = useState("");
    useEffect(() => {
        if (hostname == "") {
            setHostname(`${process.env.NEXT_PUBLIC_BASE_API}`);
        }
    }, [hostname]);
    const handleClickButton = async () => {
        salesQuery();
        initFlowbite();
    };

    const handleInputChange = (
        event: ChangeEvent<
            HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = event.target;

        if (
            name === "supplierName" &&
            event.target instanceof HTMLInputElement
        ) {
            const dataList = event.target.list;
            if (dataList) {
                const option = Array.from(dataList.options).find(
                    (option) => option.value === value
                );
                if (option) {
                    const selectedId = option.getAttribute("data-key");
                    setFilterObj({
                        ...filterObj,
                        supplierId: Number(selectedId),
                        supplierName: value,
                    });
                } else {
                    setFilterObj({
                        ...filterObj,
                        supplierId: 0,
                        supplierName: value,
                    });
                }
            } else {
                console.log("sin datalist");
            }
        } else setFilterObj({ ...filterObj, [name]: value });
    };
    const getAuthContext = () => ({
        headers: {
            "Content-Type": "application/json",
            Authorization: jwtToken ? `JWT ${jwtToken}` : "",
        },
    });
    const {
        loading: suppliersLoading,
        error: suppliersError,
        data: suppliersData,
    } = useQuery(SUPPLIERS_QUERY, {
        context: getAuthContext(),
        skip: !jwtToken,
    });

    return (
        <div className="items-center justify-between block sm:flex md:divide-x md:divide-gray-100 dark:divide-gray-700">
            <div className="flex items-center mb-4 sm:mb-0">
                <form className="sm:pr-3" action="#" method="GET">
                    <div className="relative inline-flex gap-2">
                        <select
                            value={filterObj.documentType}
                            name="documentType"
                            onChange={handleInputChange}
                            className="filter-form-control"
                        >
                            <option value={"NA"} disabled>
                                Filtrar por tipo de Doc.
                            </option>
                            <option value={"01"}>FACTURA ELECTRÓNICA</option>
                            <option value={"03"}>
                                BOLETA DE VENTA ELECTRÓNICA
                            </option>
                            <option value={"07"}>
                                NOTA DE CRÉDITO ELECTRÓNICA
                            </option>
                            <option value={"08"}>
                                NOTA DE DÉBITO ELECTRÓNICA
                            </option>
                        </select>
                        {suppliersError ? (
                            <div>
                                Error: No autorizado o error en la consulta.{" "}
                                {suppliersError.message}
                            </div>
                        ) : (
                            <>
                                <input
                                    type="search"
                                    name="supplierName"
                                    onChange={handleInputChange}
                                    value={filterObj.supplierName}
                                    onFocus={(e) => e.target.select()}
                                    autoComplete="off"
                                    disabled={suppliersLoading}
                                    className="filter-form-control lg:w-96"
                                    list="supplierList"
                                    placeholder="Buscar por cliente"
                                />
                                <datalist id="supplierList">
                                    {suppliersData?.allSuppliers?.map(
                                        (n: ISupplier, index: number) => (
                                            <option
                                                key={index}
                                                data-key={n.id}
                                                value={`${n.documentNumber} ${n.names}`}
                                            />
                                        )
                                    )}
                                </datalist>
                            </>
                        )}

                        <input
                            type="date"
                            name="startDate"
                            onChange={handleInputChange}
                            value={filterObj.startDate}
                            className="filter-form-control"
                        />

                        <input
                            type="date"
                            name="endDate"
                            onChange={handleInputChange}
                            value={filterObj.endDate}
                            className="filter-form-control"
                        />
                    </div>
                </form>
            </div>

            <div className="flex items-center w-full sm:justify-end gap-2">
                <button
                    id="btn-search"
                    type="button"
                    className="btn-blue px-5 py-3 inline-flex items-center gap-2"
                    onClick={handleClickButton}
                    disabled={filteredSaleLoading}
                >
                    <Filter />
                    Filtrar
                </button>
                <a
                    href={`${hostname}/operations/export_sales_to_excel/${filterObj.subsidiaryId}/${filterObj.startDate}/${filterObj.endDate}/${filterObj.documentType}/`}
                    target="_blank"
                    title="Descargar EXCEL"
                    download
                    className="btn-green px-5 py-3 inline-flex items-center gap-2 m-0"
                >
                    <Excel />
                    Descarga para excel
                </a>
            </div>
        </div>
    );
}

export default SaleFilter;
