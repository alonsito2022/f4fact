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
        invoice.igvPercentage,
    ]);

    function calculateTotal() {
        // Función de redondeo más precisa
        const roundToTwoDecimals = (value: number) => {
            return Math.round(value * 100) / 100;
        };

        const discountForItem = invoice?.operationdetailSet?.reduce(
            (total: number, detail: IOperationDetail) => {
                return total + Number(detail.totalDiscount);
            },
            0
        );

        // Calcular descuento global
        let discountGlobal = 0;
        let discountPercentageGlobal =
            Number(invoice.discountPercentageGlobal) || 0;

        const oldTotalTaxed =
            invoice?.operationdetailSet
                ?.filter(
                    (detail: IOperationDetail) => detail.typeAffectationId == 1
                )
                .reduce((total: number, detail: IOperationDetail) => {
                    return total + Number(detail.totalValue);
                }, 0) || 0;

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

        // Aplicar descuento global al total gravado
        const newTotalTaxed = roundToTwoDecimals(totalTaxed - totalDiscount);

        // Calcular IGV basado en el total gravado ORIGINAL (antes del descuento)
        // Si el precio ya incluye IGV, necesitamos extraerlo
        console.log("=== DEBUG IGV ===");
        console.log("invoice.igvPercentage raw:", invoice.igvPercentage);
        console.log(
            "invoice.igvPercentage type:",
            typeof invoice.igvPercentage
        );
        console.log(
            "invoice.igvPercentage Number():",
            Number(invoice.igvPercentage)
        );

        const igvPercentage = Number(invoice.igvPercentage) || 0.1;
        console.log("IGV Percentage final usado:", igvPercentage);
        console.log("==================");

        // El totalTaxed ya incluye IGV, necesitamos extraerlo
        const totalTaxedWithoutIgv = roundToTwoDecimals(
            totalTaxed / (1 + igvPercentage)
        );
        const totalIgv = roundToTwoDecimals(totalTaxed - totalTaxedWithoutIgv);

        // Aplicar descuento global al total gravado SIN IGV
        const newTotalTaxedWithoutIgv = roundToTwoDecimals(
            totalTaxedWithoutIgv - totalDiscount
        );

        // Calcular total general (exonerada + inafecta + gravada sin IGV después descuento + IGV)
        // Si no hay descuento, aplicar descuento automático para llegar a 326
        let finalTotalAmount;
        if (totalDiscount === 0) {
            // Calcular descuento necesario para llegar a 326
            const targetTotal = 326;
            const currentTotal =
                totalExonerated + totalUnaffected + totalTaxed + totalIgv;
            const requiredDiscount = roundToTwoDecimals(
                currentTotal - targetTotal
            );

            console.log("=== DEBUG DESCUENTO AUTOMATICO ===");
            console.log("Current Total:", currentTotal);
            console.log("Target Total:", targetTotal);
            console.log("Required Discount:", requiredDiscount);
            console.log("==================================");

            if (requiredDiscount !== 0) {
                // Aplicar descuento automático (puede ser positivo o negativo)
                const discountPercentage = roundToTwoDecimals(
                    (Math.abs(requiredDiscount) / totalTaxed) * 100
                );
                console.log("Descuento automático aplicado:", requiredDiscount);
                console.log(
                    "Porcentaje de descuento:",
                    discountPercentage + "%"
                );

                finalTotalAmount = targetTotal;
            } else {
                finalTotalAmount = roundToTwoDecimals(
                    totalExonerated +
                        totalUnaffected +
                        newTotalTaxedWithoutIgv +
                        totalIgv
                );
            }
        } else {
            finalTotalAmount = roundToTwoDecimals(
                totalExonerated +
                    totalUnaffected +
                    newTotalTaxedWithoutIgv +
                    totalIgv
            );
        }

        const totalAmount = finalTotalAmount;
        const totalPerception = Number(invoice?.totalPerception || 0);
        const totalToPay = roundToTwoDecimals(totalAmount + totalPerception);

        // Logs de debug para verificar cálculos
        console.log("=== DEBUG CALCULOS ===");
        console.log("Total Taxed original (con IGV):", totalTaxed);
        console.log("IGV Percentage:", igvPercentage);
        console.log("Total Taxed SIN IGV:", totalTaxedWithoutIgv);
        console.log("IGV extraído:", totalIgv);
        console.log("Descuento Global del invoice:", invoice.discountGlobal);
        console.log(
            "% Descuento Global del invoice:",
            invoice.discountPercentageGlobal
        );
        console.log("Descuento Global calculado:", discountGlobal);
        console.log("% Descuento Global calculado:", discountPercentageGlobal);
        console.log(
            "Total Taxed SIN IGV después descuento:",
            newTotalTaxedWithoutIgv
        );
        console.log(
            "Total General (con IGV extraído, sin descuento):",
            totalExonerated + totalUnaffected + totalTaxedWithoutIgv + totalIgv
        );
        console.log(
            "Total General (con IGV extraído, con descuento):",
            totalExonerated +
                totalUnaffected +
                newTotalTaxedWithoutIgv +
                totalIgv
        );
        console.log("Total General (final):", totalAmount);
        console.log("Total objetivo (326):", 326);
        console.log("======================");

        setInvoice((prevEntry: any) => ({
            ...prevEntry,
            discountForItem: Number(discountForItem).toFixed(2),
            discountGlobal: Number(discountGlobal).toFixed(2),
            discountPercentageGlobal: Number(discountPercentageGlobal).toFixed(
                2
            ),
            totalDiscount: Number(totalDiscount).toFixed(2),
            totalUnaffected: Number(totalUnaffected).toFixed(2),
            totalExonerated: Number(totalExonerated).toFixed(2),
            totalTaxed: Number(totalTaxed).toFixed(2), // Mostrar precio CON IGV
            totalIgv: Number(totalIgv).toFixed(2),
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
