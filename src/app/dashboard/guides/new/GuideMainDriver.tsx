import React, { ChangeEvent, useEffect, useState } from "react";
import GuideDriverItem from "./GuideDriverItem";
import { IDocumentType, IPerson } from "@/app/types";
import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { toast } from "react-toastify";
import SearchableDropdown from "@/components/SearchableDropdown";

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
                sntDriverLicense
            }
        }
    }
`;
const SEARCH_CLIENT_BY_PARAMETER = gql`
    query SearchClient(
        $search: String!
        $documentType: String
        $operationDocumentType: String
        $isClient: Boolean
        $isDriver: Boolean
        $isSupplier: Boolean
        $isReceiver: Boolean
    ) {
        searchClientByParameter(
            search: $search
            documentType: $documentType
            operationDocumentType: $operationDocumentType
            isClient: $isClient
            isDriver: $isDriver
            isSupplier: $isSupplier
            isReceiver: $isReceiver
        ) {
            id
            names
            documentNumber
            documentType
        }
    }
`;
const DOCUMENT_TYPE_QUERY = gql`
    query {
        allDocumentTypes {
            code
            name
        }
    }
`;

function GuideMainDriver({
    guide,
    setGuide,
    handleGuide,
    authContext,
    auth,
}: any) {
    const [driverSearch, setDriverSearch] = useState("");

    // Add these state variables at the beginning of the component
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    // Add this ref at the beginning of your component
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    const {
        loading: documentTypesLoading,
        error: documentTypesError,
        data: documentTypesData,
    } = useQuery(DOCUMENT_TYPE_QUERY, {
        context: authContext,
        skip: !auth?.jwtToken,
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

    const [
        searchClientQuery,
        {
            loading: searchClientLoading,
            error: searchClientError,
            data: searchClientData,
        },
    ] = useLazyQuery(SEARCH_CLIENT_BY_PARAMETER, {
        context: authContext,
        fetchPolicy: "network-only",
        onError: (err) => console.error("Error in Search Client:", err),
    });

    const handleSntDocument = async () => {
        if (
            guide.mainDriverDocumentType === "6" &&
            guide.mainDriverDocumentNumber.length !== 11
        ) {
            toast("Por favor ingrese un número RUC valido.", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
            });
            return;
        }
        if (
            guide.mainDriverDocumentType === "1" &&
            guide.mainDriverDocumentNumber.length !== 8
        ) {
            toast("Por favor ingrese un número DNI valido.", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
            });
            return;
        }
        const { data, errors } = await sntPersonMutation({
            variables: { document: guide.mainDriverDocumentNumber },
        });
        if (errors) {
            toast(errors.toString(), {
                hideProgressBar: true,
                autoClose: 2000,
                type: "error",
            });
        } else {
            setGuide({
                ...guide,
                mainDriverNames: data.sntPerson.person.sntNames,
                mainDriverDriverLicense: data.sntPerson.person.sntDriverLicense,
            });
            toast(data.sntPerson.message, {
                hideProgressBar: true,
                autoClose: 2000,
                type: "success",
            });
        }
    };
    const handleAddDriver = () => {
        if (guide.othersDrivers.length < 2) {
            setGuide({
                ...guide,
                othersDrivers: [
                    ...guide.othersDrivers,
                    {
                        index: guide.othersDrivers.length,
                        documentType: "1",
                        documentNumber: "",
                        names: "",
                        driverLicense: "",
                    },
                ],
            });
        } else {
            toast("Máximo 2 conductores.", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
            });
        }
    };

    const handleRemoveDriver = (index: number) => {
        if (window.confirm("¿Estás seguro de eliminar este conductor?")) {
            setGuide({
                ...guide,
                othersDrivers: guide.othersDrivers.filter(
                    (_: IPerson, i: number) => i !== index
                ),
            });
        }
    };
    const handleDriverChange = (index: number, field: string, value: any) => {
        const newItems = [...guide.othersDrivers];
        newItems[index] = { ...newItems[index], [field]: value };
        setGuide({ ...guide, othersDrivers: newItems });
    };

    const handleDriverSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        // setDriverSearch(event.target.value);
        const value = event.target.value;
        setDriverSearch(value);
        setGuide({
            ...guide,
            mainDriverNames: value,
        });
        setShowDropdown(true);
        if (value.length > 2) {
            searchClientQuery({
                variables: {
                    search: value,
                    documentType: guide.mainDriverDocumentType,
                    isDriver: true,
                },
            });
        }
    };

    // Add this handler for keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!searchClientData?.searchClientByParameter?.length) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev < searchClientData.searchClientByParameter.length - 1
                        ? prev + 1
                        : prev
                );
                // Add this scroll logic
                setTimeout(() => {
                    const selectedElement =
                        dropdownRef.current?.children[selectedIndex + 1];
                    selectedElement?.scrollIntoView({ block: "nearest" });
                }, 0);
                break;
            case "ArrowUp":
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
                // Add this scroll logic
                setTimeout(() => {
                    const selectedElement =
                        dropdownRef.current?.children[selectedIndex - 1];
                    selectedElement?.scrollIntoView({ block: "nearest" });
                }, 0);
                break;
            case "Enter":
                e.preventDefault();
                if (selectedIndex >= 0) {
                    const selectedPerson =
                        searchClientData.searchClientByParameter[selectedIndex];
                    setGuide({
                        ...guide,
                        mainDriverDocumentNumber: selectedPerson.documentNumber,
                        mainDriverNames: selectedPerson.names,
                    });
                    setShowDropdown(false);
                }
                break;
            case "Escape":
                setShowDropdown(false);
                break;
        }
    };

    useEffect(() => {
        if (driverSearch.length > 2) {
            const queryVariables: {
                search: string;
                documentType?: string;
                isDriver: boolean;
            } = {
                search: driverSearch,
                isDriver: true,
            };

            if (guide.mainDriverDocumentType) {
                queryVariables.documentType = guide.mainDriverDocumentType;
            }

            searchClientQuery({
                variables: queryVariables,
            });
        }
    }, [driverSearch]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <>
            <fieldset className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <legend className="px-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
                    DATOS DEL CONDUCTOR
                </legend>
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-5 ">
                    {/* Botón Agregar Vehiculo */}
                    <div className="md:col-span-3 lg:col-span-5">
                        <div
                            id="other_vehicles"
                            className="w-full grid gap-4 mb-4"
                        >
                            <fieldset className="border border-gray-300 dark:border-gray-600 p-4 rounded-lg shadow-sm bg-white dark:bg-gray-800">
                                <legend className="px-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
                                    Datos del Conductor Principal
                                </legend>
                                <div className="grid sm:grid-cols-1 md:grid-cols-6 gap-4">
                                    {/* Tipo de documento */}
                                    <div>
                                        <label className="text-sm text-gray-700 dark:text-gray-200">
                                            Tipo de documento
                                        </label>
                                        <select
                                            value={guide.mainDriverDocumentType}
                                            name="mainDriverDocumentType"
                                            onChange={handleGuide}
                                            className="text-lg w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {documentTypesData?.allDocumentTypes?.map(
                                                (
                                                    o: IDocumentType,
                                                    k: number
                                                ) => (
                                                    <option
                                                        key={k}
                                                        value={o.code}
                                                    >
                                                        {o.name}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>
                                    {/* Documento número */}
                                    <div>
                                        <label
                                            htmlFor="mainDriverDocumentNumber"
                                            className="text-sm font-medium text-gray-900 dark:text-gray-200"
                                        >
                                            Documento número{" "}
                                            <span className="text-green-500">
                                                (dar enter)
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            name="mainDriverDocumentNumber"
                                            id="mainDriverDocumentNumber"
                                            maxLength={
                                                guide?.mainDriverDocumentType ===
                                                "1"
                                                    ? 8
                                                    : guide?.mainDriverDocumentType ===
                                                      "6"
                                                    ? 11
                                                    : 25
                                            }
                                            value={
                                                guide.mainDriverDocumentNumber
                                            }
                                            onChange={handleGuide}
                                            onFocus={(e) => e.target.select()}
                                            onKeyDown={(e) => {
                                                if (
                                                    e.key === "Enter" &&
                                                    (guide?.mainDriverDocumentType ===
                                                        "1" ||
                                                        guide?.mainDriverDocumentType ===
                                                            "6")
                                                ) {
                                                    e.preventDefault(); // Evita que el formulario se envíe si está dentro de un formulario
                                                    handleSntDocument(); // Llamada a la función de consulta
                                                }
                                            }}
                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            autoComplete="off"
                                        />
                                    </div>
                                    {/* Nombres y Apellidos del conductor */}
                                    {/* <div className="md:col-span-2">
                                        <label className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                            Nombres y Apellidos del conductor
                                        </label>
                                        <input
                                            type="search"
                                            maxLength={200}
                                            onFocus={(e) => e.target.select()}
                                            // name="mainDriverNames"
                                            // value={guide.mainDriverNames}
                                            // onChange={handleGuide}
                                            onChange={handleDriverSearchChange}
                                            onInput={handleDriverSelect}
                                            list="driverList"
                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            autoComplete="off"
                                        />
                                        <datalist id="driverList">
                                            {searchClientData?.searchClientByParameter?.map(
                                                (n: IPerson, index: number) => (
                                                    <option
                                                        key={index}
                                                        data-key={n.id}
                                                        value={n.names}
                                                    />
                                                )
                                            )}
                                        </datalist>
                                    </div> */}
                                    <div className="sm:col-span-2 relative">
                                        <label className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                            Nombres y Apellidos del conductor
                                            {/* {" showDropdown: " +
                                                showDropdown +
                                                " searchClientData: " +
                                                searchClientData
                                                    ?.searchClientByParameter
                                                    ?.length} */}
                                        </label>
                                        <input
                                            type="text"
                                            maxLength={200}
                                            onFocus={(e) => {
                                                e.target.select();
                                                setShowDropdown(true);
                                            }}
                                            onChange={handleDriverSearchChange}
                                            onKeyDown={handleKeyDown}
                                            name="mainDriverNames"
                                            value={guide.mainDriverNames}
                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            autoComplete="off"
                                        />
                                        {showDropdown &&
                                            searchClientData
                                                ?.searchClientByParameter
                                                ?.length > 0 && (
                                                <div
                                                    ref={dropdownRef}
                                                    className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto"
                                                >
                                                    {searchClientData.searchClientByParameter.map(
                                                        (
                                                            person: IPerson,
                                                            index: number
                                                        ) => (
                                                            <div
                                                                key={person.id}
                                                                className={`px-4 py-2 cursor-pointer ${
                                                                    index ===
                                                                    selectedIndex
                                                                        ? "bg-blue-100 dark:bg-blue-600"
                                                                        : "hover:bg-gray-100 dark:hover:bg-gray-600"
                                                                }`}
                                                                onClick={() => {
                                                                    setGuide({
                                                                        ...guide,
                                                                        mainDriverDocumentNumber:
                                                                            person.documentNumber,
                                                                        mainDriverNames:
                                                                            person.names,
                                                                    });
                                                                    setShowDropdown(
                                                                        false
                                                                    );
                                                                }}
                                                            >
                                                                {person.names}
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            )}
                                    </div>
                                    {/* Licencia de conducir */}
                                    <div>
                                        <label
                                            htmlFor="mainDriverDriverLicense"
                                            className="text-sm font-medium text-gray-900 dark:text-gray-200"
                                        >
                                            Licencia de conducir
                                        </label>
                                        <input
                                            type="text"
                                            name="mainDriverDriverLicense"
                                            id="mainDriverDriverLicense"
                                            maxLength={12}
                                            value={
                                                guide.mainDriverDriverLicense
                                            }
                                            onChange={handleGuide}
                                            onFocus={(e) => e.target.select()}
                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            autoComplete="off"
                                        />
                                    </div>
                                </div>
                            </fieldset>
                            {guide?.documentType === "09" && (
                                <fieldset className="border border-gray-300 dark:border-gray-600 p-4 rounded-lg shadow-sm bg-white dark:bg-gray-800">
                                    <legend className="px-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
                                        Datos de los Conductores Secundarios
                                        (Máximo 2 conductores)
                                    </legend>
                                    <div className="grid  gap-4">
                                        {guide.othersDrivers.map(
                                            (item: IPerson, index: number) => (
                                                <div
                                                    key={index}
                                                    className="grid md:grid-cols-6 lg:grid-cols-6 gap-4"
                                                >
                                                    <GuideDriverItem
                                                        index={index}
                                                        item={item}
                                                        onRemove={() =>
                                                            handleRemoveDriver(
                                                                index
                                                            )
                                                        }
                                                        onChange={
                                                            handleDriverChange
                                                        }
                                                        documentTypes={
                                                            documentTypesData?.allDocumentTypes ||
                                                            []
                                                        }
                                                        authContext={
                                                            authContext
                                                        }
                                                    />
                                                </div>
                                            )
                                        )}
                                    </div>
                                </fieldset>
                            )}
                        </div>
                        {guide?.documentType === "09" && (
                            <button
                                type="button"
                                className="px-5 py-2 bg-blue-600 dark:bg-cyan-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
                                onClick={handleAddDriver}
                            >
                                AGREGAR CONDUCTOR
                            </button>
                        )}
                    </div>
                </div>
            </fieldset>
        </>
    );
}

export default GuideMainDriver;
