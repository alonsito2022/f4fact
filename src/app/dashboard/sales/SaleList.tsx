import React from "react";
import { IOperation, IProduct } from "@/app/types";
import Close from "@/components/icons/Close";
import Popover from "@/components/Popover";

function SaleList({ filteredPurchasesData }: any) {
    return (
        <>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr className="text-xs text-left text-gray-500 uppercase dark:text-gray-400">
                        {[
                            "Fecha Emisión",
                            "Tipo",
                            "Serie",
                            "Num.",
                            "Denominación",
                            "M",
                            "Total Onerosa",
                            "Total Gratuita",
                            "Pagado?",
                            "Anulado?",
                            "Enviado al Cliente",
                            "PDF",
                            "XML",
                            "CDR",
                            "Estado SUNAT",
                        ].map((header, index) => (
                            <th key={index} scope="col" className="p-4">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {filteredPurchasesData?.allSales?.map(
                        (item: IOperation) => (
                            <tr
                                key={item.id}
                                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                            >
                                <td className="px-4 py-2">{item.emitDate}</td>
                                <td className="px-4 py-2">
                                    {item.documentType?.replace("A_", "")}
                                </td>
                                <td className="px-4 py-2">{item.serial}</td>
                                <td className="px-4 py-2">
                                    {item.correlative}
                                </td>
                                <td className="px-4 py-2">
                                    {item.client?.names}
                                </td>
                                <td className="px-4 py-2">
                                    {item.currencyType}
                                </td>
                                <td className="px-4 py-2">
                                    {Number(item.totalToPay).toFixed(2)}
                                </td>
                                <td className="px-4 py-2">
                                    {Number(item.totalFree).toFixed(2)}
                                </td>

                                <td className="px-4 py-2">
                                    {Number(item.totalPayed) > 0 ? "SI" : "X"}
                                </td>
                                <td className="px-4 py-2">
                                    {item.operationStatus.replace("A_", "") ===
                                    "06"
                                        ? "SI"
                                        : "NO"}
                                </td>
                                <td className="px-4 py-2">
                                    {item.sendClient ? "SI" : "X"}
                                </td>
                                <td className="px-4 py-2">
                                    <a
                                        href={
                                            process.env.NEXT_PUBLIC_BASE_API +
                                            "/operations/print_invoice/" +
                                            item.id +
                                            "/"
                                        }
                                        className="hover:underline"
                                        target="_blank"
                                    >
                                        PDF
                                    </a>
                                </td>
                                <td className="px-4 py-2">
                                    <a
                                        href={
                                            item.operationStatus.replace(
                                                "A_",
                                                ""
                                            ) === "02"
                                                ? item.linkXml
                                                : item.linkXmlLow
                                        }
                                        className="hover:underline"
                                        target="_blank"
                                    >
                                        XML
                                    </a>
                                </td>
                                <td className="px-4 py-2">
                                    <a
                                        href={
                                            item.operationStatus.replace(
                                                "A_",
                                                ""
                                            ) === "02"
                                                ? item.linkXmlLow
                                                : item.linkCdrLow
                                        }
                                        className="hover:underline"
                                        target="_blank"
                                    >
                                        CDR
                                    </a>
                                </td>
                                <td className="px-4 py-2">
                                    <button
                                        data-popover-target={
                                            "popover-company-" + item.id
                                        }
                                        type="button"
                                        className="btn-blue-xs"
                                    >
                                        {item.operationStatusReadable}
                                    </button>
                                    <Popover
                                        id={item.id}
                                        description={
                                            item.operationStatus.replace(
                                                "A_",
                                                ""
                                            ) === "02"
                                                ? item.sunatDescription
                                                : item.operationStatus.replace(
                                                      "A_",
                                                      ""
                                                  ) === "06"
                                                ? item.sunatDescriptionLow
                                                : ""
                                        }
                                    />
                                </td>
                            </tr>
                        )
                    )}
                </tbody>
            </table>
        </>
    );
}

export default SaleList;
