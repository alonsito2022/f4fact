"use client";
import {
    ICreditNoteType,
    IOperationDetail,
    IOperationType,
    ISerialAssigned,
    ITypeAffectation,
} from "@/app/types";
import Breadcrumb from "@/components/Breadcrumb";
import { useAuth } from "@/components/providers/AuthProvider";
import {
    DocumentNode,
    gql,
    useLazyQuery,
    useMutation,
    useQuery,
} from "@apollo/client";
import { useParams } from "next/navigation";
import React, {
    ChangeEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import Save from "@/components/icons/Save";
import { toast } from "react-toastify";
import QuoteHeader from "../../new/QuoteHeader";
import QuoteClient from "../../new/QuoteClient";
import { Modal } from "flowbite";
import SaleTotalList from "@/app/dashboard/sales/SaleTotalList";
import SaleDetailList from "@/app/dashboard/sales/SaleDetailList";
import QuoteSearchProduct from "../../new/QuoteSearchProduct";
import Add from "@/components/icons/Add";
import { useRouter } from "next/navigation";
import ProductForm from "@/app/dashboard/logistics/products/ProductForm";
import ClientForm from "@/app/dashboard/sales/ClientForm";
import SaleDetailForm from "@/app/dashboard/sales/SaleDetailForm";
// Replace the current today constant with this:
const limaDate = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Lima" })
);
const today =
    limaDate.getFullYear() +
    "-" +
    String(limaDate.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(limaDate.getDate()).padStart(2, "0");

const QUOTE_QUERY_BY_ID = gql`
    query ($pk: ID!) {
        getSaleById(pk: $pk) {
            id
            emitDate
            dueDate
            operationDate
            currencyType
            documentTypeReadable
            documentType
            igvType
            igvPercentage
            operationType
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
            sendClient
            linkXml
            linkXmlLow
            linkCdr
            linkCdrLow
            sunatStatus
            operationStatusReadable
            sunatDescription
            sunatDescriptionLow
            codeHash
            client {
                id
                names
                documentNumber
            }
            subsidiary {
                company {
                    businessName
                }
            }
            operationdetailSet {
                id
                productId
                productName
                quantity
                unitValue
                unitPrice
                igvPercentage
                discountPercentage
                totalDiscount
                totalValue
                totalIgv
                totalAmount
                totalPerception
                totalToPay
                typeAffectationId
                productTariffId
                quantityReturned
                quantityAvailable
                description
            }
        }
    }
`;
const UPDATE_QUOTE_MUTATION = gql`
    mutation UpdateQuote(
        $quoteId: ID!
        $serial: String
        $correlative: Int
        $operationType: String
        $documentType: String
        $currencyType: String
        $saleExchangeRate: Float
        $emitDate: Date
        $dueDate: Date
        $clientId: Int
        $productTariffIdSet: [Int!]
        $typeAffectationIdSet: [Int!]
        $quantitySet: [Float!]
        $unitValueSet: [Float!]
        $unitPriceSet: [Float!]
        $discountPercentageSet: [Float!]
        $igvPercentageSet: [Float!]
        $perceptionPercentageSet: [Float!]
        $commentSet: [String!]
        $totalDiscountSet: [Float!]
        $totalValueSet: [Float!]
        $totalIgvSet: [Float!]
        $totalAmountSet: [Float!]
        $totalPerceptionSet: [Float!]
        $totalToPaySet: [Float!]
        $wayPaySet: [Int!]
        $totalSet: [Float!]
        $descriptionSet: [String!]
        $discountForItem: Float
        $discountGlobal: Float
        $discountPercentageGlobal: Float
        $igvType: Int
        $totalDiscount: Float
        $totalTaxed: Float
        $totalUnaffected: Float
        $totalExonerated: Float
        $totalIgv: Float
        $totalFree: Float
        $totalAmount: Float
        $totalPerception: Float
        $totalToPay: Float
        $totalPayed: Float
        $totalTurned: Float
        $observation: String
    ) {
        updateQuote(
            quoteId: $quoteId
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

            observation: $observation
        ) {
            message
            error
        }
    }
`;
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
const initialStateQuote = {
    id: 0,
    serial: "",
    correlative: "",
    emitDate: today,
    dueDate: today,
    clientName: "",
    clientDocumentType: "",
    clientId: 0,
    igvType: 18,
    igvPercentage: 18,
    operationType: "0101",
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
    totalPerception: "",
    totalToPay: "",
    totalPayed: "",
    totalTurned: "",

    observation: "",

    creditNoteType: "NA",
    parentOperationId: 0,
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
    stock: 0,
};
function EditQuotePage() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [quote, setQuote] = useState(initialStateQuote);
    const [saleDetail, setSaleDetail] = useState(initialStateSaleDetail);

    const [person, setPerson] = useState(initialStatePerson);
    const [initialClientData, setInitialClientData] = useState({
        id: 0,
        names: "",
        documentNumber: "",
    });
    const [product, setProduct] = useState(initialStateProduct);
    const [modalProduct, setModalProduct] = useState<Modal | any>(null);
    const [modalAddDetail, setModalAddDetail] = useState<Modal | any>(null);
    const [modalAddClient, setModalAddClient] = useState<Modal | any>(null);
    const [clientSearch, setClientSearch] = useState("");
    const params = useParams();
    const { quoteId } = params;
    const clientInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
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
    const {
        loading: typeAffectationsLoading,
        error: typeAffectationsError,
        data: typeAffectationsData,
    } = useQuery(TYPE_AFFECTATION_QUERY, {
        context: authContext,
        skip: !auth?.jwtToken,
    });
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
    const [
        saleQuery,
        { loading: quoteLoading, error: quoteError, data: quoteData },
    ] = useLazyQuery(QUOTE_QUERY_BY_ID, {
        context: authContext,
        fetchPolicy: "network-only",
        onCompleted: (data) => {
            const dataQuote = data.getSaleById;
            const decimalIgv = Number(dataQuote?.igvPercentage) / 100;
            const formattedOperationdetailSet =
                dataQuote.operationdetailSet.map(
                    (detail: IOperationDetail, index: number) => {
                        const productDetail = detail;
                        const calculatedUnitValue =
                            Number(productDetail?.unitPrice) / (1 + decimalIgv);
                        let totalValue =
                            calculatedUnitValue *
                                Number(productDetail.quantityAvailable) -
                            Number(productDetail.totalDiscount);
                        let totalIgv = totalValue * decimalIgv;
                        let totalAmount = totalValue + totalIgv;
                        return {
                            ...detail,
                            quantity: Number(
                                detail.quantityAvailable
                            ).toString(),
                            quantityReturned: Number(detail.quantityReturned),
                            quantityAvailable: Number(detail.quantityAvailable),
                            unitValue: Number(calculatedUnitValue).toFixed(6),
                            unitPrice: Number(detail.unitPrice).toFixed(6),
                            igvPercentage: Number(
                                dataQuote?.igvPercentage
                            ).toFixed(2),
                            discountPercentage: Number(
                                detail.discountPercentage
                            ).toFixed(2),
                            totalDiscount: Number(detail.totalDiscount).toFixed(
                                2
                            ),
                            totalValue: Number(totalValue).toFixed(2),
                            totalIgv: Number(totalIgv).toFixed(2),
                            totalAmount: Number(totalAmount).toFixed(2),
                            totalPerception: Number(
                                detail.totalPerception
                            ).toFixed(2),
                            totalToPay: Number(totalAmount).toFixed(2),
                            temporaryId: index + 1,
                            productTariffId: Number(detail.productTariffId),
                            id: Number(detail.id),
                            description: String(detail.description || ""),
                            stock: 0,
                        };
                    }
                );

            setQuote((prevSale) => ({
                ...prevSale,
                id: Number(dataQuote?.id),
                serial: dataQuote?.serial,
                correlative: dataQuote?.correlative,
                igvType: Number(
                    dataQuote?.igvType?.toString().replace("A_", "")
                ),
                currencyType: dataQuote?.currencyType,
                saleExchangeRate: dataQuote?.saleExchangeRate
                    ? dataQuote?.saleExchangeRate
                    : "",
                operationdetailSet: formattedOperationdetailSet,
                clientId: Number(dataQuote?.client?.id),
                clientName: dataQuote?.client?.names,
                parentOperationId: Number(dataQuote?.id),
                totalAmount: Number(dataQuote?.totalAmount).toFixed(2),
                totalFree: Number(dataQuote?.totalFree).toFixed(2),
                totalIgv: Number(dataQuote?.totalIgv).toFixed(2),
                totalTaxed: Number(dataQuote?.totalTaxed).toFixed(2),
                totalUnaffected: Number(dataQuote?.totalUnaffected).toFixed(2),
                totalExonerated: Number(dataQuote?.totalExonerated).toFixed(2),
                totalDiscount: Number(dataQuote?.totalDiscount).toFixed(2),
                discountForItem: Number(
                    dataQuote?.discountForItem ? dataQuote?.discountForItem : 0
                ).toFixed(2),
                discountGlobal: Number(
                    dataQuote?.discountGlobal ? dataQuote?.discountGlobal : 0
                ).toFixed(2),
                totalPerception: Number(
                    dataQuote?.totalPerception ? dataQuote?.totalPerception : 0
                ).toFixed(2),
                totalToPay: Number(dataQuote?.totalToPay).toFixed(2),
                nextTemporaryId: formattedOperationdetailSet.length + 1,
            }));
            setInitialClientData({
                id: dataQuote?.client.id,
                names: dataQuote?.client.names,
                documentNumber: dataQuote?.client.documentNumber,
            });
            setIsLoading(false);
        },
        onError: (err) => {
            console.error("Error in sale:", err, auth?.jwtToken);
            setIsLoading(false);
        },
    });
    useEffect(() => {
        if (serialsAssignedData?.allSerials?.length > 0) {
            const filteredSeries = serialsAssignedData.allSerials.filter(
                (s: ISerialAssigned) =>
                    s.documentType === `A_${quote.documentType}` &&
                    !s.isGeneratedViaApi
            );

            if (filteredSeries.length > 0) {
                setQuote((prev) => ({
                    ...prev,
                    serial: filteredSeries[0].serial,
                }));
            } else {
                setQuote((prev) => ({
                    ...prev,
                    serial: "",
                }));
            }
        }
    }, [serialsAssignedData, quote.documentType]);
    const handleSale = (
        event: ChangeEvent<
            HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = event.target;
        setQuote({ ...quote, [name]: value });
        // TODO: LOGIC HERE
    };
    function useCustomMutation(mutation: DocumentNode) {
        return useMutation(mutation, {
            context: authContext,
            onError: (err) => console.error("Error in unit:", err), // Log the error for debugging
        });
    }
    const [updateQuote] = useCustomMutation(UPDATE_QUOTE_MUTATION);
    const handleSaveSale = useCallback(async () => {
        // Validate client and sale details
        if (Number(quote.clientId) === 0) {
            toast("Por favor ingrese un cliente.", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
            });
            clientInputRef.current?.focus();
            return false;
        }

        if (quote.operationdetailSet.length === 0) {
            toast("Por favor ingrese al menos un item.", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
            });
            return false;
        }
        if (isProcessing) return;
        setIsProcessing(true);
        try {
            const variables = {
                quoteId: Number(quote.id),
                serial: quote.serial,
                correlative: parseInt(
                    quote.correlative === "" ? "0" : quote.correlative
                ),
                operationType: quote.operationType,
                documentType: quote.documentType,
                currencyType: quote.currencyType,
                saleExchangeRate: parseFloat(quote.saleExchangeRate) || 0,
                emitDate: quote.emitDate,
                dueDate: quote.dueDate,
                clientId: Number(quote.clientId),
                productTariffIdSet: quote.operationdetailSet.map(
                    (item: any) => item.productTariffId
                ),
                typeAffectationIdSet: quote.operationdetailSet.map(
                    (item: any) => item.typeAffectationId
                ),
                quantitySet: quote.operationdetailSet.map((item: any) =>
                    parseInt(item.quantity)
                ),
                unitValueSet: quote.operationdetailSet.map((item: any) =>
                    parseFloat(item.unitValue)
                ),
                unitPriceSet: quote.operationdetailSet.map((item: any) =>
                    parseFloat(item.unitPrice)
                ),
                discountPercentageSet: quote.operationdetailSet.map(
                    (item: any) => parseFloat(item.discountPercentage) || 0
                ),
                igvPercentageSet: quote.operationdetailSet.map((item: any) =>
                    parseFloat(item.igvPercentage)
                ),
                perceptionPercentageSet: quote.operationdetailSet.map(
                    (item: any) => parseFloat(item.totalPerception) || 0
                ),
                commentSet: quote.operationdetailSet.map(
                    (item: any) => String(item.description) || ""
                ),
                totalDiscountSet: quote.operationdetailSet.map(
                    (item: any) => parseFloat(item.totalDiscount) || 0
                ),
                totalValueSet: quote.operationdetailSet.map((item: any) =>
                    parseFloat(item.totalValue)
                ),
                totalIgvSet: quote.operationdetailSet.map((item: any) =>
                    parseFloat(item.totalIgv)
                ),
                totalAmountSet: quote.operationdetailSet.map((item: any) =>
                    parseFloat(item.totalAmount)
                ),
                totalPerceptionSet: quote.operationdetailSet.map(
                    (item: any) => parseFloat(item.totalPerception) || 0
                ),
                totalToPaySet: quote.operationdetailSet.map(
                    (item: any) => parseFloat(item.totalToPay) || 0
                ),
                wayPaySet: quote.cashflowSet.map((item: any) => item.wayPay),
                totalSet: quote.cashflowSet.map((item: any) =>
                    Number(item.total)
                ),
                descriptionSet: quote.cashflowSet.map(
                    (item: any) => item.description || ""
                ),
                discountForItem: parseFloat(quote.discountForItem) || 0,
                discountGlobal: parseFloat(quote.discountGlobal) || 0,
                discountPercentageGlobal:
                    parseFloat(quote.discountPercentageGlobal) || 0,
                igvType: Number(quote.igvType),
                totalDiscount: parseFloat(quote.totalDiscount) || 0,
                totalTaxed: parseFloat(quote.totalTaxed),
                totalUnaffected: parseFloat(quote.totalUnaffected),
                totalExonerated: parseFloat(quote.totalExonerated),
                totalIgv: parseFloat(quote.totalIgv),
                totalFree: parseFloat(quote.totalFree) || 0,
                totalAmount: parseFloat(quote.totalAmount),
                totalPerception: parseFloat(quote.totalPerception) || 0,
                totalToPay: parseFloat(quote.totalToPay) || 0,
                totalPayed: parseFloat(quote.totalPayed) || 0,
                totalTurned: parseFloat(quote.totalTurned) || 0,
                observation: quote.observation || "",
            };
            const { data, errors } = await updateQuote({
                variables: variables,
            });

            if (errors) {
                toast(errors.toString(), {
                    hideProgressBar: true,
                    autoClose: 2000,
                    type: "error",
                });
            } else {
                if (data.updateQuote.error) {
                    toast(data.updateQuote.message, {
                        hideProgressBar: true,
                        autoClose: 2000,
                        type: "error",
                    });
                } else {
                    toast(data.updateQuote.message, {
                        hideProgressBar: true,
                        autoClose: 2000,
                        type: "success",
                    });
                    // Use the new close function

                    router.push("/dashboard/quotes");
                }
            }
        } catch (error) {
            console.error("Error updating quote:", error);
            toast("Error al guardar la cotizacion", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "error",
            });
        } finally {
            setIsProcessing(false);
        }
    }, [
        updateQuote,
        quote,
        setQuote,
        initialStateQuote,
        isProcessing,
        setIsProcessing,
    ]);
    useEffect(() => {
        if (quoteId) {
            // Aquí puedes manejar el parámetro quoteId
            saleQuery({
                variables: {
                    pk: Number(quoteId),
                },
            });
        }
    }, [quoteId]);

    return (
        <>
            {isLoading ? (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <>
                    <div className="p-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 lg:mt-1.5 dark:bg-gray-800 dark:border-gray-700">
                        <div className="w-full mb-1">
                            <Breadcrumb
                                section={"Cotizaciones"}
                                article={"Editar Cotización"}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                        <div className="overflow-x-auto">
                            <div className="inline-block min-w-full align-middle">
                                <div className="overflow-hidden shadow-lg rounded-lg">
                                    {quoteLoading ? (
                                        <div className="p-4 text-center">
                                            <span className="loader"></span>{" "}
                                            {/* Puedes usar un spinner o cualquier otro indicador de carga */}
                                            Cargando cotización...
                                        </div>
                                    ) : quoteError ? (
                                        <div className="p-4 text-red-500 text-center">
                                            {quoteError.message}
                                        </div>
                                    ) : (
                                        <>
                                            <div className="p-4 md:p-5 space-y-4">
                                                <div className="grid gap-4 ">
                                                    <QuoteHeader
                                                        sale={quote}
                                                        handleQuote={handleSale}
                                                        operationTypesData={
                                                            operationTypesData
                                                        }
                                                        serialsAssignedData={
                                                            serialsAssignedData
                                                        }
                                                    />
                                                    <QuoteClient
                                                        sale={quote}
                                                        setSale={setQuote}
                                                        setPerson={setPerson}
                                                        initialStatePerson={
                                                            initialStatePerson
                                                        }
                                                        clientInputRef={
                                                            clientInputRef
                                                        }
                                                        modalAddClient={
                                                            modalAddClient
                                                        }
                                                        authContext={
                                                            authContext
                                                        }
                                                        SEARCH_CLIENT_BY_PARAMETER={
                                                            SEARCH_CLIENT_BY_PARAMETER
                                                        }
                                                        initialClientData={
                                                            initialClientData
                                                        }
                                                        clientSearch={
                                                            clientSearch
                                                        }
                                                        setClientSearch={
                                                            setClientSearch
                                                        }
                                                    />
                                                </div>
                                                {/* Búsqueda de Productos */}
                                                <QuoteSearchProduct
                                                    modalProduct={modalProduct}
                                                    product={product}
                                                    productsLoading={
                                                        productsLoading
                                                    }
                                                    productsData={productsData}
                                                    setProduct={setProduct}
                                                    initialStateProduct={
                                                        initialStateProduct
                                                    }
                                                    modalAddDetail={
                                                        modalAddDetail
                                                    }
                                                    setSaleDetail={
                                                        setSaleDetail
                                                    }
                                                    initialStateSaleDetail={
                                                        initialStateSaleDetail
                                                    }
                                                />
                                                {/* Lista de Detalles */}
                                                <div className="flex flex-col gap-4">
                                                    <SaleDetailList
                                                        invoice={quote}
                                                        setInvoice={setQuote}
                                                        product={product}
                                                        setProduct={setProduct}
                                                        setInvoiceDetail={
                                                            setSaleDetail
                                                        }
                                                        modalAddDetail={
                                                            modalAddDetail
                                                        }
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
                                                    invoice={quote}
                                                    setSale={setQuote}
                                                    handleSale={handleSale}
                                                    perceptionTypesData={
                                                        perceptionTypesData
                                                    }
                                                    retentionTypesData={
                                                        retentionTypesData
                                                    }
                                                    detractionTypesData={
                                                        detractionTypesData
                                                    }
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
                                                                value={
                                                                    quote.observation
                                                                }
                                                                onChange={
                                                                    handleSale
                                                                }
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
                                                            quote
                                                                ?.operationdetailSet
                                                                ?.length === 0
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
                                                            : "ACTUALIZAR COTIZACIÓN"}
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
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
                        sale={quote}
                        setSale={setQuote}
                    />
                    <SaleDetailForm
                        modalAddDetail={modalAddDetail}
                        setModalAddDetail={setModalAddDetail}
                        product={product}
                        setProduct={setProduct}
                        invoiceDetail={saleDetail}
                        setInvoiceDetail={setSaleDetail}
                        invoice={quote}
                        setInvoice={setQuote}
                        auth={auth}
                        initialStateProduct={initialStateProduct}
                        initialStateSaleDetail={initialStateSaleDetail}
                        typeAffectationsData={typeAffectationsData}
                        productsData={productsData}
                    />
                </>
            )}
        </>
    );
}

export default EditQuotePage;
