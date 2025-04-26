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
import {
    DocumentNode,
    gql,
    skipToken,
    useLazyQuery,
    useMutation,
} from "@apollo/client";

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

const UPDATE_PRODUCT_TARIFF_PRICE = gql`
    mutation UpdatePrice(
        $id: ID!
        $priceWithIgv: Float!
        $priceWithoutIgv: Float!
    ) {
        updatePrice(
            id: $id
            priceWithIgv: $priceWithIgv
            priceWithoutIgv: $priceWithoutIgv
        ) {
            message
            error
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
    auth,
    initialStateProduct,
    initialStateSaleDetail,
    typeAffectationsData,
    productsData,
}: any) {
    // const modalRef = useRef<HTMLDivElement>(null);
    const getAuthContext = () => ({
        headers: {
            "Content-Type": "application/json",
            Authorization: auth?.jwtToken ? `JWT ${auth?.jwtToken}` : "",
        },
    });
    function useCustomMutation(mutation: DocumentNode) {
        return useMutation(mutation, {
            context: getAuthContext(),
            onError: (err) => console.error("Error of sent:", err), // Log the error for debugging
        });
    }

    const [updateProducTariff] = useCustomMutation(UPDATE_PRODUCT_TARIFF_PRICE);

    const [productDetailQuery] = useLazyQuery(PRODUCT_DETAIL_QUERY);
    // Add ref for the close button
    const closeButtonRef = useRef<HTMLButtonElement>(null);

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
        if (Number(product.id) > 0 && Number(invoiceDetail.id) === 0) {
            productDetailQuery({
                context: getAuthContext(),
                variables: { productId: Number(product.id) },
                fetchPolicy: "network-only", // Siempre hace una nueva consulta ignorando el caché
                onCompleted: (data) => {
                    const productDetail = data.productDetailByProductId;
                    if (productDetail) {
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
                        // Calculate priceWithoutIgv instead of modifying productDetail
                        const calculatedPriceWithoutIgv =
                            productDetail.priceWithIgv3 /
                            (1 + igvPercentage * 0.01);

                        let totalValue =
                            calculatedPriceWithoutIgv *
                                Number(invoiceDetail.quantity) -
                            Number(invoiceDetail.totalDiscount);

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
                                calculatedPriceWithoutIgv
                            ).toFixed(6),
                            unitPrice: Number(
                                productDetail.priceWithIgv3
                            ).toFixed(6),
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
    }, [invoiceDetail.id, product.id]);

    // Add this new helper function
    const calculateBasedOnIgv = (
        quantity: number,
        unitPrice: number,
        unitValue: number,
        totalDiscount: number,
        igvPercentage: number,
        includeIgv: boolean
    ) => {
        let totalValue: number;
        let totalAmount: number;
        let totalIgv: number;

        totalValue = quantity * unitValue - totalDiscount;
        totalAmount = totalValue * (1 + igvPercentage * 0.01);
        totalIgv = totalAmount - totalValue;

        return { totalValue, totalAmount, totalIgv };
    };

    const handleInputChangeSaleDetail = async (
        event: ChangeEvent<
            HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = event.target;
        const includeIgv = auth?.user?.companyIncludeIgv;
        if (
            name === "productName" &&
            event.target instanceof HTMLInputElement
        ) {
            handleProductNameChange(event.target);
            return;
        }

        if (name === "quantity") {
            if (!validateQuantity(value)) return;

            // const quantity = Number(value.replace(/[^0-9.]/g, ""));
            const [integerPart, decimalPart] = value.split(".");
            const formattedQuantity = decimalPart
                ? `${integerPart.slice(0, 6)}.${decimalPart.slice(0, 4)}`
                : integerPart.slice(0, 6);
            const foundTypeAffectation =
                typeAffectationsData?.allTypeAffectations?.find(
                    (ta: ITypeAffectation) =>
                        Number(ta.id) ===
                        Number(invoiceDetail.typeAffectationId)
                );
            const code = foundTypeAffectation?.code ?? "10";
            const igvPercentage = code === "10" ? Number(invoice.igvType) : 0;

            const { totalValue, totalAmount, totalIgv } = calculateBasedOnIgv(
                Number(formattedQuantity),
                Number(invoiceDetail.unitPrice),
                Number(invoiceDetail.unitValue),
                Number(invoiceDetail.totalDiscount),
                igvPercentage,
                includeIgv
            );

            setInvoiceDetail({
                ...invoiceDetail,
                quantity: formattedQuantity,
                totalValue: totalValue.toFixed(2),
                totalIgv: totalIgv.toFixed(2),
                totalAmount: totalAmount.toFixed(2),
            });
            return;
        }

        if (name === "unitPrice") {
            const foundTypeAffectation =
                typeAffectationsData?.allTypeAffectations?.find(
                    (ta: ITypeAffectation) =>
                        Number(ta.id) ===
                        Number(invoiceDetail.typeAffectationId)
                );
            const code = foundTypeAffectation?.code ?? "10";
            const igvPercentage = code === "10" ? Number(invoice.igvType) : 0;
            const unitValue = Number(value) / (1 + igvPercentage * 0.01);

            const { totalValue, totalAmount, totalIgv } = calculateBasedOnIgv(
                Number(invoiceDetail.quantity),
                Number(value),
                unitValue,
                Number(invoiceDetail.totalDiscount),
                igvPercentage,
                includeIgv
            );

            setInvoiceDetail({
                ...invoiceDetail,
                unitPrice: value,
                unitValue: unitValue.toFixed(6),
                totalValue: totalValue.toFixed(2),
                totalIgv: totalIgv.toFixed(2),
                totalAmount: totalAmount.toFixed(2),
            });
            return;
        }

        if (name === "unitValue") {
            const foundTypeAffectation =
                typeAffectationsData?.allTypeAffectations?.find(
                    (ta: ITypeAffectation) =>
                        Number(ta.id) ===
                        Number(invoiceDetail.typeAffectationId)
                );
            const code = foundTypeAffectation?.code ?? "10";
            const igvPercentage = code === "10" ? Number(invoice.igvType) : 0;
            const unitPrice = Number(value) * (1 + igvPercentage * 0.01);

            const { totalValue, totalAmount, totalIgv } = calculateBasedOnIgv(
                Number(invoiceDetail.quantity),
                unitPrice,
                Number(value),
                Number(invoiceDetail.totalDiscount),
                igvPercentage,
                includeIgv
            );

            setInvoiceDetail({
                ...invoiceDetail,
                unitValue: value,
                unitPrice: unitPrice.toFixed(6),
                totalValue: totalValue.toFixed(2),
                totalIgv: totalIgv.toFixed(2),
                totalAmount: totalAmount.toFixed(2),
            });
            return;
        }
        if (name === "totalDiscount") {
            const formattedDiscount = formatDiscount(value);
            const foundTypeAffectation =
                typeAffectationsData?.allTypeAffectations?.find(
                    (ta: ITypeAffectation) =>
                        Number(ta.id) ===
                        Number(invoiceDetail.typeAffectationId)
                );
            const code = foundTypeAffectation?.code ?? "10";
            const igvPercentage = code === "10" ? Number(invoice.igvType) : 0;

            const { totalValue, totalAmount, totalIgv } = calculateBasedOnIgv(
                Number(invoiceDetail.quantity),
                Number(invoiceDetail.unitPrice),
                Number(invoiceDetail.unitValue),
                Number(formattedDiscount),
                igvPercentage,
                includeIgv
            );

            setInvoiceDetail({
                ...invoiceDetail,
                totalDiscount: formattedDiscount,
                totalValue: totalValue.toFixed(2),
                totalIgv: totalIgv.toFixed(2),
                totalAmount: totalAmount.toFixed(2),
            });
            return;
        }

        if (name === "typeAffectationId") {
            const foundTypeAffectation =
                typeAffectationsData?.allTypeAffectations?.find(
                    (ta: ITypeAffectation) => Number(ta.id) === Number(value)
                );
            const code = foundTypeAffectation?.code ?? "10";
            const igvPercentage = code === "10" ? Number(invoice.igvType) : 0;

            const { totalValue, totalAmount, totalIgv } = calculateBasedOnIgv(
                Number(invoiceDetail.quantity),
                Number(invoiceDetail.unitPrice),
                Number(invoiceDetail.unitValue),
                Number(invoiceDetail.totalDiscount),
                igvPercentage,
                includeIgv
            );

            setInvoiceDetail({
                ...invoiceDetail,
                typeAffectationId: Number(value),
                igvPercentage: igvPercentage,
                totalValue: totalValue.toFixed(2),
                totalIgv: totalIgv.toFixed(2),
                totalAmount: totalAmount.toFixed(2),
            });
            return;
        }

        setInvoiceDetail({ ...invoiceDetail, [name]: value });
    };

    // Validation helpers
    const validateQuantity = (value: string): boolean => {
        if (
            invoice?.documentType === "07" &&
            Number(value) > Number(invoiceDetail?.quantityAvailable)
        ) {
            toast.warning(
                "La cantidad no puede ser mayor al máximo permitido."
            );
            return false;
        }
        return true;
    };

    const formatDiscount = (value: string): string => {
        let formatted = value.replace(/[^0-9.]/g, "").slice(0, 9);
        const hasDecimal = formatted.indexOf(".") !== -1;
        if (hasDecimal) {
            formatted = formatted.slice(0, formatted.indexOf(".") + 3);
        }
        return formatted;
    };

    const handleProductNameChange = (input: HTMLInputElement) => {
        const dataList = input.list;
        if (!dataList) {
            console.log("sin datalist");
            return;
        }

        const option = Array.from(dataList.options).find(
            (option) => option.value === input.value
        );
        console.log("option", option);

        if (option) {
            const selectedId = option.getAttribute("data-key");
            const selectedValue = option.getAttribute("value");
            setProduct({
                ...product,
                id: Number(selectedId),
                name: selectedValue,
            });
        } else {
            setProduct({ ...product, id: 0, name: "" });
        }
    };

    // Modify the modal close function
    const handleCloseModal = () => {
        // Remove focus from any element inside the modal before closing
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }

        setInvoiceDetail(initialStateSaleDetail);
        setProduct(initialStateProduct);
        modalAddDetail.hide();
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

        const variables = {
            id: Number(invoiceDetail.productTariffId),
            priceWithIgv: Number(invoiceDetail.unitPrice),
            priceWithoutIgv: Number(invoiceDetail.unitValue),
        };
        updateProducTariff({
            variables,
            // context: getAuthContext(),
            onCompleted: (data) => {
                if (data.updatePrice.error) {
                    toast.error(data.updatePrice.message);
                    return;
                }
                toast.success(data.updatePrice.message);
            },
            onError: (err) => {
                console.error("Error sending tariff:", err);
                toast.error("Error al enviar tariff");
            },
        });

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

        // Use the new close function
        handleCloseModal();
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
                                ref={closeButtonRef}
                                type="button"
                                onClick={handleCloseModal}
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
                                            Producto - Servicio (CATÁLOGO) 2
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
                                            disabled
                                        />
                                    </div>

                                    <div className="sm:col-span-6">
                                        <label
                                            htmlFor="description"
                                            className="form-label text-gray-900 dark:text-gray-200"
                                        >
                                            Detalle adicional
                                        </label>
                                        <input
                                            type="text"
                                            name="description"
                                            maxLength={300}
                                            onFocus={(e) => e.target.select()}
                                            value={invoiceDetail.description}
                                            onChange={
                                                handleInputChangeSaleDetail
                                            }
                                            className="form-control dark:bg-gray-800 dark:text-gray-200"
                                            autoComplete="off"
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
                                            autoComplete="off"
                                            required
                                        />
                                    </div>
                                    {auth?.user?.companyIncludeIgv ? (
                                        <div className="sm:col-span-2">
                                            <label
                                                htmlFor="unitPrice"
                                                className="form-label text-gray-900 dark:text-gray-200"
                                            >
                                                Precio VENTA unitario CON IGV
                                            </label>
                                            <input
                                                type="number"
                                                name="unitPrice"
                                                onWheel={(e) =>
                                                    e.currentTarget.blur()
                                                }
                                                value={invoiceDetail.unitPrice}
                                                onChange={
                                                    handleInputChangeSaleDetail
                                                }
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                autoComplete="off"
                                                className="form-control dark:bg-gray-800 dark:text-gray-200"
                                                required
                                            />
                                        </div>
                                    ) : (
                                        <div className="sm:col-span-2">
                                            <label
                                                htmlFor="unitValue"
                                                className="form-label text-gray-900 dark:text-gray-200"
                                            >
                                                VALOR VENTA unitario SIN IGV
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
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                autoComplete="off"
                                                className="form-control dark:bg-gray-800 dark:text-gray-200"
                                            />
                                        </div>
                                    )}

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
                                            disabled
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
                                            disabled
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Modal footer */}
                            <div className="flex items-center p-4 md:p-5 space-x-3 rtl:space-x-reverse border-t border-gray-200 rounded-b dark:border-gray-600">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
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
