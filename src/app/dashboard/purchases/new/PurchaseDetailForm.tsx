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
import { DocumentNode, gql, useLazyQuery, useMutation } from "@apollo/client";

const PRODUCT_DETAIL_QUERY = gql`
    query ($productId: Int!) {
        productDetailByProductId(productId: $productId) {
            stock
            priceWithoutIgv1
            priceWithIgv1
            productTariffId1
            typeAffectationId
        }
    }
`;

const UPDATE_PRODUCT_TARIFF_MUTATION = gql`
    mutation UpdateProductTariff(
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

function PurchaseDetailForm({
    modalAddDetail,
    setModalAddDetail,
    product,
    setProduct,
    purchaseDetail,
    setPurchaseDetail,
    purchase,
    setPurchase,
    initialStateProduct,
    initialStatePurchaseDetail,
    typeAffectationsData,
    productsData,
    auth,
}: any) {
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

    const [updateProductTariff] = useCustomMutation(
        UPDATE_PRODUCT_TARIFF_MUTATION
    );
    const [productDetailQuery] = useLazyQuery(PRODUCT_DETAIL_QUERY);

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
        if (Number(product.id) > 0 && Number(purchaseDetail.id) === 0) {
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
                                ? foundTypeAffectation.code
                                : "10";
                        let igvPercentage =
                            code === "10" ? Number(purchase.igvType) : 0;
                        const calculatedPriceWithoutIgv =
                            productDetail.priceWithIgv1 /
                            (1 + igvPercentage * 0.01);
                        let totalValue =
                            calculatedPriceWithoutIgv *
                                Number(purchaseDetail.quantity) -
                            Number(purchaseDetail.totalDiscount);

                        let totalIgv = totalValue * igvPercentage * 0.01;
                        let totalAmount = totalValue + totalIgv;
                        setPurchaseDetail({
                            ...purchaseDetail,
                            productTariffId: Number(
                                productDetail.productTariffId1
                            ),
                            productId: Number(product.id),
                            productName: product.name,
                            unitValue: Number(
                                calculatedPriceWithoutIgv
                            ).toFixed(2),
                            unitPrice: Number(
                                productDetail.priceWithIgv1
                            ).toFixed(2),
                            igvPercentage: Number(igvPercentage).toFixed(2),
                            totalValue: Number(totalValue).toFixed(2),
                            totalIgv: Number(totalIgv).toFixed(2),
                            totalAmount: Number(totalAmount).toFixed(2),
                            stock: Number(productDetail.stock),
                            typeAffectationId: Number(
                                productDetail.typeAffectationId
                            ),
                        });
                    }
                },
                onError: (err) => {
                    console.error("Error in products:", err);
                    toast("Error al obtener los detalles del producto.", {
                        hideProgressBar: true,
                        autoClose: 2000,
                        type: "error",
                    });
                },
            });
        }
    }, [purchaseDetail.id, product.id]);

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

    // Validation helpers
    const validateQuantity = (value: string): boolean => {
        if (Number(value) > Number(purchaseDetail?.stock)) {
            toast.warning(
                "La cantidad no puede ser mayor al stock disponible."
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

    const handleInputChangePurchaseDetail = async (
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
            const [integerPart, decimalPart] = value.split(".");
            const formattedQuantity = decimalPart
                ? `${integerPart.slice(0, 6)}.${decimalPart.slice(0, 4)}`
                : integerPart.slice(0, 6);

            const foundTypeAffectation =
                typeAffectationsData?.allTypeAffectations?.find(
                    (ta: ITypeAffectation) =>
                        Number(ta.id) ===
                        Number(purchaseDetail.typeAffectationId)
                );
            const code = foundTypeAffectation?.code ?? "10";
            const igvPercentage = code === "10" ? Number(purchase.igvType) : 0;

            const { totalValue, totalAmount, totalIgv } = calculateBasedOnIgv(
                Number(formattedQuantity),
                Number(purchaseDetail.unitPrice),
                Number(purchaseDetail.unitValue),
                Number(purchaseDetail.totalDiscount),
                igvPercentage,
                includeIgv
            );

            if (Number(value) < 0) {
                toast.warning("La cantidad no puede ser negativa.");
                return false;
            }

            setPurchaseDetail({
                ...purchaseDetail,
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
                        Number(purchaseDetail.typeAffectationId)
                );
            const code = foundTypeAffectation?.code ?? "10";
            const igvPercentage = code === "10" ? Number(purchase.igvType) : 0;
            const unitValue = Number(value) / (1 + igvPercentage * 0.01);

            const { totalValue, totalAmount, totalIgv } = calculateBasedOnIgv(
                Number(purchaseDetail.quantity),
                Number(value),
                unitValue,
                Number(purchaseDetail.totalDiscount),
                igvPercentage,
                includeIgv
            );

            setPurchaseDetail({
                ...purchaseDetail,
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
                        Number(purchaseDetail.typeAffectationId)
                );
            const code = foundTypeAffectation?.code ?? "10";
            const igvPercentage = code === "10" ? Number(purchase.igvType) : 0;
            const unitPrice = Number(value) * (1 + igvPercentage * 0.01);

            const { totalValue, totalAmount, totalIgv } = calculateBasedOnIgv(
                Number(purchaseDetail.quantity),
                unitPrice,
                Number(value),
                Number(purchaseDetail.totalDiscount),
                igvPercentage,
                includeIgv
            );

            setPurchaseDetail({
                ...purchaseDetail,
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
                        Number(purchaseDetail.typeAffectationId)
                );
            const code = foundTypeAffectation?.code ?? "10";
            const igvPercentage = code === "10" ? Number(purchase.igvType) : 0;

            const { totalValue, totalAmount, totalIgv } = calculateBasedOnIgv(
                Number(purchaseDetail.quantity),
                Number(purchaseDetail.unitPrice),
                Number(purchaseDetail.unitValue),
                Number(formattedDiscount),
                igvPercentage,
                includeIgv
            );

            setPurchaseDetail({
                ...purchaseDetail,
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
            const igvPercentage = code === "10" ? Number(purchase.igvType) : 0;

            const { totalValue, totalAmount, totalIgv } = calculateBasedOnIgv(
                Number(purchaseDetail.quantity),
                Number(purchaseDetail.unitPrice),
                Number(purchaseDetail.unitValue),
                Number(purchaseDetail.totalDiscount),
                igvPercentage,
                includeIgv
            );

            setPurchaseDetail({
                ...purchaseDetail,
                typeAffectationId: Number(value),
                igvPercentage: igvPercentage,
                totalValue: totalValue.toFixed(2),
                totalIgv: totalIgv.toFixed(2),
                totalAmount: totalAmount.toFixed(2),
            });
            return;
        }

        setPurchaseDetail({ ...purchaseDetail, [name]: value });
    };

    const handleAddDetail = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (purchaseDetail?.typeAffectationId === 0) {
            toast("Por favor ingrese un tipo de afectacion.", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
            });
            return;
        }
        if (Number(purchaseDetail?.quantity) === 0) {
            toast("Por favor ingrese una cantidad.", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
            });
            return;
        }

        const variables = {
            id: Number(purchaseDetail.productTariffId),
            priceWithIgv: Number(purchaseDetail.unitPrice),
            priceWithoutIgv: Number(purchaseDetail.unitValue),
        };
        updateProductTariff({
            variables,
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

        if (Number(purchaseDetail?.temporaryId) > 0) {
            const newPurchaseDetail = {
                ...purchaseDetail,
                temporaryId: purchaseDetail.temporaryId,
            };

            setPurchase((prevPurchase: IOperation) => ({
                ...prevPurchase,
                operationdetailSet: prevPurchase?.operationdetailSet?.map(
                    (detail: IOperationDetail) =>
                        detail.temporaryId === newPurchaseDetail.temporaryId
                            ? newPurchaseDetail
                            : detail
                ),
            }));
        } else {
            let newPurchaseDetail = {
                ...purchaseDetail,
                temporaryId: purchase.operationdetailSet.length + 1,
            };
            setPurchase((prevPurchase: IOperation) => ({
                ...prevPurchase,
                operationdetailSet: [
                    ...prevPurchase.operationdetailSet!,
                    newPurchaseDetail,
                ],
            }));
        }

        // Use the new close function
        handleCloseModal();
    };

    // Modify the modal close function
    const handleCloseModal = () => {
        // Remove focus from any element inside the modal before closing
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }

        setPurchaseDetail(initialStatePurchaseDetail);
        setProduct(initialStateProduct);
        modalAddDetail.hide();
    };

    return (
        <>
            {/* Large Modal */}
            <div
                id="modalAddDetail"
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
                                {purchaseDetail.temporaryId}
                            </h3>
                            <button
                                ref={closeButtonRef}
                                type="button"
                                onClick={handleCloseModal}
                                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                            >
                                <svg
                                    className="w-3 h-3"
                                    aria-hidden="true"
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
                                <div className="grid grid-cols-6 gap-4">
                                    <div className="sm:col-span-4">
                                        <label className="form-label">
                                            Producto - Servicio (CATÁLOGO)
                                        </label>
                                        <input
                                            type="text"
                                            name="productName"
                                            maxLength={100}
                                            onFocus={(e) => e.target.select()}
                                            value={product.name}
                                            onChange={
                                                handleInputChangePurchaseDetail
                                            }
                                            className="form-control"
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
                                            htmlFor="stock"
                                            className="form-label"
                                        >
                                            Stock actual disponible
                                        </label>
                                        <input
                                            type="number"
                                            name="stock"
                                            onWheel={(e) =>
                                                e.currentTarget.blur()
                                            }
                                            value={purchaseDetail.stock}
                                            onChange={
                                                handleInputChangePurchaseDetail
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
                                            value={purchaseDetail.description}
                                            onChange={
                                                handleInputChangePurchaseDetail
                                            }
                                            className="form-control dark:bg-gray-800 dark:text-gray-200"
                                            autoComplete="off"
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label
                                            htmlFor="quantity"
                                            className="form-label"
                                        >
                                            Cantidad
                                        </label>
                                        <input
                                            type="number"
                                            name="quantity"
                                            onWheel={(e) =>
                                                e.currentTarget.blur()
                                            }
                                            value={purchaseDetail.quantity}
                                            onChange={
                                                handleInputChangePurchaseDetail
                                            }
                                            onFocus={(e) => e.target.select()}
                                            className="form-control dark:bg-gray-800 dark:text-gray-200"
                                            autoComplete="off"
                                            required
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label
                                            htmlFor="unitValue"
                                            className="form-label"
                                        >
                                            VALOR Unit. (Sin IGV)
                                        </label>
                                        <input
                                            type="number"
                                            name="unitValue"
                                            onWheel={(e) =>
                                                e.currentTarget.blur()
                                            }
                                            value={purchaseDetail.unitValue}
                                            onChange={
                                                handleInputChangePurchaseDetail
                                            }
                                            onFocus={(e) => e.target.select()}
                                            className="form-control dark:bg-gray-800 dark:text-gray-200"
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
                                            value={purchaseDetail.totalValue}
                                            readOnly
                                            onChange={
                                                handleInputChangePurchaseDetail
                                            }
                                            onFocus={(e) => e.target.select()}
                                            className="form-control cursor-not-allowed dark:bg-gray-800 dark:text-gray-200"
                                        />
                                    </div>

                                    <div className="sm:col-span-2"></div>

                                    <div className="sm:col-span-2">
                                        <label
                                            htmlFor="totalDiscount"
                                            className="form-label"
                                        >
                                            Descuento por Item{" "}
                                            <span className=" text-xs">
                                                (aplica al Subtotal)
                                            </span>
                                        </label>
                                        <input
                                            type="number"
                                            name="totalDiscount"
                                            onWheel={(e) =>
                                                e.currentTarget.blur()
                                            }
                                            value={purchaseDetail.totalDiscount}
                                            onChange={
                                                handleInputChangePurchaseDetail
                                            }
                                            onFocus={(e) => e.target.select()}
                                            className="form-control"
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
                                                handleInputChangePurchaseDetail
                                            }
                                            value={
                                                purchaseDetail.typeAffectationId
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
                                            className="form-label"
                                        >
                                            IGV de la linea
                                        </label>
                                        <input
                                            type="number"
                                            name="totalIgv"
                                            onWheel={(e) =>
                                                e.currentTarget.blur()
                                            }
                                            value={purchaseDetail.totalIgv}
                                            onChange={
                                                handleInputChangePurchaseDetail
                                            }
                                            onFocus={(e) => e.target.select()}
                                            className="form-control cursor-not-allowed"
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
                                            value={purchaseDetail.totalAmount}
                                            onChange={
                                                handleInputChangePurchaseDetail
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
                                    onClick={handleCloseModal}
                                    className="btn-dark px-5 py-2 inline-flex items-center gap-2"
                                >
                                    Cerrar
                                </button>
                                <button
                                    type="submit"
                                    className="btn-green px-5 py-2 inline-flex items-center gap-2"
                                >
                                    {" "}
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

export default PurchaseDetailForm;
