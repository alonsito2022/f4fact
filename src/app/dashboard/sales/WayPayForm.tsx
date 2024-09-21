import { ICashFlow, IOperation, IOperationDetail, IWayPay } from '@/app/types';
import Add from '@/components/icons/Add';
import Delete from '@/components/icons/Delete';
import Save from '@/components/icons/Save';
import { DocumentNode, gql, useMutation } from '@apollo/client';
import { Modal, ModalOptions } from 'flowbite';
import React, { ChangeEvent, useEffect, useState } from 'react'
import { toast } from 'react-toastify';


const CREATE_SALE_MUTATION = gql`
  mutation CreateSale($serial: String!, $correlative: Int!, $documentType: String!, $currencyType: String!, $saleExchangeRate: Float!, $emitDate: String!, $supplierId: Int!, $productTariffIdSet: [Int!]!, $typeAffectationIdSet: [Int!]!, $quantitySet: [Int!]!, $unitValueSet: [Float!]!, $unitPriceSet: [Float!]!, $discountPercentageSet: [Float!]!, $igvPercentageSet: [Float!]!, $perceptionPercentageSet: [Float!]!, $totalDiscountSet: [Float!]!, $totalValueSet: [Float!]!, $totalIgvSet: [Float!]!, $totalAmountSet: [Float!]!, $totalPerceptionSet: [Float!]!, $totalToPaySet: [Float!]!, $wayPaySet: [Int!]!, $totalSet: [Float!]!, $descriptionSet: [String!]!, $discountForItem: Float!, $discountGlobal: Float!, $discountPercentageGlobal: Float!, $igvType: Int!, $totalDiscount: Float!, $totalTaxed: Float!, $totalUnaffected: Float!, $totalExonerated: Float!, $totalIgv: Float!, $totalFree: Float!, $totalAmount: Float!, $totalPerception: Float!, $totalToPay: Float!, $totalPayed: Float!, $totalTurned: Float!) {
  createSale(
    serial: $serial
    correlative: $correlative
    documentType: $documentType
    currencyType: $currencyType
    saleExchangeRate: $saleExchangeRate
    emitDate: $emitDate
    supplierId: $supplierId
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
  ) {
    message
    error
  }
}
`;

function WayPayForm({ modalWayPay, setModalWayPay, cashFlow, setCashFlow, initialStateCashFlow, initialStateSale, sale, setSale, jwtToken, wayPaysData }: any) {

    function useCustomMutation(mutation: DocumentNode) {
        const getAuthContext = () => ({
            headers: {
                "Content-Type": "application/json",
                "Authorization": jwtToken ? `JWT ${jwtToken}` : "",
            },
        });

        return useMutation(mutation, {
            context: getAuthContext(),
            // refetchQueries: () => [{ query: refetchQuery, context: getAuthContext() }],
            onError: (err) => console.error("Error in unit:", err), // Log the error for debugging
        });
    }

    const [createSale] = useCustomMutation(CREATE_SALE_MUTATION);

    useEffect(() => {
        if (modalWayPay == null) {
            const $targetEl = document.getElementById('modalWayPay');
            const options: ModalOptions = {
                placement: 'top-center',
                backdrop: 'static',
                backdropClasses: 'bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
                closable: false,
            };
            setModalWayPay(new Modal($targetEl, options))
        }
    }, []);

    const handleInputChangeWayPay = ({ target: { name, value } }: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        if (name === "wayPay") {
            setCashFlow({ ...cashFlow, wayPay: Number(value) })
        } else {
            setCashFlow({ ...cashFlow, [name]: value })
        }
    }

    const handleAddWayPay = () => {
        let newCashFlow = { ...cashFlow, temporaryId: sale.cashflowSet.length + 1 };
        setSale((prevSale: IOperation) => ({ ...prevSale, cashflowSet: [...prevSale.cashflowSet!, newCashFlow] }));
        setCashFlow(initialStateCashFlow)
    }

    const handleRemoveCashFlow = async (indexToRemove: number) => {

        setSale((prevSale: any) => ({
            ...prevSale, cashflowSet: prevSale?.cashflowSet?.filter((detail: ICashFlow) => detail.temporaryId !== indexToRemove)
        }));

    };

    // const [createPurchase] = useMutation(CREATE_PURCHASE_MUTATION);

    const handleSaveSale = async () => {


        try {

            const variables = {
                serial: sale.serial,
                correlative: parseInt(sale.correlative),
                documentType: sale.documentType,
                currencyType: sale.currencyType,
                saleExchangeRate: parseFloat(sale.saleExchangeRate) || 0,
                emitDate: sale.emitDate,

                supplierId: parseInt(sale.supplierId),

                productTariffIdSet: sale.operationdetailSet.map((item: any) => item.productTariffId),
                typeAffectationIdSet: sale.operationdetailSet.map((item: any) => item.typeAffectationId),
                quantitySet: sale.operationdetailSet.map((item: any) => parseInt(item.quantity)),

                unitValueSet: sale.operationdetailSet.map((item: any) => parseFloat(item.unitValue)),
                unitPriceSet: sale.operationdetailSet.map((item: any) => parseFloat(item.unitPrice)),
                discountPercentageSet: sale.operationdetailSet.map((item: any) => parseFloat(item.discountPercentage) || 0),
                igvPercentageSet: sale.operationdetailSet.map((item: any) => parseFloat(item.igvPercentage)),
                perceptionPercentageSet: sale.operationdetailSet.map((item: any) => parseFloat(item.totalPerception) || 0),

                totalDiscountSet: sale.operationdetailSet.map((item: any) => parseFloat(item.totalDiscount) || 0),
                totalValueSet: sale.operationdetailSet.map((item: any) => parseFloat(item.totalValue)),
                totalIgvSet: sale.operationdetailSet.map((item: any) => parseFloat(item.totalIgv)),
                totalAmountSet: sale.operationdetailSet.map((item: any) => parseFloat(item.totalAmount)),
                totalPerceptionSet: sale.operationdetailSet.map((item: any) => parseFloat(item.totalPerception) || 0),
                totalToPaySet: sale.operationdetailSet.map((item: any) => parseFloat(item.totalToPay) || 0),

                wayPaySet: sale.cashflowSet.map((item: any) => item.wayPay),
                totalSet: sale.cashflowSet.map((item: any) => item.total),
                descriptionSet: sale.cashflowSet.map((item: any) => item.description || ""),

                discountForItem: parseFloat(sale.discountForItem) || 0,
                discountGlobal: parseFloat(sale.discountGlobal) || 0,
                discountPercentageGlobal: parseFloat(sale.discountPercentageGlobal) || 0,
                igvType: sale.igvType,

                totalDiscount: parseFloat(sale.totalDiscount) || 0,
                totalTaxed: parseFloat(sale.totalTaxed),
                totalUnaffected: parseFloat(sale.totalUnaffected),
                totalExonerated: parseFloat(sale.totalExonerated),
                totalIgv: parseFloat(sale.totalIgv),
                totalFree: parseFloat(sale.totalFree) || 0,
                totalAmount: parseFloat(sale.totalAmount),

                totalPerception: parseFloat(sale.totalPerception) || 0,
                totalToPay: parseFloat(sale.totalToPay),
                totalPayed: parseFloat(sale.totalPayed),
                totalTurned: parseFloat(sale.totalTurned) || 0,
            }


            // console.log(variables)

            // const response = await createPurchase({
            //     variables: variables,
            // });

            // console.log(response.data.createPurchase.message);


            console.log("sale", sale)


            const { data, errors } = await createSale({
                variables: variables
            })

            if (errors) {
                toast(errors.toString(), { hideProgressBar: true, autoClose: 2000, type: 'error' });
            } else {
                if (data.createSale.error) {
                    toast(data.createSale.message, { hideProgressBar: true, autoClose: 2000, type: 'error' })
                }
                else {
                    toast(data.createSale.message, { hideProgressBar: true, autoClose: 2000, type: 'success' })
                    setSale(initialStateSale);
                    modalWayPay.hide();
                }

            }



        } catch (error) {
            console.error("Error creating purchase:", error);
        }

    }


    useEffect(() => {
        calculateTotalPayed();
    }, [sale.cashflowSet]);

    function calculateTotalPayed() {

        const totalPayed = sale?.cashflowSet?.reduce((total: number, detail: ICashFlow) => {
            return total + Number(detail.total);
        }, 0);

        const totalTurned = totalPayed - Number(sale?.totalToPay);

        setSale((prevEntry: any) => ({
            ...prevEntry,
            totalTurned: Number(totalTurned).toFixed(2),
            totalPayed: Number(totalPayed).toFixed(2)
        }));
    }

    return (
        <>


            {/* Default Modal */}
            <div id="modalWayPay" tabIndex={-1} className="fixed top-0 left-0 right-0 z-50 hidden w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
                <div className="relative w-full max-w-lg max-h-full">
                    {/* Modal content */}
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                        {/* Modal header */}
                        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                            <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                                Completar
                            </h3>
                            <button type="button" onClick={() => { modalWayPay.hide(); }} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" >
                                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                </svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>
                        {/* Modal body */}
                        <div className="p-4 md:p-5 space-y-4">

                            <fieldset className="border p-2 dark:border-gray-500 border-gray-200 rounded">
                                <legend className=" text-xs">Forma de pago</legend>
                                <div className="grid grid-cols-4 gap-2">

                                    <div className="sm:col-span-3">
                                        <label className="form-label-sm">Tipo</label>
                                        <select name="wayPay" onChange={handleInputChangeWayPay} value={cashFlow.wayPay} className="form-control-sm" required>
                                            {wayPaysData?.allWayPays?.map((o: IWayPay, k: number) => (
                                                <option key={k} value={o.code}>{o.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="sm:col-span-1">
                                        <label className="form-label-sm">Importe</label>
                                        <input type="number" name="total" onWheel={(e) => e.currentTarget.blur()}
                                            value={cashFlow.total} onChange={handleInputChangeWayPay} onFocus={(e) => e.target.select()} className="form-control-sm" />
                                    </div>

                                    <div className="sm:col-span-4">
                                        <label className="form-label-sm">Nota</label>
                                        <input type="text" name="description" onFocus={(e) => e.target.select()}
                                            value={cashFlow.description} onChange={handleInputChangeWayPay} className="form-control-sm" />
                                    </div>

                                </div>
                            </fieldset>

                        </div>
                        <button className="btn-blue ms-4 inline-flex items-center gap-2" onClick={handleAddWayPay}><Add />Agregar medio de pago</button>
                        {sale?.cashflowSet?.length > 0 ?
                            <div className=" overflow-hidden shadow">
                                <table className="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-600">
                                    <thead className="bg-gray-100 dark:bg-gray-700">
                                        <tr>
                                            <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">TIPO</th>
                                            <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">IMPORTE</th>
                                            <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">NOTA</th>
                                            <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sale?.cashflowSet?.map((item: ICashFlow, c: number) =>
                                            <tr key={c} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                                <td className="px-4 py-2">{wayPaysData?.allWayPays?.find((w: IWayPay) => w.code === item.wayPay)?.name || item.wayPay}</td>
                                                <td className="px-4 py-2">{item.total}</td>
                                                <td className="px-4 py-2">{item.description}</td>
                                                <td className="px-4 py-2">
                                                    <a className="hover:underline cursor-pointer" onClick={() => handleRemoveCashFlow(Number(item?.temporaryId))}><Delete /></a>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div> : null}

                        <div className="p-4 md:p-5 space-y-4">
                            <fieldset className="border p-2 dark:border-gray-500 border-gray-200 rounded">
                                <div className="grid grid-cols-3 gap-2 ">


                                    <div className="sm:col-span-1">
                                        <label className="form-label-sm">Importa TOTAL</label>
                                        <input type="number" value={sale.totalToPay} readOnly className="form-control-sm" />
                                    </div>

                                    <div className="sm:col-span-1">
                                        <label className="form-label-sm">Importe TOTAL pagado</label>
                                        <input type="number" value={sale.totalPayed} readOnly className="form-control-sm" />
                                    </div>

                                    <div className="sm:col-span-1">
                                        <label className="form-label-sm">Diferencia (vuelto / cobro)</label>
                                        <input type="number" value={sale.totalTurned} readOnly className="form-control-sm" />
                                    </div>


                                </div>
                            </fieldset>
                        </div>

                        {/* Modal footer */}
                        <div className="flex items-center p-4 md:p-5 space-x-3 rtl:space-x-reverse border-t border-gray-200 rounded-b dark:border-gray-600">
                            <button type="button" onClick={() => { modalWayPay.hide(); }} className="btn-dark px-5 py-2 inline-flex items-center gap-2">Cerrar</button>
                            <button type="button" onClick={handleSaveSale} className="btn-green px-5 py-2 inline-flex items-center gap-2"> <Save />Crear Compra</button>

                        </div>
                    </div>
                </div>
            </div>



        </>
    )
}

export default WayPayForm
