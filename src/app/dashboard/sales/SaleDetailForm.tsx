import { ChangeEvent, FormEvent, useMemo, useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import Save from "@/components/icons/Save";
import { Modal, ModalOptions } from "flowbite";
import Combobox, {
    ComboboxOption,
} from "@/components/Combobox";
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
            wholesalePriceWithIgv
            wholesaleQuantityThreshold
            maximumFactor
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
                    "bg-gray-900 bg-opacity-60 dark:bg-opacity-80 fixed inset-0 z-40",
                closable: false,
            };
            setModalAddDetail(new Modal($targetEl, options));
        }
    }, [modalAddDetail, setModalAddDetail]);

    useEffect(() => {
        // Se ejecuta para productos nuevos O para detalles existentes que no tienen precios minoristas guardados
        const isNewProduct =
            Number(product.id) > 0 && Number(invoiceDetail.id) === 0;
        const isExistingProductWithoutRetailPrices =
            Number(product.id) > 0 &&
            Number(invoiceDetail.id) > 0 &&
            (!invoiceDetail.retailUnitPrice || !invoiceDetail.retailUnitValue);

        if (isNewProduct || isExistingProductWithoutRetailPrices) {
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
                        // Si es un producto nuevo, actualizar todo
                        // Si es un producto existente, solo agregar los campos faltantes
                        const isNewProduct = Number(invoiceDetail.id) === 0;

                        const updateData = isNewProduct
                            ? {
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
                                  // Guardar precios minoristas originales
                                  retailUnitValue: Number(
                                      calculatedPriceWithoutIgv
                                  ).toFixed(6),
                                  retailUnitPrice: Number(
                                      productDetail.priceWithIgv3
                                  ).toFixed(6),
                                  igvPercentage:
                                      Number(igvPercentage).toFixed(2),
                                  totalValue: Number(totalValue).toFixed(2),
                                  totalIgv: Number(totalIgv).toFixed(2),
                                  totalAmount: Number(totalAmount).toFixed(2),
                                  stock: Number(productDetail.stock),
                                  typeAffectationId: Number(
                                      productDetail.typeAffectationId
                                  ),
                                  wholesaleQuantityThreshold: Number(
                                      productDetail.wholesaleQuantityThreshold
                                  ),
                                  wholesalePriceWithIgv: Number(
                                      productDetail.wholesalePriceWithIgv
                                  ),
                                  maximumFactor: Number(
                                      productDetail.maximumFactor
                                  ),
                              }
                            : {
                                  // Para productos existentes, solo agregar los campos faltantes
                                  ...invoiceDetail,
                                  retailUnitValue: Number(
                                      calculatedPriceWithoutIgv
                                  ).toFixed(6),
                                  retailUnitPrice: Number(
                                      productDetail.priceWithIgv3
                                  ).toFixed(6),
                                  wholesaleQuantityThreshold: Number(
                                      productDetail.wholesaleQuantityThreshold
                                  ),
                                  wholesalePriceWithIgv: Number(
                                      productDetail.wholesalePriceWithIgv
                                  ),
                                  maximumFactor: Number(
                                      productDetail.maximumFactor
                                  ),
                                  stock: Number(productDetail.stock),
                              };

                        setInvoiceDetail(updateData);
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

            const {
                wholesaleQuantityThreshold,
                wholesalePriceWithIgv,
                maximumFactor,
                retailUnitPrice, // precio minorista original (con IGV)
                retailUnitValue, // precio minorista original (sin IGV)
                totalDiscount,
                typeAffectationId,
            } = invoiceDetail;

            let appliedUnitPrice = Number(retailUnitPrice);
            let appliedUnitValue = Number(retailUnitValue);
            let message = "Precio minorista aplicado";

            // Cálculo normal si no hay producto o hay error en el cálculo por mayor
            const foundTypeAffectation =
                typeAffectationsData?.allTypeAffectations?.find(
                    (ta: ITypeAffectation) =>
                        Number(ta.id) ===
                        Number(invoiceDetail.typeAffectationId)
                );
            const code = foundTypeAffectation?.code ?? "10";
            const igvPercentage = code === "10" ? Number(invoice.igvType) : 0;

            // Verificar si aplica precio por mayor
            if (
                wholesaleQuantityThreshold > 0 &&
                Number(formattedQuantity) > wholesaleQuantityThreshold &&
                wholesalePriceWithIgv > 0
            ) {
                const wholesaleUnitPrice =
                    wholesalePriceWithIgv / maximumFactor;
                appliedUnitPrice = wholesaleUnitPrice;
                appliedUnitValue =
                    wholesaleUnitPrice / (1 + igvPercentage * 0.01);
                message = `Precio por mayor aplicado (${formattedQuantity} unidades a ${wholesaleUnitPrice.toFixed(
                    2
                )} c/u)`;

                setShouldUpdateTariff(false); // no se actualiza la tarifa
            } else {
                // Usar precios minoristas originales
                appliedUnitPrice = Number(retailUnitPrice);
                appliedUnitValue = Number(retailUnitValue);
                message = "Precio minorista aplicado";
                setShouldUpdateTariff(true); // mantiene el precio minorista
            }

            const { totalValue, totalAmount, totalIgv } = calculateBasedOnIgv(
                Number(formattedQuantity),
                appliedUnitPrice,
                appliedUnitValue,
                Number(totalDiscount),
                igvPercentage,
                includeIgv
            );

            setInvoiceDetail({
                ...invoiceDetail,
                quantity: formattedQuantity,
                unitPrice: appliedUnitPrice.toFixed(6),
                unitValue: appliedUnitValue.toFixed(6),
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

    // Opciones del autocomplete de producto del modal de detalle
    const productOptions: ComboboxOption[] = useMemo(
        () =>
            (productsData?.allProducts ?? []).map((n: IProduct) => ({
                id: n.id,
                label: n.name.replace(/[\n\r\s]+/g, " ").trim(),
                badge: n.code || undefined,
                raw: n,
            })),
        [productsData],
    );

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
        // Validación de unitPrice según typeAffectationId
        const typeAffectationId = Number(invoiceDetail?.typeAffectationId);
        // Si es GRAVADO (1), EXONERADA (2), o INAFECTO (3): no permitir precio cero
        // Si es GRATUITO (4): permitir precio cero pero no negativo
        if (typeAffectationId === 1 || typeAffectationId === 2 || typeAffectationId === 3) {
            if (Number(invoiceDetail?.unitPrice) <= 0) {
                toast("Por favor ingrese un precio mayor a 0 para este tipo de afectación.", {
                    hideProgressBar: true,
                    autoClose: 2000,
                    type: "warning",
                });
                return;
            }
        } else if (typeAffectationId === 4) {
            // GRATUITO: permitir cero pero no negativo
            if (Number(invoiceDetail?.unitPrice) < 0) {
                toast("El precio no puede ser negativo.", {
                    hideProgressBar: true,
                    autoClose: 2000,
                    type: "warning",
                });
                return;
            }
        } else {
            // Para otros tipos de afectación, validar que no sea negativo
            if (Number(invoiceDetail?.unitPrice) < 0) {
                toast("Por favor ingrese un precio mayor o igual a 0.", {
                    hideProgressBar: true,
                    autoClose: 2000,
                    type: "warning",
                });
                return;
            }
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
                tabIndex={-1}
                className="fixed left-0 right-0 top-0 z-50 hidden h-[calc(100%-1rem)] max-h-full w-full items-center justify-center overflow-x-hidden overflow-y-auto p-4"
            >
                <div className="relative max-h-full w-full max-w-4xl">
                    {/* Modal content */}
                    <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-white bg-gradient-to-b from-blue-50 via-slate-50 to-white shadow-2xl dark:border-gray-700 dark:bg-gray-800 dark:from-slate-900 dark:via-gray-800 dark:to-gray-800">
                        {/* Modal header */}
                        <div className="flex items-start gap-3 border-b border-blue-100/70 px-5 py-4 dark:border-gray-700">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-400/20">
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={1.7}
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                                    />
                                </svg>
                            </span>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-base font-semibold leading-tight text-gray-900 dark:text-white">
                                    Detalle de la línea o ítem
                                </h3>
                                <p className="mt-0.5 text-[13px] text-gray-500 dark:text-gray-400">
                                    Define el producto, la cantidad y los
                                    valores de esta línea
                                </p>
                            </div>
                            <button
                                ref={closeButtonRef}
                                type="button"
                                onClick={handleCloseModal}
                                aria-label="Cerrar"
                                className="-mr-1.5 -mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:hover:bg-gray-700 dark:hover:text-gray-300 dark:focus:ring-blue-500/30"
                            >
                                <svg
                                    className="h-3.5 w-3.5"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 14 14"
                                    aria-hidden="true"
                                >
                                    <path
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                                    />
                                </svg>
                            </button>
                        </div>
                        {/* Modal body */}

                        <form onSubmit={handleAddDetail}>
                            <div className="space-y-5 p-4 md:p-6">
                                <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-6">
                                    {/* Product name input - adjusted to 4 columns */}
                                    <div className="sm:col-span-4">
                                        <label className="mb-1.5 block text-[13px] font-medium text-gray-700 dark:text-gray-300">
                                            Producto - Servicio (CATÁLOGO) 2
                                        </label>
                                        <div className="relative mt-1">
                                            <Combobox
                                                value={product.name}
                                                onChange={(value) => {
                                                    setProduct({
                                                        ...product,
                                                        id: 0,
                                                        name: value,
                                                    });
                                                }}
                                                onSelect={(option) => {
                                                    setProduct({
                                                        ...product,
                                                        id: Number(
                                                            option.id,
                                                        ),
                                                        name: option.label,
                                                    });
                                                }}
                                                options={productOptions}
                                                placeholder="Buscar o escribir el producto..."
                                                required
                                                maxLength={100}
                                                selectOnFocus
                                                icon={
                                                    <svg
                                                        className="h-4 w-4"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth={1.8}
                                                        viewBox="0 0 24 24"
                                                        aria-hidden="true"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                                                        />
                                                    </svg>
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label
                                            htmlFor="stock"
                                            className="mb-1.5 block text-[13px] font-medium text-gray-700 dark:text-gray-300"
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
                                            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:disabled:bg-gray-800/60 dark:disabled:text-gray-500"
                                            disabled
                                        />
                                    </div>

                                    <div className="sm:col-span-6">
                                        <label
                                            htmlFor="description"
                                            className="mb-1.5 block text-[13px] font-medium text-gray-700 dark:text-gray-300"
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
                                            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:disabled:bg-gray-800/60 dark:disabled:text-gray-500 tabular-nums"
                                            autoComplete="off"
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label
                                            htmlFor="quantity"
                                            className="mb-1.5 block text-[13px] font-medium text-gray-700 dark:text-gray-300"
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
                                            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:disabled:bg-gray-800/60 dark:disabled:text-gray-500 tabular-nums"
                                            autoComplete="off"
                                            required
                                        />
                                    </div>
                                    {auth?.user?.companyIncludeIgv ? (
                                        <div className="sm:col-span-2">
                                            <label
                                                htmlFor="unitPrice"
                                                className="mb-1.5 block text-[13px] font-medium text-gray-700 dark:text-gray-300"
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
                                                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:disabled:bg-gray-800/60 dark:disabled:text-gray-500 tabular-nums"
                                                required
                                            />
                                        </div>
                                    ) : (
                                        <div className="sm:col-span-2">
                                            <label
                                                htmlFor="unitValue"
                                                className="mb-1.5 block text-[13px] font-medium text-gray-700 dark:text-gray-300"
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
                                                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:disabled:bg-gray-800/60 dark:disabled:text-gray-500 tabular-nums"
                                            />
                                        </div>
                                    )}

                                    <div className="sm:col-span-2">
                                        <label
                                            htmlFor="totalValue"
                                            className="mb-1.5 block text-[13px] font-medium text-gray-700 dark:text-gray-300"
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
                                            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:disabled:bg-gray-800/60 dark:disabled:text-gray-500"
                                        />
                                    </div>

                                    <div className="sm:col-span-2"></div>

                                    <div className="sm:col-span-2">
                                        <label
                                            htmlFor="totalDiscount"
                                            className="mb-1.5 block text-[13px] font-medium text-gray-700 dark:text-gray-300"
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
                                            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:disabled:bg-gray-800/60 dark:disabled:text-gray-500 tabular-nums"
                                        />
                                    </div>

                                    <div className="sm:col-span-2"></div>

                                    <div className="sm:col-span-2">
                                        <label
                                            htmlFor="typeAffectationId"
                                            className="mb-1.5 block text-[13px] font-medium text-gray-700 dark:text-gray-300"
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
                                            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:disabled:bg-gray-800/60 dark:disabled:text-gray-500 tabular-nums"
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
                                            className="mb-1.5 block text-[13px] font-medium text-gray-700 dark:text-gray-300"
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
                                            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:disabled:bg-gray-800/60 dark:disabled:text-gray-500"
                                            disabled
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label
                                            htmlFor="totalAmount"
                                            className="mb-1.5 block text-[13px] font-medium text-gray-700 dark:text-gray-300"
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
                                            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:disabled:bg-gray-800/60 dark:disabled:text-gray-500 tabular-nums"
                                            autoComplete="off"
                                        />
                                    </div>
                                </div>
                                {/* Sección de Anticipos */}
                                {invoice.operationType === "0502" && (
                                    <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-600 dark:bg-gray-700">
                                        <div className="flex items-start gap-2.5">
                                            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-400">
                                                <svg
                                                    className="h-3.5 w-3.5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth={2}
                                                    viewBox="0 0 24 24"
                                                    aria-hidden="true"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                                                    />
                                                </svg>
                                            </span>
                                            <div className="text-[13px] leading-relaxed text-gray-600 dark:text-gray-300">
                                                <p>
                                                    Si es el{" "}
                                                    <span className="font-semibold text-gray-900 dark:text-white">
                                                        PRIMER ANTICIPO
                                                    </span>{" "}
                                                    deja estos datos en blanco.
                                                </p>
                                                <p className="mt-1">
                                                    Si es una{" "}
                                                    <span className="font-semibold text-gray-900 dark:text-white">
                                                        DEDUCCIÓN DE ANTICIPO
                                                    </span>
                                                    , el importe de esta
                                                    línea es el total del pago
                                                    anticipado y restará a los
                                                    totales del documento.
                                                </p>
                                            </div>
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
                                                    <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-800 dark:bg-blue-400/10 dark:text-blue-200">
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
                                                        className={`block h-6 w-12 cursor-pointer rounded-full transition-all duration-200 ease-in-out hover:scale-105 ${
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
                                            <div className="space-y-3 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-400/40 dark:bg-blue-900/40">
                                                <div className="flex items-center gap-2">
                                                    <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                                                    <h4 className="text-[13px] font-semibold text-blue-900 dark:text-blue-200">
                                                        Datos del Documento de
                                                        Anticipo
                                                    </h4>
                                                </div>

                                                <p className="text-[13px] text-blue-700 dark:text-blue-300">
                                                    Ingrese la información del
                                                    documento que contenía el
                                                    anticipo anterior:
                                                </p>

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
                                                            className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-blue-50 dark:border-blue-400/40 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:disabled:bg-gray-800/60"
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
                                                            className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-blue-50 dark:border-blue-400/40 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:disabled:bg-gray-800/60"
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
                            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-blue-100/70 bg-white px-5 py-4 dark:border-gray-700 dark:bg-gray-800">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-[13px] font-medium text-gray-700 shadow-sm transition-colors hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-700/70 dark:focus:ring-gray-700"
                                >
                                    Cerrar
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-blue-600 bg-blue-50 px-4 text-[13px] font-semibold text-blue-700 shadow-sm transition-colors hover:border-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-4 focus:ring-blue-200/70 dark:border-blue-400/40 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:border-blue-400/70 dark:hover:bg-blue-500/20 dark:focus:ring-blue-500/30"
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
