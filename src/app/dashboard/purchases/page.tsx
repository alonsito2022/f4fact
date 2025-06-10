"use client";
import { useState, useMemo, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import PurchaseList from "./PurchaseList";
import PurchaseFilter from "./PurchaseFilter";
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { IUser } from "@/app/types";
import { initFlowbite, Modal } from "flowbite";
import ClientEdit from "../quotes/ClientEdit";
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

const initialStateFilterObj = {
    startDate: today,
    endDate: today,
    supplierId: 0,
    subsidiaryId: "",
    subsidiaryName: "",
    supplierName: "",
    documentType: "NA",
    page: 1,
    pageSize: 50,
    serial: "",
    correlative: "",
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
const PURCHASES_QUERY = gql`
    query getPurchases(
        $subsidiaryId: Int!
        $supplierId: Int!
        $startDate: Date!
        $endDate: Date!
        $documentType: String!
        $page: Int!
        $pageSize: Int!
        $serial: String
        $correlative: Int
    ) {
        allPurchases(
            subsidiaryId: $subsidiaryId
            supplierId: $supplierId
            startDate: $startDate
            endDate: $endDate
            documentType: $documentType
            page: $page
            pageSize: $pageSize
            serial: $serial
            correlative: $correlative
        ) {
            purchases {
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
                linkXml
                linkXmlLow
                linkCdr
                linkCdrLow
                sunatStatus
                sunatDescription
                sunatDescriptionLow
                codeHash
                supplier {
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
            totalPurchasesTickets
            totalCreditNotes
            totalDebitNotes
            totalNumberOfPages
            totalNumberOfPurchases
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
function PurchasePage() {
    const [filterObj, setFilterObj] = useState(initialStateFilterObj);
    const auth = useAuth();
    const [person, setPerson] = useState(initialStatePerson);

    const [modalEditClient, setModalEditClient] = useState<Modal | null>(null);
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
        purchasesQuery,
        {
            loading: filteredPurchasesLoading,
            error: filteredPurchasesError,
            data: filteredPurchasesData,
        },
    ] = useLazyQuery(PURCHASES_QUERY, {
        context: authContext,
        fetchPolicy: "network-only",
        onCompleted: () => initFlowbite(),
        onError: (err) =>
            console.error("Error in purchases:", err, auth?.jwtToken),
    });
    const [updatePerson] = useMutation(UPDATE_PERSON, {
        context: authContext,
        onCompleted: (data) => {
            if (!data.updatePerson.error) {
                toast.success(data.updatePerson.message);
                modalEditClient?.hide();
                purchasesQuery({
                    variables: {
                        subsidiaryId: auth?.user?.isSuperuser
                            ? Number(filterObj.subsidiaryId)
                            : Number(auth?.user?.subsidiaryId),
                        supplierId: Number(filterObj.supplierId),
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
            const variables = {
                subsidiaryId: auth?.user?.isSuperuser
                    ? Number(filterObj.subsidiaryId)
                    : Number(auth?.user?.subsidiaryId),
                supplierId: Number(filterObj.supplierId),
                startDate: filterObj.startDate,
                endDate: filterObj.endDate,
                documentType: filterObj.documentType,
                page: Number(filterObj.page),
                pageSize: Number(filterObj.pageSize),
            };
            purchasesQuery({
                variables: variables,
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
        <>
            <div className="min-h-screen bg-white dark:bg-gray-800">
                <div className="container mx-auto pb-16">
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-1"></div>
                        <div className="col-span-10">
                            <PurchaseFilter
                                setFilterObj={setFilterObj}
                                filterObj={filterObj}
                                purchasesQuery={purchasesQuery}
                                filteredPurchasesLoading={
                                    filteredPurchasesLoading
                                }
                                auth={auth}
                            />
                            <div className="flex flex-col">
                                <div className="overflow-x-auto">
                                    <div className="inline-block min-w-full align-middle">
                                        <div className="overflow-hidden shadow">
                                            {filteredPurchasesLoading ? (
                                                <div className="p-4 text-center">
                                                    <span className="loader"></span>
                                                    Cargando compras...
                                                </div>
                                            ) : filteredPurchasesError ? (
                                                <div className="p-4 text-red-500 text-center">
                                                    {
                                                        filteredPurchasesError.message
                                                    }
                                                </div>
                                            ) : (
                                                <PurchaseList
                                                    setFilterObj={setFilterObj}
                                                    filterObj={filterObj}
                                                    purchasesQuery={
                                                        purchasesQuery
                                                    }
                                                    filteredPurchasesData={
                                                        filteredPurchasesData
                                                    }
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
            </div>
        </>
    );
}

export default PurchasePage;
