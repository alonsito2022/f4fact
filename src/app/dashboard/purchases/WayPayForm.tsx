import { ICashFlow, IOperation, IOperationDetail, IWayPay } from "@/app/types";
import Add from "@/components/icons/Add";
import Delete from "@/components/icons/Delete";
import Save from "@/components/icons/Save";
import { DocumentNode, gql, useMutation } from "@apollo/client";
import { Modal, ModalOptions } from "flowbite";
import { useRouter } from "next/navigation";
import React, {
    ChangeEvent,
    useEffect,
    useState,
    useRef,
    useCallback,
} from "react";
import { toast } from "react-toastify";

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
            message
            error
        }
    }
`;

function WayPayForm({
    modalWayPay,
    setModalWayPay,
    cashFlow,
    setCashFlow,
    initialStateCashFlow,
    initialStatePurchase,
    purchase,
    setPurchase,
    jwtToken,
    authContext,
    wayPaysData,
    isProcessing,
    setIsProcessing,
    onSavePurchaseRef,
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
        setPurchase(initialStatePurchase);
        modalWayPay.hide();
    };

    function useCustomMutation(mutation: DocumentNode) {
        return useMutation(mutation, {
            context: authContext,
            onError: (err) => console.error("Error in unit:", err), // Log the error for debugging
        });
    }

    const [createPurchase] = useCustomMutation(CREATE_PURCHASE_MUTATION);

    const handleSavePurchase = useCallback(async () => {
        if (isProcessing) return;
        // Add serial validation
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
                serial: String(purchase.serial).toUpperCase(),
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
                commentSet: purchase.operationdetailSet.map(
                    (item: any) => String(item.description) || ""
                ),
                totalDiscountSet: purchase.operationdetailSet.map(
                    (item: any) => parseFloat(item.totalDiscount) || 0
                ),
                totalValueSet: purchase.operationdetailSet.map((item: any) =>
                    parseFloat(item.totalValue)
                ),
                totalIgvSet: purchase.operationdetailSet.map((item: any) =>
                    parseFloat(item.totalIgv)
                ),
                totalAmountSet: purchase.operationdetailSet.map((item: any) =>
                    parseFloat(item.totalAmount)
                ),
                totalPerceptionSet: purchase.operationdetailSet.map(
                    (item: any) => parseFloat(item.totalPerception) || 0
                ),
                totalToPaySet: purchase.operationdetailSet.map(
                    (item: any) => parseFloat(item.totalToPay) || 0
                ),
                wayPaySet: purchase.cashflowSet.map((item: any) => item.wayPay),
                totalSet: purchase.cashflowSet.map((item: any) =>
                    Number(item.total)
                ),
                descriptionSet: purchase.cashflowSet.map(
                    (item: any) => item.description || ""
                ),
                transactionDateSet: purchase.cashflowSet.map(
                    (item: any) => item.transactionDate || ""
                ),
                discountForItem: parseFloat(purchase.discountForItem) || 0,
                discountGlobal: parseFloat(purchase.discountGlobal) || 0,
                discountPercentageGlobal:
                    parseFloat(purchase.discountPercentageGlobal) || 0,
                igvType: Number(purchase.igvType),
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
                console.error("Error creating purchase:", errors);
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
                // Use the new close function
                handleCloseModal();
                router.push("/dashboard/purchases");
            }
        } catch (error) {
            console.error("Error creating purchase:", error);
            toast("Error al crear la compra", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "error",
            });
        } finally {
            setIsProcessing(false);
        }
    }, [
        createPurchase,
        purchase,
        setPurchase,
        initialStatePurchase,
        modalWayPay,
        isProcessing,
        setIsProcessing,
        handleCloseModal,
    ]);

    // Add this useEffect to set the ref when the component mounts
    useEffect(() => {
        if (onSavePurchaseRef) {
            onSavePurchaseRef(handleSavePurchase);
        }
    }, [handleSavePurchase, onSavePurchaseRef]);

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
            setModalWayPay(new Modal($targetEl, options));
        }
    }, [modalWayPay, setModalWayPay]);

    const handleInputChangeWayPay = ({
        target: { name, value },
    }: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >) => {
        if (name === "wayPay") {
            setCashFlow({ ...cashFlow, wayPay: Number(value) });
        } else {
            setCashFlow({ ...cashFlow, [name]: value });
        }
    };

    const handleAddWayPay = () => {
        if (Number(cashFlow.total) === 0) {
            toast("Por favor ingrese un monto.", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
            });
            return;
        }
        if (Number(cashFlow.wayPay) === 0) {
            toast("Por favor seleccione una forma de pago.", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
            });
            return;
        }

        setPurchase((prevPurchase: any) => ({
            ...prevPurchase,
            cashflowSet: [
                ...prevPurchase.cashflowSet,
                {
                    ...cashFlow,
                    temporaryId: prevPurchase.cashflowSet.length + 1,
                },
            ],
        }));
        setCashFlow(initialStateCashFlow);
    };

    const handleRemoveCashFlow = async (indexToRemove: number) => {
        setPurchase((prevPurchase: any) => ({
            ...prevPurchase,
            cashflowSet: prevPurchase?.cashflowSet?.filter(
                (detail: ICashFlow) => detail.temporaryId !== indexToRemove
            ),
        }));
    };

    useEffect(() => {
        calculateTotalPayed();
    }, [purchase.cashflowSet]);

    const calculateTotalPayed = useCallback(() => {
        const totalPayed = purchase?.cashflowSet?.reduce(
            (total: number, detail: ICashFlow) => {
                return total + Number(detail.total);
            },
            0
        );

        const totalTurned = Number(totalPayed) - Number(purchase.totalToPay);

        setPurchase((prevPurchase: any) => ({
            ...prevPurchase,
            totalPayed: Number(totalPayed).toFixed(2),
            totalTurned: Number(totalTurned).toFixed(2),
        }));
    }, [purchase.cashflowSet, purchase.totalToPay, setPurchase]);

    return (
        <>
            {/* Default Modal */}
            <div
                id="modalWayPay"
                tabIndex={-1}
                className="fixed top-0 left-0 right-0 z-50 hidden w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"
            >
                <div className="relative w-full max-w-lg max-h-full">
                    {/* Modal content */}
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                        {/* Modal header */}
                        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                            <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                                Forma de Pago
                            </h3>
                            <button
                                ref={closeButtonRef}
                                type="button"
                                onClick={handleCloseModal}
                                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                            >
                                <svg
                                    className="w-3 h-3"
                                    aria-hidden="true"
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
                        <div className="p-4 md:p-5 space-y-4">
                            <fieldset className="border p-2 dark:border-gray-500 border-gray-200 rounded">
                                <legend className=" text-xs">
                                    Forma de pago
                                </legend>
                                <div className="grid grid-cols-4 gap-2">
                                    <div className="sm:col-span-3">
                                        <label className="form-label-sm">
                                            Tipo
                                        </label>
                                        <select
                                            name="wayPay"
                                            onChange={handleInputChangeWayPay}
                                            value={cashFlow.wayPay}
                                            className="form-control-sm"
                                            required
                                        >
                                            {wayPaysData?.allWayPays?.map(
                                                (o: IWayPay, k: number) => (
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

                                    <div className="sm:col-span-1">
                                        <label className="form-label-sm">
                                            Importe
                                        </label>
                                        <input
                                            type="number"
                                            name="total"
                                            onWheel={(e) =>
                                                e.currentTarget.blur()
                                            }
                                            value={cashFlow.total}
                                            onChange={handleInputChangeWayPay}
                                            onFocus={(e) => e.target.select()}
                                            className="form-control-sm"
                                        />
                                    </div>

                                    <div className="sm:col-span-4">
                                        {Number(cashFlow.wayPay) === 9 ? (
                                            <>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Fecha de Pago (Cuota)
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
                        </div>
                        <button
                            className="btn-blue ms-4 inline-flex items-center gap-2"
                            onClick={handleAddWayPay}
                        >
                            <Add />
                            Agregar medio de pago
                        </button>
                        {purchase?.cashflowSet?.length > 0 ? (
                            <div className=" overflow-hidden shadow">
                                <table className="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-600">
                                    <thead className="bg-gray-100 dark:bg-gray-700">
                                        <tr>
                                            <th
                                                scope="col"
                                                className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                                            >
                                                TIPO
                                            </th>
                                            <th
                                                scope="col"
                                                className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                                            >
                                                IMPORTE
                                            </th>
                                            <th
                                                scope="col"
                                                className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                                            >
                                                NOTA
                                            </th>
                                            <th
                                                scope="col"
                                                className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                                            ></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {purchase?.cashflowSet?.map(
                                            (item: ICashFlow, c: number) => (
                                                <tr
                                                    key={c}
                                                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                                                >
                                                    <td className="px-4 py-2">
                                                        {wayPaysData?.allWayPays?.find(
                                                            (w: IWayPay) =>
                                                                w.code ===
                                                                item.wayPay
                                                        )?.name || item.wayPay}
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        {item.total}
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        {item.description}
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <a
                                                            className="hover:underline cursor-pointer"
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
                            <fieldset className="border p-2 dark:border-gray-500 border-gray-200 rounded">
                                <div className="grid grid-cols-3 gap-2 ">
                                    <div className="sm:col-span-1">
                                        <label className="form-label-sm">
                                            Importa TOTAL
                                        </label>
                                        <input
                                            type="number"
                                            value={purchase.totalToPay}
                                            readOnly
                                            className="form-control-sm"
                                        />
                                    </div>

                                    <div className="sm:col-span-1">
                                        <label className="form-label-sm">
                                            Importe TOTAL pagado
                                        </label>
                                        <input
                                            type="number"
                                            value={purchase.totalPayed}
                                            readOnly
                                            className="form-control-sm"
                                        />
                                    </div>

                                    <div className="sm:col-span-1">
                                        <label className="form-label-sm">
                                            Diferencia (vuelto / cobro)
                                        </label>
                                        <input
                                            type="number"
                                            value={purchase.totalTurned}
                                            readOnly
                                            className="form-control-sm"
                                        />
                                    </div>
                                </div>
                            </fieldset>
                        </div>

                        {/* Modal footer */}
                        <div className="flex items-center p-4 md:p-5 space-x-3 rtl:space-x-reverse border-t border-gray-200 rounded-b dark:border-gray-600">
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="btn-dark px-5 py-2 inline-flex items-center gap-2"
                            >
                                Cerrar
                            </button>
                            <button
                                type="button"
                                onClick={handleSavePurchase}
                                className="btn-green px-5 py-2 inline-flex items-center gap-2"
                            >
                                {" "}
                                <Save />
                                Crear Compra
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default WayPayForm;
