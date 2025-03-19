import { IRelatedDocument } from "@/app/types";
import Delete from "@/components/icons/Delete";
import Edit from "@/components/icons/Edit";
import React from "react";

function RetentionDetailDocumentList({
    retention,
    setRetention,
    setRetentionDetail,
    modalAddDetail,
}: any) {
    const handleRemoveSaleDetail = async (indexToRemove: number) => {
        setRetention((prevRetention: any) => ({
            ...prevRetention,
            relatedDocuments: prevRetention?.relatedDocuments?.filter(
                (detail: IRelatedDocument) =>
                    detail.temporaryId !== indexToRemove
            ),
        }));
    };
    return (
        <div className="overflow-hidden shadow-lg rounded-lg bg-white dark:bg-gray-800">
            <table className="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-600">
                <thead className="bg-yellow-300 dark:bg-cyan-500">
                    <tr>
                        <th
                            scope="col"
                            className="p-3 text-xs font-medium text-left text-gray-600 uppercase dark:text-gray-800"
                        >
                            Tipo documento
                        </th>
                        <th
                            scope="col"
                            className="p-3 text-xs font-medium text-left text-gray-600 uppercase dark:text-gray-800"
                        >
                            Serie
                        </th>
                        <th
                            scope="col"
                            className="p-3 text-xs font-medium text-left text-gray-600 uppercase dark:text-gray-800"
                        >
                            Numero
                        </th>
                        <th
                            scope="col"
                            className="p-3 text-xs font-medium text-left text-gray-600 uppercase dark:text-gray-800"
                        >
                            Fecha de emisión
                        </th>
                        <th
                            scope="col"
                            className="p-3 text-xs font-medium text-left text-gray-600 uppercase dark:text-gray-800"
                        >
                            Nro de pago
                        </th>
                        <th
                            scope="col"
                            className="p-3 text-xs font-medium text-left text-gray-600 uppercase dark:text-gray-800"
                        >
                            Importe de pago
                        </th>
                        <th
                            scope="col"
                            className="p-3 text-xs font-medium text-left text-gray-600 uppercase dark:text-gray-800"
                        >
                            Tasa %
                        </th>
                        <th
                            scope="col"
                            className="p-3 text-xs font-medium text-left text-gray-600 uppercase dark:text-gray-800"
                        >
                            Retención S/
                        </th>
                        <th
                            scope="col"
                            className="p-3 text-xs font-medium text-left text-gray-600 uppercase dark:text-gray-800"
                        >
                            Importe neto pagado S/
                        </th>
                        <th
                            scope="col"
                            className="p-3 text-xs font-medium text-left text-gray-600 uppercase dark:text-gray-800"
                        ></th>
                    </tr>
                </thead>
                <tbody>
                    {retention?.relatedDocuments?.map(
                        (item: IRelatedDocument, i: number) => (
                            <tr
                                key={i}
                                className="bg-yellow-400 border-b dark:bg-cyan-700 dark:border-gray-700 hover:bg-cyan-100 "
                            >
                                <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                                    {item.documentType === "01"
                                        ? "Factura"
                                        : item.documentType === "03"
                                        ? "Boleta"
                                        : "Nota de credito"}
                                </td>
                                <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                                    {item.serial}
                                </td>
                                <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                                    {item.correlative}
                                </td>
                                <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                                    {item.emitDate}
                                </td>
                                <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                                    {item.quotas?.length}
                                </td>
                                <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                                    {Number(item.totalAmount).toFixed(2)}
                                </td>
                                <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                                    {Number(item.retentionType) === 1
                                        ? "3"
                                        : Number(item.retentionType) === 2
                                        ? "6"
                                        : "0"}
                                </td>
                                <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                                    {Number(item.totalRetention).toFixed(2)}
                                </td>
                                <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                                    {Number(
                                        Number(item.totalAmount) -
                                            Number(item.totalRetention)
                                    ).toFixed(2)}
                                </td>
                                <td className="px-4 py-2">
                                    <div className="flex justify-end py-2 space-x-2">
                                        <a
                                            className="hover:underline cursor-pointer text-blue-600 dark:text-blue-400"
                                            onClick={(e) => {
                                                modalAddDetail.show();
                                                setRetentionDetail(item);
                                            }}
                                        >
                                            <Edit />
                                        </a>
                                        <a
                                            className="hover:underline cursor-pointer text-red-600 dark:text-red-400"
                                            onClick={() =>
                                                handleRemoveSaleDetail(
                                                    Number(item?.temporaryId)
                                                )
                                            }
                                        >
                                            <Delete />
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        )
                    )}
                    {/* Totals row */}
                    {retention?.relatedDocuments?.length > 0 && (
                        <tr className="bg-yellow-500 dark:bg-cyan-800 font-semibold">
                            <td
                                colSpan={7}
                                className="px-4 py-2 text-right text-gray-700 dark:text-gray-300"
                            >
                                Totales:
                            </td>
                            <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                                {retention.relatedDocuments
                                    .reduce(
                                        (sum: number, item: IRelatedDocument) =>
                                            sum + Number(item.totalRetention),
                                        0
                                    )
                                    .toFixed(2)}
                            </td>
                            <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                                {retention.relatedDocuments
                                    .reduce(
                                        (sum: number, item: IRelatedDocument) =>
                                            sum +
                                            (Number(item.totalAmount) -
                                                Number(item.totalRetention)),
                                        0
                                    )
                                    .toFixed(2)}
                            </td>
                            <td></td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default RetentionDetailDocumentList;
