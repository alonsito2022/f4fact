"use client";
import { useState, useMemo, use, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import QuoteList from "./QuoteList";
import QuoteFilter from "./QuoteFilter";
import { gql, useLazyQuery } from "@apollo/client";
import { initFlowbite, Modal } from "flowbite";
import { useAuth } from "@/components/providers/AuthProvider";
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

const QUOTES_QUERY = gql`
    query (
        $subsidiaryId: Int!
        $startDate: Date!
        $endDate: Date!
        $documentType: String!
        $page: Int!
        $pageSize: Int!
    ) {
        allQuotes(
            subsidiaryId: $subsidiaryId
            startDate: $startDate
            endDate: $endDate
            documentType: $documentType
            page: $page
            pageSize: $pageSize
        ) {
            quotes {
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
                sendWhatsapp

                linkXml
                linkXmlLow
                linkCdr
                linkCdrLow
                sunatStatus
                sendSunat
                sunatDescription
                sunatDescriptionLow
                codeHash
                client {
                    names
                    documentNumber
                }
                subsidiary {
                    companyName
                    company {
                        doc
                    }
                }
            }
            totalNumberOfPages
            totalNumberOfSales
        }
    }
`;

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
function QuotePage() {
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
        quotesQuery,
        { loading: quotesLoading, error: quotesError, data: quotesData },
    ] = useLazyQuery(QUOTES_QUERY, {
        context: authContext,
        fetchPolicy: "network-only",
        onCompleted: () => initFlowbite(),
        onError: (err) => console.error("Error in quotes:", err),
    });
    useEffect(() => {
        if (auth?.status === "authenticated" && auth?.jwtToken) {
            quotesQuery({
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
    // Si la sesión aún está cargando, muestra un spinner en lugar de "Cargando..."
    if (auth?.status === "loading") {
        return <p className="text-center">Cargando sesión...</p>;
    }
    // Si la sesión no está autenticada, muestra un mensaje de error o redirige
    if (auth?.status === "unauthenticated") {
        return <p className="text-center text-red-500">No autorizado</p>;
    }
    return (
        <>
            <div className="p-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                <div className="w-full">
                    <Breadcrumb
                        section={"Cotizaciones"}
                        article={"Cotizaciones"}
                    />
                    <QuoteFilter
                        setFilterObj={setFilterObj}
                        filterObj={filterObj}
                        quotesQuery={quotesQuery}
                        quotesLoading={quotesLoading}
                        auth={auth}
                    />
                </div>
            </div>
            <div className="flex flex-col">
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden shadow">
                            <QuoteList
                                setFilterObj={setFilterObj}
                                filterObj={filterObj}
                                quotesQuery={quotesQuery}
                                quotesData={quotesData}
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
                authContext={authContext}
            />
        </>
    );
}

export default QuotePage;
