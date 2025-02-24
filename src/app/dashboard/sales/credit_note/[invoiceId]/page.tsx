"use client";
import { ICreditNoteType, IOperationDetail, IOperationType } from "@/app/types";
import Breadcrumb from "@/components/Breadcrumb";
import { useAuth } from "@/components/providers/AuthProvider";
import { gql, useLazyQuery, useQuery } from "@apollo/client";
import { useParams } from "next/navigation";
import React, { ChangeEvent, useEffect, useMemo, useState } from "react";
import SaleDetailList from "../../SaleDetailList";
import { Modal } from "flowbite";
import SaleDetailForm from "../../SaleDetailForm";
import SaleTotalList from "../../SaleTotalList";
const today = new Date().toISOString().split("T")[0];

const initialStateCreditNote = {
    id: 0,
    serial: "",
    correlative: "",
    emitDate: today,
    dueDate: today,
    clientName: "",
    clientId: 0,
    igvType: 18,
    operationType: "01",
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

    creditNoteType: "NA",
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
    operationType: "01",
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
            }
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
    const params = useParams();
    const { invoiceId } = params;
    const [creditNote, setCreditNote] = useState(initialStateCreditNote);
    const [sale, setSale] = useState(initialStateSale);
    const [CreditNoteDetail, setCreditNoteDetail] = useState(
        initialStateSaleDetail
    );
    const [product, setProduct] = useState(initialStateProduct);
    const [modalAddDetail, setModalAddDetail] = useState<Modal | any>(null);

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
            setSale(dataSale);
            const formattedOperationdetailSet = dataSale.operationdetailSet.map(
                (detail: IOperationDetail, index: number) => ({
                    ...detail,
                    quantity: Number(detail.quantity).toFixed(1),
                    unitValue: Number(detail.unitValue).toFixed(2),
                    unitPrice: Number(detail.unitPrice).toFixed(2),
                    igvPercentage: Number(detail.igvPercentage).toFixed(2),
                    discountPercentage: Number(
                        detail.discountPercentage
                    ).toFixed(2),
                    totalDiscount: Number(detail.totalDiscount).toFixed(2),
                    totalValue: Number(detail.totalValue).toFixed(2),
                    totalIgv: Number(detail.totalIgv).toFixed(2),
                    totalAmount: Number(detail.totalAmount).toFixed(2),
                    totalPerception: Number(detail.totalPerception).toFixed(2),
                    totalToPay: Number(detail.totalToPay).toFixed(2),
                })
            );

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
        },
        onError: (err) => console.error("Error in sale:", err, auth?.jwtToken),
    });

    useEffect(() => {
        if (invoiceId) {
            // Aquí puedes manejar el parámetro invoiceId
            console.log("invoiceId:", invoiceId);
            saleQuery({
                variables: {
                    pk: Number(invoiceId),
                },
            });
        }
    }, [invoiceId]);

    // useEffect(() => {
    //     if (filteredSaleData?.getSaleById?.documentType) {
    //         console.log(filteredSaleData?.getSaleById?.documentType);
    //         setCreditNote((prevSale) => ({
    //             ...prevSale,
    //             documentType:
    //                 filteredSaleData?.getSaleById?.documentType?.replace(
    //                     "A_",
    //                     ""
    //                 ),
    //         }));
    //     }
    // }, [filteredSaleData?.getSaleById?.documentType]);
    useEffect(() => {
        const subsidiarySerial = auth?.user?.subsidiarySerial;
        if (subsidiarySerial && sale.documentType) {
            const lastTwoDigits = subsidiarySerial.slice(-2);
            let prefix = "";
            console.log("documentType", sale.documentType.replace("A_", ""));

            switch (sale.documentType.replace("A_", "")) {
                case "01":
                    prefix = "FN";
                    break;
                case "03":
                    prefix = "BN";
                    break;
                default:
                    prefix = "";
            }

            const customSerial = `${prefix}${lastTwoDigits}`;
            setCreditNote((prevSale) => ({
                ...prevSale,
                serial: customSerial,
            }));
        }
    }, [auth?.user?.subsidiarySerial, sale.documentType]);

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
                                    {invoiceId && <p>Code Hash: {invoiceId}</p>}
                                    <div className="grid gap-4  lg:grid-cols-5 sm:grid-cols-1 md:grid-cols-3">
                                        <fieldset className=" sm:col-span-3 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                            <legend>Motivo de emisión</legend>
                                            <div className="grid gap-2 lg:grid-cols-3 sm:grid-cols-1 md:grid-cols-1 ">
                                                {/* Tipo de Nota de Crédito */}
                                                <div>
                                                    <label
                                                        htmlFor="creditNoteType"
                                                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                                    >
                                                        Tipo de Nota de Crédito
                                                    </label>
                                                    <select
                                                        value={
                                                            creditNote.creditNoteType
                                                        }
                                                        name="creditNoteType"
                                                        onChange={
                                                            handleCreditNote
                                                        }
                                                        className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                        required
                                                    >
                                                        {creditNoteTypesData?.allCreditNoteTypes?.map(
                                                            (
                                                                o: ICreditNoteType,
                                                                k: number
                                                            ) => (
                                                                <option
                                                                    key={k}
                                                                    value={
                                                                        o.code
                                                                    }
                                                                >
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
                                                        value={
                                                            creditNote.emitDate
                                                        }
                                                        onChange={
                                                            handleCreditNote
                                                        }
                                                        onFocus={(e) =>
                                                            e.target.select()
                                                        }
                                                        className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                        required
                                                    />
                                                </div>
                                                {/* Fecha de Venc. */}
                                                <div>
                                                    <label
                                                        htmlFor="dueDate"
                                                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
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
                                                        className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
                                                    <input
                                                        type="text"
                                                        name="serial"
                                                        id="serial"
                                                        maxLength={4}
                                                        value={
                                                            creditNote.serial
                                                        }
                                                        onChange={
                                                            handleCreditNote
                                                        }
                                                        onFocus={(e) =>
                                                            e.target.select()
                                                        }
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
                                                        value={
                                                            creditNote.correlative
                                                        }
                                                        onChange={
                                                            handleCreditNote
                                                        }
                                                        onFocus={(e) =>
                                                            e.target.select()
                                                        }
                                                        className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                        autoComplete="off"
                                                    />
                                                </div>
                                            </div>
                                        </fieldset>
                                        <fieldset className=" sm:col-span-3 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                            <legend>
                                                Documento que se modifica
                                            </legend>
                                            <div className="grid gap-2 lg:grid-cols-3 sm:grid-cols-1 md:grid-cols-1 ">
                                                {/* CPE Tipo documento */}
                                                <div>
                                                    <label
                                                        htmlFor="invoiceDocumentType"
                                                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                                    >
                                                        Tipo documento
                                                    </label>
                                                    <select
                                                        value={sale?.documentType.replace(
                                                            "A_",
                                                            ""
                                                        )}
                                                        onChange={handleSale}
                                                        id="invoiceDocumentType"
                                                        name="invoiceDocumentType"
                                                        className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                        disabled
                                                    >
                                                        <option value={"07"}>
                                                            NOTA DE CRÉDITO
                                                            ELECTRÓNICA
                                                        </option>
                                                        <option value={"08"}>
                                                            NOTA DE DÉBITO
                                                            ELECTRÓNICA
                                                        </option>
                                                        <option value={"09"}>
                                                            GUIA DE REMISIÓN
                                                            REMITENTE
                                                        </option>
                                                        <option value={"03"}>
                                                            BOLETA DE VENTA
                                                            ELECTRÓNICA
                                                        </option>
                                                        <option value={"01"}>
                                                            FACTURA ELECTRÓNICA
                                                        </option>
                                                    </select>
                                                </div>
                                                {/* CPE Serie */}
                                                <div>
                                                    <label
                                                        htmlFor="invoiceSerial"
                                                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                                    >
                                                        Serie
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="invoiceSerial"
                                                        id="invoiceSerial"
                                                        maxLength={4}
                                                        value={sale.serial}
                                                        onChange={handleSale}
                                                        onFocus={(e) =>
                                                            e.target.select()
                                                        }
                                                        className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                        autoComplete="off"
                                                        disabled
                                                    />
                                                </div>
                                                {/* CPE Numero */}
                                                <div>
                                                    <label
                                                        htmlFor="invoiceCorrelative"
                                                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                                    >
                                                        Numero
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="invoiceCorrelative"
                                                        id="invoiceCorrelative"
                                                        maxLength={10}
                                                        value={sale.correlative}
                                                        onChange={handleSale}
                                                        onFocus={(e) =>
                                                            e.target.select()
                                                        }
                                                        className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                        autoComplete="off"
                                                        disabled
                                                    />
                                                </div>
                                            </div>
                                        </fieldset>

                                        <div className=" sm:col-span-3 grid gap-2 lg:grid-cols-3 sm:grid-cols-1 md:grid-cols-1 ">
                                            {/* IGV % */}
                                            <div>
                                                <label
                                                    htmlFor="igvType"
                                                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                                >
                                                    IGV %{" "}
                                                </label>
                                                <select
                                                    value={creditNote.igvType}
                                                    name="igvType"
                                                    onChange={handleCreditNote}
                                                    className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                    required
                                                >
                                                    <option value={4}>
                                                        4% (IVAP)
                                                    </option>
                                                    <option value={18}>
                                                        18%
                                                    </option>
                                                    <option value={10}>
                                                        10% (Ley 31556)
                                                    </option>
                                                </select>
                                            </div>
                                            {/* Tipo de Operacion */}
                                            <div>
                                                <label
                                                    htmlFor="operationType"
                                                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                                >
                                                    Tipo de Operacion
                                                </label>
                                                <select
                                                    value={
                                                        creditNote.operationType
                                                    }
                                                    name="operationType"
                                                    onChange={handleCreditNote}
                                                    className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                    required
                                                >
                                                    {operationTypesData?.allOperationTypes?.map(
                                                        (
                                                            o: IOperationType,
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
                                                    onChange={handleCreditNote}
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
                                                        creditNote.saleExchangeRate
                                                    }
                                                    onChange={handleCreditNote}
                                                    onFocus={(e) =>
                                                        e.target.select()
                                                    }
                                                    className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                    autoComplete="off"
                                                />
                                            </div>
                                            {/* CPE Cliente */}
                                            <div className="sm:col-span-2">
                                                <label
                                                    htmlFor="invoiceClientName"
                                                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                                >
                                                    Cliente
                                                </label>
                                                <input
                                                    type="text"
                                                    id="invoiceClientName"
                                                    value={sale?.client?.names}
                                                    onChange={handleSale}
                                                    className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                    disabled
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <SaleDetailList
                                        invoice={creditNote}
                                        setInvoice={setCreditNote}
                                        product={product}
                                        setProduct={setProduct}
                                        setInvoiceDetail={setCreditNoteDetail}
                                        modalAddDetail={modalAddDetail}
                                    />
                                    <SaleTotalList invoice={creditNote} />
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
                jwtToken={auth?.jwtToken}
                initialStateProduct={initialStateProduct}
                initialStateSaleDetail={initialStateSaleDetail}
                typeAffectationsData={typeAffectationsData}
                productsData={productsData}
            />
        </>
    );
}

export default CreditPage;
