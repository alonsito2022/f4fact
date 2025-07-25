"use client";
import { useEffect, useState } from "react";
import PaymentBalanceComponent from "@/app/dashboard/payment-balance/PaymentBalanceComponent";
import { gql, useQuery } from "@apollo/client";
import { useAuth } from "@/components/providers/AuthProvider";

const BALANCE_PAYMENT_QUERY = gql`
    query BalancePayment($subsidiaryId: Int!) {
        balancePayment(subsidiaryId: $subsidiaryId) {
            totalPending
            lastUpdate
            documents {
                id
                date
                description
                total
                status
                documentType
                serial
                correlative
            }
            payments {
                id
                date
                description
                total
                wayPay
            }
        }
    }
`;
export default function PaymentBalancePage() {
    const auth = useAuth();
    const subsidiaryId = Number(auth?.user?.subsidiaryId) || 0;

    // Si necesitas headers de autenticación:
    const context = {
        headers: {
            "Content-Type": "application/json",
            Authorization: auth?.jwtToken ? `JWT ${auth.jwtToken}` : "",
        },
    };
    const { data, loading, error } = useQuery(BALANCE_PAYMENT_QUERY, {
        variables: { subsidiaryId },
        context,
        fetchPolicy: "network-only",
        skip: !subsidiaryId,
    });
    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-800 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-800 flex items-center justify-center">
                <p className="text-center text-red-500">{error.message}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-800">
            <div className="container mx-auto py-8 px-4">
                <PaymentBalanceComponent
                    totalPending={data?.balancePayment?.totalPending}
                    lastUpdate={data?.balancePayment?.lastUpdate}
                    documents={data?.balancePayment?.documents}
                    payments={data?.balancePayment?.payments}
                />
            </div>
        </div>
    );
}
