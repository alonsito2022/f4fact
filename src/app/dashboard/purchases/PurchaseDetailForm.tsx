import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { toast } from "react-toastify";
import Save from '@/components/icons/Save';
import { Modal, ModalOptions } from 'flowbite'
import { IOperation, IProduct, ITypeAffectation } from "@/app/types";
import { gql, useLazyQuery } from "@apollo/client";

const PRODUCT_DETAIL_QUERY = gql`
    query ($productId: Int!) {
        productDetailByProductId(productId: $productId) {
            remainingQuantity
            priceWithoutIgv3
            priceWithIgv3
            productTariffId
        }
    }
`;

function PurchaseDetailForm({ modalAddDetail, setModalAddDetail, purchaseDetail, setPurchaseDetail, purchase, setPurchase, jwtToken, typeAffectationsData, productsData }: any) {

    const getAuthContext = () => ({
        headers: {
            "Content-Type": "application/json",
            "Authorization": jwtToken ? `JWT ${jwtToken}` : "",
        },
    });

    const [productDetailQuery] = useLazyQuery(PRODUCT_DETAIL_QUERY, {
        context: getAuthContext(), variables: { productId: Number(purchaseDetail.productId) },
        onCompleted: (data) => {
            const productDetail = data.productDetailByProductId;
            if (productDetail) {
                let totalValue = (Number(productDetail.priceWithoutIgv3) * Number(purchaseDetail.quantity)) - Number(purchaseDetail.totalDiscount);
                let igvPercentage = Number(purchase.igvType);
                let totalIgv = totalValue * igvPercentage * 0.01;
                let totalAmount = totalValue + totalIgv;
                setPurchaseDetail({
                    ...purchaseDetail,
                    productTariffId: Number(productDetail.productTariffId),
                    unitValue: Number(productDetail.priceWithoutIgv3).toFixed(2),
                    unitPrice: Number(productDetail.priceWithIgv3).toFixed(2),
                    igvPercentage: Number(igvPercentage).toFixed(2),
                    totalValue: Number(totalValue).toFixed(2),
                    totalIgv: Number(totalIgv).toFixed(2),
                    totalAmount: Number(totalAmount).toFixed(2),
                    remainingQuantity: Number(productDetail.remainingQuantity),
                });
            }
        },
        onError: (err) => console.error("Error in products:", err),
    });

    useEffect(() => {
        if (modalAddDetail == null) {
            const $targetEl = document.getElementById('modalAddDetail');
            const options: ModalOptions = {
                placement: 'top-center',
                backdrop: 'static',
                backdropClasses: 'bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
                closable: false,
            };
            setModalAddDetail(new Modal($targetEl, options))
        }
    }, []);

    useEffect(() => {
        if (Number(purchaseDetail.productId))
            productDetailQuery();
    }, [purchaseDetail.productId]);

    const handleAddDetail = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (purchaseDetail?.typeAffectationId === 0) {
            toast('Por favor ingrese un tipo de afectacion.', { hideProgressBar: true, autoClose: 2000, type: 'warning' })
            return;
        }
        if (Number(purchaseDetail?.quantity) === 0) {
            toast('Por favor ingrese una cantidad.', { hideProgressBar: true, autoClose: 2000, type: 'warning' })
            return;
        }
        console.log("purchaseDetail", purchaseDetail)
        setPurchase((prevEntry: IOperation) => ({
            ...prevEntry, operationdetailSet: [...prevEntry.operationdetailSet!, purchaseDetail]
        }));

        modalAddDetail.hide();
    }

    const handleInputChangePurchaseDetail = async (event: ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        if (name === "productName" && event.target instanceof HTMLInputElement) {
            const dataList = event.target.list;
            if (dataList) {
                const option = Array.from(dataList.options).find(option => option.value === value);
                if (option) {
                    const selectedId = option.getAttribute("data-key");
                    setPurchaseDetail({ ...purchaseDetail, productId: Number(selectedId), productName: value });

                } else {
                    setPurchaseDetail({ ...purchaseDetail, [name]: value, productId: 0 });
                }
            } else {
                console.log('sin datalist')
            }
        } else if (name === "quantity") {
            let totalValue = (Number(purchaseDetail.unitValue) * Number(value)) - Number(purchaseDetail.totalDiscount);
            let igvPercentage = Number(purchase.igvType);
            let totalIgv = totalValue * igvPercentage * 0.01;
            let totalAmount = totalValue + totalIgv;
            const formattedValue = value.replace(/[^0-9]/g, '').slice(0, 6);
            // const numberValue = Number(formattedValue);
            setPurchaseDetail({
                ...purchaseDetail,
                quantity: formattedValue,
                totalValue: Number(totalValue).toFixed(2),
                totalIgv: Number(totalIgv).toFixed(2),
                totalAmount: Number(totalAmount).toFixed(2)
            });
        } else if (name === "totalDiscount") {
            let totalValue = (Number(purchaseDetail.unitValue) * Number(purchaseDetail.quantity)) - Number(value);
            let igvPercentage = Number(purchase.igvType);
            let totalIgv = totalValue * igvPercentage * 0.01;
            let totalAmount = totalValue + totalIgv;
            // Limitar a 6 dígitos enteros y 2 decimales (máximo 999999.99)
            let formattedValue = value.replace(/[^0-9.]/g, '').slice(0, 9);
            // Asegurar un solo punto decimal y máximo 2 decimales
            const hasDecimal = formattedValue.indexOf('.') !== -1;
            if (hasDecimal) {
                formattedValue = formattedValue.slice(0, formattedValue.indexOf('.') + 3);
            }

            setPurchaseDetail({
                ...purchaseDetail,
                totalDiscount: formattedValue,
                totalValue: Number(totalValue).toFixed(2),
                totalIgv: Number(totalIgv).toFixed(2),
                totalAmount: Number(totalAmount).toFixed(2)
            });


        } else
            setPurchaseDetail({ ...purchaseDetail, [name]: value });
    }

    return (
        <>
            {/* Large Modal */}
            <div id="modalAddDetail" tabIndex={-1} className="fixed top-0 left-0 right-0 z-50 hidden w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
                <div className="relative w-full max-w-4xl max-h-full">
                    {/* Modal content */}
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                        {/* Modal header */}
                        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                            <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                                Detalle de la LINEA o ITEM
                            </h3>
                            <button type="button" onClick={() => { modalAddDetail.hide(); }} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                </svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>
                        {/* Modal body */}

                        <form onSubmit={handleAddDetail}>
                            <div className="p-4 md:p-5 space-y-4">

                                <div className="grid grid-cols-6 gap-4">

                                    <div className="sm:col-span-4">
                                        <label htmlFor="productName" className="form-label">Producto - Servicio (CATÁLOGO)</label>
                                        <input type="text" name="productName" maxLength={100}
                                            onFocus={(e) => e.target.select()}
                                            value={purchaseDetail.productName}
                                            onChange={handleInputChangePurchaseDetail}
                                            className="form-control" list="productList" autoComplete="off" required />
                                        <datalist id="productList">
                                            {productsData?.allProducts?.map((n: IProduct, index: number) => (
                                                <option key={index} data-key={n.id} value={n.name} />
                                            ))}
                                        </datalist>
                                    </div>

                                    {/* <div className="sm:col-span-4">
                                    <label htmlFor="priceWithoutIgv3" className="form-label">Detalle adicional</label>
                                    <input type="number" name="priceWithoutIgv3'
                                        onWheel={(e) => e.currentTarget.blur()}
                                        value={purchaseDetail.priceWithoutIgv3}
                                        onChange={handleInputChangePurchaseDetail} onFocus={(e) => e.target.select()}
                                        className="form-control" />
                                </div> */}

                                    <div className="sm:col-span-2">
                                        <label htmlFor="remainingQuantity" className="form-label">Stock actual disponible</label>
                                        <input type="number" name="remainingQuantity"
                                            onWheel={(e) => e.currentTarget.blur()}
                                            value={purchaseDetail.remainingQuantity}
                                            onChange={handleInputChangePurchaseDetail} onFocus={(e) => e.target.select()}
                                            className="form-control cursor-not-allowed" />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label htmlFor="quantity" className="form-label">Cantidad</label>
                                        <input type="number" name="quantity"
                                            onWheel={(e) => e.currentTarget.blur()}
                                            value={purchaseDetail.quantity}
                                            onChange={handleInputChangePurchaseDetail} onFocus={(e) => e.target.select()}
                                            className="form-control" required />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label htmlFor="unitValue" className="form-label">VALOR Unit. (Sin IGV)</label>
                                        <input type="number" name="unitValue"
                                            onWheel={(e) => e.currentTarget.blur()}
                                            value={purchaseDetail.unitValue}
                                            onChange={handleInputChangePurchaseDetail} onFocus={(e) => e.target.select()}
                                            className="form-control cursor-not-allowed" />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label htmlFor="totalValue" className="form-label">Subtotal</label>
                                        <input type="number" name="totalValue"
                                            onWheel={(e) => e.currentTarget.blur()}
                                            value={purchaseDetail.totalValue}
                                            readOnly
                                            onChange={handleInputChangePurchaseDetail} onFocus={(e) => e.target.select()}
                                            className="form-control cursor-not-allowed" />
                                    </div>

                                    <div className="sm:col-span-2"></div>

                                    <div className="sm:col-span-2">
                                        <label htmlFor="totalDiscount" className="form-label">Descuento por Item <span className=" text-xs">(aplica al Subtotal)</span></label>
                                        <input type="number" name="totalDiscount"
                                            onWheel={(e) => e.currentTarget.blur()}
                                            value={purchaseDetail.totalDiscount}
                                            onChange={handleInputChangePurchaseDetail} onFocus={(e) => e.target.select()}
                                            className="form-control" />
                                    </div>

                                    <div className="sm:col-span-2"></div>

                                    <div className="sm:col-span-2">
                                        <label htmlFor="typeAffectationId" className="form-label">Tipo IGV</label>
                                        <select name="typeAffectationId" id="typeAffectationId" onChange={handleInputChangePurchaseDetail} value={purchaseDetail.typeAffectationId} className="form-control" required>
                                            <option value={0}>Elegir tipo de afectacion</option>
                                            {typeAffectationsData?.allTypeAffectations?.map((o: ITypeAffectation, k: number) => (
                                                <option key={k} value={o.id}>{o.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label htmlFor="totalIgv" className="form-label">IGV de la linea</label>
                                        <input type="number" name="totalIgv"
                                            onWheel={(e) => e.currentTarget.blur()}
                                            value={purchaseDetail.totalIgv}
                                            onChange={handleInputChangePurchaseDetail} onFocus={(e) => e.target.select()}
                                            className="form-control cursor-not-allowed" />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label htmlFor="totalAmount" className="form-label">Total</label>
                                        <input type="number" name="totalAmount"
                                            onWheel={(e) => e.currentTarget.blur()}
                                            value={purchaseDetail.totalAmount}
                                            onChange={handleInputChangePurchaseDetail} onFocus={(e) => e.target.select()}
                                            className="form-control cursor-not-allowed" />
                                    </div>
                                </div>

                            </div>


                            {/* Modal footer */}
                            <div className="flex items-center p-4 md:p-5 space-x-3 rtl:space-x-reverse border-t border-gray-200 rounded-b dark:border-gray-600">
                                <button type="button" onClick={() => { modalAddDetail.hide(); }} className="btn-dark px-5 py-2 inline-flex items-center gap-2">Cerrar</button>
                                <button type="submit" className="btn-green px-5 py-2 inline-flex items-center gap-2"> <Save /> Aceptar</button>
                            </div>

                        </form>


                    </div>
                </div>
            </div>
        </>
    )
}

export default PurchaseDetailForm
