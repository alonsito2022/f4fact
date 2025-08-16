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
        console.log("calculateTotal");
    }, [
        invoice.operationdetailSet,
        invoice.discountPercentageGlobal,
        invoice.discountGlobal,
        invoice.igvType,
    ]);

    function calculateTotal() {
        // Función de redondeo más precisa
        const roundToTwoDecimals = (value: number) => {
            return Math.round(value * 100) / 100;
        };
        const totalUnaffected = invoice?.operationdetailSet
            ?.filter(
                (detail: IOperationDetail) => detail.typeAffectationId == 3
            )
            .reduce((total: number, detail: IOperationDetail) => {
                return total + Number(detail.totalValue);
            }, 0);

        const totalExonerated = invoice?.operationdetailSet
            ?.filter(
                (detail: IOperationDetail) => detail.typeAffectationId == 2
            )
            .reduce((total: number, detail: IOperationDetail) => {
                return total + Number(detail.totalValue);
            }, 0);

        const totalTaxed = invoice?.operationdetailSet
            ?.filter(
                (detail: IOperationDetail) => detail.typeAffectationId == 1
            )
            .reduce((total: number, detail: IOperationDetail) => {
                return total + Number(detail.totalValue);
            }, 0);

        const totalIgv = invoice?.operationdetailSet?.reduce(
            (total: number, detail: IOperationDetail) => {
                return total + Number(detail.totalIgv);
            },
            0
        );
        const oldTotalTaxed = totalTaxed;

        const discountForItem = invoice?.operationdetailSet?.reduce(
            (total: number, detail: IOperationDetail) => {
                return total + Number(detail.totalDiscount);
            },
            0
        );
        let discountGlobal = 0;
        let discountPercentageGlobal =
            Number(invoice.discountPercentageGlobal) || 0;
        // Si hay un monto directo de descuento global, usarlo y calcular el porcentaje
        if (Number(invoice.discountGlobal) > 0) {
            discountGlobal = Number(invoice.discountGlobal);
            discountPercentageGlobal =
                oldTotalTaxed > 0
                    ? roundToTwoDecimals((discountGlobal / oldTotalTaxed) * 100)
                    : 0;
        } else if (discountPercentageGlobal > 0) {
            // Solo si no hay monto directo, calcular basado en el porcentaje
            discountGlobal = roundToTwoDecimals(
                oldTotalTaxed * (discountPercentageGlobal / 100)
            );
        }
        const totalDiscount = roundToTwoDecimals(
            discountForItem + discountGlobal
        );
        // Aplicar descuento global al total gravado
        const newTotalTaxed = roundToTwoDecimals(oldTotalTaxed - totalDiscount);
        const newTotalIgv = roundToTwoDecimals(
            newTotalTaxed * Number(invoice?.igvType || 0) * 0.01
        );

        const totalAmount =
            totalExonerated + totalUnaffected + newTotalTaxed + newTotalIgv;
        const totalPerception = Number(invoice?.totalPerception || 0);
        const totalToPay = totalAmount + totalPerception;

        // quantity: "",
        // unitValue: "",
        // unitPrice: "",
        // igvPercentage: "",
        // discountPercentage: "",
        // totalDiscount: "",
        // totalValue: "",
        // totalIgv: "",
        // totalAmount: "",
        // totalPerception: "",
        // totalToPay: "",

        setInvoice((prevEntry: any) => ({
            ...prevEntry,
            discountForItem: Number(discountForItem).toFixed(2),
            discountGlobal: Number(discountGlobal).toFixed(2),
            totalDiscount: Number(totalDiscount).toFixed(2),
            totalUnaffected: Number(totalUnaffected).toFixed(2),
            totalExonerated: Number(totalExonerated).toFixed(2),
            totalTaxed: Number(newTotalTaxed).toFixed(2),
            totalIgv: Number(newTotalIgv).toFixed(2),
            totalAmount: Number(totalAmount).toFixed(2),
            totalPerception: Number(totalPerception).toFixed(2),
            totalToPay: Number(totalToPay).toFixed(2),
        }));
    }
    return (
        <div className="overflow-hidden shadow-lg rounded-lg bg-white dark:bg-gray-800">
            <table className="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-600">
                <thead className="bg-gray-50 dark:bg-cyan-500">
                    <tr>
                        <th
                            scope="col"
                            className="p-3 w-[65%] text-sm font-bold text-left text-dark-600 dark:text-gray-800"
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
                            className="p-3 w-[10%] text-sm font-bold text-center text-dark-600 dark:text-gray-800"
                        >
                            Subtotal
                        </th>
                        <th
                            scope="col"
                            className="p-3 w-[5%] text-sm font-bold text-center text-dark-600 dark:text-gray-800"
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
