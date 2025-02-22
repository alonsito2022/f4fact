"use client";
import { ICreditNoteType } from "@/app/types";
import Breadcrumb from "@/components/Breadcrumb";
import { useAuth } from "@/components/providers/AuthProvider";
import { gql, useLazyQuery, useQuery } from "@apollo/client";
import { useParams } from "next/navigation";
import React, { ChangeEvent, useEffect, useMemo, useState } from "react";
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

    creditNoteType: "NA",
};
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
        }
    }
`;
function CreditPage() {
    const params = useParams();
    const { invoiceId } = params;
    const [creditNote, setCreditNote] = useState(initialStateCreditNote);
    const [sale, setSale] = useState(initialStateSale);

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

    const {
        loading: creditNoteTypesLoading,
        error: creditNoteTypesError,
        data: creditNoteTypesData,
    } = useQuery(TYPE_CREDIT_NOTE_QUERY, {
        context: authContext,
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
            setSale(data.getSaleById);
        },
        onError: (err) => console.error("Error in sale:", err, auth?.jwtToken),
    });

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
    useEffect(() => {
        if (filteredSaleData?.getSaleById?.documentType) {
            console.log(filteredSaleData?.getSaleById?.documentType);
            setCreditNote((prevSale) => ({
                ...prevSale,
                documentType:
                    filteredSaleData?.getSaleById?.documentType?.replace(
                        "A_",
                        ""
                    ),
            }));
        }
    }, [filteredSaleData?.getSaleById?.documentType]);
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
                                            </div>
                                        </fieldset>
                                        <fieldset className=" sm:col-span-3 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                            <legend>
                                                Documento que se modifica
                                            </legend>
                                            <div className="grid gap-2 lg:grid-cols-3 sm:grid-cols-1 md:grid-cols-1 ">
                                                {/* Tipo documento */}
                                                <div>
                                                    <label
                                                        htmlFor="documentType"
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
                                                        name="documentType"
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
                                                        value={sale.correlative}
                                                        onChange={handleSale}
                                                        onFocus={(e) =>
                                                            e.target.select()
                                                        }
                                                        className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                        autoComplete="off"
                                                    />
                                                </div>
                                            </div>
                                        </fieldset>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default CreditPage;
