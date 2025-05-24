"use client";
import { useState, useMemo, use, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import SaleList from "./SaleList";
import SaleFilter from "./SaleFilter";
import { gql, useLazyQuery } from "@apollo/client";
import { initFlowbite } from "flowbite";
import WhatsAppModal from "./WhatsAppModal";
import { Modal } from "flowbite";
import { useAuth } from "@/components/providers/AuthProvider";
// import { useSession } from "next-auth/react";
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
          // subsidiaryId: Number(filterObj.subsidiaryId),
          subsidiaryId: auth?.user?.isSuperuser
            ? Number(filterObj.subsidiaryId)
            : Number(auth?.user?.subsidiaryId),
          clientId: Number(filterObj.clientId),
          startDate: filterObj.startDate,
          endDate: filterObj.endDate,
          documentType: filterObj.documentType,
          page: Number(filterObj.page),
          pageSize: Number(filterObj.pageSize),
          // serial: String(filterObj.serial),
          // correlative: Number(filterObj.correlative),
        },
      });
    }
  }, [auth?.status, auth?.jwtToken]);

  // useEffect(() => {
  //     if (auth?.status === "authenticated" && auth?.jwtToken)
  //         setFilterObj({
  //             ...filterObj,
  //             subsidiaryId:
  //                 auth?.user?.isSuperuser === true
  //                     ? "0"
  //                     : String(auth?.user?.subsidiary?.id),
  //         });
  // }, [auth?.status, auth?.jwtToken]);

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
            />
            <div className="flex flex-col">
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                  <div className="overflow-hidden shadow">
                    {filteredSalesLoading ? (
                      <div className="p-4 text-center">
                        <span className="loader"></span>
                        Cargando ventas...
                      </div>
                    ) : filteredSalesError ? (
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
