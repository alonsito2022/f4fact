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
        $minimumUnitId: Int!
        $maximumUnitId: Int!
        $maximumFactor: Int!
        $minimumFactor: Int!
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
            minimumUnitId: $minimumUnitId
            maximumUnitId: $maximumUnitId
            maximumFactor: $maximumFactor
            minimumFactor: $minimumFactor
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
        $minimumUnitId: Int!
        $maximumUnitId: Int!
        $maximumFactor: Int!
        $minimumFactor: Int!
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
            minimumUnitId: $minimumUnitId
            maximumUnitId: $maximumUnitId
            maximumFactor: $maximumFactor
            minimumFactor: $minimumFactor
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
    jwtToken,
    typeAffectationsData,
    PRODUCTS_QUERY,
    productFilterObj,
}: any) {
    const getAuthContext = () => ({
        headers: {
            "Content-Type": "application/json",
            Authorization: jwtToken ? `JWT ${jwtToken}` : "",
        },
    });

    const {
        loading: unitsLoading,
        error: unitsError,
        data: unitsData,
    } = useQuery(UNIT_QUERY, {
        context: getAuthContext(),
        skip: !jwtToken,
    });

    function useCustomMutation(
        mutation: DocumentNode,
        refetchQuery: DocumentNode
    ) {
        const getVariables = () => ({
            criteria: productFilterObj.criteria,
            searchText: productFilterObj.searchText,
            available: productFilterObj.available,
            activeType: productFilterObj.activeType,
            subjectPerception: productFilterObj.subjectPerception,
            typeAffectationId: Number(productFilterObj.typeAffectationId),
            limit: Number(productFilterObj.limit),
        });

        return useMutation(mutation, {
            context: getAuthContext(),
            refetchQueries: () => [
                {
                    query: refetchQuery,
                    context: getAuthContext(),
                    variables: getVariables(),
                },
            ],
            onError: (err) => console.error("Error in unit:", err), // Log the error for debugging
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
        const formattedValue = value.replace(/[^0-9]/g, "").slice(0, 6);
        const numberValue = parseFloat(formattedValue);

        if (
            formattedValue === "" ||
            (numberValue >= 1 && numberValue <= 999999)
        ) {
            // Si está dentro del rango, asigna el valor normal
            setProduct({ ...product, [name]: numberValue || 1 });
        } else {
            // Si está fuera de rango, asigna el valor por defecto (1)
            setProduct({ ...product, [name]: 1 });
            // Mostrar un mensaje de error al usuario (opcional)
            console.error(
                "El valor debe estar entre 1 y 999999.99. Se ha establecido el valor mínimo en 1."
            );
        }
    };

    const handleCheckboxChange = ({
        target: { name, checked },
    }: ChangeEvent<HTMLInputElement>) => {
        setProduct({ ...product, [name]: checked });
    };

    const handleSaveProduct = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // if (Number(product.minimumFactor) === 0) {
        //     toast('Por favor ingrese un factor para la unidad minima.', { hideProgressBar: true, autoClose: 2000, type: 'warning' })
        //     return;
        // }

        if (Number(product.id) !== 0) {
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

                minimumUnitId: Number(product.minimumUnitId),
                maximumUnitId: Number(product.maximumUnitId),
                maximumFactor: Number(product.maximumFactor),
                minimumFactor: Number(product.minimumFactor),
            };

            const { data, errors } = await updateProduct({
                variables: values,
            });
            console.log(data, errors);
            if (errors) {
                toast(errors.toString(), {
                    hideProgressBar: true,
                    autoClose: 2000,
                    type: "error",
                });
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

                minimumUnitId: Number(product.minimumUnitId),
                maximumUnitId: Number(product.maximumUnitId),
                maximumFactor: Number(product.maximumFactor),
                minimumFactor: Number(product.minimumFactor),
            };
            const { data, errors } = await createProduct({
                variables: values,
            });
            if (errors) {
                toast(errors.toString(), {
                    hideProgressBar: true,
                    autoClose: 2000,
                    type: "error",
                });
            } else {
                toast(data.createProduct.message, {
                    hideProgressBar: true,
                    autoClose: 2000,
                    type: "success",
                });
                // const pdt = data.createProduct.product;
                // if(pdt)
                //     setProduct({...product, id: pdt.id, name: pdt.name});
                setProduct(initialStateProduct);
                modalProduct.hide();
            }
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
                className="fixed top-0 left-0 right-0 z-50 hidden w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"
            >
                <div className="relative w-full max-w-4xl max-h-full">
                    {/* Modal content */}
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                        {/* Modal header */}
                        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
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

                        <form onSubmit={handleSaveProduct}>
                            {/* Modal body */}
                            <div className="p-4 md:p-5 space-y-4">
                                <input
                                    type="hidden"
                                    name="id"
                                    id="id"
                                    value={product.id}
                                />

                                <div className="grid gap-4 mb-4 sm:grid-cols-6">
                                    <div className="sm:col-span-4">
                                        <label
                                            htmlFor="name"
                                            className="form-label"
                                        >
                                            Nombre del producto o servicio
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            maxLength={100}
                                            value={product.name}
                                            onChange={handleInputChange}
                                            onFocus={(e) => e.target.select()}
                                            className="form-control"
                                            placeholder="Escriba un nombre aquí"
                                            required
                                            autoComplete="off"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label
                                            htmlFor="activeType"
                                            className="form-label"
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
                                            className="form-control"
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

                                    <div className="sm:col-span-2 hidden">
                                        <label
                                            htmlFor="code"
                                            className="form-label"
                                        >
                                            Código Producto Sunat
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

                                    <div className="sm:col-span-2 hidden">
                                        <label
                                            htmlFor="ean"
                                            className="form-label"
                                        >
                                            EAN
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

                                    <div className="sm:col-span-6">
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

                                    <div className="sm:col-span-3 mb-2">
                                        <input
                                            id="available3"
                                            name="available"
                                            checked={product.available}
                                            type="checkbox"
                                            onChange={handleCheckboxChange}
                                            className="form-check-input"
                                        />
                                        <label
                                            htmlFor="available3"
                                            className="form-check-label"
                                        >
                                            Activo
                                        </label>
                                    </div>

                                    <div className="sm:col-span-3 mb-2">
                                        <input
                                            id="subjectPerception3"
                                            name="subjectPerception"
                                            checked={product.subjectPerception}
                                            type="checkbox"
                                            onChange={handleCheckboxChange}
                                            className="form-check-input"
                                        />
                                        <label
                                            htmlFor="subjectPerception3"
                                            className="form-check-label"
                                        >
                                            Sujeto a percepcion
                                        </label>
                                    </div>

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
