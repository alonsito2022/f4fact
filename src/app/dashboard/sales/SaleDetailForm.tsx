import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { toast } from "react-toastify";
import Save from '@/components/icons/Save';
import { Modal, ModalOptions } from 'flowbite'
import { IOperation, IOperationDetail, IProduct, ITypeAffectation } from "@/app/types";
import { gql, useLazyQuery } from "@apollo/client";

const PRODUCT_DETAIL_QUERY = gql`
    query ($productId: Int!) {
        productDetailByProductId(productId: $productId) {
            remainingQuantity
            priceWithoutIgv1
            priceWithIgv1
            productTariffId1
            typeAffectationId
        }
    }
`;

function SaleDetailForm({ modalAddDetail, setModalAddDetail, product, setProduct, saleDetail, setSaleDetail, sale, setSale, jwtToken, initialStateProduct, initialStateSaleDetail, typeAffectationsData, productsData }: any) {

    const getAuthContext = () => ({
        headers: {
            "Content-Type": "application/json",
            "Authorization": jwtToken ? `JWT ${jwtToken}` : "",
        },
    });

    const [productDetailQuery] = useLazyQuery(PRODUCT_DETAIL_QUERY);

    // useEffect(() => {
    //     if(Number(saleDetail.productId)>0)
    //     console.log(" useEffect saleDetail", saleDetail)
    // }, [saleDetail.productId]);

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
        if (Number(product.id) > 0) {
            productDetailQuery({
                context: getAuthContext(),
                variables: { productId: Number(product.id) },
                fetchPolicy: 'network-only',  // Siempre hace una nueva consulta ignorando el caché
                onCompleted: (data) => {
                    const productDetail = data.productDetailByProductId;
                    if (productDetail) {
                        let totalValue = (Number(productDetail.priceWithoutIgv1) * Number(saleDetail.quantity)) - Number(saleDetail.totalDiscount);
                        let foundTypeAffectation = typeAffectationsData?.allTypeAffectations?.find((ta: ITypeAffectation) => Number(ta.id) === Number(productDetail.typeAffectationId))
                        let code = foundTypeAffectation !== null ? foundTypeAffectation.code : "10";
                        let igvPercentage = code === "10" ? Number(sale.igvType) : 0;
                        let totalIgv = totalValue * igvPercentage * 0.01;
                        let totalAmount = totalValue + totalIgv;
                        setSaleDetail({
                            ...saleDetail,
                            productTariffId: Number(productDetail.productTariffId1),
                            productId: Number(product.id),
                            productName: product.name,
                            unitValue: Number(productDetail.priceWithoutIgv1).toFixed(2),
                            unitPrice: Number(productDetail.priceWithIgv1).toFixed(2),
                            igvPercentage: Number(igvPercentage).toFixed(2),
                            totalValue: Number(totalValue).toFixed(2),
                            totalIgv: Number(totalIgv).toFixed(2),
                            totalAmount: Number(totalAmount).toFixed(2),
                            remainingQuantity: Number(productDetail.remainingQuantity),
                            typeAffectationId: Number(productDetail.typeAffectationId)
                        });
                    }
                },

                onError: (err) => console.error("Error in products:", err),
            });
        }
    }, [product.id]);


    const handleInputChangeSaleDetail = async (event: ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;

        if (name === "productName" && event.target instanceof HTMLInputElement) {
            const dataList = event.target.list;
            if (dataList) {
                const option = Array.from(dataList.options).find(option => option.value === value);

                if (option) {

                    const selectedId = option.getAttribute("data-key");
                    const selectedValue = option.getAttribute("value");
                    // console.log("option", option, selectedId, selectedValue)
                    // setSaleDetail({ ...saleDetail, productId: Number(selectedId), productName: value });
                    setProduct({ ...product, id: Number(selectedId), name: selectedValue });

                } else {
                    // setSaleDetail({ ...saleDetail, [name]: value, productId: 0 });
                    setProduct({ ...product, id: 0, name: "" });
                }
            } else {
                console.log('sin datalist')
            }
        } else if (name === "quantity") {
            let totalValue = (Number(saleDetail.unitValue) * Number(value)) - Number(saleDetail.totalDiscount);
            let foundTypeAffectation = typeAffectationsData?.allTypeAffectations?.find((ta: ITypeAffectation) => Number(ta.id) === Number(saleDetail.typeAffectationId))
            let code = foundTypeAffectation !== null ? foundTypeAffectation.code : "10";
            let igvPercentage = code === "10" ? Number(sale.igvType) : 0;
            let totalIgv = totalValue * igvPercentage * 0.01;
            let totalAmount = totalValue + totalIgv;
            const formattedValue = value.replace(/[^0-9]/g, '').slice(0, 6);
            // const numberValue = Number(formattedValue);
            setSaleDetail({
                ...saleDetail,
                quantity: formattedValue,
                totalValue: Number(totalValue).toFixed(2),
                totalIgv: Number(totalIgv).toFixed(2),
                totalAmount: Number(totalAmount).toFixed(2)
            });
        } else if (name === "totalDiscount") {
            let totalValue = (Number(saleDetail.unitValue) * Number(saleDetail.quantity)) - Number(value);
            let foundTypeAffectation = typeAffectationsData?.allTypeAffectations?.find((ta: ITypeAffectation) => Number(ta.id) === Number(saleDetail.typeAffectationId))
            let code = foundTypeAffectation !== null ? foundTypeAffectation.code : "10";
            let igvPercentage = code === "10" ? Number(sale.igvType) : 0;
            let totalIgv = totalValue * igvPercentage * 0.01;
            let totalAmount = totalValue + totalIgv;
            // Limitar a 6 dígitos enteros y 2 decimales (máximo 999999.99)
            let formattedValue = value.replace(/[^0-9.]/g, '').slice(0, 9);
            // Asegurar un solo punto decimal y máximo 2 decimales
            const hasDecimal = formattedValue.indexOf('.') !== -1;
            if (hasDecimal) {
                formattedValue = formattedValue.slice(0, formattedValue.indexOf('.') + 3);
            }

            setSaleDetail({
                ...saleDetail,
                totalDiscount: formattedValue,
                totalValue: Number(totalValue).toFixed(2),
                totalIgv: Number(totalIgv).toFixed(2),
                totalAmount: Number(totalAmount).toFixed(2)
            });


        } else if (name === "typeAffectationId") {

            let foundTypeAffectation = typeAffectationsData?.allTypeAffectations?.find((ta: ITypeAffectation) => Number(ta.id) === Number(value))
            let code = foundTypeAffectation !== null ? foundTypeAffectation.code : "10";
            let igvPercentage = code === "10" ? Number(sale.igvType) : 0;
            let totalIgv = saleDetail.totalValue * igvPercentage * 0.01;
            let totalAmount = saleDetail.totalValue + totalIgv;
            setSaleDetail({ ...saleDetail, [name]: value, igvPercentage: igvPercentage, totalIgv: totalIgv, totalAmount: totalAmount });
        } else
            setSaleDetail({ ...saleDetail, [name]: value });
    }

    const handleAddDetail = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (saleDetail?.typeAffectationId === 0) {
            toast('Por favor ingrese un tipo de afectacion.', { hideProgressBar: true, autoClose: 2000, type: 'warning' })
            return;
        }
        if (Number(saleDetail?.quantity) === 0) {
            toast('Por favor ingrese una cantidad.', { hideProgressBar: true, autoClose: 2000, type: 'warning' })
            return;
        }
        if (Number(saleDetail?.temporaryId) > 0) {

            // Combina la eliminación y la edición en una sola operación
            const newSaleDetail = { ...saleDetail, temporaryId: saleDetail.temporaryId };

            setSale((prevSale: IOperation) => ({
                ...prevSale,
                operationdetailSet: prevSale?.operationdetailSet?.map((detail: IOperationDetail) =>
                    detail.temporaryId === newSaleDetail.temporaryId ? newSaleDetail : detail
                )
            }));

        } else {
            let newSaleDetail = { ...saleDetail, temporaryId: sale.operationdetailSet.length + 1 };
            setSale((prevsale: IOperation) => ({ ...prevsale, operationdetailSet: [...prevsale.operationdetailSet!, newSaleDetail] }));

        }

        setSaleDetail(initialStateSaleDetail);
        setProduct(initialStateProduct);
        modalAddDetail.hide();
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
                                Detalle de la LINEA o ITEM {saleDetail.temporaryId}
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
                                        <label className="form-label">Producto - Servicio (CATÁLOGO)</label>
                                        <input type="text" name="productName" maxLength={100}
                                            onFocus={(e) => e.target.select()}
                                            value={product.name}
                                            onChange={handleInputChangeSaleDetail}
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
                                        value={saleDetail.priceWithoutIgv3}
                                        onChange={handleInputChangesaleDetail} onFocus={(e) => e.target.select()}
                                        className="form-control" />
                                </div> */}

                                    <div className="sm:col-span-2">
                                        <label htmlFor="remainingQuantity" className="form-label">Stock actual disponible</label>
                                        <input type="number" name="remainingQuantity"
                                            onWheel={(e) => e.currentTarget.blur()}
                                            value={saleDetail.remainingQuantity}
                                            onChange={handleInputChangeSaleDetail} onFocus={(e) => e.target.select()}
                                            className="form-control cursor-not-allowed" />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label htmlFor="quantity" className="form-label">Cantidad</label>
                                        <input type="number" name="quantity"
                                            onWheel={(e) => e.currentTarget.blur()}
                                            value={saleDetail.quantity}
                                            onChange={handleInputChangeSaleDetail} onFocus={(e) => e.target.select()}
                                            className="form-control" required />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label htmlFor="unitValue" className="form-label">VALOR Unit. (Sin IGV)</label>
                                        <input type="number" name="unitValue"
                                            onWheel={(e) => e.currentTarget.blur()}
                                            value={saleDetail.unitValue}
                                            onChange={handleInputChangeSaleDetail} onFocus={(e) => e.target.select()}
                                            className="form-control cursor-not-allowed" />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label htmlFor="totalValue" className="form-label">Subtotal</label>
                                        <input type="number" name="totalValue"
                                            onWheel={(e) => e.currentTarget.blur()}
                                            value={saleDetail.totalValue}
                                            readOnly
                                            onChange={handleInputChangeSaleDetail} onFocus={(e) => e.target.select()}
                                            className="form-control cursor-not-allowed" />
                                    </div>

                                    <div className="sm:col-span-2"></div>

                                    <div className="sm:col-span-2">
                                        <label htmlFor="totalDiscount" className="form-label">Descuento por Item <span className=" text-xs">(aplica al Subtotal)</span></label>
                                        <input type="number" name="totalDiscount"
                                            onWheel={(e) => e.currentTarget.blur()}
                                            value={saleDetail.totalDiscount}
                                            onChange={handleInputChangeSaleDetail} onFocus={(e) => e.target.select()}
                                            className="form-control" />
                                    </div>

                                    <div className="sm:col-span-2"></div>

                                    <div className="sm:col-span-2">
                                        <label htmlFor="typeAffectationId" className="form-label">Tipo IGV</label>
                                        <select name="typeAffectationId" id="typeAffectationId" onChange={handleInputChangeSaleDetail} value={saleDetail.typeAffectationId} className="form-control" required>
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
                                            value={saleDetail.totalIgv}
                                            onChange={handleInputChangeSaleDetail} onFocus={(e) => e.target.select()}
                                            className="form-control cursor-not-allowed" />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label htmlFor="totalAmount" className="form-label">Total</label>
                                        <input type="number" name="totalAmount"
                                            onWheel={(e) => e.currentTarget.blur()}
                                            value={saleDetail.totalAmount}
                                            onChange={handleInputChangeSaleDetail} onFocus={(e) => e.target.select()}
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

export default SaleDetailForm
