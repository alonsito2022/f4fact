import { IOperation } from "@/app/types";
import SunatCancel from "@/components/icons/SunatCancel";
import SunatCheck from "@/components/icons/SunatCheck";
import Popover from "@/components/Popover";
import Link from "next/link";
import React, { useState } from "react";
import { toast } from "react-toastify";
import GuidePagination from "./GuidePagination";
import LoadingIcon from "@/components/icons/LoadingIcon";
import { Modal } from "flowbite";
import PdfPreviewModal from "../sales/PdfPreviewModal";
import { gql, useMutation } from "@apollo/client";

const CANCEL_INVOICE = gql`
    mutation CancelInvoice($operationId: Int!, $lowDate: Date!) {
        cancelInvoice(operationId: $operationId, lowDate: $lowDate) {
            message
            success
        }
    }
`;

function GuideList({
    setFilterObj,
    filterObj,
    guidesQuery,
    guidesData,
    guidesLoading,
    modalWhatsApp,
    cpe,
    setCpe,
    user,
}: any) {
    const [pdfModal, setPdfModal] = useState<Modal | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string>("");
    const [pdfFileName, setPdfFileName] = useState<string>("");
    const handleDownload = (url: string, filename: string) => {
        if (!url || !filename) {
            toast.error("URL o nombre de archivo no valido");
            return;
        }

        fetch(url.toString().replace("http:", "https:"))
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error en la respuesta de la descarga");
                }
                return response.blob();
            })
            .then((blob) => {
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            })
            .catch((error) =>
                console.error("Error al descargar el archivo:", error)
            );
    };
    const transformedSalesData = guidesData?.allGuides?.guides?.map(
        (item: IOperation) => ({
            ...item,
            operationStatus: item.operationStatus.replace("A_", ""),
            documentType: item.documentType?.replace("A_", ""),
            fileNameXml: `${item?.subsidiary?.company?.doc}-${item?.documentType}-${item.serial}-${item.correlative}.xml`,
            fileNameCdr: `R-${item?.subsidiary?.company?.doc}-${item?.documentType}-${item.serial}-${item.correlative}.xml`,
        })
    );
    const getStatusClassName = (status: string) => {
        const baseClasses = "flex items-center justify-center";
        if (status === "02") {
            return `${baseClasses} text-green-600 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300`;
        }
        if (status === "06") {
            return `${baseClasses} bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300 text-nowrap`;
        }
        if (status === "07") {
            return `${baseClasses} bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300 text-nowrap`;
        }
        return `${baseClasses}`;
    };

    const getStatusContent = (status: string, documentType: string) => {
        if (status === "01") return <LoadingIcon />;
        if (status === "02") {
            if (documentType === "09")
                return (
                    <>
                        <SunatCheck />
                    </>
                );
            if (documentType === "31") return <SunatCheck />;
            return "-";
        }
        if (status === "06") return <SunatCancel />;
        if (status === "07") {
            return (
                <span className="text-red-600 font-bold text-xs">RECHAZADO</span>
            );
        }
        return "";
    };

    const getPopoverContent = (item: IOperation) => {
        if (item.operationStatus === "02")
            return <p>{item.sunatDescription}</p>;
        if (item.operationStatus === "06") {
            return (
                <p>
                    {item.sunatDescriptionLow ||
                        "Los documentos no aceptados por la SUNAT se consideran como documentos ANULADOS para efectos tributarios en la mayoria de casos."}
                </p>
            );
        }
        if (item.operationStatus === "07") {
            return (
                <p>
                    {item.sunatDescription ||
                        "La guia fue rechazada por SUNAT. Verifique los datos y vuelva a emitir."}
                </p>
            );
        }
        return <p>Sin informacion</p>;
    };
    const handleWhatsAppClick = (item: IOperation) => {
        modalWhatsApp.show();
        setCpe({
            ...cpe,
            id: Number(item.id),
            documentTypeDisplay:
                item.documentType === "09"
                    ? "GUIA DE REMISION REMITENTE"
                    : item.documentType === "31"
                    ? "GUIA DE REMISION TRANSPORTISTA"
                    : "NA",
            serial: item.serial,
            correlative: item.correlative,
            clientName: item.client?.names,
            clientDoc: item.client?.documentNumber,
        });
    };
    const [cancelInvoice, { loading, error, data }] =
        useMutation(CANCEL_INVOICE);

    const handleCancelInvoice = (operationId: number) => {
        const limaDate = new Date(
            new Date().toLocaleString("en-US", { timeZone: "America/Lima" })
        );
        const today =
            limaDate.getFullYear() +
            "-" +
            String(limaDate.getMonth() + 1).padStart(2, "0") +
            "-" +
            String(limaDate.getDate()).padStart(2, "0");

        cancelInvoice({
            variables: {
                operationId,
                lowDate: today,
            },
        })
            .then((response) => {
                if (response.data.cancelInvoice.success) {
                    toast.success("Guia anulada correctamente.");
                    guidesQuery({
                        variables: {
                            subsidiaryId: Number(filterObj.subsidiaryId),
                            startDate: filterObj.startDate,
                            endDate: filterObj.endDate,
                            documentType: filterObj.documentType,
                            page: Number(filterObj.page),
                            pageSize: Number(filterObj.pageSize),
                        },
                    });
                } else {
                    toast.error(
                        `Error: ${response.data.cancelInvoice.message}`
                    );
                }
            })
            .catch((err) => {
                toast.error("Error al anular la guia.");
                console.error(err, {
                    operationId,
                    lowDate: today,
                });
            });
    };
    const formatEmitTime = (emitTime: string) => {
        if (!emitTime) return "";

        try {
            const timeMatch = emitTime.match(/^(\d{1,2}):(\d{2})/);
            if (timeMatch) {
                const hours = timeMatch[1].padStart(2, "0");
                const minutes = timeMatch[2];
                return `${hours}:${minutes}`;
            }

            const date = new Date(emitTime);
            if (!isNaN(date.getTime())) {
                return date.toLocaleTimeString("es-PE", {
                    timeZone: "America/Lima",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                });
            }

            return emitTime;
        } catch (error) {
            console.error("Error formatting emitTime:", error);
            return emitTime;
        }
    };

    if (guidesLoading && !guidesData) {
        return (
            <div className="w-full">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-12">
                    <div className="flex flex-col items-center justify-center gap-4">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
                            <div className="w-12 h-12 rounded-full border-4 border-transparent border-t-blue-600 animate-spin absolute top-0 left-0"></div>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Cargando guias...
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                Espere un momento
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!guidesLoading && transformedSalesData?.length === 0) {
        return (
            <div className="w-full">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-12">
                    <div className="flex flex-col items-center justify-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <svg
                                className="w-8 h-8 text-gray-400 dark:text-gray-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                                />
                            </svg>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                No se encontraron guias
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-sm">
                                No hay registros de guias que coincidan con los filtros seleccionados. Intente ajustar las fechas o el tipo de documento.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="w-full overflow-x-auto">
                <GuidePagination
                    filterObj={filterObj}
                    setFilterObj={setFilterObj}
                    guidesQuery={guidesQuery}
                    guidesData={guidesData}
                />
                <table className="w-full border-collapse border border-gray-100 dark:border-gray-600">
                    <thead className="bg-gray-100 dark:bg-gray-700 text-[13px] text-black-500 uppercase dark:text-gray-400">
                        <tr>
                            {user?.isSuperuser && (
                                <>
                                    <th className="p-0.5 w-4 dark:border-gray-600">
                                        Id
                                    </th>
                                    <th className="p-0.5 w-80 dark:border-gray-600">
                                        Empresa
                                    </th>
                                    <th className="p-0.5 w-4 dark:border-gray-600">
                                        Hora
                                    </th>
                                </>
                            )}
                            <th className="p-0.5 pl-2 w-4 dark:border-gray-600 text-left">
                                Fecha
                            </th>
                            <th className="p-0.5 w-4 dark:border-gray-600">
                                Tipo
                            </th>
                            <th className="p-0.5 pl-2 pr-2 w-8 dark:border-gray-600">
                                Serie
                            </th>
                            <th className="p-0.5 pr-2 w-8 dark:border-gray-600 text-left">
                                Num.
                            </th>
                            <th className="p-0.5 w-80 dark:border-gray-600">
                                Entidad
                            </th>
                            <th className="p-0.5 w-4 dark:border-gray-600">
                                Enviado <br />
                                al
                                <br /> Cliente
                            </th>
                            <th className="p-0.5 pr-2 w-8 dark:border-gray-600">
                                PDF
                            </th>
                            <th className="p-0.5 pr-2 w-8 dark:border-gray-600">
                                XML
                            </th>
                            <th className="p-0.5 pr-2 w-8 dark:border-gray-600">
                                CDR
                            </th>
                            <th className="p-0.5 w-8 text-center dark:border-gray-600">
                                Estado <br />
                                en la
                                <br />
                                SUNAT
                            </th>
                            <th className="p-0.5 w-8 dark:border-gray-600"></th>
                        </tr>
                    </thead>
                    <tbody className="text-[13px] [&>tr:nth-child(even)]:bg-gray-100 dark:[&>tr:nth-child(even)]:bg-gray-800">
                        {guidesLoading ? (
                            <tr>
                                <td
                                    colSpan={user?.isSuperuser ? 14 : 11}
                                    className="text-center py-16"
                                >
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <div className="relative">
                                            <div className="w-10 h-10 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
                                            <div className="w-10 h-10 rounded-full border-4 border-transparent border-t-blue-600 animate-spin absolute top-0 left-0"></div>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Actualizando registros...
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            transformedSalesData?.map(
                                (item: IOperation, index: number) => (
                                    <tr
                                        key={item.id}
                                        className={`border border-gray-100 dark:border-gray-600 ${
                                            item.operationStatus === "06"
                                                ? "line-through text-red-600 dark:text-red-400"
                                                : item.operationStatus === "07"
                                                ? "text-red-500 dark:text-red-400"
                                                : ""
                                        }`}
                                    >
                                        {user?.isSuperuser && (
                                            <>
                                                <td className="p-0.5">
                                                    {index + 1}
                                                </td>
                                                <td className="p-0.5">
                                                    {item.subsidiary.companyName}
                                                </td>
                                                <td className="p-0.5 pl-2 text-nowrap font-bold text-blue-600 dark:text-blue-500">
                                                    {formatEmitTime(item.emitTime)}
                                                </td>
                                            </>
                                        )}
                                        <td className="p-0.5 pl-2 text-nowrap">
                                            {item.emitDate}
                                        </td>
                                        <td className="p-0.5 text-center">
                                            {item.documentType}
                                        </td>
                                        <td className="p-0.5 text-center">
                                            {item.serial}
                                        </td>
                                        <td className="p-0.5 text-left">
                                            {item.correlative}
                                        </td>
                                        <td className="p-0.5 text-nowrap">
                                            {item.client?.names}
                                        </td>
                                        <td className="p-0.5 text-center">
                                            {item.sendWhatsapp ? (
                                                "SI"
                                            ) : (
                                                <span className="text-red-800 font-black">
                                                    x
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-0.5 text-center">
                                            {(item.documentType === "09" ||
                                                item.documentType === "31") && (
                                                <a
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setPdfUrl(
                                                            `${process.env.NEXT_PUBLIC_BASE_API}/operations/print_guide/${item.id}/`
                                                        );
                                                        setPdfFileName(
                                                            `${item?.subsidiary?.company?.doc}-${item.documentType}-${item.serial}-${item.correlative}.pdf`
                                                        );
                                                        pdfModal?.show();
                                                    }}
                                                    className="hover:underline"
                                                >
                                                    <span className="bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
                                                        PDF
                                                    </span>
                                                </a>
                                            )}
                                        </td>
                                        <td className="p-0.5 text-center">
                                            {(() => {
                                                const hasXml =
                                                    item.operationStatus === "02" &&
                                                    item.linkXml;

                                                if (!hasXml) return null;

                                                const xmlUrl =
                                                    item.operationStatus === "02"
                                                        ? item.linkXml
                                                        : item.linkXmlLow;

                                                return (
                                                    <a
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleDownload(
                                                                xmlUrl,
                                                                item?.fileNameXml
                                                            );
                                                        }}
                                                        className="hover:underline"
                                                    >
                                                        <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300 text-nowrap">
                                                            XML
                                                        </span>
                                                    </a>
                                                );
                                            })()}
                                        </td>
                                        <td className="p-0.5 text-center">
                                            {(() => {
                                                const hasCdr =
                                                    item.operationStatus === "02" &&
                                                    item.linkCdr;
                                                if (!hasCdr) return null;

                                                const cdrUrl =
                                                    item.operationStatus === "02"
                                                        ? item.linkCdr
                                                        : item.linkCdrLow;
                                                const getCdrStyle = () => {
                                                    if (
                                                        item.operationStatus ===
                                                        "02"
                                                    ) {
                                                        return item.documentType ===
                                                            "09"
                                                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                                            : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
                                                    }
                                                    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
                                                };

                                                return (
                                                    <a
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleDownload(
                                                                cdrUrl,
                                                                item?.fileNameCdr
                                                            );
                                                        }}
                                                        className="hover:underline"
                                                    >
                                                        <span
                                                            className={`text-xs font-medium me-2 px-2.5 py-0.5 rounded-full text-nowrap ${getCdrStyle()}`}
                                                        >
                                                            {item.operationStatus ===
                                                                "06" &&
                                                            !item.linkCdrLow
                                                                ? "SIN CDR"
                                                                : "CDR"}
                                                        </span>
                                                    </a>
                                                );
                                            })()}
                                        </td>
                                        <td className="p-0.5 text-center">
                                            {!(
                                                item.operationStatus === "06" &&
                                                (item.documentType === "09" ||
                                                    item.documentType === "31")
                                            ) && (
                                                <>
                                                    <span
                                                        data-popover-target={`popover-status-${item.id}`}
                                                        className={getStatusClassName(
                                                            item?.operationStatus
                                                        )}
                                                    >
                                                        {getStatusContent(
                                                            item?.operationStatus,
                                                            String(
                                                                item?.documentType
                                                            )
                                                        )}
                                                    </span>
                                                    <Popover
                                                        id={`popover-status-${item.id}`}
                                                    >
                                                        {getPopoverContent(item)}
                                                    </Popover>
                                                </>
                                            )}
                                        </td>
                                        <td className="p-0.5">
                                            {item?.operationStatus === "02" ||
                                            item?.operationStatus === "06" ||
                                            item?.operationStatus === "07" ? (
                                                <>
                                                    <span
                                                        data-popover-target={
                                                            "popover-options-" +
                                                            item.id
                                                        }
                                                        className={
                                                            "font-medium text-blue-600 dark:text-blue-500 hover:underline cursor-pointer"
                                                        }
                                                    >
                                                        Opciones
                                                    </span>
                                                    <Popover
                                                        id={
                                                            "popover-options-" +
                                                            item.id
                                                        }
                                                    >
                                                        <a
                                                            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                                                            href="#"
                                                            onClick={() =>
                                                                handleWhatsAppClick(
                                                                    item
                                                                )
                                                            }
                                                        >
                                                            Enviar por WhatsApp
                                                        </a>
                                                        <br />
                                                        {item.operationStatus !==
                                                            "06" &&
                                                            item.operationStatus !==
                                                            "07" && (
                                                                <>
                                                                    <a
                                                                        className="font-medium text-red-600 dark:text-red-500 hover:underline"
                                                                        href="#"
                                                                        onClick={(
                                                                            e
                                                                        ) => {
                                                                            e.preventDefault();
                                                                            const confirmDelete =
                                                                                window.confirm(
                                                                                    "Esta opcion solo indicara que la Guia de Remision seleccionada esta inutilizada para un control interno, para dar de baja una Guia debe hacerse con clave SOL."
                                                                                );

                                                                            if (
                                                                                confirmDelete
                                                                            ) {
                                                                                handleCancelInvoice(
                                                                                    Number(
                                                                                        item?.id
                                                                                    )
                                                                                );
                                                                            }
                                                                        }}
                                                                    >
                                                                        INUTILIZAR GUIA
                                                                        DE REMISION
                                                                        (INTERNO)
                                                                    </a>
                                                                    <br />
                                                                </>
                                                            )}

                                                        <a
                                                            className="font-medium text-green-600 dark:text-green-500 hover:underline"
                                                            target="_blank"
                                                            href="https://ww1.sunat.gob.pe/ol-ti-itconsultaunificadalibre/consultaUnificadaLibre/consulta"
                                                        >
                                                            CONSULTA SUNAT 1
                                                        </a>
                                                        <br />
                                                        <a
                                                            className="font-medium text-green-600 dark:text-green-500 hover:underline"
                                                            target="_blank"
                                                            href="https://ww1.sunat.gob.pe/ol-ti-itconsvalicpe/ConsValiCpe.htm"
                                                        >
                                                            CONSULTA SUNAT 2
                                                        </a>
                                                        <br />
                                                        <a
                                                            className="font-medium text-green-600 dark:text-green-500 hover:underline"
                                                            target="_blank"
                                                            href="https://ww1.sunat.gob.pe/ol-ti-itconsverixml/ConsVeriXml.htm"
                                                        >
                                                            Verificar XML en la
                                                            SUNAT
                                                        </a>
                                                    </Popover>
                                                </>
                                            ) : (
                                                item?.operationStatusReadable
                                            )}
                                        </td>
                                    </tr>
                                )
                            )
                        )}
                    </tbody>
                </table>
                <GuidePagination
                    filterObj={filterObj}
                    setFilterObj={setFilterObj}
                    guidesQuery={guidesQuery}
                    guidesData={guidesData}
                />
            </div>
            <PdfPreviewModal
                pdfModal={pdfModal}
                setPdfModal={setPdfModal}
                pdfUrl={pdfUrl}
                setPdfUrl={setPdfUrl}
                pdfFileName={pdfFileName}
                setPdfFileName={setPdfFileName}
            />
        </>
    );
}

export default GuideList;
