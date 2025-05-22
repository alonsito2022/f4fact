import { IUnit, ITypeAffectation, IProduct } from "@/app/types";
import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { toast } from "react-toastify";
import Save from "@/components/icons/Save";
import ProductTariffForm from "./ProductTariffForm";
import { DocumentNode, gql, useMutation, useQuery } from "@apollo/client";
import { Modal, ModalOptions } from "flowbite";

const ADD_PRODUCT = gql`
    mutation (
        $code: String!
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
    ) {
        createProduct(
            code: $code
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
        ) {
            message
            product {
                id
                name
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
    ) {
        updateProduct(
            id: $id
            code: $code
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
                    name: product.name,
                    available: product.available,
                    activeType: String(product.activeType).replace("A_", ""),
                    ean: product.ean,
                    weightInKilograms: Number(product.weightInKilograms),
                    typeAffectationId: Number(product.typeAffectationId),
                    subjectPerception: product.subjectPerception,
                    observation: product.observation,

                    priceWithIgv1: Number(product.priceWithIgv1),
                    priceWithoutIgv1: Number(product.priceWithoutIgv1),

                    priceWithIgv2: Number(product.priceWithIgv2),
                    priceWithoutIgv2: Number(product.priceWithoutIgv2),

                    priceWithIgv3: Number(product.priceWithIgv3),
                    priceWithoutIgv3: Number(product.priceWithoutIgv3),

                    priceWithIgv4: Number(product.priceWithIgv4),
                    priceWithoutIgv4: Number(product.priceWithoutIgv4),

                    minimumUnitId: Number(product.minimumUnitId),
                    maximumUnitId: Number(product.maximumUnitId),
                    maximumFactor: Number(product.maximumFactor),
                    minimumFactor: Number(product.minimumFactor),
                    stock: Number(product.stock),
                };
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
                    name: product.name,
                    available: product.available,
                    activeType: product.activeType,
                    ean: product.ean,
                    weightInKilograms: Number(product.weightInKilograms),
                    typeAffectationId: Number(product.typeAffectationId),
                    subjectPerception: product.subjectPerception,
                    observation: product.observation,

                    priceWithIgv1: Number(product.priceWithIgv1),
                    priceWithoutIgv1: Number(product.priceWithoutIgv1),

                    priceWithIgv2: Number(product.priceWithIgv2),
                    priceWithoutIgv2: Number(product.priceWithoutIgv2),

                    priceWithIgv3: Number(product.priceWithIgv3),
                    priceWithoutIgv3: Number(product.priceWithoutIgv3),

                    priceWithIgv4: Number(product.priceWithIgv4),
                    priceWithoutIgv4: Number(product.priceWithoutIgv4),

                    minimumUnitId: Number(product.minimumUnitId),
                    maximumUnitId: Number(product.maximumUnitId),
                    maximumFactor: Number(product.maximumFactor),
                    minimumFactor: Number(product.minimumFactor),
                    stock: Number(product.stock),
                };
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
    // // Add this to check the query status
    // useEffect(() => {
    //     console.log({
    //         loading: unitsLoading,
    //         error: unitsError,
    //         data: unitsData,
    //         authToken: auth?.jwtToken,
    //         context: authContext,
    //     });
    // }, [unitsLoading, unitsError, unitsData, auth, authContext]);
    return (
        <>
            {/* Large Modal */}
            <div
                id="modalProduct"
                tabIndex={-1}
                aria-hidden="true"
                className="fixed top-0 left-0 right-0 z-50 hidden w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"
            >
                <div className="relative w-full max-w-4xl max-h-full">
                    {/* Modal content */}
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                        {/* Modal header */}
                        <div className="flex items-center justify-between p-6 border-b rounded-t dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                            <h3
                                className="text-lg font-semibold text-gray-900 dark:text-white"
                                id="modal-title"
                            >
                                {Number(product.id) > 0
                                    ? "Editar"
                                    : "Registrar nuevo producto"}
                            </h3>
                            <button
                                type="button"
                                id="btn-close-modal"
                                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                                onClick={() => {
                                    modalProduct.hide();
                                }}
                            >
                                <svg
                                    aria-hidden="true"
                                    className="w-5 h-5"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    ></path>
                                </svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>

                        <form
                            onSubmit={handleSaveProduct}
                            className="space-y-6"
                        >
                            {/* Modal body */}
                            <div className="p-4 md:p-5 space-y-4">
                                <input
                                    type="hidden"
                                    name="id"
                                    id="id"
                                    value={product.id}
                                />

                                {/* Main form grid with better spacing */}
                                <div className="grid gap-6 mb-6 md:grid-cols-6">
                                    {/* Nombre del producto */}
                                    <div className="md:col-span-3">
                                        <label
                                            htmlFor="name"
                                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                        >
                                            Nombre del producto o servicio
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            maxLength={200}
                                            value={product.name}
                                            onChange={handleInputChange}
                                            onFocus={(e) => e.target.select()}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                            placeholder="Escriba un nombre aquí"
                                            required
                                            autoComplete="off"
                                        />
                                    </div>
                                    {/* Tipo */}
                                    <div className="md:col-span-2">
                                        <label
                                            htmlFor="activeType"
                                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                        >
                                            Tipo
                                        </label>
                                        <select
                                            name="activeType"
                                            id="activeType"
                                            onChange={handleInputChange}
                                            value={product.activeType.replace(
                                                "A_",
                                                ""
                                            )}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            required
                                        >
                                            <option value={"01"}>
                                                PRODUCTO
                                            </option>
                                            <option value={"02"}>REGALO</option>
                                            <option value={"03"}>
                                                SERVICIO
                                            </option>
                                        </select>
                                    </div>
                                    {/* Código Producto Sunat */}
                                    <div className="sm:col-span-1">
                                        <label
                                            htmlFor="code"
                                            className="form-label"
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
                                            onFocus={(e) => e.target.select()}
                                            className="form-control"
                                            autoComplete="off"
                                        />
                                    </div>

                                    {/* EAN */}
                                    <div className="sm:col-span-2 hidden">
                                        <label
                                            htmlFor="ean"
                                            className="form-label"
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
                                            onFocus={(e) => e.target.select()}
                                            className="form-control"
                                        />
                                    </div>
                                    {/* Peso */}
                                    <div className="sm:col-span-2 hidden">
                                        <label
                                            htmlFor="weightInKilograms"
                                            className="form-label"
                                        >
                                            Peso (Kg)
                                        </label>
                                        <input
                                            type="number"
                                            name="weightInKilograms"
                                            id="weightInKilograms"
                                            value={product.weightInKilograms}
                                            onChange={handleInputChange}
                                            onFocus={(e) => e.target.select()}
                                            className="form-control"
                                        />
                                    </div>
                                    {/* Tipo afectacion */}
                                    <div className="sm:col-span-5">
                                        <label
                                            htmlFor="typeAffectationId"
                                            className="form-label"
                                        >
                                            Tipo afectacion
                                        </label>
                                        <select
                                            name="typeAffectationId"
                                            id="typeAffectationId"
                                            onChange={handleInputChange}
                                            value={product.typeAffectationId}
                                            className="form-control"
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
                                    {/* Stock */}
                                    <div className="sm:col-span-1">
                                        <label
                                            htmlFor="stock"
                                            className="form-label"
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
                                            onFocus={(e) => e.target.select()}
                                            className="form-control"
                                            autoComplete="off"
                                        />
                                    </div>
                                    {/*Unidad de medida SUNAT */}
                                    <div className="sm:col-span-3">
                                        <label
                                            htmlFor="minimumUnitId"
                                            className="form-label"
                                        >
                                            Unidad de medida SUNAT Minima
                                        </label>
                                        <select
                                            name="minimumUnitId"
                                            id="minimumUnitId"
                                            onChange={handleInputChange}
                                            value={product.minimumUnitId}
                                            className="form-control"
                                            required
                                        >
                                            <option value={0}>
                                                Elegir unidad
                                            </option>
                                            {unitsData?.allUnits?.map(
                                                (o: IUnit, k: number) => (
                                                    <option
                                                        key={k}
                                                        value={o.id}
                                                    >{`${o.shortName} - ${o.description}`}</option>
                                                )
                                            )}
                                        </select>
                                    </div>
                                    <div className="sm:col-span-3">
                                        <label
                                            htmlFor="maximumUnitId"
                                            className="form-label"
                                        >
                                            Unidad de medida SUNAT Maxima
                                        </label>
                                        <select
                                            name="maximumUnitId"
                                            id="maximumUnitId"
                                            onChange={handleInputChange}
                                            value={product.maximumUnitId}
                                            className="form-control"
                                            required
                                        >
                                            <option value={0}>
                                                Elegir unidad
                                            </option>
                                            {unitsData?.allUnits?.map(
                                                (o: IUnit, k: number) => (
                                                    <option
                                                        key={k}
                                                        value={o.id}
                                                    >{`${o.shortName} - ${o.description}`}</option>
                                                )
                                            )}
                                        </select>
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label
                                            htmlFor="minimumFactor"
                                            className="form-label"
                                        >
                                            Factor de conversión Minimo
                                        </label>
                                        <input
                                            type="number"
                                            name="minimumFactor"
                                            id="minimumFactor"
                                            value={product.minimumFactor}
                                            onChange={
                                                handleInputChangeQuantityMinimum
                                            }
                                            onFocus={(e) => e.target.select()}
                                            className="form-control"
                                            required
                                        />
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label
                                            htmlFor="maximumFactor"
                                            className="form-label"
                                        >
                                            Factor de conversión Maximo
                                        </label>
                                        <input
                                            type="number"
                                            name="maximumFactor"
                                            id="maximumFactor"
                                            value={product.maximumFactor}
                                            onChange={
                                                handleInputChangeQuantityMinimum
                                            }
                                            onFocus={(e) => e.target.select()}
                                            className="form-control"
                                            required
                                        />
                                    </div>

                                    <ProductTariffForm
                                        setProduct={setProduct}
                                        product={product}
                                    />
                                    <div className="sm:col-span-6 mb-2">
                                        <label
                                            htmlFor="observation3"
                                            className="form-label"
                                        >
                                            Observación
                                        </label>
                                        <textarea
                                            id="observation3"
                                            name="observation"
                                            rows={5}
                                            className="form-control"
                                            maxLength={500}
                                            onChange={handleInputChange}
                                            value={product.observation || ""}
                                            onFocus={(e) => e.target.select()}
                                            placeholder="Escribe un comentario aquí"
                                        ></textarea>
                                    </div>
                                    <div className="sm:col-span-6 flex gap-6 mt-6">
                                        <div className="flex items-center">
                                            <input
                                                id="available3"
                                                name="available"
                                                checked={product.available}
                                                type="checkbox"
                                                onChange={handleCheckboxChange}
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                                            />
                                            <label
                                                htmlFor="available3"
                                                className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                                            >
                                                Activo
                                            </label>
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                id="subjectPerception3"
                                                name="subjectPerception"
                                                checked={
                                                    product.subjectPerception
                                                }
                                                type="checkbox"
                                                onChange={handleCheckboxChange}
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                                            />
                                            <label
                                                htmlFor="subjectPerception3"
                                                className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                                            >
                                                Sujeto a percepcion
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600  justify-end">
                                <button
                                    id="btn-save"
                                    type="submit"
                                    className="btn-green px-5 py-2 inline-flex items-center gap-2"
                                >
                                    <Save />
                                    {Number(product.id) > 0
                                        ? "Actualizar"
                                        : "Guardar"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ProductForm;
