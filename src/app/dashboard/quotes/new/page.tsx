"use client";
import {
    useState,
    useEffect,
    useMemo,
    ChangeEvent,
    FormEvent,
    useRef,
    useCallback,
} from "react";
import {
    IOperationDetail,
    IOperationType,
    IPerson,
    IProduct,
    ISerialAssigned,
    IUser,
} from "@/app/types";
import Breadcrumb from "@/components/Breadcrumb";
import { Modal, ModalOptions } from "flowbite";
import {
    useQuery,
    gql,
    useLazyQuery,
    useMutation,
    DocumentNode,
} from "@apollo/client";
import Add from "@/components/icons/Add";
import Save from "@/components/icons/Save";
import ProductForm from "../../logistics/products/ProductForm";
import { toast } from "react-toastify";
import { useAuth } from "@/components/providers/AuthProvider";
import SunatCancel from "@/components/icons/SunatCancel";
import ClientForm from "../../sales/ClientForm";
import SaleTotalList from "../../sales/SaleTotalList";
import { useRouter } from "next/navigation";
import SaleDetailList from "../../sales/SaleDetailList";
import SaleDetailForm from "../../sales/SaleDetailForm";

const limaDate = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Lima" })
);
const today =
    limaDate.getFullYear() +
    "-" +
    String(limaDate.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(limaDate.getDate()).padStart(2, "0");

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
const PRODUCTS_QUERY = gql`
    query ($subsidiaryId: Int!, $available: Boolean!) {
        allProducts(subsidiaryId: $subsidiaryId, available: $available) {
            id
            code
            name
            available
            activeType
            activeTypeReadable
            ean
            weightInKilograms
            minimumUnitId
            maximumUnitId
            minimumUnitName
            maximumUnitName
            maximumFactor
            minimumFactor
            typeAffectationId
            typeAffectationName
            subjectPerception
            observation
            priceWithIgv1
            priceWithIgv2
            priceWithIgv3
            priceWithIgv4
            priceWithoutIgv1
            priceWithoutIgv2
            priceWithoutIgv3
            priceWithoutIgv4
        }
    }
`;
const TYPE_AFFECTATION_QUERY = gql`
    query {
        allTypeAffectations {
            id
            code
            name
            affectCode
            affectName
            affectType
        }
    }
`;
const TYPE_OPERATION_QUERY = gql`
    query {
        allOperationTypes {
            code
            name
        }
    }
`;
const PERCEPTION_TYPE_QUERY = gql`
    query {
        allPerceptionTypes {
            code
            name
        }
    }
`;

const RETENTION_TYPE_QUERY = gql`
    query {
        allRetentionTypes {
            code
            name
        }
    }
`;

const DETRACTION_TYPE_QUERY = gql`
    query {
        allDetractionTypes {
            code
            name
        }
    }
`;
const DETRACTION_PAYMENT_METHOD_QUERY = gql`
    query {
        allDetractionPaymentMethods {
            code
            name
        }
    }
`;

const CREATE_SALE_MUTATION = gql`
    mutation CreateSale(
        $serial: String!
        $correlative: Int!
        $operationType: String!
        $documentType: String!
        $currencyType: String!
        $saleExchangeRate: Float!
        $emitDate: Date!
        $clientId: Int!
        $productTariffIdSet: [Int!]!
        $typeAffectationIdSet: [Int!]!
        $quantitySet: [Int!]!
        $unitValueSet: [Float!]!
        $unitPriceSet: [Float!]!
        $discountPercentageSet: [Float!]!
        $igvPercentageSet: [Float!]!
        $perceptionPercentageSet: [Float!]!
        $commentSet: [String!]!
        $totalDiscountSet: [Float!]!
        $totalValueSet: [Float!]!
        $totalIgvSet: [Float!]!
        $totalAmountSet: [Float!]!
        $totalPerceptionSet: [Float!]!
        $totalToPaySet: [Float!]!
        $wayPaySet: [Int!]!
        $totalSet: [Float!]!
        $descriptionSet: [String!]!
        $discountForItem: Float!
        $discountGlobal: Float!
        $discountPercentageGlobal: Float!
        $igvType: Int!
        $totalDiscount: Float!
        $totalTaxed: Float!
        $totalUnaffected: Float!
        $totalExonerated: Float!
        $totalIgv: Float!
        $totalFree: Float!
        $totalAmount: Float!
        $totalPerception: Float!
        $totalToPay: Float!
        $totalPayed: Float!
        $totalTurned: Float!
        $creditNoteType: String!
        $parentOperationId: Int!
        $hasPerception: Boolean
        $hasRetention: Boolean
        $hasDetraction: Boolean
        $perceptionType: Int
        $perceptionPercentage: Float
        $retentionType: Int
        $totalRetention: Float
        $retentionPercentage: Float
        $detractionType: Int
        $detractionPaymentMethod: Int
        $totalDetraction: Float
        $detractionPercentage: Float
        $observation: String
    ) {
        createSale(
            serial: $serial
            correlative: $correlative
            operationType: $operationType
            documentType: $documentType
            currencyType: $currencyType
            saleExchangeRate: $saleExchangeRate
            emitDate: $emitDate
            clientId: $clientId
            productTariffIdSet: $productTariffIdSet
            typeAffectationIdSet: $typeAffectationIdSet
            quantitySet: $quantitySet
            unitValueSet: $unitValueSet
            unitPriceSet: $unitPriceSet
            discountPercentageSet: $discountPercentageSet
            igvPercentageSet: $igvPercentageSet
            perceptionPercentageSet: $perceptionPercentageSet
            commentSet: $commentSet
            totalDiscountSet: $totalDiscountSet
            totalValueSet: $totalValueSet
            totalIgvSet: $totalIgvSet
            totalAmountSet: $totalAmountSet
            totalPerceptionSet: $totalPerceptionSet
            totalToPaySet: $totalToPaySet
            wayPaySet: $wayPaySet
            totalSet: $totalSet
            descriptionSet: $descriptionSet
            discountForItem: $discountForItem
            discountGlobal: $discountGlobal
            discountPercentageGlobal: $discountPercentageGlobal
            igvType: $igvType
            totalDiscount: $totalDiscount
            totalTaxed: $totalTaxed
            totalUnaffected: $totalUnaffected
            totalExonerated: $totalExonerated
            totalIgv: $totalIgv
            totalFree: $totalFree
            totalAmount: $totalAmount
            totalPerception: $totalPerception
            totalToPay: $totalToPay
            totalPayed: $totalPayed
            totalTurned: $totalTurned
            creditNoteType: $creditNoteType
            parentOperationId: $parentOperationId
            hasPerception: $hasPerception
            hasRetention: $hasRetention
            hasDetraction: $hasDetraction
            perceptionType: $perceptionType
            perceptionPercentage: $perceptionPercentage
            retentionType: $retentionType
            totalRetention: $totalRetention
            retentionPercentage: $retentionPercentage
            detractionType: $detractionType
            detractionPaymentMethod: $detractionPaymentMethod
            totalDetraction: $totalDetraction
            detractionPercentage: $detractionPercentage
            observation: $observation
        ) {
            message
            error
        }
    }
`;
const initialStateSale = {
    id: 0,
    serial: "",
    correlative: "",
    emitDate: today,
    clientName: "",
    clientDocumentType: "",
    clientId: 0,
    igvType: 18,
    documentType: "48",
    currencyType: "PEN",
    saleExchangeRate: "",
    userId: 0,
    userName: "",
    operationdetailSet: [],
    cashflowSet: [],
    discountForItem: "",
    discountGlobal: "",
    discountPercentageGlobal: "",
    totalDiscount: "",
    totalTaxed: "",
    totalUnaffected: "",
    totalExonerated: "",
    totalIgv: "",
    totalFree: "",
    totalAmount: "",

    totalToPay: "",
    totalPayed: "",
    totalTurned: "",
    creditNoteType: "NA",
    observation: "",
    // perceptionType: 0,
    // retentionType: 0,
    parentOperationId: 0,
    operationType: "0101",

    hasPerception: false,
    hasRetention: false,
    hasDetraction: false,

    perceptionType: 0,
    totalPerception: "",
    perceptionPercentage: "",

    retentionType: 0,
    totalRetention: "",
    retentionPercentage: "",

    detractionType: 0,
    detractionPaymentMethod: 0,
    totalDetraction: "",
    detractionPercentage: "",
};
const initialStateSaleDetail = {
    id: 0,
    productId: 0,
    productName: "",
    description: "",

    quantity: "",
    maxQuantity: "",

    unitValue: "",
    unitPrice: "",
    igvPercentage: "",
    discountPercentage: "",
    totalDiscount: "",
    totalValue: "",
    totalIgv: "",
    totalAmount: "",
    totalPerception: "",
    totalToPay: "",

    typeAffectationId: 0,
    productTariffId: 0,
    remainingQuantity: 0,

    temporaryId: 0,
};
const initialStateProduct = {
    id: 0,
    name: "",
    code: "",

    available: true,
    activeType: "01",
    ean: "",
    weightInKilograms: 0,

    typeAffectationId: 0,
    subjectPerception: false,
    observation: "",

    priceWithIgv1: 0,
    priceWithoutIgv1: 0,

    priceWithIgv2: 0,
    priceWithoutIgv2: 0,

    priceWithIgv3: 0,
    priceWithoutIgv3: 0,

    priceWithIgv4: 0,
    priceWithoutIgv4: 0,

    minimumUnitId: 0,
    maximumUnitId: 0,
    maximumFactor: "1",
    minimumFactor: "1",

    onSaveSuccess(): void {},
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
};
function NewQuotePage() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [sale, setSale] = useState(initialStateSale);
    const [saleDetail, setSaleDetail] = useState(initialStateSaleDetail);

    const [person, setPerson] = useState(initialStatePerson);
    const [product, setProduct] = useState(initialStateProduct);
    const [modalProduct, setModalProduct] = useState<Modal | any>(null);
    const [modalAddDetail, setModalAddDetail] = useState<Modal | any>(null);

    const [modalAddClient, setModalAddClient] = useState<Modal | any>(null);
    const [clientSearch, setClientSearch] = useState("");
    const auth = useAuth();
    const clientInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const authContext = useMemo(
        () => ({
            headers: {
                "Content-Type": "application/json",
                Authorization: auth?.jwtToken ? `JWT ${auth.jwtToken}` : "",
            },
        }),
        [auth?.jwtToken]
    );
    const getVariables = () => ({
        subsidiaryId: Number(auth?.user?.subsidiaryId),
        available: true,
    });

    const {
        loading: productsLoading,
        error: productsError,
        data: productsData,
    } = useQuery(PRODUCTS_QUERY, {
        context: authContext,
        variables: getVariables(),
        fetchPolicy: "network-only",
        onError: (err) => console.error("Error in products:", err),
        skip: !auth?.jwtToken,
    });
    const {
        loading: typeAffectationsLoading,
        error: typeAffectationsError,
        data: typeAffectationsData,
    } = useQuery(TYPE_AFFECTATION_QUERY, {
        context: authContext,
        skip: !auth?.jwtToken,
    });
    const {
        loading: operationTypesLoading,
        error: operationTypesError,
        data: operationTypesData,
    } = useQuery(TYPE_OPERATION_QUERY, {
        context: authContext,
        skip: !auth?.jwtToken,
    });

    const {
        loading: perceptionTypesLoading,
        error: perceptionTypesError,
        data: perceptionTypesData,
    } = useQuery(PERCEPTION_TYPE_QUERY, {
        context: authContext,
        skip: !auth?.jwtToken,
    });
    const {
        loading: retentionTypesLoading,
        error: retentionTypesError,
        data: retentionTypesData,
    } = useQuery(RETENTION_TYPE_QUERY, {
        context: authContext,
        skip: !auth?.jwtToken,
    });
    const {
        loading: detractionTypesLoading,
        error: detractionTypesError,
        data: detractionTypesData,
    } = useQuery(DETRACTION_TYPE_QUERY, {
        context: authContext,
        skip: !auth?.jwtToken,
    });
    const {
        loading: detractionPaymentMethodsLoading,
        error: detractionPaymentMethodsError,
        data: detractionPaymentMethodsData,
    } = useQuery(DETRACTION_PAYMENT_METHOD_QUERY, {
        context: authContext,
        skip: !auth?.jwtToken,
    });
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
    const handleClientSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        setClientSearch(event.target.value);
    };
    const handleClientSelect = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedOption = event.target.value;

        const selectedData = searchClientData?.searchClientByParameter?.find(
            (person: IPerson) =>
                `${person.documentNumber} ${person.names}` === selectedOption
        );

        if (selectedData) {
            setSale({
                ...sale,
                clientId: selectedData.id,
                clientName: selectedData.names,
                clientDocumentType: selectedData?.documentType?.replace(
                    "A_",
                    ""
                ),
            });
        }
    };
    const handleSale = (
        event: ChangeEvent<
            HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = event.target;
        setSale({ ...sale, [name]: value });
        // TODO: LOGIC HERE
    };
    const handleProduct = (
        event: ChangeEvent<
            HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = event.target;

        if (name === "name" && event.target instanceof HTMLInputElement) {
            const dataList = event.target.list;
            if (dataList) {
                const normalizedValue = value.replace(/[\n\r\s]+/g, " ").trim();
                const option = Array.from(dataList.options).find((option) => {
                    const normalizedOptionValue = option.value
                        .replace(/[\n\r\s]+/g, " ")
                        .trim();
                    return (
                        normalizedValue === normalizedOptionValue ||
                        normalizedValue.startsWith(normalizedOptionValue) ||
                        normalizedOptionValue.startsWith(normalizedValue)
                    );
                });
                if (option) {
                    const selectedId = option.getAttribute("data-key");
                    setProduct({
                        ...product,
                        id: Number(selectedId),
                        name: value,
                    });

                    modalAddDetail.show();
                    // setPurchaseDetail({...purchaseDetail, id: 0});
                } else {
                    setProduct({ ...product, id: 0, name: value });
                }
            } else {
                console.log("sin datalist");
            }
        } else setProduct({ ...product, [name]: value });
    };
    function useCustomMutation(mutation: DocumentNode) {
        return useMutation(mutation, {
            context: authContext,
            onError: (err) => console.error("Error in unit:", err), // Log the error for debugging
        });
    }
    const [createSale] = useCustomMutation(CREATE_SALE_MUTATION);
    const handleSaveSale = useCallback(async () => {
        // Validate client and sale details
        if (Number(sale.clientId) === 0) {
            toast("Por favor ingrese un cliente.", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
            });
            clientInputRef.current?.focus();
            return false;
        }

        if (sale.operationdetailSet.length === 0) {
            toast("Por favor ingrese al menos un item.", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
            });
            return false;
        }
        if (isProcessing) return;
        setIsProcessing(true);
        console.log("invoice", sale);
        try {
            const variables = {
                serial: sale.serial,
                correlative: parseInt(
                    sale.correlative === "" ? "0" : sale.correlative
                ),
                operationType: sale.operationType,
                documentType: sale.documentType,
                currencyType: sale.currencyType,
                saleExchangeRate: parseFloat(sale.saleExchangeRate) || 0,
                emitDate: sale.emitDate,
                clientId: Number(sale.clientId),
                productTariffIdSet: sale.operationdetailSet.map(
                    (item: any) => item.productTariffId
                ),
                typeAffectationIdSet: sale.operationdetailSet.map(
                    (item: any) => item.typeAffectationId
                ),
                quantitySet: sale.operationdetailSet.map((item: any) =>
                    parseInt(item.quantity)
                ),
                unitValueSet: sale.operationdetailSet.map((item: any) =>
                    parseFloat(item.unitValue)
                ),
                unitPriceSet: sale.operationdetailSet.map((item: any) =>
                    parseFloat(item.unitPrice)
                ),
                discountPercentageSet: sale.operationdetailSet.map(
                    (item: any) => parseFloat(item.discountPercentage) || 0
                ),
                igvPercentageSet: sale.operationdetailSet.map((item: any) =>
                    parseFloat(item.igvPercentage)
                ),
                perceptionPercentageSet: sale.operationdetailSet.map(
                    (item: any) => parseFloat(item.totalPerception) || 0
                ),
                commentSet: sale.operationdetailSet.map(
                    (item: any) => String(item.description) || ""
                ),
                totalDiscountSet: sale.operationdetailSet.map(
                    (item: any) => parseFloat(item.totalDiscount) || 0
                ),
                totalValueSet: sale.operationdetailSet.map((item: any) =>
                    parseFloat(item.totalValue)
                ),
                totalIgvSet: sale.operationdetailSet.map((item: any) =>
                    parseFloat(item.totalIgv)
                ),
                totalAmountSet: sale.operationdetailSet.map((item: any) =>
                    parseFloat(item.totalAmount)
                ),
                totalPerceptionSet: sale.operationdetailSet.map(
                    (item: any) => parseFloat(item.totalPerception) || 0
                ),
                totalToPaySet: sale.operationdetailSet.map(
                    (item: any) => parseFloat(item.totalToPay) || 0
                ),
                wayPaySet: sale.cashflowSet.map((item: any) => item.wayPay),
                totalSet: sale.cashflowSet.map((item: any) =>
                    Number(item.total)
                ),
                descriptionSet: sale.cashflowSet.map(
                    (item: any) => item.description || ""
                ),
                discountForItem: parseFloat(sale.discountForItem) || 0,
                discountGlobal: parseFloat(sale.discountGlobal) || 0,
                discountPercentageGlobal:
                    parseFloat(sale.discountPercentageGlobal) || 0,
                igvType: Number(sale.igvType),
                totalDiscount: parseFloat(sale.totalDiscount) || 0,
                totalTaxed: parseFloat(sale.totalTaxed),
                totalUnaffected: parseFloat(sale.totalUnaffected),
                totalExonerated: parseFloat(sale.totalExonerated),
                totalIgv: parseFloat(sale.totalIgv),
                totalFree: parseFloat(sale.totalFree) || 0,
                totalAmount: parseFloat(sale.totalAmount),
                totalPerception: parseFloat(sale.totalPerception) || 0,
                totalToPay: parseFloat(sale.totalToPay) || 0,
                totalPayed: parseFloat(sale.totalPayed) || 0,
                totalTurned: parseFloat(sale.totalTurned) || 0,
                creditNoteType: sale.creditNoteType,
                parentOperationId: Number(sale.parentOperationId) || 0,

                hasPerception: sale.hasPerception,
                hasRetention: sale.hasRetention,
                hasDetraction: sale.hasDetraction,

                perceptionType: Number(sale.perceptionType),
                perceptionPercentage: Number(sale.perceptionPercentage),

                retentionType: Number(sale.retentionType),
                totalRetention: Number(sale.totalRetention),
                retentionPercentage: Number(sale.retentionPercentage),

                detractionType: Number(sale.detractionType),
                detractionPaymentMethod: Number(sale.detractionPaymentMethod),
                totalDetraction: Number(sale.totalDetraction),
                detractionPercentage: Number(sale.detractionPercentage),

                observation: sale.observation || "",
            };
            console.log("variables", variables);
            const { data, errors } = await createSale({
                variables: variables,
            });

            if (errors) {
                toast(errors.toString(), {
                    hideProgressBar: true,
                    autoClose: 2000,
                    type: "error",
                });
            } else {
                if (data.createSale.error) {
                    toast(data.createSale.message, {
                        hideProgressBar: true,
                        autoClose: 2000,
                        type: "error",
                    });
                } else {
                    toast(data.createSale.message, {
                        hideProgressBar: true,
                        autoClose: 2000,
                        type: "success",
                    });
                    // Use the new close function

                    router.push("/dashboard/quotes");
                }
            }
        } catch (error) {
            console.error("Error creating invoice:", error);
            toast("Error al guardar la venta", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "error",
            });
        } finally {
            setIsProcessing(false);
        }
    }, [
        createSale,
        sale,
        setSale,
        initialStateSale,
        isProcessing,
        setIsProcessing,
    ]);

    useEffect(() => {
        if (clientSearch.length > 2) {
            const queryVariables = {
                search: clientSearch,
                isClient: true,
            };
            searchClientQuery({
                variables: queryVariables,
            });
        }
    }, [clientSearch]);

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
                    <Breadcrumb
                        section={"Cotizaciones"}
                        article={"Nueva Cotización"}
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
                                            {/* IGV % */}
                                            <div>
                                                <label
                                                    htmlFor="igvType"
                                                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                                >
                                                    IGV %{" "}
                                                </label>
                                                <select
                                                    value={sale.igvType}
                                                    name="igvType"
                                                    onChange={handleSale}
                                                    className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                    required
                                                >
                                                    <option value={18}>
                                                        18%
                                                    </option>
                                                    <option value={10}>
                                                        10% (Ley 31556)
                                                    </option>
                                                    <option value={4}>
                                                        4% (IVAP)
                                                    </option>
                                                </select>
                                            </div>

                                            {/* Tipo operacion */}
                                            <div className="md:col-span-2">
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Tipo operacion
                                                </label>
                                                <select
                                                    value={sale.operationType}
                                                    name="operationType"
                                                    onChange={handleSale}
                                                    className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm uppercase"
                                                    required
                                                >
                                                    {operationTypesData?.allOperationTypes
                                                        ?.filter(
                                                            (
                                                                o: IOperationType
                                                            ) =>
                                                                [
                                                                    "0101", // Venta interna
                                                                    // "0200", // Exportación
                                                                    // "0502", // Anticipos
                                                                    // "0401", // Ventas no domiciliados
                                                                    "1001", // Operación Sujeta a Detracción
                                                                    // "1002", // Operación Sujeta a Detracción- Recursos Hidrobiológicos
                                                                    // "1003", // Operación Sujeta a Detracción- Servicios de Transporte Pasajeros
                                                                    // "1004", // Operación Sujeta a Detracción- Servicios de Transporte Carga
                                                                    "2001", // Operación Sujeta a Percepción
                                                                ].includes(
                                                                    o.code
                                                                )
                                                        )
                                                        .map(
                                                            (
                                                                o: IOperationType,
                                                                k: number
                                                            ) => (
                                                                <option
                                                                    key={k}
                                                                    value={
                                                                        o.code
                                                                    }
                                                                >
                                                                    {`[${o.code}] `}
                                                                    {o.name}
                                                                </option>
                                                            )
                                                        )}
                                                </select>
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
                                                    value={sale.emitDate}
                                                    onChange={handleSale}
                                                    onFocus={(e) =>
                                                        e.target.select()
                                                    }
                                                    className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                    required
                                                />
                                            </div>
                                            {/* Moneda */}
                                            <div>
                                                <label
                                                    htmlFor="currencyType"
                                                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                                >
                                                    Moneda
                                                </label>
                                                <select
                                                    value={sale.currencyType}
                                                    name="currencyType"
                                                    onChange={handleSale}
                                                    className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                >
                                                    <option value={0} disabled>
                                                        Moneda
                                                    </option>
                                                    <option value={"PEN"}>
                                                        S/ PEN - SOLES
                                                    </option>
                                                    <option value={"USD"}>
                                                        US$ USD - DÓLARES
                                                        AMERICANOS
                                                    </option>
                                                    <option value={"EUR"}>
                                                        € EUR - EUROS
                                                    </option>
                                                    <option value={"GBP"}>
                                                        £ GBP - LIBRA ESTERLINA
                                                    </option>
                                                </select>
                                            </div>

                                            {sale.currencyType !== "PEN" && (
                                                <>
                                                    {/* Tipo de Cambio */}
                                                    <div>
                                                        <label
                                                            htmlFor="saleExchangeRate"
                                                            className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                                        >
                                                            Tipo de cambio
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="saleExchangeRate"
                                                            id="saleExchangeRate"
                                                            maxLength={10}
                                                            value={
                                                                sale.saleExchangeRate
                                                            }
                                                            onChange={
                                                                handleSale
                                                            }
                                                            onFocus={(e) =>
                                                                e.target.select()
                                                            }
                                                            className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                            autoComplete="off"
                                                        />
                                                    </div>
                                                </>
                                            )}
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
                                                    Datos del Cliente
                                                    <span className="text-xs font-normal text-cyan-500 dark:text-cyan-400">
                                                        (Buscar por RUC/DNI o
                                                        Nombre)
                                                    </span>
                                                </span>
                                            </div>
                                        </legend>
                                        <div className="grid gap-6 lg:grid-cols-4 sm:grid-cols-1 md:grid-cols-2">
                                            {/* Cliente */}

                                            <div className="md:col-span-4">
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                    Cliente
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                                                        {sale.clientId > 0
                                                            ? "✓ Cliente seleccionado"
                                                            : "⚠️ Seleccione un cliente"}
                                                    </span>
                                                </label>
                                                <div className="relative w-full mt-1 group">
                                                    <input
                                                        ref={clientInputRef}
                                                        type="text"
                                                        className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                        maxLength={200}
                                                        value={clientSearch}
                                                        onChange={
                                                            handleClientSearchChange
                                                        }
                                                        onInput={
                                                            handleClientSelect
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
                                                            setSale({
                                                                ...sale,
                                                                clientName: "",
                                                                clientId: 0,
                                                            });
                                                            setClientSearch("");
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
                                </div>
                                {/* Búsqueda de Productos */}
                                <div className="p-6 border-2 border-emerald-200 dark:border-emerald-900 bg-white dark:bg-gray-900 rounded-xl shadow-lg relative group transition-all duration-300 hover:shadow-emerald-500/20 hover:shadow-2xl">
                                    <div className="flex items-center gap-2 mb-4 text-emerald-600 dark:text-emerald-400">
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
                                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                            />
                                        </svg>
                                        <h3 className="font-semibold text-sm">
                                            Búsqueda de Productos
                                        </h3>
                                    </div>
                                    <div className="relative w-full">
                                        <input
                                            type="text"
                                            className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            maxLength={100}
                                            value={product.name}
                                            name="name"
                                            onChange={handleProduct}
                                            onFocus={(e) => e.target.select()}
                                            autoComplete="off"
                                            disabled={productsLoading}
                                            placeholder="Buscar Producto..."
                                            list="productNameList"
                                            required
                                        />
                                        <datalist id="productNameList">
                                            {productsData?.allProducts?.map(
                                                (
                                                    n: IProduct,
                                                    index: number
                                                ) => (
                                                    <option
                                                        key={index}
                                                        data-key={n.id}
                                                        value={n.name
                                                            .replace(
                                                                /[\n\r\s]+/g,
                                                                " "
                                                            )
                                                            .trim()}
                                                    />
                                                )
                                            )}
                                        </datalist>
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 px-2.5 py-2 bg-blue-600 dark:bg-cyan-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                                            onClick={(e) => {
                                                modalProduct.show();
                                                setProduct({
                                                    ...initialStateProduct,
                                                    onSaveSuccess: () => {
                                                        modalProduct.hide();
                                                        modalAddDetail.show();
                                                        setSaleDetail(
                                                            initialStateSaleDetail
                                                        );
                                                    },
                                                });
                                            }}
                                        >
                                            <Add />
                                        </button>
                                    </div>
                                </div>
                                {/* Lista de Detalles */}
                                <div className="flex flex-col gap-4">
                                    <SaleDetailList
                                        invoice={sale}
                                        setInvoice={setSale}
                                        product={product}
                                        setProduct={setProduct}
                                        setInvoiceDetail={setSaleDetail}
                                        modalAddDetail={modalAddDetail}
                                    />
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            className="px-5 py-2 bg-blue-600 dark:bg-cyan-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
                                            onClick={(e) => {
                                                modalAddDetail.show();
                                                setSaleDetail(
                                                    initialStateSaleDetail
                                                );
                                            }}
                                        >
                                            <Add /> AGREGAR ITEM
                                        </button>
                                    </div>
                                </div>
                                <SaleTotalList
                                    invoice={sale}
                                    setSale={setSale}
                                    handleSale={handleSale}
                                    perceptionTypesData={perceptionTypesData}
                                    retentionTypesData={retentionTypesData}
                                    detractionTypesData={detractionTypesData}
                                    detractionPaymentMethodsData={
                                        detractionPaymentMethodsData
                                    }
                                />
                                {/* OBSERVACIONES */}
                                <fieldset className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                                    <legend className="px-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
                                        OBSERVACIONES
                                    </legend>
                                    <div className="grid  ">
                                        <div className="md:col-span-2">
                                            <label className="text-sm text-gray-700 dark:text-gray-200">
                                                Observaciones
                                            </label>
                                            <textarea
                                                name="observation"
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                maxLength={500}
                                                value={sale.observation}
                                                onChange={handleSale}
                                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            ></textarea>
                                        </div>
                                    </div>
                                </fieldset>
                                {/* Botón Crear cotización */}
                                <div className="flex justify-end py-2">
                                    <button
                                        type="button"
                                        onClick={handleSaveSale}
                                        disabled={isProcessing}
                                        className={`px-5 py-2 bg-blue-600 dark:bg-cyan-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 flex items-center gap-2 ${
                                            sale?.operationdetailSet?.length ===
                                            0
                                                ? "cursor-not-allowed"
                                                : ""
                                        }`}
                                    >
                                        {isProcessing ? (
                                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                        ) : (
                                            <Save />
                                        )}
                                        {isProcessing
                                            ? "Guardando..."
                                            : "CREAR COTIZACIÓN"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ProductForm
                modalProduct={modalProduct}
                setModalProduct={setModalProduct}
                product={product}
                setProduct={setProduct}
                initialStateProduct={initialStateProduct}
                auth={auth}
                authContext={authContext}
                typeAffectationsData={typeAffectationsData}
                PRODUCTS_QUERY={PRODUCTS_QUERY}
                getVariables={getVariables}
            />
            <ClientForm
                modalAddClient={modalAddClient}
                setModalAddClient={setModalAddClient}
                person={person}
                setPerson={setPerson}
                jwtToken={auth?.jwtToken}
                authContext={authContext}
                SEARCH_CLIENT_BY_PARAMETER={SEARCH_CLIENT_BY_PARAMETER}
                sale={sale}
                setSale={setSale}
            />
            <SaleDetailForm
                modalAddDetail={modalAddDetail}
                setModalAddDetail={setModalAddDetail}
                product={product}
                setProduct={setProduct}
                invoiceDetail={saleDetail}
                setInvoiceDetail={setSaleDetail}
                invoice={sale}
                setInvoice={setSale}
                auth={auth}
                initialStateProduct={initialStateProduct}
                initialStateSaleDetail={initialStateSaleDetail}
                typeAffectationsData={typeAffectationsData}
                productsData={productsData}
            />
        </>
    );
}

export default NewQuotePage;
