"use client";
import { useState, useMemo, use, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import QuoteList from "./QuoteList";
import QuoteFilter from "./QuoteFilter";
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import { initFlowbite, Modal } from "flowbite";
import { useAuth } from "@/components/providers/AuthProvider";
import WhatsAppModal from "../sales/WhatsAppModal";
import ClientEdit from "./ClientEdit";
import { toast } from "react-toastify";
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
                    id
                    names
                    documentNumber
                    documentType
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

const GET_CLIENT_BY_ID = gql`
    query GetClientById($clientId: ID!) {
        clientById(clientId: $clientId) {
            id
            names
            shortName
            email
            phone
            address
            country
            documentType
            documentNumber
            isEnabled
            isClient
            isSupplier
            economicActivityMain
            district {
                id
                description
            }
        }
    }
`;

const UPDATE_PERSON = gql`
    mutation UpdatePerson(
        $id: ID!
        $names: String
        $shortName: String
        $phone: String
        $email: String
        $address: String
        $country: String
        $districtId: String
        $documentType: String
        $documentNumber: String
        $isEnabled: Boolean
        $isSupplier: Boolean
        $isClient: Boolean
        $economicActivityMain: Int
    ) {
        updatePerson(
            id: $id
            names: $names
            shortName: $shortName
            phone: $phone
            email: $email
            address: $address
            country: $country
            districtId: $districtId
            documentType: $documentType
            documentNumber: $documentNumber
            isEnabled: $isEnabled
            isSupplier: $isSupplier
            isClient: $isClient
            economicActivityMain: $economicActivityMain
        ) {
            success
            message
            person {
                id
                names
                shortName
                email
                phone
                address
                isEnabled
            }
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
const initialStatePerson = {
    id: 0,
    names: "",
    shortName: "",
    phone: "",
    email: "",
    address: "",
    country: "PE",
    countryReadable: "PERÚ",
    districtId: "040101",
    provinceId: "0401",
    departmentId: "04",
    districtName: "",
    documentType: "6",
    documentNumber: "",
    isEnabled: true,
    isSupplier: false,
    isClient: true,
    economicActivityMain: 0,
    district: {
        id: "",
        description: "",
    },
};
function QuotePage() {
    const [filterObj, setFilterObj] = useState(initialStateFilterObj);
    const [cpe, setCpe] = useState(initialStateCpe);
    const [person, setPerson] = useState(initialStatePerson);

    const [modalWhatsApp, setModalWhatsApp] = useState<Modal | null>(null);
    const [modalEditClient, setModalEditClient] = useState<Modal | null>(null);
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
    const [getClientById] = useLazyQuery(GET_CLIENT_BY_ID, {
        context: authContext,
        onCompleted: (data) => {
            if (data?.clientById) {
                const cleanedData = {
                    ...data.clientById,
                    id: Number(data.clientById.id) || 0,
                    shortName: data.clientById.shortName || "",
                    email: data.clientById.email || "",
                    phone: data.clientById.phone || "",
                    address: data.clientById.address || "",
                    documentType:
                        data.clientById.documentType?.replace("A_", "") || "",
                    districtId: data.clientById.district?.id || "040101",
                    provinceId:
                        data.clientById.district?.id.substring(0, 4) || "0401",
                    departmentId:
                        data.clientById.district?.id.substring(0, 2) || "04",
                    economicActivityMain:
                        Number(
                            data.clientById.economicActivityMain?.replace(
                                "A_",
                                ""
                            )
                        ) || 0,
                    countryReadable: data.clientById.countryReadable || "PERÚ",
                    economicActivityMainReadable:
                        data.clientById.economicActivityMainReadable || "",
                };
                setPerson(cleanedData);
                modalEditClient?.show();
            }
        },
        onError: (err) => console.error("Error in getClientById:", err),
    });
    const [updatePerson] = useMutation(UPDATE_PERSON, {
        context: authContext,
        onCompleted: (data) => {
            if (!data.updatePerson.error) {
                toast.success(data.updatePerson.message);
                modalEditClient?.hide();
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
            } else {
                toast.error(data.updatePerson.message);
            }
        },
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
                                modalEditClient={modalEditClient}
                                getClientById={getClientById}
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
            <ClientEdit
                modalEditClient={modalEditClient}
                setModalEditClient={setModalEditClient}
                person={person}
                setPerson={setPerson}
                initialStatePerson={initialStatePerson}
                updatePerson={updatePerson}
                jwtToken={auth?.jwtToken}
                authContext={authContext}
            />
        </>
    );
}

export default QuotePage;
