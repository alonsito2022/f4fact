"use client";
import { useState, useMemo, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import ExitNoteList from "./ExitNoteList";
import ExitNoteFilter from "./ExitNoteFilter";
import { gql, useLazyQuery } from "@apollo/client";
import { initFlowbite } from "flowbite";
import WhatsAppModal from "../WhatsAppModal";
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
    page: 1,
    pageSize: 50,
};
const EXIT_NOTES_QUERY = gql`
    query (
        $subsidiaryId: Int!
        $clientId: Int!
        $startDate: Date!
        $endDate: Date!
        $page: Int!
        $pageSize: Int!
        $serial: String
        $correlative: Int
    ) {
        allExitNotes(
            subsidiaryId: $subsidiaryId
            clientId: $clientId
            startDate: $startDate
            endDate: $endDate
            page: $page
            pageSize: $pageSize
            serial: $serial
            correlative: $correlative
        ) {
            notes {
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
            totalNumberOfNotes
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
function ExitNotePage() {
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
        exitNotesQuery,
        {
            loading: filteredExitNotesLoading,
            error: filteredExitNotesError,
            data: filteredExitNotesData,
        },
    ] = useLazyQuery(EXIT_NOTES_QUERY, {
        context: authContext,
        fetchPolicy: "network-only",
        onCompleted: () => initFlowbite(),
        onError: (err) =>
            console.error("Error in exit notes:", err, auth?.jwtToken),
    });

    useEffect(() => {
        if (auth?.status === "authenticated" && auth?.jwtToken) {
            exitNotesQuery({
                variables: {
                    subsidiaryId: auth?.user?.isSuperuser
                        ? Number(filterObj.subsidiaryId)
                        : Number(auth?.user?.subsidiaryId),
                    clientId: Number(filterObj.clientId),
                    startDate: filterObj.startDate,
                    endDate: filterObj.endDate,
                    page: Number(filterObj.page),
                    pageSize: Number(filterObj.pageSize),
                },
            });
            setFilterObj({
                ...filterObj,
                subsidiaryId: auth?.user?.isSuperuser
                    ? String(filterObj.subsidiaryId)
                    : String(auth?.user?.subsidiaryId),
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
        <div className="min-h-screen bg-white dark:bg-gray-800">
            <div className="container mx-auto pb-16">
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-1"></div>
                    <div className="col-span-10">
                        <ExitNoteFilter
                            setFilterObj={setFilterObj}
                            filterObj={filterObj}
                            exitNotesQuery={exitNotesQuery}
                            filteredExitNotesLoading={filteredExitNotesLoading}
                            auth={auth}
                            authContext={authContext}
                        />
                        <div className="flex flex-col">
                            <div className="overflow-x-auto">
                                <div className="inline-block min-w-full align-middle">
                                    <div className="overflow-hidden shadow">
                                        {filteredExitNotesLoading ? (
                                            <div className="p-4 text-center">
                                                <span className="loader"></span>
                                                Cargando ventas...
                                            </div>
                                        ) : filteredExitNotesError ? (
                                            <div className="p-4 text-red-500 text-center">
                                                {filteredExitNotesError.message}
                                            </div>
                                        ) : (
                                            <ExitNoteList
                                                filteredExitNotesData={
                                                    filteredExitNotesData
                                                }
                                                setFilterObj={setFilterObj}
                                                filterObj={filterObj}
                                                modalWhatsApp={modalWhatsApp}
                                                cpe={cpe}
                                                setCpe={setCpe}
                                                exitNotesQuery={exitNotesQuery}
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

export default ExitNotePage;
