import { IUnit, ITypeAffectation } from "@/app/types";
import { ChangeEvent, FormEvent, useState, useEffect, ReactNode } from "react";
import { toast } from "react-toastify";
import Save from "@/components/icons/Save";
import ProductTariffForm from "./ProductTariffForm";
import { DocumentNode, gql, useMutation, useQuery } from "@apollo/client";
import { Modal, ModalOptions } from "flowbite";

const ADD_PRODUCT = gql`
    mutation (
        $code: String!
        $barcode: String!
        $name: String!
        $available: Boolean!
        $activeType: String!
        $ean: String!
        $weightInKilograms: Float!
        $typeAffectationId: Int!
        $subjectPerception: Boolean!
        $observation: String!
        $priceWithIgv1: Float!
        $priceWithoutIgv1: Float!
        $priceWithIgv2: Float!
        $priceWithoutIgv2: Float!
        $priceWithIgv3: Float!
        $priceWithoutIgv3: Float!
        $priceWithIgv4: Float!
        $priceWithoutIgv4: Float!
        $minimumUnitId: Int!
        $maximumUnitId: Int!
        $maximumFactor: Int!
        $minimumFactor: Int!
        $stock: Float!
        $retailQuantityThreshold: Float!
    ) {
        createProduct(
            code: $code
            barcode: $barcode
            name: $name
            available: $available
            activeType: $activeType
            ean: $ean
            weightInKilograms: $weightInKilograms
            typeAffectationId: $typeAffectationId
            subjectPerception: $subjectPerception
            observation: $observation
            priceWithIgv1: $priceWithIgv1
            priceWithoutIgv1: $priceWithoutIgv1
            priceWithIgv2: $priceWithIgv2
            priceWithoutIgv2: $priceWithoutIgv2
            priceWithIgv3: $priceWithIgv3
            priceWithoutIgv3: $priceWithoutIgv3
            priceWithIgv4: $priceWithIgv4
            priceWithoutIgv4: $priceWithoutIgv4
            minimumUnitId: $minimumUnitId
            maximumUnitId: $maximumUnitId
            maximumFactor: $maximumFactor
            minimumFactor: $minimumFactor
            stock: $stock
            retailQuantityThreshold: $retailQuantityThreshold
        ) {
            message
            product {
                id
                name
                barcode
                ean
                minimumUnitName
                maximumFactor
            }
        }
    }
`;

const UPDATE_PRODUCT = gql`
    mutation (
        $id: ID!
        $code: String!
        $barcode: String!
        $name: String!
        $available: Boolean!
        $activeType: String!
        $ean: String!
        $weightInKilograms: Float!
        $typeAffectationId: Int!
        $subjectPerception: Boolean!
        $observation: String!
        $priceWithIgv1: Float!
        $priceWithoutIgv1: Float!
        $priceWithIgv2: Float!
        $priceWithoutIgv2: Float!
        $priceWithIgv3: Float!
        $priceWithoutIgv3: Float!
        $priceWithIgv4: Float!
        $priceWithoutIgv4: Float!
        $minimumUnitId: Int!
        $maximumUnitId: Int!
        $maximumFactor: Int!
        $minimumFactor: Int!
        $stock: Float!
        $retailQuantityThreshold: Float!
    ) {
        updateProduct(
            id: $id
            code: $code
            barcode: $barcode
            name: $name
            available: $available
            activeType: $activeType
            ean: $ean
            weightInKilograms: $weightInKilograms
            typeAffectationId: $typeAffectationId
            subjectPerception: $subjectPerception
            observation: $observation
            priceWithIgv1: $priceWithIgv1
            priceWithoutIgv1: $priceWithoutIgv1
            priceWithIgv2: $priceWithIgv2
            priceWithoutIgv2: $priceWithoutIgv2
            priceWithIgv3: $priceWithIgv3
            priceWithoutIgv3: $priceWithoutIgv3
            priceWithIgv4: $priceWithIgv4
            priceWithoutIgv4: $priceWithoutIgv4
            minimumUnitId: $minimumUnitId
            maximumUnitId: $maximumUnitId
            maximumFactor: $maximumFactor
            minimumFactor: $minimumFactor
            stock: $stock
            retailQuantityThreshold: $retailQuantityThreshold
        ) {
            message
        }
    }
`;

const UNIT_QUERY = gql`
    query {
        allUnits {
            id
            shortName
            code
            description
        }
    }
`;

const labelClass =
    "mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400";

const inputClass =
    "h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:placeholder-gray-500 dark:focus:border-blue-500 dark:focus:bg-gray-700";

const selectClass = `${inputClass} cursor-pointer appearance-none pr-10`;

const toPrice = (value: unknown) => {
    const numberValue = Number(value);
    return Number.isFinite(numberValue)
        ? Number(numberValue.toFixed(2))
        : 0;
};

function SelectChevron() {
    return (
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
            <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                />
            </svg>
        </div>
    );
}

function SectionHeading({
    icon,
    title,
    description,
}: {
    icon: ReactNode;
    title: string;
    description?: string;
}) {
    return (
        <div className="mb-4 flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm shadow-blue-500/25">
                {icon}
            </span>
            <div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-white">
                    {title}
                </h4>
                {description && (
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-gray-400">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}

function ProductForm({
    modalProduct,
    setModalProduct,
    product,
    setProduct,
    initialStateProduct,
    auth,
    authContext,
    typeAffectationsData,
    PRODUCTS_QUERY,
    getVariables,
}: any) {
    const {
        loading: unitsLoading,
        error: unitsError,
        data: unitsData,
    } = useQuery(UNIT_QUERY, {
        onError(error) {
            console.error("Units query error:", error);
            toast("Error al cargar unidades", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "error",
            });
        },
        context: authContext,
        skip: !auth?.jwtToken,
    });

    function useCustomMutation(
        mutation: DocumentNode,
        refetchQuery: DocumentNode
    ) {
        return useMutation(mutation, {
            context: authContext,
            refetchQueries: () => [
                {
                    query: refetchQuery,
                    context: authContext,
                    variables: getVariables(),
                },
            ],
            onError: (error) => {
                // Check if we actually have data despite the error
                if (error.graphQLErrors?.length === 0 && error.networkError) {
                    console.log(
                        "Received data despite error:",
                        error.networkError
                    );
                    return; // Don't treat this as an error if we have valid data
                }

                console.error("Mutation Error:", {
                    message: error.message,
                    graphQLErrors: error.graphQLErrors,
                    networkError: error.networkError,
                    result: error.networkError,
                });
            },
        });
    }

    const [createProduct] = useCustomMutation(ADD_PRODUCT, PRODUCTS_QUERY);
    const [updateProduct] = useCustomMutation(UPDATE_PRODUCT, PRODUCTS_QUERY);

    const handleInputChange = ({
        target: { name, value },
    }: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >) => {
        setProduct({ ...product, [name]: value });
    };

    const handleInputChangeQuantityMinimum = ({
        target: { name, value },
    }: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >) => {
        const formattedValue = value.replace(/[^\d.]/g, "");
        const numberValue = parseFloat(formattedValue);

        if (
            formattedValue === "" ||
            (numberValue >= 1 && numberValue <= 999999)
        ) {
            setProduct({ ...product, [name]: numberValue || 1 });
        } else {
            setProduct({ ...product, [name]: 1 });
            toast("El valor debe estar entre 1 y 999999", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
            });
        }
    };

    const handleCheckboxChange = ({
        target: { name, checked },
    }: ChangeEvent<HTMLInputElement>) => {
        setProduct({ ...product, [name]: checked });
    };

    const handleSaveProduct = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            if (Number(product.typeAffectationId) === 0) {
                toast("Por favor ingrese un tipo de afectacion", {
                    hideProgressBar: true,
                    autoClose: 2000,
                    type: "warning",
                });
                return;
            }

            if (Number(product.minimumUnitId) === 0) {
                toast("Por favor ingrese una unidad de medida SUNAT Minima.", {
                    hideProgressBar: true,
                    autoClose: 2000,
                    type: "warning",
                });
                return;
            }

            if (Number(product.minimumFactor) === 0) {
                toast("Por favor ingrese un factor para la unidad minima.", {
                    hideProgressBar: true,
                    autoClose: 2000,
                    type: "warning",
                });
                return;
            }

            if (Number(product.id) !== 0) {
                // for updating
                const values = {
                    id: Number(product.id),
                    code: product.code,
                    barcode: product.barcode,
                    name: product.name,
                    available: product.available,
                    activeType: String(product.activeType).replace("A_", ""),
                    ean: product.ean,
                    weightInKilograms: Number(product.weightInKilograms),
                    typeAffectationId: Number(product.typeAffectationId),
                    subjectPerception: product.subjectPerception,
                    observation: product.observation,

                    priceWithIgv1: toPrice(product.priceWithIgv1),
                    priceWithoutIgv1: toPrice(product.priceWithoutIgv1),

                    priceWithIgv2: toPrice(product.priceWithIgv2),
                    priceWithoutIgv2: toPrice(product.priceWithoutIgv2),

                    priceWithIgv3: toPrice(product.priceWithIgv3),
                    priceWithoutIgv3: toPrice(product.priceWithoutIgv3),

                    priceWithIgv4: toPrice(product.priceWithIgv4),
                    priceWithoutIgv4: toPrice(product.priceWithoutIgv4),

                    minimumUnitId: Number(product.minimumUnitId),
                    maximumUnitId: Number(product.maximumUnitId),
                    maximumFactor: Number(product.maximumFactor),
                    minimumFactor: Number(product.minimumFactor),
                    stock: Number(product.stock),
                    retailQuantityThreshold: Number(
                        product.retailQuantityThreshold
                    ),
                };
                console.log("values", values, auth?.jwtToken);
                const { data, errors } = await updateProduct({
                    variables: values,
                });
                if (errors) {
                    console.error("GraphQL Errors:", errors);
                    toast(errors[0]?.message || "Error updating product", {
                        hideProgressBar: true,
                        autoClose: 2000,
                        type: "error",
                    });
                    return;
                } else {
                    toast(data.updateProduct.message, {
                        hideProgressBar: true,
                        autoClose: 2000,
                        type: "success",
                    });
                    setProduct(initialStateProduct);
                    modalProduct.hide();
                }
            } else {
                // for creating
                const values = {
                    code: product.code,
                    barcode: product.barcode,
                    name: product.name,
                    available: product.available,
                    activeType: product.activeType,
                    ean: product.ean,
                    weightInKilograms: Number(product.weightInKilograms),
                    typeAffectationId: Number(product.typeAffectationId),
                    subjectPerception: product.subjectPerception,
                    observation: product.observation,

                    priceWithIgv1: toPrice(product.priceWithIgv1),
                    priceWithoutIgv1: toPrice(product.priceWithoutIgv1),

                    priceWithIgv2: toPrice(product.priceWithIgv2),
                    priceWithoutIgv2: toPrice(product.priceWithoutIgv2),

                    priceWithIgv3: toPrice(product.priceWithIgv3),
                    priceWithoutIgv3: toPrice(product.priceWithoutIgv3),

                    priceWithIgv4: toPrice(product.priceWithIgv4),
                    priceWithoutIgv4: toPrice(product.priceWithoutIgv4),

                    minimumUnitId: Number(product.minimumUnitId),
                    maximumUnitId: Number(product.maximumUnitId),
                    maximumFactor: Number(product.maximumFactor),
                    minimumFactor: Number(product.minimumFactor),
                    stock: Number(product.stock),
                    retailQuantityThreshold: Number(
                        product.retailQuantityThreshold
                    ),
                };
                console.log("values", values, auth?.jwtToken);
                try {
                    const response = await createProduct({
                        variables: values,
                    });

                    // Check if we have data despite any errors
                    if (response.data?.createProduct) {
                        toast(response.data.createProduct.message, {
                            hideProgressBar: true,
                            autoClose: 2000,
                            type: "success",
                        });
                        // Call the success callback if it exists
                        if (product.onSaveSuccess) {
                            const newProduct =
                                response.data.createProduct.product;
                            setProduct({
                                ...initialStateProduct,
                                id: newProduct.id,
                                name: newProduct.name,
                                minimumUnitName: newProduct.minimumUnitName,
                                maximumFactor: newProduct.maximumFactor,
                            });
                            product.onSaveSuccess();
                        } else {
                            setProduct(initialStateProduct);
                            modalProduct.hide();
                        }
                    } else if (response.errors) {
                        console.error("GraphQL Errors:", response.errors);
                        toast(
                            response.errors[0]?.message ||
                                "Error creating product",
                            {
                                hideProgressBar: true,
                                autoClose: 2000,
                                type: "error",
                            }
                        );
                    }
                } catch (error: any) {
                    // Check if we have data in the error response
                    if (error.networkError?.result?.data?.createProduct) {
                        const data = error.networkError.result.data;
                        toast(data.createProduct.message, {
                            hideProgressBar: true,
                            autoClose: 2000,
                            type: "success",
                        });
                        setProduct(initialStateProduct);
                        modalProduct.hide();
                    } else {
                        console.error("Mutation Error:", error);
                        toast(error?.message || "Error processing request", {
                            hideProgressBar: true,
                            autoClose: 2000,
                            type: "error",
                        });
                    }
                }
            }
        } catch (error: any) {
            console.error("Form Submission Error:", error);
            toast(error?.message || "An unexpected error occurred", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "error",
            });
        }
    };

    useEffect(() => {
        if (!modalProduct) {
            const $targetEl = document.getElementById("modalProduct");
            const options: ModalOptions = {
                placement: "top-center",
                backdrop: "static",
                backdropClasses:
                    "bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40",
                closable: false,
            };

            setModalProduct(new Modal($targetEl, options));
        }
    }, [modalProduct, setModalProduct]);

    return (
        <>
            {/* Large Modal */}
            <div
                id="modalProduct"
                tabIndex={-1}
                aria-hidden="true"
                className="fixed top-0 left-0 right-0 z-50 hidden w-full p-3 overflow-x-hidden overflow-y-auto md:inset-0 md:p-4 h-[calc(100%-1rem)] max-h-full"
            >
                <div className="relative mx-auto w-full max-w-5xl max-h-full">
                    {/* Modal content */}
                    <div className="relative flex max-h-[calc(100vh-1.5rem)] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800 md:max-h-[calc(100vh-2rem)]">
                        {/* Modal header */}
                        <div className="relative flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 bg-white px-5 py-4 dark:border-gray-700 dark:bg-gray-800 sm:px-6">
                            <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                            <div className="flex items-start gap-3 pt-1">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
                                    <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                        />
                                    </svg>
                                </span>
                                <div>
                                    <h3
                                        className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white"
                                        id="modal-title"
                                    >
                                        {Number(product.id) > 0
                                            ? "Editar producto"
                                            : "Registrar nuevo producto"}
                                    </h3>
                                    <p className="mt-0.5 text-xs text-slate-500 dark:text-gray-400">
                                        {Number(product.id) > 0
                                            ? "Actualiza la información, precios y stock del producto."
                                            : "Completa la información para agregar un producto al catálogo."}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                id="btn-close-modal"
                                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:hover:bg-gray-700 dark:hover:text-white"
                                onClick={() => {
                                    modalProduct.hide();
                                }}
                            >
                                <svg
                                    aria-hidden="true"
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 14 14"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                                    />
                                </svg>
                                <span className="sr-only">Cerrar</span>
                            </button>
                        </div>

                        <form
                            onSubmit={handleSaveProduct}
                            className="flex min-h-0 flex-1 flex-col"
                        >
                            {/* Modal body */}
                            <div className="min-h-0 flex-1 space-y-7 overflow-y-auto px-5 py-5 sm:px-6">
                                <input
                                    type="hidden"
                                    name="id"
                                    id="id"
                                    value={product.id}
                                />

                                {/* Información general */}
                                <section>
                                    <SectionHeading
                                        icon={
                                            <svg
                                                className="h-4 w-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                        }
                                        title="Información general"
                                        description="Datos principales que identifican al producto o servicio."
                                    />
                                    <div className="grid gap-4 md:grid-cols-12">
                                        <div className="md:col-span-8">
                                            <label
                                                htmlFor="name"
                                                className={labelClass}
                                            >
                                                Nombre del producto o servicio{" "}
                                                <span className="text-rose-500">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                id="name"
                                                maxLength={200}
                                                value={product.name}
                                                onChange={handleInputChange}
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                className={inputClass}
                                                placeholder="Ej. Agua mineral 625 ml"
                                                required
                                                autoComplete="off"
                                            />
                                        </div>
                                        <div className="md:col-span-4">
                                            <label
                                                htmlFor="activeType"
                                                className={labelClass}
                                            >
                                                Tipo{" "}
                                                <span className="text-rose-500">
                                                    *
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <select
                                                    name="activeType"
                                                    id="activeType"
                                                    onChange={handleInputChange}
                                                    value={String(
                                                        product.activeType ?? "01"
                                                    ).replace("A_", "")}
                                                    className={selectClass}
                                                    required
                                                >
                                                    <option value={"01"}>
                                                        PRODUCTO
                                                    </option>
                                                    <option value={"02"}>
                                                        REGALO
                                                    </option>
                                                    <option value={"03"}>
                                                        SERVICIO
                                                    </option>
                                                </select>
                                                <SelectChevron />
                                            </div>
                                        </div>
                                        <div className="md:col-span-4">
                                            <label
                                                htmlFor="code"
                                                className={labelClass}
                                            >
                                                Código interno
                                            </label>
                                            <input
                                                type="text"
                                                name="code"
                                                id="code"
                                                maxLength={20}
                                                value={product.code || ""}
                                                onChange={handleInputChange}
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                className={inputClass}
                                                placeholder="Ej. PROD-001"
                                                autoComplete="off"
                                            />
                                        </div>
                                        <div className="md:col-span-4">
                                            <label
                                                htmlFor="barcode"
                                                className={labelClass}
                                            >
                                                Código de barras
                                            </label>
                                            <input
                                                type="text"
                                                name="barcode"
                                                id="barcode"
                                                maxLength={20}
                                                value={product.barcode || ""}
                                                onChange={handleInputChange}
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                className={inputClass}
                                                placeholder="Ej. 7501234567890"
                                                autoComplete="off"
                                            />
                                        </div>
                                        <div className="md:col-span-4">
                                            <label
                                                htmlFor="typeAffectationId"
                                                className={labelClass}
                                            >
                                                Tipo de afectación{" "}
                                                <span className="text-rose-500">
                                                    *
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <select
                                                    name="typeAffectationId"
                                                    id="typeAffectationId"
                                                    onChange={handleInputChange}
                                                    value={
                                                        product.typeAffectationId ??
                                                        0
                                                    }
                                                    className={selectClass}
                                                    required
                                                >
                                                    <option value={0}>
                                                        Elegir tipo de afectación
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
                                                <SelectChevron />
                                            </div>
                                        </div>

                                        {/* Campos ocultos conservados para el proceso de guardado */}
                                        <div className="hidden">
                                            <label
                                                htmlFor="ean"
                                                className={labelClass}
                                            >
                                                Código Producto Sunat
                                            </label>
                                            <input
                                                type="text"
                                                name="ean"
                                                id="ean"
                                                maxLength={20}
                                                value={product.ean}
                                                onChange={handleInputChange}
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                className={inputClass}
                                            />
                                        </div>
                                        <div className="hidden">
                                            <label
                                                htmlFor="weightInKilograms"
                                                className={labelClass}
                                            >
                                                Peso (Kg)
                                            </label>
                                            <input
                                                type="number"
                                                name="weightInKilograms"
                                                id="weightInKilograms"
                                                value={product.weightInKilograms}
                                                onChange={handleInputChange}
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                className={inputClass}
                                            />
                                        </div>
                                    </div>
                                </section>

                                {/* Unidades y stock */}
                                <section className="rounded-2xl border border-slate-200 bg-slate-50/40 p-4 dark:border-gray-700 dark:bg-gray-900/20 sm:p-5">
                                    <SectionHeading
                                        icon={
                                            <svg
                                                className="h-4 w-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                                />
                                            </svg>
                                        }
                                        title="Unidades y stock"
                                        description="Define la unidad mínima, la unidad máxima y sus factores de conversión."
                                    />
                                    <div className="grid gap-4 md:grid-cols-12">
                                        <div className="md:col-span-6">
                                            <label
                                                htmlFor="minimumUnitId"
                                                className={labelClass}
                                            >
                                                Unidad de medida SUNAT mínima{" "}
                                                <span className="text-rose-500">
                                                    *
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <select
                                                    name="minimumUnitId"
                                                    id="minimumUnitId"
                                                    onChange={handleInputChange}
                                                    value={
                                                        product.minimumUnitId ??
                                                        0
                                                    }
                                                    className={selectClass}
                                                    required
                                                >
                                                    <option value={0}>
                                                        Elegir unidad
                                                    </option>
                                                    {unitsData?.allUnits?.map(
                                                        (
                                                            o: IUnit,
                                                            k: number
                                                        ) => (
                                                            <option
                                                                key={k}
                                                                value={o.id}
                                                            >{`${o.shortName} - ${o.description}`}</option>
                                                        )
                                                    )}
                                                </select>
                                                <SelectChevron />
                                            </div>
                                        </div>
                                        <div className="md:col-span-6">
                                            <label
                                                htmlFor="maximumUnitId"
                                                className={labelClass}
                                            >
                                                Unidad de medida SUNAT máxima
                                            </label>
                                            <div className="relative">
                                                <select
                                                    name="maximumUnitId"
                                                    id="maximumUnitId"
                                                    onChange={handleInputChange}
                                                    value={
                                                        product.maximumUnitId ??
                                                        0
                                                    }
                                                    className={selectClass}
                                                    required
                                                >
                                                    <option value={0}>
                                                        Elegir unidad
                                                    </option>
                                                    {unitsData?.allUnits?.map(
                                                        (
                                                            o: IUnit,
                                                            k: number
                                                        ) => (
                                                            <option
                                                                key={k}
                                                                value={o.id}
                                                            >{`${o.shortName} - ${o.description}`}</option>
                                                        )
                                                    )}
                                                </select>
                                                <SelectChevron />
                                            </div>
                                        </div>
                                        <div className="md:col-span-4">
                                            <label
                                                htmlFor="minimumFactor"
                                                className={labelClass}
                                            >
                                                Factor de conversión mínimo{" "}
                                                <span className="text-rose-500">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="number"
                                                name="minimumFactor"
                                                id="minimumFactor"
                                                value={product.minimumFactor}
                                                onChange={
                                                    handleInputChangeQuantityMinimum
                                                }
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                className={inputClass}
                                                required
                                            />
                                        </div>
                                        <div className="md:col-span-4">
                                            <label
                                                htmlFor="maximumFactor"
                                                className={labelClass}
                                            >
                                                Factor de conversión máximo
                                            </label>
                                            <input
                                                type="number"
                                                name="maximumFactor"
                                                id="maximumFactor"
                                                value={product.maximumFactor}
                                                onChange={
                                                    handleInputChangeQuantityMinimum
                                                }
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                className={inputClass}
                                                required
                                            />
                                        </div>
                                        <div className="md:col-span-4">
                                            <label
                                                htmlFor="stock"
                                                className={labelClass}
                                            >
                                                Stock
                                            </label>
                                            <input
                                                type="number"
                                                name="stock"
                                                id="stock"
                                                value={product.stock}
                                                onChange={
                                                    handleInputChangeQuantityMinimum
                                                }
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                className={inputClass}
                                                autoComplete="off"
                                            />
                                        </div>
                                        {Number(product.minimumFactor) == 1 &&
                                            Number(product.maximumFactor) > 1 && (
                                                <div className="md:col-span-4">
                                                    <label
                                                        htmlFor="retailQuantityThreshold"
                                                        className={labelClass}
                                                    >
                                                        Umbral de venta al por
                                                        menor
                                                    </label>
                                                    <input
                                                        type="number"
                                                        name="retailQuantityThreshold"
                                                        id="retailQuantityThreshold"
                                                        value={
                                                            product.retailQuantityThreshold
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        onFocus={(e) =>
                                                            e.target.select()
                                                        }
                                                        className={inputClass}
                                                    />
                                                    <p className="mt-1.5 text-[11px] text-slate-500 dark:text-gray-400">
                                                        Cantidad desde la que se
                                                        aplica el precio al por
                                                        mayor.
                                                    </p>
                                                </div>
                                            )}
                                    </div>
                                </section>

                                {/* Precios */}
                                <section>
                                    <SectionHeading
                                        icon={
                                            <svg
                                                className="h-4 w-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                        }
                                        title="Precios"
                                        description="Los importes se calculan automáticamente según el IGV y se redondean a 2 decimales."
                                    />
                                    <ProductTariffForm
                                        setProduct={setProduct}
                                        product={product}
                                        auth={auth}
                                    />
                                </section>

                                {/* Observaciones y estado */}
                                <section>
                                    <SectionHeading
                                        icon={
                                            <svg
                                                className="h-4 w-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                />
                                            </svg>
                                        }
                                        title="Observaciones y estado"
                                        description="Agrega notas internas y define la disponibilidad del producto."
                                    />
                                    <div className="space-y-4">
                                        <div>
                                            <label
                                                htmlFor="observation3"
                                                className={labelClass}
                                            >
                                                Observación
                                            </label>
                                            <textarea
                                                id="observation3"
                                                name="observation"
                                                rows={4}
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-3 text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:placeholder-gray-500 dark:focus:border-blue-500 dark:focus:bg-gray-700"
                                                maxLength={500}
                                                onChange={handleInputChange}
                                                value={product.observation || ""}
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                placeholder="Escribe un comentario aquí"
                                            ></textarea>
                                        </div>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 transition-colors hover:border-blue-300 hover:bg-blue-50/40 dark:border-gray-600 dark:bg-gray-700/30 dark:hover:border-blue-700">
                                                <input
                                                    id="available3"
                                                    name="available"
                                                    checked={product.available}
                                                    type="checkbox"
                                                    onChange={
                                                        handleCheckboxChange
                                                    }
                                                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/30 dark:border-gray-500 dark:bg-gray-700"
                                                />
                                                <span>
                                                    <span className="block text-sm font-medium text-slate-800 dark:text-white">
                                                        Producto activo
                                                    </span>
                                                    <span className="mt-0.5 block text-xs text-slate-500 dark:text-gray-400">
                                                        Disponible para ventas y
                                                        consultas.
                                                    </span>
                                                </span>
                                            </label>

                                            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 transition-colors hover:border-blue-300 hover:bg-blue-50/40 dark:border-gray-600 dark:bg-gray-700/30 dark:hover:border-blue-700">
                                                <input
                                                    id="subjectPerception3"
                                                    name="subjectPerception"
                                                    checked={
                                                        product.subjectPerception
                                                    }
                                                    type="checkbox"
                                                    onChange={
                                                        handleCheckboxChange
                                                    }
                                                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/30 dark:border-gray-500 dark:bg-gray-700"
                                                />
                                                <span>
                                                    <span className="block text-sm font-medium text-slate-800 dark:text-white">
                                                        Sujeto a percepción
                                                    </span>
                                                    <span className="mt-0.5 block text-xs text-slate-500 dark:text-gray-400">
                                                        Aplica percepción en las
                                                        operaciones.
                                                    </span>
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                </section>

                                {unitsError && (
                                    <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600 dark:bg-rose-900/20 dark:text-rose-300">
                                        No se pudieron cargar las unidades.
                                        {unitsLoading ? " Cargando..." : ""}
                                    </p>
                                )}
                            </div>

                            {/* Modal footer */}
                            <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 dark:border-gray-700 dark:bg-gray-800/80 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                <p className="text-[11px] text-slate-500 dark:text-gray-400">
                                    Los campos con{" "}
                                    <span className="font-semibold text-rose-500">
                                        *
                                    </span>{" "}
                                    son obligatorios.
                                </p>
                                <div className="flex items-center justify-end gap-2.5">
                                    <button
                                        type="button"
                                        onClick={() => modalProduct.hide()}
                                        className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300/60 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        id="btn-save"
                                        type="submit"
                                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500/40 active:scale-[0.98]"
                                    >
                                        <Save />
                                        {Number(product.id) > 0
                                            ? "Actualizar producto"
                                            : "Guardar producto"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ProductForm;
