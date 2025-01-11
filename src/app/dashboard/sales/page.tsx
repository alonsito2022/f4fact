"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import SaleList from "./SaleList";
import SaleFilter from "./SaleFilter";
import { gql, useLazyQuery } from "@apollo/client";
import { useSession } from "next-auth/react";
import { IUser } from "@/app/types";
const today = new Date().toISOString().split('T')[0];
const initialStateFilterObj = {
    startDate: today,
    endDate: today,
    clientId: 0,
    supplierName: "",
}
const SALES_QUERY = gql`
    query ($clientId: Int!, $startDate: Date!, $endDate: Date!) {
        allSales(clientId: $clientId, startDate: $startDate, endDate: $endDate) {
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
            totalPayed
            operationStatus
            operationStatusReadable
            sendClient
            
            linkXml
            linkXmlLow
            linkCdr
            linkCdrLow
            sunatStatus
            sunatDescription
            sunatDescriptionLow
            client{
                names
            }
        }
    }
`;

function SalePage() {
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
    
        const [salesQuery, { loading: filteredPurchasesLoading, error: filteredPurchasesError, data: filteredPurchasesData }] = useLazyQuery(SALES_QUERY, {
            context: getAuthContext(),
            variables: {
                clientId: filterObj.clientId, startDate: filterObj.startDate, endDate: filterObj.endDate,
            },
            fetchPolicy: 'network-only',
            onCompleted(data) {
                console.log("object", data, getAuthContext())
            },
            onError: (err) => console.error("Error in purchases:", err),
          });
    return (
        <>
            <div className="p-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 lg:mt-1.5 dark:bg-gray-800 dark:border-gray-700">
                <div className="w-full mb-1">
                    <Breadcrumb section={"Ventas"} article={"Ventas"} />
                    <SaleFilter setFilterObj={setFilterObj} filterObj={filterObj} salesQuery={salesQuery} filteredPurchasesLoading={filteredPurchasesLoading} jwtToken={jwtToken}/>

                </div>
            </div>


            <div className="flex flex-col">
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden shadow">
                            
                        {filteredPurchasesError ? <div>{filteredPurchasesError.message}</div> : <SaleList filteredPurchasesData={filteredPurchasesData} />}

                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SalePage
