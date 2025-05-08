"use client";
import { ChangeEvent, FormEvent, useState, useEffect, useMemo } from "react";
import { ICompany, IUser } from "@/app/types";
import { toast } from "react-toastify";
import { it } from "node:test";
import CompanyList from "./CompanyList";
import CompanyModal from "./CompanyModal";
import { Modal, ModalOptions } from "flowbite";
import Breadcrumb from "@/components/Breadcrumb";
import CompanyFilter from "./CompanyFilter";
import { useSession } from "next-auth/react";
import { DocumentNode, gql, useMutation } from "@apollo/client";
import { useAuth } from "@/components/providers/AuthProvider";
const initialState = {
    id: 0,
    typeDoc: "6",
    doc: "",
    shortName: "",
    businessName: "",
    address: "",
    email: "",
    phone: "",
    logo: "",
    userSol: "",
    keySol: "",
    limit: 500,
    emissionInvoiceWithPreviousDate: 0,
    emissionReceiptWithPreviousDate: 0,
    includeIgv: false,
    percentageIgv: 18,
    guideClientId: "",
    guideClientSecret: "",
    deductionAccount: "",
    isEnabled: false,
    isProduction: false,
    productionDate: "",
    disabledDate: "",
    certificationKey: "",
    certification: "",
    certificationExpirationDate: "",
    withStock: false,
    catalog: false,
    invoiceF: false,
    invoiceB: false,
    guide: false,
    app: false,
    ose: false,
    accountNumber: "",
    comment: "",
    disableContinuePay: false,
};
const COMPANIES_QUERY = gql`
    query Companies {
        companies {
            id
            typeDoc
            doc
            businessName
            address
            email
            phone
            shortName
            logo
            isProduction
            isEnabled
            limit
            country
            userSol
            keySol
            emissionInvoiceWithPreviousDate
            emissionReceiptWithPreviousDate
            includeIgv
            percentageIgv
            productionDate
            disabledDate
        }
    }
`;

const COMPANY_QUERY = gql`
    query Unit($pk: ID!) {
        companyById(pk: $pk) {
            id
            typeDoc
            doc
            businessName
            address
            email
            phone
            shortName
            logo
            isEnabled
            limit
            country
            userSol
            keySol
            emissionInvoiceWithPreviousDate
            emissionReceiptWithPreviousDate
            includeIgv
            percentageIgv
            isEnabled
            productionDate
            isProduction
            disabledDate
            passwordSignature
            certification
            certificationExpirationDate
            withStock
            catalog
            invoiceF
            invoiceB
            guide
            app
            ose
            accountNumber
            comment
            disableContinuePay
        }
    }
`;
function CompanyPage() {
    const [companies, setCompanies] = useState<ICompany[]>([]);
    const [modal, setModal] = useState<Modal | any>(null);
    const [company, setCompany] = useState(initialState);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const { data: session, status } = useSession();
    const [jwtToken, setJwtToken] = useState<string | null>(null);
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

    useEffect(() => {
        if (auth?.user) {
            console.log("usuario:", auth?.jwtToken);
            fetchCompanies();
        }
    }, [auth?.user]);
    async function fetchCompanies() {
        let queryFetch: String = `
            query{
                companiesByUser {
                        id
                        typeDoc
                        doc
                        businessName
                        address
                        email
                        phone
                        shortName
                        logo
                        isProduction
                        isEnabled
                        limit
                        country
                        userSol
                        keySol
                        emissionInvoiceWithPreviousDate
                        emissionReceiptWithPreviousDate
                        includeIgv
                        percentageIgv
                        productionDate
                        disabledDate
                        accountNumber
                        comment
                        disableContinuePay
                    }
            }
        `;
        await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: auth?.jwtToken ? `JWT ${auth.jwtToken}` : "",
            },
            body: JSON.stringify({
                query: queryFetch,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log("data:", data.data);
                setCompanies(data.data.companiesByUser);
            });
    }
    // useEffect(() => {
    //     fetchCompanies();
    // }, []);

    const filteredCompanies = useMemo(() => {
        if (companies) {
            let newdata = companies?.filter((w: ICompany) =>
                w?.businessName
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase())
            );
            return newdata;
        }
    }, [searchTerm, companies]);
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
            <div className="p-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 lg:mt-1.5 dark:bg-gray-800 dark:border-gray-700">
                <div className="w-full mb-1">
                    <Breadcrumb section={"Empresas"} article={"Empresa"} />

                    <CompanyFilter
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        modal={modal}
                        user={auth?.user}
                    />
                </div>
            </div>

            <div className="flex flex-col">
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden shadow">
                            <CompanyList
                                companies={filteredCompanies}
                                modal={modal}
                                setModal={setModal}
                                company={company}
                                setCompany={setCompany}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <CompanyModal
                auth={auth}
                COMPANIES_QUERY={COMPANIES_QUERY}
                modal={modal}
                setModal={setModal}
                company={company}
                setCompany={setCompany}
                initialState={initialState}
                fetchCompanies={fetchCompanies}
            />
        </>
    );
}

export default CompanyPage;
