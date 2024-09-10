import { ICashFlow, IOperation, IWayPay } from '@/app/types';
import Add from '@/components/icons/Add';
import Delete from '@/components/icons/Delete';
import Save from '@/components/icons/Save';
import { Modal, ModalOptions } from 'flowbite';
import React, { ChangeEvent, useEffect, useState } from 'react'

function WayPayForm({ modalWayPay, setModalWayPay, cashFlow, setCashFlow, initialStateCashFlow, purchase, setPurchase, wayPaysData }: any) {
    
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
        let newCashFlow = { ...cashFlow, temporaryId: purchase.cashflowSet.length + 1 };
        setPurchase((prevPurchase: IOperation) => ({ ...prevPurchase, cashflowSet: [...prevPurchase.cashflowSet!, newCashFlow] }));
        setCashFlow(initialStateCashFlow)
    }
    const handleRemoveCashFlow = async (indexToRemove: number) => {

        setPurchase((prevPurchase: any) => ({
            ...prevPurchase, cashflowSet: prevPurchase?.cashflowSet?.filter((detail: ICashFlow) => detail.temporaryId !== indexToRemove)
        }));

    };

    const handleSavePurchase = async () => {
        console.log("purchase", purchase)
        modalWayPay.hide(); 
    }


    useEffect(() => {
        calculateTotalPayed();
    }, [purchase.cashflowSet]);

    function calculateTotalPayed() {

        const totalPayed = purchase?.cashflowSet?.reduce((total: number, detail: ICashFlow) => {
            return total + Number(detail.total);
        }, 0);

        const totalTurned = totalPayed - Number(purchase?.totalToPay);

        setPurchase((prevEntry: any) => ({
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
                        {purchase?.cashflowSet?.length > 0 ? 
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
                                    {purchase?.cashflowSet?.map((item: ICashFlow, c: number) =>
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
                        </div>: null}

                        <div className="p-4 md:p-5 space-y-4">
                        <fieldset className="border p-2 dark:border-gray-500 border-gray-200 rounded">
                                <div className="grid grid-cols-3 gap-2 ">


                                    <div className="sm:col-span-1">
                                        <label className="form-label-sm">Importa TOTAL</label>
                                        <input type="number" value={purchase.totalToPay} readOnly className="form-control-sm" />
                                    </div>

                                    <div className="sm:col-span-1">
                                        <label className="form-label-sm">Importe TOTAL pagado</label>
                                        <input type="number" value={purchase.totalPayed} readOnly className="form-control-sm" />
                                    </div>

                                    <div className="sm:col-span-1">
                                        <label className="form-label-sm">Diferencia (vuelto / cobro)</label>
                                        <input type="number" value={purchase.totalTurned} readOnly className="form-control-sm" />
                                    </div>


                                </div>
                            </fieldset>
                            </div>

                        {/* Modal footer */}
                        <div className="flex items-center p-4 md:p-5 space-x-3 rtl:space-x-reverse border-t border-gray-200 rounded-b dark:border-gray-600">
                        <button type="button" onClick={() => { modalWayPay.hide(); }} className="btn-dark px-5 py-2 inline-flex items-center gap-2">Cerrar</button>
                        <button type="button" onClick={handleSavePurchase} className="btn-green px-5 py-2 inline-flex items-center gap-2"> <Save />Crear Compra</button>

                        </div>
                    </div>
                </div>
            </div>



        </>
    )
}

export default WayPayForm
