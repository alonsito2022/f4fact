"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import SaleList from "./SaleList";
import SaleFilter from "./SaleFilter";
import { gql, useLazyQuery } from "@apollo/client";
import { useSession } from "next-auth/react";
import { IUser } from "@/app/types";
import { initFlowbite } from "flowbite";
import WhatsAppModal from "./WhatsAppModal";
import { Modal, ModalOptions } from "flowbite";
const today = new Date().toISOString().split("T")[0];
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
    ) {
        allSales(
            subsidiaryId: $subsidiaryId
            clientId: $clientId
            startDate: $startDate
            endDate: $endDate
            documentType: $documentType
            page: $page
            pageSize: $pageSize
        ) {
            sales {
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
                sendClient

                linkXml
                linkXmlLow
                linkCdr
                linkCdrLow
                sunatStatus
                sunatDescription
                sunatDescriptionLow
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
            totalInvoices
            totalSalesTickets
            totalCreditNotes
            totalDebitNotes
            totalNumberOfPages
            totalNumberOfSales
        }
    }
`;
// FACTURA ELECTRÓNICA F002-187
// 10295018025 Camargo Aragón Internet Ymelda Fortunata
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
    const { data: session } = useSession();
    const [jwtToken, setJwtToken] = useState<string | null>(null);
    const [modalWhatsApp, setModalWhatsApp] = useState<Modal | any>(null);

    useEffect(() => {
        if (session?.user) {
            const user = session.user as IUser;
            setJwtToken((prev) => prev || (user.accessToken as string)); // Solo cambia si es null
            setFilterObj((prev) => ({
                ...prev,
                subsidiaryId:
                    prev.subsidiaryId ||
                    (user.isSuperuser ? "0" : user.subsidiaryId!),
                isSuperuser: user.isSuperuser ?? false, // Asegura que isSuperuser sea siempre booleano
            }));
        }
    }, [session]);
    // useMemo para evitar que getAuthContext() genere un nuevo objeto en cada render
    const authContext = useMemo(
        () => ({
            headers: {
                "Content-Type": "application/json",
                Authorization: jwtToken ? `JWT ${jwtToken}` : "",
            },
        }),
        [jwtToken]
    );

    // const getAuthContext = () => ({
    //     headers: {
    //         "Content-Type": "application/json",
    //         Authorization: jwtToken ? `JWT ${jwtToken}` : "",
    //     },
    // });
    // Si tienes habilitada la política de network-only, Apollo Client siempre intentará obtener datos frescos de la API cuando el componente se vuelva a montar.
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
        onCompleted(data) {
            // console.log("object", data, authContext);
            initFlowbite();
        },
        onError: (err) => console.error("Error in sales:", err),
    });
    return (
        <>
            <div className="p-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                <div className="w-full">
                    <Breadcrumb section={"Ventas"} article={"Ventas"} />
                    <SaleFilter
                        setFilterObj={setFilterObj}
                        filterObj={filterObj}
                        salesQuery={salesQuery}
                        filteredSalesLoading={filteredSalesLoading}
                        jwtToken={jwtToken}
                    />
                </div>
            </div>

            <div className="flex flex-col">
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden shadow">
                            {filteredSalesError ? (
                                <div className="p-4 text-red-500 text-center">
                                    {filteredSalesError.message}
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
                                />
                            )}
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

export default SalePage;
