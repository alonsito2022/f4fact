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
import {
    ICountry,
    IDepartment,
    IDistrict,
    IDocumentType,
    IEconomicActivity,
    INationality,
    IProvince,
    IUser,
} from "@/app/types";
import { init } from "next/dist/compiled/webpack/webpack";

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
        $subsidiaryId: Int
    ) {
        createPerson(
            names: $names
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

const COUNTRIES_QUERY = gql`
    query {
        allCountries {
            code
            name
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

const ECONOMIC_ACTIVITIES_QUERY = gql`
    query {
        allEconomicActivities {
            code
            name
        }
    }
`;

const DEPARTMENTS_QUERY = gql`
    query {
        departments {
            id
            description
        }
    }
`;

const PROVINCES_QUERY = gql`
    query ($departmentId: String!) {
        provincesByDepartmentId(departmentId: $departmentId) {
            id
            description
        }
    }
`;

const DISTRICTS_QUERY = gql`
    query ($provinceId: String!) {
        districtsByProvinceId(provinceId: $provinceId) {
            id
            description
        }
    }
`;

function ClientForm({
    modalAddClient,
    setModalAddClient,
    setClientSearch,
    clientSearch,
    person,
    setPerson,
    auth,
    authContext,
    SEARCH_CLIENT_BY_PARAMETER,
    sale,
    setSale,
}: any) {
    const [addPerson] = useMutation(ADD_PERSON_MUTATION, {
        context: authContext,
        onCompleted: (data) => {
            if (
                data.createPerson.success ||
                data.createPerson.personAlreadyRegistered === true
            ) {
                const newPerson = data.createPerson.person;

                // Update sale state with complete client information
                setSale({
                    ...sale,
                    clientId: Number(newPerson.id),
                    clientName: newPerson.names,
                    clientDocumentType: newPerson.documentType,
                });

                // Update client search field
                setClientSearch(
                    `${newPerson.documentNumber} ${newPerson.names}`
                );

                modalAddClient.hide();
            }
        },
        onError: (err) => {
            console.error("Error in person mutation:", err);
            toast("Error al crear el cliente", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "error",
            });
        },
    });
    useEffect(() => {
        if (modalAddClient == null) {
            const $targetEl = document.getElementById("modalAddClient");
            const options: ModalOptions = {
                placement: "top-center",
                backdrop: "static",
                backdropClasses:
                    "bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40",
                closable: false,
            };
            setModalAddClient(new Modal($targetEl, options));
        }
    }, [modalAddClient, setModalAddClient]);

    const {
        loading: departmentsLoading,
        error: departmentsError,
        data: departmentsData,
    } = useQuery(DEPARTMENTS_QUERY, {
        context: authContext,
        skip: !auth?.jwtToken,
    });

    const {
        loading: economicActivitiesLoading,
        error: economicActivitiesError,
        data: economicActivitiesData,
    } = useQuery(ECONOMIC_ACTIVITIES_QUERY, {
        context: authContext,
        skip: !auth?.jwtToken,
        onError: (err) => console.error("Error in unit:", err),
    });

    const {
        loading: documentTypesLoading,
        error: documentTypesError,
        data: documentTypesData,
    } = useQuery(DOCUMENT_TYPES_QUERY, {
        context: authContext,
        skip: !auth?.jwtToken,
    });

    const {
        loading: countriesLoading,
        error: countriesError,
        data: countriesData,
    } = useQuery(COUNTRIES_QUERY, {
        context: authContext,
        skip: !auth?.jwtToken,
    });

    const [
        provincesQuery,
        {
            loading: provincesLoading,
            error: provincesError,
            data: provincesData,
        },
    ] = useLazyQuery(PROVINCES_QUERY, {
        context: authContext,
    });

    const [
        districtsQuery,
        {
            loading: districtsLoading,
            error: districtsError,
            data: districtsData,
        },
    ] = useLazyQuery(DISTRICTS_QUERY, {
        context: authContext,
    });

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
        let departmentId = "04";
        let provinceId = "0401";
        let districtId = "040101";
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
            // console.log("data.sntPerson.person", data.sntPerson.person);
            if (documentNumber.length === 11) {
                departmentId = data.sntPerson.person.sntDepartment || "04";
                provinceId = data.sntPerson.person.sntProvince || "0401";
                districtId = data.sntPerson.person.sntDistrict || "040101";
                address = data.sntPerson.person.sntAddress || "";
            }

            await provincesQuery({ variables: { departmentId: departmentId } });
            await districtsQuery({ variables: { provinceId: provinceId } });

            setPerson({
                ...person,
                names: data.sntPerson.person.sntNames,
                address: address,
                departmentId: departmentId,
                provinceId: provinceId,
                districtId: districtId,
                id: Number(data.sntPerson.person.sntId),
                phone: data.sntPerson.person.sntPhone,
                shortName: data.sntPerson.person.sntShortName,
                documentType: data.sntPerson.person.sntDocumentType,
                documentNumber: data.sntPerson.person.sntDocumentNumber,
                email: data.sntPerson.person.sntEmail,
                isEnabled: data.sntPerson.person.sntIsEnabled,
                isSupplier: data.sntPerson.person.sntIsSupplier,
                isClient: data.sntPerson.person.sntIsClient,
            });
            toast(data.sntPerson.message, {
                hideProgressBar: true,
                autoClose: 2000,
                type: "success",
            });
        }
    };

    const handleInputChange = async (
        event: ChangeEvent<
            HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = event.target;
        if (name == "departmentId") {
            const { data, error } = await provincesQuery({
                variables: { departmentId: value },
            });
            if (error) {
                toast(error?.message, {
                    hideProgressBar: true,
                    autoClose: 2000,
                    type: "error",
                });
            } else {
                setPerson({
                    ...person,
                    departmentId: value,
                    provinceId: "0",
                    districtId: "0",
                });
            }
        } else if (name == "provinceId") {
            const { data, error } = await districtsQuery({
                variables: { provinceId: value },
            });
            if (error) {
                toast(error?.message, {
                    hideProgressBar: true,
                    autoClose: 2000,
                    type: "error",
                });
            } else {
                setPerson({ ...person, provinceId: value, districtId: "0" });
            }
        } else if (
            name === "economicActivityMainReadable" &&
            event.target instanceof HTMLInputElement
        ) {
            const dataList = event.target.list;
            if (dataList) {
                const option = Array.from(dataList.options).find(
                    (option) => option.value === value
                );
                if (option) {
                    const selectedId = option.getAttribute("data-key");
                    setPerson({
                        ...person,
                        economicActivityMain: Number(selectedId),
                        economicActivityMainReadable: value,
                    });
                } else {
                    setPerson({
                        ...person,
                        economicActivityMain: 0,
                        economicActivityMainReadable: "",
                    });
                }
            } else {
                console.log("sin datalist");
            }
        } else if (
            name === "countryReadable" &&
            event.target instanceof HTMLInputElement
        ) {
            const dataList = event.target.list;
            if (dataList) {
                const option = Array.from(dataList.options).find(
                    (option) => option.value === value
                );
                if (option) {
                    const selectedId = option.getAttribute("data-key");
                    setPerson({
                        ...person,
                        country: selectedId,
                        countryReadable: value,
                    });
                } else {
                    setPerson({
                        ...person,
                        country: "PE",
                        countryReadable: "PERÚ",
                    });
                }
            } else {
                console.log("sin datalist");
            }
        } else if (
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
        setPerson({ ...person, [name]: checked });
    };

    const handleSaveClient = async (e: FormEvent<HTMLFormElement>) => {
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

        if (Number(person.id) !== 0) {
            // en caso de que la persona ya exista, se actualiza el estado de la venta
            setSale({
                ...sale,
                clientId: Number(person.id),
                clientName: person.names,
                clientDocumentType: person.documentType,
            });

            // se actualiza el campo de busqueda de clientes
            setClientSearch(`${person.documentNumber} ${person.names}`);

            modalAddClient.hide();
        } else {
            const values = {
                names: person.names,
                shortName: person.shortName,
                phone: person.phone,
                email: person.email,
                address: person.address,
                country: person.country,
                districtId: person.districtId || "040601",
                documentType: person.documentType,
                documentNumber: person.documentNumber,
                isEnabled: person.isEnabled,
                isSupplier: true,
                isClient: true,
                economicActivityMain: Number(person.economicActivityMain),
                subsidiaryId: Number(auth?.user?.subsidiaryId),
            };

            try {
                const { data, errors } = await addPerson({
                    variables: values,
                });
                if (data?.createPerson) {
                    toast(data.createPerson.message, {
                        hideProgressBar: true,
                        autoClose: 2000,
                        type: "success",
                    });
                }
            } catch (error) {
                console.error("Error creating person:", error);
                toast("Error al crear el cliente", {
                    hideProgressBar: true,
                    autoClose: 2000,
                    type: "error",
                });
            }
        }
    };
    useEffect(() => {
        if (modalAddClient == null) {
            const $targetEl = document.getElementById("modalAddClient");
            const options: ModalOptions = {
                placement: "top-center",
                backdrop: "static",
                backdropClasses:
                    "bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40",
                closable: false,
            };
            setModalAddClient(new Modal($targetEl, options));
        }
    }, []);
    return (
        <>
            {/* Large Modal */}
            <div
                id="modalAddClient"
                tabIndex={-1}
                className="fixed top-0 left-0 right-0 z-50 hidden w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"
            >
                <div className="relative w-full max-w-4xl max-h-full">
                    {/* Modal content */}
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                        {/* Modal header */}
                        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                            <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                                {Number(person.id) > 0
                                    ? "Editar"
                                    : "Registrar nuevo cliente"}
                            </h3>
                            <button
                                type="button"
                                onClick={() => {
                                    modalAddClient.hide();
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

                        <form onSubmit={handleSaveClient}>
                            <div className="p-6 md:p-8 space-y-6">
                                <div className="grid gap-6 mb-6 sm:grid-cols-4 items-start">
                                    {/* Group document fields */}
                                    <fieldset className="sm:col-span-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-4">
                                        <legend className="text-sm font-semibold px-2">
                                            Información del Documento
                                        </legend>
                                        <div className="grid gap-4 sm:grid-cols-4">
                                            {/* Document Type and Number fields */}
                                            <div className="sm:col-span-2">
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
                                                    className="block w-full py-2 pl-3 pr-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
                                            <div className="sm:col-span-2">
                                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                                    Número (RUC, DNI, Etc){" "}
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                        <svg
                                                            className="w-4 h-4 text-gray-500 dark:text-gray-400"
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
                                                        maxLength={
                                                            person.documentType ===
                                                            "1"
                                                                ? 8
                                                                : person.documentType ===
                                                                  "6"
                                                                ? 11
                                                                : 15
                                                        }
                                                        name="documentNumber"
                                                        onFocus={(e) =>
                                                            e.target.select()
                                                        }
                                                        onKeyDown={(e) => {
                                                            if (
                                                                e.key ===
                                                                "Enter"
                                                            ) {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                        inputMode="numeric"
                                                        autoComplete="off"
                                                        value={
                                                            person.documentNumber
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        className="block w-full py-2 pl-10 pr-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                    />
                                                    {person.documentType ===
                                                        "1" ||
                                                    person.documentType ===
                                                        "6" ? (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleSntDocument(
                                                                    person.documentNumber
                                                                )
                                                            }
                                                            disabled={
                                                                foundSntPersonLoading
                                                            }
                                                            className="absolute right-1 bottom-1 px-3 py-1 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-xs dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                                                        >
                                                            EXTRAER
                                                        </button>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>
                                    </fieldset>
                                    {/* Group personal information */}
                                    <fieldset className="sm:col-span-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-4">
                                        <legend className="text-sm font-semibold px-2">
                                            Información Personal
                                        </legend>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            {/* Names, Email, Phone fields */}
                                            <div className="sm:col-span-2">
                                                <label
                                                    htmlFor="names"
                                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                                >
                                                    Razón social o nombre
                                                    completo
                                                </label>
                                                <input
                                                    type="text"
                                                    id="names"
                                                    name="names"
                                                    value={person.names}
                                                    onChange={handleInputChange}
                                                    autoComplete="off"
                                                    maxLength={200}
                                                    className="block w-full py-2 px-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                />
                                            </div>

                                            {person.documentType === "6" && (
                                                <div className="sm:col-span-2">
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
                                                        value={person.shortName}
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        maxLength={50}
                                                        autoComplete="off"
                                                        className="block w-full py-2 px-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                    />
                                                </div>
                                            )}

                                            {person.documentType === "M" && (
                                                <div className="sm:col-span-4">
                                                    <label
                                                        htmlFor="economicActivityMainReadable"
                                                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                                    >
                                                        Actividad Económica
                                                        (Principal):
                                                    </label>
                                                    <input
                                                        type="search"
                                                        id="economicActivityMainReadable"
                                                        disabled={
                                                            economicActivitiesLoading
                                                        }
                                                        name="economicActivityMainReadable"
                                                        value={
                                                            person.economicActivityMainReadable ||
                                                            ""
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        autoComplete="off"
                                                        list="economicActivityMainReadableList"
                                                        className="block w-full py-2 px-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                        placeholder="Actividad(es) Económica(s)"
                                                    />
                                                    <datalist id="economicActivityMainReadableList">
                                                        {economicActivitiesData?.allEconomicActivities?.map(
                                                            (
                                                                n: IEconomicActivity,
                                                                index: number
                                                            ) => (
                                                                <option
                                                                    key={index}
                                                                    value={
                                                                        n.name
                                                                    }
                                                                    data-key={
                                                                        n.code
                                                                    }
                                                                />
                                                            )
                                                        )}
                                                    </datalist>
                                                </div>
                                            )}
                                            <div className="sm:col-span-2">
                                                <label
                                                    htmlFor="email"
                                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                                >
                                                    Email
                                                </label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    value={person.email || ""}
                                                    onChange={handleInputChange}
                                                    autoComplete="off"
                                                    className="block w-full py-2 px-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                    placeholder="uncorreo@gmail.com"
                                                />
                                            </div>

                                            <div className="sm:col-span-2">
                                                <label
                                                    htmlFor="phone"
                                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                                >
                                                    Celular
                                                </label>
                                                <input
                                                    type="text"
                                                    id="phone"
                                                    name="phone"
                                                    value={person.phone || ""}
                                                    onChange={handleInputChange}
                                                    autoComplete="off"
                                                    className="block w-full py-2 px-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                    placeholder="921267878"
                                                />
                                            </div>
                                        </div>
                                    </fieldset>
                                    {/* Group address information */}
                                    <fieldset className="sm:col-span-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-4">
                                        <legend className="text-sm font-semibold px-2">
                                            Ubicación
                                        </legend>
                                        <div className="grid gap-4 sm:grid-cols-4">
                                            {/* Address, Department, Province, District fields */}
                                            {(person.documentType === "6" ||
                                                person.documentType ===
                                                    "-") && (
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
                                                        value={
                                                            person.address || ""
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        maxLength={500}
                                                        autoComplete="off"
                                                        className="block w-full py-2 px-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                        placeholder="Av. Aviacion S/N"
                                                    />
                                                </div>
                                            )}
                                            <div className="sm:col-span-1">
                                                {departmentsLoading ? (
                                                    <div className="text-gray-900 dark:text-white">
                                                        Cargando...
                                                    </div>
                                                ) : departmentsError ? (
                                                    <div className="text-red-600 dark:text-red-400">
                                                        Error: No autorizado o
                                                        error en la consulta.{" "}
                                                        {
                                                            departmentsError.message
                                                        }
                                                    </div>
                                                ) : departmentsData ? (
                                                    <>
                                                        <label
                                                            htmlFor="departmentId"
                                                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                                        >
                                                            Departamento
                                                        </label>
                                                        <select
                                                            id="departmentId"
                                                            name="departmentId"
                                                            value={
                                                                person?.departmentId
                                                            }
                                                            onChange={
                                                                handleInputChange
                                                            }
                                                            required
                                                            className="block w-full py-2 pl-3 pr-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                        >
                                                            <option value={"0"}>
                                                                ELEGIR
                                                            </option>
                                                            {departmentsData?.departments?.map(
                                                                (
                                                                    d: IDepartment,
                                                                    k: number
                                                                ) => (
                                                                    <option
                                                                        key={k}
                                                                        value={
                                                                            d.id
                                                                        }
                                                                    >
                                                                        {d.description.replace(
                                                                            "DEPARTAMENTO ",
                                                                            ""
                                                                        )}
                                                                    </option>
                                                                )
                                                            )}
                                                        </select>
                                                    </>
                                                ) : (
                                                    <>
                                                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                                            Departamento
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="block w-full py-2 pl-3 pr-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                            disabled
                                                            value={
                                                                "No hay datos..."
                                                            }
                                                        />
                                                    </>
                                                )}
                                            </div>

                                            <div className="sm:col-span-1">
                                                {provincesLoading ? (
                                                    <div className="text-gray-900 dark:text-white">
                                                        Cargando...
                                                    </div>
                                                ) : provincesError ? (
                                                    <div className="text-red-600 dark:text-red-400">
                                                        Error: No autorizado o
                                                        error en la consulta.{" "}
                                                        {provincesError.message}
                                                    </div>
                                                ) : provincesData ? (
                                                    <>
                                                        <label
                                                            htmlFor="provinceId"
                                                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                                        >
                                                            Provincia
                                                        </label>
                                                        <select
                                                            id="provinceId"
                                                            name="provinceId"
                                                            value={
                                                                person?.provinceId
                                                            }
                                                            onChange={
                                                                handleInputChange
                                                            }
                                                            required
                                                            className="block w-full py-2 pl-3 pr-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                        >
                                                            <option value={"0"}>
                                                                ELEGIR
                                                            </option>
                                                            {provincesData?.provincesByDepartmentId?.map(
                                                                (
                                                                    d: IProvince,
                                                                    k: number
                                                                ) => (
                                                                    <option
                                                                        key={k}
                                                                        value={
                                                                            d.id
                                                                        }
                                                                    >
                                                                        {
                                                                            d.description
                                                                        }
                                                                    </option>
                                                                )
                                                            )}
                                                        </select>
                                                    </>
                                                ) : (
                                                    <>
                                                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                                            Provincia
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="block w-full py-2 pl-3 pr-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                            disabled
                                                            value={
                                                                "Seleccione..."
                                                            }
                                                        />
                                                    </>
                                                )}
                                            </div>

                                            <div className="sm:col-span-1">
                                                {districtsLoading ? (
                                                    <div className="text-gray-900 dark:text-white">
                                                        Cargando...
                                                    </div>
                                                ) : districtsError ? (
                                                    <div className="text-red-600 dark:text-red-400">
                                                        Error: No autorizado o
                                                        error en la consulta.{" "}
                                                        {districtsError.message}
                                                    </div>
                                                ) : districtsData ? (
                                                    <>
                                                        <label
                                                            htmlFor="districtId"
                                                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                                        >
                                                            Distrito
                                                        </label>
                                                        <select
                                                            id="districtId"
                                                            name="districtId"
                                                            value={
                                                                person?.districtId
                                                            }
                                                            onChange={
                                                                handleInputChange
                                                            }
                                                            required
                                                            className="block w-full py-2 pl-3 pr-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                        >
                                                            <option value={"0"}>
                                                                ELEGIR
                                                            </option>
                                                            {districtsData?.districtsByProvinceId?.map(
                                                                (
                                                                    d: IDistrict,
                                                                    k: number
                                                                ) => (
                                                                    <option
                                                                        key={k}
                                                                        value={
                                                                            d.id
                                                                        }
                                                                    >
                                                                        {
                                                                            d.description
                                                                        }
                                                                    </option>
                                                                )
                                                            )}
                                                        </select>
                                                    </>
                                                ) : (
                                                    <>
                                                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                                            Distrito
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="block w-full py-2 pl-3 pr-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                            disabled
                                                            value={
                                                                "No hay datos..."
                                                            }
                                                        />
                                                    </>
                                                )}
                                            </div>

                                            <div className="sm:col-span-1">
                                                <label
                                                    htmlFor="countryReadable"
                                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                                >
                                                    País
                                                </label>
                                                <input
                                                    type="search"
                                                    id="countryReadable"
                                                    disabled={countriesLoading}
                                                    name="countryReadable"
                                                    value={
                                                        person.countryReadable
                                                    }
                                                    onChange={handleInputChange}
                                                    autoComplete="off"
                                                    list="countryList"
                                                    className="block w-full py-2 pl-3 pr-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                    placeholder="País"
                                                />
                                                <datalist id="countryList">
                                                    {countriesData?.allCountries?.map(
                                                        (
                                                            n: ICountry,
                                                            index: number
                                                        ) => (
                                                            <option
                                                                key={index}
                                                                value={n.name}
                                                                data-key={
                                                                    n.code
                                                                }
                                                            />
                                                        )
                                                    )}
                                                </datalist>
                                            </div>
                                        </div>
                                    </fieldset>

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
                                </div>
                            </div>

                            {/* Modal footer */}
                            <div className="flex items-center p-4 md:p-5 space-x-3 rtl:space-x-reverse border-t border-gray-200 rounded-b dark:border-gray-600">
                                <button
                                    type="button"
                                    onClick={() => {
                                        modalAddClient.hide();
                                    }}
                                    className="px-5 py-2 inline-flex items-center gap-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:text-white dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                                >
                                    Cerrar
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 inline-flex items-center gap-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-800"
                                >
                                    <Save />
                                    {Number(person.id) !== 0
                                        ? "Seleccionar Cliente o Proveedor"
                                        : "Crear Cliente o Proveedor"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ClientForm;
