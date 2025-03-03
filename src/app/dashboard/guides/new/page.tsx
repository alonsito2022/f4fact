"use client";
import {
    IDocumentType,
    IGuideModeType,
    IGuideReasonType,
    IOperationDetail,
    IPerson,
    IRelatedDocument,
    ISubsidiary,
    IUnit,
    IVehicle,
} from "@/app/types";
import Breadcrumb from "@/components/Breadcrumb";
import Add from "@/components/icons/Add";
import { useAuth } from "@/components/providers/AuthProvider";
import { gql, useLazyQuery, useQuery } from "@apollo/client";
import React, { ChangeEvent, useEffect, useMemo, useState } from "react";
import GuideDetailItem from "../GuideDetailItem";
import Save from "@/components/icons/Save";
import GuideDocumentItem from "../GuideDocumentItem";
import GuideVehicleItem from "../GuideVehicleItem";
import GuideDriverItem from "../GuideDriverItem";

const today = new Date().toISOString().split("T")[0];
const initialStateSale = {
    id: 0,
    serial: "",
    correlative: "",
    emitDate: today,
    client: {
        id: 0,
        names: "",
    },
    igvType: 18,
    igvPercentage: 18,
    operationType: "01",
    documentType: "01",
    currencyType: "PEN",
    saleExchangeRate: "",
    userId: 0,
    userName: "",
    operationdetailSet: [],
    cashflowSet: [],
    discountForItem: "",
    discountGlobal: "",
    discountPercentageGlobal: "",
    totalDiscount: "",
    totalTaxed: "",
    totalUnaffected: "",
    totalExonerated: "",
    totalIgv: "",
    totalFree: "",
    totalAmount: "",
    totalPerception: "",
    totalToPay: "",
    totalPayed: "",
    totalTurned: "",
    parentOperationId: 0,
};
const initialStateGuide = {
    id: 0,
    serial: "",
    correlative: "",
    emitDate: today,
    dueDate: today,

    clientName: "",
    clientId: 0,
    igvType: 18,
    igvPercentage: 18,
    operationType: "01",
    documentType: "09",
    currencyType: "PEN",
    saleExchangeRate: "",
    userId: 0,
    userName: "",
    operationdetailSet: [
        {
            index: 0,
            productName: "",
            description: "",
            quantity: 0,
        },
    ] as IOperationDetail[],
    relatedDocuments: [
        {
            index: 0,
            serial: "",
            documentType: "01",
            correlative: 0,
        },
    ] as IRelatedDocument[],
    cashflowSet: [],
    discountForItem: "",
    discountGlobal: "",
    discountPercentageGlobal: "",
    totalDiscount: "",
    totalTaxed: "",
    totalUnaffected: "",
    totalExonerated: "",
    totalIgv: "",
    totalFree: "",
    totalAmount: "",
    totalPerception: "",
    totalToPay: "",
    totalPayed: "",
    totalTurned: "",

    creditNoteType: "NA",
    parentOperationId: 0,

    guideModeTransfer: "01",
    guideReasonTransfer: "04",
    transferDate: today,
    othersDrivers: [] as IPerson[],
    othersVehicles: [
        // {
        //     id: 0,
        //     index: 0,
        //     licensePlate: "",
        // },
    ] as IVehicle[],
    totalWeight: 0,
    quantityPackages: 0,
    weightMeasurementUnitCode: "KGM",
    // weightMeasurementUnit: {
    //     id: 0,
    //     shortName: "",
    //     description: "",
    //     code: "",
    // } as IUnit,
    transportationCompanyTypeDoc: "6",
    transportationCompanyDoc: "",
    transportationCompanyBusinessName: "",
    transportationCompanyMtcRegistrationNumber: "",
    mainVehicleLicensePlate: "",
    mainDriverDocumentType: "1",
    mainDriverDocumentNumber: "",
    mainDriverDriverLicense: "",
    mainDriverNames: "",
    guideOriginId: 0,
    guideOriginDistrictId: "",
    guideOriginDistrictDescription: "",
    guideOriginAddress: "",
    guideOriginSerial: "",
    guideArrivalId: 0,
    guideArrivalDistrictId: "",
    guideArrivalDistrictDescription: "",
    guideArrivalAddress: "",
    guideArrivalSerial: "",
    observation: "",
    receiverDocumentType: "1",
    receiverDocumentNumber: "",
    receiverNames: "",
};
const PRODUCTS_QUERY = gql`
    query ($subsidiaryId: Int!) {
        allProducts(subsidiaryId: $subsidiaryId) {
            id
            code
            name
            available
            activeType
            activeTypeReadable
            ean
            weightInKilograms
            minimumUnitId
            maximumUnitId
            minimumUnitName
            maximumUnitName
            maximumFactor
            minimumFactor
            typeAffectationId
            typeAffectationName
            subjectPerception
            observation
        }
    }
`;

const SEARCH_CLIENT_BY_PARAMETER = gql`
    query ($search: String!) {
        searchClientByParameter(search: $search) {
            id
            documentType
            documentNumber
            names
        }
    }
`;

const SEARCH_GEOGRAPHIC_LOCATION_BY_PARAMETER = gql`
    query ($search: String!) {
        searchGeographicLocationCode(search: $search) {
            districtId
            districtDescription
            provinceDescription
            departmentDescription
        }
    }
`;
const SALE_QUERY_BY_ID = gql`
    query ($pk: ID!) {
        getSaleById(pk: $pk) {
            id
            emitDate
            operationDate
            currencyType
            documentTypeReadable
            documentType
            igvType
            igvPercentage
            operationType
            serial
            correlative
            totalAmount
            totalTaxed
            totalDiscount
            totalExonerated
            totalUnaffected
            totalFree
            totalIgv
            totalToPay
            totalPayed
            operationStatus
            sendClient
            linkXml
            linkXmlLow
            linkCdr
            linkCdrLow
            sunatStatus
            operationStatusReadable
            sunatDescription
            sunatDescriptionLow
            codeHash
            client {
                id
                names
            }
            subsidiary {
                company {
                    businessName
                }
            }
            operationdetailSet {
                id
                productId
                productName
                quantity
                unitValue
                unitPrice
                igvPercentage
                discountPercentage
                totalDiscount
                totalValue
                totalIgv
                totalAmount
                totalPerception
                totalToPay
                typeAffectationId
                productTariffId
                remainingQuantity
                quantityReturned
                quantityAvailable
            }
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
const GUIDE_REASON_QUERY = gql`
    query {
        allGuideReasons {
            code
            name
        }
    }
`;

const GUIDE_MODE_QUERY = gql`
    query {
        allGuideModes {
            code
            name
        }
    }
`;

function NewGuidePage() {
    const [sale, setSale] = useState(initialStateSale);
    const [guide, setGuide] = useState(initialStateGuide);
    const auth = useAuth();

    const handleAddItem = () => {
        setGuide({
            ...guide,
            operationdetailSet: [
                ...guide.operationdetailSet,
                {
                    index: guide.operationdetailSet.length,
                    productName: "",
                    description: "",
                    quantity: 0,
                },
            ],
        });
    };

    const handleAddDocument = () => {
        setGuide({
            ...guide,
            relatedDocuments: [
                ...guide.relatedDocuments,
                {
                    index: guide.relatedDocuments.length,
                    serial: "",
                    documentType: "01",
                    correlative: 0,
                },
            ],
        });
    };

    const handleAddVehicle = () => {
        if (guide.othersVehicles.length < 3)
            setGuide({
                ...guide,
                othersVehicles: [
                    ...guide.othersVehicles,
                    {
                        index: guide.othersVehicles.length,
                        licensePlate: "",
                        id: 0,
                    },
                ],
            });
    };

    const handleAddDriver = () => {
        if (guide.othersDrivers.length < 3)
            setGuide({
                ...guide,
                othersDrivers: [
                    ...guide.othersDrivers,
                    {
                        index: guide.othersDrivers.length,
                        mainDriverDocumentType: "1",
                        mainDriverDocumentNumber: "",
                        mainDriverNames: "",
                        mainDriverDriverLicense: "",
                    },
                ],
            });
    };

    const handleRemoveItem = (index: number) => {
        if (window.confirm("¿Estás seguro de eliminar este ítem?")) {
            setGuide({
                ...guide,
                operationdetailSet: guide.operationdetailSet.filter(
                    (_, i) => i !== index
                ),
            });
        }
    };

    const handleRemoveDocument = (index: number) => {
        if (window.confirm("¿Estás seguro de eliminar este documento?")) {
            setGuide({
                ...guide,
                relatedDocuments: guide.relatedDocuments.filter(
                    (_, i) => i !== index
                ),
            });
        }
    };

    const handleRemoveVehicle = (index: number) => {
        if (window.confirm("¿Estás seguro de eliminar este vehiculo?")) {
            setGuide({
                ...guide,
                othersVehicles: guide.othersVehicles.filter(
                    (_, i) => i !== index
                ),
            });
        }
    };

    const handleRemoveDriver = (index: number) => {
        if (window.confirm("¿Estás seguro de eliminar este conductor?")) {
            setGuide({
                ...guide,
                othersDrivers: guide.othersDrivers.filter(
                    (_, i) => i !== index
                ),
            });
        }
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...guide.operationdetailSet];
        newItems[index] = { ...newItems[index], [field]: value };
        setGuide({ ...guide, operationdetailSet: newItems });
    };

    const handleDocumentChange = (index: number, field: string, value: any) => {
        const newItems = [...guide.relatedDocuments];
        newItems[index] = { ...newItems[index], [field]: value };
        setGuide({ ...guide, relatedDocuments: newItems });
    };

    const handleVehicleChange = (index: number, field: string, value: any) => {
        const newItems = [...guide.othersVehicles];
        newItems[index] = { ...newItems[index], [field]: value };
        setGuide({ ...guide, othersVehicles: newItems });
    };

    const handleDriverChange = (index: number, field: string, value: any) => {
        const newItems = [...guide.othersDrivers];
        newItems[index] = { ...newItems[index], [field]: value };
        setGuide({ ...guide, othersDrivers: newItems });
    };

    const authContext = useMemo(
        () => ({
            headers: {
                "Content-Type": "application/json",
                Authorization: auth?.jwtToken ? `JWT ${auth.jwtToken}` : "",
            },
        }),
        [auth?.jwtToken]
    );
    const getVariables = () => ({
        subsidiaryId: Number(auth?.user?.subsidiaryId),
    });

    const {
        loading: productsLoading,
        error: productsError,
        data: productsData,
    } = useQuery(PRODUCTS_QUERY, {
        context: authContext,
        variables: getVariables(),
        skip: !auth?.jwtToken,
    });

    const {
        loading: documentTypesLoading,
        error: documentTypesError,
        data: documentTypesData,
    } = useQuery(DOCUMENT_TYPE_QUERY, {
        context: authContext,
        skip: !auth?.jwtToken,
    });

    const {
        loading: guideReasonsLoading,
        error: guideReasonsError,
        data: guideReasonsData,
    } = useQuery(GUIDE_REASON_QUERY, {
        context: authContext,
        skip: !auth?.jwtToken,
    });

    const {
        loading: guideModesLoading,
        error: guideModesError,
        data: guideModesData,
    } = useQuery(GUIDE_MODE_QUERY, {
        context: authContext,
        skip: !auth?.jwtToken,
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

    const [
        searchGeographicLocationCodeQuery,
        {
            loading: searchGeographicLocationLoading,
            error: searchGeographicLocationError,
            data: searchGeographicLocationData,
        },
    ] = useLazyQuery(SEARCH_GEOGRAPHIC_LOCATION_BY_PARAMETER, {
        context: authContext,
        fetchPolicy: "network-only",
        onError: (err) =>
            console.error("Error in Search Geographic Location:", err),
    });

    const [clientSearch, setClientSearch] = useState("");
    const [originSearch, setOriginSearch] = useState("");
    const [arrivalSearch, setArrivalSearch] = useState("");
    const [originSearchResults, setOriginSearchResults] = useState<
        ISubsidiary[]
    >([]);
    const [arrivalSearchResults, setArrivalSearchResults] = useState<
        ISubsidiary[]
    >([]);

    const handleClientSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        setClientSearch(event.target.value);
    };
    const handleClientSelect = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedOption = event.target.value;
        const selectedData = searchClientData?.searchClientByParameter?.find(
            (person: IPerson) =>
                `${person.documentNumber} ${person.names}` === selectedOption
        );

        if (selectedData) {
            setGuide({
                ...guide,
                clientId: selectedData.id,
                clientName: selectedData.names,
            });
        }
    };
    useEffect(() => {
        if (clientSearch.length > 2) {
            searchClientQuery({
                variables: { search: clientSearch },
            });
        }
    }, [clientSearch]);
    const handleOriginSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        setOriginSearch(event.target.value);
    };

    const handleArrivalSearchChange = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        setArrivalSearch(event.target.value);
    };

    const handleOriginSelect = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedOption = event.target.value;
        const selectedData =
            searchGeographicLocationData?.searchGeographicLocationCode?.find(
                (location: ISubsidiary) =>
                    `${location.districtId} - ${location.districtDescription} | ${location.provinceDescription} | ${location.departmentDescription}` ===
                    selectedOption
            );

        if (selectedData) {
            setGuide({
                ...guide,
                guideOriginDistrictId: selectedData.districtId,
                guideOriginDistrictDescription:
                    selectedData.districtDescription,
            });
        }
    };

    const handleArrivalSelect = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedOption = event.target.value;
        const selectedData =
            searchGeographicLocationData?.searchGeographicLocationCode?.find(
                (location: ISubsidiary) =>
                    `${location.districtId} - ${location.districtDescription} | ${location.provinceDescription} | ${location.departmentDescription}` ===
                    selectedOption
            );

        if (selectedData) {
            setGuide({
                ...guide,
                guideArrivalDistrictId: selectedData.districtId,
                guideArrivalDistrictDescription:
                    selectedData.districtDescription,
            });
        }
    };

    useEffect(() => {
        if (originSearch.length > 2) {
            searchGeographicLocationCodeQuery({
                variables: { search: originSearch },
                onCompleted: (data) => {
                    setOriginSearchResults(data.searchGeographicLocationCode);
                },
            });
        }
    }, [originSearch]);

    useEffect(() => {
        if (arrivalSearch.length > 2) {
            searchGeographicLocationCodeQuery({
                variables: { search: arrivalSearch },
                onCompleted: (data) => {
                    setArrivalSearchResults(data.searchGeographicLocationCode);
                },
            });
        }
    }, [arrivalSearch]);
    useEffect(() => {
        if (auth?.user?.subsidiarySerial) {
            const subsidiarySerial = auth?.user?.subsidiarySerial;
            console.log("subsidiarySerial", subsidiarySerial);
            if (subsidiarySerial) {
                const lastTwoDigits = subsidiarySerial.slice(-2);
                let prefix = "";

                switch (guide.documentType) {
                    case "09":
                        prefix = "TP";
                        break;
                    case "31":
                        prefix = "VP";
                        break;
                    default:
                        prefix = "";
                }

                const customSerial = `${prefix}${lastTwoDigits}`;
                setGuide((prevSale) => ({
                    ...prevSale,
                    serial: customSerial,
                }));
            }
            // if(guide?.documentType)
        }
    }, [auth?.user?.subsidiarySerial, guide.documentType]);

    const [
        saleQuery,
        {
            loading: filteredSaleLoading,
            error: filteredSaleError,
            data: filteredSaleData,
        },
    ] = useLazyQuery(SALE_QUERY_BY_ID, {
        context: authContext,
        fetchPolicy: "network-only",
        onCompleted: (data) => {
            const dataSale = data.getSaleById;
            const igv = Number(dataSale?.igvPercentage) / 100;
            console.log(igv);
            setSale(dataSale);
            const formattedOperationdetailSet = dataSale.operationdetailSet
                .filter(
                    (detail: IOperationDetail) =>
                        Number(detail.quantityAvailable) > 0
                )
                .map((detail: IOperationDetail, index: number) => ({
                    ...detail,
                    quantity: Number(detail.quantityAvailable).toString(),
                    quantityReturned: Number(detail.quantityReturned),
                    quantityAvailable: Number(detail.quantityAvailable),
                    unitValue: Number(detail.unitValue).toFixed(2),
                    unitPrice: Number(detail.unitPrice).toFixed(2),
                    igvPercentage: Number(detail.igvPercentage).toFixed(2),
                    discountPercentage: Number(
                        detail.discountPercentage
                    ).toFixed(2),
                    totalDiscount: Number(detail.totalDiscount).toFixed(2),
                    totalValue: Number(
                        Number(detail.unitValue) *
                            Number(detail.quantityAvailable)
                    ).toFixed(2),
                    totalIgv: Number(
                        Number(detail.unitValue) *
                            Number(detail.quantityAvailable) *
                            igv
                    ).toFixed(2),
                    totalAmount: Number(
                        Number(detail.unitValue) *
                            Number(detail.quantityAvailable) *
                            (1 + igv)
                    ).toFixed(2),
                    totalPerception: Number(detail.totalPerception).toFixed(2),
                    totalToPay: Number(detail.totalToPay).toFixed(2),
                    temporaryId: index + 1,
                    productTariffId: Number(detail.productTariffId),
                    id: Number(detail.id),
                }));

            setGuide((prevSale) => ({
                ...prevSale,
                igvType: Number(
                    dataSale?.igvType?.toString().replace("A_", "")
                ),
                currencyType: dataSale?.currencyType,
                saleExchangeRate: dataSale?.saleExchangeRate
                    ? dataSale?.saleExchangeRate
                    : "",
                operationdetailSet: formattedOperationdetailSet,
                clientId: Number(dataSale?.client?.id),
                clientName: dataSale?.client?.names,
                parentOperationId: Number(dataSale?.id),
                totalAmount: Number(dataSale?.totalAmount).toFixed(2),
                totalFree: Number(dataSale?.totalFree).toFixed(2),
                totalIgv: Number(dataSale?.totalIgv).toFixed(2),
                totalTaxed: Number(dataSale?.totalTaxed).toFixed(2),
                totalUnaffected: Number(dataSale?.totalUnaffected).toFixed(2),
                totalExonerated: Number(dataSale?.totalExonerated).toFixed(2),
                totalDiscount: Number(dataSale?.totalDiscount).toFixed(2),
                discountForItem: Number(
                    dataSale?.discountForItem ? dataSale?.discountForItem : 0
                ).toFixed(2),
                discountGlobal: Number(
                    dataSale?.discountGlobal ? dataSale?.discountGlobal : 0
                ).toFixed(2),
                totalPerception: Number(
                    dataSale?.totalPerception ? dataSale?.totalPerception : 0
                ).toFixed(2),
                totalToPay: Number(dataSale?.totalToPay).toFixed(2),
            }));
        },
        onError: (err) => console.error("Error in sale:", err, auth?.jwtToken),
    });
    const handleGuide = (
        event: ChangeEvent<
            HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = event.target;
        setGuide({ ...guide, [name]: value });
    };
    const saveGuide = () => {
        console.log("guide", guide);
    };
    return (
        <>
            <div className="p-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 lg:mt-1.5 dark:bg-gray-800 dark:border-gray-700">
                <div className="w-full mb-1">
                    <Breadcrumb
                        section={"Guías de Remisión"}
                        article={"Nueva Guía"}
                    />
                </div>
            </div>
            <div className="flex flex-col space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden shadow-lg rounded-lg">
                            <div className="p-4 md:p-5 space-y-6">
                                {/* Cabecera de guia */}
                                <fieldset className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                                    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-5 ">
                                        {/* CPE Cliente */}
                                        <div className="md:col-span-1 lg:col-span-2">
                                            <label
                                                htmlFor="invoiceClientName"
                                                className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                            >
                                                Cliente
                                            </label>
                                            <input
                                                type="search"
                                                id="clientSearch"
                                                maxLength={100}
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                value={clientSearch}
                                                onChange={
                                                    handleClientSearchChange
                                                }
                                                onBlur={handleClientSelect}
                                                list="clientList"
                                                autoComplete="off"
                                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <datalist id="clientList">
                                                {searchClientData?.searchClientByParameter?.map(
                                                    (
                                                        n: IPerson,
                                                        index: number
                                                    ) => (
                                                        <option
                                                            key={index}
                                                            data-key={n.id}
                                                            value={`${n.documentNumber} ${n.names}`}
                                                        />
                                                    )
                                                )}
                                            </datalist>
                                        </div>
                                        {/* CPE Tipo documento */}
                                        <div>
                                            <label
                                                htmlFor="invoiceDocumentType"
                                                className="text-sm font-medium text-gray-900 dark:text-gray-200"
                                            >
                                                Tipo documento
                                            </label>
                                            <select
                                                value={guide?.documentType}
                                                onChange={handleGuide}
                                                id="invoiceDocumentType"
                                                name="documentType"
                                                className="text-lg w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="09">
                                                    GUIA DE REMISIÓN REMITENTE
                                                    ELECTRÓNICA
                                                </option>
                                                <option value="31">
                                                    GUÍA DE REMISIÓN
                                                    TRANSPORTISTA
                                                </option>
                                            </select>
                                        </div>
                                        {/* Serie */}
                                        <div>
                                            <label
                                                htmlFor="serial"
                                                className="text-sm font-medium text-gray-900 dark:text-gray-200"
                                            >
                                                Serie
                                            </label>
                                            <input
                                                type="text"
                                                name="serial"
                                                id="serial"
                                                maxLength={4}
                                                value={guide.serial}
                                                onChange={handleGuide}
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                autoComplete="off"
                                            />
                                        </div>
                                        {/* Numero */}
                                        <div>
                                            <label
                                                htmlFor="correlative"
                                                className="text-sm font-medium text-gray-900 dark:text-gray-200"
                                            >
                                                Numero
                                            </label>
                                            <input
                                                type="text"
                                                name="correlative"
                                                id="correlative"
                                                maxLength={10}
                                                value={guide.correlative}
                                                onChange={handleGuide}
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                autoComplete="off"
                                            />
                                        </div>
                                        {/* Fecha emisión */}
                                        <div>
                                            <label
                                                htmlFor="emitDate"
                                                className="text-sm font-medium text-gray-900 dark:text-gray-200"
                                            >
                                                Fecha emisión
                                            </label>
                                            <input
                                                type="date"
                                                name="emitDate"
                                                id="emitDate"
                                                value={guide.emitDate}
                                                onChange={handleGuide}
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            />
                                        </div>
                                        {guide?.documentType === "09" && (
                                            <>
                                                {/* Tipo de transporte */}
                                                <div>
                                                    <label className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                                        Tipo de transporte
                                                    </label>
                                                    <select
                                                        name="guideModeTransfer"
                                                        onChange={handleGuide}
                                                        value={
                                                            guide.guideModeTransfer
                                                        }
                                                        className="text-lg w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                        required
                                                    >
                                                        {guideModesData?.allGuideModes?.map(
                                                            (
                                                                o: IGuideModeType,
                                                                k: number
                                                            ) => (
                                                                <option
                                                                    key={k}
                                                                    value={
                                                                        o.code
                                                                    }
                                                                >
                                                                    {o.name}
                                                                </option>
                                                            )
                                                        )}
                                                    </select>
                                                </div>
                                                {/* Motivo de traslado */}
                                                <div>
                                                    <label className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                                        Motivo de traslado
                                                    </label>
                                                    <select
                                                        name="guideReasonTransfer"
                                                        onChange={handleGuide}
                                                        value={
                                                            guide.guideReasonTransfer
                                                        }
                                                        className="text-lg w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                        required
                                                    >
                                                        {guideReasonsData?.allGuideReasons?.map(
                                                            (
                                                                o: IGuideReasonType,
                                                                k: number
                                                            ) => (
                                                                <option
                                                                    key={k}
                                                                    value={
                                                                        o.code
                                                                    }
                                                                >
                                                                    {o.name}
                                                                </option>
                                                            )
                                                        )}
                                                    </select>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </fieldset>
                                {/* Botón Agregar Item */}
                                <div className="">
                                    <div
                                        id="details"
                                        className="w-full grid gap-4 mb-4"
                                    >
                                        {guide.operationdetailSet.map(
                                            (item, index) => (
                                                <div
                                                    key={index}
                                                    className="border border-gray-300 dark:border-gray-600 p-4 rounded-lg shadow-sm bg-white dark:bg-gray-800"
                                                >
                                                    <GuideDetailItem
                                                        index={index}
                                                        item={item}
                                                        onRemove={() =>
                                                            handleRemoveItem(
                                                                index
                                                            )
                                                        }
                                                        onChange={
                                                            handleItemChange
                                                        }
                                                        products={
                                                            productsData?.allProducts ||
                                                            []
                                                        }
                                                    />
                                                </div>
                                            )
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        className="px-5 py-2 bg-blue-600 dark:bg-cyan-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
                                        onClick={handleAddItem}
                                    >
                                        AGREGAR LINEA O ITEM
                                    </button>
                                </div>

                                {/* Botón Agregar Documentos Relacionados */}
                                <div className="">
                                    <div
                                        id="related_documents"
                                        className="w-full grid gap-4 mb-4"
                                    >
                                        {guide.relatedDocuments.map(
                                            (item, index) => (
                                                <div
                                                    key={index}
                                                    className="border border-gray-300 dark:border-gray-600 p-4 rounded-lg shadow-sm bg-white dark:bg-gray-800"
                                                >
                                                    <GuideDocumentItem
                                                        index={index}
                                                        item={item}
                                                        onRemove={() =>
                                                            handleRemoveDocument(
                                                                index
                                                            )
                                                        }
                                                        onChange={
                                                            handleDocumentChange
                                                        }
                                                    />
                                                </div>
                                            )
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        className="px-5 py-2 bg-blue-600 dark:bg-cyan-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
                                        onClick={handleAddDocument}
                                    >
                                        AGREGAR DOCUMENTO RELACIONADO
                                    </button>
                                </div>
                                {/* DATOS DEL TRASLADO */}
                                <fieldset className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                                    <legend className="px-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
                                        DATOS DEL TRASLADO
                                    </legend>
                                    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-5 ">
                                        {/* Fecha de inicio de traslado */}
                                        <div>
                                            <label
                                                htmlFor="transferDate"
                                                className="text-sm font-medium text-gray-900 dark:text-gray-200"
                                            >
                                                Fecha de inicio de traslado
                                            </label>
                                            <input
                                                type="date"
                                                name="transferDate"
                                                id="transferDate"
                                                value={guide.transferDate}
                                                onChange={handleGuide}
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            />
                                        </div>

                                        {/* Peso bruto total */}
                                        <div>
                                            <label className="text-sm text-gray-700 dark:text-gray-200">
                                                Peso bruto total
                                            </label>
                                            <input
                                                type="number"
                                                onWheel={(e) =>
                                                    e.currentTarget.blur()
                                                }
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                name="totalWeight"
                                                value={guide.totalWeight}
                                                onChange={handleGuide}
                                                autoComplete="off"
                                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        {/* Peso - unidad de medida */}
                                        <div className="md:col-span-2">
                                            <label className="text-sm text-gray-700 dark:text-gray-200">
                                                Peso - unidad de medida
                                            </label>
                                            <select
                                                value={
                                                    guide.weightMeasurementUnitCode
                                                }
                                                name="weightMeasurementUnitCode"
                                                onChange={handleGuide}
                                                className="text-lg w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value={"KGM"}>
                                                    KGM - KILOGRAMO
                                                </option>
                                                <option value={"TNE"}>
                                                    TNE - TONELADA (TONELADA
                                                    MÉTRICA)
                                                </option>
                                            </select>
                                        </div>
                                        {/* Numero de bultos */}
                                        <div>
                                            <label className="text-sm text-gray-700 dark:text-gray-200">
                                                Numero de bultos
                                            </label>
                                            <input
                                                type="number"
                                                onWheel={(e) =>
                                                    e.currentTarget.blur()
                                                }
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                name="quantityPackages"
                                                value={guide.quantityPackages}
                                                onChange={handleGuide}
                                                autoComplete="off"
                                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                </fieldset>
                                {/* DATOS DEL TRANSPORTISTA */}
                                <fieldset className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                                    <legend className="px-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
                                        DATOS DEL TRANSPORTISTA
                                    </legend>
                                    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-5 ">
                                        {guide?.guideModeTransfer === "01" && (
                                            <>
                                                {/* Tipo de documento del transportista */}
                                                <div>
                                                    <label className="text-sm text-gray-700 dark:text-gray-200">
                                                        Tipo de documento del
                                                        transportista
                                                    </label>
                                                    <select
                                                        value={
                                                            guide.transportationCompanyTypeDoc
                                                        }
                                                        name="transportationCompanyTypeDoc"
                                                        onChange={handleGuide}
                                                        className="text-lg w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                    >
                                                        <option value={"6"}>
                                                            RUC - REGISTRO ÚNICO
                                                            DE CONTRIBUYENTE
                                                        </option>
                                                    </select>
                                                </div>
                                                {/* Documento número */}
                                                <div>
                                                    <label
                                                        htmlFor="transportationCompanyDoc"
                                                        className="text-sm font-medium text-gray-900 dark:text-gray-200"
                                                    >
                                                        Documento número
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="transportationCompanyDoc"
                                                        id="transportationCompanyDoc"
                                                        maxLength={11}
                                                        value={
                                                            guide.transportationCompanyDoc
                                                        }
                                                        onChange={handleGuide}
                                                        onFocus={(e) =>
                                                            e.target.select()
                                                        }
                                                        className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                        autoComplete="off"
                                                    />
                                                </div>
                                                {/* Transportista denominacion */}
                                                <div>
                                                    <label
                                                        htmlFor="transportationCompanyBusinessName"
                                                        className="text-sm font-medium text-gray-900 dark:text-gray-200"
                                                    >
                                                        Transportista
                                                        denominacion
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="transportationCompanyBusinessName"
                                                        id="transportationCompanyBusinessName"
                                                        maxLength={150}
                                                        value={
                                                            guide.transportationCompanyBusinessName
                                                        }
                                                        onChange={handleGuide}
                                                        onFocus={(e) =>
                                                            e.target.select()
                                                        }
                                                        className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                        autoComplete="off"
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {/* Número de registro MTC (condicional) */}
                                        <div>
                                            <label
                                                htmlFor="transportationCompanyMtcRegistrationNumber"
                                                className="text-sm font-medium text-gray-900 dark:text-gray-200"
                                            >
                                                Número de registro MTC
                                                (condicional)
                                            </label>
                                            <input
                                                type="text"
                                                name="transportationCompanyMtcRegistrationNumber"
                                                id="transportationCompanyMtcRegistrationNumber"
                                                maxLength={10}
                                                value={
                                                    guide.transportationCompanyMtcRegistrationNumber
                                                }
                                                onChange={handleGuide}
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                autoComplete="off"
                                            />
                                        </div>
                                        {guide?.guideModeTransfer === "02" && (
                                            <>
                                                {/* Botón Agregar Vehiculo */}
                                                <div className="md:col-span-3 lg:col-span-5">
                                                    <div
                                                        id="other_vehicles"
                                                        className="w-full grid gap-4 mb-4"
                                                    >
                                                        <fieldset className="border border-gray-300 dark:border-gray-600 p-4 rounded-lg shadow-sm bg-white dark:bg-gray-800">
                                                            <legend className="px-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
                                                                Datos del
                                                                Vehículo
                                                                Principal
                                                            </legend>
                                                            <div className="grid sm:grid-cols-1 md:grid-cols-6 gap-4">
                                                                {/* Transportista placa numero */}
                                                                <div className="md:col-span-2">
                                                                    <label className="text-sm text-gray-700 dark:text-gray-200">
                                                                        Transportista
                                                                        placa
                                                                        numero
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        name="mainVehicleLicensePlate"
                                                                        maxLength={
                                                                            10
                                                                        }
                                                                        onFocus={(
                                                                            e
                                                                        ) =>
                                                                            e.target.select()
                                                                        }
                                                                        value={
                                                                            guide.mainVehicleLicensePlate
                                                                        }
                                                                        onChange={
                                                                            handleGuide
                                                                        }
                                                                        autoComplete="off"
                                                                        className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </fieldset>
                                                        <fieldset className="border border-gray-300 dark:border-gray-600 p-4 rounded-lg shadow-sm bg-white dark:bg-gray-800">
                                                            <legend className="px-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
                                                                Datos de los
                                                                Vehículos
                                                                Secundarios
                                                                (Máximo 2
                                                                vehículos)
                                                            </legend>
                                                            <div className="grid  gap-4">
                                                                {guide.othersVehicles.map(
                                                                    (
                                                                        item,
                                                                        index
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                index
                                                                            }
                                                                            className="grid md:grid-cols-6 lg:grid-cols-6 gap-4"
                                                                        >
                                                                            <GuideVehicleItem
                                                                                index={
                                                                                    index
                                                                                }
                                                                                item={
                                                                                    item
                                                                                }
                                                                                onRemove={() =>
                                                                                    handleRemoveVehicle(
                                                                                        index
                                                                                    )
                                                                                }
                                                                                onChange={
                                                                                    handleVehicleChange
                                                                                }
                                                                            />
                                                                        </div>
                                                                    )
                                                                )}
                                                            </div>
                                                        </fieldset>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        className="px-5 py-2 bg-blue-600 dark:bg-cyan-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
                                                        onClick={
                                                            handleAddVehicle
                                                        }
                                                    >
                                                        AGREGAR VEHÍCULO
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </fieldset>
                                {/* DATOS DEL CONDUCTOR */}
                                {guide?.guideModeTransfer === "02" && (
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
                                                                Datos del
                                                                Conductor
                                                                Principal
                                                            </legend>
                                                            <div className="grid sm:grid-cols-1 md:grid-cols-6 gap-4">
                                                                {/* Tipo de documento */}
                                                                <div>
                                                                    <label className="text-sm text-gray-700 dark:text-gray-200">
                                                                        Tipo de
                                                                        documento
                                                                    </label>
                                                                    <select
                                                                        value={
                                                                            guide.mainDriverDocumentType
                                                                        }
                                                                        name="mainDriverDocumentType"
                                                                        onChange={
                                                                            handleGuide
                                                                        }
                                                                        className="text-lg w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                                    >
                                                                        {documentTypesData?.allDocumentTypes?.map(
                                                                            (
                                                                                o: IDocumentType,
                                                                                k: number
                                                                            ) => (
                                                                                <option
                                                                                    key={
                                                                                        k
                                                                                    }
                                                                                    value={
                                                                                        o.code
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        o.name
                                                                                    }
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
                                                                        Documento
                                                                        número
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
                                                                        onChange={
                                                                            handleGuide
                                                                        }
                                                                        onFocus={(
                                                                            e
                                                                        ) =>
                                                                            e.target.select()
                                                                        }
                                                                        className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                                        autoComplete="off"
                                                                    />
                                                                </div>
                                                                {/* Nombres y Apellidos del conductor */}
                                                                <div>
                                                                    <label
                                                                        htmlFor="mainDriverNames"
                                                                        className="text-sm font-medium text-gray-900 dark:text-gray-200"
                                                                    >
                                                                        Nombres
                                                                        y
                                                                        Apellidos
                                                                        del
                                                                        conductor
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        name="mainDriverNames"
                                                                        id="mainDriverNames"
                                                                        maxLength={
                                                                            200
                                                                        }
                                                                        value={
                                                                            guide.mainDriverNames
                                                                        }
                                                                        onChange={
                                                                            handleGuide
                                                                        }
                                                                        onFocus={(
                                                                            e
                                                                        ) =>
                                                                            e.target.select()
                                                                        }
                                                                        className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                                        autoComplete="off"
                                                                    />
                                                                </div>
                                                                {/* Licencia de conducir */}
                                                                <div>
                                                                    <label
                                                                        htmlFor="mainDriverDriverLicense"
                                                                        className="text-sm font-medium text-gray-900 dark:text-gray-200"
                                                                    >
                                                                        Licencia
                                                                        de
                                                                        conducir
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        name="mainDriverDriverLicense"
                                                                        id="mainDriverDriverLicense"
                                                                        maxLength={
                                                                            200
                                                                        }
                                                                        value={
                                                                            guide.mainDriverDriverLicense
                                                                        }
                                                                        onChange={
                                                                            handleGuide
                                                                        }
                                                                        onFocus={(
                                                                            e
                                                                        ) =>
                                                                            e.target.select()
                                                                        }
                                                                        className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                                        autoComplete="off"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </fieldset>
                                                        <fieldset className="border border-gray-300 dark:border-gray-600 p-4 rounded-lg shadow-sm bg-white dark:bg-gray-800">
                                                            <legend className="px-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
                                                                Datos de los
                                                                Conductores
                                                                Secundarios
                                                                (Máximo 2
                                                                conductores)
                                                            </legend>
                                                            <div className="grid  gap-4">
                                                                {guide.othersDrivers.map(
                                                                    (
                                                                        item,
                                                                        index
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                index
                                                                            }
                                                                            className="grid md:grid-cols-6 lg:grid-cols-6 gap-4"
                                                                        >
                                                                            <GuideDriverItem
                                                                                index={
                                                                                    index
                                                                                }
                                                                                item={
                                                                                    item
                                                                                }
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
                                                                            />
                                                                        </div>
                                                                    )
                                                                )}
                                                            </div>
                                                        </fieldset>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        className="px-5 py-2 bg-blue-600 dark:bg-cyan-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
                                                        onClick={
                                                            handleAddDriver
                                                        }
                                                    >
                                                        AGREGAR CONDUCTOR
                                                    </button>
                                                </div>
                                            </div>
                                        </fieldset>
                                    </>
                                )}
                                {/* DATOS DEL DESTINATARIO */}
                                {guide?.documentType === "31" && (
                                    <>
                                        <fieldset className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                                            <legend className="px-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
                                                DATOS DEL DESTINATARIO
                                            </legend>
                                            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-5 ">
                                                {/* Tipo de documento */}
                                                <div>
                                                    <label className="text-sm text-gray-700 dark:text-gray-200">
                                                        Tipo de documento del
                                                        destinatario
                                                    </label>
                                                    <select
                                                        value={
                                                            guide.receiverDocumentType
                                                        }
                                                        name="receiverDocumentType"
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
                                                                    value={
                                                                        o.code
                                                                    }
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
                                                        htmlFor="receiverDocumentNumber"
                                                        className="text-sm font-medium text-gray-900 dark:text-gray-200"
                                                    >
                                                        Documento número
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="receiverDocumentNumber"
                                                        id="receiverDocumentNumber"
                                                        maxLength={
                                                            guide?.receiverDocumentType ===
                                                            "1"
                                                                ? 8
                                                                : guide?.receiverDocumentType ===
                                                                  "6"
                                                                ? 11
                                                                : 25
                                                        }
                                                        value={
                                                            guide.receiverDocumentNumber
                                                        }
                                                        onChange={handleGuide}
                                                        onFocus={(e) =>
                                                            e.target.select()
                                                        }
                                                        className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                        autoComplete="off"
                                                    />
                                                </div>
                                                {/* Nombre del destinatario */}
                                                <div>
                                                    <label
                                                        htmlFor="receiverNames"
                                                        className="text-sm font-medium text-gray-900 dark:text-gray-200"
                                                    >
                                                        Nombre del destinatario
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="receiverNames"
                                                        id="receiverNames"
                                                        maxLength={200}
                                                        value={
                                                            guide.receiverNames
                                                        }
                                                        onChange={handleGuide}
                                                        onFocus={(e) =>
                                                            e.target.select()
                                                        }
                                                        className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                        autoComplete="off"
                                                    />
                                                </div>
                                            </div>
                                        </fieldset>
                                    </>
                                )}
                                {/* PUNTO DE PARTIDA */}
                                <fieldset className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                                    <legend className="px-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
                                        PUNTO DE PARTIDA
                                    </legend>
                                    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-5 ">
                                        {/* UBIGEO dirección de partida */}
                                        <div className="md:col-span-2">
                                            <label className="text-sm text-gray-700 dark:text-gray-200">
                                                UBIGEO dirección de partida
                                            </label>
                                            <input
                                                type="search"
                                                name="originSearch"
                                                maxLength={200}
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                value={originSearch}
                                                onChange={
                                                    handleOriginSearchChange
                                                }
                                                onBlur={handleOriginSelect}
                                                list="originList"
                                                autoComplete="off"
                                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <datalist id="originList">
                                                {originSearchResults?.map(
                                                    (
                                                        n: ISubsidiary,
                                                        index: number
                                                    ) => (
                                                        <option
                                                            key={index}
                                                            data-key={n.id}
                                                            value={`${n.districtId} - ${n.districtDescription} | ${n.provinceDescription} | ${n.departmentDescription}`}
                                                        />
                                                    )
                                                )}
                                            </datalist>
                                        </div>
                                        {/* Dirección del punto de partida */}
                                        <div className="md:col-span-2">
                                            <label className="text-sm text-gray-700 dark:text-gray-200">
                                                Dirección del punto de partida
                                            </label>
                                            <input
                                                type="text"
                                                name="guideOriginAddress"
                                                maxLength={200}
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                value={guide.guideOriginAddress}
                                                onChange={handleGuide}
                                                autoComplete="off"
                                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        {/* Código establecimiento Sunat */}
                                        <div className="md:col-span-1">
                                            <label className="text-sm text-gray-700 dark:text-gray-200">
                                                Código establecimiento Sunat
                                            </label>
                                            <input
                                                type="text"
                                                name="guideOriginSerial"
                                                maxLength={4}
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                value={guide.guideOriginSerial}
                                                onChange={handleGuide}
                                                autoComplete="off"
                                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                </fieldset>
                                {/* PUNTO DE LLEGADA */}
                                <fieldset className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                                    <legend className="px-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
                                        PUNTO DE LLEGADA
                                    </legend>
                                    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-5 ">
                                        {/* UBIGEO dirección de llegada */}
                                        <div className="md:col-span-2">
                                            <label className="text-sm text-gray-700 dark:text-gray-200">
                                                UBIGEO dirección de llegada
                                            </label>
                                            <input
                                                type="search"
                                                name="arrivalSearch"
                                                maxLength={200}
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                value={arrivalSearch}
                                                onChange={
                                                    handleArrivalSearchChange
                                                }
                                                onBlur={handleArrivalSelect}
                                                list="arrivalList"
                                                autoComplete="off"
                                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <datalist id="arrivalList">
                                                {arrivalSearchResults?.map(
                                                    (
                                                        n: ISubsidiary,
                                                        index: number
                                                    ) => (
                                                        <option
                                                            key={index}
                                                            data-key={n.id}
                                                            value={`${n.districtId} - ${n.districtDescription} | ${n.provinceDescription} | ${n.departmentDescription}`}
                                                        />
                                                    )
                                                )}
                                            </datalist>
                                        </div>
                                        {/* Dirección del punto de llegada */}
                                        <div className="md:col-span-2">
                                            <label className="text-sm text-gray-700 dark:text-gray-200">
                                                Dirección del punto de llegada
                                            </label>
                                            <input
                                                type="text"
                                                name="guideArrivalAddress"
                                                maxLength={200}
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                value={
                                                    guide.guideArrivalAddress
                                                }
                                                onChange={handleGuide}
                                                autoComplete="off"
                                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        {/* Código establecimiento Sunat */}
                                        <div className="md:col-span-1">
                                            <label className="text-sm text-gray-700 dark:text-gray-200">
                                                Código establecimiento Sunat
                                            </label>
                                            <input
                                                type="text"
                                                name="guideArrivalSerial"
                                                maxLength={4}
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                value={guide.guideArrivalSerial}
                                                onChange={handleGuide}
                                                autoComplete="off"
                                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                </fieldset>
                                {/* OBSERVACIONES */}
                                <fieldset className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                                    <legend className="px-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
                                        OBSERVACIONES
                                    </legend>
                                    <div className="grid  ">
                                        <div className="md:col-span-2">
                                            <label className="text-sm text-gray-700 dark:text-gray-200">
                                                Observaciones
                                            </label>
                                            <textarea
                                                name="observation"
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                maxLength={500}
                                                value={guide.observation}
                                                onChange={handleGuide}
                                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            ></textarea>
                                        </div>
                                    </div>
                                </fieldset>
                                {/* Botón Continuar con el Pago */}
                                <div className="flex justify-end py-2">
                                    <button
                                        type="button"
                                        className={`btn-blue px-5 py-2 inline-flex items-center gap-2`}
                                        onClick={saveGuide}
                                    >
                                        <Save />
                                        CONTINUAR CON EL PAGO
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default NewGuidePage;
