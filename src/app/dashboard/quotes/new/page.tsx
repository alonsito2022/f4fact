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
import Search from "@/components/icons/Search";
import ProductForm from "../../logistics/products/ProductForm";
import { toast } from "react-toastify";
import { useAuth } from "@/components/providers/AuthProvider";
import SunatCancel from "@/components/icons/SunatCancel";
import ClientForm from "../../sales/ClientForm";
import SaleTotalList from "../../sales/SaleTotalList";
import { useRouter } from "next/navigation";
import SaleDetailList from "../../sales/SaleDetailList";
import SaleDetailForm from "../../sales/SaleDetailForm";
import QuoteHeader from "./QuoteHeader";
import QuoteClient from "./QuoteClient";
import QuoteSearchProduct from "./QuoteSearchProduct";

const limaDate = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Lima" })
);
const today =
    limaDate.getFullYear() +
    "-" +
    String(limaDate.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(limaDate.getDate()).padStart(2, "0");
const SERIALS_QUERY = gql`
    query ($subsidiaryId: Int) {
        allSerials(subsidiaryId: $subsidiaryId) {
            documentType
            documentTypeReadable
            serial
            isGeneratedViaApi
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
const PRODUCTS_QUERY = gql`
    query ($subsidiaryId: Int!, $available: Boolean!) {
        allProducts(subsidiaryId: $subsidiaryId, available: $available) {
            id
            code
            barcode
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
const PRODUCT_DETAIL_QUERY = gql`
    query ($productId: Int!) {
        productDetailByProductId(productId: $productId) {
            stock
            priceWithoutIgv3
            priceWithIgv3
            productTariffId3
            typeAffectationId
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
        $dueDate: Date!
        $clientId: Int!
        $productTariffIdSet: [Int!]!
        $typeAffectationIdSet: [Int!]!
        $quantitySet: [Float!]!
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
            dueDate: $dueDate
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
    dueDate: today,
    clientName: "",
    clientDocumentType: "",
    clientId: 0,
    igvType: 18,
    documentType: "48",
    currencyType: "PEN",
    saleExchangeRate: "",
    userId: 0,
    userName: "",
    operationdetailSet: [] as IOperationDetail[],
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
    nextTemporaryId: 1,
};
const initialStateSaleDetail = {
    id: 0,
    productId: 0,
    productName: "",
    description: "",

    quantity: "1",
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
    stock: 0,

    temporaryId: 0,

    wholesalePriceWithIgv: 0,
    wholesaleQuantityThreshold: 0,
    maximumFactor: 0,
};
const initialStateProduct = {
    id: 0,
    name: "",
    code: "",
    barcode: "",

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
    stock: 0,
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
    const [barcodeInput, setBarcodeInput] = useState("");
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
    const [clientSearch, setClientSearch] = useState("");
    const {
        loading: serialsAssignedLoading,
        error: serialsAssignedError,
        data: serialsAssignedData,
    } = useQuery(SERIALS_QUERY, {
        context: authContext,
        fetchPolicy: "network-only",
        variables: {
            subsidiaryId: Number(auth?.user?.subsidiaryId),
        },
        skip: !auth?.jwtToken,
    });
    const [productDetailQuery] = useLazyQuery(PRODUCT_DETAIL_QUERY);
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
    useEffect(() => {
        if (serialsAssignedData?.allSerials?.length > 0) {
            const filteredSeries = serialsAssignedData.allSerials.filter(
                (s: ISerialAssigned) =>
                    s.documentType === `A_${sale.documentType}` &&
                    !s.isGeneratedViaApi
            );

            if (filteredSeries.length > 0) {
                setSale((prev) => ({
                    ...prev,
                    serial: filteredSeries[0].serial,
                }));
            } else {
                setSale((prev) => ({
                    ...prev,
                    serial: "",
                }));
            }
        }
    }, [serialsAssignedData, sale.documentType]);
    const handleQuote = (
        event: ChangeEvent<
            HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = event.target;
        setSale({ ...sale, [name]: value });
        // TODO: LOGIC HERE
    };

    // Función para manejar la búsqueda por código de barras
    const handleBarcodeSearch = async (barcode: string) => {
        if (!barcode.trim()) return;

        const foundProduct = productsData?.allProducts?.find(
            (p: IProduct) => p.barcode === barcode.trim()
        );

        if (!foundProduct) {
            toast.error("Producto no encontrado con este código de barras");
            setBarcodeInput("");
            return;
        }

        // Obtener los detalles del producto para obtener productTariffId y stock
        try {
            const result = await productDetailQuery({
                context: authContext,
                variables: { productId: Number(foundProduct.id) },
                fetchPolicy: "network-only",
            });

            const productDetail = result.data?.productDetailByProductId;

            if (!productDetail) {
                toast.error("Error al obtener detalles del producto");
                setBarcodeInput("");
                return;
            }

            // Crear un detalle de venta con el producto encontrado
            const newSaleDetail: IOperationDetail = {
                id: 0,
                productId: Number(foundProduct.id),
                productName: foundProduct.name,
                description: "",
                quantity: 1,
                unitValue: productDetail.priceWithoutIgv3 || 0,
                unitPrice: productDetail.priceWithIgv3 || 0,
                igvPercentage: sale.igvType || 18,
                discountPercentage: 0,
                totalDiscount: 0,
                totalValue: productDetail.priceWithoutIgv3 || 0,
                totalIgv:
                    ((productDetail.priceWithoutIgv3 || 0) *
                        (sale.igvType || 18)) /
                    100,
                totalAmount: productDetail.priceWithIgv3 || 0,
                totalPerception: 0,
                totalToPay: productDetail.priceWithIgv3 || 0,
                typeAffectationId: productDetail.typeAffectationId || 1,
                productTariffId: Number(productDetail.productTariffId3) || 0,
                temporaryId: sale.nextTemporaryId || 1,
            };

            // Agregar el detalle a la venta
            setSale((prevSale) => ({
                ...prevSale,
                operationdetailSet: [
                    ...(prevSale.operationdetailSet || []),
                    newSaleDetail,
                ],
                nextTemporaryId: (prevSale.nextTemporaryId || 1) + 1,
            }));

            toast.success(`Producto agregado: ${foundProduct.name}`);
            setBarcodeInput("");
        } catch (error) {
            console.error("Error al agregar producto:", error);
            toast.error("Error al agregar el producto al detalle");
            setBarcodeInput("");
        }
    };

    // Función para manejar la tecla Enter en el input de código de barras
    const handleBarcodeKeyPress = (
        event: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (event.key === "Enter") {
            event.preventDefault();
            handleBarcodeSearch(barcodeInput);
        }
    };

    function useCustomMutation(mutation: DocumentNode) {
        return useMutation(mutation, {
            context: authContext,
            onError: (err) => console.error("Error in unit:", err), // Log the error for debugging
        });
    }
    const [createSale] = useCustomMutation(CREATE_SALE_MUTATION);
    const handleSaveQuote = useCallback(async () => {
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
                dueDate: sale.dueDate,
                clientId: Number(sale.clientId),
                productTariffIdSet: sale.operationdetailSet.map(
                    (item: any) => item.productTariffId
                ),
                typeAffectationIdSet: sale.operationdetailSet.map(
                    (item: any) => item.typeAffectationId
                ),
                quantitySet: sale.operationdetailSet.map((item: any) =>
                    parseFloat(item.quantity)
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
                                    <QuoteHeader
                                        sale={sale}
                                        handleQuote={handleQuote}
                                        operationTypesData={operationTypesData}
                                        serialsAssignedData={
                                            serialsAssignedData
                                        }
                                    />
                                    <QuoteClient
                                        sale={sale}
                                        setSale={setSale}
                                        setPerson={setPerson}
                                        initialStatePerson={initialStatePerson}
                                        clientInputRef={clientInputRef}
                                        modalAddClient={modalAddClient}
                                        authContext={authContext}
                                        SEARCH_CLIENT_BY_PARAMETER={
                                            SEARCH_CLIENT_BY_PARAMETER
                                        }
                                        setClientSearch={setClientSearch}
                                        clientSearch={clientSearch}
                                    />
                                </div>
                                {/* Búsqueda de Productos */}
                                <QuoteSearchProduct
                                    modalProduct={modalProduct}
                                    product={product}
                                    productsLoading={productsLoading}
                                    productsData={productsData}
                                    setProduct={setProduct}
                                    initialStateProduct={initialStateProduct}
                                    modalAddDetail={modalAddDetail}
                                    setSaleDetail={setSaleDetail}
                                    initialStateSaleDetail={
                                        initialStateSaleDetail
                                    }
                                    barcodeInput={barcodeInput}
                                    setBarcodeInput={setBarcodeInput}
                                    handleBarcodeSearch={handleBarcodeSearch}
                                    handleBarcodeKeyPress={
                                        handleBarcodeKeyPress
                                    }
                                />
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
                                    handleQuote={handleQuote}
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
                                                onChange={handleQuote}
                                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            ></textarea>
                                        </div>
                                    </div>
                                </fieldset>
                                {/* Botón Crear cotización */}
                                <div className="flex justify-end py-2">
                                    <button
                                        type="button"
                                        onClick={handleSaveQuote}
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
                setClientSearch={setClientSearch}
                clientSearch={clientSearch}
                person={person}
                setPerson={setPerson}
                auth={auth}
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
