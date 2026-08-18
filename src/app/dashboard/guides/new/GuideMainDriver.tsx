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
            driverLicense
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
        onCompleted: (data) => {
            console.log("data", data);
        },
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
            console.log("value", value);
            console.log(
                "variables",
                {
                    search: value,
                    documentType: guide.mainDriverDocumentType,
                    isDriver: true,
                },
                authContext
            );
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
                        mainDriverDriverLicense: selectedPerson.driverLicense,
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
        <div className="relative bg-white dark:bg-gray-800/80 backdrop-blur rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.1)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)] overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-60" />
            <div className="p-5 sm:p-6">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-5">
                    Datos del Conductor
                </h2>
                <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-5">
                    {/* Botón Agregar Vehiculo */}
                    <div className="md:col-span-3 lg:col-span-5">
                        <div
                            id="other_vehicles"
                            className="w-full grid gap-4 mb-4"
                        >
                            <fieldset className="border border-gray-200/80 dark:border-gray-600/60 p-4 rounded-xl bg-gray-50/70 dark:bg-gray-700/20">
                                <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Datos del Conductor Principal
                                </legend>
                                <div className="grid sm:grid-cols-1 md:grid-cols-6 gap-4">
                                    {/* Tipo de documento */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Tipo de documento
                                        </label>
                                        <select
                                            value={guide.mainDriverDocumentType}
                                            name="mainDriverDocumentType"
                                            onChange={handleGuide}
                                            className="w-full h-10 sm:h-11 px-3 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-600/80 bg-white dark:bg-gray-700/30 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200"
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
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                        >
                                            Documento número{" "}
                                            <span className="text-xs text-green-500 font-normal">
                                                (Enter)
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
                                                    e.preventDefault();
                                                    handleSntDocument();
                                                }
                                            }}
                                            className="w-full h-10 sm:h-11 px-3 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-600/80 bg-white dark:bg-gray-700/30 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200"
                                            autoComplete="off"
                                        />
                                    </div>
                                    <div className="sm:col-span-2 relative">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Nombres y Apellidos del conductor
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
                                            className="w-full h-10 sm:h-11 px-3 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-600/80 bg-white dark:bg-gray-700/30 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200"
                                            autoComplete="off"
                                        />
                                        {showDropdown &&
                                            searchClientData
                                                ?.searchClientByParameter
                                                ?.length > 0 && (
                                                <div
                                                    ref={dropdownRef}
                                                    className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                                                >
                                                    {searchClientData.searchClientByParameter.map(
                                                        (
                                                            person: IPerson,
                                                            index: number
                                                        ) => (
                                                            <div
                                                                key={person.id}
                                                                className={`px-4 py-2.5 text-sm cursor-pointer ${
                                                                    index ===
                                                                    selectedIndex
                                                                        ? "bg-blue-50 dark:bg-blue-600 text-blue-700 dark:text-blue-200"
                                                                        : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-200"
                                                                }`}
                                                                onClick={() => {
                                                                    setGuide({
                                                                        ...guide,
                                                                        mainDriverDocumentNumber:
                                                                            person.documentNumber,
                                                                        mainDriverNames:
                                                                            person.names,
                                                                        mainDriverDriverLicense:
                                                                            person.driverLicense,
                                                                    });
                                                                    setShowDropdown(
                                                                        false
                                                                    );
                                                                }}
                                                            >
                                                                <div className="font-medium">{person.names}</div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400">{person.documentNumber}</div>
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
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
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
                                            className="w-full h-10 sm:h-11 px-3 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-600/80 bg-white dark:bg-gray-700/30 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200"
                                            autoComplete="off"
                                        />
                                    </div>
                                </div>
                            </fieldset>
                            {guide?.documentType === "09" ||
                                (guide?.documentType === "31" && (
                                    <fieldset className="border border-gray-200/80 dark:border-gray-600/60 p-4 rounded-xl bg-gray-50/70 dark:bg-gray-700/20">
                                        <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Datos de los Conductores Secundarios (Máximo 2)
                                        </legend>
                                        <div className="grid gap-4">
                                            {guide.othersDrivers.map(
                                                (
                                                    item: IPerson,
                                                    index: number
                                                ) => (
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
                                ))}
                        </div>
                        {guide?.documentType === "09" ||
                            (guide?.documentType === "31" && (
                                <button
                                    type="button"
                                    className="group relative inline-flex items-center justify-center gap-2 h-10 px-5 bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300 rounded-xl font-medium text-sm border-2 border-dashed border-blue-300/80 dark:border-blue-500/40 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-md active:scale-[0.98] transition-all duration-200"
                                    onClick={handleAddDriver}
                                >
                                    <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/25">
                                        <svg
                                            className="w-3.5 h-3.5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2.5}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M12 4v16m8-8H4"
                                            />
                                        </svg>
                                    </span>
                                    Agregar conductor
                                </button>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GuideMainDriver;
