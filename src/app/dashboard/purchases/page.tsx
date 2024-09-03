"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import PurchaseList from "./PurchaseList";
import PurchaseFilter from "./PurchaseFilter";
const today = new Date().toISOString().split('T')[0];
const initialStateFilterObj = {
    criteria: "name",
    documentType: "",
    searchText: "",
    supplierName: "",
    startDate: today,
    endDate: today,
    supplierId: 0,
    lineId: 0,
    subLineId: 0,
    available: "A",
    activeType: "01",
    subjectPerception: false,
    typeAffectationId: 0,
    limit: 50
}
function PurchasePage() {
    const [filterObj, setFilterObj] = useState(initialStateFilterObj);

    return (
        <>
            <div className="p-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 lg:mt-1.5 dark:bg-gray-800 dark:border-gray-700">
                <div className="w-full mb-1">
                    <Breadcrumb section={"Compras"} article={"Compras"} />
                    <PurchaseFilter setFilterObj={setFilterObj} filterObj={filterObj}/>
                </div>
            </div>

            <div className="flex flex-col">
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden shadow">
                            <PurchaseList/>
                            
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default PurchasePage
