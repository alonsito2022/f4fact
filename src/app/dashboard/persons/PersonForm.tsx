import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { toast } from "react-toastify";
import Save from "@/components/icons/Save";
import { Modal, ModalOptions } from "flowbite";
import {
    DocumentNode,
    gql,
    useLazyQuery,
    useMutation,
    useQuery,
} from "@apollo/client";

import { IDocumentType } from "@/app/types";

const SNT_PERSON_MUTATION = gql`
    mutation ($document: String!) {
        sntPerson(document: $document) {
            success
            message
            person {
                sntDocument
                sntNames
                sntAddress
                sntDepartment
                sntProvince
                sntDistrict
                sntId
                sntPhone
                sntShortName
                sntDocumentType
                sntDocumentNumber
                sntEmail
                sntIsEnabled
                sntIsSupplier
                sntIsClient
            }
        }
    }
`;

const ADD_PERSON_MUTATION = gql`
    mutation (
        $names: String!
        $shortName: String!
        $code: String
        $phone: String!
        $email: String!
        $address: String!
        $country: String!
        $districtId: String!
        $documentType: String!
        $documentNumber: String!
        $isEnabled: Boolean!
        $isSupplier: Boolean!
        $isClient: Boolean!
        $economicActivityMain: Int!
        $driverLicense: String
        $subsidiaryId: Int
    ) {
        createPerson(
            names: $names
            shortName: $shortName
            code: $code
            phone: $phone
            email: $email
            address: $address
            country: $country
            districtId: $districtId
            documentType: $documentType
            documentNumber: $documentNumber
            isEnabled: $isEnabled
            isSupplier: $isSupplier
            isClient: $isClient
            economicActivityMain: $economicActivityMain
            driverLicense: $driverLicense
            subsidiaryId: $subsidiaryId
        ) {
            message
            success
            person {
                id
                names
                shortName
                phone
                email
                address
                country
                economicActivityMain
                isEnabled
                isSupplier
                isClient
                documentNumber
                documentType
            }
            personAlreadyRegistered
        }
    }
`;

const UPDATE_PERSON = gql`
    mutation (
        $id: ID!
        $names: String!
        $code: String
        $shortName: String!
        $phone: String!
        $email: String!
        $address: String!
        $country: String!
        $districtId: String!
        $documentType: String!
        $documentNumber: String!
        $isEnabled: Boolean!
        $isSupplier: Boolean!
        $isClient: Boolean!
        $driverLicense: String
        $economicActivityMain: Int!
    ) {
        updatePerson(
            id: $id
            names: $names
            code: $code
            shortName: $shortName
            phone: $phone
            email: $email
            address: $address
            country: $country
            districtId: $districtId
            documentType: $documentType
            documentNumber: $documentNumber
            isEnabled: $isEnabled
            isSupplier: $isSupplier
            isClient: $isClient
            economicActivityMain: $economicActivityMain
            driverLicense: $driverLicense
        ) {
            message
            success
            person {
                id
                names
                address
                documentNumber
                documentType
            }
        }
    }
`;

const DOCUMENT_TYPES_QUERY = gql`
    query {
        allDocumentTypes {
            code
            name
        }
    }
`;

const inputClassName =
    "block w-full py-1.5 px-2 text-sm text-gray-900 border border-gray-300 rounded-2xl focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";

function PersonForm({
    modalPerson,
    setModalPerson,
    person,
    setPerson,
    auth,
    jwtToken,
    CUSTOMERS_QUERY,
    authContext,
    getVariables,
    initialStatePerson,
}: any) {
    const getAuthContext = () => ({
        context: authContext,
        headers: {
            "Content-Type": "application/json",
            Authorization: jwtToken ? `JWT ${jwtToken}` : "",
        },
    });

    const handleInputChange = async (
        event: ChangeEvent<
            HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = event.target;
        if (
            name === "documentType" &&
            event.target instanceof HTMLSelectElement
        ) {
            setPerson({
                ...person,
                [name]: value,
                documentNumber: "",
                names: "",
                address: "",
                districtId: "040601",
                provinceId: "0406",
                departmentId: "04",
            });
        } else if (
            name === "documentNumber" &&
            event.target instanceof HTMLInputElement
        ) {
            let documentType = person.documentType;
            // Reemplaza todos los caracteres que no son numéricos con una cadena vacía
            const formattedValue = value.replace(/[^0-9]/g, "");
            // Limita a 6 dígitos
            const limitedValue =
                documentType === "1"
                    ? formattedValue.slice(0, 8)
                    : documentType === "6"
                    ? formattedValue.slice(0, 11)
                    : formattedValue.slice(0, 15);
            setPerson({ ...person, [name]: limitedValue });
        } else {
            setPerson({ ...person, [name]: value });
        }
    };

    const handleCheckboxChange = ({
        target: { name, checked },
    }: ChangeEvent<HTMLInputElement>) => {
        console.log(name);
        console.log(checked);
        setPerson({ ...person, [name]: checked });
    };

    const [
        sntPersonMutation,
        {
            loading: foundSntPersonLoading,
            error: foundSntPersonError,
            data: foundSntPersonData,
        },
    ] = useMutation(SNT_PERSON_MUTATION, {
        context: authContext,
    });

    const handleSntDocument = async (documentNumber: string) => {
        let address = "";

        if (person?.documentType === "6" && documentNumber.length !== 11) {
            toast("Por favor ingrese un número RUC valido.", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
            });
            return;
        }

        if (person?.documentType === "1" && documentNumber.length !== 8) {
            toast("Por favor ingrese un número DNI valido.", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
            });
            return;
        }

        const { data, errors } = await sntPersonMutation({
            variables: { document: documentNumber },
        });
        if (errors) {
            toast(errors.toString(), {
                hideProgressBar: true,
                autoClose: 2000,
                type: "error",
            });
        } else {
            if (documentNumber.length === 11) {
                address = data.sntPerson.person.sntAddress;
            }

            setPerson({
                ...person,
                names: data.sntPerson.person.sntNames,
                address: address,
            });
            toast(data.sntPerson.message, {
                hideProgressBar: true,
                autoClose: 2000,
                type: "success",
            });
        }
    };

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

    //const [updatePerson] = useMutation(UPDATE_PERSON);
    const [updatePerson] = useCustomMutation(UPDATE_PERSON, CUSTOMERS_QUERY);
    const [createPerson] = useCustomMutation(
        ADD_PERSON_MUTATION,
        CUSTOMERS_QUERY
    );

    const {
        loading: documentTypesLoading,
        error: documentTypesError,
        data: documentTypesData,
    } = useQuery(DOCUMENT_TYPES_QUERY, {
        context: authContext,
        skip: !jwtToken,
    });

    const handleSaveEmployee = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (person?.documentNumber.length === 0) {
            toast("Por favor ingrese un número (RUC, DNI, Etc).", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
            });
            return;
        }
        if (String(person?.documentType) === "0") {
            toast("Por favor ingrese un tipo de documento valido.", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
            });
            return;
        }
        if (
            person?.documentType === "6" &&
            person?.documentNumber.length !== 11
        ) {
            toast("Por favor ingrese un número RUC valido.", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
            });
            return;
        }

        if (
            person?.documentType === "1" &&
            person?.documentNumber.length !== 8
        ) {
            toast("Por favor ingrese un número DNI valido.", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
            });
            return;
        }
        if (person?.names.length === 0) {
            toast("Por favor ingrese una razón social o nombre completo.", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
            });
            return;
        }
        if (person?.documentType === "6" && person?.address.length === 0) {
            toast("Por favor ingrese una direccion valida.", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
            });
            return;
        }
        try {
            if (Number(person.id) !== 0) {
                const values = {
                    id: person.id,
                    names: person.names,
                    code: person.code || "",
                    shortName: person.shortName || "",
                    phone: person.phone || "",
                    email: person.email || "",
                    address: person.address || "",
                    country: "PE",
                    districtId: "150101",
                    documentType: person.documentType,
                    documentNumber: person.documentNumber,
                    isEnabled: person.isEnabled,
                    isSupplier: person.isSupplier,
                    isClient: person.isClient,
                    economicActivityMain: 0,
                    driverLicense: person.driverLicense || "",
                };

                const { data, errors } = await updatePerson({
                    variables: values,
                });

                if (data.updatePerson.success) {
                    toast.success("Cliente actualizado correctamente");
                    modalPerson.hide();
                } else {
                    toast.error(data.updatePerson.message);
                }
            } else {
                const values = {
                    names: person.names,
                    code: person.code,
                    shortName: person.shortName,
                    phone: person.phone,
                    email: person.email,
                    address: person.address,
                    country: person.country,
                    districtId: person.districtId,
                    documentType: person.documentType,
                    documentNumber: person.documentNumber,
                    isEnabled: person.isEnabled,
                    isSupplier: person.isSupplier,
                    isClient: person.isClient,
                    economicActivityMain: 0,
                    driverLicense: person.driverLicense,
                    subsidiaryId: Number(auth?.user?.subsidiaryId),
                };
                try {
                    console.log(values);
                    const response = await createPerson({
                        variables: values,
                    });
                    if (response.data?.createPerson) {
                        toast(response.data.createPerson.message, {
                            hideProgressBar: true,
                            autoClose: 2000,
                            type: "success",
                        });
                        if (person.onSaveSuccess) {
                            const newPerson = response.data.createPerson.person;
                            setPerson({
                                ...initialStatePerson,
                                id: newPerson.id,
                                names: newPerson.names,
                                documentType: newPerson.documentType,
                                documentNumber: newPerson.documentNumber,
                            });
                            person.onSaveSuccess();
                        } else {
                            setPerson(initialStatePerson);
                            modalPerson.hide();
                        }
                    }
                } catch (error: any) {
                    if (error.networkError?.result?.data?.createProduct) {
                        const data = error.networkError.result.data;
                        toast(data.createProduct.message, {
                            hideProgressBar: true,
                            autoClose: 2000,
                            type: "success",
                        });
                        setPerson(initialStatePerson);
                        modalPerson.hide();
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
            toast.error(error.message);
        }
    };
    useEffect(() => {
        if (modalPerson == null) {
            const $targetEl = document.getElementById("modalAddPerson");
            const options: ModalOptions = {
                placement: "top-center",
                backdrop: "static",
                backdropClasses:
                    "bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40",
                closable: false,
            };
            setModalPerson(new Modal($targetEl, options));
        }
    }, []);

    return (
        <>
            {/* Large Modal */}
            <div
                id="modalAddPerson"
                tabIndex={-1}
                className="fixed top-0 left-0 right-0 z-50 hidden w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"
            >
                <div className="relative w-full max-w-2xl max-h-full">
                    {/* Modal content */}
                    <div className="relative bg-gray-50 rounded-lg shadow dark:bg-gray-700">
                        {/* Modal header */}
                        <div className="flex items-center justify-between p-3 md:p-4 border-b rounded-t dark:border-gray-600">
                            <h3 className="text-3xl font-medium text-gray-900 dark:text-white text-center w-full">
                                {Number(person.id) > 0
                                    ? "Editar Cliente"
                                    : "Registrar nuevo cliente o proveedor"}
                            </h3>
                            <button
                                type="button"
                                onClick={() => {
                                    modalPerson.hide();
                                }}
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
                        <div className="p-4 md:p-5 space-y-4">
                            <form onSubmit={handleSaveEmployee}>
                                <div className="grid gap-4 mb-4 sm:grid-cols-4 items-end">
                                    <div className="sm:col-span-1">
                                        <label
                                            htmlFor="documentType"
                                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                        >
                                            Tipo
                                        </label>
                                        <select
                                            id="documentType"
                                            name="documentType"
                                            value={person.documentType}
                                            onChange={handleInputChange}
                                            className={inputClassName}
                                        >
                                            {documentTypesData?.allDocumentTypes?.map(
                                                (
                                                    d: IDocumentType,
                                                    k: number
                                                ) => (
                                                    <option
                                                        key={k}
                                                        value={d.code}
                                                    >
                                                        {d.name}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>

                                    <div className="relative sm:col-span-3">
                                        <label
                                            htmlFor="documentNumber"
                                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                        >
                                            Número (RUC, DNI, Etc)
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                                <svg
                                                    className="w-3 h-3 text-gray-500 dark:text-gray-400"
                                                    aria-hidden="true"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        stroke="currentColor"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                                                    />
                                                </svg>
                                            </div>
                                            <input
                                                type="text"
                                                id="documentNumber"
                                                name="documentNumber"
                                                maxLength={
                                                    person.documentType === "1"
                                                        ? 8
                                                        : person.documentType ===
                                                          "6"
                                                        ? 11
                                                        : 15
                                                }
                                                inputMode="numeric"
                                                autoComplete="off"
                                                value={
                                                    person.documentNumber || ""
                                                }
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                onChange={handleInputChange}
                                                className="block w-full py-1.5 ps-10 text-sm text-gray-900 border border-gray-300 rounded-3xl focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                placeholder="Ingrese numero de documento"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    person.documentType ===
                                                        "1" ||
                                                    person.documentType === "6"
                                                        ? handleSntDocument(
                                                              person.documentNumber
                                                          )
                                                        : null
                                                }
                                                disabled={Number(person.id) > 0}
                                                className={`absolute end-1 bottom-1 px-3.5 py-1 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-xs dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700 ${
                                                    Number(person.id) > 0
                                                        ? "opacity-50 cursor-not-allowed"
                                                        : ""
                                                }`}
                                            >
                                                EXTRAER
                                            </button>
                                        </div>
                                    </div>

                                    <div className="sm:col-span-4">
                                        <label
                                            htmlFor="names"
                                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                        >
                                            Nombres o Razón Social
                                        </label>
                                        <input
                                            type="text"
                                            id="names"
                                            name="names"
                                            value={person.names}
                                            onChange={handleInputChange}
                                            autoComplete="off"
                                            maxLength={200}
                                            className={inputClassName}
                                            placeholder=""
                                        />
                                    </div>

                                    <div className="sm:col-span-4">
                                        <label
                                            htmlFor="shortName"
                                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                        >
                                            Razón comercial (Marca)
                                        </label>
                                        <input
                                            type="text"
                                            id="shortName"
                                            name="shortName"
                                            value={person.shortName || ""}
                                            onChange={handleInputChange}
                                            autoComplete="off"
                                            maxLength={50}
                                            className={inputClassName}
                                            placeholder=""
                                        />
                                    </div>

                                    <div className="sm:col-span-4">
                                        <label
                                            htmlFor="address"
                                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                        >
                                            Dirección fiscal
                                        </label>
                                        <input
                                            type="text"
                                            id="address"
                                            name="address"
                                            value={person.address || ""}
                                            onChange={handleInputChange}
                                            autoComplete="off"
                                            maxLength={500}
                                            className={inputClassName}
                                            placeholder="Ingrese dirección fiscal"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label
                                            htmlFor="email"
                                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                        >
                                            Email principal
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={person.email || ""}
                                            onChange={handleInputChange}
                                            autoComplete="off"
                                            className={inputClassName}
                                            placeholder="email@ejemplo.com"
                                        />
                                    </div>

                                    <div className="sm:col-span-2 hidden">
                                        <label
                                            htmlFor="email2"
                                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                        >
                                            1er Email opcional
                                        </label>
                                        <input
                                            type="email"
                                            id="email2"
                                            name="email2"
                                            value={person.email2 || ""}
                                            onChange={handleInputChange}
                                            autoComplete="off"
                                            className={inputClassName}
                                            placeholder="email@ejemplo.com"
                                        />
                                    </div>
                                    <div className="sm:col-span-2 hidden">
                                        <label
                                            htmlFor="email3"
                                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                        >
                                            2do Email opcional
                                        </label>
                                        <input
                                            type="email"
                                            id="email3"
                                            name="email3"
                                            value={person.email3 || ""}
                                            onChange={handleInputChange}
                                            autoComplete="off"
                                            className={inputClassName}
                                            placeholder="email@ejemplo.com"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label
                                            htmlFor="phone"
                                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                        >
                                            Teléfono
                                        </label>
                                        <input
                                            type="text"
                                            id="phone"
                                            name="phone"
                                            value={person.phone || ""}
                                            onChange={handleInputChange}
                                            autoComplete="off"
                                            className={inputClassName}
                                            placeholder="921267878"
                                        />
                                    </div>

                                    <div className="sm:col-span-4">
                                        <label
                                            htmlFor="code"
                                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                        >
                                            Código del cliente (opcional)
                                        </label>
                                        <input
                                            type="text"
                                            id="code"
                                            name="code"
                                            value={person.code || ""}
                                            onChange={handleInputChange}
                                            autoComplete="off"
                                            className={inputClassName}
                                            placeholder=""
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label
                                            htmlFor="driverLicense"
                                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                        >
                                            Licencia de Conducir (opcional)
                                        </label>
                                        <input
                                            type="text"
                                            id="driverLicense"
                                            name="driverLicense"
                                            value={person.driverLicense || ""}
                                            onChange={handleInputChange}
                                            autoComplete="off"
                                            className={inputClassName}
                                            placeholder=""
                                        />
                                    </div>

                                    <div className="sm:col-span-2 hidden">
                                        <label
                                            htmlFor="vehiclePlate"
                                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                        >
                                            Placa Vehículo (opcional)
                                        </label>
                                        <input
                                            type="text"
                                            id="vehiclePlate"
                                            name="vehiclePlate"
                                            value={person.vehiclePlate || ""}
                                            onChange={handleInputChange}
                                            autoComplete="off"
                                            className={inputClassName}
                                            placeholder="ABC-123"
                                        />
                                    </div>

                                    <div className="sm:col-span-4">
                                        <div className="flex items-center">
                                            <input
                                                id="isEnabled"
                                                name="isEnabled"
                                                checked={person.isEnabled}
                                                type="checkbox"
                                                onChange={handleCheckboxChange}
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                            />
                                            <label
                                                htmlFor="isEnabled"
                                                className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                                            >
                                                Activo
                                            </label>
                                        </div>
                                    </div>

                                    <div className="sm:col-span-4">
                                        <button
                                            type="submit"
                                            className="w-full btn-green py-3 px-5 text-xl font-light inline-flex items-center justify-center gap-2 mb-2"
                                        >
                                            <Save />
                                            {Number(person.id) > 0
                                                ? "Actualizar Cliente o Proveedor"
                                                : "Crear Cliente o Proveedor"}
                                        </button>
                                        <div className="flex justify-center">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    modalPerson.hide();
                                                }}
                                                className="btn-dark px-4 py-1.5 text-sm inline-flex items-center gap-2"
                                            >
                                                Cerrar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default PersonForm;
