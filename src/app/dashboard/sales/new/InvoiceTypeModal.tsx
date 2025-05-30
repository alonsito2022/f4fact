"use client";
import { Modal } from 'flowbite';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useInvoiceTypeModal } from '@/components/context/InvoiceTypeModalContext'

function InvoiceTypeModal() {
    
    const { modalInvoiceType, hideModal } = useInvoiceTypeModal();
    const router = useRouter();

    // const handleInvoiceTypeSelect = (documentType: string) => {
    //     // Cerrar el modal
    //     modalInvoiceType?.hide();
        
    //     // Redirigir a la página new y actualizar el tipo de documento
    //     router.push('/dashboard/sales/new');
        
    //     // Actualizar el tipo de documento
    //     setSale((prevSale: any) => ({
    //     ...prevSale,
    //     documentType: documentType
    //     }));
    // };

    // useEffect(() => {
    //     const $modalElement = document.getElementById('invoice-type-modal');
    //     if ($modalElement) {
    //       setModalInvoiceType(new Modal($modalElement));
    //     }
    //   }, []);

  return (
    <div
      id="invoice-type-modal"
      tabIndex={-1}
      className="fixed top-32 left-0 right-0 z-50 hidden w-full p-4 overflow-x-hidden overflow-y-auto font-sans"
    >
      <div className="relative w-full max-w-md mx-auto">
        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
          <button
            type="button"
            className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
            onClick={() => modalInvoiceType?.hide()}
          >
            <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
          </button>
          <div className="px-6 py-4 lg:px-8">
          <h5 className="mb-4 text-center text-xl font-sm text-gray-900 dark:text-white ">
              Elegir el tipo de comprobante
            </h5>
            <div className="space-y-0.5">
              <button
                onClick={() => {
                    router.push("/dashboard/sales/new/01");
                    modalInvoiceType?.hide();
                }}

                className="w-full text-white bg-green-600 hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 font-light rounded-lg text-[15px] px-5 py-2 text-center"
              >
                Nueva FACTURA
              </button>
              <button
                onClick={() => {
                    router.push("/dashboard/sales/new/03")
                    modalInvoiceType?.hide();
                }}
                className="w-full text-white bg-green-600 hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 font-light rounded-lg text-[15px] px-5 py-2 text-center"
              >
                Nueva BOLETA DE VENTA
              </button>
              {/* <button
                onClick={() => handleInvoiceTypeSelect("07")}
                className="w-full text-white bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              >
                Nueva NOTA DE CRÉDITO
              </button>
              <button
                onClick={() => handleInvoiceTypeSelect("08")}
                className="w-full text-white bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              >
                Nueva NOTA DE DÉBITO
              </button> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default InvoiceTypeModal