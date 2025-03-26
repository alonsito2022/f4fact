"use client";
import { ChangeEvent, FormEvent, useState, useEffect, useMemo } from "react";
import { ISerialAssigned, ISubsidiary, IUser } from "@/app/types";
import { toast } from "react-toastify";
import { it } from "node:test";
import SubsidiaryList from "./SubsidiaryList";
import SubsidiaryModal from "./SubsidiaryModal";
import { Modal, ModalOptions } from "flowbite";
import { gql, useLazyQuery, useQuery } from "@apollo/client";
import { useSession } from "next-auth/react";
import Breadcrumb from "@/components/Breadcrumb";
import { useAuth } from "@/components/providers/AuthProvider";
import DevicesModal from "./DevicesModal";
const initialState = {
    id: 0,
    serial: "",
    name: "",
    address: "",
    phone: "",
    districtId: "",
    companyId: 0,
    token: "",
    serialassignedSet: [] as ISerialAssigned[],
    pdfFormatForInvoices: 1,
    pdfFormatForReceiptInvoices: 1,
    pdfFormatForGuides: 1,
};

const SUBSIDIARIES_QUERY = gql`
    query {
        subsidiaries {
            id
            serial
            name
            address
            phone
            districtId
            districtName
            companyId
            companyName
        }
    }
`;
const SEARCH_SUBSIDIARIES_QUERY = gql`
    query ($searchTerm: String!) {
        searchSubsidiaries(search: $searchTerm) {
            id
            serial
            name
            address
            phone
            districtId
            districtName
            companyId
            companyName
            token
        }
    }
`;
const SUBSIDIARIES_QUERY_BY_COMPANY_ID = gql`
    query ($companyId: ID!) {
        subsidiariesByCompanyId(companyId: $companyId) {
            id
            serial
            name
            address
            phone
            districtId
            districtName
            companyId
            token
            pdfFormatForInvoices
            pdfFormatForReceiptInvoices
            pdfFormatForGuides
        }
    }
`;
const initialStateFilterObj = {
    subsidiaryId: "",
    isSuperuser: false,
};
const initialStateDevices = {
    devices: [],
    token: "",
};
function SubsidiaryPage() {
    const [filterObj, setFilterObj] = useState(initialStateFilterObj);
    const [modal, setModal] = useState<Modal | any>(null);
    const [modalDevice, setModalDevice] = useState<Modal | any>(null);
    const [subsidiary, setSubsidiary] = useState(initialState);
    const [subsidiaryDevices, setSubsidiaryDevices] =
        useState(initialStateDevices);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [searchField, setSearchField] = useState<"name" | "serial">("name");
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
    console.log("usuario:", auth?.user);
    useEffect(() => {
        if (auth?.user) {
            const user = auth?.user as IUser;
            setFilterObj((prev) => ({
                ...prev,
                subsidiaryId:
                    prev.subsidiaryId ||
                    (user.isSuperuser ? "0" : user.subsidiaryId!),
                isSuperuser: user.isSuperuser ?? false, // Asegura que isSuperuser sea siempre booleano
            }));
        }
    }, [auth?.user]);
    const [
        subsidiariesQuery,
        {
            loading: subsidiariesLoading,
            error: subsidiariesError,
            data: subsidiariesData,
        },
    ] = useLazyQuery(SUBSIDIARIES_QUERY_BY_COMPANY_ID, {
        context: authContext,
        fetchPolicy: "network-only",
        // onCompleted: () => initFlowbite(),
        onError: (err) => console.error("Error:", err, auth?.jwtToken),
    });

    useEffect(() => {
        if (auth?.user?.companyId) {
            subsidiariesQuery({
                variables: { companyId: Number(auth?.user?.companyId) },
            });
        }
    }, [auth?.user]);

    const filteredSubsidiaries = useMemo(() => {
        if (subsidiariesData) {
            let newdata = subsidiariesData.subsidiariesByCompanyId?.filter(
                (w: ISubsidiary) =>
                    searchField === "name"
                        ? w?.name
                              ?.toLowerCase()
                              .includes(searchTerm.toLowerCase())
                        : w?.serial
                              ?.toString()
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase())
            );
            return newdata;
        }
    }, [searchTerm, searchField, subsidiariesData]);

    const handleInputSearchChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setSearchTerm(event.target.value);
    };
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
                    <Breadcrumb section={"Empresa"} article={"Local"} />

                    <div className="grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 xl:flex xl:flex-wrap items-center">
                        <div className="relative w-full sm:w-auto">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg
                                    className="w-5 h-5 text-gray-500 dark:text-gray-400"
                                    aria-hidden="true"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                        clipRule="evenodd"
                                    ></path>
                                </svg>
                            </div>
                            <input
                                type="search"
                                name="searchTerm"
                                value={searchTerm}
                                onChange={handleInputSearchChange}
                                className="block w-full sm:w-80 px-2 py-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                placeholder="Buscar nombre local..."
                            />
                        </div>
                        {filterObj?.isSuperuser ? (
                            <button
                                type="button"
                                onClick={(e) => {
                                    modal.show();
                                }}
                                className="btn-green mb-0 w-full sm:w-auto"
                            >
                                Crear Local
                            </button>
                        ) : null}
                    </div>
                </div>
            </div>

            <div className="flex flex-col">
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden shadow">
                            {subsidiariesLoading ? (
                                <div>Cargando...</div>
                            ) : subsidiariesError ? (
                                <div className="p-4 text-red-500 text-center">
                                    {subsidiariesError.message}
                                </div>
                            ) : (
                                <SubsidiaryList
                                    filteredSubsidiaries={filteredSubsidiaries}
                                    modal={modal}
                                    setModal={setModal}
                                    subsidiary={subsidiary}
                                    setSubsidiary={setSubsidiary}
                                    filterObj={filterObj}
                                    user={auth?.user}
                                    modalDevice={modalDevice}
                                    setModalDevice={setModalDevice}
                                    setSubsidiaryDevices={setSubsidiaryDevices}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <SubsidiaryModal
                modal={modal}
                setModal={setModal}
                subsidiary={subsidiary}
                setSubsidiary={setSubsidiary}
                initialState={initialState}
                subsidiariesQuery={subsidiariesQuery}
                user={auth?.user}
            />
            <DevicesModal
                modalDevice={modalDevice}
                setModalDevice={setModalDevice}
                subsidiaryDevices={subsidiaryDevices}
                setSubsidiaryDevices={setSubsidiaryDevices}
                initialStateDevices={initialStateDevices}
            />
        </>
    );
}

export default SubsidiaryPage;
