"use client";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import PaymentApprovalList from "./PaymentApprovalList";
import PaymentApprovalFilter from "./PaymentApprovalFilter";
import Breadcrumb from "@/components/Breadcrumb";
import { gql, useLazyQuery, useQuery } from "@apollo/client";
import {
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
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
const PENDING_PAYMENTS_QUERY = gql`
    query GetPendingPayments(
        $subsidiaryId: Int!
        $status: String
        $startDate: Date
        $endDate: Date
    ) {
        pendingPayments(
            subsidiaryId: $subsidiaryId
            status: $status
            startDate: $startDate
            endDate: $endDate
        ) {
            id
            amount
            paymentMethod
            paymentMethodName
            status
            statusName
            createdAt
            description
            reference
            attachment
            attachmentTypeName
            attachmentDescription
            user {
                fullName
                email
                subsidiary {
                    companyName
                    serial
                }
            }
            operation {
                serial
                correlative
                documentType
                documentTypeReadable
                client {
                    names
                }
                totalAmount
            }
        }
    }
`;
const initialStateFilterObj = {
    startDate: today,
    endDate: today,
    status: "PENDING",
    paymentMethod: "",
    subsidiaryId: "",
};
export default function PaymentApprovalPage() {
    const auth = useAuth();
    const [filterObj, setFilterObj] = useState(initialStateFilterObj);

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
        getPendingPayments,
        {
            loading: pendingPaymentsLoading,
            error: pendingPaymentsError,
            data: pendingPaymentsData,
        },
    ] = useLazyQuery(PENDING_PAYMENTS_QUERY, {
        context: authContext,
        fetchPolicy: "network-only",
        onCompleted: () => initFlowbite(),
        // skip: !auth?.jwtToken || !auth?.user?.subsidiaryId,
        onError: (err) =>
            console.error("Error fetching pending payments:", err),
    });
    useEffect(() => {
        if (auth?.status === "authenticated" && auth?.jwtToken) {
            getPendingPayments({
                variables: {
                    subsidiaryId: Number(auth?.user?.subsidiaryId) || 0,
                    status:
                        filterObj.status === "ALL" ? null : filterObj.status,
                    startDate: filterObj.startDate || null,
                    endDate: filterObj.endDate || null,
                },
            });
            console.log("auth?.user?", auth?.user);
        }
    }, [auth?.status, auth?.jwtToken]);
    // Solo superusuarios pueden acceder
    if (!auth?.user?.isSuperuser) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 text-red-500 mb-4">
                        <XCircleIcon />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Acceso Denegado
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        No tienes permisos para acceder a esta página
                    </p>
                </div>
            </div>
        );
    }

    // Calcular estadísticas
    // const stats = useMemo(() => {
    //     if (!pendingPaymentsData?.pendingPayments)
    //         return {
    //             pending: 0,
    //             approved: 0,
    //             rejected: 0,
    //             totalAmount: 0,
    //         };

    //     const payments = pendingPaymentsData.pendingPayments;
    //     return {
    //         pending: payments.filter((p: any) => p.status === "PENDING").length,
    //         approved: payments.filter((p: any) => p.status === "APPROVED")
    //             .length,
    //         rejected: payments.filter((p: any) => p.status === "REJECTED")
    //             .length,
    //         totalAmount: payments
    //             .filter((p: any) => p.status === "PENDING")
    //             .reduce((sum: number, p: any) => sum + Number(p.amount), 0),
    //     };
    // }, [pendingPaymentsData]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header con Breadcrumb */}
            <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-6">
                        <div className="mt-2">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Aprobación de Pagos
                            </h1>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Gestiona y aprueba los pagos pendientes de la
                                empresa
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Estadísticas */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filtros y Lista */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
                    <PaymentApprovalFilter
                        filterObj={filterObj}
                        setFilterObj={setFilterObj}
                        getPendingPayments={getPendingPayments}
                        auth={auth}
                        initialStateFilterObj={initialStateFilterObj}
                    />
                    <PaymentApprovalList
                        filterObj={filterObj}
                        authContext={authContext}
                        currentUserId={auth?.user?.id}
                        pendingPaymentsData={pendingPaymentsData}
                        pendingPaymentsLoading={pendingPaymentsLoading}
                        pendingPaymentsError={pendingPaymentsError}
                        getPendingPayments={getPendingPayments}
                    />
                </div>
            </div>
        </div>
    );
}
