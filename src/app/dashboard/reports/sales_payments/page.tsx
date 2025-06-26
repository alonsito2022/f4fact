"use client";
import React, { useEffect, useMemo, useState } from "react";
import SalePaymentFilter from "./SalePaymentFilter";
import SalePaymentList from "./SalePaymentList";
import { gql, useLazyQuery } from "@apollo/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { initFlowbite } from "flowbite";
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
    subsidiaryId: 0,
};
const SALES_PAYMENTS_QUERY = gql`
    query SalesPayments(
        $startDate: Date!
        $endDate: Date!
        $subsidiaryId: Int
    ) {
        allSalesPayments(
            startDate: $startDate
            endDate: $endDate
            subsidiaryId: $subsidiaryId
        ) {
            salesWithPayments {
                id
                documentTypeReadable
                serial
                correlative
                emitDate
                emitTime
                user {
                    fullName
                }
                totalAmount
                totalCash
                totalDebitCard
                totalCreditCard
                totalTransfer
                totalMonue
                totalCheck
                totalCoupon
                totalYape
                totalDue
                totalOther
            }
            totalCash
            totalDebitCard
            totalCreditCard
            totalTransfer
            totalMonue
            totalCheck
            totalCoupon
            totalYape
            totalDue
            totalOther
        }
    }
`;
function SalePaymentPage() {
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
        salesPaymentsQuery,
        {
            loading: filteredSalesPaymentsLoading,
            error: filteredSalesPaymentsError,
            data: filteredSalesPaymentsData,
        },
    ] = useLazyQuery(SALES_PAYMENTS_QUERY, {
        context: authContext,
        fetchPolicy: "network-only",
        onCompleted: () => initFlowbite(),
        onError: (err) => console.error("Error in sales:", err, auth?.jwtToken),
    });
    useEffect(() => {
        if (auth?.status === "authenticated" && auth?.jwtToken) {
            salesPaymentsQuery({
                variables: {
                    subsidiaryId: Number(auth?.user?.subsidiaryId),
                    startDate: filterObj.startDate,
                    endDate: filterObj.endDate,
                },
            });
            setFilterObj({
                ...filterObj,
                subsidiaryId: Number(auth?.user?.subsidiaryId),
            });
        }
    }, [auth?.status, auth?.jwtToken]);

    // Si la sesión aún está cargando, muestra un spinner en lugar de "Cargando..."
    if (auth?.status === "loading") {
        return <p className="text-center">Cargando sesión...</p>;
    }
    // Si la sesión no está autenticada, muestra un mensaje de error o redirige
    if (auth?.status === "unauthenticated") {
        return <p className="text-center text-red-500">No autorizado</p>;
    }
    return (
        <div className="min-h-screen bg-white dark:bg-gray-800">
            <div className="  pb-16">
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-1"></div>
                    <div className="col-span-10">
                        <SalePaymentFilter
                            setFilterObj={setFilterObj}
                            filterObj={filterObj}
                            salesPaymentsQuery={salesPaymentsQuery}
                            filteredSalesPaymentsLoading={
                                filteredSalesPaymentsLoading
                            }
                            filteredSalesPaymentsError={
                                filteredSalesPaymentsError
                            }
                            filteredSalesPaymentsData={
                                filteredSalesPaymentsData
                            }
                        />
                        <div className="flex flex-col">
                            <div className="overflow-x-auto">
                                <div className="inline-block min-w-full align-middle">
                                    <div className="overflow-hidden shadow">
                                        {filteredSalesPaymentsLoading ? (
                                            <div className="p-4 text-center">
                                                <span className="loader"></span>
                                                Cargando ventas...
                                            </div>
                                        ) : filteredSalesPaymentsError ? (
                                            <div className="p-4 text-red-500 text-center">
                                                {
                                                    filteredSalesPaymentsError.message
                                                }
                                            </div>
                                        ) : (
                                            <SalePaymentList
                                                filteredSalesPaymentsData={
                                                    filteredSalesPaymentsData
                                                }
                                                setFilterObj={setFilterObj}
                                                filterObj={filterObj}
                                                salesPaymentsQuery={
                                                    salesPaymentsQuery
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

export default SalePaymentPage;
