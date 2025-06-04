"use client";
import {
    ICreditNoteType,
    IOperationDetail,
    IOperationType,
    IPerson,
    IRelatedDocument,
    IVehicle,
} from "@/app/types";
import Breadcrumb from "@/components/Breadcrumb";
import { useAuth } from "@/components/providers/AuthProvider";
import {
    DocumentNode,
    gql,
    useLazyQuery,
    useMutation,
    useQuery,
} from "@apollo/client";
import { useParams, useRouter } from "next/navigation";
import React, {
    ChangeEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { Modal } from "flowbite";
import Save from "@/components/icons/Save";
import { toast } from "react-toastify";
import GuideHeader from "../../new/GuideHeader";
import GuideDetailAndDocument from "../../new/GuideDetailAndDocument";
import GuideMainDriver from "../../new/GuideMainDriver";
import GuideReceiver from "../../new/GuideReceiver";
import GuideStopPoint from "../../new/GuideStopPoint";
import GuideTransportation from "../../new/GuideTransportation";
import GuideTranferData from "../../new/GuideTranferData";

// Replace the current today constant with this:
const limaDate = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Lima" })
);
const today =
    limaDate.getFullYear() +
    "-" +
    String(limaDate.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(limaDate.getDate()).padStart(2, "0");

const SALE_QUERY_BY_ID = gql`
    query ($pk: ID!) {
        getSaleById(pk: $pk) {
            id
            documentType
            serial
            correlative
            client {
                id
                names
                documentNumber
            }
            operationdetailSet {
                productId
                productName
                quantity
            }
        }
    }
`;

const CREATE_GUIDE_MUTATION = gql`
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
        $quantitySet: [Float!]!
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
        $parentOperationId: Int
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
            parentOperationId: $parentOperationId
        ) {
            message
            error
        }
    }
`;

const initialStateGuide = {
    clientId: 0,
    documentType: "09",
    serial: "",
    correlative: "",
    emitDate: today,
    guideModeTransfer: "01",
    guideReasonTransfer: "01",
    operationdetailSet: [
        {
            index: 0,
            productName: "",
            description: "",
            productId: 0,
            quantity: 0,
        },
    ] as IOperationDetail[],
    relatedDocuments: [] as IRelatedDocument[],

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

    parentOperationId: 0,
};
function NewGuidePageWithInvoice() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const params = useParams();
    const invoiceId = params.invoiceId;
    const guideType = params.guideType;
    const [guide, setGuide] = useState(initialStateGuide);
    const [initialClientData, setInitialClientData] = useState({
        id: 0,
        names: "",
        documentNumber: "",
    });
    const router = useRouter();
    const hasQueried = useRef(false);

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
            // console.log(dataSale.client);
            setGuide({
                ...guide,
                relatedDocuments: [
                    ...guide.relatedDocuments,
                    {
                        index: guide.relatedDocuments.length,
                        serial: dataSale?.serial,
                        documentType: dataSale.documentType.replace("A_", ""),
                        correlative: Number(dataSale?.correlative),
                    },
                ],
                parentOperationId: dataSale.id,
                clientId: dataSale.client.id,
                clientName: dataSale.client.names,
                documentType: String(guideType),
                operationdetailSet: dataSale.operationdetailSet.map(
                    (detail: any, index: number) => ({
                        index,
                        productId: detail.productId,
                        productName: detail.productName,
                        quantity: detail.quantity,
                        description: "",
                    })
                ),
            });
            setInitialClientData({
                id: dataSale.client.id,
                names: dataSale.client.names,
                documentNumber: dataSale.client.documentNumber,
            });
            setIsLoading(false);
        },
        onError: (err) => {
            console.error("Error in sale:", err, auth?.jwtToken);
            setIsLoading(false);
        },
    });

    useEffect(() => {
        if (invoiceId && !hasQueried.current) {
            saleQuery({
                variables: {
                    pk: Number(invoiceId),
                },
            });
            hasQueried.current = true;
        }
    }, [invoiceId]);

    useEffect(() => {
        if (auth?.user?.subsidiarySerial) {
            const subsidiarySerial = auth?.user?.subsidiarySerial;
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

    const handleGuide = (
        event: ChangeEvent<
            HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = event.target;
        let formattedValue = value;
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

    const [createSale] = useCustomMutation(CREATE_GUIDE_MUTATION);

    const saveGuide = useCallback(async () => {
        if (isSaving) return; // Prevent multiple submissions

        try {
            setIsSaving(true);
            if (Number(guide.clientId) === 0) {
                toast("La guia debe tener un cliente.", {
                    hideProgressBar: true,
                    autoClose: 2000,
                    type: "error",
                });
                console.log("clientId", guide);
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

            if (
                (guide.guideOriginSerial.length === 0 ||
                    guide.guideArrivalSerial.length === 0) &&
                guide.guideReasonTransfer === "04"
            ) {
                toast(
                    "Los puntos de partida y llegada deben tener un codigo de establecimiento.",
                    {
                        hideProgressBar: true,
                        autoClose: 2000,
                        type: "error",
                    }
                );
                return false;
            }

            if (guide.guideModeTransfer === "02") {
                // Validar placa del vehículo principal
                const mainVehicleLicensePlate =
                    guide.mainVehicleLicensePlate || "";
                if (
                    !/^\S+(-\S+)?$/.test(mainVehicleLicensePlate) ||
                    mainVehicleLicensePlate.length < 6 ||
                    mainVehicleLicensePlate.length > 7
                ) {
                    toast(
                        "La placa del vehículo principal debe tener entre 6 y 7 caracteres, no debe tener espacios y solo puede contener un guion.",
                        {
                            hideProgressBar: true,
                            autoClose: 2000,
                            type: "error",
                        }
                    );
                    return false;
                }

                // Validar placas de otros vehículos
                const invalidOtherVehicles = guide.othersVehicles.filter(
                    (item) => {
                        const licensePlate = item.licensePlate || "";
                        return (
                            !/^\S+(-\S+)?$/.test(licensePlate) ||
                            licensePlate.length < 6 ||
                            licensePlate.length > 7
                        );
                    }
                );

                if (invalidOtherVehicles.length > 0) {
                    toast(
                        "Las placas de los vehículos deben tener entre 6 y 7 caracteres, no deben tener espacios y solo pueden contener un guion.",
                        {
                            hideProgressBar: true,
                            autoClose: 2000,
                            type: "warning",
                        }
                    );
                    return false;
                }

                // Validar licencia del conductor principal
                const mainDriverDriverLicense =
                    guide.mainDriverDriverLicense || "";
                if (
                    !/^\S+(-\S+)?$/.test(mainDriverDriverLicense) ||
                    mainDriverDriverLicense.length < 8 ||
                    mainDriverDriverLicense.length > 12
                ) {
                    toast(
                        "La licencia del conductor principal debe tener entre 8 y 12 caracteres, no debe tener espacios y solo puede contener un guion.",
                        {
                            hideProgressBar: true,
                            autoClose: 2000,
                            type: "error",
                        }
                    );
                    return false;
                }

                // Validar licencias de otros conductores
                const invalidOtherDrivers = guide.othersDrivers.filter(
                    (item) => {
                        const driverLicense = item.driverLicense || "";
                        return (
                            !/^\S+(-\S+)?$/.test(driverLicense) ||
                            driverLicense.length < 8 ||
                            driverLicense.length > 12
                        );
                    }
                );

                if (invalidOtherDrivers.length > 0) {
                    toast(
                        "Las licencias de los conductores deben tener entre 8 y 12 caracteres, no deben tener espacios y solo pueden contener un guion.",
                        {
                            hideProgressBar: true,
                            autoClose: 2000,
                            type: "warning",
                        }
                    );
                    return false;
                }
            }

            const today = new Date().toISOString().split("T")[0];
            if (guide.emitDate !== today) {
                toast("La fecha de emisión debe ser la fecha actual.", {
                    hideProgressBar: true,
                    autoClose: 2000,
                    type: "error",
                });
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
                    parseFloat(item.quantity)
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
                mainVehicleLicensePlate: String(
                    guide.mainVehicleLicensePlate
                ).toUpperCase(),
                othersVehiclesLicensePlateSet: guide.othersVehicles.map(
                    (item: any) => String(item.licensePlate).toUpperCase() || ""
                ),
                mainDriverDocumentType: guide.mainDriverDocumentType,
                mainDriverDocumentNumber: guide.mainDriverDocumentNumber,
                mainDriverDriverLicense: String(
                    guide.mainDriverDriverLicense
                ).toUpperCase(),
                mainDriverNames: guide.mainDriverNames,
                othersDriversDocumentTypeSet: guide.othersDrivers.map(
                    (item: any) => item.documentType || ""
                ),
                othersDriversDocumentNumberSet: guide.othersDrivers.map(
                    (item: any) => item.documentNumber || ""
                ),
                othersDriversDriverLicenseSet: guide.othersDrivers.map(
                    (item: any) =>
                        String(item.driverLicense).toUpperCase() || ""
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
                parentOperationId: Number(guide.parentOperationId),
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
        } finally {
            setIsSaving(false);
        }
    }, [createSale, guide, setGuide, initialStateGuide, isSaving]);
    return (
        <>
            {isLoading ? (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <>
                    <div className="p-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 lg:mt-1.5 dark:bg-gray-800 dark:border-gray-700">
                        <div className="w-full mb-1">
                            <Breadcrumb
                                section={"Guías de Remisión"}
                                article={"Nueva Guía de Remisión"}
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
                                            initialClientData={
                                                initialClientData
                                            }
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
                                                        value={
                                                            guide.observation
                                                        }
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
                                                    disabled={isSaving}
                                                >
                                                    {isSaving ? (
                                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                                    ) : (
                                                        <Save />
                                                    )}
                                                    {isSaving
                                                        ? "GUARDANDO..."
                                                        : "GENERAR GUIA"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}

export default NewGuidePageWithInvoice;
