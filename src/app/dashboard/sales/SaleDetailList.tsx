import { IOperationDetail } from "@/app/types";
import Delete from "@/components/icons/Delete";
import Edit from "@/components/icons/Edit";
import React from "react";

function SaleDetailList({
    invoice,
    setInvoice,
    product,
    setInvoiceDetail,
    setProduct,
    modalAddDetail,
}: any) {
    const handleRemoveSaleDetail = async (indexToRemove: number) => {
        setInvoice((prevPurchase: any) => ({
            ...prevPurchase,
            operationdetailSet: prevPurchase?.operationdetailSet?.filter(
                (detail: IOperationDetail) =>
                    detail.temporaryId !== indexToRemove
            ),
        }));
    };
    return (
        <div className="overflow-hidden shadow-lg rounded-lg bg-white dark:bg-gray-800">
            <table className="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-600">
                <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                        <th
                            scope="col"
                            className="p-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                        >
                            Descripción
                        </th>
                        <th
                            scope="col"
                            className="p-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                        >
                            Cantidad
                        </th>
                        <th
                            scope="col"
                            className="p-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                        >
                            C/U
                        </th>
                        <th
                            scope="col"
                            className="p-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                        >
                            Subtotal
                        </th>
                        <th
                            scope="col"
                            className="p-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                        ></th>
                    </tr>
                </thead>
                <tbody>
                    {invoice?.operationdetailSet?.map(
                        (item: any, i: number) => (
                            <tr
                                key={i}
                                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                            >
                                <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                                    {item.productName}
                                </td>
                                <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                                    {item.quantity}
                                </td>
                                <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                                    {item.unitValue}
                                </td>
                                <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                                    {item.totalValue}
                                </td>
                                <td className="px-4 py-2">
                                    <div className="flex justify-end py-2 space-x-2">
                                        <a
                                            className="hover:underline cursor-pointer text-blue-600 dark:text-blue-400"
                                            onClick={(e) => {
                                                modalAddDetail.show();
                                                setInvoiceDetail(item);
                                                setProduct({
                                                    ...product,
                                                    id: Number(item.productId),
                                                    name: item.productName,
                                                });
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
                </tbody>
            </table>
        </div>
    );
}

export default SaleDetailList;
