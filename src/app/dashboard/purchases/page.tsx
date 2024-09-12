"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import PurchaseList from "./PurchaseList";
import PurchaseFilter from "./PurchaseFilter";
import { gql, useLazyQuery } from "@apollo/client";
import { useSession } from "next-auth/react";
import { IUser } from "@/app/types";
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

const PURCHASES_QUERY = gql`
    query ($supplierId: Int!, $startDate: Date!, $endDate: Date!) {
        allPurchases(supplierId: $supplierId, startDate: $startDate, endDate: $endDate) {
            id
            emitDate
            documentType
            serial
            correlative
            totalAmount
            totalTaxed
            totalDiscount
            totalExonerated
            totalUnaffected
            totalFree
            totalIgv
            totalToPay
        }
    }
`;

function PurchasePage() {
    const [filterObj, setFilterObj] = useState(initialStateFilterObj);
    const { data: session } = useSession();
    const [jwtToken, setJwtToken] = useState<string | null>(null);
    const u = session?.user as IUser;

    useEffect(() => {
        if (session?.user) {
            const user = session.user as IUser;
            setJwtToken(user.accessToken as string);
        }
    }, [session]);

    const getAuthContext = () => ({
        headers: {
            "Content-Type": "application/json",
            "Authorization": jwtToken ? `JWT ${jwtToken}` : "",
        },
    });
    const [productsQuery, { loading: filteredProductsLoading, error: filteredProductsError, data: filteredProductsData }] = useLazyQuery(PURCHASES_QUERY, {
        context: getAuthContext(),
        variables: {
            criteria: filterObj.criteria, searchText: filterObj.searchText,
            available: filterObj.available, activeType: filterObj.activeType,
            subjectPerception: filterObj.subjectPerception, typeAffectationId: Number(filterObj.typeAffectationId), limit: Number(filterObj.limit)
        },
        onCompleted: (data) => {
        //   if (data.allProducts) {
        //     setProducts(data?.allProducts)
        //   }
        },
        onError: (err) => console.error("Error in products:", err),
      });
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
