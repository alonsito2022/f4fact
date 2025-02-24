"use client";
import { useState, useEffect, useMemo, ChangeEvent, FormEvent } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import { Modal, ModalOptions } from "flowbite";
import { useQuery, gql } from "@apollo/client";
import { IOperationDetail, IPerson, IProduct, IUser } from "@/app/types";
import Search from "@/components/icons/Search";
import Add from "@/components/icons/Add";
import Edit from "@/components/icons/Edit";
import Delete from "@/components/icons/Delete";
import Save from "@/components/icons/Save";
import ProductForm from "../../logistics/products/ProductForm";
import { toast } from "react-toastify";
import SaleDetailForm from "../SaleDetailForm";
import WayPayForm from "../WayPayForm";
import { useAuth } from "@/components/providers/AuthProvider";
import SunatCancel from "@/components/icons/SunatCancel";
import ClientForm from "../ClientForm";
import SaleDetailList from "../SaleDetailList";
import SaleTotalList from "../SaleTotalList";
const today = new Date().toISOString().split("T")[0];

const CLIENTS_QUERY = gql`
    query {
        allClients {
            names
            id
            address
            documentNumber
            documentType
        }
    }
`;
const PRODUCTS_QUERY = gql`
    query ($subsidiaryId: Int!) {
        allProducts(subsidiaryId: $subsidiaryId) {
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
const initialStateSale = {
    id: 0,
    serial: "",
    correlative: "",
    emitDate: today,
    clientName: "",
    clientId: 0,
    igvType: 18,
    documentType: "01",
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
};
const initialStateSaleDetail = {
    id: 0,
    productId: 0,
    productName: "",

    quantity: "",

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

    minimumUnitId: 0,
    maximumUnitId: 0,
    maximumFactor: "1",
    minimumFactor: "1",
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
};
const initialStateUserLogged = {
    id: 0,
    subsidiaryId: "",
    isSuperuser: false,
};
function NewSalePage() {
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

    useEffect(() => {
        if (auth?.user?.companyPercentageIgv) {
            setSale((prevSale) => ({
                ...prevSale,
                igvType: Number(auth?.user?.companyPercentageIgv),
            }));
        }
    }, [auth?.user?.companyPercentageIgv]);

    useEffect(() => {
        if (Number(sale.clientId) > 0) {
            const client = personsData?.allClients?.find(
                (n: IPerson) => Number(n.id) === Number(sale.clientId)
            );
            if (client) {
                setSale((prevSale) => ({
                    ...prevSale,
                    documentType:
                        client?.documentType?.replace("A_", "") === "6"
                            ? "01"
                            : "03",
                }));
            }
        }
    }, [sale?.clientId]);

    useEffect(() => {
        const subsidiarySerial = auth?.user?.subsidiarySerial;
        if (subsidiarySerial) {
            const lastTwoDigits = subsidiarySerial.slice(-2);
            let prefix = "";

            switch (sale.documentType) {
                case "01":
                    prefix = "F0";
                    break;
                case "03":
                    prefix = "B0";
                    break;
                case "07":
                    prefix = "NC";
                    break;
                case "08":
                    prefix = "ND";
                    break;
                case "09":
                    prefix = "GT";
                    break;
                default:
                    prefix = "";
            }

            const customSerial = `${prefix}${lastTwoDigits}`;
            setSale((prevSale) => ({
                ...prevSale,
                serial: customSerial,
            }));
        }
    }, [auth?.user?.subsidiarySerial, sale.documentType]);

    const getVariables = () => ({
        subsidiaryId: Number(auth?.user?.subsidiaryId),
    });
    const {
        loading: personsLoading,
        error: personsError,
        data: personsData,
    } = useQuery(CLIENTS_QUERY, {
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

    const handleSale = (
        event: ChangeEvent<
            HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = event.target;
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
            } else {
                console.log("sin datalist");
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
                const option = Array.from(dataList.options).find(
                    (option) => option.value === value
                );
                if (option) {
                    const selectedId = option.getAttribute("data-key");
                    setProduct({
                        ...product,
                        id: Number(selectedId),
                        name: value,
                    });

                    modalAddDetail.show();
                    // setPurchaseDetail({
                    //     ...purchaseDetail,

                    //     id: 0,
                    //     productId: Number(selectedId),
                    //     productName: value,

                    //     quantity: "1",

                    //     unitValue: "",
                    //     unitPrice: "",
                    //     igvPercentage: "",
                    //     discountPercentage: "",
                    //     totalDiscount: "",
                    //     totalValue: "",
                    //     totalIgv: "",
                    //     totalAmount: "",
                    //     totalPerception: "",
                    //     totalToPay: "",

                    //     typeAffectationId: 0,
                    //     productTariffId: 0,
                    //     remainingQuantity: 0,
                    // });
                } else {
                    setProduct({ ...product, id: 0, name: value });
                }
            } else {
                console.log("sin datalist");
            }
        } else setProduct({ ...product, [name]: value });
    };

    // useEffect(() => {
    //     if (auth?.status === "authenticated") {
    //         const user = auth?.user as IUser;
    //         setUserLogged((prev) => ({
    //             ...prev,
    //             subsidiaryId:
    //                 prev.subsidiaryId ||
    //                 (user.isSuperuser ? "0" : user.subsidiaryId!),
    //             isSuperuser: user.isSuperuser ?? false, // Asegura que isSuperuser sea siempre booleano
    //         }));
    //         console.log(user.isSuperuser ? "0" : user.subsidiaryId!);
    //     }
    // }, [auth?.status]);

    useEffect(() => {
        calculateTotal();
    }, [sale.operationdetailSet]);

    function calculateTotal() {
        const discountForItem = sale?.operationdetailSet?.reduce(
            (total: number, detail: IOperationDetail) => {
                return total + Number(detail.totalDiscount);
            },
            0
        );

        const discountGlobal = 0;
        const totalDiscount = discountForItem + discountGlobal;

        const totalUnaffected = sale?.operationdetailSet
            ?.filter(
                (detail: IOperationDetail) => detail.typeAffectationId == 3
            )
            .reduce((total: number, detail: IOperationDetail) => {
                return total + Number(detail.totalValue);
            }, 0);

        const totalExonerated = sale?.operationdetailSet
            ?.filter(
                (detail: IOperationDetail) => detail.typeAffectationId == 2
            )
            .reduce((total: number, detail: IOperationDetail) => {
                return total + Number(detail.totalValue);
            }, 0);

        const totalTaxed = sale?.operationdetailSet
            ?.filter(
                (detail: IOperationDetail) => detail.typeAffectationId == 1
            )
            .reduce((total: number, detail: IOperationDetail) => {
                return total + Number(detail.totalValue);
            }, 0);

        const totalIgv = sale?.operationdetailSet?.reduce(
            (total: number, detail: IOperationDetail) => {
                return total + Number(detail.totalIgv);
            },
            0
        );

        const totalAmount =
            totalExonerated + totalUnaffected + totalTaxed + totalIgv;
        const totalPerception = 0;
        const totalToPay = totalAmount + totalPerception;

        // quantity: "",
        // unitValue: "",
        // unitPrice: "",
        // igvPercentage: "",
        // discountPercentage: "",
        // totalDiscount: "",
        // totalValue: "",
        // totalIgv: "",
        // totalAmount: "",
        // totalPerception: "",
        // totalToPay: "",

        setSale((prevEntry: any) => ({
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
    // Si la sesión aún está cargando, muestra un spinner en lugar de "Cargando..."
    if (auth?.status === "loading") {
        return <p className="text-center">Cargando sesión...</p>;
    }
    // Si la sesión no está autenticada, muestra un mensaje de error o redirige
    if (auth?.status === "unauthenticated") {
        return <p className="text-center text-red-500">No autorizado</p>;
    }
    // Manejo de errores
    if (
        personsError ||
        productsError ||
        typeAffectationsError ||
        wayPaysError
    ) {
        return (
            <div>
                Error: No autorizado o error en la consulta.
                {personsError?.message ||
                    productsError?.message ||
                    typeAffectationsError?.message ||
                    wayPaysError?.message}
            </div>
        );
    }

    return (
        <>
            <div className="p-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 lg:mt-1.5 dark:bg-gray-800 dark:border-gray-700">
                <div className="w-full mb-1">
                    <Breadcrumb section={"Ventas"} article={"Nueva Venta"} />
                </div>
            </div>

            <div className="flex flex-col space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden shadow-lg rounded-lg">
                            <div className="p-4 md:p-5 space-y-6">
                                <input
                                    type="hidden"
                                    name="id"
                                    id="id"
                                    value={sale.id}
                                />
                                <div className="grid gap-4  lg:grid-cols-5 sm:grid-cols-1 md:grid-cols-3">
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
                                            <option value={18}>18%</option>
                                            <option value={10}>
                                                10% (Ley 31556)
                                            </option>
                                            <option value={4}>4% (IVAP)</option>
                                        </select>
                                    </div>
                                    {/* Tipo documento */}
                                    <div>
                                        <label
                                            htmlFor="documentType"
                                            className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                        >
                                            Tipo documento
                                        </label>
                                        <select
                                            value={sale.documentType}
                                            name="documentType"
                                            onChange={handleSale}
                                            className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            required
                                        >
                                            <option value={"01"}>
                                                FACTURA ELECTRÓNICA
                                            </option>
                                            <option value={"03"}>
                                                BOLETA DE VENTA ELECTRÓNICA
                                            </option>
                                            <option value={"07"}>
                                                NOTA DE CRÉDITO ELECTRÓNICA
                                            </option>
                                            <option value={"08"}>
                                                NOTA DE DÉBITO ELECTRÓNICA
                                            </option>
                                            <option value={"09"}>
                                                GUIA DE REMISIÓN REMITENTE
                                            </option>
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
                                            onFocus={(e) => e.target.select()}
                                            className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            required
                                        />
                                    </div>
                                    {/* Cliente */}
                                    <div className="md:col-span-4">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Cliente
                                        </label>
                                        <div className="relative w-full">
                                            <input
                                                type="text"
                                                className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                maxLength={200}
                                                value={sale.clientName}
                                                name="clientName"
                                                onChange={handleSale}
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                autoComplete="off"
                                                disabled={personsLoading}
                                                placeholder="Buscar cliente..."
                                                list="clientNameList"
                                                required
                                            />
                                            <datalist
                                                id="clientNameList"
                                                className="custom-datalist"
                                            >
                                                {personsData?.allClients?.map(
                                                    (
                                                        n: IPerson,
                                                        index: number
                                                    ) => (
                                                        <option
                                                            key={index}
                                                            data-key={n.id}
                                                            value={`${n.documentNumber} ${n.names}`}
                                                        />
                                                    )
                                                )}
                                            </datalist>
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-10 px-2 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-400 focus:ring-2 focus:ring-gray-500"
                                                onClick={() =>
                                                    setSale({
                                                        ...sale,
                                                        clientName: "",
                                                        clientId: 0,
                                                    })
                                                }
                                            >
                                                <SunatCancel />
                                            </button>
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 px-2.5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
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
                                                US$ USD - DÓLARES AMERICANOS
                                            </option>
                                            <option value={"EUR"}>
                                                € EUR - EUROS
                                            </option>
                                            <option value={"GBP"}>
                                                £ GBP - LIBRA ESTERLINA
                                            </option>
                                        </select>
                                    </div>
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
                                            value={sale.saleExchangeRate}
                                            onChange={handleSale}
                                            onFocus={(e) => e.target.select()}
                                            className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            autoComplete="off"
                                        />
                                    </div>
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
                                            value={sale.serial}
                                            onChange={handleSale}
                                            onFocus={(e) => e.target.select()}
                                            className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
                                            value={sale.correlative}
                                            onChange={handleSale}
                                            onFocus={(e) => e.target.select()}
                                            className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            autoComplete="off"
                                        />
                                    </div>
                                    {/* Buscar Producto o Servicio */}
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Buscar Producto o Servicio
                                        </label>
                                        <div className="relative w-full">
                                            <input
                                                type="text"
                                                className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                maxLength={100}
                                                value={product.name}
                                                name="name"
                                                onChange={handleProduct}
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
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
                                                            value={n.name}
                                                        />
                                                    )
                                                )}
                                            </datalist>
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 px-2.5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                                                onClick={(e) => {
                                                    modalProduct.show();
                                                    setProduct(
                                                        initialStateProduct
                                                    );
                                                }}
                                            >
                                                <Add />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                {/* Botón Agregar Item */}
                                <div className="flex justify-end py-2">
                                    <button
                                        type="button"
                                        className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
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
                                <SaleDetailList
                                    invoice={sale}
                                    setInvoice={setSale}
                                    product={product}
                                    setProduct={setProduct}
                                    setInvoiceDetail={setSaleDetail}
                                    modalAddDetail={modalAddDetail}
                                />
                                <SaleTotalList invoice={sale} />
                                {/* Botón Continuar con el Pago */}
                                <div className="flex justify-end py-2">
                                    <button
                                        type="button"
                                        className={`btn-blue px-5 py-2 inline-flex items-center gap-2 ${
                                            sale?.operationdetailSet?.length ===
                                            0
                                                ? "cursor-not-allowed"
                                                : ""
                                        }`}
                                        onClick={async () => {
                                            console.log("sale", sale);
                                            if (Number(sale.clientId) === 0) {
                                                toast(
                                                    "Por favor ingrese un cliente.",
                                                    {
                                                        hideProgressBar: true,
                                                        autoClose: 2000,
                                                        type: "warning",
                                                    }
                                                );
                                                return;
                                            }
                                            if (
                                                sale.operationdetailSet
                                                    .length === 0
                                            ) {
                                                toast(
                                                    "Por favor ingrese al menos un item.",
                                                    {
                                                        hideProgressBar: true,
                                                        autoClose: 2000,
                                                        type: "warning",
                                                    }
                                                );
                                                return;
                                            }
                                            if (!sale.serial) {
                                                toast(
                                                    "Por favor ingrese la serie.",
                                                    {
                                                        hideProgressBar: true,
                                                        autoClose: 2000,
                                                        type: "warning",
                                                    }
                                                );
                                                return;
                                            }
                                            // if (!sale.correlative) {
                                            //     toast(
                                            //         "Por favor ingrese el número correlativo.",
                                            //         {
                                            //             hideProgressBar: true,
                                            //             autoClose: 2000,
                                            //             type: "warning",
                                            //         }
                                            //     );
                                            //     return;
                                            // }

                                            modalWayPay.show();
                                            setSale({
                                                ...sale,
                                                totalPayed: "",
                                                cashflowSet: [],
                                            });
                                            setCashFlow({
                                                ...cashFlow,
                                                total: Number(sale.totalToPay),
                                            });
                                        }}
                                        disabled={
                                            sale?.operationdetailSet?.length ===
                                            0
                                        }
                                    >
                                        <Save />
                                        CONTINUAR CON EL PAGO
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
                jwtToken={auth?.jwtToken}
                initialStateProduct={initialStateProduct}
                typeAffectationsData={typeAffectationsData}
                PRODUCTS_QUERY={PRODUCTS_QUERY}
                productFilterObj={productFilterObj}
            />
            <ClientForm
                modalAddClient={modalAddClient}
                setModalAddClient={setModalAddClient}
                person={person}
                setPerson={setPerson}
                jwtToken={auth?.jwtToken}
                authContext={authContext}
                CLIENTS_QUERY={CLIENTS_QUERY}
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
                jwtToken={auth?.jwtToken}
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
                sale={sale}
                setSale={setSale}
                jwtToken={auth?.jwtToken}
                wayPaysData={wayPaysData}
            />
        </>
    );
}

export default NewSalePage;
