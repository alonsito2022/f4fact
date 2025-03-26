"use client";
import {
    ICreditNoteType,
    IOperationDetail,
    IOperationType,
    ISerialAssigned,
} from "@/app/types";
import Breadcrumb from "@/components/Breadcrumb";
import { useAuth } from "@/components/providers/AuthProvider";
import { gql, useLazyQuery, useQuery } from "@apollo/client";
import { useParams } from "next/navigation";
import React, { ChangeEvent, useEffect, useMemo, useState } from "react";
import SaleDetailList from "../../SaleDetailList";
import { Modal } from "flowbite";
import SaleDetailForm from "../../SaleDetailForm";
import SaleTotalList from "../../SaleTotalList";
import WayPayForm from "../../WayPayForm";
import Save from "@/components/icons/Save";
import { toast } from "react-toastify";
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
const initialStateCreditNote = {
    id: 0,
    serial: "",
    correlative: "",
    emitDate: today,
    dueDate: today,
    clientName: "",
    clientId: 0,
    igvType: 18,
    igvPercentage: 18,
    operationType: "0101",
    documentType: "07",
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
};
const initialStateSale = {
    id: 0,
    serial: "",
    correlative: "",
    emitDate: today,
    client: {
        id: 0,
        names: "",
    },
    igvType: 18,
    igvPercentage: 18,
    operationType: "0101",
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
    parentOperationId: 0,
};
const initialStateSaleDetail = {
    id: 0,
    productId: 0,
    productName: "",

    quantity: "",
    quantityReturned: 0,
    quantityAvailable: 0,

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

    minimumUnitId: 0,
    maximumUnitId: 0,
    maximumFactor: "1",
    minimumFactor: "1",
};
const initialStateCashFlow = {
    wayPay: 1,
    total: 0,
    description: "",
};
const TYPE_OPERATION_QUERY = gql`
    query {
        allOperationTypes {
            code
            name
        }
    }
`;

const TYPE_CREDIT_NOTE_QUERY = gql`
    query {
        allCreditNoteTypes {
            code
            name
        }
    }
`;

const SALE_QUERY_BY_ID = gql`
    query ($pk: ID!) {
        getSaleById(pk: $pk) {
            id
            emitDate
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
                remainingQuantity
                quantityReturned
                quantityAvailable
            }
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
const SERIALS_QUERY = gql`
    query ($subsidiaryId: Int) {
        allSerials(subsidiaryId: $subsidiaryId) {
            documentType
            documentTypeReadable
            serial
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
function CreditPage() {
    const [isProcessing, setIsProcessing] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const params = useParams();
    const { invoiceId } = params;
    const [creditNote, setCreditNote] = useState(initialStateCreditNote);
    const [sale, setSale] = useState(initialStateSale);
    const [CreditNoteDetail, setCreditNoteDetail] = useState(
        initialStateSaleDetail
    );
    const [product, setProduct] = useState(initialStateProduct);
    const [modalAddDetail, setModalAddDetail] = useState<Modal | any>(null);
    const [modalWayPay, setModalWayPay] = useState<Modal | any>(null);
    const [cashFlow, setCashFlow] = useState(initialStateCashFlow);

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
        loading: wayPaysLoading,
        error: wayPaysError,
        data: wayPaysData,
    } = useQuery(WAY_PAY_QUERY, {
        context: authContext,
        skip: !auth?.jwtToken,
    });
    const {
        loading: creditNoteTypesLoading,
        error: creditNoteTypesError,
        data: creditNoteTypesData,
    } = useQuery(TYPE_CREDIT_NOTE_QUERY, {
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
        loading: typeAffectationsLoading,
        error: typeAffectationsError,
        data: typeAffectationsData,
    } = useQuery(TYPE_AFFECTATION_QUERY, {
        context: authContext,
        skip: !auth?.jwtToken,
    });
    const {
        loading: serialsAssignedLoading,
        error: serialsAssignedError,
        data: serialsAssignedData,
    } = useQuery(SERIALS_QUERY, {
        context: authContext,
        variables: {
            subsidiaryId: Number(auth?.user?.subsidiaryId),
        },
        skip: !auth?.jwtToken,
    });
    const getVariables = () => ({
        subsidiaryId: Number(auth?.user?.subsidiaryId),
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
        saleQuery,
        {
            loading: filteredSaleLoading,
            error: filteredSaleError,
            data: filteredSaleData,
        },
    ] = useLazyQuery(SALE_QUERY_BY_ID, {
        context: authContext,
        fetchPolicy: "network-only",
        onCompleted: (data) => {
            const dataSale = data.getSaleById;
            const igv = Number(dataSale?.igvPercentage) / 100;
            setSale(dataSale);
            const formattedOperationdetailSet = dataSale.operationdetailSet
                .filter(
                    (detail: IOperationDetail) =>
                        Number(detail.quantityAvailable) > 0
                )
                .map((detail: IOperationDetail, index: number) => ({
                    ...detail,
                    quantity: Number(detail.quantityAvailable).toString(),
                    quantityReturned: Number(detail.quantityReturned),
                    quantityAvailable: Number(detail.quantityAvailable),
                    unitValue: Number(detail.unitValue).toFixed(2),
                    unitPrice: Number(detail.unitPrice).toFixed(2),
                    igvPercentage: Number(detail.igvPercentage).toFixed(2),
                    discountPercentage: Number(
                        detail.discountPercentage
                    ).toFixed(2),
                    totalDiscount: Number(detail.totalDiscount).toFixed(2),
                    totalValue: Number(
                        Number(detail.unitValue) *
                            Number(detail.quantityAvailable)
                    ).toFixed(2),
                    totalIgv: Number(
                        Number(detail.unitValue) *
                            Number(detail.quantityAvailable) *
                            igv
                    ).toFixed(2),
                    totalAmount: Number(
                        Number(detail.unitValue) *
                            Number(detail.quantityAvailable) *
                            (1 + igv)
                    ).toFixed(2),
                    totalPerception: Number(detail.totalPerception).toFixed(2),
                    totalToPay: Number(detail.totalToPay).toFixed(2),
                    temporaryId: index + 1,
                    productTariffId: Number(detail.productTariffId),
                    id: Number(detail.id),
                }));

            setCreditNote((prevSale) => ({
                ...prevSale,
                igvType: Number(
                    dataSale?.igvType?.toString().replace("A_", "")
                ),
                currencyType: dataSale?.currencyType,
                saleExchangeRate: dataSale?.saleExchangeRate
                    ? dataSale?.saleExchangeRate
                    : "",
                operationdetailSet: formattedOperationdetailSet,
                clientId: Number(dataSale?.client?.id),
                clientName: dataSale?.client?.names,
                parentOperationId: Number(dataSale?.id),
                totalAmount: Number(dataSale?.totalAmount).toFixed(2),
                totalFree: Number(dataSale?.totalFree).toFixed(2),
                totalIgv: Number(dataSale?.totalIgv).toFixed(2),
                totalTaxed: Number(dataSale?.totalTaxed).toFixed(2),
                totalUnaffected: Number(dataSale?.totalUnaffected).toFixed(2),
                totalExonerated: Number(dataSale?.totalExonerated).toFixed(2),
                totalDiscount: Number(dataSale?.totalDiscount).toFixed(2),
                discountForItem: Number(
                    dataSale?.discountForItem ? dataSale?.discountForItem : 0
                ).toFixed(2),
                discountGlobal: Number(
                    dataSale?.discountGlobal ? dataSale?.discountGlobal : 0
                ).toFixed(2),
                totalPerception: Number(
                    dataSale?.totalPerception ? dataSale?.totalPerception : 0
                ).toFixed(2),
                totalToPay: Number(dataSale?.totalToPay).toFixed(2),
            }));
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
                    s.documentType === `A_${creditNote.documentType}`
            );

            if (filteredSeries.length > 0) {
                setCreditNote((prev: any) => ({
                    ...prev,
                    serial: filteredSeries[0].serial,
                }));
            } else {
                setCreditNote((prev: any) => ({
                    ...prev,
                    serial: "",
                }));
            }
        }
    }, [serialsAssignedData, creditNote.documentType]);
    useEffect(() => {
        if (invoiceId) {
            // Aquí puedes manejar el parámetro invoiceId
            saleQuery({
                variables: {
                    pk: Number(invoiceId),
                },
            });
        }
    }, [invoiceId]);

    // useEffect(() => {
    //     const subsidiarySerial = auth?.user?.subsidiarySerial;
    //     if (subsidiarySerial && sale.documentType) {
    //         const lastTwoDigits = subsidiarySerial.slice(-2);
    //         let prefix = "";
    //         switch (sale.documentType.replace("A_", "")) {
    //             case "01":
    //                 prefix = "FN";
    //                 break;
    //             case "03":
    //                 prefix = "BN";
    //                 break;
    //             default:
    //                 prefix = "";
    //         }
    //         const customSerial = `${prefix}${lastTwoDigits}`;
    //         setCreditNote((prevSale) => ({
    //             ...prevSale,
    //             serial: customSerial,
    //         }));
    //     }
    // }, [auth?.user?.subsidiarySerial, sale.documentType]);

    const handleCreditNote = (
        event: ChangeEvent<
            HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = event.target;
        setCreditNote({ ...creditNote, [name]: value });
    };
    const handleSale = (
        event: ChangeEvent<
            HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = event.target;
        setSale({ ...sale, [name]: value });
    };

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
                                section={"Ventas"}
                                article={"Generar Nota de Crédito"}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                        <div className="overflow-x-auto">
                            <div className="inline-block min-w-full align-middle">
                                <div className="overflow-hidden shadow-lg rounded-lg">
                                    {filteredSaleLoading ? (
                                        <div className="p-4 text-center">
                                            <span className="loader"></span>{" "}
                                            {/* Puedes usar un spinner o cualquier otro indicador de carga */}
                                            Cargando venta...
                                        </div>
                                    ) : filteredSaleError ? (
                                        <div className="p-4 text-red-500 text-center">
                                            {filteredSaleError.message}
                                        </div>
                                    ) : (
                                        <div className="p-4 md:p-5 space-y-6">
                                            <div className="grid gap-6">
                                                <fieldset className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                                                    <legend className="px-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
                                                        Motivo de emisión
                                                    </legend>
                                                    <div className="grid gap-6 lg:grid-cols-4 sm:grid-cols-1">
                                                        {/* Tipo de Nota de Crédito */}
                                                        <div className="lg:col-span-4">
                                                            <label
                                                                htmlFor="creditNoteType"
                                                                className="text-sm font-medium text-gray-900 dark:text-gray-200"
                                                            >
                                                                Tipo de Nota de
                                                                Crédito
                                                            </label>
                                                            <select
                                                                value={
                                                                    creditNote.creditNoteType
                                                                }
                                                                name="creditNoteType"
                                                                onChange={
                                                                    handleCreditNote
                                                                }
                                                                className="mt-1 w-full px-3 py-2 border rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm uppercase"
                                                                required
                                                            >
                                                                {creditNoteTypesData?.allCreditNoteTypes?.map(
                                                                    (
                                                                        o: ICreditNoteType,
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
                                                                className="text-sm font-medium text-gray-900 dark:text-gray-200"
                                                            >
                                                                Fecha emisión
                                                            </label>
                                                            <input
                                                                type="date"
                                                                name="emitDate"
                                                                id="emitDate"
                                                                value={
                                                                    creditNote.emitDate
                                                                }
                                                                onChange={
                                                                    handleCreditNote
                                                                }
                                                                onFocus={(e) =>
                                                                    e.target.select()
                                                                }
                                                                className="mt-1 w-full px-3 py-2 border rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                                required
                                                            />
                                                        </div>
                                                        {/* Fecha de Venc. */}
                                                        <div>
                                                            <label
                                                                htmlFor="dueDate"
                                                                className="text-sm font-medium text-gray-900 dark:text-gray-200"
                                                            >
                                                                Fecha de Venc.
                                                            </label>
                                                            <input
                                                                type="date"
                                                                name="dueDate"
                                                                id="dueDate"
                                                                value={
                                                                    creditNote.dueDate
                                                                }
                                                                onChange={
                                                                    handleCreditNote
                                                                }
                                                                onFocus={(e) =>
                                                                    e.target.select()
                                                                }
                                                                className="mt-1 w-full px-3 py-2 border rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                                required
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
                                                            <select
                                                                name="serial"
                                                                id="serial"
                                                                value={
                                                                    creditNote.serial
                                                                }
                                                                onChange={
                                                                    handleCreditNote
                                                                }
                                                                className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                                required
                                                            >
                                                                {serialsAssignedData?.allSerials
                                                                    ?.filter(
                                                                        (
                                                                            s: ISerialAssigned
                                                                        ) =>
                                                                            s.documentType ===
                                                                            `A_${creditNote.documentType}`
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
                                                                        No hay
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
                                                                    `A_${creditNote.documentType}`
                                                            ).length === 0 && (
                                                                <p className="mt-1 text-sm text-red-600 dark:text-red-500">
                                                                    No hay
                                                                    series
                                                                    asignadas
                                                                    para este
                                                                    tipo de
                                                                    documento
                                                                </p>
                                                            )}
                                                        </div>
                                                        {/* Numero */}
                                                        <div>
                                                            <label
                                                                htmlFor="correlative"
                                                                className="text-sm font-medium text-gray-900 dark:text-gray-200"
                                                            >
                                                                Numero
                                                            </label>
                                                            <input
                                                                type="text"
                                                                name="correlative"
                                                                id="correlative"
                                                                maxLength={10}
                                                                value={
                                                                    creditNote.correlative
                                                                }
                                                                onChange={
                                                                    handleCreditNote
                                                                }
                                                                onFocus={(e) =>
                                                                    e.target.select()
                                                                }
                                                                className="mt-1 w-full px-3 py-2 border rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                                autoComplete="off"
                                                            />
                                                        </div>
                                                    </div>
                                                </fieldset>
                                                <fieldset className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                                                    <legend className="px-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
                                                        Documento que se
                                                        modifica
                                                    </legend>

                                                    <div className="grid gap-6 lg:grid-cols-3 sm:grid-cols-1">
                                                        {/* CPE Tipo documento */}
                                                        <div>
                                                            <label
                                                                htmlFor="invoiceDocumentType"
                                                                className="text-sm font-medium text-gray-900 dark:text-gray-200"
                                                            >
                                                                Tipo documento
                                                            </label>
                                                            <select
                                                                value={sale?.documentType.replace(
                                                                    "A_",
                                                                    ""
                                                                )}
                                                                onChange={
                                                                    handleSale
                                                                }
                                                                id="invoiceDocumentType"
                                                                name="invoiceDocumentType"
                                                                className="mt-1 w-full px-3 py-2 border rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                                disabled
                                                            >
                                                                <option value="07">
                                                                    NOTA DE
                                                                    CRÉDITO
                                                                    ELECTRÓNICA
                                                                </option>
                                                                <option value="08">
                                                                    NOTA DE
                                                                    DÉBITO
                                                                    ELECTRÓNICA
                                                                </option>
                                                                <option value="09">
                                                                    GUÍA DE
                                                                    REMISIÓN
                                                                    REMITENTE
                                                                </option>
                                                                <option value="03">
                                                                    BOLETA DE
                                                                    VENTA
                                                                    ELECTRÓNICA
                                                                </option>
                                                                <option value="01">
                                                                    FACTURA
                                                                    ELECTRÓNICA
                                                                </option>
                                                            </select>
                                                        </div>

                                                        {/* CPE Serie */}
                                                        <div>
                                                            <label
                                                                htmlFor="invoiceSerial"
                                                                className="text-sm font-medium text-gray-900 dark:text-gray-200"
                                                            >
                                                                Serie
                                                            </label>
                                                            <input
                                                                type="text"
                                                                name="invoiceSerial"
                                                                id="invoiceSerial"
                                                                maxLength={4}
                                                                value={
                                                                    sale.serial
                                                                }
                                                                onChange={
                                                                    handleSale
                                                                }
                                                                onFocus={(e) =>
                                                                    e.target.select()
                                                                }
                                                                className="mt-1 w-full px-3 py-2 border rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                                autoComplete="off"
                                                                disabled
                                                            />
                                                        </div>

                                                        {/* CPE Numero */}
                                                        <div>
                                                            <label
                                                                htmlFor="invoiceCorrelative"
                                                                className="text-sm font-medium text-gray-900 dark:text-gray-200"
                                                            >
                                                                Número
                                                            </label>
                                                            <input
                                                                type="text"
                                                                name="invoiceCorrelative"
                                                                id="invoiceCorrelative"
                                                                maxLength={10}
                                                                value={
                                                                    sale.correlative
                                                                }
                                                                onChange={
                                                                    handleSale
                                                                }
                                                                onFocus={(e) =>
                                                                    e.target.select()
                                                                }
                                                                className="mt-1 w-full px-3 py-2 border rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                                autoComplete="off"
                                                                disabled
                                                            />
                                                        </div>
                                                    </div>
                                                </fieldset>

                                                <fieldset className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                                                    <legend className="px-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
                                                        Información adicional
                                                    </legend>

                                                    <div className="grid gap-6 lg:grid-cols-4 sm:grid-cols-1">
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
                                                                    creditNote.igvType
                                                                }
                                                                name="igvType"
                                                                onChange={
                                                                    handleCreditNote
                                                                }
                                                                className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                                required
                                                            >
                                                                <option
                                                                    value={4}
                                                                >
                                                                    4% (IVAP)
                                                                </option>
                                                                <option
                                                                    value={18}
                                                                >
                                                                    18%
                                                                </option>
                                                                <option
                                                                    value={10}
                                                                >
                                                                    10% (Ley
                                                                    31556)
                                                                </option>
                                                            </select>
                                                        </div>
                                                        {/* Tipo de Operacion */}
                                                        <div>
                                                            <label
                                                                htmlFor="operationType"
                                                                className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                                            >
                                                                Tipo de
                                                                Operacion
                                                            </label>
                                                            <select
                                                                value={
                                                                    creditNote.operationType
                                                                }
                                                                name="operationType"
                                                                onChange={
                                                                    handleCreditNote
                                                                }
                                                                className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                                required
                                                            >
                                                                {operationTypesData?.allOperationTypes?.map(
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
                                                                            {
                                                                                o.name
                                                                            }
                                                                        </option>
                                                                    )
                                                                )}
                                                            </select>
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
                                                                    creditNote.currencyType
                                                                }
                                                                name="currencyType"
                                                                onChange={
                                                                    handleCreditNote
                                                                }
                                                                className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                            >
                                                                <option
                                                                    value={0}
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
                                                                    US$ USD -
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
                                                        {creditNote.currencyType !==
                                                            "PEN" && (
                                                            <>
                                                                {/* Tipo de Cambio */}
                                                                <div>
                                                                    <label
                                                                        htmlFor="saleExchangeRate"
                                                                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                                                    >
                                                                        Tipo de
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
                                                                            creditNote.saleExchangeRate
                                                                        }
                                                                        onChange={
                                                                            handleCreditNote
                                                                        }
                                                                        onFocus={(
                                                                            e
                                                                        ) =>
                                                                            e.target.select()
                                                                        }
                                                                        className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                                        autoComplete="off"
                                                                    />
                                                                </div>
                                                            </>
                                                        )}

                                                        {/* CPE Cliente */}
                                                        <div className="lg:col-span-4">
                                                            <label
                                                                htmlFor="invoiceClientName"
                                                                className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                                            >
                                                                Cliente
                                                            </label>
                                                            <input
                                                                type="text"
                                                                id="invoiceClientName"
                                                                value={
                                                                    sale?.client
                                                                        ?.names
                                                                }
                                                                onChange={
                                                                    handleSale
                                                                }
                                                                className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                                disabled
                                                            />
                                                        </div>
                                                    </div>
                                                </fieldset>
                                            </div>
                                            <SaleDetailList
                                                invoice={creditNote}
                                                setInvoice={setCreditNote}
                                                product={product}
                                                setProduct={setProduct}
                                                setInvoiceDetail={
                                                    setCreditNoteDetail
                                                }
                                                modalAddDetail={modalAddDetail}
                                            />
                                            <SaleTotalList
                                                invoice={creditNote}
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
                                                                creditNote.observation
                                                            }
                                                            onChange={
                                                                handleCreditNote
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
                                                    className={`btn-blue px-5 py-2 inline-flex items-center gap-2 ${
                                                        creditNote
                                                            ?.operationdetailSet
                                                            ?.length === 0 ||
                                                        isProcessing
                                                            ? "cursor-not-allowed opacity-60"
                                                            : ""
                                                    }`}
                                                    onClick={async () => {
                                                        if (isProcessing)
                                                            return;
                                                        setIsProcessing(true);
                                                        try {
                                                            if (
                                                                creditNote.creditNoteType ===
                                                                "NA"
                                                            ) {
                                                                toast(
                                                                    "Por favor ingrese un motivo de nota de credito.",
                                                                    {
                                                                        hideProgressBar:
                                                                            true,
                                                                        autoClose: 2000,
                                                                        type: "warning",
                                                                    }
                                                                );
                                                                return;
                                                            }
                                                            if (
                                                                creditNote.clientId &&
                                                                Number(
                                                                    creditNote.clientId
                                                                ) === 0
                                                            ) {
                                                                toast(
                                                                    "Por favor ingrese un cliente.",
                                                                    {
                                                                        hideProgressBar:
                                                                            true,
                                                                        autoClose: 2000,
                                                                        type: "warning",
                                                                    }
                                                                );
                                                                return;
                                                            }
                                                            if (
                                                                creditNote
                                                                    .operationdetailSet
                                                                    .length ===
                                                                0
                                                            ) {
                                                                toast(
                                                                    "Por favor ingrese al menos un item.",
                                                                    {
                                                                        hideProgressBar:
                                                                            true,
                                                                        autoClose: 2000,
                                                                        type: "warning",
                                                                    }
                                                                );
                                                                return;
                                                            }
                                                            if (
                                                                !creditNote.serial ||
                                                                creditNote
                                                                    .serial
                                                                    .length !==
                                                                    4
                                                            ) {
                                                                toast(
                                                                    "La serie debe contener exactamente 4 caracteres.",
                                                                    {
                                                                        hideProgressBar:
                                                                            true,
                                                                        autoClose: 2000,
                                                                        type: "warning",
                                                                    }
                                                                );
                                                                return;
                                                            }

                                                            modalWayPay.show();
                                                            setCreditNote({
                                                                ...creditNote,
                                                                totalPayed: "",
                                                                cashflowSet: [],
                                                            });
                                                            setCashFlow({
                                                                ...cashFlow,
                                                                total: Number(
                                                                    creditNote.totalToPay
                                                                ),
                                                            });
                                                        } finally {
                                                            setIsProcessing(
                                                                false
                                                            );
                                                        }
                                                    }}
                                                    disabled={
                                                        creditNote
                                                            ?.operationdetailSet
                                                            ?.length === 0 ||
                                                        isProcessing
                                                    }
                                                >
                                                    {isProcessing ? (
                                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                                    ) : (
                                                        <Save />
                                                    )}
                                                    {isProcessing
                                                        ? "PROCESANDO..."
                                                        : "CONTINUAR CON EL PAGO"}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <SaleDetailForm
                        modalAddDetail={modalAddDetail}
                        setModalAddDetail={setModalAddDetail}
                        product={product}
                        setProduct={setProduct}
                        invoiceDetail={CreditNoteDetail}
                        setInvoiceDetail={setCreditNoteDetail}
                        invoice={creditNote}
                        setInvoice={setCreditNote}
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
                        invoice={creditNote}
                        setInvoice={setCreditNote}
                        jwtToken={auth?.jwtToken}
                        authContext={authContext}
                        wayPaysData={wayPaysData}
                        isProcessing={isProcessing}
                        setIsProcessing={setIsProcessing}
                    />
                </>
            )}
        </>
    );
}

export default CreditPage;
