"use client";
import {
    useState,
    useEffect,
    useMemo,
    ChangeEvent,
    FormEvent,
    useCallback,
    useRef,
} from "react";
import Breadcrumb from "@/components/Breadcrumb";
import {
    IOperation,
    IOperationDetail,
    IProduct,
    ISupplier,
    IUser,
    IPerson,
    ICashFlow,
} from "@/app/types";
import Search from "@/components/icons/Search";
import Add from "@/components/icons/Add";
import Edit from "@/components/icons/Edit";
import Delete from "@/components/icons/Delete";
import Save from "@/components/icons/Save";
import { Modal, ModalOptions } from "flowbite";
import { useQuery, gql, useLazyQuery, useMutation } from "@apollo/client";
import SupplierForm from "@/app/dashboard/purchases/new/SupplierForm";
import { useSession } from "next-auth/react";
import PurchaseDetailForm from "./PurchaseDetailForm";
import ProductForm from "../../logistics/products/ProductForm";
import WayPayForm from "../WayPayForm";
import { toast } from "react-toastify";
import SunatCancel from "@/components/icons/SunatCancel";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";

const today = new Date().toISOString().split("T")[0];

const initialStatePurchase = {
    id: 0,
    serial: "",
    correlative: "",
    emitDate: today,
    dueDate: today,
    supplierName: "",
    supplierId: 0,
    supplierDocumentType: "",
    igvType: 18,
    documentType: "01",
    currencyType: "PEN",
    saleExchangeRate: "",
    userId: 0,
    userName: "",
    operationdetailSet: [],
    cashflowSet: [] as ICashFlow[],
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
    observation: "",
    operationType: "0501",
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

const initialStatePurchaseDetail = {
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
    isSupplier: true,
    isClient: false,
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

const initialStateProductFilterObj = {
    criteria: "name",
    searchText: "",
    supplierId: 0,
    lineId: 0,
    subLineId: 0,
    available: true,
    activeType: "01",
    subjectPerception: false,
    typeAffectationId: 0,
    limit: 50,
};

const initialStateCashFlow = {
    wayPay: 1,
    total: 0,
    description: "",
    transactionDate: today,
};

const SUPPLIERS_QUERY = gql`
    query {
        allSuppliers {
            names
            id
            address
            documentNumber
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

const WAY_PAY_QUERY = gql`
    query {
        allWayPays {
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
const SEARCH_CLIENT_BY_PARAMETER = gql`
    query searchClientByParameter($search: String!, $isSupplier: Boolean!) {
        searchClientByParameter(search: $search, isSupplier: $isSupplier) {
            id
            names
            documentNumber
            documentType
        }
    }
`;

const CREATE_PURCHASE_MUTATION = gql`
    mutation CreatePurchase(
        $serial: String!
        $correlative: Int!
        $operationType: String!
        $documentType: String!
        $currencyType: String!
        $saleExchangeRate: Float!
        $emitDate: String!
        $dueDate: String!
        $supplierId: Int!
        $productTariffIdSet: [Int!]!
        $typeAffectationIdSet: [Int!]!
        $quantitySet: [Float!]!
        $unitValueSet: [Float!]!
        $unitPriceSet: [Float!]!
        $discountPercentageSet: [Float!]!
        $igvPercentageSet: [Float!]!
        $perceptionPercentageSet: [Float!]!
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
        $observation: String!
        $hasPerception: Boolean!
        $hasRetention: Boolean!
        $hasDetraction: Boolean!
        $perceptionType: Int!
        $perceptionPercentage: Float!
        $retentionType: Int!
        $totalRetention: Float!
        $retentionPercentage: Float!
        $detractionType: Int!
        $detractionPaymentMethod: Int!
        $totalDetraction: Float!
        $detractionPercentage: Float!
    ) {
        createPurchase(
            serial: $serial
            correlative: $correlative
            operationType: $operationType
            documentType: $documentType
            currencyType: $currencyType
            saleExchangeRate: $saleExchangeRate
            emitDate: $emitDate
            dueDate: $dueDate
            supplierId: $supplierId
            productTariffIdSet: $productTariffIdSet
            typeAffectationIdSet: $typeAffectationIdSet
            quantitySet: $quantitySet
            unitValueSet: $unitValueSet
            unitPriceSet: $unitPriceSet
            discountPercentageSet: $discountPercentageSet
            igvPercentageSet: $igvPercentageSet
            perceptionPercentageSet: $perceptionPercentageSet
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
        ) {
            id
            serial
            correlative
            operationType
            documentType
            currencyType
            saleExchangeRate
            emitDate
            dueDate
            supplierId
            totalDiscount
            totalTaxed
            totalUnaffected
            totalExonerated
            totalIgv
            totalFree
            totalAmount
            totalPerception
            totalToPay
            totalPayed
            totalTurned
            observation
            hasPerception
            hasRetention
            hasDetraction
            perceptionType
            perceptionPercentage
            retentionType
            totalRetention
            retentionPercentage
            detractionType
            detractionPaymentMethod
            totalDetraction
            detractionPercentage
        }
    }
`;

function NewPurchasePage() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [triggerSavePurchase, setTriggerSavePurchase] = useState(false);
    const [purchase, setPurchase] = useState(initialStatePurchase);
    const [product, setProduct] = useState(initialStateProduct);
    const [productFilterObj, setProductFilterObj] = useState(
        initialStateProductFilterObj
    );
    const [purchaseDetail, setPurchaseDetail] = useState(
        initialStatePurchaseDetail
    );
    const [products, setProducts] = useState<IProduct[]>([]);
    const [person, setPerson] = useState(initialStatePerson);
    const [modalAddPerson, setModalAddPerson] = useState<Modal | any>(null);
    const [modalProduct, setModalProduct] = useState<Modal | any>(null);
    const [modalAddDetail, setModalAddDetail] = useState<Modal | any>(null);
    const [modalWayPay, setModalWayPay] = useState<Modal | any>(null);
    const { data: session } = useSession();
    const [cashFlow, setCashFlow] = useState(initialStateCashFlow);
    const [supplierSearch, setSupplierSearch] = useState("");
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
    const getVariables = () => ({
        subsidiaryId: Number(auth?.user?.subsidiaryId),
        available: true,
    });
    const router = useRouter();
    const savePurchaseRef = useRef<Function | null>(null);

    const {
        loading: wayPaysLoading,
        error: wayPaysError,
        data: wayPaysData,
    } = useQuery(WAY_PAY_QUERY, {
        context: authContext,
        skip: !auth?.jwtToken,
    });

    const {
        loading: suppliersLoading,
        error: suppliersError,
        data: suppliersData,
    } = useQuery(SUPPLIERS_QUERY, {
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

    const {
        loading: productsLoading,
        error: productsError,
        data: productsData,
    } = useQuery(PRODUCTS_QUERY, {
        context: authContext,
        variables: getVariables(),
        skip: !auth?.jwtToken,
    });

    const [
        searchSupplierQuery,
        {
            loading: searchSupplierLoading,
            error: searchSupplierError,
            data: searchSupplierData,
        },
    ] = useLazyQuery(SEARCH_CLIENT_BY_PARAMETER, {
        context: authContext,
        fetchPolicy: "network-only",

        onError: (err) => console.error("Error in Search Supplier:", err),
    });

    const [createPurchase] = useMutation(CREATE_PURCHASE_MUTATION, {
        context: authContext,
        onError: (err) => console.error("Error in purchase:", err),
    });

    const handlePurchase = (
        event: ChangeEvent<
            HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = event.target;

        if (name === "igvType" && event.target instanceof HTMLSelectElement) {
            setPurchase({ ...purchase, igvType: Number(value) });
        } else {
            setPurchase({ ...purchase, [name]: value });
        }
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
                    return normalizedValue === normalizedOptionValue;
                });
                if (option) {
                    const selectedId = option.getAttribute("data-key");
                    setProduct({
                        ...product,
                        id: Number(selectedId),
                        name: value,
                    });

                    modalAddDetail.show();
                } else {
                    setProduct({ ...product, id: 0, name: value });
                }
            } else {
                console.log("sin datalist");
            }
        } else setProduct({ ...product, [name]: value });
    };

    const handleSupplierSearchChange = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        setSupplierSearch(event.target.value);
    };

    const handleSupplierSelect = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedOption = event.target.value;
        const selectedData = searchSupplierData?.searchClientByParameter?.find(
            (person: IPerson) =>
                `${person.documentNumber} ${person.names}` === selectedOption
        );

        if (selectedData) {
            setPurchase({
                ...purchase,
                supplierId: selectedData.id,
                supplierName: selectedData.names,
                supplierDocumentType: selectedData?.documentType?.replace(
                    "A_",
                    ""
                ),
            });
            setSupplierSearch(selectedOption);
        } else {
            setPurchase({
                ...purchase,
                supplierId: 0,
                supplierName: "",
                supplierDocumentType: "",
            });
        }
    };

    useEffect(() => {
        if (supplierSearch.length > 2) {
            const queryVariables = {
                search: supplierSearch,
                isSupplier: true,
            };
            searchSupplierQuery({
                variables: queryVariables,
            });
        }
    }, [supplierSearch]);

    useEffect(() => {
        calculateTotal();
    }, [purchase.operationdetailSet]);

    function calculateTotal() {
        const discountForItem = purchase?.operationdetailSet?.reduce(
            (total: number, detail: IOperationDetail) => {
                return total + Number(detail.totalDiscount);
            },
            0
        );

        const discountGlobal = 0;
        const totalDiscount = discountForItem + discountGlobal;

        const totalUnaffected = purchase?.operationdetailSet
            ?.filter(
                (detail: IOperationDetail) => detail.typeAffectationId == 3
            )
            .reduce((total: number, detail: IOperationDetail) => {
                return total + Number(detail.totalValue);
            }, 0);

        const totalExonerated = purchase?.operationdetailSet
            ?.filter(
                (detail: IOperationDetail) => detail.typeAffectationId == 2
            )
            .reduce((total: number, detail: IOperationDetail) => {
                return total + Number(detail.totalValue);
            }, 0);

        const totalTaxed = purchase?.operationdetailSet
            ?.filter(
                (detail: IOperationDetail) => detail.typeAffectationId == 1
            )
            .reduce((total: number, detail: IOperationDetail) => {
                return total + Number(detail.totalValue);
            }, 0);

        const totalIgv = purchase?.operationdetailSet?.reduce(
            (total: number, detail: IOperationDetail) => {
                return total + Number(detail.totalIgv);
            },
            0
        );

        const totalAmount =
            totalExonerated + totalUnaffected + totalTaxed + totalIgv;
        const totalPerception = 0;
        const totalToPay = totalAmount + totalPerception;

        setPurchase((prevEntry: any) => ({
            ...prevEntry,
            discountForItem: Number(discountForItem).toFixed(2),
            discountGlobal: Number(discountGlobal).toFixed(2),
            totalDiscount: Number(totalDiscount).toFixed(2),
            totalUnaffected: Number(totalUnaffected).toFixed(2),
            totalExonerated: Number(totalExonerated).toFixed(2),
            totalTaxed: Number(totalTaxed).toFixed(2),
            totalIgv: Number(totalIgv).toFixed(2),
            totalAmount: Number(totalAmount).toFixed(2),
            totalPerception: Number(totalPerception).toFixed(2),
            totalToPay: Number(totalToPay).toFixed(2),
        }));
    }

    const handleRemovePurchaseDetail = async (indexToRemove: number) => {
        setPurchase((prevPurchase: any) => ({
            ...prevPurchase,
            operationdetailSet: prevPurchase?.operationdetailSet?.filter(
                (detail: IOperationDetail) =>
                    detail.temporaryId !== indexToRemove
            ),
        }));
    };

    const validateBeforePayment = () => {
        if (isProcessing) return false;

        if (Number(purchase.supplierId) === 0) {
            toast("Por favor ingrese un proveedor.", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
            });
            return false;
        }

        if (purchase.operationdetailSet.length === 0) {
            toast("Por favor ingrese al menos un item.", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
            });
            return false;
        }

        if (!purchase.serial) {
            toast("Por favor ingrese la serie.", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
            });
            return false;
        }

        if (
            purchase.hasDetraction ||
            purchase.hasRetention ||
            purchase.hasPerception
        ) {
            if (purchase.supplierDocumentType !== "6") {
                toast(
                    "Solo proveedores con RUC pueden realizar operaciones de Detracción, Retención o Percepción.",
                    {
                        hideProgressBar: true,
                        autoClose: 2000,
                        type: "warning",
                    }
                );
                return false;
            }

            if (!["01", "03"].includes(purchase.documentType)) {
                toast(
                    "Las operaciones de Detracción, Retención o Percepción solo están permitidas para Facturas y Boletas.",
                    {
                        hideProgressBar: true,
                        autoClose: 2000,
                        type: "warning",
                    }
                );
                return false;
            }
        }

        switch (purchase.operationType) {
            case "0501":
                if (purchase.hasDetraction) {
                    toast("Para compra interna no se permite Detracción.", {
                        hideProgressBar: true,
                        autoClose: 2000,
                        type: "warning",
                    });
                    return false;
                }
                if (purchase.hasRetention) {
                    if (
                        !purchase.retentionType ||
                        !purchase.totalRetention ||
                        !purchase.retentionPercentage
                    ) {
                        toast("Complete los datos de retención.", {
                            hideProgressBar: true,
                            autoClose: 2000,
                            type: "warning",
                        });
                        return false;
                    }
                }
                if (purchase.hasPerception) {
                    if (
                        !purchase.perceptionType ||
                        !purchase.totalPerception ||
                        !purchase.perceptionPercentage
                    ) {
                        toast("Complete los datos de percepción.", {
                            hideProgressBar: true,
                            autoClose: 2000,
                            type: "warning",
                        });
                        return false;
                    }
                }
                break;

            case "1001":
                if (purchase.hasDetraction) {
                    if (
                        !purchase.detractionType ||
                        !purchase.detractionPaymentMethod ||
                        !purchase.totalDetraction ||
                        !purchase.detractionPercentage
                    ) {
                        toast("Complete todos los datos de detracción.", {
                            hideProgressBar: true,
                            autoClose: 2000,
                            type: "warning",
                        });
                        return false;
                    }
                }
                if (purchase.hasRetention) {
                    if (
                        !purchase.retentionType ||
                        !purchase.totalRetention ||
                        !purchase.retentionPercentage
                    ) {
                        toast("Complete los datos de retención.", {
                            hideProgressBar: true,
                            autoClose: 2000,
                            type: "warning",
                        });
                        return false;
                    }
                }
                if (purchase.hasPerception) {
                    if (
                        !purchase.perceptionType ||
                        !purchase.totalPerception ||
                        !purchase.perceptionPercentage
                    ) {
                        toast("Complete los datos de percepción.", {
                            hideProgressBar: true,
                            autoClose: 2000,
                            type: "warning",
                        });
                        return false;
                    }
                }
                break;

            case "2001":
                if (purchase.hasDetraction) {
                    toast(
                        "Para operaciones con percepción no se permite Detracción.",
                        {
                            hideProgressBar: true,
                            autoClose: 2000,
                            type: "warning",
                        }
                    );
                    return false;
                }
                if (purchase.hasPerception) {
                    if (
                        !purchase.perceptionType ||
                        !purchase.totalPerception ||
                        !purchase.perceptionPercentage
                    ) {
                        toast("Complete todos los datos de percepción.", {
                            hideProgressBar: true,
                            autoClose: 2000,
                            type: "warning",
                        });
                        return false;
                    }
                }
                if (purchase.hasRetention) {
                    if (
                        !purchase.retentionType ||
                        !purchase.totalRetention ||
                        !purchase.retentionPercentage
                    ) {
                        toast("Complete los datos de retención.", {
                            hideProgressBar: true,
                            autoClose: 2000,
                            type: "warning",
                        });
                        return false;
                    }
                }
                break;
        }
        return true;
    };

    const handleSavePurchase = useCallback(async () => {
        if (isProcessing) return;
        if (!purchase.serial) {
            toast("Debe seleccionar una serie", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "error",
            });
            return;
        }
        try {
            setIsProcessing(true);
            const variables = {
                serial: purchase.serial,
                correlative: parseInt(
                    purchase.correlative === "" ? "0" : purchase.correlative
                ),
                operationType: purchase.operationType,
                documentType: purchase.documentType,
                currencyType: purchase.currencyType,
                saleExchangeRate: parseFloat(purchase.saleExchangeRate) || 0,
                emitDate: purchase.emitDate,
                dueDate: purchase.dueDate,
                supplierId: parseInt(purchase.supplierId.toString()),
                productTariffIdSet: purchase.operationdetailSet.map(
                    (item: any) => item.productTariffId
                ),
                typeAffectationIdSet: purchase.operationdetailSet.map(
                    (item: any) => item.typeAffectationId
                ),
                quantitySet: purchase.operationdetailSet.map((item: any) =>
                    parseFloat(item.quantity)
                ),
                unitValueSet: purchase.operationdetailSet.map((item: any) =>
                    parseFloat(item.unitValue)
                ),
                unitPriceSet: purchase.operationdetailSet.map((item: any) =>
                    parseFloat(item.unitPrice)
                ),
                discountPercentageSet: purchase.operationdetailSet.map(
                    (item: any) => parseFloat(item.discountPercentage) || 0
                ),
                igvPercentageSet: purchase.operationdetailSet.map((item: any) =>
                    parseFloat(item.igvPercentage)
                ),
                perceptionPercentageSet: purchase.operationdetailSet.map(
                    (item: any) => parseFloat(item.totalPerception) || 0
                ),
                totalDiscount: parseFloat(purchase.totalDiscount),
                totalTaxed: parseFloat(purchase.totalTaxed),
                totalUnaffected: parseFloat(purchase.totalUnaffected),
                totalExonerated: parseFloat(purchase.totalExonerated),
                totalIgv: parseFloat(purchase.totalIgv),
                totalFree: parseFloat(purchase.totalFree) || 0,
                totalAmount: parseFloat(purchase.totalAmount),
                totalPerception: parseFloat(purchase.totalPerception) || 0,
                totalToPay: parseFloat(purchase.totalToPay),
                totalPayed: parseFloat(purchase.totalPayed),
                totalTurned: parseFloat(purchase.totalTurned) || 0,
                observation: purchase.observation || "",

                hasPerception: purchase.hasPerception,
                hasRetention: purchase.hasRetention,
                hasDetraction: purchase.hasDetraction,

                perceptionType: Number(purchase.perceptionType),
                perceptionPercentage: Number(purchase.perceptionPercentage),

                retentionType: Number(purchase.retentionType),
                totalRetention: Number(purchase.totalRetention),
                retentionPercentage: Number(purchase.retentionPercentage),

                detractionType: Number(purchase.detractionType),
                detractionPaymentMethod: Number(
                    purchase.detractionPaymentMethod
                ),
                totalDetraction: Number(purchase.totalDetraction),
                detractionPercentage: Number(purchase.detractionPercentage),
            };
            const { data, errors } = await createPurchase({
                variables: variables,
            });
            if (errors) {
                toast("Error al crear la compra", {
                    hideProgressBar: true,
                    autoClose: 2000,
                    type: "error",
                });
                return;
            }
            if (data) {
                toast("Compra creada exitosamente", {
                    hideProgressBar: true,
                    autoClose: 2000,
                    type: "success",
                });
                router.push("/dashboard/purchases");
            }
        } catch (error) {
            toast("Error al crear la compra", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "error",
            });
        } finally {
            setIsProcessing(false);
        }
    }, [purchase, isProcessing, createPurchase, router, setIsProcessing]);

    // Handle triggerSavePurchase state to call handleSavePurchase when it's true
    useEffect(() => {
        if (triggerSavePurchase && savePurchaseRef.current) {
            savePurchaseRef.current();
            setTriggerSavePurchase(false); // Reset the trigger
        }
    }, [triggerSavePurchase]);

    return (
        <>
            <div className="p-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 lg:mt-1.5 dark:bg-gray-800 dark:border-gray-700">
                <div className="w-full mb-1">
                    <Breadcrumb section={"Compras"} article={"Nueva Compra"} />
                </div>
            </div>

            <div className="flex flex-col space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden shadow-lg rounded-lg">
                            <div className="p-4 md:p-5 space-y-4">
                                <div className="grid gap-4">
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
                                            <div>
                                                <label
                                                    htmlFor="igvType"
                                                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                                >
                                                    IGV %{" "}
                                                </label>
                                                <select
                                                    value={purchase.igvType}
                                                    name="igvType"
                                                    onChange={handlePurchase}
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
                                            <div className="md:col-span-2">
                                                <label
                                                    htmlFor="documentType"
                                                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                                >
                                                    Tipo documento
                                                </label>
                                                <select
                                                    value={
                                                        purchase.documentType
                                                    }
                                                    name="documentType"
                                                    onChange={handlePurchase}
                                                    className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                    required
                                                >
                                                    <option value={"01"}>
                                                        FACTURA ELECTRÓNICA
                                                    </option>
                                                    <option value={"03"}>
                                                        BOLETA DE VENTA
                                                        ELECTRÓNICA
                                                    </option>
                                                </select>
                                            </div>
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
                                                    value={purchase.emitDate}
                                                    onChange={handlePurchase}
                                                    onFocus={(e) =>
                                                        e.target.select()
                                                    }
                                                    className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label
                                                    htmlFor="dueDate"
                                                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                                >
                                                    Fecha vencimiento
                                                </label>
                                                <input
                                                    type="date"
                                                    name="dueDate"
                                                    id="dueDate"
                                                    value={purchase.dueDate}
                                                    onChange={handlePurchase}
                                                    onFocus={(e) =>
                                                        e.target.select()
                                                    }
                                                    className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label
                                                    htmlFor="currencyType"
                                                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                                >
                                                    Moneda
                                                </label>
                                                <select
                                                    value={
                                                        purchase.currencyType
                                                    }
                                                    name="currencyType"
                                                    onChange={handlePurchase}
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

                                            {purchase.currencyType !==
                                                "PEN" && (
                                                <>
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
                                                                purchase.saleExchangeRate
                                                            }
                                                            onChange={
                                                                handlePurchase
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
                                                    value={purchase.serial}
                                                    onChange={handlePurchase}
                                                    onFocus={(e) =>
                                                        e.target.select()
                                                    }
                                                    className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm uppercase"
                                                    autoComplete="off"
                                                />
                                            </div>
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
                                                    value={purchase.correlative}
                                                    onChange={handlePurchase}
                                                    onFocus={(e) =>
                                                        e.target.select()
                                                    }
                                                    className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                    autoComplete="off"
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
                                            <div className="md:col-span-4">
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                    Proveedor
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                                                        {purchase.supplierId > 0
                                                            ? "✓ Proveedor seleccionado"
                                                            : "⚠️ Seleccione un proveedor"}
                                                    </span>
                                                </label>
                                                <div className="relative w-full mt-1 group">
                                                    <input
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
                                                        placeholder="Buscar proveedor..."
                                                        list="supplierNameList"
                                                        required
                                                    />
                                                    <datalist
                                                        id="supplierNameList"
                                                        className="custom-datalist"
                                                    >
                                                        {searchSupplierData?.searchClientByParameter?.map(
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
                                                            setPurchase({
                                                                ...purchase,
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
                                                            modalAddPerson.show();
                                                            setPerson(
                                                                initialStatePerson
                                                            );
                                                        }}
                                                    >
                                                        <Add />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </fieldset>
                                </div>

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
                                                        setPurchaseDetail(
                                                            initialStatePurchaseDetail
                                                        );
                                                    },
                                                });
                                            }}
                                        >
                                            <Add />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <div className="overflow-hidden shadow">
                                        <table className="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-600">
                                            <thead className="bg-gray-100 dark:bg-gray-700">
                                                <tr>
                                                    <th
                                                        scope="col"
                                                        className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                                                    >
                                                        Descripción
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                                                    >
                                                        Cantidad
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                                                    >
                                                        C/U
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                                                    >
                                                        Subtotal
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                                                    ></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {purchase?.operationdetailSet?.map(
                                                    (item: any, i: number) => (
                                                        <tr
                                                            key={i}
                                                            className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                                                        >
                                                            <td className="px-4 py-2">
                                                                {
                                                                    item.productName
                                                                }
                                                            </td>
                                                            <td className="px-4 py-2">
                                                                {item.quantity}
                                                            </td>
                                                            <td className="px-4 py-2">
                                                                {item.unitValue}
                                                            </td>
                                                            <td className="px-4 py-2">
                                                                {
                                                                    item.totalValue
                                                                }
                                                            </td>
                                                            <td className="px-4 py-2">
                                                                <div className="flex justify-end py-2">
                                                                    <a
                                                                        className="hover:underline cursor-pointer"
                                                                        onClick={(
                                                                            e
                                                                        ) => {
                                                                            modalAddDetail.show();
                                                                            setPurchaseDetail(
                                                                                item
                                                                            );
                                                                            setProduct(
                                                                                {
                                                                                    ...product,
                                                                                    id: Number(
                                                                                        item.productId
                                                                                    ),
                                                                                    name: item.productName,
                                                                                }
                                                                            );
                                                                        }}
                                                                    >
                                                                        <Edit />
                                                                    </a>
                                                                    <a
                                                                        className="hover:underline cursor-pointer"
                                                                        onClick={() =>
                                                                            handleRemovePurchaseDetail(
                                                                                Number(
                                                                                    item?.temporaryId
                                                                                )
                                                                            )
                                                                        }
                                                                    >
                                                                        <Delete />
                                                                    </a>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            className="px-5 py-2 bg-blue-600 dark:bg-cyan-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
                                            onClick={(e) => {
                                                modalAddDetail.show();
                                                setPurchaseDetail(
                                                    initialStatePurchaseDetail
                                                );
                                            }}
                                        >
                                            <Add /> AGREGAR ITEM
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 gap-4 p-6 border-2 border-purple-200 dark:border-purple-900 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                                    <div className="sm:col-span-3 text-right">
                                        % Descuento Global
                                    </div>
                                    <div className="sm:col-span-1 text-right">
                                        0
                                    </div>
                                    <div className="sm:col-span-3 text-right">
                                        Descuento Global (-){" "}
                                        {purchase.currencyType === "PEN"
                                            ? "S/"
                                            : purchase.currencyType === "USD"
                                            ? "US$"
                                            : purchase.currencyType === "EUR"
                                            ? "€"
                                            : purchase.currencyType === "GBP"
                                            ? "£"
                                            : null}
                                    </div>
                                    <div className="sm:col-span-1 text-right">
                                        {purchase.discountGlobal}
                                    </div>
                                    <div className="sm:col-span-3 text-right">
                                        Descuento por Item (-){" "}
                                        {purchase.currencyType === "PEN"
                                            ? "S/"
                                            : purchase.currencyType === "USD"
                                            ? "US$"
                                            : purchase.currencyType === "EUR"
                                            ? "€"
                                            : purchase.currencyType === "GBP"
                                            ? "£"
                                            : null}
                                    </div>
                                    <div className="sm:col-span-1 text-right">
                                        {purchase.discountForItem}
                                    </div>
                                    <div className="sm:col-span-3 text-right">
                                        Descuento Total (-){" "}
                                        {purchase.currencyType === "PEN"
                                            ? "S/"
                                            : purchase.currencyType === "USD"
                                            ? "US$"
                                            : purchase.currencyType === "EUR"
                                            ? "€"
                                            : purchase.currencyType === "GBP"
                                            ? "£"
                                            : null}
                                    </div>
                                    <div className="sm:col-span-1 text-right">
                                        {purchase.totalDiscount}
                                    </div>
                                    <div className="sm:col-span-3 text-right">
                                        Exonerada{" "}
                                        {purchase.currencyType === "PEN"
                                            ? "S/"
                                            : purchase.currencyType === "USD"
                                            ? "US$"
                                            : purchase.currencyType === "EUR"
                                            ? "€"
                                            : purchase.currencyType === "GBP"
                                            ? "£"
                                            : null}
                                    </div>
                                    <div className="sm:col-span-1 text-right">
                                        {purchase.totalExonerated || "0.00"}
                                    </div>
                                    <div className="sm:col-span-3 text-right">
                                        Inafecta{" "}
                                        {purchase.currencyType === "PEN"
                                            ? "S/"
                                            : purchase.currencyType === "USD"
                                            ? "US$"
                                            : purchase.currencyType === "EUR"
                                            ? "€"
                                            : purchase.currencyType === "GBP"
                                            ? "£"
                                            : null}
                                    </div>
                                    <div className="sm:col-span-1 text-right">
                                        {purchase.totalUnaffected || "0.00"}
                                    </div>
                                    <div className="sm:col-span-3 text-right">
                                        Gravada{" "}
                                        {purchase.currencyType === "PEN"
                                            ? "S/"
                                            : purchase.currencyType === "USD"
                                            ? "US$"
                                            : purchase.currencyType === "EUR"
                                            ? "€"
                                            : purchase.currencyType === "GBP"
                                            ? "£"
                                            : null}
                                    </div>
                                    <div className="sm:col-span-1 text-right">
                                        {purchase.totalTaxed}
                                    </div>
                                    <div className="sm:col-span-3 text-right">
                                        IGV{" "}
                                        {purchase.currencyType === "PEN"
                                            ? "S/"
                                            : purchase.currencyType === "USD"
                                            ? "US$"
                                            : purchase.currencyType === "EUR"
                                            ? "€"
                                            : purchase.currencyType === "GBP"
                                            ? "£"
                                            : null}
                                    </div>
                                    <div className="sm:col-span-1 text-right">
                                        {purchase.totalIgv}
                                    </div>
                                    <div className="sm:col-span-3 text-right">
                                        Gratuita{" "}
                                        {purchase.currencyType === "PEN"
                                            ? "S/"
                                            : purchase.currencyType === "USD"
                                            ? "US$"
                                            : purchase.currencyType === "EUR"
                                            ? "€"
                                            : purchase.currencyType === "GBP"
                                            ? "£"
                                            : null}
                                    </div>
                                    <div className="sm:col-span-1 text-right">
                                        {purchase.totalFree || "0.00"}
                                    </div>
                                    <div className="sm:col-span-3 text-right">
                                        Otros Cargos{" "}
                                        {purchase.currencyType === "PEN"
                                            ? "S/"
                                            : purchase.currencyType === "USD"
                                            ? "US$"
                                            : purchase.currencyType === "EUR"
                                            ? "€"
                                            : purchase.currencyType === "GBP"
                                            ? "£"
                                            : null}
                                    </div>
                                    <div className="sm:col-span-1 text-right">
                                        0.00
                                    </div>
                                    <div className="sm:col-span-3 text-right">
                                        Total{" "}
                                        {purchase.currencyType === "PEN"
                                            ? "S/"
                                            : purchase.currencyType === "USD"
                                            ? "US$"
                                            : purchase.currencyType === "EUR"
                                            ? "€"
                                            : purchase.currencyType === "GBP"
                                            ? "£"
                                            : null}
                                    </div>
                                    <div className="sm:col-span-1 text-right">
                                        {purchase.totalAmount}
                                    </div>
                                </div>

                                <fieldset className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                                    <legend className="px-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
                                        OBSERVACIONES
                                    </legend>
                                    <div className="grid">
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
                                                value={purchase.observation}
                                                onChange={handlePurchase}
                                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            ></textarea>
                                        </div>
                                    </div>
                                </fieldset>

                                <div className="flex justify-end py-2">
                                    <button
                                        type="button"
                                        className={`px-5 py-2 bg-blue-600 dark:bg-cyan-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 flex items-center gap-2 ${
                                            purchase?.operationdetailSet
                                                ?.length === 0
                                                ? "cursor-not-allowed"
                                                : ""
                                        }`}
                                        onClick={async () => {
                                            if (validateBeforePayment()) {
                                                if (
                                                    !auth?.user
                                                        ?.companyDisableContinuePay
                                                ) {
                                                    modalWayPay.show();
                                                    setPurchase({
                                                        ...purchase,
                                                        totalPayed: "",
                                                        cashflowSet: [],
                                                    });
                                                    setCashFlow({
                                                        ...cashFlow,
                                                        total: Number(
                                                            purchase.totalToPay
                                                        ),
                                                    });
                                                } else {
                                                    // Handle direct cash payment
                                                    const cashPayment: ICashFlow =
                                                        {
                                                            wayPay: 1, // EFECTIVO [CONTADO]
                                                            total: Number(
                                                                purchase.totalToPay
                                                            ),
                                                            description:
                                                                "Pago en efectivo",
                                                            transactionDate:
                                                                today,
                                                            temporaryId: 1,
                                                        };
                                                    // Update the purchase state with cash payment
                                                    setPurchase({
                                                        ...purchase,
                                                        cashflowSet: [
                                                            cashPayment,
                                                        ],
                                                        totalPayed:
                                                            purchase.totalToPay ||
                                                            "0.00",
                                                        totalTurned: "0.00",
                                                    });
                                                    // Set trigger to call handleSavePurchase after state update
                                                    setTriggerSavePurchase(
                                                        true
                                                    );
                                                }
                                            }
                                        }}
                                        disabled={
                                            purchase?.operationdetailSet
                                                ?.length === 0
                                        }
                                    >
                                        <Save />
                                        {auth?.user?.companyDisableContinuePay
                                            ? "FINALIZAR COMPRA"
                                            : "CONTINUAR CON EL PAGO"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <SupplierForm
                modalAddPerson={modalAddPerson}
                setModalAddPerson={setModalAddPerson}
                setSupplierSearch={setSupplierSearch}
                person={person}
                setPerson={setPerson}
                jwtToken={auth?.jwtToken}
                authContext={authContext}
                SUPPLIERS_QUERY={SUPPLIERS_QUERY}
                purchase={purchase}
                setPurchase={setPurchase}
            />
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
            <PurchaseDetailForm
                modalAddDetail={modalAddDetail}
                setModalAddDetail={setModalAddDetail}
                product={product}
                setProduct={setProduct}
                purchaseDetail={purchaseDetail}
                setPurchaseDetail={setPurchaseDetail}
                purchase={purchase}
                setPurchase={setPurchase}
                auth={auth}
                initialStateProduct={initialStateProduct}
                initialStatePurchaseDetail={initialStatePurchaseDetail}
                typeAffectationsData={typeAffectationsData}
                productsData={productsData}
            />
            <WayPayForm
                modalWayPay={modalWayPay}
                setModalWayPay={setModalWayPay}
                cashFlow={cashFlow}
                setCashFlow={setCashFlow}
                initialStateCashFlow={initialStateCashFlow}
                initialStatePurchase={initialStatePurchase}
                purchase={purchase}
                setPurchase={setPurchase}
                jwtToken={auth?.jwtToken}
                authContext={authContext}
                wayPaysData={wayPaysData}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
                onSavePurchaseRef={(fn: any) => (savePurchaseRef.current = fn)}
            />
        </>
    );
}

export default NewPurchasePage;
