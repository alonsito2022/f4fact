"use client";
import React, { useMemo, useState, useEffect } from "react";
import KardexProductFilter from "./KardexProductFilter";
import KardexProductList from "./KardexProductList";
import { useAuth } from "@/components/providers/AuthProvider";
import { initFlowbite } from "flowbite";
import { gql, useLazyQuery } from "@apollo/client";

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

const KARDEX_PRODUCTS_QUERY = gql`
    query GetProductStockMovement(
        $subsidiaryId: Int
        $startDate: Date
        $endDate: Date
    ) {
        productStockMovement(
            subsidiaryId: $subsidiaryId
            startDate: $startDate
            endDate: $endDate
        ) {
            productId
            productCode
            productName
            bought
            sold
            stock
        }
    }
`;

const KardexProductPage = () => {
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
        kardexProductsQuery,
        {
            loading: filteredKardexProductsLoading,
            error: filteredKardexProductsError,
            data: filteredKardexProductsData,
        },
    ] = useLazyQuery(KARDEX_PRODUCTS_QUERY, {
        context: authContext,
        fetchPolicy: "network-only",
        onCompleted: () => initFlowbite(),
        onError: (err) =>
            console.error("Error in kardex products:", err, auth?.jwtToken),
    });

    // Ejecutar la consulta cuando se autentique el usuario
    useEffect(() => {
        if (auth?.status === "authenticated" && auth?.jwtToken) {
            kardexProductsQuery({
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
    }, [auth?.status, auth?.jwtToken, auth?.user?.subsidiaryId]);

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
                        <KardexProductFilter
                            setFilterObj={setFilterObj}
                            filterObj={filterObj}
                            kardexProductsQuery={kardexProductsQuery}
                            filteredKardexProductsLoading={
                                filteredKardexProductsLoading
                            }
                            filteredKardexProductsError={
                                filteredKardexProductsError
                            }
                            filteredKardexProductsData={
                                filteredKardexProductsData
                            }
                            user={auth?.user}
                        />
                        <div className="flex flex-col">
                            <div className="overflow-x-auto">
                                <div className="inline-block min-w-full align-middle">
                                    <div className="overflow-hidden shadow">
                                        {filteredKardexProductsLoading ? (
                                            <div className="p-4 text-center">
                                                <span className="loader"></span>
                                                Cargando kardex de productos...
                                            </div>
                                        ) : filteredKardexProductsError ? (
                                            <div className="p-4 text-red-500 text-center">
                                                {
                                                    filteredKardexProductsError.message
                                                }
                                            </div>
                                        ) : (
                                            <KardexProductList
                                                filteredKardexProductsData={
                                                    filteredKardexProductsData
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
};

export default KardexProductPage;
