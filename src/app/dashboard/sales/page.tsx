"use client";
import { useState, useMemo, useEffect } from "react";
import SaleList from "./SaleList";
import SaleFilter from "./SaleFilter";
import { gql, useLazyQuery } from "@apollo/client";
import { initFlowbite } from "flowbite";
import WhatsAppModal from "./WhatsAppModal";
import { Modal } from "flowbite";
import { useAuth } from "@/components/providers/AuthProvider";
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
    clientId: 0,
    subsidiaryId: "",
    subsidiaryName: "",
    supplierName: "",
    documentType: "NA",
    page: 1,
    pageSize: 50,
    isSuperuser: false,
    reportType: "",
    serial: "",
    correlative: "",
    userName: "",
    userId: "",
    onlyDraft: false,
};
const SALES_QUERY = gql`
    query (
        $subsidiaryId: Int!
        $clientId: Int!
        $startDate: Date!
        $endDate: Date!
        $documentType: String!
        $page: Int!
        $pageSize: Int!
        $serial: String
        $correlative: Int
        $userId: Int
        $onlyDraft: Boolean
    ) {
        allSales(
            subsidiaryId: $subsidiaryId
            clientId: $clientId
            startDate: $startDate
            endDate: $endDate
            documentType: $documentType
            page: $page
            pageSize: $pageSize
            serial: $serial
            correlative: $correlative
            userId: $userId
            onlyDraft: $onlyDraft
        ) {
            sales {
                id
                emitDate
                emitTime
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
                user {
                    id
                    fullName
                }
                subsidiary {
                    companyName
                    company {
                        doc
                        showUser
                    }
                }
                creditNoteReferences
            }
            totalInvoices
            totalSalesTickets
            totalCreditNotes
            totalDebitNotes
            totalNumberOfPages
            totalNumberOfSales
        }
    }
`;

const initialStateCpe = {
    id: 0,
    documentTypeDisplay: "NA",
    serial: "",
    correlative: "",
    clientName: "",
    clientDoc: "",
};
function SalePage() {
    const [filterObj, setFilterObj] = useState(initialStateFilterObj);
    const [cpe, setCpe] = useState(initialStateCpe);
    const [modalWhatsApp, setModalWhatsApp] = useState<Modal | null>(null);

    // Obtenemos sesión y token desde el AuthProvider
    const auth = useAuth();

    // Memorizamos el contexto de autorización para evitar recreaciones innecesarias
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
        salesQuery,
        {
            loading: filteredSalesLoading,
            error: filteredSalesError,
            data: filteredSalesData,
        },
    ] = useLazyQuery(SALES_QUERY, {
        context: authContext,
        fetchPolicy: "network-only",
        onCompleted: () => initFlowbite(),
        onError: (err) => console.error("Error in sales:", err, auth?.jwtToken),
    });

    useEffect(() => {
        if (auth?.status === "authenticated" && auth?.jwtToken) {
            salesQuery({
                variables: {
                    subsidiaryId: auth?.user?.isSuperuser
                        ? Number(filterObj.subsidiaryId)
                        : Number(auth?.user?.subsidiaryId),
                    clientId: Number(filterObj.clientId),
                    startDate: filterObj.startDate,
                    endDate: filterObj.endDate,
                    documentType: filterObj.documentType,
                    page: Number(filterObj.page),
                    pageSize: Number(filterObj.pageSize),
                    onlyDraft: filterObj.onlyDraft || undefined,
                    // serial: String(filterObj.serial),
                    // correlative: Number(filterObj.correlative),
                },
            });
        }
    }, [auth?.status, auth?.jwtToken]);

    // Si la sesión aún está cargando, muestra un spinner en lugar de "Cargando..."
    if (auth?.status === "loading") {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-800 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
                        <div className="w-10 h-10 border-4 border-transparent border-t-blue-600 rounded-full animate-spin absolute top-0 left-0"></div>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Cargando sesión...</span>
                </div>
            </div>
        );
    }
    // Si la sesión no está autenticada, muestra un mensaje de error o redirige
    if (auth?.status === "unauthenticated") {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-800 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">No autorizado</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Inicie sesión para acceder a esta página</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-800">
            <div className="container mx-auto pb-16">
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-1"></div>
                    <div className="col-span-10">
                        <SaleFilter
                            setFilterObj={setFilterObj}
                            filterObj={filterObj}
                            salesQuery={salesQuery}
                            filteredSalesLoading={filteredSalesLoading}
                            auth={auth}
                            filteredSalesData={filteredSalesData}
                        />
                        <div className="flex flex-col">
                            <div className="overflow-x-auto">
                                <div className="inline-block min-w-full align-middle">
                                    <div className="overflow-hidden">
                                        {filteredSalesLoading ? (
                                            <div className="p-8">
                                                <div className="flex items-center justify-center mb-6">
                                                    <div className="relative">
                                                        <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
                                                        <div className="w-12 h-12 border-4 border-transparent border-t-blue-600 rounded-full animate-spin absolute top-0 left-0"></div>
                                                    </div>
                                                    <span className="ml-4 text-sm font-medium text-gray-600 dark:text-gray-300">
                                                        Cargando comprobantes...
                                                    </span>
                                                </div>
                                                <div className="space-y-3">
                                                    {Array.from({ length: 8 }).map((_, i) => (
                                                        <div key={i} className="flex items-center gap-4 animate-pulse">
                                                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                                                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                                                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                                                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-10"></div>
                                                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                                                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : filteredSalesError ? (
                                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                                <div className="w-16 h-16 mb-4 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                                                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                                    </svg>
                                                </div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                                    Error al cargar los datos
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm">
                                                    {filteredSalesError.message || "Ocurrió un error inesperado. Intente recargar la página."}
                                                </p>
                                            </div>
                                        ) : (
                                            <SaleList
                                                filteredSalesData={filteredSalesData}
                                                setFilterObj={setFilterObj}
                                                filterObj={filterObj}
                                                modalWhatsApp={modalWhatsApp}
                                                cpe={cpe}
                                                setCpe={setCpe}
                                                salesQuery={salesQuery}
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
            <WhatsAppModal
                modalWhatsApp={modalWhatsApp}
                setModalWhatsApp={setModalWhatsApp}
                cpe={cpe}
                setCpe={setCpe}
                initialStateCpe={initialStateCpe}
                authContext={authContext}
            />
        </div>
    );
}

export default SalePage;
