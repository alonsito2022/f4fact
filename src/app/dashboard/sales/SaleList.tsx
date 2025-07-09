import React, { useState } from "react";
import { IOperation, IProduct } from "@/app/types";
import Close from "@/components/icons/Close";
import Popover from "@/components/Popover";
import Check from "@/components/icons/Check";
import { toast } from "react-toastify";
import { gql, useMutation } from "@apollo/client";
import SunatCheck from "@/components/icons/SunatCheck";
import SunatCancel from "@/components/icons/SunatCancel";
import Link from "next/link";
import SalePagination from "./SalePagination";
import LoadingIcon from "@/components/icons/LoadingIcon";
import { Modal } from "flowbite";
import PdfPreviewModal from "./PdfPreviewModal";
const today = new Date().toISOString().split("T")[0];

const CANCEL_INVOICE = gql`
    mutation CancelInvoice($operationId: Int!, $lowDate: Date!) {
        cancelInvoice(operationId: $operationId, lowDate: $lowDate) {
            message
            success
        }
    }
`;

function SaleList({
    filteredSalesData,
    setFilterObj,
    filterObj,
    modalWhatsApp,
    cpe,
    setCpe,
    salesQuery,
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
    const [cancelInvoice, { loading, error, data }] =
        useMutation(CANCEL_INVOICE);

    const normalizeDate = (date: string) => {
        const normalized = new Date(date);
        normalized.setHours(0, 0, 0, 0);
        return normalized;
    };
    const handleCancelInvoice = (
        operationId: number,
        emitDate: string,
        documentType: string
    ) => {
        const limaDate = new Date(
            new Date().toLocaleString("en-US", { timeZone: "America/Lima" })
        );
        limaDate.setHours(0, 0, 0, 0); // Normalizar la fecha actual

        const emitDateObj = normalizeDate(emitDate);
        const fiveDaysAgo = new Date(limaDate);
        fiveDaysAgo.setDate(limaDate.getDate() - 6);
        const threeDaysAgo = new Date(limaDate);
        threeDaysAgo.setDate(limaDate.getDate() - 4);

        if (documentType === "03") {
            // Boleta
            if (emitDateObj < fiveDaysAgo || emitDateObj > limaDate) {
                toast.error(
                    "La fecha de emisión de la boleta debe estar entre 5 días antes y hoy. "
                );
                return;
            }
        } else if (documentType === "01") {
            // Factura
            if (emitDateObj < threeDaysAgo || emitDateObj > limaDate) {
                toast.error(
                    "La fecha de emisión de la factura debe estar entre 3 días antes y hoy. "
                );
                return;
            }
        }

        cancelInvoice({
            variables: {
                operationId,
                lowDate: today,
            },
        })
            .then((response) => {
                if (response.data.cancelInvoice.success) {
                    toast.success("Factura anulada correctamente.");
                    salesQuery({
                        variables: {
                            subsidiaryId: Number(user?.subsidiaryId),
                            clientId: Number(filterObj.clientId),
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
                toast.error("Error al anular la factura.");
                console.error(err, {
                    operationId,
                    lowDate: today,
                });
            });
    };
    const transformedSalesData = filteredSalesData?.allSales?.sales?.map(
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
        return `${baseClasses}`;
    };

    const getStatusContent = (status: string, documentType: string) => {
        if (status === "01") return <LoadingIcon />;
        if (status === "02") {
            if (documentType === "01")
                return (
                    <>
                        <SunatCheck />
                    </>
                );
            if (documentType === "03") return <SunatCheck />;
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
                item.documentType === "01"
                    ? "FACTURA"
                    : item.documentType === "03"
                    ? "BOLETA"
                    : "NA",
            serial: item.serial,
            correlative: item.correlative,
            clientName: item.client?.names,
            clientDoc: item.client?.documentNumber,
        });
    };

    const formatEmitTime = (emitTime: string) => {
        if (!emitTime) return "";

        try {
            // If emitTime is already a time string (e.g., "15:46:59.855548")
            // Extract only hours and minutes
            const timeMatch = emitTime.match(/^(\d{1,2}):(\d{2})/);
            if (timeMatch) {
                const hours = timeMatch[1].padStart(2, "0");
                const minutes = timeMatch[2];
                return `${hours}:${minutes}`;
            }

            // Fallback: try to parse as full datetime
            const date = new Date(emitTime);
            if (!isNaN(date.getTime())) {
                return date.toLocaleTimeString("es-PE", {
                    timeZone: "America/Lima",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                });
            }

            return emitTime; // Return original if parsing fails
        } catch (error) {
            console.error("Error formatting emitTime:", error);
            return emitTime; // Return original value if formatting fails
        }
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
                                filteredSalesData?.allSales?.totalNumberOfPages
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
                                filteredSalesData?.allSales?.totalNumberOfSales
                            }
                            className="form-control-sm w-16 text-center"
                        />
                    </div>
                    <SalePagination
                        filterObj={filterObj}
                        setFilterObj={setFilterObj}
                        salesQuery={salesQuery}
                        filteredSalesData={filteredSalesData}
                    />
                </div>

                <table className="w-full border-collapse border border-gray-100 dark:border-gray-600">
                    <thead className="bg-gray-100 dark:bg-gray-700 text-[13px] text-black-500 uppercase dark:text-gray-400">
                        <tr>
                            {user?.isSuperuser && (
                                <>
                                    <th className="w-4 dark:border-gray-600">
                                        Id
                                    </th>
                                    <th className="w-80 dark:border-gray-600">
                                        Empresa
                                    </th>
                                    <th className="w-4 dark:border-gray-600">
                                        Hora
                                    </th>
                                </>
                            )}
                            <th className="pl-2 w-8 dark:border-gray-600 text-left">
                                Fecha
                            </th>
                            <th className="w-4 dark:border-gray-600">Tipo</th>
                            <th className="pl-2 pr-2 w-8 dark:border-gray-600">
                                Serie
                            </th>
                            <th className="pr-2 w-8 dark:border-gray-600 text-left">
                                Num.
                            </th>
                            <th className="w-8 dark:border-gray-600 text-left">
                                RUC / DNI / <br />
                                ETC
                            </th>
                            <th className="w-80 dark:border-gray-600">
                                Denominación
                            </th>
                            <th className="w-4 dark:border-gray-600">
                                Usuario
                            </th>
                            <th className="w-4 dark:border-gray-600">M</th>

                            <th className="pl-2 pr-1 w-16 dark:border-gray-600 text-right">
                                Total Onerosa
                            </th>
                            <th className="pl-1 pr-1 w-16 dark:border-gray-600 text-right">
                                Total Gratuita
                            </th>
                            <th className="pl-2 w-8 dark:border-gray-600">
                                Pagado?
                            </th>
                            <th className="w-8 dark:border-gray-600">
                                Anulado?
                            </th>
                            <th className="w-16 dark:border-gray-600">
                                Enviado <br />
                                al
                                <br /> Cliente
                            </th>
                            <th className="pr-2 w-8 dark:border-gray-600">
                                PDF
                            </th>
                            <th className="pr-2 w-8 dark:border-gray-600">
                                XML
                            </th>
                            <th className="pr-2 w-8 dark:border-gray-600">
                                CDR
                            </th>
                            <th className="w-8 text-center dark:border-gray-600">
                                Estado <br />
                                en la
                                <br />
                                SUNAT
                            </th>
                            <th className="w-8 dark:border-gray-600"></th>
                        </tr>
                    </thead>
                    <tbody className="text-[13px] [&>tr:nth-child(even)]:bg-gray-100 dark:[&>tr:nth-child(even)]:bg-gray-800">
                        {transformedSalesData?.map(
                            (item: IOperation, index: number) => (
                                <tr
                                    key={item.id}
                                    className={`border border-gray-100 dark:border-gray-600 ${
                                        item.operationStatus === "06"
                                            ? "line-through text-red-600 dark:text-red-400"
                                            : ""
                                    }`}
                                >
                                    {user?.isSuperuser && (
                                        <>
                                            <td className="p-0.5 font-bold text-blue-600 dark:text-blue-500">
                                                {index + 1}
                                            </td>
                                            <td className="p-0.5 font-bold text-blue-600 dark:text-blue-500">
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
                                    <td className="p-0.5 tex-left">
                                        {item.correlative}
                                    </td>
                                    <td className="p-0.5 tex-left">
                                        {item.client?.documentNumber}
                                    </td>
                                    <td className="p-0.5">
                                        {item.client?.names}
                                    </td>
                                    <td className="p-0.5 text-center">
                                        {item?.user?.fullName}
                                    </td>
                                    <td className="p-0.5 text-center">
                                        {item.currencyType === "PEN"
                                            ? "S/"
                                            : item.currencyType}
                                    </td>

                                    <td className="p-0.5 text-right">
                                        {Number(item.totalToPay).toFixed(2)}
                                    </td>
                                    <td className="p-0.5 text-right">
                                        {Number(item.totalFree).toFixed(2)}
                                    </td>

                                    <td className="p-0.5 text-center">
                                        {Number(item.totalPayed) > 0
                                            ? "SI"
                                            : "X"}
                                    </td>
                                    <td className="p-0.5 text-center">
                                        {item.operationStatus === "06"
                                            ? "SI"
                                            : "NO"}
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
                                        {(item.documentType === "03" ||
                                            item.documentType === "01" ||
                                            item.documentType === "07") && (
                                            <a
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setPdfUrl(
                                                        `${
                                                            process.env
                                                                .NEXT_PUBLIC_BASE_API
                                                        }/operations/${
                                                            item.documentType ===
                                                            "07"
                                                                ? "print_credit_note"
                                                                : "print_invoice"
                                                        }/${item.id}/`
                                                    );
                                                    pdfModal?.show();
                                                }}
                                                className="hover:underline"
                                            >
                                                <span className="bg-red-600 text-white text-[11px] font-semibold me-2 px-1.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
                                                    PDF
                                                </span>
                                            </a>
                                        )}
                                    </td>
                                    <td className="p-0.5 text-center">
                                        {(() => {
                                            const hasXml =
                                                (item.operationStatus ===
                                                    "02" &&
                                                    item.linkXml) ||
                                                (item.operationStatus ===
                                                    "06" &&
                                                    item.linkXmlLow);

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
                                                    <span className="bg-green-600 text-white text-[11px] font-semibold me-2 px-1.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300 text-nowrap">
                                                        XML
                                                    </span>
                                                </a>
                                            );
                                        })()}
                                    </td>
                                    <td className="p-0.5 text-center">
                                        {(() => {
                                            const hasCdr =
                                                (item.operationStatus ===
                                                    "02" &&
                                                    item.linkCdr) ||
                                                (item.operationStatus ===
                                                    "06" &&
                                                    item.linkCdrLow);
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
                                                        "01"
                                                        ? "bg-blue-500 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                                        : "bg-gray-500 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
                                                }
                                                return "bg-yellow-600 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
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
                                                        className={`text-white text-[11px] font-semibold me-2 px-1.5 py-0.5 rounded-full text-nowrap ${getCdrStyle()}`}
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
                                        {/* {item?.sunatStatus ? () : (
                                            "X"
                                        )} */}
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
                                    {/* <td className="p-0.5">{item?.creditNoteReferences}</td> */}
                                    <td className="p-0.5">
                                        {item?.operationStatus === "01" ||
                                        item?.operationStatus === "02" ||
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

                                                    {item.operationStatus !==
                                                        "06" &&
                                                        item.codeHash && (
                                                            <>
                                                                <Link
                                                                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                                                                    href={`/dashboard/sales/credit_note/${item.id}`}
                                                                >
                                                                    Generar NOTA
                                                                    DE CREDITO
                                                                </Link>
                                                                <br />
                                                                {/* <a
                                                                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                                                                    target="_blank"
                                                                    href="#"
                                                                >
                                                                    Generar NOTA
                                                                    DE DÉBITO
                                                                </a>
                                                                <br /> */}
                                                                <a
                                                                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                                                                    href={`/dashboard/guides/${item.id}/09`}
                                                                >
                                                                    Generar GUIA
                                                                    DE REMISIÓN
                                                                    REMITENTE
                                                                </a>
                                                                <br />
                                                                <a
                                                                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                                                                    href={`/dashboard/guides/${item.id}/31`}
                                                                >
                                                                    Generar GUIA
                                                                    DE REMISIÓN
                                                                    TRANSPORTISTA
                                                                </a>
                                                                <br />
                                                                <a
                                                                    className="font-medium text-red-600 dark:text-red-500 hover:underline"
                                                                    href="#"
                                                                    onClick={(
                                                                        e
                                                                    ) => {
                                                                        e.preventDefault(); // Evita que el enlace cambie de página
                                                                        const confirmDelete =
                                                                            window.confirm(
                                                                                "¿Estás seguro de que deseas anular esta factura? Esta acción no se puede deshacer."
                                                                            );

                                                                        if (
                                                                            confirmDelete
                                                                        ) {
                                                                            handleCancelInvoice(
                                                                                Number(
                                                                                    item?.id
                                                                                ),
                                                                                item.emitDate,
                                                                                item.documentType
                                                                            );
                                                                        }
                                                                    }}
                                                                >
                                                                    ANULAR o
                                                                    COMUNICAR DE
                                                                    BAJA
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
                        )}
                    </tbody>
                    <tfoot>
                        <tr>
                            {user?.isSuperuser && (
                                <td
                                    colSpan={3}
                                    className="p-1 text-sm font-bold text-nowrap text-right"
                                >
                                    Total de FACTURAS:
                                </td>
                            )}
                            <td
                                colSpan={7}
                                className="p-1 text-sm font-bold text-nowrap text-right"
                            >
                                Total de FACTURAS:
                            </td>
                            <td
                                colSpan={1}
                                className="p-1 text-sm font-bold text-nowrap"
                            >
                                {" S/ "}
                            </td>
                            <td
                                colSpan={1}
                                className="p-1 text-sm font-bold text-nowrap text-right"
                            >
                                {filteredSalesData?.allSales?.totalInvoices
                                    ? Number(
                                          filteredSalesData?.allSales
                                              ?.totalInvoices
                                      ).toFixed(2)
                                    : "0.00"}
                            </td>
                            <td colSpan={11}></td>
                        </tr>
                        <tr>
                            {user?.isSuperuser && (
                                <td
                                    colSpan={3}
                                    className="p-1 text-sm font-bold text-nowrap text-right"
                                >
                                    Total de FACTURAS:
                                </td>
                            )}
                            <td
                                colSpan={7}
                                className="p-1 text-sm font-bold text-nowrap text-right"
                            >
                                Total de BOLETAS DE VENTA:
                            </td>
                            <td
                                colSpan={1}
                                className="p-1 text-sm font-bold text-nowrap"
                            >
                                {" S/ "}
                            </td>
                            <td
                                colSpan={1}
                                className="p-1 text-sm font-bold text-nowrap text-right"
                            >
                                {filteredSalesData?.allSales?.totalSalesTickets
                                    ? Number(
                                          filteredSalesData?.allSales
                                              ?.totalSalesTickets
                                      ).toFixed(2)
                                    : "0.00"}
                            </td>
                            <td colSpan={11}></td>
                        </tr>
                        <tr>
                            {user?.isSuperuser && (
                                <td
                                    colSpan={3}
                                    className="p-1 text-sm font-bold text-nowrap text-right"
                                >
                                    Total de FACTURAS:
                                </td>
                            )}
                            <td
                                colSpan={7}
                                className="p-1 text-sm font-bold text-nowrap text-right"
                            >
                                Total de NOTAS DE CRÉDITO:
                            </td>
                            <td
                                colSpan={1}
                                className="p-1 text-sm font-bold text-nowrap"
                            >
                                {" S/ "}
                            </td>
                            <td
                                colSpan={1}
                                className="p-1 text-sm font-bold text-nowrap text-right"
                            >
                                {filteredSalesData?.allSales?.totalCreditNotes
                                    ? Number(
                                          filteredSalesData?.allSales
                                              ?.totalCreditNotes
                                      ).toFixed(2)
                                    : "0.00"}
                            </td>
                            <td colSpan={11}></td>
                        </tr>
                        {/* <tr>
                            {user?.isSuperuser && (
                                <td
                                    colSpan={2}
                                    className="p-1 text-sm font-bold text-nowrap text-right"
                                >
                                    Total de FACTURAS:
                                </td>
                            )}
                            <td
                                colSpan={5}
                                className="p-1 text-sm font-bold text-nowrap text-right"
                            >
                                Total de NOTAS DE DÉBITO:
                            </td>
                            <td
                                colSpan={1}
                                className="p-1 text-sm font-bold text-nowrap"
                            >
                                {" S/ "}
                            </td>
                            <td
                                colSpan={1}
                                className="p-1 text-sm font-bold text-nowrap text-right"
                            >
                                {filteredSalesData?.allSales?.totalDebitNotes
                                    ? Number(
                                          filteredSalesData?.allSales
                                              ?.totalDebitNotes
                                      ).toFixed(2)
                                    : "0.00"}
                            </td>
                            <td colSpan={10}></td>
                        </tr> */}
                    </tfoot>
                </table>
                <SalePagination
                    filterObj={filterObj}
                    setFilterObj={setFilterObj}
                    salesQuery={salesQuery}
                    filteredSalesData={filteredSalesData}
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

export default SaleList;
