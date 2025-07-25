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
import { useQuery, gql, useLazyQuery } from "@apollo/client";
import {
    ICashFlow,
    IOperation,
    IOperationDetail,
    IOperationType,
    IPerson,
    IProduct,
    ISerialAssigned,
    IUser,
} from "@/app/types";
import Search from "@/components/icons/Search";
import Add from "@/components/icons/Add";
import Edit from "@/components/icons/Edit";
import Delete from "@/components/icons/Delete";
import Save from "@/components/icons/Save";
import { useParams } from "next/navigation";
import ProductForm from "../../../logistics/products/ProductForm";
import { toast } from "react-toastify";
import SaleDetailForm from "../../SaleDetailForm";
import WayPayForm from "../../WayPayForm";
import { useAuth } from "@/components/providers/AuthProvider";
import SunatCancel from "@/components/icons/SunatCancel";
import ClientForm from "../../ClientForm";
import SaleDetailList from "../../SaleDetailList";
import SaleTotalList from "../../SaleTotalList";
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
const TYPE_OPERATION_QUERY = gql`
    query {
        allOperationTypes {
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
    documentType: "01",
    currencyType: "PEN",
    saleExchangeRate: "",
    userId: 0,
    userName: "",
    operationdetailSet: [] as IOperationDetail[],
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
function NewSalePage() {
    const params = useParams();
    const { invoiceType } = params;

    const [isProcessing, setIsProcessing] = useState(false);
    const saveSaleRef = useRef<Function | null>(null);
    const [triggerSaveSale, setTriggerSaveSale] = useState(false);

    const [sale, setSale] = useState(initialStateSale);
    const [saleDetail, setSaleDetail] = useState(initialStateSaleDetail);
    const [person, setPerson] = useState(initialStatePerson);
    const [product, setProduct] = useState(initialStateProduct);
    // const [userLogged, setUserLogged] = useState(initialStateUserLogged);
    const [productFilterObj, setProductFilterObj] = useState(
        initialStateProductFilterObj
    );
    const [cashFlow, setCashFlow] = useState(initialStateCashFlow);
    const [modalAddClient, setModalAddClient] = useState<Modal | any>(null);
    const [modalProduct, setModalProduct] = useState<Modal | any>(null);
    const [modalAddDetail, setModalAddDetail] = useState<Modal | any>(null);
    const [modalWayPay, setModalWayPay] = useState<Modal | any>(null);
    const [barcodeInput, setBarcodeInput] = useState("");
    const auth = useAuth();
    // Add this near the top of your component with other refs
    const clientInputRef = useRef<HTMLInputElement>(null);
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
        if (auth?.user?.companyPercentageIgv) {
            setSale((prevSale) => ({
                ...prevSale,
                igvType: Number(auth?.user?.companyPercentageIgv),
            }));
        }
    }, [auth?.user?.companyPercentageIgv]);

    // Handle triggerSaveSale state to call handleSaveSale when it's true
    useEffect(() => {
        if (triggerSaveSale && saveSaleRef.current) {
            saveSaleRef.current();
            setTriggerSaveSale(false); // Reset the trigger
        }
    }, [triggerSaveSale]);

    useEffect(() => {
        // Si no hay parámetro, establecer FACTURA por defecto (01)
        setSale((prevSale) => ({
            ...prevSale,
            documentType: invoiceType ? (invoiceType as string) : "01",
        }));

        // Opcional: Mostrar mensaje informativo
        if (!invoiceType) {
            console.log("No se recibió parámetro, usando FACTURA por defecto");
        }
    }, [invoiceType]);

    const getVariables = () => ({
        subsidiaryId: Number(auth?.user?.subsidiaryId),
        available: true,
    });
    const [clientSearch, setClientSearch] = useState("");
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
        loading: typeAffectationsLoading,
        error: typeAffectationsError,
        data: typeAffectationsData,
    } = useQuery(TYPE_AFFECTATION_QUERY, {
        context: authContext,
        skip: !auth?.jwtToken,
    });
    const {
        loading: wayPaysLoading,
        error: wayPaysError,
        data: wayPaysData,
    } = useQuery(WAY_PAY_QUERY, {
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
    const handleSale = (
        event: ChangeEvent<
            HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = event.target;
        const target = event.target as HTMLInputElement;

        if (target.type === "checkbox") {
            setSale((prev) => ({
                ...prev,
                [name]: target.checked,
            }));
            return;
        }

        if (name === "clientName" && event.target instanceof HTMLInputElement) {
            const dataList = event.target.list;
            if (dataList) {
                const option = Array.from(dataList.options).find(
                    (option) => option.value === value
                );
                if (option) {
                    const selectedId = option.getAttribute("data-key");
                    setSale({
                        ...sale,
                        clientName: value,
                        clientId: Number(selectedId),
                    });
                } else {
                    setSale({ ...sale, clientName: value, clientId: 0 });
                }
            }
        } else {
            setSale({ ...sale, [name]: value });
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
                    const selectedPrice = option.getAttribute("data-price");
                    // Extract just the product name from the combined value
                    // Format: [CODE] Product Name ▶️ S/ Price
                    const productName = value
                        .split(" ▶️ S/")[0]
                        .replace(/^\[.*?\]\s*/, "");
                    setProduct({
                        ...product,
                        id: Number(selectedId),
                        name: productName,
                        priceWithIgv3: Number(selectedPrice) || 0,
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

    const validateBeforePayment = () => {
        if (isProcessing) return false;
        // Solo permitir clientes con RUC para facturas
        if (sale.documentType === "01" && sale.clientDocumentType !== "6") {
            toast("Solo se puede emitir facturas a clientes con RUC.", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
            });
            return false;
        }
        // Validate DNI customers can't create invoices
        if (sale.documentType === "01" && sale.clientDocumentType === "1") {
            toast("No se puede emitir facturas a clientes con DNI", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
            });
            return false;
        }

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

        // Validar que todos los items tengan productTariffId válido
        const itemsWithoutTariff = sale.operationdetailSet.filter(
            (item: any) => Number(item.productTariffId) === 0
        );
        if (itemsWithoutTariff.length > 0) {
            toast("Todos los productos deben tener una tarifa asignada.", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
            });
            return false;
        }

        if (!sale.serial) {
            toast("Por favor ingrese la serie.", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
            });
            return false;
        }

        // Validate document types for special operations
        if (sale.hasDetraction || sale.hasRetention || sale.hasPerception) {
            if (sale.clientDocumentType !== "6") {
                toast(
                    "Solo clientes con RUC pueden realizar operaciones de Detracción, Retención o Percepción.",
                    {
                        hideProgressBar: true,
                        autoClose: 2000,
                        type: "warning",
                    }
                );
                return false;
            }

            if (!["01", "03"].includes(sale.documentType)) {
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
        // Operation type specific validations
        switch (sale.operationType) {
            case "0101": // Venta interna
                if (sale.hasDetraction) {
                    toast("Para venta interna no se permite Detracción.", {
                        hideProgressBar: true,
                        autoClose: 2000,
                        type: "warning",
                    });
                    return false;
                }
                // Validate retention if enabled
                if (sale.hasRetention) {
                    if (
                        !sale.retentionType ||
                        !sale.totalRetention ||
                        !sale.retentionPercentage
                    ) {
                        toast("Complete los datos de retención.", {
                            hideProgressBar: true,
                            autoClose: 2000,
                            type: "warning",
                        });
                        return false;
                    }
                }
                // Validate perception if enabled
                if (sale.hasPerception) {
                    if (
                        !sale.perceptionType ||
                        !sale.totalPerception ||
                        !sale.perceptionPercentage
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

            case "1001": // Operación Sujeta a Detracción
                if (sale.hasDetraction) {
                    if (
                        !sale.detractionType ||
                        !sale.detractionPaymentMethod ||
                        !sale.totalDetraction ||
                        !sale.detractionPercentage
                    ) {
                        toast("Complete todos los datos de detracción.", {
                            hideProgressBar: true,
                            autoClose: 2000,
                            type: "warning",
                        });
                        return false;
                    }
                }
                if (sale.hasRetention) {
                    if (
                        !sale.retentionType ||
                        !sale.totalRetention ||
                        !sale.retentionPercentage
                    ) {
                        toast("Complete los datos de retención.", {
                            hideProgressBar: true,
                            autoClose: 2000,
                            type: "warning",
                        });
                        return false;
                    }
                }
                if (sale.hasPerception) {
                    if (
                        !sale.perceptionType ||
                        !sale.totalPerception ||
                        !sale.perceptionPercentage
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

            case "2001": // Operación Sujeta a Percepción
                if (sale.hasDetraction) {
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
                if (sale.hasPerception) {
                    if (
                        !sale.perceptionType ||
                        !sale.totalPerception ||
                        !sale.perceptionPercentage
                    ) {
                        toast("Complete todos los datos de percepción.", {
                            hideProgressBar: true,
                            autoClose: 2000,
                            type: "warning",
                        });
                        return false;
                    }
                }
                if (sale.hasRetention) {
                    if (
                        !sale.retentionType ||
                        !sale.totalRetention ||
                        !sale.retentionPercentage
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

        // Validar la fecha de emisión
        const emitDate = new Date(sale.emitDate);
        const currentDate = new Date();
        const fiveDaysAgo = new Date(currentDate);
        fiveDaysAgo.setDate(currentDate.getDate() - 6);
        const threeDaysAgo = new Date(currentDate);
        threeDaysAgo.setDate(currentDate.getDate() - 4);

        // Calcular días máximos permitidos según tipo de documento
        const maxDaysBack = sale.documentType === "01" ? 3 : 5; // 3 días para facturas, 5 para boletas
        // Calcular fecha mínima permitida
        const minAllowedDate = new Date(currentDate);
        minAllowedDate.setDate(currentDate.getDate() - maxDaysBack);
        // Verificar si la fecha de emisión es anterior a la mínima permitida
        if (emitDate < minAllowedDate) {
            const documentType =
                sale.documentType === "01" ? "facturas" : "boletas";
            toast(
                `No se permite crear ${documentType} con más de ${maxDaysBack} días de antigüedad.`,
                {
                    hideProgressBar: true,
                    autoClose: 2000,
                    type: "warning",
                }
            );
            return false;
        }
        if (emitDate > currentDate) {
            toast("La fecha de emisión no puede ser una fecha futura.", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
            });
            return false;
        }

        const dueDate = new Date(sale.dueDate);
        if (dueDate < emitDate) {
            toast(
                "La fecha de vencimiento no puede ser menor a la fecha de emisión.",
                {
                    hideProgressBar: true,
                    autoClose: 2000,
                    type: "warning",
                }
            );
            return false;
        }

        return true;
    };

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
            setClientSearch(selectedOption); // Ensure the search field shows the complete selected value
        } else {
            // Clear client data if no match is found
            setSale({
                ...sale,
                clientId: 0,
                clientName: "",
                clientDocumentType: "",
            });
        }
    };

    useEffect(() => {
        if (clientSearch.length > 2) {
            const queryVariables: {
                search: string;
                documentType?: string;
                isClient: boolean;
                operationDocumentType: string;
            } = {
                search: clientSearch,
                isClient: true,
                operationDocumentType: sale.documentType,
                // documentType: sale.documentType === "01" ? "6" : "1",
            };
            searchClientQuery({
                variables: queryVariables,
            });
        }
    }, [clientSearch]);

    // useEffect(() => {
    //     if (auth?.user?.companyDisableContinuePay) {
    //         // Automatically set cash payment
    //         const cashPayment = {
    //             wayPay: 1, // EFECTIVO [CONTADO]
    //             total: Number(sale.totalToPay),
    //             description: "Pago en efectivo",
    //             transactionDate: today,
    //         };

    //         setSale({
    //             ...sale,
    //             cashflowSet: [cashPayment],
    //             totalPayed: sale.totalToPay || "0.00",
    //             totalTurned: "0.00",
    //         });
    //     }
    // }, [auth?.user?.companyDisableContinuePay, sale.totalToPay]);

    // Si la sesión aún está cargando, muestra un spinner en lugar de "Cargando..."
    if (auth?.status === "loading") {
        return <p className="text-center">Cargando sesión...</p>;
    }
    // Si la sesión no está autenticada, muestra un mensaje de error o redirige
    if (auth?.status === "unauthenticated") {
        return <p className="text-center text-red-500">No autorizado</p>;
    }
    // Manejo de errores
    if (productsError || typeAffectationsError || wayPaysError) {
        return (
            <div>
                Error: No autorizado o error en la consulta.
                {productsError?.message ||
                    typeAffectationsError?.message ||
                    wayPaysError?.message}
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-white dark:bg-gray-800">
                <div className="container mx-auto pb-16">
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-1"></div>
                        <div className="col-span-10">
                            <div className="p-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 lg:mt-1.5 dark:bg-gray-800 dark:border-gray-700">
                                <div className="mb-1 w-full">
                                    <div className="flex items-center gap-4">
                                        <h1 className="text-2xl font-medium text-black-0 sm:text-2xl dark:text-white">
                                            Nuevo Comprobante
                                        </h1>
                                        <h2 className="text-4xl font-semibold text-gray-500 dark:text-white">
                                            {sale.documentType === "01"
                                                ? "FACTURA ELECTRÓNICA"
                                                : sale.documentType === "03"
                                                ? "BOLETA DE VENTA ELECTRÓNICA"
                                                : ""}
                                        </h2>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                                <div className="overflow-x-auto">
                                    <div className="inline-block min-w-full align-middle">
                                        <div className="overflow-hidden shadow-lg rounded-lg">
                                            <div className="p-4 md:p-5 space-y-4">
                                                <div className="grid gap-4">
                                                    <fieldset className="border-2 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg p-6 relative group">
                                                        <legend className="px-2 text-gray-500 dark:text-white font-semibold text-sm transition-all duration-300 group-hover:text-blue-700 dark:group-hover:text-blue-300">
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
                                                                Información
                                                                General
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
                                                                    value={
                                                                        sale.igvType
                                                                    }
                                                                    name="igvType"
                                                                    onChange={
                                                                        handleSale
                                                                    }
                                                                    className="mt-1 px-3 py-2 block w-full rounded-full dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                                    style={{
                                                                        border: "1px solid rgb(202, 202, 202)",
                                                                    }}
                                                                    required
                                                                >
                                                                    <option
                                                                        value={
                                                                            18
                                                                        }
                                                                    >
                                                                        18%
                                                                    </option>
                                                                    <option
                                                                        value={
                                                                            10
                                                                        }
                                                                    >
                                                                        10% (Ley
                                                                        31556)
                                                                    </option>
                                                                    <option
                                                                        value={
                                                                            4
                                                                        }
                                                                    >
                                                                        4%
                                                                        (IVAP)
                                                                    </option>
                                                                </select>
                                                            </div>
                                                            {/* Tipo documento */}
                                                            <div className="md:col-span-2">
                                                                <label
                                                                    htmlFor="documentType"
                                                                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                                                >
                                                                    Tipo
                                                                    documento
                                                                </label>
                                                                <select
                                                                    value={
                                                                        sale.documentType
                                                                    }
                                                                    name="documentType"
                                                                    onChange={
                                                                        handleSale
                                                                    }
                                                                    className="mt-1 px-3 py-2 block w-full rounded-full dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                                    style={{
                                                                        border: "1px solid rgb(202, 202, 202)",
                                                                    }}
                                                                    required
                                                                >
                                                                    <option
                                                                        value={
                                                                            "01"
                                                                        }
                                                                    >
                                                                        FACTURA
                                                                        ELECTRÓNICA
                                                                    </option>
                                                                    <option
                                                                        value={
                                                                            "03"
                                                                        }
                                                                    >
                                                                        BOLETA
                                                                        DE VENTA
                                                                        ELECTRÓNICA
                                                                    </option>
                                                                    {/* <option value={"07"}>
                                                        NOTA DE CRÉDITO
                                                        ELECTRÓNICA
                                                    </option> */}
                                                                    {/* <option value={"08"}>
                                                        NOTA DE DÉBITO
                                                        ELECTRÓNICA
                                                    </option> */}
                                                                    {/* <option value={"09"}>
                                                        GUIA DE REMISIÓN
                                                        REMITENTE
                                                    </option> */}
                                                                </select>
                                                            </div>
                                                            {/* Tipo operacion */}
                                                            <div className="md:col-span-2">
                                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                    Tipo
                                                                    operacion
                                                                </label>
                                                                <select
                                                                    value={
                                                                        sale.operationType
                                                                    }
                                                                    name="operationType"
                                                                    onChange={
                                                                        handleSale
                                                                    }
                                                                    className="mt-1 px-3 py-2 block w-full rounded-full dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm uppercase"
                                                                    style={{
                                                                        border: "1px solid rgb(202, 202, 202)",
                                                                    }}
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
                                                                                    key={
                                                                                        k
                                                                                    }
                                                                                    value={
                                                                                        o.code
                                                                                    }
                                                                                >
                                                                                    {`[${o.code}] `}
                                                                                    {
                                                                                        o.name
                                                                                    }
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
                                                                    Fecha
                                                                    emisión
                                                                </label>
                                                                <input
                                                                    type="date"
                                                                    name="emitDate"
                                                                    id="emitDate"
                                                                    value={
                                                                        sale.emitDate
                                                                    }
                                                                    onChange={
                                                                        handleSale
                                                                    }
                                                                    onFocus={(
                                                                        e
                                                                    ) =>
                                                                        e.target.select()
                                                                    }
                                                                    className="mt-1 px-3 py-2 block w-full rounded-full dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                                    style={{
                                                                        border: "1px solid rgb(202, 202, 202)",
                                                                    }}
                                                                    required
                                                                />
                                                            </div>
                                                            {/* Fecha vencimiento */}
                                                            <div>
                                                                <label
                                                                    htmlFor="dueDate"
                                                                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                                                >
                                                                    Fecha
                                                                    vencimiento
                                                                </label>
                                                                <input
                                                                    type="date"
                                                                    name="dueDate"
                                                                    id="dueDate"
                                                                    value={
                                                                        sale.dueDate
                                                                    }
                                                                    onChange={
                                                                        handleSale
                                                                    }
                                                                    onFocus={(
                                                                        e
                                                                    ) =>
                                                                        e.target.select()
                                                                    }
                                                                    className="mt-1 px-3 py-2 block w-full rounded-full dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                                    style={{
                                                                        border: "1px solid rgb(202, 202, 202)",
                                                                    }}
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
                                                                    value={
                                                                        sale.currencyType
                                                                    }
                                                                    name="currencyType"
                                                                    onChange={
                                                                        handleSale
                                                                    }
                                                                    className="mt-1 px-3 py-2 block w-full rounded-full dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                                    style={{
                                                                        border: "1px solid rgb(202, 202, 202)",
                                                                    }}
                                                                >
                                                                    <option
                                                                        value={
                                                                            0
                                                                        }
                                                                        disabled
                                                                    >
                                                                        Moneda
                                                                    </option>
                                                                    <option
                                                                        value={
                                                                            "PEN"
                                                                        }
                                                                    >
                                                                        S/ PEN -
                                                                        SOLES
                                                                    </option>
                                                                    <option
                                                                        value={
                                                                            "USD"
                                                                        }
                                                                    >
                                                                        US$ USD
                                                                        -
                                                                        DÓLARES
                                                                        AMERICANOS
                                                                    </option>
                                                                    <option
                                                                        value={
                                                                            "EUR"
                                                                        }
                                                                    >
                                                                        € EUR -
                                                                        EUROS
                                                                    </option>
                                                                    <option
                                                                        value={
                                                                            "GBP"
                                                                        }
                                                                    >
                                                                        £ GBP -
                                                                        LIBRA
                                                                        ESTERLINA
                                                                    </option>
                                                                </select>
                                                            </div>

                                                            {sale.currencyType !==
                                                                "PEN" && (
                                                                <>
                                                                    {/* Tipo de Cambio */}
                                                                    <div>
                                                                        <label
                                                                            htmlFor="saleExchangeRate"
                                                                            className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                                                        >
                                                                            Tipo
                                                                            de
                                                                            cambio
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            name="saleExchangeRate"
                                                                            id="saleExchangeRate"
                                                                            maxLength={
                                                                                10
                                                                            }
                                                                            value={
                                                                                sale.saleExchangeRate
                                                                            }
                                                                            onChange={
                                                                                handleSale
                                                                            }
                                                                            onFocus={(
                                                                                e
                                                                            ) =>
                                                                                e.target.select()
                                                                            }
                                                                            className="mt-1 px-3 py-2 block w-full rounded-full dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                                            style={{
                                                                                border: "1px solid rgb(202, 202, 202)",
                                                                            }}
                                                                            autoComplete="off"
                                                                        />
                                                                    </div>
                                                                </>
                                                            )}

                                                            {/* Serie */}
                                                            <div>
                                                                <label
                                                                    htmlFor="serial"
                                                                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                                                >
                                                                    Serie
                                                                </label>
                                                                <select
                                                                    name="serial"
                                                                    id="serial"
                                                                    value={
                                                                        sale.serial
                                                                    }
                                                                    onChange={
                                                                        handleSale
                                                                    }
                                                                    className="mt-1 px-3 py-2 block w-full rounded-full dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                                    style={{
                                                                        border: "1px solid rgb(202, 202, 202)",
                                                                    }}
                                                                    required
                                                                >
                                                                    {/* <option value="">
                                                        Seleccione una serie
                                                    </option> */}
                                                                    {serialsAssignedData?.allSerials
                                                                        ?.filter(
                                                                            (
                                                                                s: ISerialAssigned
                                                                            ) =>
                                                                                s.documentType ===
                                                                                    `A_${sale.documentType}` &&
                                                                                !s.isGeneratedViaApi
                                                                        )
                                                                        .map(
                                                                            (
                                                                                s: ISerialAssigned
                                                                            ) => (
                                                                                <option
                                                                                    key={
                                                                                        s.serial
                                                                                    }
                                                                                    value={
                                                                                        s.serial
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        s.serial
                                                                                    }
                                                                                </option>
                                                                            )
                                                                        ) || (
                                                                        <option value="">
                                                                            No
                                                                            hay
                                                                            series
                                                                            disponibles
                                                                        </option>
                                                                    )}
                                                                </select>
                                                                {serialsAssignedData?.allSerials?.filter(
                                                                    (
                                                                        s: ISerialAssigned
                                                                    ) =>
                                                                        s.documentType ===
                                                                            `A_${sale.documentType}` &&
                                                                        !s.isGeneratedViaApi
                                                                ).length ===
                                                                    0 && (
                                                                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">
                                                                        No hay
                                                                        series
                                                                        asignadas
                                                                        para
                                                                        este
                                                                        tipo de
                                                                        documento
                                                                    </p>
                                                                )}
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
                                                                    maxLength={
                                                                        10
                                                                    }
                                                                    value={
                                                                        sale.correlative
                                                                    }
                                                                    onChange={
                                                                        handleSale
                                                                    }
                                                                    onFocus={(
                                                                        e
                                                                    ) =>
                                                                        e.target.select()
                                                                    }
                                                                    className="mt-1 px-3 py-2 block w-full rounded-full dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                                    style={{
                                                                        border: "1px solid rgb(202, 202, 202)",
                                                                    }}
                                                                    autoComplete="off"
                                                                    disabled
                                                                />
                                                            </div>
                                                        </div>
                                                    </fieldset>

                                                    <fieldset className="border-2 border-gray-200 dark:border-white bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg p-6 relative group hover:shadow-gray-500/20 hover:shadow-2xl">
                                                        <legend className="px-2 text-gray-500 dark:text-white font-semibold text-sm ">
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
                                                                    Datos del
                                                                    Cliente
                                                                    <span className="text-xs font-normal text-cyan-500 dark:text-cyan-400">
                                                                        (Buscar
                                                                        por
                                                                        RUC/DNI
                                                                        o
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
                                                                        {sale.clientId >
                                                                        0
                                                                            ? "✓ Cliente seleccionado"
                                                                            : "⚠️ Seleccione un cliente"}
                                                                    </span>
                                                                </label>
                                                                <div className="relative w-full mt-1 group">
                                                                    <input
                                                                        ref={
                                                                            clientInputRef
                                                                        }
                                                                        type="text"
                                                                        className="mt-1 px-3 py-2 block w-full rounded-full dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                                        style={{
                                                                            border: "1px solid rgb(202, 202, 202)",
                                                                        }}
                                                                        maxLength={
                                                                            200
                                                                        }
                                                                        value={
                                                                            clientSearch
                                                                        }
                                                                        onChange={
                                                                            handleClientSearchChange
                                                                        }
                                                                        onInput={
                                                                            handleClientSelect
                                                                        }
                                                                        onFocus={(
                                                                            e
                                                                        ) =>
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
                                                                                    key={
                                                                                        index
                                                                                    }
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
                                                                        className="absolute inset-y-0 right-12 px-3 py-2 bg-gray-600 text-white rounded-r-xs hover:bg-gray-400 focus:ring-2 focus:ring-gray-500"
                                                                        onClick={() => {
                                                                            setSale(
                                                                                {
                                                                                    ...sale,
                                                                                    clientName:
                                                                                        "",
                                                                                    clientId: 0,
                                                                                }
                                                                            );
                                                                            setClientSearch(
                                                                                ""
                                                                            );
                                                                        }}
                                                                    >
                                                                        <SunatCancel />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className="absolute inset-y-0 right-0 px-2 py-2 bg-blue-600 dark:bg-cyan-600 text-white rounded-r-full hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                                                                        onClick={(
                                                                            e
                                                                        ) => {
                                                                            modalAddClient.show();
                                                                            setPerson(
                                                                                initialStatePerson
                                                                            );
                                                                        }}
                                                                    >
                                                                        Nuevo
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <style jsx>{`
                                                                .custom-datalist
                                                                    option {
                                                                    background-color: #1f2937; /* Dark background */
                                                                    color: #d1d5db; /* Light text */
                                                                    padding: 8px;
                                                                    border: 1px
                                                                        solid
                                                                        #374151; /* Border color */
                                                                }
                                                                .custom-datalist
                                                                    option:hover {
                                                                    background-color: #4b5563; /* Hover background */
                                                                    color: #ffffff; /* Hover text */
                                                                }
                                                            `}</style>
                                                        </div>
                                                    </fieldset>
                                                </div>
                                                {/* Búsqueda de Productos */}
                                                <div className="p-6 border-2 border-gray-200 dark:border-emerald-900 bg-gray-50 dark:bg-gray-900 rounded-xl shadow-lg relative ">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-2 text-gray-500 dark:text-emerald-400">
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
                                                                Búsqueda de
                                                                Productos
                                                            </h3>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="relative">
                                                                <input
                                                                    type="text"
                                                                    value={
                                                                        barcodeInput
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        setBarcodeInput(
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    onKeyPress={
                                                                        handleBarcodeKeyPress
                                                                    }
                                                                    onFocus={(
                                                                        e
                                                                    ) =>
                                                                        e.target.select()
                                                                    }
                                                                    className="pl-10 pr-3 py-1 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md focus:border-blue-500 focus:ring-blue-500"
                                                                    placeholder="Código de barras..."
                                                                    autoComplete="off"
                                                                />
                                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                    <Search className="h-4 w-4 text-gray-400" />
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleBarcodeSearch(
                                                                        barcodeInput
                                                                    )
                                                                }
                                                                className="px-3 py-1 text-sm bg-blue-600 dark:bg-cyan-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                                                            >
                                                                Buscar
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="relative w-full">
                                                        <input
                                                            type="text"
                                                            className="mt-1 px-3 py-2 block w-full rounded-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                            maxLength={100}
                                                            value={product.name}
                                                            name="name"
                                                            onChange={
                                                                handleProduct
                                                            }
                                                            onFocus={(e) =>
                                                                e.target.select()
                                                            }
                                                            autoComplete="off"
                                                            disabled={
                                                                productsLoading
                                                            }
                                                            placeholder="Buscar Producto..."
                                                            list="productNameList"
                                                            required
                                                            style={{
                                                                border: "1px solid rgb(202, 202, 202)",
                                                            }}
                                                        />
                                                        <datalist id="productNameList">
                                                            {productsData?.allProducts?.map(
                                                                (
                                                                    n: IProduct,
                                                                    index: number
                                                                ) => (
                                                                    <option
                                                                        key={
                                                                            index
                                                                        }
                                                                        data-key={
                                                                            n.id
                                                                        }
                                                                        data-price={
                                                                            n.priceWithIgv3
                                                                        }
                                                                        value={`[${
                                                                            n.code
                                                                        }] ${n.name
                                                                            .replace(
                                                                                /[\n\r\s]+/g,
                                                                                " "
                                                                            )
                                                                            .trim()} ▶️ S/ ${Number(
                                                                            n.priceWithIgv3
                                                                        ).toFixed(
                                                                            2
                                                                        )}`}
                                                                    />
                                                                )
                                                            )}
                                                        </datalist>
                                                        <button
                                                            type="button"
                                                            className="absolute inset-y-0 right-0 px-2.5 py-2 bg-blue-600 dark:bg-cyan-600 text-white rounded-r-full hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                                                            onClick={(e) => {
                                                                modalProduct.show();
                                                                setProduct({
                                                                    ...initialStateProduct,
                                                                    onSaveSuccess:
                                                                        () => {
                                                                            modalProduct.hide();
                                                                            modalAddDetail.show();
                                                                            setSaleDetail(
                                                                                initialStateSaleDetail
                                                                            );
                                                                        },
                                                                });
                                                            }}
                                                        >
                                                            Nuevo
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
                                                        setInvoiceDetail={
                                                            setSaleDetail
                                                        }
                                                        modalAddDetail={
                                                            modalAddDetail
                                                        }
                                                    />
                                                    <div className="flex justify-start">
                                                        <button
                                                            type="button"
                                                            className="px-5 py-2 bg-blue-600 dark:bg-cyan-600 text-white rounded-full hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
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
                                                <fieldset className="border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-md p-6">
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
                                                                    sale.observation
                                                                }
                                                                onChange={
                                                                    handleSale
                                                                }
                                                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                            ></textarea>
                                                        </div>
                                                    </div>
                                                </fieldset>

                                                {/* Botón Continuar con el Pago */}
                                                <div className="flex justify-end py-2">
                                                    <button
                                                        type="button"
                                                        className={`w-full px-5 py-3 text-2xl font-semibold bg-blue-600 dark:bg-cyan-600 text-white rounded-xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 flex items-center gap-2 justify-center ${
                                                            sale
                                                                ?.operationdetailSet
                                                                ?.length === 0
                                                                ? "cursor-not-allowed"
                                                                : ""
                                                        }`}
                                                        onClick={async () => {
                                                            if (
                                                                validateBeforePayment()
                                                            ) {
                                                                if (
                                                                    !auth?.user
                                                                        ?.companyDisableContinuePay
                                                                ) {
                                                                    modalWayPay.show();
                                                                    setSale({
                                                                        ...sale,
                                                                        totalPayed:
                                                                            "",
                                                                        cashflowSet:
                                                                            [],
                                                                    });
                                                                    setCashFlow(
                                                                        {
                                                                            ...cashFlow,
                                                                            total: Number(
                                                                                sale.totalToPay
                                                                            ),
                                                                        }
                                                                    );
                                                                } else {
                                                                    // Handle direct cash payment
                                                                    const cashPayment =
                                                                        {
                                                                            wayPay: 1, // EFECTIVO [CONTADO]
                                                                            total: Number(
                                                                                sale.totalToPay
                                                                            ),
                                                                            description:
                                                                                "Pago en efectivo",
                                                                            transactionDate:
                                                                                today,
                                                                            temporaryId: 1,
                                                                        };
                                                                    // Update the sale state with cash payment
                                                                    setSale({
                                                                        ...sale,
                                                                        cashflowSet:
                                                                            [
                                                                                cashPayment,
                                                                            ],
                                                                        totalPayed:
                                                                            sale.totalToPay ||
                                                                            "0.00",
                                                                        totalTurned:
                                                                            "0.00",
                                                                    });
                                                                    // Set trigger to call handleSaveSale after state update
                                                                    setTriggerSaveSale(
                                                                        true
                                                                    );
                                                                }
                                                            }
                                                        }}
                                                        disabled={
                                                            sale
                                                                ?.operationdetailSet
                                                                ?.length === 0
                                                        }
                                                    >
                                                        {auth?.user
                                                            ?.companyDisableContinuePay
                                                            ? "FINALIZAR VENTA"
                                                            : "CONTINUAR CON EL PAGO S/"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
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
            <WayPayForm
                modalWayPay={modalWayPay}
                setModalWayPay={setModalWayPay}
                cashFlow={cashFlow}
                setCashFlow={setCashFlow}
                initialStateCashFlow={initialStateCashFlow}
                initialStateSale={initialStateSale}
                invoice={sale}
                setInvoice={setSale}
                jwtToken={auth?.jwtToken}
                authContext={authContext}
                wayPaysData={wayPaysData}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
                onSaveSaleRef={(fn: any) => (saveSaleRef.current = fn)}
            />
        </>
    );
}

export default NewSalePage;
