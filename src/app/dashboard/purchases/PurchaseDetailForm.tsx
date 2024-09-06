import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { toast } from "react-toastify";
import Save from '@/components/icons/Save';
import { Modal, ModalOptions } from 'flowbite'

function PurchaseDetailForm({modalAddDetail, setModalAddDetail, purchaseDetail }: any) {
    useEffect(() => {

        if (modalAddDetail == null) {

            const $targetEl = document.getElementById('modalAddDetail');
            const options: ModalOptions = {
                placement: 'top-center',
                backdrop: 'static',
                backdropClasses: 'bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
                closable: false,

            };
            setModalAddDetail(new Modal($targetEl, options))
        }
    }, []);

    const handleAddDetail = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    }

    return (
        <>
        {/* Large Modal */}
        <div id="modalAddDetail" tabIndex={-1} className="fixed top-0 left-0 right-0 z-50 hidden w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
                <div className="relative w-full max-w-4xl max-h-full">
                    {/* Modal content */}
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                        {/* Modal header */}
                        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                            <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                                Detalle de la LINEA o ITEM
                            </h3>
                            <button type="button" onClick={() => { modalAddDetail.hide(); }} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                </svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>
                        {/* Modal body */}

                        <form onSubmit={handleAddDetail}>
                        <div className="p-4 md:p-5 space-y-4"></div>


                        {/* Modal footer */}
                        <div className="flex items-center p-4 md:p-5 space-x-3 rtl:space-x-reverse border-t border-gray-200 rounded-b dark:border-gray-600">
                            <button type="button" onClick={() => { modalAddDetail.hide(); }} className="btn-dark px-5 py-2 inline-flex items-center gap-2">Cerrar</button>
                            <button type="submit" className="btn-green px-5 py-2 inline-flex items-center gap-2"> <Save /> Aceptar</button>
                        </div>

                        </form>


                    </div>
                </div>
            </div>
        </>
    )
}

export default PurchaseDetailForm
