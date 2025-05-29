"use client";
import { useState, useMemo, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import PurchaseList from "./PurchaseList";
import PurchaseFilter from "./PurchaseFilter";
import { gql, useLazyQuery } from "@apollo/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { IUser } from "@/app/types";

const limaDate = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Lima" })
);
const today =
    limaDate.getFullYear() +
    "-" +
    String(limaDate.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(limaDate.getDate()).padStart(2, "0");

const initialStateFilterObj = {
    startDate: today,
    endDate: today,
    supplierId: 0,
    subsidiaryId: "",
    subsidiaryName: "",
    supplierName: "",
    documentType: "NA",
    page: 1,
    pageSize: 50,
    serial: "",
    correlative: "",
};

const PURCHASES_QUERY = gql`
    query getPurchases(
        $subsidiaryId: Int!
        $supplierId: Int!
        $startDate: Date!
        $endDate: Date!
        $documentType: String!
        $page: Int!
        $pageSize: Int!
        $serial: String
        $correlative: Int
    ) {
        allPurchases(
            subsidiaryId: $subsidiaryId
            supplierId: $supplierId
            startDate: $startDate
            endDate: $endDate
            documentType: $documentType
            page: $page
            pageSize: $pageSize
            serial: $serial
            correlative: $correlative
        ) {
            purchases {
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
                linkXml
                linkXmlLow
                linkCdr
                linkCdrLow
                sunatStatus
                sunatDescription
                sunatDescriptionLow
                codeHash
                supplier {
                    names
                    documentNumber
                }
                subsidiary {
                    companyName
                    company {
                        doc
                    }
                }
                creditNoteReferences
            }
            totalInvoices
            totalPurchasesTickets
            totalCreditNotes
            totalDebitNotes
            totalNumberOfPages
            totalNumberOfPurchases
        }
    }
`;

function PurchasePage() {
    const [filterObj, setFilterObj] = useState(initialStateFilterObj);
    const auth = useAuth();

    const authContext = useMemo(
        () => ({
            headers: {
                "Content-Type": "application/json",
                Authorization: auth?.jwtToken ? `JWT ${auth.jwtToken}` : "",
            },
        }),
        [auth?.jwtToken]
    );

    const [
        purchasesQuery,
        {
            loading: filteredPurchasesLoading,
            error: filteredPurchasesError,
            data: filteredPurchasesData,
        },
    ] = useLazyQuery(PURCHASES_QUERY, {
        context: authContext,
        fetchPolicy: "network-only",
        onError: (err) =>
            console.error("Error in purchases:", err, auth?.jwtToken),
    });

    useEffect(() => {
        if (auth?.status === "authenticated" && auth?.jwtToken) {
            const variables = {
                subsidiaryId: auth?.user?.isSuperuser
                    ? Number(filterObj.subsidiaryId)
                    : Number(auth?.user?.subsidiaryId),
                supplierId: Number(filterObj.supplierId),
                startDate: filterObj.startDate,
                endDate: filterObj.endDate,
                documentType: filterObj.documentType,
                page: Number(filterObj.page),
                pageSize: Number(filterObj.pageSize),
            };
            purchasesQuery({
                variables: variables,
            });
        }
    }, [auth?.status, auth?.jwtToken]);

    if (auth?.status === "loading") {
        return <p className="text-center">Cargando sesión...</p>;
    }
    if (auth?.status === "unauthenticated") {
        return <p className="text-center text-red-500">No autorizado</p>;
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-800">
            <div className="container mx-auto pb-16">
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-1"></div>
                    <div className="col-span-10">
                        <PurchaseFilter
                            setFilterObj={setFilterObj}
                            filterObj={filterObj}
                            purchasesQuery={purchasesQuery}
                            filteredPurchasesLoading={filteredPurchasesLoading}
                            auth={auth}
                        />
                        <div className="flex flex-col">
                            <div className="overflow-x-auto">
                                <div className="inline-block min-w-full align-middle">
                                    <div className="overflow-hidden shadow">
                                        {filteredPurchasesLoading ? (
                                            <div className="p-4 text-center">
                                                <span className="loader"></span>
                                                Cargando compras...
                                            </div>
                                        ) : filteredPurchasesError ? (
                                            <div className="p-4 text-red-500 text-center">
                                                {filteredPurchasesError.message}
                                            </div>
                                        ) : (
                                            <PurchaseList
                                                filteredPurchasesData={
                                                    filteredPurchasesData
                                                }
                                                user={auth?.user}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-1"></div>
                </div>
            </div>
        </div>
    );
}

export default PurchasePage;
