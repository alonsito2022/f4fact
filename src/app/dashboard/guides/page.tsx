"use client";
import Breadcrumb from "@/components/Breadcrumb";
import React, { useEffect, useMemo, useState } from "react";
import GuideList from "./GuideList";
import GuideFilter from "./GuideFilter";
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
const GUIDES_QUERY = gql`
    query (
        $subsidiaryId: Int!
        $startDate: Date!
        $endDate: Date!
        $documentType: String!
        $page: Int!
        $pageSize: Int!
    ) {
        allGuides(
            subsidiaryId: $subsidiaryId
            startDate: $startDate
            endDate: $endDate
            documentType: $documentType
            page: $page
            pageSize: $pageSize
        ) {
            guides {
                id
                emitDate
                emitTime
                documentType
                serial
                correlative
                subsidiary {
                    companyName
                    company {
                        doc
                    }
                }
                client {
                    names
                    documentType
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

function GuidePage() {
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
        guidesQuery,
        { loading: guidesLoading, error: guidesError, data: guidesData },
    ] = useLazyQuery(GUIDES_QUERY, {
        context: authContext,
        fetchPolicy: "network-only",
        onCompleted: () => initFlowbite(),
        onError: (err) => console.error("Error in guides:", err),
    });

    useEffect(() => {
        if (auth?.status === "authenticated" && auth?.jwtToken) {
            guidesQuery({
                variables: {
                    subsidiaryId: auth?.user?.isSuperuser
                        ? Number(filterObj.subsidiaryId)
                        : Number(auth?.user?.subsidiaryId),
                    startDate: filterObj.startDate,
                    endDate: filterObj.endDate,
                    documentType: filterObj.documentType,
                    page: Number(filterObj.page),
                    pageSize: Number(filterObj.pageSize),
                },
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
                        <GuideFilter
                            setFilterObj={setFilterObj}
                            filterObj={filterObj}
                            guidesQuery={guidesQuery}
                            guidesLoading={guidesLoading}
                            authContext={authContext}
                            auth={auth}
                        />
                        <div className="flex flex-col">
                            <div className="overflow-x-auto">
                                <div className="inline-block min-w-full align-middle">
                                    <div className="overflow-hidden shadow">
                                        <GuideList
                                            setFilterObj={setFilterObj}
                                            filterObj={filterObj}
                                            guidesQuery={guidesQuery}
                                            guidesData={guidesData}
                                            modalWhatsApp={modalWhatsApp}
                                            cpe={cpe}
                                            setCpe={setCpe}
                                            user={auth?.user}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-1"></div>
                </div>
            </div>
            <WhatsAppModal
                modalWhatsApp={modalWhatsApp}
                setModalWhatsApp={setModalWhatsApp}
                cpe={cpe}
                setCpe={setCpe}
                initialStateCpe={initialStateCpe}
            />
        </div>
    );
}

export default GuidePage;
