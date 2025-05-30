"use client";
import Breadcrumb from "@/components/Breadcrumb";
import React, { useMemo, useState } from "react";
import RetentionList from "./RetentionList";
import RetentionFilter from "./RetentionFilter";
import { useAuth } from "@/components/providers/AuthProvider";
import { gql, useLazyQuery } from "@apollo/client";
import { initFlowbite, Modal } from "flowbite";
import WhatsAppModal from "../sales/WhatsAppModal";

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
    subsidiaryId: "",
    subsidiaryName: "",
    documentType: "NA",
    page: 1,
    pageSize: 50,
};
const initialStateCpe = {
    id: 0,
    documentTypeDisplay: "NA",
    serial: "",
    correlative: "",
    clientName: "",
    clientDoc: "",
};
const RETENTIONS_QUERY = gql`
    query (
        $subsidiaryId: Int!
        $startDate: Date!
        $endDate: Date!
        $documentType: String!
        $page: Int!
        $pageSize: Int!
    ) {
        allRetentions(
            subsidiaryId: $subsidiaryId
            startDate: $startDate
            endDate: $endDate
            documentType: $documentType
            page: $page
            pageSize: $pageSize
        ) {
            retentions {
                id
                emitDate
                documentType
                serial
                correlative
                subsidiary {
                    companyName
                    company {
                        doc
                    }
                }
                sendWhatsapp
                sendClient
                linkXml
                linkCdr
                sunatStatus
                sunatDescription
                operationStatus
                operationStatusReadable
            }
            totalNumberOfPages
            totalNumberOfSales
        }
    }
`;

function RetentionPage() {
    const [filterObj, setFilterObj] = useState(initialStateFilterObj);

    const [cpe, setCpe] = useState(initialStateCpe);

    const [modalWhatsApp, setModalWhatsApp] = useState<Modal | null>(null);
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
        retentionsQuery,
        {
            loading: retentionsLoading,
            error: retentionsError,
            data: retentionsData,
        },
    ] = useLazyQuery(RETENTIONS_QUERY, {
        context: authContext,
        fetchPolicy: "network-only",
        onCompleted: () => initFlowbite(),
        onError: (err) => console.error("Error in retentions:", err),
    });

    if (auth?.status === "loading") {
        return <p className="text-center">Cargando sesión...</p>;
    }
    if (auth?.status === "unauthenticated") {
        return <p className="text-center text-red-500">No autorizado</p>;
    }
    return (
        <>
            <div className="p-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 lg:mt-1.5 dark:bg-gray-800 dark:border-gray-700">
                <div className="w-full mb-1">
                    <Breadcrumb
                        section={"Comprobantes de retención"}
                        article={"Comprobantes de retención"}
                    />
                    <RetentionFilter
                        setFilterObj={setFilterObj}
                        filterObj={filterObj}
                        retentionsQuery={retentionsQuery}
                        retentionsLoading={retentionsLoading}
                        authContext={authContext}
                        auth={auth}
                    />
                </div>
            </div>
            <div className="flex flex-col">
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden shadow">
                            <RetentionList
                                setFilterObj={setFilterObj}
                                filterObj={filterObj}
                                retentionsQuery={retentionsQuery}
                                retentionsData={retentionsData}
                                modalWhatsApp={modalWhatsApp}
                                cpe={cpe}
                                setCpe={setCpe}
                                user={auth?.user}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <WhatsAppModal
                modalWhatsApp={modalWhatsApp}
                setModalWhatsApp={setModalWhatsApp}
                cpe={cpe}
                setCpe={setCpe}
                initialStateCpe={initialStateCpe}
            />
        </>
    );
}

export default RetentionPage;
