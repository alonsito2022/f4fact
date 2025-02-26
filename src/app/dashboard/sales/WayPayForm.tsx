import { ICashFlow, IOperation, IOperationDetail, IWayPay } from "@/app/types";
import Add from "@/components/icons/Add";
import Delete from "@/components/icons/Delete";
import Save from "@/components/icons/Save";
import { DocumentNode, gql, useMutation } from "@apollo/client";
import { Modal, ModalOptions } from "flowbite";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

const CREATE_SALE_MUTATION = gql`
    mutation CreateSale(
        $serial: String!
        $correlative: Int!
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
    ) {
        createSale(
            serial: $serial
            correlative: $correlative
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
        ) {
            message
            error
        }
    }
`;
// interface WayPayFormProps {
//     modalWayPay: any;
//     setModalWayPay: (modal: any) => void;
//     cashFlow: ICashFlow;
//     setCashFlow: (cashFlow: ICashFlow) => void;
//     initialStateCashFlow: ICashFlow;
//     initialStateSale: IOperation;
//     invoice: IOperation;
//     setInvoice: (invoice: IOperation) => void;
//     jwtToken: string;
//     wayPaysData: { allWayPays: IWayPay[] };
// }
function WayPayForm({
    modalWayPay,
    setModalWayPay,
    cashFlow,
    setCashFlow,
    initialStateCashFlow,
    initialStateSale,
    invoice,
    setInvoice,
    jwtToken,
    authContext,
    wayPaysData,
}: any) {
    const router = useRouter();

    function useCustomMutation(mutation: DocumentNode) {
        return useMutation(mutation, {
            context: authContext,
            onError: (err) => console.error("Error in unit:", err), // Log the error for debugging
        });
    }

    const [createSale] = useCustomMutation(CREATE_SALE_MUTATION);

    useEffect(() => {
        if (modalWayPay == null) {
            const $targetEl = document.getElementById("modalWayPay");
            const options: ModalOptions = {
                placement: "top-center",
                backdrop: "static",
                backdropClasses:
                    "bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40",
                closable: false,
            };
            const newModal = new Modal($targetEl, options);
            setModalWayPay(newModal);
        }
    }, [modalWayPay, setModalWayPay]);

    const handleInputChangeWayPay = useCallback(
        ({
            target: { name, value },
        }: ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >) => {
            if (name === "wayPay") {
                setCashFlow({ ...cashFlow, wayPay: Number(value) });
            } else {
                setCashFlow({ ...cashFlow, [name]: value });
            }
        },
        [cashFlow, setCashFlow]
    );
    const handleAddWayPay = useCallback(() => {
        if (Number(cashFlow.total) > 0) {
            let newCashFlow = {
                ...cashFlow,
                temporaryId: invoice.cashflowSet.length + 1,
            };
            setInvoice((prevSale: IOperation) => ({
                ...prevSale,
                cashflowSet: [...prevSale.cashflowSet!, newCashFlow],
            }));
            setCashFlow(initialStateCashFlow);
        } else {
            toast("Valor no valido", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "error",
            });
        }
    }, [
        cashFlow,
        invoice.cashflowSet,
        setCashFlow,
        setInvoice,
        initialStateCashFlow,
    ]);

    const handleRemoveCashFlow = useCallback(
        async (indexToRemove: number) => {
            setInvoice((prevSale: any) => ({
                ...prevSale,
                cashflowSet: prevSale?.cashflowSet?.filter(
                    (detail: ICashFlow) => detail.temporaryId !== indexToRemove
                ),
            }));
        },
        [setInvoice]
    );

    // const [createPurchase] = useMutation(CREATE_PURCHASE_MUTATION);

    const handleSaveSale = useCallback(async () => {
        try {
            const variables = {
                serial: invoice.serial,
                correlative: parseInt(
                    invoice.correlative === "" ? "0" : invoice.correlative
                ),
                documentType: invoice.documentType,
                currencyType: invoice.currencyType,
                saleExchangeRate: parseFloat(invoice.saleExchangeRate) || 0,
                emitDate: invoice.emitDate,
                clientId: parseInt(invoice.clientId),
                productTariffIdSet: invoice.operationdetailSet.map(
                    (item: any) => item.productTariffId
                ),
                typeAffectationIdSet: invoice.operationdetailSet.map(
                    (item: any) => item.typeAffectationId
                ),
                quantitySet: invoice.operationdetailSet.map((item: any) =>
                    parseInt(item.quantity)
                ),
                unitValueSet: invoice.operationdetailSet.map((item: any) =>
                    parseFloat(item.unitValue)
                ),
                unitPriceSet: invoice.operationdetailSet.map((item: any) =>
                    parseFloat(item.unitPrice)
                ),
                discountPercentageSet: invoice.operationdetailSet.map(
                    (item: any) => parseFloat(item.discountPercentage) || 0
                ),
                igvPercentageSet: invoice.operationdetailSet.map((item: any) =>
                    parseFloat(item.igvPercentage)
                ),
                perceptionPercentageSet: invoice.operationdetailSet.map(
                    (item: any) => parseFloat(item.totalPerception) || 0
                ),
                totalDiscountSet: invoice.operationdetailSet.map(
                    (item: any) => parseFloat(item.totalDiscount) || 0
                ),
                totalValueSet: invoice.operationdetailSet.map((item: any) =>
                    parseFloat(item.totalValue)
                ),
                totalIgvSet: invoice.operationdetailSet.map((item: any) =>
                    parseFloat(item.totalIgv)
                ),
                totalAmountSet: invoice.operationdetailSet.map((item: any) =>
                    parseFloat(item.totalAmount)
                ),
                totalPerceptionSet: invoice.operationdetailSet.map(
                    (item: any) => parseFloat(item.totalPerception) || 0
                ),
                totalToPaySet: invoice.operationdetailSet.map(
                    (item: any) => parseFloat(item.totalToPay) || 0
                ),
                wayPaySet: invoice.cashflowSet.map((item: any) => item.wayPay),
                totalSet: invoice.cashflowSet.map((item: any) =>
                    Number(item.total)
                ),
                descriptionSet: invoice.cashflowSet.map(
                    (item: any) => item.description || ""
                ),
                discountForItem: parseFloat(invoice.discountForItem) || 0,
                discountGlobal: parseFloat(invoice.discountGlobal) || 0,
                discountPercentageGlobal:
                    parseFloat(invoice.discountPercentageGlobal) || 0,
                igvType: Number(invoice.igvType),
                totalDiscount: parseFloat(invoice.totalDiscount) || 0,
                totalTaxed: parseFloat(invoice.totalTaxed),
                totalUnaffected: parseFloat(invoice.totalUnaffected),
                totalExonerated: parseFloat(invoice.totalExonerated),
                totalIgv: parseFloat(invoice.totalIgv),
                totalFree: parseFloat(invoice.totalFree) || 0,
                totalAmount: parseFloat(invoice.totalAmount),
                totalPerception: parseFloat(invoice.totalPerception) || 0,
                totalToPay: parseFloat(invoice.totalToPay),
                totalPayed: parseFloat(invoice.totalPayed),
                totalTurned: parseFloat(invoice.totalTurned) || 0,
                creditNoteType: invoice.creditNoteType,
                parentOperationId: Number(invoice.parentOperationId) || 0,
            };
            console.log("variables al guardar", variables);
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
                    // setInvoice(initialStateSale);
                    modalWayPay.hide();

                    router.push("/dashboard/sales");
                }
            }
        } catch (error) {
            console.error("Error creating invoice:", error);
        }
    }, [createSale, invoice, setInvoice, initialStateSale, modalWayPay]);

    useEffect(() => {
        calculateTotalPayed();
    }, [invoice.cashflowSet]);

    const calculateTotalPayed = useCallback(() => {
        const totalPayed = invoice?.cashflowSet?.reduce(
            (total: number, detail: ICashFlow) => {
                return total + Number(detail.total);
            },
            0
        );

        const totalTurned = totalPayed - Number(invoice?.totalToPay);

        setInvoice((prevEntry: any) => ({
            ...prevEntry,
            totalTurned: Number(totalTurned).toFixed(2),
            totalPayed: Number(totalPayed).toFixed(2),
        }));
    }, [invoice, setInvoice]);

    return (
        <>
            {/* Default Modal */}
            <div
                id="modalWayPay"
                tabIndex={-1}
                className="fixed top-0 left-0 right-0 z-50 hidden w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"
            >
                <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                    {" "}
                    {/* Modal header */}
                    <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Completar
                        </h3>
                        <button
                            type="button"
                            onClick={() => {
                                modalWayPay.hide();
                            }}
                            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 flex items-center justify-center dark:hover:bg-gray-700 dark:hover:text-white"
                        >
                            <svg
                                className="w-4 h-4"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 14 14"
                            >
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                                />
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>
                    {/* Modal body */}
                    <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                        <fieldset className="border p-4 dark:border-gray-600 border-gray-300 rounded-lg dark:bg-gray-800 bg-white">
                            <legend className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Forma de pago
                            </legend>
                            <div className="grid grid-cols-4 gap-4">
                                <div className="col-span-3">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Tipo
                                    </label>
                                    <select
                                        name="wayPay"
                                        onChange={handleInputChangeWayPay}
                                        value={cashFlow.wayPay}
                                        className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-gray-300"
                                        required
                                    >
                                        {wayPaysData?.allWayPays?.map(
                                            (o: IWayPay, k: number) => (
                                                <option key={k} value={o.code}>
                                                    {o.name}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                <div className="col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Importe
                                    </label>
                                    <input
                                        type="number"
                                        name="total"
                                        onWheel={(e) => e.currentTarget.blur()}
                                        value={cashFlow.total}
                                        onChange={handleInputChangeWayPay}
                                        onFocus={(e) => e.target.select()}
                                        className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-gray-300"
                                    />
                                </div>

                                <div className="col-span-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Nota
                                    </label>
                                    <input
                                        type="text"
                                        name="description"
                                        onFocus={(e) => e.target.select()}
                                        value={cashFlow.description}
                                        onChange={handleInputChangeWayPay}
                                        className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-gray-300"
                                    />
                                </div>
                            </div>
                        </fieldset>
                        <div className="flex justify-end mt-4">
                            <button
                                className="btn-blue inline-flex items-center gap-2"
                                onClick={handleAddWayPay}
                            >
                                <Add />
                                Agregar medio de pago
                            </button>
                        </div>
                    </div>
                    {invoice?.cashflowSet?.length > 0 ? (
                        <div className="overflow-hidden shadow rounded-lg max-h-[30vh] overflow-y-auto">
                            <table className="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-600">
                                <thead className="bg-yellow-300 dark:bg-cyan-500">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-800"
                                        >
                                            TIPO
                                        </th>
                                        <th
                                            scope="col"
                                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-800"
                                        >
                                            IMPORTE
                                        </th>
                                        <th
                                            scope="col"
                                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-800"
                                        >
                                            NOTA
                                        </th>
                                        <th
                                            scope="col"
                                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-800"
                                        ></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice?.cashflowSet?.map(
                                        (item: ICashFlow, c: number) => (
                                            <tr
                                                key={c}
                                                className="bg-yellow-400 border-b dark:bg-cyan-700 dark:border-gray-700 hover:bg-cyan-100"
                                            >
                                                <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-300">
                                                    {wayPaysData?.allWayPays?.find(
                                                        (w: IWayPay) =>
                                                            w.code ===
                                                            item.wayPay
                                                    )?.name || item.wayPay}
                                                </td>
                                                <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-300">
                                                    {item.total}
                                                </td>
                                                <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-300">
                                                    {item.description}
                                                </td>
                                                <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-300">
                                                    <a
                                                        className="hover:underline cursor-pointer text-red-600 dark:text-red-400"
                                                        onClick={() =>
                                                            handleRemoveCashFlow(
                                                                Number(
                                                                    item?.temporaryId
                                                                )
                                                            )
                                                        }
                                                    >
                                                        <Delete />
                                                    </a>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : null}
                    <div className="p-4 md:p-5 space-y-4">
                        <fieldset className="border p-4 dark:border-gray-600 border-gray-300 rounded-lg dark:bg-gray-800 bg-white">
                            <legend className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Totales
                            </legend>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Importe TOTAL
                                    </label>
                                    <input
                                        type="number"
                                        value={invoice.totalToPay}
                                        readOnly
                                        className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-gray-300"
                                    />
                                </div>

                                <div className="col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Importe TOTAL pagado
                                    </label>
                                    <input
                                        type="number"
                                        value={invoice.totalPayed}
                                        readOnly
                                        className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-gray-300"
                                    />
                                </div>

                                <div className="col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Diferencia (vuelto / cobro)
                                    </label>
                                    <input
                                        type="number"
                                        value={invoice.totalTurned}
                                        readOnly
                                        className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-gray-300"
                                    />
                                </div>
                            </div>
                        </fieldset>
                    </div>
                    {/* Modal footer */}
                    <div className="flex items-center justify-end p-6 space-x-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={() => {
                                modalWayPay.hide();
                            }}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                            Cerrar
                        </button>
                        <button
                            type="button"
                            onClick={handleSaveSale}
                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 flex items-center gap-2"
                        >
                            <Save />
                            Crear Comprobante
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default WayPayForm;
