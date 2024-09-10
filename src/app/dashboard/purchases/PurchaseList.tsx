import { useState, useEffect } from "react";
import Edit from '@/components/icons/Edit'
import { IOperation, IProduct } from '@/app/types';
import { gql, useLazyQuery } from "@apollo/client";
import { toast } from "react-toastify";
function PurchaseList({purchases} : any) {
    const handleEditProduct = async (productId: number) => {
        
      };
    return (
        <>
        <table className="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-600">
                <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">FECHA </th>
                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">TIPO</th>
                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">SERIE</th>
                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">NUM.</th>
                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">DENOMINACIÓN</th>
                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">M</th>
                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">TOTAL</th>
                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">TOTAL GRATUITA</th>
                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">IMPRIMIR</th>
                    </tr>
                </thead>
                <tbody>
                    {purchases?.map((item: IOperation) =>
                        <tr key={item.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                            <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">{item.emitDate}</td>
                            <td className="px-4 py-2">{item.documentType}</td>
                            <td className="px-4 py-2">{item.serial}</td>
                            <td className="px-4 py-2">{item.correlative}</td>
                            <td className="px-4 py-2">{item.totalAmount}</td>
                            <td className="px-4 py-2">{item.totalFree}</td>
                            <td className="px-4 py-2">{item.totalIgv}</td>
                            <td className="px-4 py-2">
                                <>
                                    <a className="hover:underline cursor-pointer" onClick={() => handleEditProduct(Number(item.id))}>
                                        <Edit />
                                    </a>

                                </>

                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </>
    )
}

export default PurchaseList
