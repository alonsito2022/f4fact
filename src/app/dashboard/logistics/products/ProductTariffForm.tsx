import { IUnit, IProduct } from "@/app/types";
import { ChangeEvent, FormEvent, useState, useEffect } from "react";



function ProductTariffForm({ setProduct, product }: any) {


    const handleInputChangeProductTariff = ({ target: { name, value } }: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {

        // Limitar a 6 dígitos enteros y 2 decimales (máximo 999999.99)
        let formattedValue = value.replace(/[^0-9.]/g, '').slice(0, 9);
        // Asegurar un solo punto decimal y máximo 2 decimales
        const hasDecimal = formattedValue.indexOf('.') !== -1;
        if (hasDecimal) {
            formattedValue = formattedValue.slice(0, formattedValue.indexOf('.') + 3);
        }

        if(name === "priceWithIgv3")
            setProduct({ ...product, priceWithIgv3: formattedValue, priceWithoutIgv3: Number(Number(formattedValue) / 1.18).toFixed(3) });
        else if(name === "priceWithoutIgv3")
            setProduct({ ...product, priceWithoutIgv3: formattedValue, priceWithIgv3: Number(Number(formattedValue) * 1.18).toFixed(3) });
        else if(name === "priceWithIgv1")
            setProduct({ ...product, priceWithIgv1: formattedValue, priceWithoutIgv1: Number(Number(formattedValue) / 1.18).toFixed(3) });
        else if(name === "priceWithoutIgv1")
            setProduct({ ...product, priceWithoutIgv1: formattedValue, priceWithIgv1: Number(Number(formattedValue) * 1.18).toFixed(3) });
        else
            setProduct({ ...product, [name]: formattedValue });
    }

    // const handleInputChangePurchaseProductTariff = ({ target: { name, value } }: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {


    //     if (name === "priceWithoutIgv") {
    //         // Limitar a 6 dígitos enteros y 2 decimales (máximo 999999.99)
    //         let formattedValue = value.replace(/[^0-9.]/g, '').slice(0, 9);

    //         // Asegurar un solo punto decimal y máximo 2 decimales
    //         const hasDecimal = formattedValue.indexOf('.') !== -1;
    //         if (hasDecimal) {
    //             formattedValue = formattedValue.slice(0, formattedValue.indexOf('.') + 3);
    //         }
    //         setProduct((prevProduct: IProduct) => ({
    //             ...prevProduct, purchaseProductTariff: { ...prevProduct.purchaseProductTariff, priceWithoutIgv: formattedValue, },
    //         }));
    //     }
    //     else if (name === "priceWithIgv") {
    //         const formattedValue = value.replace(/[^0-9.]/g, '').slice(0, 10);
    //         setProduct((prevProduct: IProduct) => ({
    //             ...prevProduct, purchaseProductTariff: { ...prevProduct.purchaseProductTariff, priceWithIgv: formattedValue, },
    //         }));
    //     }
    //     else if (name === "unitId") {
    //         setProduct((prevProduct: IProduct) => ({
    //             ...prevProduct, purchaseProductTariff: { ...prevProduct.purchaseProductTariff, unitId: value, },
    //         }));
    //     }
    //     else if (name === "quantityMinimum") {
    //         const formattedValue = value.replace(/[^0-9]/g, '').slice(0, 6);
    //         const numberValue = parseFloat(formattedValue);
    //         if (formattedValue === "" || (numberValue >= 1 && numberValue <= 999999)) {
    //             // Si está dentro del rango, asigna el valor normal
    //             setProduct((prevProduct: IProduct) => ({
    //                 ...prevProduct, purchaseProductTariff: { ...prevProduct.purchaseProductTariff, quantityMinimum: numberValue || 1, },
    //             }));
    //         } else {
    //             // Si está fuera de rango, asigna el valor por defecto (1)
    //             setProduct((prevProduct: IProduct) => ({
    //                 ...prevProduct, purchaseProductTariff: { ...prevProduct.purchaseProductTariff, quantityMinimum: 1, },
    //             }));
    //             // Mostrar un mensaje de error al usuario (opcional)
    //             console.error("El valor debe estar entre 1 y 999999.99. Se ha establecido el valor mínimo en 1.");
    //         }
    //         setProduct((prevProduct: IProduct) => ({
    //             ...prevProduct, purchaseProductTariff: { ...prevProduct.purchaseProductTariff, quantityMinimum: formattedValue, },
    //         }));
    //     }
    // }


    return (
        <>
            <div className="sm:col-span-6">

                <fieldset className="border p-4 dark:border-gray-500 border-gray-200 rounded">
                    <legend className=" text-xs">Para la venta (Opcional)</legend>
                    <div className="grid grid-cols-4 gap-4">

                        <div className="sm:col-span-4">
                            <label htmlFor="priceWithoutIgv3" className="form-label-sm">VALOR VENTA unitario SIN IGV (al que se venderá)</label>
                            <input type='number' name='priceWithoutIgv3'
                                onWheel={(e) => e.currentTarget.blur()}
                                value={product.priceWithoutIgv3}
                                onChange={e => handleInputChangeProductTariff(e)} onFocus={(e) => e.target.select()}
                                className='form-control-sm' />
                        </div>

                        <div className="sm:col-span-4">
                            <label htmlFor="priceWithIgv3" className="form-label-sm">PRECIO VENTA unitario CON IGV (al que se venderá)</label>
                            <input type='number' name='priceWithIgv3'
                                onWheel={(e) => e.currentTarget.blur()}
                                value={product.priceWithIgv3}
                                onChange={e => handleInputChangeProductTariff(e)} onFocus={(e) => e.target.select()}
                                className='form-control-sm' />
                        </div>
                    </div>
                </fieldset>
            </div>

            <div className="sm:col-span-6">

                <fieldset className="border p-4 dark:border-gray-500 border-gray-200 rounded">
                    <legend className=" text-xs">Para la compra (Opcional)</legend>
                    <div className="grid grid-cols-4 gap-4">

                        <div className="sm:col-span-4">
                            <label htmlFor="priceWithoutIgv1" className="form-label-sm">COSTO unitario SIN IGV (costo de compra)</label>
                            <input type='number' name='priceWithoutIgv1'
                                onWheel={(e) => e.currentTarget.blur()}
                                value={product.priceWithoutIgv1}
                                onChange={e => handleInputChangeProductTariff(e)} onFocus={(e) => e.target.select()}
                                className='form-control-sm' />
                        </div>

                        <div className="sm:col-span-4">
                            <label htmlFor="priceWithIgv1" className="form-label-sm">PRECIO COMPRA unitario CON IGV (al que se compró)</label>
                            <input type='number' name='priceWithIgv1'
                                onWheel={(e) => e.currentTarget.blur()}
                                value={product.priceWithIgv1}
                                onChange={e => handleInputChangeProductTariff(e)} onFocus={(e) => e.target.select()}
                                className='form-control-sm' />
                        </div>
                    </div>
                </fieldset>
            </div>

        </>
    )
}

export default ProductTariffForm
