"use client";
import { ChangeEvent, FormEvent, useState, useEffect, useMemo } from "react";
import Add from "@/components/icons/Add";
import Search from "@/components/icons/Search";
import Filter from "@/components/icons/Filter";
import { useRouter } from "next/navigation";
import { gql, useQuery } from "@apollo/client";
import { ISubsidiary, ISupplier } from "@/app/types";
// import { initFlowbite } from "flowbite";
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

const SUBSIDIARIES_QUERY = gql`
    query {
        subsidiaries {
            id
            address
            serial
            company {
                id
                businessName
            }
        }
    }
`;

function SaleFilter({
    setFilterObj,
    filterObj,
    salesQuery,
    filteredSaleLoading,
    auth,
}: any) {
    const router = useRouter();
    const [hostname, setHostname] = useState("");

    useEffect(() => {
        if (hostname == "") {
            setHostname(`${process.env.NEXT_PUBLIC_BASE_API}`);
        }
    }, [hostname]);
    const handleClickButton = async () => {
        // Reinicializa la página a 1
        setFilterObj({
            ...filterObj,
            page: 1,
        });

        // Llama a salesQuery con la página reinicializada
        salesQuery({
            variables: {
                subsidiaryId: Number(filterObj.subsidiaryId),
                clientId: Number(filterObj.clientId),
                startDate: filterObj.startDate,
                endDate: filterObj.endDate,
                documentType: filterObj.documentType,
                page: 1, // Asegúrate de pasar la página como 1 aquí también
                pageSize: Number(filterObj.pageSize),
            },
        });
        // initFlowbite();
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
        } else if (
            name === "subsidiaryName" &&
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
                        subsidiaryId: Number(selectedId),
                        subsidiaryName: value,
                    });
                } else {
                    setFilterObj({
                        ...filterObj,
                        subsidiaryId: 0,
                        subsidiaryName: value,
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
            Authorization: auth?.jwtToken ? `JWT ${auth?.jwtToken}` : "",
        },
    });
    const {
        loading: suppliersLoading,
        error: suppliersError,
        data: suppliersData,
    } = useQuery(SUPPLIERS_QUERY, {
        context: getAuthContext(),
        skip: !auth?.jwtToken,
    });
    const {
        loading: subsidiariesLoading,
        error: subsidiariesError,
        data: subsidiariesData,
    } = useQuery(SUBSIDIARIES_QUERY, {
        context: getAuthContext(),
        skip: !auth?.jwtToken,
    });
    useEffect(() => {
        if (auth?.user?.subsidiaryId && subsidiariesData?.subsidiaries) {
            const subsidiaryFound = subsidiariesData?.subsidiaries.find(
                (subsidiary: ISubsidiary) =>
                    Number(subsidiary.id) === Number(auth?.user?.subsidiaryId)
            );
            setFilterObj({
                ...filterObj,
                subsidiaryId: auth?.user?.subsidiaryId,
                subsidiaryName:
                    subsidiaryFound?.company?.businessName +
                    " " +
                    subsidiaryFound?.serial,
            });
        }
    }, [auth?.user?.subsidiaryId, subsidiariesData?.subsidiaries]);
    return (
        <div className="grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 items-start  rounded-lg shadow-sm">
            <select
                value={filterObj.documentType}
                name="documentType"
                onChange={handleInputChange}
                className="filter-form-control w-full justify-self-start rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            >
                <option value={"NA"}>📄 Filtrar por tipo de Doc.</option>
                <option value={"01"}>🧾 FACTURA ELECTRÓNICA</option>
                <option value={"03"}>🧾 BOLETA DE VENTA ELECTRÓNICA</option>
                <option value={"07"}>📝 NOTA DE CRÉDITO ELECTRÓNICA</option>
            </select>
            {auth?.user?.isSuperuser ? (
                <>
                    <input
                        type="search"
                        name="subsidiaryName"
                        onChange={handleInputChange}
                        value={filterObj.subsidiaryName}
                        onFocus={(e) => e.target.select()}
                        autoComplete="off"
                        disabled={subsidiariesLoading}
                        className="filter-form-control w-full justify-self-start rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        list="subsidiaryList"
                        placeholder="🏢 Buscar por sede"
                    />
                    <datalist id="subsidiaryList">
                        {subsidiariesData?.subsidiaries?.map(
                            (n: ISubsidiary, index: number) => (
                                <option
                                    key={index}
                                    data-key={n.id}
                                    value={`${n.company?.businessName} ${n.serial}`}
                                />
                            )
                        )}
                    </datalist>
                </>
            ) : null}
            <input
                type="date"
                name="startDate"
                onChange={handleInputChange}
                value={filterObj.startDate}
                className="filter-form-control w-full justify-self-start rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
                type="date"
                name="endDate"
                onChange={handleInputChange}
                value={filterObj.endDate}
                className="filter-form-control w-full justify-self-start rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
                id="btn-search"
                type="button"
                className="btn-blue px-5 py-3 flex items-center justify-center gap-2 w-full rounded-lg hover:opacity-90 transition-all duration-200 shadow-sm"
                onClick={handleClickButton}
                disabled={filteredSaleLoading}
            >
                <Filter />
                Filtrar
            </button>
            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 col-span-full">
                <a
                    href={`${hostname}/operations/export_sales_to_excel/${filterObj.subsidiaryId}/${filterObj.startDate}/${filterObj.endDate}/${filterObj.documentType}/`}
                    target="_blank"
                    title="Descargar EXCEL"
                    download
                    className="btn-green px-5 py-3 flex items-center justify-center gap-2 w-full m-0 rounded-lg hover:opacity-90 transition-all duration-200 shadow-sm"
                >
                    <Excel />
                    Exportar a Excel
                </a>
                <button
                    type="button"
                    className="btn-blue px-5 py-3 flex items-center justify-center gap-2 w-full rounded-lg hover:opacity-90 transition-all duration-200 shadow-sm"
                    onClick={() => router.push("/dashboard/sales/new")}
                >
                    <Add />
                    Nueva venta
                </button>
            </div>
        </div>
    );
}

export default SaleFilter;
