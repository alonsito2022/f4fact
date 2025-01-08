import React from 'react'
import { IOperation, IProduct } from '@/app/types';
import Close from "@/components/icons/Close";

function SaleList({filteredPurchasesData} : any) {
    return (
        <>
        <table className="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-600">
                <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">FECHA EMISION</th>
                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">TIPO</th>
                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">SERIE</th>
                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">NUM.</th>
                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">DENOMINACIÓN</th>
                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">M</th>
                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">TOTAL ONEROSA</th>
                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">TOTAL GRATUITA</th>

                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">PAGADO?</th>
                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">ANULADO?</th>
                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">ENVIADO AL CLIENTE</th>
                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">PDF</th>
                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">XML</th>
                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">CDR</th>
                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">ESTADO EN LA SUNAT</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredPurchasesData?.allSales?.map((item: IOperation) =>
                        <tr key={item.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                            <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">{item.emitDate}</td>
                            <td className="px-4 py-2">{item.documentType?.replace("A_","")}</td>
                            <td className="px-4 py-2">{item.serial}</td>
                            <td className="px-4 py-2">{item.correlative}</td>
                            <td className="px-4 py-2">{item.client?.names}</td>
                            <td className="px-4 py-2">{item.currencyType}</td>
                            <td className="px-4 py-2">{Number(item.totalToPay).toFixed(2)}</td>
                            <td className="px-4 py-2">{Number(item.totalFree).toFixed(2)}</td>

                            <td className="px-4 py-2">{Number(item.totalPayed)>0?"SI":"X"}</td>
                            <td className="px-4 py-2">{item.operationStatus==="06"?"SI":"NO"}</td>
                            <td className="px-4 py-2">{item.sendClient?"SI":"X"}</td>
                            <td className="px-4 py-2"><a href={process.env.NEXT_PUBLIC_BASE_API + "/operations/print_invoice/" + item.id + "/"} className="hover:underline" >PDF</a></td>
                            <td className="px-4 py-2"><a href={item.operationStatus==="02"?item.linkXml:item.linkXmlLow} className="hover:underline" >XML</a></td>
                            <td className="px-4 py-2"><a href={item.operationStatus==="02"?item.linkXmlLow:item.linkCdrLow} className="hover:underline" >CDR</a></td>
                            <td className="px-4 py-2">{item.operationStatusReadable}</td>

                        </tr>
                    )}
                </tbody>
            </table>
        </>
    )
}

export default SaleList
