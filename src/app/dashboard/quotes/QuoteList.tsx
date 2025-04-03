import { IOperation } from "@/app/types";
import SunatCancel from "@/components/icons/SunatCancel";
import SunatCheck from "@/components/icons/SunatCheck";
import Popover from "@/components/Popover";
import Link from "next/link";
import React, { useState } from "react";
import { toast } from "react-toastify";
import SalePagination from "../sales/SalePagination";
import LoadingIcon from "@/components/icons/LoadingIcon";
import { Modal } from "flowbite";
import PdfPreviewModal from "../sales/PdfPreviewModal";

function QuoteList({
    setFilterObj,
    filterObj,
    quotesQuery,
    quotesData,
    modalWhatsApp,
    cpe,
    setCpe,
    user,
}: any) {
    const [pdfModal, setPdfModal] = useState<Modal | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string>("");
    const handleDownload = (url: string, filename: string) => {
        if (!url || !filename) {
            toast.error("URL o nombre de archivo no válido");
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
                link.download = filename; // Nombre del archivo a descargar
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            })
            .catch((error) =>
                console.error("Error al descargar el archivo:", error)
            );
    };
    const transformedSalesData = quotesData?.allQuotes?.quotes?.map(
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
            return `${baseClasses} bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300`;
        }
        if (status === "06") {
            return `${baseClasses} bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300 text-nowrap`;
        }
        return `${baseClasses}`;
    };

    const getStatusContent = (status: string, documentType: string) => {
        if (status === "01") return <LoadingIcon />;
        if (status === "02") {
            if (documentType === "09")
                return (
                    <>
                        <SunatCheck /> 0
                    </>
                );
            if (documentType === "31") return <SunatCheck />;
            return "-";
        }
        if (status === "06") return <SunatCancel />;
        return "";
    };

    const getPopoverContent = (item: IOperation) => {
        if (item.operationStatus === "02")
            return <p>{item.sunatDescription}</p>;
        if (item.operationStatus === "06") {
            return (
                <p>
                    {item.sunatDescriptionLow ||
                        "Los documentos no aceptados por la SUNAT se consideran como documentos ANULADOS para efectos tributarios en la mayoría de casos."}
                </p>
            );
        }
        return <p>Sin información</p>;
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
                    ? "GUÍA DE REMISIÓN TRANSPORTISTA"
                    : "NA",
            serial: item.serial,
            correlative: item.correlative,
            clientName: item.client?.names,
            clientDoc: item.client?.documentNumber,
        });
    };
    return (
        <>
            <div className="w-full overflow-x-auto">
                <div className="flex flex-wrap items-center gap-4 my-3 pl-3">
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-500 dark:text-gray-400">
                            Página:
                        </label>
                        <input
                            type="number"
                            name="page"
                            disabled
                            min="1"
                            onChange={(e) =>
                                setFilterObj({
                                    ...filterObj,
                                    page: Number(e.target.value),
                                })
                            }
                            value={filterObj.page}
                            className="form-control-sm w-16 text-center"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-500 dark:text-gray-400">
                            Registros por Página:
                        </label>
                        <select
                            name="pageSize"
                            disabled
                            value={filterObj.pageSize}
                            onChange={(e) =>
                                setFilterObj({
                                    ...filterObj,
                                    pageSize: Number(e.target.value),
                                })
                            }
                            className="form-control-sm w-20"
                        >
                            {[10, 20, 50].map((size) => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-500 dark:text-gray-400">
                            Total de Páginas:
                        </label>
                        <input
                            type="number"
                            disabled
                            readOnly
                            defaultValue={
                                quotesData?.allQuotes?.totalNumberOfPages
                            }
                            className="form-control-sm w-16 text-center"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-500 dark:text-gray-400">
                            Total de Registros:
                        </label>
                        <input
                            type="number"
                            disabled
                            readOnly
                            defaultValue={
                                quotesData?.allQuotes?.totalNumberOfSales
                            }
                            className="form-control-sm w-16 text-center"
                        />
                    </div>
                    <SalePagination
                        filterObj={filterObj}
                        setFilterObj={setFilterObj}
                        quotesQuery={quotesQuery}
                        quotesData={quotesData}
                    />
                </div>

                <table className="w-full border-collapse border border-gray-200 dark:border-gray-600">
                    <thead className="bg-gray-100 dark:bg-gray-700 text-xs text-left text-gray-500 uppercase dark:text-gray-400">
                        <tr>
                            {user?.isSuperuser && (
                                <>
                                    <th className="p-2 border border-gray-300 dark:border-gray-600">
                                        Id
                                    </th>
                                </>
                            )}
                            {[
                                "Fecha Emisión",
                                "Tipo",
                                "Serie",
                                "Num.",
                                "ENTIDAD",

                                "Enviado al Cliente",
                                "PDF",
                                "XML",
                                "CDR",
                                "Estado SUNAT",
                                "",
                            ].map((header, index) => (
                                <th
                                    key={index}
                                    className="p-2 border border-gray-300 dark:border-gray-600"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {transformedSalesData?.map(
                            (item: IOperation, index: number) => (
                                <tr
                                    key={item.id}
                                    className={`border border-gray-300 dark:border-gray-600 text-sm ${
                                        item.operationStatus === "06"
                                            ? "line-through text-red-600 dark:text-red-400"
                                            : ""
                                    }`}
                                >
                                    {user?.isSuperuser && (
                                        <>
                                            <td className="p-2 text-nowrap">
                                                {index + 1}
                                            </td>
                                        </>
                                    )}

                                    <td className="p-2 text-nowrap">
                                        {item.emitDate}
                                    </td>
                                    <td className="p-2">{item.documentType}</td>
                                    <td className="p-2">{item.serial}</td>
                                    <td className="p-2">{item.correlative}</td>
                                    <td className="p-2">
                                        {item.subsidiary?.companyName}
                                    </td>

                                    <td className="p-2 text-center">
                                        {item.sendWhatsapp ? "SI" : "X"}
                                    </td>
                                    <td className="p-2 text-center">
                                        {(item.documentType === "09" ||
                                            item.documentType === "31") &&
                                            item.operationStatus === "02" &&
                                            item.linkXml && (
                                                <a
                                                    // href={
                                                    //     process.env
                                                    //         .NEXT_PUBLIC_BASE_API +
                                                    //     "/operations/print_guide/" +
                                                    //     item.id +
                                                    //     "/"
                                                    // }
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setPdfUrl(
                                                            `${process.env.NEXT_PUBLIC_BASE_API}/operations/print_guide/${item.id}/`
                                                        );
                                                        pdfModal?.show();
                                                    }}
                                                    className="hover:underline"
                                                    // target="_blank"
                                                >
                                                    <span className="bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
                                                        PDF
                                                    </span>
                                                </a>
                                            )}
                                    </td>
                                    <td className="p-2 text-center">
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
                                    <td className="p-2 text-center">
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
                                    <td className="p-2 text-center">
                                        <>
                                            <span
                                                data-popover-target={`popover-status-${item.id}`}
                                                className={getStatusClassName(
                                                    item?.operationStatus
                                                )}
                                            >
                                                {getStatusContent(
                                                    item?.operationStatus,
                                                    String(item?.documentType)
                                                )}
                                            </span>
                                            <Popover
                                                id={`popover-status-${item.id}`}
                                            >
                                                {getPopoverContent(item)}
                                            </Popover>
                                        </>
                                    </td>
                                    <td className="p-2">
                                        {item?.operationStatus === "02" ||
                                        item?.operationStatus === "06" ? (
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
                        )}
                    </tbody>
                </table>
                <SalePagination
                    filterObj={filterObj}
                    setFilterObj={setFilterObj}
                    quotesQuery={quotesQuery}
                    quotesData={quotesData}
                />
            </div>
            <PdfPreviewModal
                pdfModal={pdfModal}
                setPdfModal={setPdfModal}
                pdfUrl={pdfUrl}
                setPdfUrl={setPdfUrl}
            />
        </>
    );
}

export default QuoteList;
