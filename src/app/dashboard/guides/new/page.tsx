"use client";
import {
  IOperationDetail,
  IPerson,
  IRelatedDocument,
  IVehicle,
} from "@/app/types";
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
import GuideStopPoint, { isValidUbigeoId } from "./GuideStopPoint";
import GuideTransportation from "./GuideTransportation";
import GuideMainDriver from "./GuideMainDriver";
import { toast } from "react-toastify";
import GuideReceiver from "./GuideReceiver";
import GuideTranferData from "./GuideTranferData";
import GuideHeader from "./GuideHeader";
import GuideDetailAndDocument from "./GuideDetailAndDocument";

// Replace the current today constant with this:
const limaDate = new Date(
  new Date().toLocaleString("en-US", { timeZone: "America/Lima" }),
);
const today =
  limaDate.getFullYear() +
  "-" +
  String(limaDate.getMonth() + 1).padStart(2, "0") +
  "-" +
  String(limaDate.getDate()).padStart(2, "0");

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
  clientDocumentNumber: "",
  clientDocumentType: "",

  descripcionMotivo: "",
};

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
  const [isSaving, setIsSaving] = useState(false);

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
    [auth?.jwtToken],
  );

  // useEffect(() => {
  //     if (auth?.user?.subsidiarySerial) {
  //         const subsidiarySerial = auth?.user?.subsidiarySerial;
  //         if (subsidiarySerial) {
  //             const lastTwoDigits = subsidiarySerial.slice(-2);
  //             let prefix = "";

  //             switch (guide.documentType) {
  //                 case "09":
  //                     prefix = "TP";
  //                     break;
  //                 case "31":
  //                     prefix = "VP";
  //                     break;
  //                 default:
  //                     prefix = "";
  //             }

  //             const customSerial = `${prefix}${lastTwoDigits}`;
  //             setGuide((prevSale) => ({
  //                 ...prevSale,
  //                 serial: customSerial,
  //             }));
  //         }
  //         // if(guide?.documentType)
  //     }
  // }, [auth?.user?.subsidiarySerial, guide.documentType]);
  const handleGuide = (
    event: ChangeEvent<
      HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
    >,
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
        formattedValue = `${integer.slice(0, 6)}.${decimal.slice(0, 2)}`; // Máximo 6 dígitos con 2 decimales
      } else {
        formattedValue = formattedValue.slice(0, 6);
      }
    }
    setGuide((prev) => ({ ...prev, [name]: formattedValue }));
  };

  function useCustomMutation(mutation: DocumentNode) {
    return useMutation(mutation, {
      context: authContext,
      onError: (err) => console.error("Error in unit:", err), // Log the error for debugging
    });
  }

  const [createSale] = useCustomMutation(CREATE_SALE_MUTATION);

  const saveGuide = useCallback(async () => {
    if (isSaving) return;
    try {
      setIsSaving(true);

      if (Number(guide.clientId) === 0) {
        toast("La guia debe tener un cliente.", {
          hideProgressBar: true,
          autoClose: 2000,
          type: "error",
        });
        return false;
      }
      if (guide.serial.length !== 4) {
        toast("La guia debe tener una serie valida (4 caracteres).", {
          hideProgressBar: true,
          autoClose: 2000,
          type: "error",
        });
        return false;
      }
      if (!guide.operationdetailSet || guide.operationdetailSet.length === 0) {
        toast("Debe agregar al menos un producto a la guia.", {
          hideProgressBar: true,
          autoClose: 2000,
          type: "warning",
        });
        return false;
      }

      const invalidItems = guide.operationdetailSet.filter(
        (item) =>
          item.productId === 0 || !item.quantity || Number(item.quantity) <= 0,
      );

      if (invalidItems.length > 0) {
        toast(
          "Todos los productos deben tener una cantidad mayor a 0 y un producto seleccionado.",
          {
            hideProgressBar: true,
            autoClose: 2000,
            type: "warning",
          },
        );
        return false;
      }

      if (Number(guide.totalWeight) <= 0) {
        toast("La guia debe tener un peso total mayor a 0.", {
          hideProgressBar: true,
          autoClose: 2000,
          type: "warning",
        });
        return false;
      }

      if (guide.documentType === "09") {
        if (Number(guide.quantityPackages) <= 0) {
          toast("La guia debe tener un numero de bultos mayor a 0.", {
            hideProgressBar: true,
            autoClose: 2000,
            type: "warning",
          });
          return false;
        }
        if (guide.guideModeTransfer === "NA") {
          toast("La guia debe tener un tipo de transporte.", {
            hideProgressBar: true,
            autoClose: 2000,
            type: "error",
          });
          return false;
        }
        if (guide.guideModeTransfer === "01") {
          if (guide.transportationCompanyDocumentNumber.length !== 11) {
            toast(
              "La guia debe tener un RUC de transportista valido (11 digitos).",
              {
                hideProgressBar: true,
                autoClose: 2000,
                type: "error",
              },
            );
            return false;
          }
          if (guide.transportationCompanyNames.length === 0) {
            toast("La guia debe tener la razon social del transportista.", {
              hideProgressBar: true,
              autoClose: 2000,
              type: "error",
            });
            return false;
          }
        }
        if (guide.guideModeTransfer === "02") {
          if (guide.mainVehicleLicensePlate.length === 0) {
            toast("La guia debe tener la placa del vehiculo principal.", {
              hideProgressBar: true,
              autoClose: 2000,
              type: "error",
            });
            return false;
          }
          const invalidOtherVehicles = guide.othersVehicles.filter(
            (item) => item.licensePlate?.length === 0,
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
            toast("El DNI del conductor principal debe tener 8 digitos.", {
              hideProgressBar: true,
              autoClose: 2000,
              type: "error",
            });
            return false;
          }
          if (
            guide.mainDriverDocumentType === "6" &&
            guide.mainDriverDocumentNumber.length !== 11
          ) {
            toast("El RUC del conductor principal debe tener 11 digitos.", {
              hideProgressBar: true,
              autoClose: 2000,
              type: "error",
            });
            return false;
          }
          if (guide.mainDriverNames.length === 0) {
            toast("El conductor principal debe tener nombre y apellido.", {
              hideProgressBar: true,
              autoClose: 2000,
              type: "error",
            });
            return false;
          }
          if (guide.mainDriverDriverLicense.length === 0) {
            toast("El conductor principal debe tener licencia de conducir.", {
              hideProgressBar: true,
              autoClose: 2000,
              type: "error",
            });
            return false;
          }
          const invalidOtherDrivers = guide.othersDrivers.filter(
            (item) =>
              item.documentNumber?.length === 0 ||
              item.names?.length === 0 ||
              item.driverLicense?.length === 0,
          );
          if (invalidOtherDrivers.length > 0) {
            toast(
              "Todos los conductores secundarios deben tener documento, nombre y licencia.",
              {
                hideProgressBar: true,
                autoClose: 2000,
                type: "warning",
              },
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
        if (guide.mainVehicleLicensePlate.length === 0) {
          toast("La guia debe tener la placa del vehiculo principal.", {
            hideProgressBar: true,
            autoClose: 2000,
            type: "error",
          });
          return false;
        }
        const invalidOtherVehicles = guide.othersVehicles.filter(
          (item) => item.licensePlate?.length === 0,
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
          toast("El DNI del conductor principal debe tener 8 digitos.", {
            hideProgressBar: true,
            autoClose: 2000,
            type: "error",
          });
          return false;
        }
        if (
          guide.mainDriverDocumentType === "6" &&
          guide.mainDriverDocumentNumber.length !== 11
        ) {
          toast("El RUC del conductor principal debe tener 11 digitos.", {
            hideProgressBar: true,
            autoClose: 2000,
            type: "error",
          });
          return false;
        }
        if (guide.mainDriverNames.length === 0) {
          toast("El conductor principal debe tener nombre y apellido.", {
            hideProgressBar: true,
            autoClose: 2000,
            type: "error",
          });
          return false;
        }
        if (guide.mainDriverDriverLicense.length === 0) {
          toast("El conductor principal debe tener licencia de conducir.", {
            hideProgressBar: true,
            autoClose: 2000,
            type: "error",
          });
          return false;
        }
        const invalidOtherDrivers = guide.othersDrivers.filter(
          (item) =>
            item.documentNumber?.length === 0 ||
            item.names?.length === 0 ||
            item.driverLicense?.length === 0,
        );
        if (invalidOtherDrivers.length > 0) {
          toast(
            "Todos los conductores secundarios deben tener documento, nombre y licencia.",
            {
              hideProgressBar: true,
              autoClose: 2000,
              type: "warning",
            },
          );
          return false;
        }
        if (
          guide.receiverDocumentType === "1" &&
          guide.receiverDocumentNumber.length !== 8
        ) {
          toast("El DNI del destinatario debe tener 8 digitos.", {
            hideProgressBar: true,
            autoClose: 2000,
            type: "error",
          });
          return false;
        }
        if (
          guide.receiverDocumentType === "6" &&
          guide.receiverDocumentNumber.length !== 11
        ) {
          toast("El RUC del destinatario debe tener 11 digitos.", {
            hideProgressBar: true,
            autoClose: 2000,
            type: "error",
          });
          return false;
        }
        if (guide.receiverDocumentNumber.length === 0) {
          toast("La guia debe tener un numero de documento del destinatario.", {
            hideProgressBar: true,
            autoClose: 2000,
            type: "error",
          });
          return false;
        }
        if (guide.receiverNames.length === 0) {
          toast("La guia debe tener el nombre del destinatario.", {
            hideProgressBar: true,
            autoClose: 2000,
            type: "error",
          });
          return false;
        }
      }

      const remitenteRuc: string = auth?.user?.companyDoc || "";

      let destDocType = "";
      let destDocNumber = "";
      let destNames = "";
      if (guide.documentType === "31") {
        destDocType = guide.receiverDocumentType;
        destDocNumber = guide.receiverDocumentNumber;
        destNames = guide.receiverNames;
      } else {
        if (guide.guideReasonTransfer === "03") {
          destDocType = guide.receiverDocumentType;
          destDocNumber = guide.receiverDocumentNumber;
          destNames = guide.receiverNames;
        } else {
          destDocType = guide.clientDocumentType;
          destDocNumber = guide.clientDocumentNumber;
          destNames = guide.clientName;
        }
      }

      const compradorDocType = guide.clientDocumentType;
      const compradorDocNumber = guide.clientDocumentNumber;

      const motivo = guide.guideReasonTransfer;

      if (motivo === "01") {
        if (!destDocNumber) {
          toast("El destinatario es obligatorio para motivo Venta (01).", {
            hideProgressBar: true,
            autoClose: 2500,
            type: "error",
          });
          return false;
        }
        if (destDocNumber === remitenteRuc && remitenteRuc) {
          toast(
            "Para motivo Venta (01) el destinatario NO debe ser el mismo RUC del remitente.",
            {
              hideProgressBar: true,
              autoClose: 3000,
              type: "error",
            },
          );
          return false;
        }
      }

      if (motivo === "02") {
        if (!destDocNumber) {
          toast("El destinatario es obligatorio para motivo Compra (02).", {
            hideProgressBar: true,
            autoClose: 2500,
            type: "error",
          });
          return false;
        }
        if (destDocNumber !== remitenteRuc && remitenteRuc) {
          toast(
            "Para motivo Compra (02) el destinatario debe ser el mismo RUC del remitente (la propia empresa).",
            {
              hideProgressBar: true,
              autoClose: 3000,
              type: "error",
            },
          );
          return false;
        }
      }

      if (motivo === "03") {
        if (!compradorDocNumber) {
          toast(
            "El comprador es obligatorio para motivo Venta con entrega a terceros (03).",
            {
              hideProgressBar: true,
              autoClose: 3000,
              type: "error",
            },
          );
          return false;
        }
        if (!destDocNumber) {
          toast(
            "El destinatario es obligatorio para motivo Venta con entrega a terceros (03).",
            {
              hideProgressBar: true,
              autoClose: 3000,
              type: "error",
            },
          );
          return false;
        }
        if (compradorDocNumber === remitenteRuc && remitenteRuc) {
          toast(
            "Para motivo 03 el RUC del remitente debe ser distinto al RUC del comprador.",
            {
              hideProgressBar: true,
              autoClose: 3000,
              type: "error",
            },
          );
          return false;
        }
        if (compradorDocNumber === destDocNumber && compradorDocNumber) {
          toast(
            "Para motivo 03 el RUC del comprador debe ser distinto al RUC del destinatario.",
            {
              hideProgressBar: true,
              autoClose: 3000,
              type: "error",
            },
          );
          return false;
        }
      }

      if (motivo === "04") {
        if (!destDocNumber) {
          toast(
            "El destinatario es obligatorio para motivo Traslado entre establecimientos (04).",
            {
              hideProgressBar: true,
              autoClose: 2500,
              type: "error",
            },
          );
          return false;
        }
        if (destDocNumber !== remitenteRuc && remitenteRuc) {
          toast(
            "Para motivo 04 el destinatario debe tener el mismo RUC del remitente (misma empresa).",
            {
              hideProgressBar: true,
              autoClose: 3000,
              type: "error",
            },
          );
          return false;
        }
      }

      if (motivo === "05") {
        if (!destDocNumber) {
          toast(
            "El destinatario es obligatorio para motivo Consignación (05).",
            {
              hideProgressBar: true,
              autoClose: 2500,
              type: "error",
            },
          );
          return false;
        }
        if (destDocNumber === remitenteRuc && remitenteRuc) {
          toast(
            "Para motivo Consignación (05) el destinatario NO debe ser el mismo RUC del remitente.",
            {
              hideProgressBar: true,
              autoClose: 3000,
              type: "error",
            },
          );
          return false;
        }
      }

      if (motivo === "06") {
        if (!destDocNumber) {
          toast("El destinatario es obligatorio para motivo Devolución (06).", {
            hideProgressBar: true,
            autoClose: 2500,
            type: "error",
          });
          return false;
        }
        if (destDocType !== "6") {
          toast(
            "Para motivo Devolución (06) el tipo de documento del destinatario debe ser RUC (código 6).",
            {
              hideProgressBar: true,
              autoClose: 3000,
              type: "error",
            },
          );
          return false;
        }
        if (destDocNumber.length !== 11) {
          toast(
            "Para motivo Devolución (06) el destinatario debe tener un RUC válido (11 dígitos).",
            {
              hideProgressBar: true,
              autoClose: 3000,
              type: "error",
            },
          );
          return false;
        }
      }

      if (motivo === "07") {
        if (!destDocNumber) {
          toast(
            "El destinatario es obligatorio para motivo Recojo de bienes transformados (07).",
            {
              hideProgressBar: true,
              autoClose: 2500,
              type: "error",
            },
          );
          return false;
        }
        if (destDocNumber !== remitenteRuc && remitenteRuc) {
          toast(
            "Para motivo Recojo (07) el destinatario debe tener el mismo RUC del remitente (la propia empresa).",
            {
              hideProgressBar: true,
              autoClose: 3000,
              type: "error",
            },
          );
          return false;
        }
      }

      if (motivo === "08") {
        if (!destDocNumber) {
          toast(
            "El destinatario es obligatorio para motivo Importación (08).",
            {
              hideProgressBar: true,
              autoClose: 2500,
              type: "error",
            },
          );
          return false;
        }
        const hasDamDs = guide.relatedDocuments.some(
          (d: IRelatedDocument) =>
            d.documentType === "80" ||
            d.documentType === "81" ||
            d.documentType === "82" ||
            d.documentType === "83" ||
            d.documentType === "84" ||
            d.documentType === "85" ||
            d.documentType === "86" ||
            d.documentType === "87" ||
            d.documentType === "88" ||
            d.documentType === "89",
        );
        if (!hasDamDs && guide.relatedDocuments.length > 0) {
          const damRelated = guide.relatedDocuments.filter(
            (d: IRelatedDocument) => {
              const s = (d.serial || "").toUpperCase();
              return s.startsWith("D") || s.startsWith("S");
            },
          );
          if (damRelated.length === 0) {
            toast(
              "Para motivo Importación (08) se requiere un documento relacionado tipo DAM/DS.",
              {
                hideProgressBar: true,
                autoClose: 3000,
                type: "error",
              },
            );
            return false;
          }
        }
      }

      if (motivo === "09") {
        if (!destDocNumber) {
          toast(
            "El destinatario es obligatorio para motivo Exportación (09).",
            {
              hideProgressBar: true,
              autoClose: 2500,
              type: "error",
            },
          );
          return false;
        }
      }

      if (motivo === "13") {
        if (!destDocNumber) {
          toast("El destinatario es obligatorio para motivo Otros (13).", {
            hideProgressBar: true,
            autoClose: 2500,
            type: "error",
          });
          return false;
        }
        if (
          !guide.descripcionMotivo ||
          guide.descripcionMotivo.trim().length < 3
        ) {
          toast(
            "Para motivo Otros (13) es obligatoria la descripción del motivo.",
            {
              hideProgressBar: true,
              autoClose: 3000,
              type: "error",
            },
          );
          return false;
        }
      }

      if (motivo === "14") {
        if (!destDocNumber) {
          toast(
            "El destinatario es obligatorio para motivo Venta sujeta a confirmación (14).",
            {
              hideProgressBar: true,
              autoClose: 2500,
              type: "error",
            },
          );
          return false;
        }
      }

      if (motivo === "17") {
        if (!destDocNumber) {
          toast(
            "El destinatario es obligatorio para motivo Traslado para transformación (17).",
            {
              hideProgressBar: true,
              autoClose: 2500,
              type: "error",
            },
          );
          return false;
        }
        if (destDocType !== "6") {
          toast(
            "Para motivo Traslado para transformación (17) el tipo de documento del destinatario debe ser RUC (código 6).",
            {
              hideProgressBar: true,
              autoClose: 3000,
              type: "error",
            },
          );
          return false;
        }
        if (destDocNumber.length !== 11) {
          toast(
            "Para motivo 17 el destinatario debe tener un RUC válido (11 dígitos).",
            {
              hideProgressBar: true,
              autoClose: 3000,
              type: "error",
            },
          );
          return false;
        }
      }

      if (motivo === "18") {
        // Emisor itinerante: destinatario = NO, punto_llegada = NO
      }

      if (motivo === "03" && guide.documentType === "09") {
        if (
          guide.receiverDocumentType === "1" &&
          guide.receiverDocumentNumber.length !== 8
        ) {
          toast("El DNI del destinatario debe tener 8 dígitos.", {
            hideProgressBar: true,
            autoClose: 2000,
            type: "error",
          });
          return false;
        }
        if (
          guide.receiverDocumentType === "6" &&
          guide.receiverDocumentNumber.length !== 11
        ) {
          toast("El RUC del destinatario debe tener 11 dígitos.", {
            hideProgressBar: true,
            autoClose: 2000,
            type: "error",
          });
          return false;
        }
        if (guide.receiverDocumentNumber.length === 0) {
          toast("Debe ingresar el número de documento del destinatario.", {
            hideProgressBar: true,
            autoClose: 2000,
            type: "error",
          });
          return false;
        }
        if (guide.receiverNames.length === 0) {
          toast("Debe ingresar el nombre/razón social del destinatario.", {
            hideProgressBar: true,
            autoClose: 2000,
            type: "error",
          });
          return false;
        }
      }

      const invalidRelatedDocs = guide.relatedDocuments.filter(
        (doc: IRelatedDocument) => {
          const withoutSerial: boolean = Boolean(
            doc.serial?.trim().length !== 4,
          );
          const withoutCorrelative: boolean = Boolean(
            Number(doc.correlative) === 0,
          );
          const serial = (doc.serial || "").toUpperCase().charAt(0);
          let invalidSeries = false;
          if (doc.serial && doc.serial.trim().length === 4) {
            switch (doc.documentType) {
              case "01":
                invalidSeries = serial !== "F";
                break;
              case "03":
                invalidSeries = serial !== "B";
                break;
              case "07":
                invalidSeries = serial !== "B" && serial !== "N";
                break;
              case "09":
                invalidSeries = serial !== "T";
                break;
              case "31":
                invalidSeries = serial !== "V";
                break;
              default:
                invalidSeries = false;
            }
          }
          return withoutSerial || withoutCorrelative || invalidSeries;
        },
      );
      if (invalidRelatedDocs.length > 0) {
        toast(
          "Los documentos relacionados deben tener serie válida (4 caracteres): Factura=F, Boleta=B, Nota Crédito=B/N, Guía Remitente=T, Guía Transportista=V y correlativo válido.",
          {
            hideProgressBar: true,
            autoClose: 4000,
            type: "error",
          },
        );
        return false;
      }

      if (!isValidUbigeoId(guide.guideOriginDistrictId)) {
        toast(
          "Debe seleccionar un ubigeo válido de la lista como punto de partida.",
          {
            hideProgressBar: true,
            autoClose: 3000,
            type: "error",
          },
        );
        return false;
      }
      if (guide.guideOriginAddress.length === 0) {
        toast("Debe ingresar la direccion del punto de partida.", {
          hideProgressBar: true,
          autoClose: 2000,
          type: "error",
        });
        return false;
      }
      if (motivo !== "18") {
        if (!isValidUbigeoId(guide.guideArrivalDistrictId)) {
          toast(
            "Debe seleccionar un ubigeo válido de la lista como punto de llegada.",
            {
              hideProgressBar: true,
              autoClose: 3000,
              type: "error",
            },
          );
          return false;
        }
        if (guide.guideArrivalAddress.length === 0) {
          toast("Debe ingresar la direccion del punto de llegada.", {
            hideProgressBar: true,
            autoClose: 2000,
            type: "error",
          });
          return false;
        }
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
          },
        );
        return false;
      }

      if (guide.guideModeTransfer === "02") {
        const mainVehicleLicensePlate = guide.mainVehicleLicensePlate || "";
        if (
          !/^\S+(-\S+)?$/.test(mainVehicleLicensePlate) ||
          mainVehicleLicensePlate.length < 6 ||
          mainVehicleLicensePlate.length > 7
        ) {
          toast(
            "La placa del vehiculo principal debe tener entre 6 y 7 caracteres, sin espacios.",
            {
              hideProgressBar: true,
              autoClose: 2000,
              type: "error",
            },
          );
          return false;
        }
        const invalidOtherVehicles = guide.othersVehicles.filter((item) => {
          const licensePlate = item.licensePlate || "";
          return (
            !/^\S+(-\S+)?$/.test(licensePlate) ||
            licensePlate.length < 6 ||
            licensePlate.length > 7
          );
        });
        if (invalidOtherVehicles.length > 0) {
          toast(
            "Las placas de los vehiculos secundarios deben tener entre 6 y 7 caracteres, sin espacios.",
            {
              hideProgressBar: true,
              autoClose: 2000,
              type: "warning",
            },
          );
          return false;
        }
        const mainDriverDriverLicense = guide.mainDriverDriverLicense || "";
        if (
          !/^\S+(-\S+)?$/.test(mainDriverDriverLicense) ||
          mainDriverDriverLicense.length < 8 ||
          mainDriverDriverLicense.length > 12
        ) {
          toast(
            "La licencia del conductor principal debe tener entre 8 y 12 caracteres, sin espacios.",
            {
              hideProgressBar: true,
              autoClose: 2000,
              type: "error",
            },
          );
          return false;
        }
        const invalidOtherDrivers = guide.othersDrivers.filter((item) => {
          const driverLicense = item.driverLicense || "";
          return (
            !/^\S+(-\S+)?$/.test(driverLicense) ||
            driverLicense.length < 8 ||
            driverLicense.length > 12
          );
        });
        if (invalidOtherDrivers.length > 0) {
          toast(
            "Las licencias de los conductores secundarios deben tener entre 8 y 12 caracteres, sin espacios.",
            {
              hideProgressBar: true,
              autoClose: 2000,
              type: "warning",
            },
          );
          return false;
        }
      }

      const variables = {
        clientId: Number(guide.clientId),
        documentType: guide.documentType,

        serial: guide.serial,
        correlative: parseInt(
          guide.correlative === "" ? "0" : guide.correlative,
        ),

        emitDate: guide.emitDate,

        guideModeTransfer: guide.guideModeTransfer,
        guideReasonTransfer: guide.guideReasonTransfer,

        productIdSet: guide.operationdetailSet.map(
          (item: any) => item.productId,
        ),
        descriptionSet: guide.operationdetailSet.map(
          (item: any) => item.description || "",
        ),
        quantitySet: guide.operationdetailSet.map((item: any) =>
          parseFloat(item.quantity),
        ),

        relatedDocumentsSerialSet: guide.relatedDocuments.map(
          (item: any) => item.serial || "",
        ),

        relatedDocumentsDocumentTypeSet: guide.relatedDocuments.map(
          (item: any) => item.documentType || "",
        ),

        relatedDocumentsCorrelativeSet: guide.relatedDocuments.map(
          (item: any) =>
            Number(item.correlative === "" ? "0" : item.correlative),
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
          guide.mainVehicleLicensePlate,
        ).toUpperCase(),
        othersVehiclesLicensePlateSet: guide.othersVehicles.map(
          (item: any) => String(item.licensePlate).toUpperCase() || "",
        ),
        mainDriverDocumentType: guide.mainDriverDocumentType,
        mainDriverDocumentNumber: guide.mainDriverDocumentNumber,
        mainDriverDriverLicense: String(
          guide.mainDriverDriverLicense,
        ).toUpperCase(),
        mainDriverNames: guide.mainDriverNames,
        othersDriversDocumentTypeSet: guide.othersDrivers.map(
          (item: any) => item.documentType || "",
        ),
        othersDriversDocumentNumberSet: guide.othersDrivers.map(
          (item: any) => item.documentNumber || "",
        ),
        othersDriversDriverLicenseSet: guide.othersDrivers.map(
          (item: any) => String(item.driverLicense).toUpperCase() || "",
        ),
        othersDriversNamesSet: guide.othersDrivers.map(
          (item: any) => item.names || "",
        ),

        receiverDocumentType: guide.receiverDocumentType,
        receiverDocumentNumber: guide.receiverDocumentNumber,
        receiverNames: guide.receiverNames,
        guideOriginDistrictId: String(guide.guideOriginDistrictId || "").trim(),
        guideOriginAddress: guide.guideOriginAddress,
        guideOriginSerial: guide.guideOriginSerial,
        guideArrivalDistrictId: String(guide.guideArrivalDistrictId || "").trim(),
        guideArrivalAddress: guide.guideArrivalAddress,
        guideArrivalSerial: guide.guideArrivalSerial,
        observation: guide.observation,
      };
      // console.log("variables al guardar", variables, auth?.jwtToken);
      const { data, errors } = await createSale({
        variables: variables,
      });

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
    } catch (error: any) {
      console.error("Error creating invoice:", error);
      const message =
        error?.graphQLErrors?.[0]?.message ||
        error?.message ||
        "Error al crear la guía.";
      toast(message, {
        hideProgressBar: true,
        autoClose: 4000,
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  }, [createSale, guide, setGuide, initialStateGuide, isSaving]);
  return (
    <div className="min-h-screen bg-white dark:bg-gray-800">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 pb-16">
        <button
          type="button"
          onClick={() => router.push("/dashboard/guides")}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 mt-4 mb-2 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Volver a guías
        </button>

        <div className="flex flex-col items-center text-center mb-8 mt-2">
          <div className="relative mb-4">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-sm opacity-60" />
            <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white tracking-tight">
            Nueva Guía de Remisión
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
            Completa los datos para emitir una nueva guía
          </p>
          <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mt-3" />
        </div>

        <div className="space-y-5">
          <GuideHeader
            guide={guide}
            setGuide={setGuide}
            auth={auth}
            authContext={authContext}
            handleGuide={handleGuide}
          />
          <GuideDetailAndDocument
            guide={guide}
            setGuide={setGuide}
            auth={auth}
            authContext={authContext}
          />
          <GuideTranferData guide={guide} handleGuide={handleGuide} />
          <GuideTransportation
            guide={guide}
            setGuide={setGuide}
            authContext={authContext}
            handleGuide={handleGuide}
          />
          {guide?.guideModeTransfer === "02" && (
            <GuideMainDriver
              guide={guide}
              setGuide={setGuide}
              handleGuide={handleGuide}
              auth={auth}
              authContext={authContext}
            />
          )}
          {(guide?.documentType === "31" ||
            guide?.guideReasonTransfer === "03") && (
            <GuideReceiver
              guide={guide}
              setGuide={setGuide}
              handleGuide={handleGuide}
              authContext={authContext}
              auth={auth}
            />
          )}
          {guide?.guideReasonTransfer === "13" && (
            <div className="relative bg-white dark:bg-gray-800/80 backdrop-blur rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.1)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)] overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-60" />
              <div className="p-5 sm:p-6">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
                  Descripción del motivo (Otros)
                </h2>
                <textarea
                  name="descripcionMotivo"
                  onFocus={(e) => e.target.select()}
                  maxLength={250}
                  rows={2}
                  value={guide.descripcionMotivo}
                  onChange={handleGuide}
                  placeholder="Describa el motivo de traslado..."
                  className="w-full px-3 py-2.5 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-600/80 bg-gray-50/50 dark:bg-gray-700/30 text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200"
                />
              </div>
            </div>
          )}
          <GuideStopPoint
            guide={guide}
            setGuide={setGuide}
            authContext={authContext}
            handleGuide={handleGuide}
          />
          <div className="relative bg-white dark:bg-gray-800/80 backdrop-blur rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.1)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)] overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-60" />
            <div className="p-5 sm:p-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
                Observaciones
              </h2>
              <textarea
                name="observation"
                onFocus={(e) => e.target.select()}
                maxLength={500}
                rows={3}
                value={guide.observation}
                onChange={handleGuide}
                placeholder="Observaciones adicionales..."
                className="w-full px-3 py-2.5 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-600/80 bg-gray-50/50 dark:bg-gray-700/30 text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200"
              />
            </div>
          </div>

          <div className="pt-2 pb-4">
            <button
              type="button"
              className="group relative w-full inline-flex items-center justify-center gap-2 h-12 sm:h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg sm:text-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 ease-out"
              onClick={saveGuide}
              disabled={isSaving}
            >
              <span className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {isSaving && (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent border-white"></div>
              )}
              {isSaving ? "Guardando..." : "Crear Guía de Remisión"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewGuidePage;
