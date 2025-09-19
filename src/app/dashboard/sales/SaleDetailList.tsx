import { IOperationDetail } from "@/app/types";
import Delete from "@/components/icons/Delete";
import Edit from "@/components/icons/Edit";
import SunatCancel from "@/components/icons/SunatCancel";
import React, { useEffect } from "react";

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
    useEffect(() => {
        calculateTotal();
    }, [
        invoice.operationdetailSet,
        invoice.discountPercentageGlobal,
        invoice.discountGlobal,
        invoice.igvType,
    ]);

    function calculateTotal() {
        // 1. Función auxiliar para cálculos seguros
        const safeNumber = (value: any, defaultValue = 0) =>
            Math.round((Number(value) || defaultValue) * 100) / 100;

        // 2. Clasificación y suma de detalles
        const {
            totalUnaffected,
            totalExonerated,
            totalTaxed,
            totalIgv,
            discountForItem,
            totalAnticipation,
            anticipationIgv, // ← IGV del anticipo separado
        } = invoice?.operationdetailSet?.reduce(
            (acc: any, detail: IOperationDetail) => {
                const value = Number(detail.totalValue);
                const igv = Number(detail.totalIgv);
                const discount = Number(detail.totalDiscount);

                if (detail.isAnticipation) {
                    acc.totalAnticipation += value;
                    acc.anticipationIgv += igv; // ← IGV del anticipo
                } else {
                    if (detail.typeAffectationId === 3)
                        acc.totalUnaffected += value;
                    else if (detail.typeAffectationId === 2)
                        acc.totalExonerated += value;
                    else if (detail.typeAffectationId === 1) {
                        acc.totalTaxed += value;
                        acc.totalIgv += igv;
                    }
                    acc.discountForItem += discount;
                }
                return acc;
            },
            {
                totalUnaffected: 0,
                totalExonerated: 0,
                totalTaxed: 0,
                totalIgv: 0,
                discountForItem: 0,
                totalAnticipation: 0,
                anticipationIgv: 0, // ← Nuevo campo
            }
        ) || {
            totalUnaffected: 0,
            totalExonerated: 0,
            totalTaxed: 0,
            totalIgv: 0,
            discountForItem: 0,
            totalAnticipation: 0,
            anticipationIgv: 0,
        };

        // 3. Cálculo de descuentos globales
        const oldTotalTaxed = totalTaxed;
        let discountGlobal = safeNumber(invoice?.discountGlobal);
        let discountPercentageGlobal = safeNumber(
            invoice?.discountPercentageGlobal
        );
        if (discountGlobal > 0 && discountPercentageGlobal === 0) {
            discountPercentageGlobal = safeNumber(
                (discountGlobal / oldTotalTaxed) * 100
            );
        } else if (discountPercentageGlobal > 0 && discountGlobal === 0) {
            discountGlobal = safeNumber(
                oldTotalTaxed * (discountPercentageGlobal / 100)
            );
        }

        const totalDiscount = safeNumber(discountForItem + discountGlobal);
        const newTotalTaxed = safeNumber(
            oldTotalTaxed - totalDiscount - totalAnticipation
        );
        // const newTotalIgv = safeNumber(
        //     newTotalTaxed * (Number(invoice?.igvType) || 0) * 0.01
        // );

        // 4. Cálculo de IGV (proporcional solo para items no anticipo)
        const newTotalIgv = safeNumber(
            totalIgv * (newTotalTaxed / oldTotalTaxed) // ← Proporción exacta
        );

        // 5. Totales finales (el anticipo se resta al final)
        const subtotal = safeNumber(
            totalExonerated + totalUnaffected + newTotalTaxed + newTotalIgv
        );
        const totalAmount = safeNumber(subtotal); // ← Anticipo se resta aquí
        const totalPerception = safeNumber(invoice?.totalPerception);
        const totalToPay = safeNumber(totalAmount + totalPerception);

        // 5. Actualización del estado
        setInvoice((prev: any) => ({
            ...prev,
            discountForItem: discountForItem.toFixed(2),
            discountGlobal: discountGlobal.toFixed(2),
            totalDiscount: totalDiscount.toFixed(2),
            totalAnticipation: totalAnticipation.toFixed(2),
            totalUnaffected: totalUnaffected.toFixed(2),
            totalExonerated: totalExonerated.toFixed(2),
            totalTaxed: newTotalTaxed.toFixed(2),
            totalIgv: newTotalIgv.toFixed(2),
            totalAmount: totalAmount.toFixed(2),
            totalPerception: totalPerception.toFixed(2),
            totalToPay: totalToPay.toFixed(2),
            discountPercentageGlobal: discountPercentageGlobal.toFixed(2),
        }));
    }
    return (
        <div className="overflow-hidden shadow-lg rounded-lg bg-white dark:bg-gray-800">
            <table className="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-600">
                <thead className="bg-gray-50 dark:bg-cyan-500">
                    <tr>
                        <th
                            scope="col"
                            className="p-3 w-[57%] text-sm font-bold text-left text-dark-600 dark:text-gray-800"
                        >
                            Descripción
                        </th>
                        <th
                            scope="col"
                            className="p-3 w-[10%] text-sm font-bold text-center text-dark-600 dark:text-gray-800"
                        >
                            Cantidad
                        </th>
                        <th
                            scope="col"
                            className="p-3 w-[10%] text-sm font-bold text-center text-dark-600 dark:text-gray-800"
                        >
                            C/U
                        </th>
                        <th
                            scope="col"
                            className="p-3 w-[8%] text-sm font-bold text-center text-dark-600 dark:text-gray-800"
                        >
                            Subtotal
                        </th>
                        <th
                            scope="col"
                            className="p-3 w-[8%] text-sm font-bold text-center text-dark-600 dark:text-gray-800"
                        >
                            Total
                        </th>
                        <th
                            scope="col"
                            className="p-3 w-[4%] text-sm font-bold text-center text-dark-600 dark:text-gray-800"
                        ></th>
                    </tr>
                </thead>
                <tbody>
                    {invoice?.operationdetailSet?.map(
                        (item: any, i: number) => (
                            <tr
                                key={i}
                                className="bg-white-100 text-xs border-b dark:bg-cyan-700 dark:border-gray-700 hover:bg-yellow-100 "
                            >
                                <td className="px-3 py-0 text-gray-700 dark:text-gray-300">
                                    {item.code} {item.productName}{" "}
                                    {item.description}
                                </td>
                                <td className="px-3 py-0 text-gray-700 dark:text-gray-300 text-center">
                                    {item.quantity}
                                </td>
                                <td className="px-3 py-0 text-gray-700 dark:text-gray-300 text-center">
                                    {item.unitValue}
                                </td>
                                <td className="px-3 py-0 text-gray-700 dark:text-gray-300 text-center">
                                    {item.totalValue}
                                </td>
                                <td className="px-3 py-0 text-gray-700 dark:text-gray-300 text-center">
                                    {(
                                        Number(item.totalValue) +
                                        Number(item.totalIgv)
                                    ).toFixed(2)}
                                </td>
                                <td className="px-3 py-0">
                                    <div className="flex justify-end py-2 space-x-1">
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
