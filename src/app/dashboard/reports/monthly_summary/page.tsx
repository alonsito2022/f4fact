"use client";
import React, { useMemo, useEffect } from "react";
import MonthlySummaryFilter from "./MonthlySummaryFilter";
import MonthlySummaryList from "./MonthlySummaryList";
import { gql, useLazyQuery } from "@apollo/client";
import { initFlowbite } from "flowbite";
import { useAuth } from "@/components/providers/AuthProvider";

const MONTHLY_SUMMARY_QUERY = gql`
    query GetMonthlySalesAndPurchases($subsidiaryId: Int) {
        monthlySalesAndPurchases(subsidiaryId: $subsidiaryId) {
            currentMonthSales {
                invoices {
                    quantity
                    total
                }
                tickets {
                    quantity
                    total
                }
                exitNotes {
                    quantity
                    total
                }
            }
            currentMonthPurchases {
                invoices {
                    quantity
                    total
                }
                tickets {
                    quantity
                    total
                }
            }
            lastMonthSales {
                invoices {
                    quantity
                    total
                }
                tickets {
                    quantity
                    total
                }
                exitNotes {
                    quantity
                    total
                }
            }
            currentMonthProductsSold {
                productId
                productName
                quantitySold
                totalSold
            }
        }
    }
`;

function MonthlySummaryPage() {
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
        monthlySummaryQuery,
        {
            loading: monthlySummaryLoading,
            error: monthlySummaryError,
            data: monthlySummaryData,
        },
    ] = useLazyQuery(MONTHLY_SUMMARY_QUERY, {
        context: authContext,
        fetchPolicy: "network-only",
        onCompleted: () => initFlowbite(),
        onError: (err) =>
            console.error("Error in monthly summary:", err, auth?.jwtToken),
    });

    // Ejecutar la consulta cuando se autentique el usuario
    useEffect(() => {
        if (auth?.status === "authenticated" && auth?.jwtToken) {
            monthlySummaryQuery({
                variables: {
                    subsidiaryId: Number(auth?.user?.subsidiaryId),
                },
            });
        }
    }, [
        auth?.status,
        auth?.jwtToken,
        auth?.user?.subsidiaryId,
        monthlySummaryQuery,
    ]);

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
            <div className=" container mx-auto pb-16">
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-1"></div>
                    <div className="col-span-10">
                        <MonthlySummaryFilter />
                        <div className="flex flex-col">
                            <div className="overflow-x-auto">
                                <div className="inline-block min-w-full align-middle">
                                    <div className="overflow-hidden shadow">
                                        {monthlySummaryLoading ? (
                                            <div className="p-4 text-center">
                                                <span className="loader"></span>
                                                Cargando resumen mensual...
                                            </div>
                                        ) : monthlySummaryError ? (
                                            <div className="p-4 text-red-500 text-center">
                                                {monthlySummaryError.message}
                                            </div>
                                        ) : (
                                            <MonthlySummaryList
                                                monthlySummaryData={
                                                    monthlySummaryData
                                                }
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MonthlySummaryPage;
