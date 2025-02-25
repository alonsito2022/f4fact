import { ChangeEvent, FormEvent, useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import Save from "@/components/icons/Save";
import { Modal, ModalOptions } from "flowbite";
import {
    IOperation,
    IOperationDetail,
    IProduct,
    ITypeAffectation,
} from "@/app/types";
import { gql, useLazyQuery } from "@apollo/client";

const PRODUCT_DETAIL_QUERY = gql`
    query ($productId: Int!) {
        productDetailByProductId(productId: $productId) {
            remainingQuantity
            priceWithoutIgv3
            priceWithIgv3
            productTariffId3
            typeAffectationId
        }
    }
`;

function SaleDetailForm({
    modalAddDetail,
    setModalAddDetail,
    product,
    setProduct,
    invoiceDetail,
    setInvoiceDetail,
    invoice,
    setInvoice,
    jwtToken,
    initialStateProduct,
    initialStateSaleDetail,
    typeAffectationsData,
    productsData,
}: any) {
    // const modalRef = useRef<HTMLDivElement>(null);
    const getAuthContext = () => ({
        headers: {
            "Content-Type": "application/json",
            Authorization: jwtToken ? `JWT ${jwtToken}` : "",
        },
    });

    const [productDetailQuery] = useLazyQuery(PRODUCT_DETAIL_QUERY);

    // useEffect(() => {
    //     if(Number(invoiceDetail.productId)>0)
    //     console.log(" useEffect invoiceDetail", invoiceDetail)
    // }, [invoiceDetail.productId]);

    useEffect(() => {
        if (modalAddDetail == null) {
            const $targetEl = document.getElementById("modalAddDetail");
            const options: ModalOptions = {
                placement: "top-center",
                backdrop: "static",
                backdropClasses:
                    "bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40",
                closable: false,
            };
            setModalAddDetail(new Modal($targetEl, options));
        }
    }, [modalAddDetail, setModalAddDetail]);

    useEffect(() => {
        if (Number(product.id) > 0) {
            productDetailQuery({
                context: getAuthContext(),
                variables: { productId: Number(product.id) },
                fetchPolicy: "network-only", // Siempre hace una nueva consulta ignorando el caché
                onCompleted: (data) => {
                    const productDetail = data.productDetailByProductId;
                    if (productDetail) {
                        let totalValue =
                            Number(productDetail.priceWithoutIgv3) *
                                Number(invoiceDetail.quantity) -
                            Number(invoiceDetail.totalDiscount);
                        let foundTypeAffectation =
                            typeAffectationsData?.allTypeAffectations?.find(
                                (ta: ITypeAffectation) =>
                                    Number(ta.id) ===
                                    Number(productDetail.typeAffectationId)
                            );
                        let code =
                            foundTypeAffectation !== null
                                ? foundTypeAffectation?.code
                                : "10";
                        let igvPercentage =
                            code === "10" ? Number(invoice.igvType) : 0;
                        let totalIgv = totalValue * igvPercentage * 0.01;
                        let totalAmount = totalValue + totalIgv;
                        setInvoiceDetail({
                            ...invoiceDetail,
                            productTariffId: Number(
                                productDetail.productTariffId3
                            ),
                            productId: Number(product.id),
                            productName: product.name,
                            unitValue: Number(
                                productDetail.priceWithoutIgv3
                            ).toFixed(2),
                            unitPrice: Number(
                                productDetail.priceWithIgv3
                            ).toFixed(2),
                            igvPercentage: Number(igvPercentage).toFixed(2),
                            totalValue: Number(totalValue).toFixed(2),
                            totalIgv: Number(totalIgv).toFixed(2),
                            totalAmount: Number(totalAmount).toFixed(2),
                            remainingQuantity: Number(
                                productDetail.remainingQuantity
                            ),
                            typeAffectationId: Number(
                                productDetail.typeAffectationId
                            ),
                        });
                    }
                },

                onError: (err) => {
                    console.error("Error in products:", err);
                    toast("Error fetching product details.", {
                        hideProgressBar: true,
                        autoClose: 2000,
                        type: "error",
                    });
                },
            });
        }
    }, [
        product.id,
        productDetailQuery,
        invoice.igvType,
        invoiceDetail.quantity,
        invoiceDetail.totalDiscount,
        setInvoiceDetail,
        typeAffectationsData,
        product.name,
    ]);

    // useEffect(() => {
    //     if (modalRef.current) {
    //         modalRef.current.setAttribute(
    //             "inert",
    //             modalAddDetail?.isVisible() ? "false" : "true"
    //         );
    //     }
    // }, [modalAddDetail?.isVisible()]);
    const handleInputChangeSaleDetail = async (
        event: ChangeEvent<
            HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = event.target;

        if (
            name === "productName" &&
            event.target instanceof HTMLInputElement
        ) {
            const dataList = event.target.list;
            if (dataList) {
                const option = Array.from(dataList.options).find(
                    (option) => option.value === value
                );

                if (option) {
                    const selectedId = option.getAttribute("data-key");
                    const selectedValue = option.getAttribute("value");
                    // console.log("option", option, selectedId, selectedValue)
                    // setInvoiceDetail({ ...invoiceDetail, productId: Number(selectedId), productName: value });
                    setProduct({
                        ...product,
                        id: Number(selectedId),
                        name: selectedValue,
                    });
                } else {
                    // setInvoiceDetail({ ...invoiceDetail, [name]: value, productId: 0 });
                    setProduct({ ...product, id: 0, name: "" });
                }
            } else {
                console.log("sin datalist");
            }
        } else if (name === "quantity") {
            if (invoice?.documentType === "07") {
                if (Number(value) > Number(invoiceDetail?.quantityAvailable)) {
                    toast(
                        "La cantidad no puede ser mayor al máximo permitido.",
                        {
                            hideProgressBar: true,
                            autoClose: 2000,
                            type: "warning",
                        }
                    );
                    return;
                }
            }
            const formattedValue = value.replace(/[^0-9]/g, "").slice(0, 6);
            const numberValue = Number(formattedValue);
            let totalValue =
                Number(invoiceDetail.unitValue) * numberValue -
                Number(invoiceDetail.totalDiscount);

            let foundTypeAffectation =
                typeAffectationsData?.allTypeAffectations?.find(
                    (ta: ITypeAffectation) =>
                        Number(ta.id) ===
                        Number(invoiceDetail.typeAffectationId)
                );

            let code = foundTypeAffectation ? foundTypeAffectation.code : "10";
            let igvPercentage = code === "10" ? Number(invoice.igvType) : 0;
            let totalIgv = totalValue * igvPercentage * 0.01;
            let totalAmount = totalValue + totalIgv;
            setInvoiceDetail({
                ...invoiceDetail,
                quantity: formattedValue,
                totalValue: Number(totalValue).toFixed(2),
                totalIgv: Number(totalIgv).toFixed(2),
                totalAmount: Number(totalAmount).toFixed(2),
            });
        } else if (name === "totalDiscount") {
            let totalValue =
                Number(invoiceDetail.unitValue) *
                    Number(invoiceDetail.quantity) -
                Number(value);
            let foundTypeAffectation =
                typeAffectationsData?.allTypeAffectations?.find(
                    (ta: ITypeAffectation) =>
                        Number(ta.id) ===
                        Number(invoiceDetail.typeAffectationId)
                );
            let code =
                foundTypeAffectation !== null
                    ? foundTypeAffectation.code
                    : "10";
            let igvPercentage = code === "10" ? Number(invoice.igvType) : 0;
            let totalIgv = totalValue * igvPercentage * 0.01;
            let totalAmount = totalValue + totalIgv;
            // Limitar a 6 dígitos enteros y 2 decimales (máximo 999999.99)
            let formattedValue = value.replace(/[^0-9.]/g, "").slice(0, 9);
            // Asegurar un solo punto decimal y máximo 2 decimales
            const hasDecimal = formattedValue.indexOf(".") !== -1;
            if (hasDecimal) {
                formattedValue = formattedValue.slice(
                    0,
                    formattedValue.indexOf(".") + 3
                );
            }

            setInvoiceDetail({
                ...invoiceDetail,
                totalDiscount: formattedValue,
                totalValue: Number(totalValue).toFixed(2),
                totalIgv: Number(totalIgv).toFixed(2),
                totalAmount: Number(totalAmount).toFixed(2),
            });
        } else if (name === "typeAffectationId") {
            let foundTypeAffectation =
                typeAffectationsData?.allTypeAffectations?.find(
                    (ta: ITypeAffectation) => Number(ta.id) === Number(value)
                );
            let code =
                foundTypeAffectation !== null
                    ? foundTypeAffectation.code
                    : "10";
            let igvPercentage = code === "10" ? Number(invoice.igvType) : 0;
            let totalIgv = invoiceDetail.totalValue * igvPercentage * 0.01;
            let totalAmount = invoiceDetail.totalValue + totalIgv;
            setInvoiceDetail({
                ...invoiceDetail,
                [name]: value,
                igvPercentage: igvPercentage,
                totalIgv: totalIgv,
                totalAmount: totalAmount,
            });
        } else setInvoiceDetail({ ...invoiceDetail, [name]: value });
    };

    const handleAddDetail = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (invoiceDetail?.typeAffectationId === 0) {
            toast("Por favor ingrese un tipo de afectacion.", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
            });
            return;
        }
        if (Number(invoiceDetail?.quantity) === 0) {
            toast("Por favor ingrese una cantidad.", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
            });
            return;
        }
        if (Number(invoiceDetail?.temporaryId) > 0) {
            // Combina la eliminación y la edición en una sola operación
            const newSaleDetail = {
                ...invoiceDetail,
                temporaryId: invoiceDetail.temporaryId,
            };

            setInvoice((prevSale: IOperation) => ({
                ...prevSale,
                operationdetailSet: prevSale?.operationdetailSet?.map(
                    (detail: IOperationDetail) =>
                        detail.temporaryId === newSaleDetail.temporaryId
                            ? newSaleDetail
                            : detail
                ),
            }));
        } else {
            let newSaleDetail = {
                ...invoiceDetail,
                temporaryId: invoice.operationdetailSet.length + 1,
            };
            setInvoice((previnvoice: IOperation) => ({
                ...previnvoice,
                operationdetailSet: [
                    ...previnvoice.operationdetailSet!,
                    newSaleDetail,
                ],
            }));
        }

        setInvoiceDetail(initialStateSaleDetail);
        setProduct(initialStateProduct);
        modalAddDetail.hide();
    };

    return (
        <>
            {/* Large Modal */}
            <div
                id="modalAddDetail"
                // ref={modalRef}
                tabIndex={-1}
                className="fixed top-0 left-0 right-0 z-50 hidden w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"
            >
                <div className="relative w-full max-w-4xl max-h-full">
                    {/* Modal content */}
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                        {/* Modal header */}
                        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                            <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                                Detalle de la LINEA o ITEM{" "}
                                {invoiceDetail.temporaryId}
                            </h3>
                            <button
                                type="button"
                                onClick={() => {
                                    modalAddDetail.hide();
                                }}
                                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                            >
                                <svg
                                    className="w-3 h-3"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 14 14"
                                >
                                    <path
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                                    />
                                </svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>
                        {/* Modal body */}

                        <form onSubmit={handleAddDetail}>
                            <div className="p-4 md:p-5 space-y-4">
                                <div className="grid sm:grid-cols-1 md:grid-cols-6 gap-4">
                                    <div className="sm:col-span-4">
                                        <label className="form-label text-gray-900 dark:text-gray-200">
                                            Producto - Servicio (CATÁLOGO)
                                        </label>
                                        <input
                                            type="text"
                                            name="productName"
                                            maxLength={100}
                                            onFocus={(e) => e.target.select()}
                                            value={product.name}
                                            onChange={
                                                handleInputChangeSaleDetail
                                            }
                                            className="form-control dark:bg-gray-800 dark:text-gray-200"
                                            list="productList"
                                            autoComplete="off"
                                            required
                                        />
                                        <datalist id="productList">
                                            {productsData?.allProducts?.map(
                                                (
                                                    n: IProduct,
                                                    index: number
                                                ) => (
                                                    <option
                                                        key={index}
                                                        data-key={n.id}
                                                        value={n.name}
                                                    />
                                                )
                                            )}
                                        </datalist>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label
                                            htmlFor="remainingQuantity"
                                            className="form-label text-gray-900 dark:text-gray-200"
                                        >
                                            Stock actual disponible
                                        </label>
                                        <input
                                            type="number"
                                            name="remainingQuantity"
                                            onWheel={(e) =>
                                                e.currentTarget.blur()
                                            }
                                            value={
                                                invoiceDetail.remainingQuantity
                                            }
                                            onChange={
                                                handleInputChangeSaleDetail
                                            }
                                            onFocus={(e) => e.target.select()}
                                            className="form-control cursor-not-allowed dark:bg-gray-800 dark:text-gray-200"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label
                                            htmlFor="quantity"
                                            className="form-label text-gray-900 dark:text-gray-200"
                                        >
                                            Cantidad
                                        </label>
                                        <input
                                            type="number"
                                            name="quantity"
                                            onWheel={(e) =>
                                                e.currentTarget.blur()
                                            }
                                            value={invoiceDetail.quantity}
                                            onChange={
                                                handleInputChangeSaleDetail
                                            }
                                            onFocus={(e) => e.target.select()}
                                            className="form-control dark:bg-gray-800 dark:text-gray-200"
                                            required
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label
                                            htmlFor="unitValue"
                                            className="form-label text-gray-900 dark:text-gray-200"
                                        >
                                            VALOR Unit. (Sin IGV)
                                        </label>
                                        <input
                                            type="number"
                                            name="unitValue"
                                            onWheel={(e) =>
                                                e.currentTarget.blur()
                                            }
                                            value={invoiceDetail.unitValue}
                                            onChange={
                                                handleInputChangeSaleDetail
                                            }
                                            onFocus={(e) => e.target.select()}
                                            className="form-control cursor-not-allowed dark:bg-gray-800 dark:text-gray-200"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label
                                            htmlFor="totalValue"
                                            className="form-label text-gray-900 dark:text-gray-200"
                                        >
                                            Subtotal
                                        </label>
                                        <input
                                            type="number"
                                            name="totalValue"
                                            onWheel={(e) =>
                                                e.currentTarget.blur()
                                            }
                                            value={invoiceDetail.totalValue}
                                            readOnly
                                            onChange={
                                                handleInputChangeSaleDetail
                                            }
                                            onFocus={(e) => e.target.select()}
                                            className="form-control cursor-not-allowed dark:bg-gray-800 dark:text-gray-200"
                                        />
                                    </div>

                                    <div className="sm:col-span-2"></div>

                                    <div className="sm:col-span-2">
                                        <label
                                            htmlFor="totalDiscount"
                                            className="form-label text-gray-900 dark:text-gray-200"
                                        >
                                            Descuento por Item{" "}
                                            <span className="text-xs">
                                                (aplica al Subtotal)
                                            </span>
                                        </label>
                                        <input
                                            type="number"
                                            name="totalDiscount"
                                            onWheel={(e) =>
                                                e.currentTarget.blur()
                                            }
                                            value={invoiceDetail.totalDiscount}
                                            onChange={
                                                handleInputChangeSaleDetail
                                            }
                                            onFocus={(e) => e.target.select()}
                                            className="form-control dark:bg-gray-800 dark:text-gray-200"
                                        />
                                    </div>

                                    <div className="sm:col-span-2"></div>

                                    <div className="sm:col-span-2">
                                        <label
                                            htmlFor="typeAffectationId"
                                            className="form-label text-gray-900 dark:text-gray-200"
                                        >
                                            Tipo IGV
                                        </label>
                                        <select
                                            name="typeAffectationId"
                                            id="typeAffectationId"
                                            onChange={
                                                handleInputChangeSaleDetail
                                            }
                                            value={
                                                invoiceDetail.typeAffectationId
                                            }
                                            className="form-control dark:bg-gray-800 dark:text-gray-200"
                                            required
                                        >
                                            <option value={0}>
                                                Elegir tipo de afectacion
                                            </option>
                                            {typeAffectationsData?.allTypeAffectations?.map(
                                                (
                                                    o: ITypeAffectation,
                                                    k: number
                                                ) => (
                                                    <option
                                                        key={k}
                                                        value={o.id}
                                                    >
                                                        {o.name}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label
                                            htmlFor="totalIgv"
                                            className="form-label text-gray-900 dark:text-gray-200"
                                        >
                                            IGV de la linea
                                        </label>
                                        <input
                                            type="number"
                                            name="totalIgv"
                                            onWheel={(e) =>
                                                e.currentTarget.blur()
                                            }
                                            value={invoiceDetail.totalIgv}
                                            onChange={
                                                handleInputChangeSaleDetail
                                            }
                                            onFocus={(e) => e.target.select()}
                                            className="form-control cursor-not-allowed dark:bg-gray-800 dark:text-gray-200"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label
                                            htmlFor="totalAmount"
                                            className="form-label text-gray-900 dark:text-gray-200"
                                        >
                                            Total
                                        </label>
                                        <input
                                            type="number"
                                            name="totalAmount"
                                            onWheel={(e) =>
                                                e.currentTarget.blur()
                                            }
                                            value={invoiceDetail.totalAmount}
                                            onChange={
                                                handleInputChangeSaleDetail
                                            }
                                            onFocus={(e) => e.target.select()}
                                            className="form-control cursor-not-allowed dark:bg-gray-800 dark:text-gray-200"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Modal footer */}
                            <div className="flex items-center p-4 md:p-5 space-x-3 rtl:space-x-reverse border-t border-gray-200 rounded-b dark:border-gray-600">
                                <button
                                    type="button"
                                    onClick={() => {
                                        modalAddDetail.hide();
                                    }}
                                    className="btn-dark px-5 py-2 inline-flex items-center gap-2 dark:bg-gray-800 dark:text-gray-200"
                                >
                                    Cerrar
                                </button>
                                <button
                                    type="submit"
                                    className="btn-green px-5 py-2 inline-flex items-center gap-2 dark:bg-green-700 dark:text-gray-200"
                                >
                                    <Save /> Aceptar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

export default SaleDetailForm;
