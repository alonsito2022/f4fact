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
import { gql } from "@apollo/client";

function QuoteList({
    setFilterObj,
    filterObj,
    quotesQuery,
    quotesData,
    modalWhatsApp,
    modalEditClient,
    getClientById,
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
        (item: IOperation) => {
            const docType = item.client?.documentType?.replace("A_", "");
            return {
                ...item,
                operationStatus: item.operationStatus.replace("A_", ""),
                documentType: item.documentType?.replace("A_", ""),
                client: {
                    ...item.client,
                    documentType: docType,
                    documentTypeReadable:
                        docType === "1"
                            ? "DNI"
                            : docType === "6"
                            ? "RUC"
                            : docType,
                },
                fileNameXml: `${item?.subsidiary?.company?.doc}-${item?.documentType}-${item.serial}-${item.correlative}.xml`,
                fileNameCdr: `R-${item?.subsidiary?.company?.doc}-${item?.documentType}-${item.serial}-${item.correlative}.xml`,
            };
        }
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
                                "Num.",
                                "RUC / DNI / ETC",
                                "DENOMINACIÓN",
                                "M",
                                "TOTAL ONEROSA",
                                "TOTAL GRATUITA",
                                "ENVIADO AL CLIENTE",
                                "PDF",

                                "CPE RELACIONADO",
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
                                    <td className="p-2">{item.correlative}</td>
                                    <td className="p-2">
                                        {item.client?.documentTypeReadable}
                                    </td>
                                    <td className="p-2">
                                        {item.client?.names}
                                    </td>
                                    <td className="p-2">
                                        {item.currencyType === "PEN"
                                            ? "S/"
                                            : item.currencyType}
                                    </td>
                                    <td className="p-2 text-right">
                                        {Number(item.totalAmount).toFixed(2)}
                                    </td>
                                    <td className="p-2 text-right">
                                        {Number(item.totalFree).toFixed(2)}
                                    </td>

                                    <td className="p-2 text-center">
                                        {item.sendWhatsapp ? "SI" : "X"}
                                    </td>
                                    <td className="p-2 text-center">
                                        {item.documentType === "48" &&
                                            (item.operationStatus === "01" ||
                                                item.operationStatus ===
                                                    "06") && (
                                                <a
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setPdfUrl(
                                                            `${process.env.NEXT_PUBLIC_BASE_API}/operations/quotation/${item.id}/`
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
                                    <td className="p-2 text-center"></td>
                                    <td className="p-2">
                                        {item?.operationStatus === "01" && (
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
                                                        CONVERTIR EN COMPROBANTE
                                                    </a>
                                                    <br />
                                                    <a
                                                        className="font-medium text-green-600 dark:text-green-500 hover:underline"
                                                        target="_blank"
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            console.log(
                                                                "clientId",
                                                                item?.client?.id
                                                            );
                                                            getClientById({
                                                                variables: {
                                                                    clientId:
                                                                        item
                                                                            ?.client
                                                                            ?.id,
                                                                },
                                                            });
                                                            modalEditClient.show();
                                                        }}
                                                    >
                                                        [Editar cliente]
                                                    </a>
                                                    <br />
                                                    <a
                                                        className="font-medium text-green-600 dark:text-green-500 hover:underline"
                                                        target="_blank"
                                                        href="https://ww1.sunat.gob.pe/ol-ti-itconsverixml/ConsVeriXml.htm"
                                                    >
                                                        [Editar]
                                                    </a>
                                                    <br />
                                                    <a
                                                        className="font-medium text-red-600 dark:text-red-500 hover:underline"
                                                        target="_blank"
                                                        href="https://ww1.sunat.gob.pe/ol-ti-itconsvalicpe/ConsValiCpe.htm"
                                                    >
                                                        Borrar
                                                    </a>
                                                </Popover>
                                            </>
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
