"use client";
import {
    useState,
    useEffect,
    useMemo,
    ChangeEvent,
    FormEvent,
    useRef,
} from "react";
import Breadcrumb from "@/components/Breadcrumb";
import { Modal, ModalOptions } from "flowbite";
import { useAuth } from "@/components/providers/AuthProvider";
import { IPerson, IQuota, IRelatedDocument, IRetentionType } from "@/app/types";
import RetentionDetailDocumentForm from "./RetentionDetailDocumentForm";
import RetentionDetailDocumentList from "./RetentionDetailDocumentList";
import Add from "@/components/icons/Add";
import ClientForm from "../../sales/ClientForm";
import { useRouter } from "next/navigation";
import {
    DocumentNode,
    gql,
    useLazyQuery,
    useMutation,
    useQuery,
} from "@apollo/client";
import SunatCancel from "@/components/icons/SunatCancel";
import Save from "@/components/icons/Save";
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

const RETENTION_TYPE_QUERY = gql`
    query {
        allRetentionTypes {
            code
            name
        }
    }
`;

const SEARCH_CLIENT_BY_PARAMETER = gql`
    query SearchClient(
        $search: String!
        $documentType: String
        $operationDocumentType: String
        $isClient: Boolean
        $isDriver: Boolean
        $isSupplier: Boolean
        $isReceiver: Boolean
    ) {
        searchClientByParameter(
            search: $search
            documentType: $documentType
            operationDocumentType: $operationDocumentType
            isClient: $isClient
            isDriver: $isDriver
            isSupplier: $isSupplier
            isReceiver: $isReceiver
        ) {
            id
            names
            documentNumber
            documentType
        }
    }
`;
const CREATE_RETENTION_CONSTANCE = gql`
    mutation CreateRetentionConstance(
        $serial: String!
        $correlative: Int!
        $emitDate: Date!
        $supplierId: Int!
        $observation: String
        $retentionType: Int!
        $relatedDocuments: [RelatedDocumentInput]
    ) {
        createRetentionConstance(
            serial: $serial
            correlative: $correlative
            emitDate: $emitDate
            supplierId: $supplierId
            observation: $observation
            retentionType: $retentionType
            relatedDocuments: $relatedDocuments
        ) {
            message
            error
        }
    }
`;
const initialStateRetention = {
    id: 0,
    serial: "RR01",
    correlative: "",
    emitDate: today,
    supplierName: "",
    supplierDocumentType: "",
    supplierId: 0,
    relatedDocuments: [] as IRelatedDocument[],
    retentionType: 1,
    observation: "",
};
const initialStateRetentionDetail = {
    id: 0,
    temporaryId: 0,
    documentType: "01",
    serial: "",
    correlative: 0,
    emitDate: today,
    currencyDateChange: today,
    currencyType: "PEN",
    saleExchangeRate: "",
    totalAmount: "",
    retentionType: 1,
    totalRetention: 0,
    retentionDate: today,
    quotas: [
        {
            id: 0,
            temporaryId: 0,
            paymentDate: today,
            number: 1,
            total: 0,
        },
    ] as IQuota[],
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
    isSupplier: true,
    isClient: false,
    economicActivityMain: 0,
};
function NewRetentionPage() {
    const [modalAddDetail, setModalAddDetail] = useState<Modal | any>(null);
    const [modalAddClient, setModalAddClient] = useState<Modal | any>(null);
    const [person, setPerson] = useState(initialStatePerson);
    // Add this near the top of your component with other refs
    const supplierInputRef = useRef<HTMLInputElement>(null);
    const [supplierSearch, setSupplierSearch] = useState("");
    const [retention, setRetention] = useState(initialStateRetention);
    const [retentionDetail, setRetentionDetail] = useState(
        initialStateRetentionDetail
    );
    const auth = useAuth();
    const router = useRouter();
    const handleSupplierSearchChange = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        setSupplierSearch(event.target.value);
    };
    const handleSupplierSelect = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedOption = event.target.value;

        const selectedData = searchClientData?.searchClientByParameter?.find(
            (person: IPerson) =>
                `${person.documentNumber} ${person.names}` === selectedOption
        );

        if (selectedData) {
            setRetention({
                ...retention,
                supplierId: selectedData.id,
                supplierName: selectedData.names,
                supplierDocumentType: selectedData?.documentType?.replace(
                    "A_",
                    ""
                ),
            });
        }
    };

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
        searchClientQuery,
        {
            loading: searchClientLoading,
            error: searchClientError,
            data: searchClientData,
        },
    ] = useLazyQuery(SEARCH_CLIENT_BY_PARAMETER, {
        context: authContext,
        fetchPolicy: "network-only",
        onError: (err) => console.error("Error in Search Client:", err),
    });
    const {
        loading: retentionTypesLoading,
        error: retentionTypesError,
        data: rawRetentionTypesData,
    } = useQuery(RETENTION_TYPE_QUERY, {
        context: authContext,
        skip: !auth?.jwtToken,
    });

    // Transform the data with the rate property
    const retentionTypesData = useMemo(() => {
        if (!rawRetentionTypesData) return null;
        return {
            ...rawRetentionTypesData,
            allRetentionTypes: rawRetentionTypesData.allRetentionTypes.map(
                (type: IRetentionType) => ({
                    ...type,
                    rate: type.name.match(/\d+/)?.[0] || "0",
                })
            ),
        };
    }, [rawRetentionTypesData]);

    function useCustomMutation(mutation: DocumentNode) {
        return useMutation(mutation, {
            context: authContext,
            onError: (err) => console.error("Error in unit:", err), // Log the error for debugging
        });
    }

    const [createRetention] = useCustomMutation(CREATE_RETENTION_CONSTANCE);

    useEffect(() => {
        if (supplierSearch.length > 2) {
            const queryVariables: {
                search: string;
                documentType?: string;
                isSupplier: boolean;
            } = {
                search: supplierSearch,
                documentType: "6",
                isSupplier: true,
            };

            searchClientQuery({
                variables: queryVariables,
            });
        }
    }, [supplierSearch]);
    const handleRetention = (
        event: ChangeEvent<
            HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = event.target;
        const target = event.target as HTMLInputElement;

        if (target.type === "checkbox") {
            setRetention((prev) => ({
                ...prev,
                [name]: target.checked,
            }));
            return;
        }

        setRetention({ ...retention, [name]: value });
    };
    const handleSaveRetention = async () => {
        try {
            // Validate required fields
            if (!retention.serial || retention.serial.length !== 4) {
                toast.warning("La serie debe tener 4 dígitos");
                return;
            }

            // if (!retention.correlative || Number(retention.correlative) <= 0) {
            //     toast.warning("El número debe ser mayor a cero");
            //     return;
            // }

            if (!retention.supplierId || retention.supplierId <= 0) {
                toast.warning("Debe seleccionar un proveedor");
                return;
            }

            if (
                !retention.relatedDocuments ||
                retention.relatedDocuments.length === 0
            ) {
                toast.warning("Debe agregar al menos un documento relacionado");
                return;
            }
            // Format related documents
            const formattedDocuments = retention.relatedDocuments.map(
                (doc) => ({
                    documentType: doc.documentType,
                    serial: doc.serial,
                    correlative: Number(doc.correlative || 0),
                    emitDate: doc.emitDate,
                    currencyDateChange: doc.currencyDateChange,
                    currencyType: doc.currencyType,
                    saleExchangeRate: Number(doc.saleExchangeRate),
                    totalAmount: Number(doc.totalAmount),
                    retentionType: Number(doc.retentionType),
                    totalRetention: Number(doc.totalRetention),
                    retentionDate: doc.retentionDate,
                    quotas: doc?.quotas?.map((quota) => ({
                        paymentDate: quota.paymentDate,
                        number: Number(quota.number),
                        total: Number(quota.total),
                    })),
                })
            );
            const variables = {
                serial: retention.serial,
                correlative: Number(retention.correlative),
                emitDate: retention.emitDate,
                supplierId: Number(retention.supplierId),
                observation: retention.observation || "",
                retentionType: Number(retention.retentionType),
                relatedDocuments: formattedDocuments,
            };
            console.log("variables al guardar", variables);
            const { data, errors } = await createRetention({
                variables: variables,
            });
            if (errors) {
                toast.error(errors.toString());
                return;
            }

            if (data.createRetentionConstance.error) {
                toast.error(data.createRetentionConstance.message);
                return;
            }

            toast.success(data.createRetentionConstance.message);
            router.push("/dashboard/retentions");
        } catch (error) {
            console.error("Error creating retention:", error);
            toast.error("Error al crear la retención");
        }
    };
    return (
        <>
            <div className="p-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 lg:mt-1.5 dark:bg-gray-800 dark:border-gray-700">
                <div className="w-full mb-1">
                    <Breadcrumb
                        section={"Comprobantes de retención"}
                        article={"Nuevo comprobante de retención electronica"}
                    />
                </div>
            </div>
            <div className="flex flex-col space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden shadow-lg rounded-lg">
                            <div className="p-4 md:p-5 space-y-4">
                                <div className="grid gap-4 ">
                                    <fieldset className="border-2 border-blue-200 dark:border-blue-900 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 relative group transition-all duration-300 hover:shadow-blue-500/20 hover:shadow-2xl">
                                        <legend className="px-2 text-blue-600 dark:text-blue-400 font-semibold text-sm transition-all duration-300 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                                            <div className="flex items-center gap-2">
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                                Información General
                                            </div>
                                        </legend>
                                        <div className="grid gap-6 lg:grid-cols-6 sm:grid-cols-1 md:grid-cols-3">
                                            {/* Serie */}
                                            <div>
                                                <label
                                                    htmlFor="serial"
                                                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                                >
                                                    Serie
                                                </label>
                                                <input
                                                    type="text"
                                                    name="serial"
                                                    id="serial"
                                                    maxLength={4}
                                                    value={retention.serial}
                                                    onChange={handleRetention}
                                                    onFocus={(e) =>
                                                        e.target.select()
                                                    }
                                                    className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 "
                                                    autoComplete="off"
                                                />
                                            </div>
                                            {/* Numero */}
                                            <div>
                                                <label
                                                    htmlFor="correlative"
                                                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                                >
                                                    Numero
                                                </label>
                                                <input
                                                    type="text"
                                                    name="correlative"
                                                    id="correlative"
                                                    maxLength={10}
                                                    value={
                                                        retention.correlative
                                                    }
                                                    onChange={handleRetention}
                                                    onFocus={(e) =>
                                                        e.target.select()
                                                    }
                                                    className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 "
                                                    autoComplete="off"
                                                />
                                            </div>
                                            {/* Fecha emisión */}
                                            <div>
                                                <label
                                                    htmlFor="emitDate"
                                                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                                >
                                                    Fecha emisión
                                                </label>
                                                <input
                                                    type="date"
                                                    name="emitDate"
                                                    id="emitDate"
                                                    value={retention.emitDate}
                                                    onChange={handleRetention}
                                                    onFocus={(e) =>
                                                        e.target.select()
                                                    }
                                                    className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </fieldset>
                                    <fieldset className="border-2 border-cyan-200 dark:border-cyan-900 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 relative group transition-all duration-300 hover:shadow-cyan-500/20 hover:shadow-2xl">
                                        <legend className="px-2 text-cyan-600 dark:text-cyan-400 font-semibold text-sm transition-all duration-300 group-hover:text-cyan-700 dark:group-hover:text-cyan-300">
                                            <div className="flex items-center gap-2">
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                                    />
                                                </svg>
                                                <span className="flex items-center gap-2">
                                                    Datos del Proveedor
                                                    <span className="text-xs font-normal text-cyan-500 dark:text-cyan-400">
                                                        (Buscar por RUC/DNI o
                                                        Nombre)
                                                    </span>
                                                </span>
                                            </div>
                                        </legend>
                                        <div className="grid gap-6 lg:grid-cols-4 sm:grid-cols-1 md:grid-cols-2">
                                            {/* Proveedor */}

                                            <div className="md:col-span-4">
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                    Proveedor
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                                                        {retention.supplierId >
                                                        0
                                                            ? "✓ Proveedor seleccionado"
                                                            : "⚠️ Seleccione un cliente"}
                                                    </span>
                                                </label>
                                                <div className="relative w-full mt-1 group">
                                                    <input
                                                        ref={supplierInputRef}
                                                        type="text"
                                                        className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                        maxLength={200}
                                                        value={supplierSearch}
                                                        onChange={
                                                            handleSupplierSearchChange
                                                        }
                                                        onInput={
                                                            handleSupplierSelect
                                                        }
                                                        onFocus={(e) =>
                                                            e.target.select()
                                                        }
                                                        autoComplete="off"
                                                        // disabled={
                                                        //     searchClientLoading
                                                        // }
                                                        placeholder="Buscar cliente..."
                                                        list="clientNameList"
                                                        required
                                                    />
                                                    <datalist
                                                        id="clientNameList"
                                                        className="custom-datalist"
                                                    >
                                                        {searchClientData?.searchClientByParameter?.map(
                                                            (
                                                                n: IPerson,
                                                                index: number
                                                            ) => (
                                                                <option
                                                                    key={index}
                                                                    data-key={
                                                                        n.id
                                                                    }
                                                                    value={`${n.documentNumber} ${n.names}`}
                                                                />
                                                            )
                                                        )}
                                                    </datalist>
                                                    <button
                                                        type="button"
                                                        className="absolute inset-y-0 right-10 px-2 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-400 focus:ring-2 focus:ring-gray-500"
                                                        onClick={() => {
                                                            setRetention({
                                                                ...retention,
                                                                supplierName:
                                                                    "",
                                                                supplierId: 0,
                                                            });
                                                            setSupplierSearch(
                                                                ""
                                                            );
                                                        }}
                                                    >
                                                        <SunatCancel />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="absolute inset-y-0 right-0 px-2.5 py-2 bg-blue-600 dark:bg-cyan-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                                                        onClick={(e) => {
                                                            modalAddClient.show();
                                                            setPerson(
                                                                initialStatePerson
                                                            );
                                                        }}
                                                    >
                                                        <Add />
                                                    </button>
                                                </div>
                                            </div>
                                            <style jsx>{`
                                                .custom-datalist option {
                                                    background-color: #1f2937; /* Dark background */
                                                    color: #d1d5db; /* Light text */
                                                    padding: 8px;
                                                    border: 1px solid #374151; /* Border color */
                                                }
                                                .custom-datalist option:hover {
                                                    background-color: #4b5563; /* Hover background */
                                                    color: #ffffff; /* Hover text */
                                                }
                                            `}</style>
                                        </div>
                                    </fieldset>

                                    {/* Datos de la retencion */}
                                    <fieldset className="border-2 border-emerald-200 dark:border-emerald-900 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 relative group transition-all duration-300 hover:shadow-emerald-500/20 hover:shadow-2xl">
                                        <legend className="px-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm transition-all duration-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                                            <div className="flex items-center gap-2">
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                                Datos de la Retención
                                            </div>
                                        </legend>
                                        <div className="grid gap-6 lg:grid-cols-2 sm:grid-cols-1">
                                            <div className="col-span-2">
                                                <label
                                                    htmlFor="retentionType"
                                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                                >
                                                    Régimen de Retención
                                                </label>
                                                <select
                                                    name="retentionType"
                                                    id="retentionType"
                                                    onChange={handleRetention}
                                                    value={
                                                        retention.retentionType
                                                    }
                                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                                                >
                                                    {retentionTypesData?.allRetentionTypes?.map(
                                                        (
                                                            o: IRetentionType,
                                                            k: number
                                                        ) => (
                                                            <option
                                                                key={k}
                                                                value={o.code}
                                                            >
                                                                {o.name}
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                            </div>

                                            <div className="col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Observaciones
                                                </label>
                                                <textarea
                                                    name="observation"
                                                    onFocus={(e) =>
                                                        e.target.select()
                                                    }
                                                    maxLength={500}
                                                    value={
                                                        retention.observation
                                                    }
                                                    onChange={handleRetention}
                                                    rows={3}
                                                    placeholder="Ingrese observaciones adicionales..."
                                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm resize-none"
                                                ></textarea>
                                            </div>
                                        </div>
                                    </fieldset>
                                </div>
                                {/* Lista de Comprobantes */}
                                <div className="flex flex-col gap-4">
                                    <RetentionDetailDocumentList
                                        retention={retention}
                                        setRetention={setRetention}
                                        setRetentionDetail={setRetentionDetail}
                                        modalAddDetail={modalAddDetail}
                                    />
                                    <div className="flex justify-between items-center border-t dark:border-gray-700 pt-4">
                                        <button
                                            type="button"
                                            className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
                                            onClick={(e) => {
                                                modalAddDetail.show();
                                                setRetentionDetail({
                                                    ...initialStateRetentionDetail,
                                                    retentionType: Number(
                                                        retention.retentionType
                                                    ),
                                                });
                                            }}
                                        >
                                            <Add /> AGREGAR DOCUMENTO
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSaveRetention}
                                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                                        >
                                            <Save />
                                            EMITIR COMPROBANTE
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <RetentionDetailDocumentForm
                modalAddDetail={modalAddDetail}
                setModalAddDetail={setModalAddDetail}
                retention={retention}
                setRetention={setRetention}
                retentionDetail={retentionDetail}
                setRetentionDetail={setRetentionDetail}
                initialStateRetentionDetail={initialStateRetentionDetail}
                retentionTypesData={retentionTypesData}
            />
            <ClientForm
                modalAddClient={modalAddClient}
                setModalAddClient={setModalAddClient}
                person={person}
                setPerson={setPerson}
                jwtToken={auth?.jwtToken}
                authContext={authContext}
                SEARCH_CLIENT_BY_PARAMETER={SEARCH_CLIENT_BY_PARAMETER}
                sale={retention}
                setSale={setRetention}
            />
        </>
    );
}

export default NewRetentionPage;
