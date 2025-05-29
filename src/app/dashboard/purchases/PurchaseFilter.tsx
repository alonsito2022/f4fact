"use client";
import { ChangeEvent, FormEvent, useState, useEffect, useMemo } from "react";
import Add from "@/components/icons/Add";
import Search from "@/components/icons/Search";
import Filter from "@/components/icons/Filter";
import { useRouter } from "next/navigation";
import { gql, useLazyQuery, useQuery } from "@apollo/client";
import { ISupplier, ISubsidiary } from "@/app/types";
import Excel from "@/components/icons/Excel";
import ExcelModal from "../sales/ExcelModal";
import { Modal } from "flowbite";
import SearchInvoice from "../sales/SearchInvoice";

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

function PurchaseFilter({
    setFilterObj,
    filterObj,
    purchasesQuery,
    filteredPurchasesLoading,
    auth,
}: any) {
    const router = useRouter();
    const [modalExcel, setModalExcel] = useState<Modal | null>(null);
    const [modalSearchInvoice, setModalSearchInvoice] = useState<Modal | null>(
        null
    );

    const handleClickButton = async () => {
        // Reinicializa la página a 1
        setFilterObj({
            ...filterObj,
            page: 1,
        });

        // Llama a purchasesQuery con la página reinicializada
        purchasesQuery({
            variables: {
                subsidiaryId: Number(filterObj.subsidiaryId),
                supplierId: Number(filterObj.supplierId),
                startDate: filterObj.startDate,
                endDate: filterObj.endDate,
                documentType: filterObj.documentType,
                page: 1,
                pageSize: Number(filterObj.pageSize),
            },
        });
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
            }
        } else setFilterObj({ ...filterObj, [name]: value });
    };

    const getAuthContext = () => ({
        headers: {
            "Content-Type": "application/json",
            Authorization: auth?.jwtToken ? `JWT ${auth.jwtToken}` : "",
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
        <>
            <div className="w-full mb-1 mt-2">
                <div className="flex items-center gap-2 mb-3">
                    <h1 className="text-3xl font-light text-gray-800 dark:text-white">
                        Compras
                    </h1>
                    <button
                        type="button"
                        title="Crear nueva compra"
                        className="btn-blue h-8 px-3 flex items-center justify-center gap-1 rounded-full hover:opacity-90 transition-all duration-200 shadow-xs hover:shadow-sm text-sm"
                        onClick={() => router.push("/dashboard/purchases/new")}
                    >
                        <Add />
                        <span className="sm:inline">Agregar Nuevo</span>
                        <span className="sm:hidden">Nuevo</span>
                    </button>
                </div>
                <div className="grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 items-start rounded-lg shadow-sm">
                    <select
                        value={filterObj.documentType}
                        name="documentType"
                        onChange={handleInputChange}
                        className="filter-form-control h-10 w-full justify-self-start rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-[13px]"
                    >
                        <option value={"NA"} className="text-[13px]">
                            📄 Filtrar por tipo de Doc.
                        </option>
                        <option value={"01"} className="text-[13px]">
                            🧾 FACTURA ELECTRÓNICA
                        </option>
                        <option value={"03"} className="text-[13px]">
                            🧾 BOLETA DE VENTA ELECTRÓNICA
                        </option>
                        <option value={"07"} className="text-[13px]">
                            📝 NOTA DE CRÉDITO ELECTRÓNICA
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
                                className="filter-form-control h-10 w-full justify-self-start rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                list="supplierList"
                                placeholder="Buscar por proveedor"
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
                                className="filter-form-control h-10 w-full justify-self-start rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                        className="filter-form-control h-10 w-full justify-self-start rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />

                    <input
                        type="date"
                        name="endDate"
                        onChange={handleInputChange}
                        value={filterObj.endDate}
                        className="filter-form-control h-10 w-full justify-self-start rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />

                    <button
                        id="btn-search"
                        type="button"
                        className="btn-blue h-8 px-3 flex items-center justify-center gap-1 rounded-full hover:opacity-90 transition-all duration-200 shadow-sm hover:shadow-md text-sm"
                        onClick={handleClickButton}
                        disabled={filteredPurchasesLoading}
                    >
                        <Filter />
                        <span className="sm:inline">Filtrar</span>
                    </button>

                    <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 col-span-full">
                        <button
                            type="button"
                            onClick={() => modalExcel?.show()}
                            title="Exportar compras a Excel"
                            className="btn-green h-8 px-3 flex items-center justify-center gap-1 rounded-full hover:opacity-90 transition-all duration-200 shadow-sm hover:shadow-md text-sm"
                        >
                            <Excel />
                            <span className="sm:inline">Exportar a Excel</span>
                            <span className="sm:hidden">Excel</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => modalSearchInvoice?.show()}
                            title="Buscar documento por serie y número"
                            className="bg-orange-400 h-8 px-3 flex items-center justify-center gap-1 rounded-full hover:opacity-90 transition-all duration-200 shadow-sm hover:shadow-md text-sm text-white"
                        >
                            <Search />
                            <span className="sm:inline">Buscar Documento</span>
                            <span className="sm:hidden">Buscar</span>
                        </button>
                    </div>
                </div>
            </div>
            <ExcelModal
                modalExcel={modalExcel}
                setModalExcel={setModalExcel}
                setFilterObj={setFilterObj}
                filterObj={filterObj}
            />
            <SearchInvoice
                modalSearchInvoice={modalSearchInvoice}
                setModalSearchInvoice={setModalSearchInvoice}
                setFilterObj={setFilterObj}
                filterObj={filterObj}
                salesQuery={purchasesQuery}
                filteredSaleLoading={filteredPurchasesLoading}
            />
        </>
    );
}

export default PurchaseFilter;
