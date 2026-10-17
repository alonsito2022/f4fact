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
        $igvType: Decimal!
        $totalDiscount: Float!
        $totalTaxed: Float!
        $totalAnticipation: Float!
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
        $isAnticipationSet: [Boolean!]!
        $relatedDocumentSerialSet: [String!]!
        $relatedDocumentCorrelativeSet: [Int!]!
        $pdfFormatForInvoices: Int
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
            totalAnticipation: $totalAnticipation
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
            isAnticipationSet: $isAnticipationSet
            relatedDocumentSerialSet: $relatedDocumentSerialSet
            relatedDocumentCorrelativeSet: $relatedDocumentCorrelativeSet
            pdfFormatForInvoices: $pdfFormatForInvoices
        ) {
            message
            operation {
                id
            }
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
        [cashFlow, setCashFlow],
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
                    (detail: ICashFlow) => detail.temporaryId !== indexToRemove,
                ),
            }));
        },
        [setInvoice],
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
            (item: any) => item.wayPay === 9,
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
                        },
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
                        },
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
                    invoice.correlative === "" ? "0" : invoice.correlative,
                ),
                operationType: invoice.operationType,
                documentType: invoice.documentType,
                currencyType: invoice.currencyType,
                saleExchangeRate: parseFloat(invoice.saleExchangeRate) || 0,
                emitDate: invoice.emitDate,
                dueDate: invoice.dueDate,
                clientId: parseInt(invoice.clientId),
                productTariffIdSet: invoice.operationdetailSet.map(
                    (item: any) => item.productTariffId,
                ),
                typeAffectationIdSet: invoice.operationdetailSet.map(
                    (item: any) => item.typeAffectationId,
                ),
                quantitySet: invoice.operationdetailSet.map((item: any) =>
                    parseFloat(item.quantity),
                ),
                unitValueSet: invoice.operationdetailSet.map((item: any) =>
                    parseFloat(item.unitValue),
                ),
                unitPriceSet: invoice.operationdetailSet.map((item: any) =>
                    parseFloat(item.unitPrice),
                ),
                discountPercentageSet: invoice.operationdetailSet.map(
                    (item: any) => parseFloat(item.discountPercentage) || 0,
                ),
                igvPercentageSet: invoice.operationdetailSet.map((item: any) =>
                    parseFloat(item.igvPercentage),
                ),
                perceptionPercentageSet: invoice.operationdetailSet.map(
                    (item: any) => parseFloat(item.totalPerception) || 0,
                ),
                commentSet: invoice.operationdetailSet.map(
                    (item: any) => String(item.description) || "",
                ),
                totalDiscountSet: invoice.operationdetailSet.map(
                    (item: any) => parseFloat(item.totalDiscount) || 0,
                ),
                totalValueSet: invoice.operationdetailSet.map((item: any) =>
                    parseFloat(item.totalValue),
                ),
                totalIgvSet: invoice.operationdetailSet.map((item: any) =>
                    parseFloat(item.totalIgv),
                ),
                totalAmountSet: invoice.operationdetailSet.map((item: any) =>
                    parseFloat(item.totalAmount),
                ),
                totalPerceptionSet: invoice.operationdetailSet.map(
                    (item: any) => parseFloat(item.totalPerception) || 0,
                ),
                totalToPaySet: invoice.operationdetailSet.map(
                    (item: any) => parseFloat(item.totalToPay) || 0,
                ),
                wayPaySet: invoice.cashflowSet.map((item: any) => item.wayPay),
                totalSet: invoice.cashflowSet.map((item: any) =>
                    Number(item.total),
                ),
                descriptionSet: invoice.cashflowSet.map(
                    (item: any) => item.description || "",
                ),
                transactionDateSet: invoice.cashflowSet.map(
                    (item: any) => item.transactionDate || "",
                ),
                discountForItem: parseFloat(invoice.discountForItem) || 0,
                discountGlobal: parseFloat(invoice.discountGlobal) || 0,
                discountPercentageGlobal:
                    parseFloat(invoice.discountPercentageGlobal) || 0,
                igvType: Number(invoice.igvType),
                totalDiscount: parseFloat(invoice.totalDiscount) || 0,
                totalTaxed: parseFloat(invoice.totalTaxed),
                totalAnticipation: parseFloat(invoice.totalAnticipation) || 0,
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
                    invoice.detractionPaymentMethod,
                ),
                totalDetraction: Number(invoice.totalDetraction),
                detractionPercentage: Number(invoice.detractionPercentage),

                observation: invoice.observation || "",
                isAnticipationSet: invoice.operationdetailSet.map(
                    (item: any) => item.isAnticipation || false,
                ),
                relatedDocumentSerialSet: invoice.operationdetailSet.map(
                    (item: any) => String(item.relatedDocumentSerial || ""),
                ),
                relatedDocumentCorrelativeSet: invoice.operationdetailSet.map(
                    (item: any) => Number(item.relatedDocumentCorrelative || 0),
                ),
                pdfFormatForInvoices: Number(invoice.pdfFormatForInvoices) || 0,
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

                    // Obtener el ID de la venta creada
                    const createdSaleId = data.createSale.operation?.id;

                    if (invoice.documentType === "NS") {
                        router.push("/dashboard/sales/exit_note");
                    } else if (
                        createdSaleId &&
                        (invoice.documentType
                            .replace("A_", "")
                            .includes("01") ||
                            invoice.documentType
                                .replace("A_", "")
                                .includes("03"))
                    ) {
                        // Redirigir a la página de vista del comprobante
                        router.push(`/dashboard/sales/view/${createdSaleId}`);
                    } else {
                        // Fallback a la lista de ventas si no hay ID
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
            0,
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
            {/* Modal de forma de pago */}
            <div
                id="modalWayPay"
                tabIndex={-1}
                className="fixed left-0 right-0 top-0 z-50 hidden h-[calc(100%-1rem)] max-h-full w-full items-start justify-center overflow-x-hidden overflow-y-auto p-4 md:pt-16"
            >
                <div className="relative w-full max-w-2xl">
                    <div className="relative overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-900/10 ring-1 ring-slate-900/5 dark:bg-gray-800 dark:ring-white/10 dark:shadow-black/40">
                        {/* Barra de acento */}
                        <div className="h-1 w-full bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-400 dark:from-blue-600 dark:via-blue-400 dark:to-cyan-300" />
                        {/* Encabezado */}
                        <div className="flex items-start gap-3.5 border-b border-slate-100 px-5 py-4 dark:border-gray-700">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm shadow-slate-900/20 dark:bg-white/10 dark:text-white dark:ring-1 dark:ring-inset dark:ring-white/15">
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={1.7}
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                                    />
                                </svg>
                            </span>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-[15px] font-semibold leading-tight tracking-tight text-slate-900 dark:text-white">
                                        Forma de pago
                                    </h3>
                                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:bg-white/10 dark:text-slate-300">
                                        Cobro
                                    </span>
                                </div>
                                <p className="mt-1 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
                                    Registra uno o varios medios de pago y
                                    verifica el total del comprobante
                                </p>
                            </div>
                            <button
                                ref={closeButtonRef}
                                type="button"
                                onClick={handleCloseModal}
                                aria-label="Cerrar"
                                className="-mr-1.5 -mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:hover:bg-white/10 dark:hover:text-white dark:focus:ring-white/20"
                            >
                                <svg
                                    className="h-3.5 w-3.5"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 14 14"
                                    aria-hidden="true"
                                >
                                    <path
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                                    />
                                </svg>
                            </button>
                        </div>

                        {/* Cuerpo */}
                        <div className="max-h-[60vh] space-y-5 overflow-y-auto overscroll-contain p-5">
                            {/* Agregar medio de pago */}
                            <fieldset className="relative rounded-2xl border border-slate-200 bg-slate-50/80 p-4 ring-1 ring-inset ring-white/60 dark:border-gray-700 dark:bg-white/[0.03] dark:ring-white/5">
                                <legend className="px-1.5">
                                    <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        <svg
                                            className="h-3.5 w-3.5"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={1.8}
                                            viewBox="0 0 24 24"
                                            aria-hidden="true"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M12 4.5v15m7.5-7.5h-15"
                                            />
                                        </svg>
                                        Agregar medio de pago
                                    </span>
                                </legend>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                                    <div className="sm:col-span-3">
                                        <label className="mb-1.5 block text-[13px] font-medium text-slate-700 dark:text-slate-300">
                                            Tipo
                                        </label>
                                        <div className="relative">
                                            <select
                                                name="wayPay"
                                                onChange={
                                                    handleInputChangeWayPay
                                                }
                                                value={cashFlow.wayPay}
                                                className="block h-10 w-full cursor-pointer appearance-none rounded-xl border border-slate-300 bg-white py-2 pl-3.5 pr-10 text-sm text-slate-900 shadow-sm transition-[border-color,box-shadow] hover:border-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-900 dark:text-slate-100 dark:hover:border-gray-500 dark:focus:ring-blue-500/20"
                                                required
                                            >
                                                {wayPaysData?.allWayPays?.map(
                                                    (
                                                        o: IWayPay,
                                                        k: number,
                                                    ) => (
                                                        <option
                                                            key={k}
                                                            value={o.code}
                                                        >
                                                            {o.name}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                            <svg
                                                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth={1.8}
                                                viewBox="0 0 24 24"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                                                />
                                            </svg>
                                        </div>
                                    </div>

                                    <div className="sm:col-span-1">
                                        <label className="mb-1.5 block text-[13px] font-medium text-slate-700 dark:text-slate-300">
                                            Importe
                                        </label>
                                        <input
                                            type="number"
                                            name="total"
                                            onWheel={(e) =>
                                                e.currentTarget.blur()
                                            }
                                            value={cashFlow.total}
                                            onChange={
                                                handleInputChangeWayPay
                                            }
                                            onFocus={(e) =>
                                                e.target.select()
                                            }
                                            className="block h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm tabular-nums text-slate-900 shadow-sm transition-[border-color,box-shadow] hover:border-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-900 dark:text-slate-100 dark:hover:border-gray-500 dark:focus:ring-blue-500/20"
                                        />
                                    </div>

                                    <div className="sm:col-span-4">
                                        {Number(cashFlow.wayPay) === 9 ? (
                                            <>
                                                <label className="mb-1.5 block text-[13px] font-medium text-slate-700 dark:text-slate-300">
                                                    Fecha de pago (cuota)
                                                </label>
                                                <input
                                                    type="date"
                                                    name="transactionDate"
                                                    value={
                                                        cashFlow.transactionDate
                                                    }
                                                    onChange={
                                                        handleInputChangeWayPay
                                                    }
                                                    className="block h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 shadow-sm transition-[border-color,box-shadow] hover:border-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-900 dark:text-slate-100 dark:hover:border-gray-500 dark:focus:ring-blue-500/20"
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <label className="mb-1.5 block text-[13px] font-medium text-slate-700 dark:text-slate-300">
                                                    Nota
                                                </label>
                                                <input
                                                    type="text"
                                                    name="description"
                                                    autoComplete="off"
                                                    onFocus={(e) =>
                                                        e.target.select()
                                                    }
                                                    value={
                                                        cashFlow.description
                                                    }
                                                    onChange={
                                                        handleInputChangeWayPay
                                                    }
                                                    className="block h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 shadow-sm transition-[border-color,box-shadow] placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-gray-500 dark:focus:ring-blue-500/20"
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end">
                                    <button
                                        type="button"
                                        className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-3.5 text-[13px] font-semibold text-blue-700 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-100 sm:w-auto dark:border-blue-400/40 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20 dark:focus:ring-blue-500/20 [&>svg]:h-4 [&>svg]:w-4"
                                        onClick={handleAddWayPay}
                                    >
                                        <Add />
                                        Agregar medio de pago
                                    </button>
                                </div>
                            </fieldset>

                            {/* Medios de pago agregados */}
                            {invoice?.cashflowSet?.length > 0 ? (
                                <div>
                                    <div className="mb-2 flex items-center justify-between">
                                        <h4 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                            <svg
                                                className="h-3.5 w-3.5"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth={1.8}
                                                viewBox="0 0 24 24"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                                                />
                                            </svg>
                                            Medios de pago agregados
                                        </h4>
                                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-slate-600 dark:bg-white/10 dark:text-slate-300">
                                            {invoice.cashflowSet.length}
                                        </span>
                                    </div>
                                    <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm shadow-slate-900/5 dark:border-gray-700 dark:shadow-black/20">
                                        <table className="min-w-full divide-y divide-slate-100 dark:divide-gray-700">
                                            <thead>
                                                <tr className="bg-slate-50 dark:bg-white/[0.04]">
                                                    {["Tipo", "Importe", "Nota", ""].map(
                                                        (t, i) => (
                                                            <th
                                                                key={t + i}
                                                                scope="col"
                                                                className={`px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 ${
                                                                    i === 1 || i === 3
                                                                        ? "text-right"
                                                                        : "text-left"
                                                                }`}
                                                            >
                                                                {t}
                                                            </th>
                                                        ),
                                                    )}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
                                                {invoice?.cashflowSet?.map(
                                                    (
                                                        item: ICashFlow,
                                                        c: number,
                                                    ) => (
                                                        <tr
                                                            key={c}
                                                            className="bg-white transition-colors hover:bg-slate-50/80 dark:bg-transparent dark:hover:bg-white/[0.03]"
                                                        >
                                                            <td className="px-4 py-2.5 text-[13px] font-medium text-slate-900 dark:text-slate-100">
                                                                {wayPaysData?.allWayPays?.find(
                                                                    (
                                                                        w: IWayPay,
                                                                    ) =>
                                                                        w.code ===
                                                                        item.wayPay,
                                                                )
                                                                    ?.name ||
                                                                    item.wayPay}
                                                            </td>
                                                            <td className="px-4 py-2.5 text-right text-[13px] font-semibold tabular-nums text-slate-700 dark:text-slate-200">
                                                                {item.total}
                                                            </td>
                                                            <td className="px-4 py-2.5 text-[13px] text-slate-500 dark:text-slate-400">
                                                                {item.description ||
                                                                    "—"}
                                                            </td>
                                                            <td className="px-3 py-2 text-right">
                                                                <button
                                                                    type="button"
                                                                    title="Quitar medio de pago"
                                                                    aria-label="Quitar medio de pago"
                                                                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-100 dark:hover:bg-red-500/10 dark:hover:text-red-400 dark:focus:ring-red-500/20"
                                                                    onClick={() =>
                                                                        handleRemoveCashFlow(
                                                                            Number(
                                                                                item?.temporaryId,
                                                                            ),
                                                                        )
                                                                    }
                                                                >
                                                                    <span className="[&>svg]:h-4 [&>svg]:w-4">
                                                                        <Delete />
                                                                    </span>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 px-4 py-6 text-center dark:border-gray-600 dark:bg-white/[0.02]">
                                    <span className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm ring-1 ring-slate-200 dark:bg-white/5 dark:ring-white/10">
                                        <svg
                                            className="h-4 w-4"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={1.7}
                                            viewBox="0 0 24 24"
                                            aria-hidden="true"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                                            />
                                        </svg>
                                    </span>
                                    <p className="text-[13px] font-medium text-slate-600 dark:text-slate-300">
                                        Todavía no hay medios de pago
                                    </p>
                                    <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                                        Agrega al menos uno para poder finalizar
                                        la venta
                                    </p>
                                </div>
                            )}

                            {/* Resumen */}
                            <fieldset className="relative rounded-2xl border border-slate-200 bg-slate-50/80 p-4 ring-1 ring-inset ring-white/60 dark:border-gray-700 dark:bg-white/[0.03] dark:ring-white/5">
                                <legend className="px-1.5">
                                    <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        <svg
                                            className="h-3.5 w-3.5"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={1.8}
                                            viewBox="0 0 24 24"
                                            aria-hidden="true"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                            />
                                        </svg>
                                        Resumen de pago
                                    </span>
                                </legend>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    {[
                                        {
                                            label: "Importe total",
                                            value: invoice.totalToPay,
                                        },
                                        {
                                            label: "Importe total pagado",
                                            value: invoice.totalPayed,
                                        },
                                        {
                                            label: "Diferencia (vuelto / cobro)",
                                            value: invoice.totalTurned,
                                        },
                                    ].map((f, i) => (
                                        <div key={f.label}>
                                            <label className="mb-1.5 block text-[13px] font-medium text-slate-700 dark:text-slate-300">
                                                {f.label}
                                            </label>
                                            <input
                                                type="number"
                                                value={f.value}
                                                readOnly
                                                className={`block h-10 w-full rounded-xl border px-3.5 text-sm tabular-nums shadow-sm transition-colors ${
                                                    i === 2
                                                        ? "border-amber-200 bg-amber-50 font-semibold text-amber-900 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-200"
                                                        : "border-slate-200 bg-white text-slate-600 dark:border-gray-600 dark:bg-gray-900/60 dark:text-slate-300"
                                                }`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </fieldset>
                        </div>

                        {/* Pie */}
                        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 dark:border-gray-700 dark:bg-white/[0.02]">
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-[13px] font-medium text-slate-700 shadow-sm transition-colors hover:border-slate-400 hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-slate-200 dark:border-gray-700 dark:bg-transparent dark:text-slate-300 dark:hover:border-gray-600 dark:hover:bg-white/5 dark:focus:ring-white/10"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveSale}
                                disabled={isProcessing}
                                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/20 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-white/90 dark:focus:ring-white/25"
                            >
                                {isProcessing ? (
                                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-slate-900/20 dark:border-t-slate-900" />
                                ) : (
                                    <span className="[&>svg]:h-4 [&>svg]:w-4">
                                        <Save />
                                    </span>
                                )}
                                {isProcessing ? "Guardando..." : "Finalizar venta"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default WayPayForm;
