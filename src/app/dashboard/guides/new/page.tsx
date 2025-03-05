"use client";
import {
    IOperationDetail,
    IPerson,
    IRelatedDocument,
    IVehicle,
} from "@/app/types";
import Breadcrumb from "@/components/Breadcrumb";
import Add from "@/components/icons/Add";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { DocumentNode, gql, useLazyQuery, useMutation } from "@apollo/client";
import React, {
    ChangeEvent,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import Save from "@/components/icons/Save";
import GuideStopPoint from "./GuideStopPoint";
import GuideTransportation from "./GuideTransportation";
import GuideMainDriver from "./GuideMainDriver";
import { toast } from "react-toastify";
import GuideReceiver from "./GuideReceiver";
import GuideTranferData from "./GuideTranferData";
import GuideHeader from "./GuideHeader";
import GuideDetailAndDocument from "./GuideDetailAndDocument";

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
    clientId: 0,
    documentType: "09",
    serial: "",
    correlative: "",
    emitDate: today,
    guideModeTransfer: "01",
    guideReasonTransfer: "04",
    operationdetailSet: [
        {
            index: 0,
            productName: "",
            description: "",
            productId: 0,
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

    transferDate: today,
    totalWeight: 0,
    weightMeasurementUnitCode: "KGM",
    quantityPackages: 0,

    transportationCompanyDocumentType: "6",
    transportationCompanyDocumentNumber: "",
    transportationCompanyNames: "",
    transportationCompanyMtcRegistrationNumber: "",

    mainVehicleLicensePlate: "",
    othersVehicles: [] as IVehicle[],

    mainDriverDocumentType: "1",
    mainDriverDocumentNumber: "",
    mainDriverDriverLicense: "",
    mainDriverNames: "",
    othersDrivers: [] as IPerson[],

    receiverDocumentType: "1",
    receiverDocumentNumber: "",
    receiverNames: "",

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

    clientName: "",
};

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

const CREATE_SALE_MUTATION = gql`
    mutation CreateSale(
        $clientId: Int!
        $documentType: String!
        $serial: String!
        $correlative: Int!
        $emitDate: Date!
        $guideModeTransfer: String!
        $guideReasonTransfer: String!
        $productIdSet: [Int!]!
        $descriptionSet: [String!]!
        $quantitySet: [Int!]!
        $relatedDocumentsSerialSet: [String!]!
        $relatedDocumentsDocumentTypeSet: [String!]!
        $relatedDocumentsCorrelativeSet: [Int!]!
        $transferDate: Date!
        $totalWeight: Float!
        $weightMeasurementUnitCode: String!
        $quantityPackages: Float!
        $transportationCompanyDocumentType: String!
        $transportationCompanyDocumentNumber: String!
        $transportationCompanyNames: String!
        $transportationCompanyMtcRegistrationNumber: String!
        $mainVehicleLicensePlate: String!
        $othersVehiclesLicensePlateSet: [String!]!
        $mainDriverDocumentType: String!
        $mainDriverDocumentNumber: String!
        $mainDriverDriverLicense: String!
        $mainDriverNames: String!
        $othersDriversDocumentTypeSet: [String!]!
        $othersDriversDocumentNumberSet: [String!]!
        $othersDriversDriverLicenseSet: [String!]!
        $othersDriversNamesSet: [String!]!
        $receiverDocumentType: String!
        $receiverDocumentNumber: String!
        $receiverNames: String!
        $guideOriginDistrictId: String!
        $guideOriginAddress: String!
        $guideOriginSerial: String!
        $guideArrivalDistrictId: String!
        $guideArrivalAddress: String!
        $guideArrivalSerial: String!
        $observation: String!
    ) {
        createSale(
            clientId: $clientId
            documentType: $documentType
            serial: $serial
            correlative: $correlative
            emitDate: $emitDate
            guideModeTransfer: $guideModeTransfer
            guideReasonTransfer: $guideReasonTransfer
            productIdSet: $productIdSet
            descriptionSet: $descriptionSet
            quantitySet: $quantitySet
            relatedDocumentsSerialSet: $relatedDocumentsSerialSet
            relatedDocumentsDocumentTypeSet: $relatedDocumentsDocumentTypeSet
            relatedDocumentsCorrelativeSet: $relatedDocumentsCorrelativeSet
            transferDate: $transferDate
            totalWeight: $totalWeight
            weightMeasurementUnitCode: $weightMeasurementUnitCode
            quantityPackages: $quantityPackages
            transportationCompanyDocumentType: $transportationCompanyDocumentType
            transportationCompanyDocumentNumber: $transportationCompanyDocumentNumber
            transportationCompanyNames: $transportationCompanyNames
            transportationCompanyMtcRegistrationNumber: $transportationCompanyMtcRegistrationNumber
            mainVehicleLicensePlate: $mainVehicleLicensePlate
            othersVehiclesLicensePlateSet: $othersVehiclesLicensePlateSet
            mainDriverDocumentType: $mainDriverDocumentType
            mainDriverDocumentNumber: $mainDriverDocumentNumber
            mainDriverDriverLicense: $mainDriverDriverLicense
            mainDriverNames: $mainDriverNames
            othersDriversDocumentTypeSet: $othersDriversDocumentTypeSet
            othersDriversDocumentNumberSet: $othersDriversDocumentNumberSet
            othersDriversDriverLicenseSet: $othersDriversDriverLicenseSet
            othersDriversNamesSet: $othersDriversNamesSet
            receiverDocumentType: $receiverDocumentType
            receiverDocumentNumber: $receiverDocumentNumber
            receiverNames: $receiverNames
            guideOriginDistrictId: $guideOriginDistrictId
            guideOriginAddress: $guideOriginAddress
            guideOriginSerial: $guideOriginSerial
            guideArrivalDistrictId: $guideArrivalDistrictId
            guideArrivalAddress: $guideArrivalAddress
            guideArrivalSerial: $guideArrivalSerial
            observation: $observation
        ) {
            message
            error
        }
    }
`;

function NewGuidePage() {
    const [sale, setSale] = useState(initialStateSale);
    const [guide, setGuide] = useState(initialStateGuide);
    const router = useRouter();
    const auth = useAuth();

    const authContext = useMemo(
        () => ({
            headers: {
                "Content-Type": "application/json",
                Authorization: auth?.jwtToken ? `JWT ${auth.jwtToken}` : "",
            },
        }),
        [auth?.jwtToken]
    );

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
        let formattedValue = value;
        console.log(name, value);
        if (name === "correlative") {
            formattedValue = formattedValue.replace(/[^0-9]/g, ""); // Permite solo números
            formattedValue = formattedValue.slice(0, 6); // Limita a 4 dígitos
        }
        if (name === "quantityPackages") {
            formattedValue = formattedValue.replace(/[^0-9]/g, ""); // Permite solo números
            formattedValue = formattedValue.slice(0, 6); // Limita a 4 dígitos
        }
        if (name === "totalWeight") {
            // Permite solo números con decimales (formato de coma o punto)
            formattedValue = formattedValue.replace(/[^0-9.]/g, "");
            // Evita múltiples puntos decimales
            formattedValue = formattedValue.replace(/(\..*)\./g, "$1");
            // Limita a 6 dígitos (incluyendo decimales)
            if (formattedValue.includes(".")) {
                const [integer, decimal] = formattedValue.split(".");
                formattedValue = `${integer.slice(0, 6)}.${decimal.slice(
                    0,
                    2
                )}`; // Máximo 6 dígitos con 2 decimales
            } else {
                formattedValue = formattedValue.slice(0, 6);
            }
        }
        setGuide({ ...guide, [name]: formattedValue });
    };

    function useCustomMutation(mutation: DocumentNode) {
        return useMutation(mutation, {
            context: authContext,
            onError: (err) => console.error("Error in unit:", err), // Log the error for debugging
        });
    }

    const [createSale] = useCustomMutation(CREATE_SALE_MUTATION);

    const saveGuide = useCallback(async () => {
        try {
            if (Number(guide.clientId) === 0) {
                toast("La guia debe tener un cliente.", {
                    hideProgressBar: true,
                    autoClose: 2000,
                    type: "error",
                });
                return false;
            }
            if (guide.serial.length !== 4) {
                toast("La guia debe tener una serie.", {
                    hideProgressBar: true,
                    autoClose: 2000,
                    type: "error",
                });
                return false;
            }

            if (
                !guide.operationdetailSet ||
                guide.operationdetailSet.length === 0
            ) {
                toast("Debe agregar al menos un producto a la guía.", {
                    hideProgressBar: true,
                    autoClose: 2000,
                    type: "warning",
                });
                return false;
            }

            const invalidItems = guide.operationdetailSet.filter(
                (item) =>
                    item.productId === 0 || // Valida que el producto tenga un ID asignado
                    !item.quantity || // Valida que la cantidad no sea nula
                    Number(item.quantity) <= 0 // Valida que la cantidad sea mayor que cero
            );

            if (invalidItems.length > 0) {
                toast(
                    "Todos los productos deben tener una cantidad mayor a 0 y un producto seleccionado.",
                    {
                        hideProgressBar: true,
                        autoClose: 2000,
                        type: "warning",
                    }
                );
                return false;
            }

            if (Number(guide.totalWeight) === 0) {
                toast("La guia debe tener un peso total.", {
                    hideProgressBar: true,
                    autoClose: 2000,
                    type: "warning",
                });
                return false;
            }

            // console.log(guide.operationdetailSet);
            if (guide.documentType === "09") {
                // sender referral guide

                if (Number(guide.quantityPackages) === 0) {
                    toast("La guia debe tener un numero de bultos.", {
                        hideProgressBar: true,
                        autoClose: 2000,
                        type: "warning",
                    });
                    return false;
                }

                if (guide.guideModeTransfer === "NA") {
                    toast("La guia debe tener un tipo.", {
                        hideProgressBar: true,
                        autoClose: 2000,
                        type: "error",
                    });
                    return false;
                }
                if (guide.guideModeTransfer === "01") {
                    // public
                    if (
                        guide.transportationCompanyDocumentNumber.length !== 11
                    ) {
                        toast(
                            "La guia debe tener un RUC de transportista valido.",
                            {
                                hideProgressBar: true,
                                autoClose: 2000,
                                type: "error",
                            }
                        );
                        return false;
                    }
                    if (guide.transportationCompanyNames.length === 0) {
                        toast(
                            "La guia debe tener una razon social transportista valido.",
                            {
                                hideProgressBar: true,
                                autoClose: 2000,
                                type: "error",
                            }
                        );
                        return false;
                    }
                }
                if (guide.guideModeTransfer === "02") {
                    // private
                    if (guide.mainVehicleLicensePlate.length === 0) {
                        toast(
                            "La guia debe tener la placa de un vehiculo principal valido.",
                            {
                                hideProgressBar: true,
                                autoClose: 2000,
                                type: "error",
                            }
                        );
                        return false;
                    }

                    const invalidOtherVehicles = guide.othersVehicles.filter(
                        (item) => item.licensePlate?.length === 0 // Valida que el vehiculo tenga una placa asignado
                    );

                    if (invalidOtherVehicles.length > 0) {
                        toast("Todos los vehiculos deben tener una placa.", {
                            hideProgressBar: true,
                            autoClose: 2000,
                            type: "warning",
                        });
                        return false;
                    }

                    if (
                        guide.mainDriverDocumentType === "1" &&
                        guide.mainDriverDocumentNumber.length !== 8
                    ) {
                        toast(
                            "La guia debe tener número DNI de un conductor principal valido.",
                            {
                                hideProgressBar: true,
                                autoClose: 2000,
                                type: "error",
                            }
                        );
                        return false;
                    }
                    if (
                        guide.mainDriverDocumentType === "6" &&
                        guide.mainDriverDocumentNumber.length !== 11
                    ) {
                        toast(
                            "La guia debe tener número RUC de un conductor principal valido.",
                            {
                                hideProgressBar: true,
                                autoClose: 2000,
                                type: "error",
                            }
                        );
                        return false;
                    }
                    if (guide.mainDriverNames.length === 0) {
                        toast(
                            "La guia debe tener nombres y apellidos de un conductor principal valido.",
                            {
                                hideProgressBar: true,
                                autoClose: 2000,
                                type: "error",
                            }
                        );
                        return false;
                    }
                    if (guide.mainDriverDriverLicense.length === 0) {
                        toast(
                            "La guia debe tener una licencia de un conductor principal valido.",
                            {
                                hideProgressBar: true,
                                autoClose: 2000,
                                type: "error",
                            }
                        );
                        return false;
                    }

                    const invalidOtherDrivers = guide.othersDrivers.filter(
                        (item) =>
                            item.documentNumber?.length === 0 || // Valida que el conductor tenga un numero de documento asignado
                            item.names?.length === 0 || // Valida que el conductor tenga un nombre asignado
                            item.driverLicense?.length === 0 // Valida que el conductor tenga una licencia de conducir asignado
                    );

                    if (invalidOtherDrivers.length > 0) {
                        toast(
                            "Todos los conductores deben tener un numero de documento, un nombre y una licencia de conducir.",
                            {
                                hideProgressBar: true,
                                autoClose: 2000,
                                type: "warning",
                            }
                        );
                        return false;
                    }
                }
                if (guide.guideReasonTransfer === "NA") {
                    toast("La guia debe tener un motivo de traslado.", {
                        hideProgressBar: true,
                        autoClose: 2000,
                        type: "error",
                    });
                    return false;
                }
            } else if (guide.documentType === "31") {
                // carrier referral guide
                if (guide.mainVehicleLicensePlate.length === 0) {
                    toast(
                        "La guia debe tener la placa de un vehiculo principal valido.",
                        {
                            hideProgressBar: true,
                            autoClose: 2000,
                            type: "error",
                        }
                    );
                    return false;
                }

                const invalidOtherVehicles = guide.othersVehicles.filter(
                    (item) => item.licensePlate?.length === 0 // Valida que el vehiculo tenga una placa asignado
                );

                if (invalidOtherVehicles.length > 0) {
                    toast("Todos los vehiculos deben tener una placa.", {
                        hideProgressBar: true,
                        autoClose: 2000,
                        type: "warning",
                    });
                    return false;
                }

                if (
                    guide.mainDriverDocumentType === "1" &&
                    guide.mainDriverDocumentNumber.length !== 8
                ) {
                    toast(
                        "La guia debe tener número DNI de un conductor principal valido.",
                        {
                            hideProgressBar: true,
                            autoClose: 2000,
                            type: "error",
                        }
                    );
                    return false;
                }
                if (
                    guide.mainDriverDocumentType === "6" &&
                    guide.mainDriverDocumentNumber.length !== 11
                ) {
                    toast(
                        "La guia debe tener número RUC de un conductor principal valido.",
                        {
                            hideProgressBar: true,
                            autoClose: 2000,
                            type: "error",
                        }
                    );
                    return false;
                }
                if (guide.mainDriverNames.length === 0) {
                    toast(
                        "La guia debe tener nombres y apellidos de un conductor principal valido.",
                        {
                            hideProgressBar: true,
                            autoClose: 2000,
                            type: "error",
                        }
                    );
                    return false;
                }
                if (guide.mainDriverDriverLicense.length === 0) {
                    toast(
                        "La guia debe tener una licencia de un conductor principal valido.",
                        {
                            hideProgressBar: true,
                            autoClose: 2000,
                            type: "error",
                        }
                    );
                    return false;
                }

                const invalidOtherDrivers = guide.othersDrivers.filter(
                    (item) =>
                        item.documentNumber?.length === 0 || // Valida que el conductor tenga un numero de documento asignado
                        item.names?.length === 0 || // Valida que el conductor tenga un nombre asignado
                        item.driverLicense?.length === 0 // Valida que el conductor tenga una licencia de conducir asignado
                );

                if (invalidOtherDrivers.length > 0) {
                    toast(
                        "Todos los conductores deben tener un numero de documento, un nombre y una licencia de conducir.",
                        {
                            hideProgressBar: true,
                            autoClose: 2000,
                            type: "warning",
                        }
                    );
                    return false;
                }
                if (guide.receiverDocumentNumber.length === 0) {
                    toast(
                        "La guia debe tener un numero de documento de destinatario valido.",
                        {
                            hideProgressBar: true,
                            autoClose: 2000,
                            type: "error",
                        }
                    );
                    return false;
                }
                if (guide.receiverNames.length === 0) {
                    toast(
                        "La guia debe tener un nombre de destinatario valido.",
                        {
                            hideProgressBar: true,
                            autoClose: 2000,
                            type: "error",
                        }
                    );
                    return false;
                }
            }
            if (guide.guideOriginDistrictId.length === 0) {
                toast("La guia debe tener un ubigeo como punto de partida.", {
                    hideProgressBar: true,
                    autoClose: 2000,
                    type: "error",
                });
                return false;
            }
            if (guide.guideOriginAddress.length === 0) {
                toast(
                    "La guia debe tener una direccion como punto de partida.",
                    {
                        hideProgressBar: true,
                        autoClose: 2000,
                        type: "error",
                    }
                );
                return false;
            }
            if (guide.guideArrivalDistrictId.length === 0) {
                toast("La guia debe tener un ubigeo como punto de llegada.", {
                    hideProgressBar: true,
                    autoClose: 2000,
                    type: "error",
                });
                return false;
            }
            if (guide.guideArrivalAddress.length === 0) {
                toast(
                    "La guia debe tener una direccion como punto de llegada.",
                    {
                        hideProgressBar: true,
                        autoClose: 2000,
                        type: "error",
                    }
                );
                return false;
            }

            const variables = {
                clientId: Number(guide.clientId),
                documentType: guide.documentType,

                serial: guide.serial,
                correlative: parseInt(
                    guide.correlative === "" ? "0" : guide.correlative
                ),

                emitDate: guide.emitDate,

                guideModeTransfer: guide.guideModeTransfer,
                guideReasonTransfer: guide.guideReasonTransfer,

                productIdSet: guide.operationdetailSet.map(
                    (item: any) => item.productId
                ),
                descriptionSet: guide.operationdetailSet.map(
                    (item: any) => item.description || ""
                ),
                quantitySet: guide.operationdetailSet.map((item: any) =>
                    parseInt(item.quantity)
                ),

                relatedDocumentsSerialSet: guide.relatedDocuments.map(
                    (item: any) => item.serial || ""
                ),

                relatedDocumentsDocumentTypeSet: guide.relatedDocuments.map(
                    (item: any) => item.documentType || ""
                ),

                relatedDocumentsCorrelativeSet: guide.relatedDocuments.map(
                    (item: any) =>
                        Number(item.correlative === "" ? "0" : item.correlative)
                ),
                transferDate: guide.transferDate,
                totalWeight: Number(guide.totalWeight) || 0,
                weightMeasurementUnitCode: guide.weightMeasurementUnitCode,
                quantityPackages: Number(guide.quantityPackages) || 0,

                transportationCompanyDocumentType:
                    guide.transportationCompanyDocumentType,
                transportationCompanyDocumentNumber:
                    guide.transportationCompanyDocumentNumber,
                transportationCompanyNames: guide.transportationCompanyNames,
                transportationCompanyMtcRegistrationNumber:
                    guide.transportationCompanyMtcRegistrationNumber,
                mainVehicleLicensePlate: guide.mainVehicleLicensePlate,
                othersVehiclesLicensePlateSet: guide.othersVehicles.map(
                    (item: any) => item.licensePlate || ""
                ),
                mainDriverDocumentType: guide.mainDriverDocumentType,
                mainDriverDocumentNumber: guide.mainDriverDocumentNumber,
                mainDriverDriverLicense: guide.mainDriverDriverLicense,
                mainDriverNames: guide.mainDriverNames,
                othersDriversDocumentTypeSet: guide.othersDrivers.map(
                    (item: any) => item.documentType || ""
                ),
                othersDriversDocumentNumberSet: guide.othersDrivers.map(
                    (item: any) => item.documentNumber || ""
                ),
                othersDriversDriverLicenseSet: guide.othersDrivers.map(
                    (item: any) => item.driverLicense || ""
                ),
                othersDriversNamesSet: guide.othersDrivers.map(
                    (item: any) => item.names || ""
                ),

                receiverDocumentType: guide.receiverDocumentType,
                receiverDocumentNumber: guide.receiverDocumentNumber,
                receiverNames: guide.receiverNames,
                guideOriginDistrictId: guide.guideOriginDistrictId,
                guideOriginAddress: guide.guideOriginAddress,
                guideOriginSerial: guide.guideOriginSerial,
                guideArrivalDistrictId: guide.guideArrivalDistrictId,
                guideArrivalAddress: guide.guideArrivalAddress,
                guideArrivalSerial: guide.guideArrivalSerial,
                observation: guide.observation,
            };
            const { data, errors } = await createSale({
                variables: variables,
            });
            // console.log("variables al guardar", variables, auth?.jwtToken);
            if (errors) {
                toast(errors.toString(), {
                    hideProgressBar: true,
                    autoClose: 2000,
                    type: "error",
                });
            } else {
                if (data.createSale.error) {
                    toast(data.createSale.message, {
                        hideProgressBar: true,
                        autoClose: 2000,
                        type: "error",
                    });
                } else {
                    toast(data.createSale.message, {
                        hideProgressBar: true,
                        autoClose: 2000,
                        type: "success",
                    });
                    // setInvoice(initialStateSale);
                    router.push("/dashboard/guides");
                }
            }
        } catch (error) {
            console.error("Error creating invoice:", error);
        }
    }, [createSale, guide, setGuide, initialStateGuide]);
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
                                <GuideHeader
                                    guide={guide}
                                    setGuide={setGuide}
                                    auth={auth}
                                    authContext={authContext}
                                    handleGuide={handleGuide}
                                />
                                {/* Items and  Documentos Relacionados */}
                                <GuideDetailAndDocument
                                    guide={guide}
                                    setGuide={setGuide}
                                    auth={auth}
                                    authContext={authContext}
                                />

                                {/* DATOS DEL TRASLADO */}
                                <GuideTranferData
                                    guide={guide}
                                    handleGuide={handleGuide}
                                />
                                {/* DATOS DEL TRANSPORTISTA */}
                                <GuideTransportation
                                    guide={guide}
                                    setGuide={setGuide}
                                    authContext={authContext}
                                    handleGuide={handleGuide}
                                />
                                {/* DATOS DEL CONDUCTOR */}
                                {guide?.guideModeTransfer === "02" && (
                                    <>
                                        <GuideMainDriver
                                            guide={guide}
                                            setGuide={setGuide}
                                            handleGuide={handleGuide}
                                            auth={auth}
                                            authContext={authContext}
                                        />
                                    </>
                                )}
                                {/* DATOS DEL DESTINATARIO */}
                                {guide?.documentType === "31" && (
                                    <>
                                        <GuideReceiver
                                            guide={guide}
                                            setGuide={setGuide}
                                            handleGuide={handleGuide}
                                            authContext={authContext}
                                            auth={auth}
                                        />
                                    </>
                                )}
                                <GuideStopPoint
                                    guide={guide}
                                    setGuide={setGuide}
                                    authContext={authContext}
                                    handleGuide={handleGuide}
                                />
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
                                <div className="relative">
                                    {/* Contenido principal */}
                                    <div className="min-h-screen">
                                        {/* Aquí va tu contenido */}
                                    </div>

                                    {/* Botón flotante */}
                                    <div className="fixed bottom-4 right-4">
                                        <button
                                            type="button"
                                            className="btn-blue px-5 py-2 inline-flex items-center gap-2 shadow-lg rounded-lg"
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
            </div>
        </>
    );
}

export default NewGuidePage;
