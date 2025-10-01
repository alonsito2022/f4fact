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
            stock
            priceWithoutIgv3
            priceWithIgv3
            productTariffId3
            typeAffectationId
            activeType
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

const CHECK_WHOLESALE_PRICE = gql`
    mutation CheckWholesalePrice($productId: ID!, $quantity: Float!) {
        calculatePrice(productId: $productId, quantity: $quantity) {
            success
            total
            priceWithIgv
            typePrice
            message
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

    const [updateProductTariff] = useCustomMutation(
        UPDATE_PRODUCT_TARIFF_PRICE
    );

    const [checkWholesalePrice] = useCustomMutation(CHECK_WHOLESALE_PRICE);
    const [shouldUpdateTariff, setShouldUpdateTariff] = useState(false);

    const [productDetailQuery] = useLazyQuery(PRODUCT_DETAIL_QUERY);
    // Add ref for the close button
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    // Limpiar campos de anticipo cuando se desactive
    useEffect(() => {
        if (!invoiceDetail.isAnticipation) {
            // Limpiar los campos relacionados cuando se desactive el anticipo
            setInvoiceDetail({
                ...invoiceDetail,
                relatedDocumentSerial: "",
                relatedDocumentCorrelative: "",
            });
        }
    }, [invoiceDetail.isAnticipation]);

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
                            activeType:
                                String(productDetail.activeType).replace(
                                    "A_",
                                    ""
                                ) || "NA",
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
                            stock: Number(productDetail.stock),
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

    // Toggle switch functionality for anticipation
    useEffect(() => {
        const checkbox = document.getElementById(
            "isAnticipation"
        ) as HTMLInputElement;
        const toggleLabel = checkbox?.nextElementSibling as HTMLLabelElement;
        const toggleCircle = toggleLabel?.querySelector(
            "span"
        ) as HTMLSpanElement;

        if (checkbox && toggleLabel && toggleCircle) {
            const updateToggleState = () => {
                if (invoiceDetail.isAnticipation) {
                    toggleLabel.classList.remove(
                        "bg-gray-300",
                        "dark:bg-gray-600"
                    );
                    toggleLabel.classList.add(
                        "bg-blue-600",
                        "dark:bg-blue-500"
                    );
                    toggleCircle.classList.remove("translate-x-0.5");
                    toggleCircle.classList.add("translate-x-6");
                } else {
                    toggleLabel.classList.remove(
                        "bg-blue-600",
                        "dark:bg-blue-500"
                    );
                    toggleLabel.classList.add(
                        "bg-gray-300",
                        "dark:bg-gray-600"
                    );
                    toggleCircle.classList.remove("translate-x-6");
                    toggleCircle.classList.add("translate-x-0.5");
                }
            };

            updateToggleState(); // Update toggle state when invoiceDetail.isAnticipation changes
        }
    }, [invoiceDetail.isAnticipation]);
    const handleCheckboxChangeAnticipation = ({
        target: { name, checked },
    }: ChangeEvent<HTMLInputElement>) => {
        setInvoiceDetail({ ...invoiceDetail, [name]: checked });
    };

    const handleAnticipationFieldChange = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = event.target;
        setInvoiceDetail({ ...invoiceDetail, [name]: value });
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

            // Verificar si hay un producto seleccionado para calcular precio por mayor
            if (invoiceDetail.productId && Number(formattedQuantity) > 0) {
                try {
                    const { data } = await checkWholesalePrice({
                        variables: {
                            productId: invoiceDetail.productId.toString(),
                            quantity: Number(formattedQuantity),
                        },
                    });

                    if (data?.calculatePrice?.success) {
                        setShouldUpdateTariff(false); // <-- Precio por mayor NO actualiza la BD

                        const { total, priceWithIgv } = data.calculatePrice;

                        // Calcular unitValue basado en el precio con IGV
                        const foundTypeAffectation =
                            typeAffectationsData?.allTypeAffectations?.find(
                                (ta: ITypeAffectation) =>
                                    Number(ta.id) ===
                                    Number(invoiceDetail.typeAffectationId)
                            );
                        const code = foundTypeAffectation?.code ?? "10";
                        const igvPercentage =
                            code === "10" ? Number(invoice.igvType) : 0;
                        const unitValue =
                            priceWithIgv / (1 + igvPercentage * 0.01);

                        const { totalValue, totalAmount, totalIgv } =
                            calculateBasedOnIgv(
                                Number(formattedQuantity),
                                priceWithIgv,
                                unitValue,
                                Number(invoiceDetail.totalDiscount),
                                igvPercentage,
                                includeIgv
                            );

                        setInvoiceDetail({
                            ...invoiceDetail,
                            quantity: formattedQuantity,
                            unitPrice: priceWithIgv.toFixed(6),
                            unitValue: unitValue.toFixed(6),
                            totalValue: totalValue.toFixed(2),
                            totalIgv: totalIgv.toFixed(2),
                            totalAmount: totalAmount.toFixed(2),
                        });
                        return;
                    } else {
                        // Cuando success: false, restaurar precio minorista original
                        setShouldUpdateTariff(true); // <-- Precio minorista SÍ actualiza la BD

                        // Obtener el precio minorista original del producto
                        const productDetail = await productDetailQuery({
                            context: getAuthContext(),
                            variables: {
                                productId: Number(invoiceDetail.productId),
                            },
                            fetchPolicy: "network-only",
                        });

                        if (productDetail.data?.productDetailByProductId) {
                            const originalPrice =
                                productDetail.data.productDetailByProductId
                                    .priceWithIgv3;

                            // Calcular unitValue basado en el precio minorista original
                            const foundTypeAffectation =
                                typeAffectationsData?.allTypeAffectations?.find(
                                    (ta: ITypeAffectation) =>
                                        Number(ta.id) ===
                                        Number(invoiceDetail.typeAffectationId)
                                );
                            const code = foundTypeAffectation?.code ?? "10";
                            const igvPercentage =
                                code === "10" ? Number(invoice.igvType) : 0;
                            const unitValue =
                                originalPrice / (1 + igvPercentage * 0.01);

                            const { totalValue, totalAmount, totalIgv } =
                                calculateBasedOnIgv(
                                    Number(formattedQuantity),
                                    originalPrice,
                                    unitValue,
                                    Number(invoiceDetail.totalDiscount),
                                    igvPercentage,
                                    includeIgv
                                );

                            setInvoiceDetail({
                                ...invoiceDetail,
                                quantity: formattedQuantity,
                                unitPrice: originalPrice.toFixed(6),
                                unitValue: unitValue.toFixed(6),
                                totalValue: totalValue.toFixed(2),
                                totalIgv: totalIgv.toFixed(2),
                                totalAmount: totalAmount.toFixed(2),
                            });
                            return;
                        }
                    }
                } catch (error) {
                    console.error("Error calculating wholesale price:", error);
                    setShouldUpdateTariff(false);
                    // Continuar con el cálculo normal si hay error
                }
            } else {
                setShouldUpdateTariff(false);
            }

            // Cálculo normal si no hay producto o hay error en el cálculo por mayor
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

        if (name === "totalAmount") {
            const foundTypeAffectation =
                typeAffectationsData?.allTypeAffectations?.find(
                    (ta: ITypeAffectation) =>
                        Number(ta.id) ===
                        Number(invoiceDetail.typeAffectationId)
                );
            const code = foundTypeAffectation?.code ?? "10";
            const igvPercentage = code === "10" ? Number(invoice.igvType) : 0;

            // Calcular totalValue basado en totalAmount
            const totalAmountValue = Number(value);
            const totalValue = totalAmountValue / (1 + igvPercentage * 0.01);
            const totalIgv = totalAmountValue - totalValue;

            // Calcular unitValue y unitPrice basado en la cantidad
            const quantity = Number(invoiceDetail.quantity);
            const unitValue =
                (totalValue + Number(invoiceDetail.totalDiscount)) / quantity;
            const unitPrice = unitValue * (1 + igvPercentage * 0.01);

            setInvoiceDetail({
                ...invoiceDetail,
                totalAmount: value,
                totalValue: totalValue.toFixed(2),
                totalIgv: totalIgv.toFixed(2),
                unitValue: unitValue.toFixed(6),
                unitPrice: unitPrice.toFixed(6),
            });
            return;
        }

        setInvoiceDetail({ ...invoiceDetail, [name]: value });
    };

    // Validation helpers
    const validateQuantity = (value: string): boolean => {
        if (
            invoice?.documentType === "07" &&
            Number(value) > Number(invoiceDetail?.quantityAvailable) &&
            (invoiceDetail.activeType == "01" ||
                invoiceDetail.activeType == "02")
        ) {
            // only for credit note
            toast.warning(
                "La cantidad no puede ser mayor al máximo permitido."
            );
            return false;
        }
        if (
            auth?.user?.companyWithStock &&
            Number(value) > Number(invoiceDetail?.stock) &&
            invoice?.parentOperationDocumentType !== "NS" &&
            (invoiceDetail.activeType == "01" ||
                invoiceDetail.activeType == "02")
        ) {
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
        if (Number(invoiceDetail?.quantity) < 0) {
            toast("Por favor ingrese una cantidad mayor a 0.", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
            });
            return;
        }
        if (Number(invoiceDetail?.unitPrice) < 0) {
            toast("Por favor ingrese un precio mayor a 0.", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
            });
            return;
        }
        if (Number(invoiceDetail?.unitValue) < 0) {
            toast("Por favor ingrese un valor mayor a 0.", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
            });
            return;
        }
        if (
            Number(invoiceDetail?.totalDiscount) >
            Number(invoiceDetail?.totalValue)
        ) {
            toast("El descuento no puede ser mayor al subtotal.", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
            });
            return;
        }
        if (
            auth?.user?.companyWithStock &&
            Number(invoiceDetail?.quantity) > Number(invoiceDetail?.stock) &&
            (invoiceDetail.activeType == "01" ||
                invoiceDetail.activeType == "02")
        ) {
            toast.warning(
                "La cantidad no puede ser mayor al stock disponible."
            );
            return;
        }
        if (shouldUpdateTariff) {
            const variables = {
                id: Number(invoiceDetail.productTariffId),
                priceWithIgv: Number(invoiceDetail.unitPrice),
                priceWithoutIgv: Number(invoiceDetail.unitValue),
            };
            updateProductTariff({
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
            // Get the next temporaryId from the parent component
            const nextTemporaryId =
                invoice.nextTemporaryId ||
                invoice.operationdetailSet.length + 1;
            let newSaleDetail = {
                ...invoiceDetail,
                temporaryId: nextTemporaryId,
            };
            setInvoice((previnvoice: IOperation) => ({
                ...previnvoice,
                operationdetailSet: [
                    ...previnvoice.operationdetailSet!,
                    newSaleDetail,
                ],
                nextTemporaryId: nextTemporaryId + 1,
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
                                Detalle de la LINEA o ITEM
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
                                    {/* Product name input - adjusted to 4 columns */}
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
                                            htmlFor="stock"
                                            className="form-label text-gray-900 dark:text-gray-200"
                                        >
                                            Stock actual disponible
                                        </label>
                                        <input
                                            type="number"
                                            name="stock"
                                            onWheel={(e) =>
                                                e.currentTarget.blur()
                                            }
                                            value={invoiceDetail.stock}
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
                                            className="form-control dark:bg-gray-800 dark:text-gray-200"
                                            autoComplete="off"
                                        />
                                    </div>
                                </div>
                                {/* Sección de Anticipos */}
                                {invoice.operationType === "0502" && (
                                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm p-6 space-y-4">
                                        <div className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed text-center">
                                            Si es el{" "}
                                            <span className="font-semibold">
                                                PRIMER ANTICIPO
                                            </span>{" "}
                                            dejar estos datos en blanco.
                                        </div>
                                        <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                            Si es una{" "}
                                            <span className="font-semibold">
                                                DEDUCCIÓN DE ANTICIPO
                                            </span>{" "}
                                            el importe de este ITEM o LINEA es
                                            el total del pago anticipado y
                                            restará a los totales del documento.
                                        </div>

                                        <div className="flex flex-col gap-4">
                                            <div className="flex items-center justify-between">
                                                <label
                                                    htmlFor="isAnticipation"
                                                    className="text-sm font-medium text-gray-900 dark:text-gray-200"
                                                >
                                                    ¿Deducción de Anticipo?
                                                </label>
                                                {invoiceDetail.isAnticipation && (
                                                    <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                        <span>
                                                            Anticipo Activo
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <span
                                                    className={`text-sm transition-colors duration-200 ${
                                                        !invoiceDetail.isAnticipation
                                                            ? "text-gray-600 dark:text-gray-400"
                                                            : "text-gray-400 dark:text-gray-500"
                                                    }`}
                                                >
                                                    No
                                                </span>
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        name="isAnticipation"
                                                        id="isAnticipation"
                                                        className="sr-only"
                                                        checked={
                                                            invoiceDetail.isAnticipation
                                                        }
                                                        onChange={
                                                            handleCheckboxChangeAnticipation
                                                        }
                                                    />
                                                    <label
                                                        htmlFor="isAnticipation"
                                                        className={`block w-12 h-6 rounded-full cursor-pointer transition-all duration-200 ease-in-out hover:scale-105 ${
                                                            invoiceDetail.isAnticipation
                                                                ? "bg-blue-600 dark:bg-blue-500 shadow-lg shadow-blue-200 dark:shadow-blue-900/30"
                                                                : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                                                        }`}
                                                    >
                                                        <span
                                                            className={`block w-5 h-5 bg-white rounded-full shadow transform transition-all duration-200 ease-in-out ${
                                                                invoiceDetail.isAnticipation
                                                                    ? "translate-x-6"
                                                                    : "translate-x-0.5"
                                                            } translate-y-0.5`}
                                                        ></span>
                                                    </label>
                                                </div>
                                                <span
                                                    className={`text-sm transition-colors duration-200 ${
                                                        invoiceDetail.isAnticipation
                                                            ? "text-blue-600 dark:text-blue-400 font-medium"
                                                            : "text-gray-400 dark:text-gray-500"
                                                    }`}
                                                >
                                                    Sí
                                                </span>
                                            </div>
                                        </div>

                                        {/* Sección de Anticipos - Solo visible cuando invoiceDetail.isAnticipation es true */}
                                        {invoiceDetail.isAnticipation && (
                                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-4">
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                    <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                                                        Datos del Documento de
                                                        Anticipo
                                                    </h4>
                                                </div>

                                                <div className="text-sm text-blue-700 dark:text-blue-300">
                                                    Ingrese la información del
                                                    documento que contenía el
                                                    anticipo anterior:
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label
                                                            htmlFor="relatedDocumentSerial"
                                                            className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-2"
                                                        >
                                                            Serie
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="relatedDocumentSerial"
                                                            id="relatedDocumentSerial"
                                                            value={
                                                                invoiceDetail.relatedDocumentSerial ||
                                                                ""
                                                            }
                                                            onChange={
                                                                handleAnticipationFieldChange
                                                            }
                                                            className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                                            placeholder="Ej: F001"
                                                            disabled={
                                                                !invoiceDetail.isAnticipation
                                                            }
                                                            maxLength={4}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label
                                                            htmlFor="relatedDocumentCorrelative"
                                                            className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-2"
                                                        >
                                                            Número
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="relatedDocumentCorrelative"
                                                            id="relatedDocumentCorrelative"
                                                            value={
                                                                invoiceDetail.relatedDocumentCorrelative ||
                                                                ""
                                                            }
                                                            onChange={
                                                                handleAnticipationFieldChange
                                                            }
                                                            className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                                            placeholder="Ej: 00000001"
                                                            disabled={
                                                                !invoiceDetail.isAnticipation
                                                            }
                                                            maxLength={8}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
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
