import { useState, useEffect } from "react";
import Edit from "@/components/icons/Edit";
import { IOperation, IProduct } from "@/app/types";
import { gql, useLazyQuery } from "@apollo/client";
import { toast } from "react-toastify";
import Close from "@/components/icons/Close";
import Popover from "@/components/Popover";
import Check from "@/components/icons/Check";
import SunatCheck from "@/components/icons/SunatCheck";
import SunatCancel from "@/components/icons/SunatCancel";
import Link from "next/link";
import LoadingIcon from "@/components/icons/LoadingIcon";
import { Modal } from "flowbite";
import PdfPreviewModal from "../sales/PdfPreviewModal";

function PurchaseList({ filteredPurchasesData, user }: any) {
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
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            })
            .catch((error) =>
                console.error("Error al descargar el archivo:", error)
            );
    };

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

    const transformedPurchasesData =
        filteredPurchasesData?.allPurchases?.purchases?.map(
            (item: IOperation) => ({
                ...item,
                operationStatus: item.operationStatus.replace("A_", ""),
                documentType: item.documentType?.replace("A_", ""),
            })
        );

    return (
        <>
            <div className="w-full overflow-x-auto">
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
                            <th className="w-4 dark:border-gray-600">M</th>
                            <th className="pl-2 pr-1 w-16 dark:border-gray-600 text-right">
                                Total Onerosa
                            </th>
                            <th className="pl-1 pr-1 w-16 dark:border-gray-600 text-right">
                                Total Gratuita
                            </th>

                            <th className="pr-2 w-8 dark:border-gray-600">
                                PDF
                            </th>

                            <th className="w-8 dark:border-gray-600"></th>
                        </tr>
                    </thead>
                    <tbody className="text-[13px] [&>tr:nth-child(even)]:bg-gray-100 dark:[&>tr:nth-child(even)]:bg-gray-800">
                        {transformedPurchasesData?.map(
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
                                            <td className="p-0.5">
                                                {index + 1}
                                            </td>
                                            <td className="p-0.5">
                                                {item.subsidiary?.companyName}
                                            </td>
                                        </>
                                    )}
                                    <td className="p-0.5 pl-2 text-nowrap">
                                        {item.emitDate}
                                    </td>
                                    <td className="p-0.5 text-center">
                                        {item.documentType?.replace("A_", "")}
                                    </td>
                                    <td className="p-0.5 text-center">
                                        {item.serial}
                                    </td>
                                    <td className="p-0.5 tex-left">
                                        {item.correlative}
                                    </td>
                                    <td className="p-0.5 tex-left">
                                        {item.supplier?.documentNumber}
                                    </td>
                                    <td className="p-0.5">
                                        {item.supplier?.names}
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
                                                        className="font-medium text-green-600 dark:text-green-500 hover:underline"
                                                        target="_blank"
                                                        href="https://ww1.sunat.gob.pe/ol-ti-itconsultaunificadalibre/consultaUnificadaLibre/consulta"
                                                    >
                                                        Editar metodos de pago
                                                    </a>
                                                    <br />
                                                    <a
                                                        className="font-medium text-green-600 dark:text-green-500 hover:underline"
                                                        target="_blank"
                                                        href="https://ww1.sunat.gob.pe/ol-ti-itconsvalicpe/ConsValiCpe.htm"
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
                                                        href="https://ww1.sunat.gob.pe/ol-ti-itconsverixml/ConsVeriXml.htm"
                                                    >
                                                        Borrar
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

export default PurchaseList;
