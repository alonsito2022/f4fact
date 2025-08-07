import { ICashFlow, IOperation, IOperationDetail, IWayPay } from "@/app/types";
import Add from "@/components/icons/Add";
import Delete from "@/components/icons/Delete";
import Save from "@/components/icons/Save";
import { DocumentNode, gql, useMutation } from "@apollo/client";
import { Modal, ModalOptions } from "flowbite";
import { useRouter } from "next/navigation";
import React, {
    ChangeEvent,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import { toast } from "react-toastify";

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
        $transactionDateSet: [Date!]!
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
            transactionDateSet: $transactionDateSet
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
    isProcessing,
    setIsProcessing,
    onSaveSaleRef,
}: any) {
    // Add ref for the close button
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const router = useRouter();
    // Modify the modal close function
    const handleCloseModal = () => {
        // Remove focus from any element inside the modal before closing
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }

        setCashFlow(initialStateCashFlow);
        // setInvoice(initialStateSale);
        modalWayPay.hide();
    };

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
        if (isProcessing) return;
        // Add serial validation
        if (!invoice.serial) {
            toast("Debe seleccionar una serie", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "error",
            });
            return;
        }
        // Validate that there is at least one payment method
        if (!invoice.cashflowSet || invoice.cashflowSet.length === 0) {
            toast("Debe agregar al menos un medio de pago", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "error",
            });
            return;
        }

        // Validar que los wayPays de tipo 9 (POR PAGAR [CRÉDITO]) tengan fecha de transacción mayor a la fecha de emisión
        const creditWayPays = invoice.cashflowSet.filter(
            (item: any) => item.wayPay === 9
        );
        if (creditWayPays.length > 0) {
            const emitDate = new Date(invoice.emitDate);

            for (const wayPay of creditWayPays) {
                if (!wayPay.transactionDate) {
                    toast(
                        "Los pagos de tipo 'POR PAGAR [CRÉDITO]' deben tener una fecha de pago",
                        {
                            hideProgressBar: true,
                            autoClose: 2000,
                            type: "error",
                        }
                    );
                    return;
                }

                const transactionDate = new Date(wayPay.transactionDate);
                if (transactionDate <= emitDate) {
                    toast(
                        "La fecha de pago de los pagos de tipo 'POR PAGAR [CRÉDITO]' debe ser mayor a la fecha de emisión",
                        {
                            hideProgressBar: true,
                            autoClose: 2000,
                            type: "error",
                        }
                    );
                    return;
                }
            }
        }
        try {
            setIsProcessing(true);
            const variables = {
                serial: invoice.serial,
                correlative: parseInt(
                    invoice.correlative === "" ? "0" : invoice.correlative
                ),
                operationType: invoice.operationType,
                documentType: invoice.documentType,
                currencyType: invoice.currencyType,
                saleExchangeRate: parseFloat(invoice.saleExchangeRate) || 0,
                emitDate: invoice.emitDate,
                dueDate: invoice.dueDate,
                clientId: parseInt(invoice.clientId),
                productTariffIdSet: invoice.operationdetailSet.map(
                    (item: any) => item.productTariffId
                ),
                typeAffectationIdSet: invoice.operationdetailSet.map(
                    (item: any) => item.typeAffectationId
                ),
                quantitySet: invoice.operationdetailSet.map((item: any) =>
                    parseFloat(item.quantity)
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
                commentSet: invoice.operationdetailSet.map(
                    (item: any) => String(item.description) || ""
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
                transactionDateSet: invoice.cashflowSet.map(
                    (item: any) => item.transactionDate || ""
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

                hasPerception: invoice.hasPerception,
                hasRetention: invoice.hasRetention,
                hasDetraction: invoice.hasDetraction,

                perceptionType: Number(invoice.perceptionType),
                perceptionPercentage: Number(invoice.perceptionPercentage),

                retentionType: Number(invoice.retentionType),
                totalRetention: Number(invoice.totalRetention),
                retentionPercentage: Number(invoice.retentionPercentage),

                detractionType: Number(invoice.detractionType),
                detractionPaymentMethod: Number(
                    invoice.detractionPaymentMethod
                ),
                totalDetraction: Number(invoice.totalDetraction),
                detractionPercentage: Number(invoice.detractionPercentage),

                observation: invoice.observation || "",
            };
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
                    handleCloseModal();
                    if (invoice.documentType === "NS") {
                        router.push("/dashboard/sales/exit_note");
                    } else {
                        router.push("/dashboard/sales");
                    }
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
        invoice,
        setInvoice,
        initialStateSale,
        modalWayPay,
        isProcessing,
        setIsProcessing,
        handleCloseModal,
    ]);

    useEffect(() => {
        calculateTotalPayed();
    }, [invoice.cashflowSet]);
    // Expose handleSaveSale function to parent component
    useEffect(() => {
        if (onSaveSaleRef && typeof onSaveSaleRef === "function") {
            onSaveSaleRef(handleSaveSale);
        }
    }, [handleSaveSale, onSaveSaleRef]);
    const calculateTotalPayed = useCallback(() => {
        const totalPayed = invoice?.cashflowSet?.reduce(
            (total: number, detail: ICashFlow) => {
                return total + Number(detail.total);
            },
            0
        );

        const totalTurned = Number(invoice?.totalToPay) - totalPayed;

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
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-600 rounded-t-xl">
                        <h3 className="text-2xl font-bold text-white">
                            Forma de Pago
                        </h3>
                        <button
                            ref={closeButtonRef}
                            type="button"
                            onClick={handleCloseModal}
                            className="text-white bg-transparent hover:bg-white/20 rounded-lg text-sm w-8 h-8 flex items-center justify-center transition-colors duration-200"
                        >
                            <svg
                                className="w-5 h-5"
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
                        <fieldset className="border-2 p-6 rounded-xl border-blue-200 dark:border-blue-900 bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 hover:shadow-blue-500/20">
                            <legend className="px-2 text-lg font-semibold text-blue-600 dark:text-blue-400">
                                Agregar Medio de Pago
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
                                    {Number(cashFlow.wayPay) === 9 ? (
                                        <>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Fecha de Pago (Cuota)
                                            </label>
                                            <input
                                                type="date"
                                                name="transactionDate"
                                                value={cashFlow.transactionDate}
                                                onChange={
                                                    handleInputChangeWayPay
                                                }
                                                className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-gray-300"
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Nota
                                            </label>
                                            <input
                                                type="text"
                                                name="description"
                                                autoComplete="off"
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                value={cashFlow.description}
                                                onChange={
                                                    handleInputChangeWayPay
                                                }
                                                className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-gray-300"
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                        </fieldset>
                        <div className="flex justify-end mt-6">
                            <button
                                className="btn-blue px-6 py-2.5 text-sm font-medium inline-flex items-center gap-2 rounded-lg transition-all duration-200 transform hover:scale-105"
                                onClick={handleAddWayPay}
                            >
                                <Add />
                                Agregar medio de pago
                            </button>
                        </div>
                    </div>
                    {/* Payment list section */}
                    {invoice?.cashflowSet?.length > 0 ? (
                        <div className="px-6 pb-6">
                            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-600">
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
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
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
                        </div>
                    ) : null}
                    {/* Totals section */}
                    <div className="p-6 rounded-b-xl">
                        <fieldset className="border-2 p-6 rounded-xl border-cyan-200 dark:border-cyan-900 bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 hover:shadow-cyan-500/20">
                            <legend className="px-2 text-lg font-semibold text-cyan-600 dark:text-cyan-400">
                                Resumen de Pago
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
                    {/* Footer buttons */}
                    <div className="flex items-center justify-end space-x-4 mt-6">
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleSaveSale}
                            disabled={isProcessing}
                            className="px-6 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 inline-flex items-center gap-2 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                            ) : (
                                <Save />
                            )}
                            {isProcessing ? "Guardando..." : "Finalizar Venta"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default WayPayForm;
