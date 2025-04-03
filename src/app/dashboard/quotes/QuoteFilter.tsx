import { ChangeEvent, FormEvent, useState, useEffect, useMemo } from "react";
import Add from "@/components/icons/Add";
import Filter from "@/components/icons/Filter";
import { useRouter } from "next/navigation";
import { gql, useQuery } from "@apollo/client";
import { ISubsidiary, ISupplier } from "@/app/types";
import Excel from "@/components/icons/Excel";

import { Modal } from "flowbite";
import ExcelModal from "../sales/ExcelModal";
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

function QuoteFilter({
    setFilterObj,
    filterObj,
    quotesQuery,
    quotesLoading,
    auth,
}: any) {
    const router = useRouter();
    const [modalExcel, setModalExcel] = useState<Modal | null>(null);

    const handleClickButton = async () => {
        // Reinicializa la página a 1
        setFilterObj({
            ...filterObj,
            page: 1,
        });

        // Llama a quotesQuery con la página reinicializada
        quotesQuery({
            variables: {
                subsidiaryId: Number(filterObj.subsidiaryId),
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
        loading: subsidiariesLoading,
        error: subsidiariesError,
        data: subsidiariesData,
    } = useQuery(SUBSIDIARIES_QUERY, {
        context: getAuthContext(),
        skip: !auth?.jwtToken,
    });
    return (
        <>
            <div className="grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 items-start  rounded-lg shadow-sm">
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
                    disabled={quotesLoading}
                >
                    <Filter />
                    Filtrar
                </button>
                <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 col-span-full">
                    <button
                        type="button"
                        onClick={() => modalExcel?.show()}
                        className="btn-green px-5 py-3 flex items-center justify-center gap-2 w-full m-0 rounded-lg hover:opacity-90 transition-all duration-200 shadow-sm"
                    >
                        <Excel />
                        Exportar a Excel
                    </button>

                    <button
                        type="button"
                        className="btn-blue px-5 py-3 flex items-center justify-center gap-2 w-full rounded-lg hover:opacity-90 transition-all duration-200 shadow-sm"
                        onClick={() => router.push("/dashboard/quotes/new")}
                    >
                        <Add />
                        Nueva Cotización
                    </button>
                </div>
            </div>
            <ExcelModal
                modalExcel={modalExcel}
                setModalExcel={setModalExcel}
                setFilterObj={setFilterObj}
                filterObj={filterObj}
            />
        </>
    );
}

export default QuoteFilter;
