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
    startDate: today,
    endDate: today,
    supplierId: 0,
    supplierName: "",
}

const PURCHASES_QUERY = gql`
    query ($supplierId: Int!, $startDate: Date!, $endDate: Date!) {
        allPurchases(supplierId: $supplierId, startDate: $startDate, endDate: $endDate) {
            id
            emitDate
            operationDate
            currencyType
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
            supplier{
                names
            }
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

    const [purchasesQuery, { loading: filteredPurchasesLoading, error: filteredPurchasesError, data: filteredPurchasesData }] = useLazyQuery(PURCHASES_QUERY, {
        context: getAuthContext(),
        variables: {
            supplierId: filterObj.supplierId, startDate: filterObj.startDate, endDate: filterObj.endDate,
        },
        fetchPolicy: 'network-only',
        onCompleted(data) {
            console.log("object", data)
        },
        onError: (err) => console.error("Error in purchases:", err),
      });

// useEffect(() => {
//     console.log("jwtToken", jwtToken)
//     if(filterObj.startDate !== null && filterObj.endDate !== null && jwtToken) purchasesQuery();
// }, []);

    return (
        <>
            <div className="p-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 lg:mt-1.5 dark:bg-gray-800 dark:border-gray-700">
                <div className="w-full mb-1">
                    <Breadcrumb section={"Compras"} article={"Compras"} />
                    <PurchaseFilter setFilterObj={setFilterObj} filterObj={filterObj} purchasesQuery={purchasesQuery} filteredPurchasesLoading={filteredPurchasesLoading} jwtToken={jwtToken}/>
                </div>
            </div>

            <div className="flex flex-col">
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden shadow">
                            
                            {filteredPurchasesError ? <div>{filteredPurchasesError.message}</div> : <PurchaseList filteredPurchasesData={filteredPurchasesData} />}
                            
                            
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default PurchasePage
