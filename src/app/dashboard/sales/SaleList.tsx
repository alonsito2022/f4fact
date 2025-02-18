import React from "react";
import { IOperation, IProduct } from "@/app/types";
import Close from "@/components/icons/Close";
import Popover from "@/components/Popover";
import Check from "@/components/icons/Check";
import { toast } from "react-toastify";

function SaleList({
    filteredSalesData,
    setFilterObj,
    filterObj,
    modalWhatsApp,
    cpe,
    setCpe,
}: any) {
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

    const transformedSalesData = filteredSalesData?.allSales?.sales?.map(
        (item: IOperation) => ({
            ...item,
            operationStatus: item.operationStatus.replace("A_", ""),
            documentType: item.documentType?.replace("A_", ""),
            fileNameXml: `${item?.subsidiary?.company?.doc}-${item?.documentType}-${item.serial}-${item.correlative}.xml`,
            fileNameCdr: `R-${item?.subsidiary?.company?.doc}-${item?.documentType}-${item.serial}-${item.correlative}.xml`,
        })
    );
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
                </div>

                <table className="w-full border-collapse border border-gray-200 dark:border-gray-600">
                    <thead className="bg-gray-100 dark:bg-gray-700 text-xs text-left text-gray-500 uppercase dark:text-gray-400">
                        <tr>
                            {[
                                "Id",
                                "Empresa",
                                "Fecha Emisión",
                                "Tipo",
                                "Serie",
                                "Num.",
                                "Denominación",
                                "M",
                                "Total Onerosa",
                                "Total Gratuita",
                                "Pagado?",
                                "Anulado?",
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
                                    className="border border-gray-300 dark:border-gray-600 text-sm"
                                >
                                    <td className="p-2 text-nowrap">
                                        {index + 1}
                                    </td>
                                    <td className="p-2 text-nowrap">
                                        {item.subsidiary.companyName}
                                    </td>
                                    <td className="p-2 text-nowrap">
                                        {item.emitDate}
                                    </td>
                                    <td className="p-2">{item.documentType}</td>
                                    <td className="p-2">{item.serial}</td>
                                    <td className="p-2">{item.correlative}</td>
                                    <td className="p-2">
                                        {item.client?.names}
                                    </td>
                                    <td className="p-2">
                                        {item.currencyType === "PEN"
                                            ? "S/"
                                            : item.currencyType}
                                    </td>
                                    <td className="p-2 text-right">
                                        {Number(item.totalToPay).toFixed(2)}
                                    </td>
                                    <td className="p-2 text-right">
                                        {Number(item.totalFree).toFixed(2)}
                                    </td>

                                    <td className="p-2">
                                        {Number(item.totalPayed) > 0
                                            ? "SI"
                                            : "X"}
                                    </td>
                                    <td className="p-2">
                                        {item.operationStatus === "06"
                                            ? "SI"
                                            : "NO"}
                                    </td>
                                    <td className="p-2">
                                        {item.sendClient ? "SI" : "X"}
                                    </td>
                                    <td className="p-2 text-center">
                                        <a
                                            href={
                                                process.env
                                                    .NEXT_PUBLIC_BASE_API +
                                                "/operations/print_invoice/" +
                                                item.id +
                                                "/"
                                            }
                                            className="hover:underline"
                                            target="_blank"
                                        >
                                            <span className="bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
                                                PDF
                                            </span>
                                        </a>
                                    </td>
                                    <td className="p-2 text-center">
                                        <a
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                const url =
                                                    item.operationStatus ===
                                                    "02"
                                                        ? item.linkXml
                                                        : item.linkXmlLow;
                                                handleDownload(
                                                    url,
                                                    item?.fileNameXml
                                                );
                                            }}
                                            className="hover:underline"
                                        >
                                            <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300 text-nowrap">
                                                {item.operationStatus === "02"
                                                    ? "XML"
                                                    : item.operationStatus ===
                                                      "06"
                                                    ? item.linkXmlLow
                                                        ? "XML"
                                                        : "SIN XML"
                                                    : "#"}
                                            </span>
                                        </a>
                                    </td>
                                    <td className="p-2 text-center">
                                        <a
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                const url =
                                                    item.operationStatus ===
                                                    "02"
                                                        ? item.linkCdr
                                                        : item.linkCdrLow;
                                                handleDownload(
                                                    url,
                                                    item?.fileNameCdr
                                                );
                                            }}
                                            className="hover:underline"
                                        >
                                            {item.operationStatus === "02" ? (
                                                <>
                                                    {item?.documentType ===
                                                    "01" ? (
                                                        <span className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
                                                            CDR
                                                        </span>
                                                    ) : item?.documentType ===
                                                      "03" ? (
                                                        <span className="bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-gray-900 dark:text-gray-300">
                                                            CDR
                                                        </span>
                                                    ) : (
                                                        "-"
                                                    )}
                                                </>
                                            ) : item.operationStatus ===
                                              "06" ? (
                                                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300 text-nowrap">
                                                    {item.linkCdrLow
                                                        ? "CDR"
                                                        : "SIN CDR"}
                                                </span>
                                            ) : (
                                                ""
                                            )}
                                        </a>
                                    </td>
                                    <td className="p-2 text-center">
                                        <>
                                            <span
                                                data-popover-target={
                                                    "popover-status-" + item.id
                                                }
                                                className={
                                                    item.operationStatus ===
                                                    "02"
                                                        ? "bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300"
                                                        : item.operationStatus ===
                                                          "06"
                                                        ? "bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300 text-nowrap"
                                                        : ""
                                                }
                                            >
                                                {item.operationStatus ===
                                                "02" ? (
                                                    <>
                                                        {item?.documentType ===
                                                        "01" ? (
                                                            <>
                                                                <svg
                                                                    className="inline-block w-4 h-4 "
                                                                    stroke="currentColor"
                                                                    fill="currentColor"
                                                                    strokeWidth="0"
                                                                    viewBox="0 0 512 512"
                                                                    height="1em"
                                                                    width="1em"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                >
                                                                    <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"></path>
                                                                </svg>{" "}
                                                                0
                                                            </>
                                                        ) : item?.documentType ===
                                                          "03" ? (
                                                            <>
                                                                <svg
                                                                    className="inline-block w-4 h-4 "
                                                                    stroke="currentColor"
                                                                    fill="currentColor"
                                                                    strokeWidth="0"
                                                                    viewBox="0 0 512 512"
                                                                    height="1em"
                                                                    width="1em"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                >
                                                                    <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"></path>
                                                                </svg>
                                                            </>
                                                        ) : (
                                                            "-"
                                                        )}
                                                    </>
                                                ) : item.operationStatus ===
                                                  "06" ? (
                                                    <>
                                                        {
                                                            item.operationStatusReadable
                                                        }
                                                    </>
                                                ) : (
                                                    ""
                                                )}
                                            </span>
                                            <Popover
                                                id={"popover-status-" + item.id}
                                            >
                                                {item.operationStatus ===
                                                "02" ? (
                                                    <p>
                                                        {item.sunatDescription}
                                                    </p>
                                                ) : item.operationStatus ===
                                                  "06" ? (
                                                    <p>
                                                        {item.sunatDescriptionLow
                                                            ? item.sunatDescriptionLow
                                                            : "No tiene descripción"}
                                                    </p>
                                                ) : (
                                                    <p>Sin información</p>
                                                )}
                                            </Popover>
                                        </>
                                    </td>
                                    <td className="p-2">
                                        <>
                                            <span
                                                data-popover-target={
                                                    "popover-options-" + item.id
                                                }
                                                className={
                                                    "font-medium text-blue-600 dark:text-blue-500 hover:underline"
                                                }
                                            >
                                                Opciones
                                            </span>
                                            <Popover
                                                id={
                                                    "popover-options-" + item.id
                                                }
                                            >
                                                <a
                                                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                                                    href="#"
                                                    onClick={() => {
                                                        modalWhatsApp.show();
                                                        setCpe({
                                                            ...cpe,
                                                            id: Number(item.id),
                                                            documentTypeDisplay:
                                                                item.documentType ===
                                                                "01"
                                                                    ? "FACTURA"
                                                                    : item.documentType ===
                                                                      "03"
                                                                    ? "BOLETA"
                                                                    : "NA",
                                                            serial: item.serial,
                                                            correlative:
                                                                item.correlative,
                                                            clientName:
                                                                item.client
                                                                    ?.names,
                                                            clientDoc:
                                                                item.client
                                                                    ?.documentNumber,
                                                        });
                                                    }}
                                                >
                                                    Enviar por WhatsApp
                                                </a>
                                                <br />
                                                <a
                                                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                                                    target="_blank"
                                                    href="#"
                                                >
                                                    Generar NOTA DE DÉBITO
                                                </a>
                                                <br />
                                                <a
                                                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                                                    target="_blank"
                                                    href="#"
                                                >
                                                    Generar GUIA DE REMISIÓN
                                                    REMITENTE
                                                </a>
                                                <br />
                                                <a
                                                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                                                    target="_blank"
                                                    href="#"
                                                >
                                                    Generar GUIA DE REMISIÓN
                                                    TRANSPORTISTA
                                                </a>
                                                <br />
                                                <a
                                                    className="font-medium text-red-600 dark:text-red-500 hover:underline"
                                                    target="_blank"
                                                    href="#"
                                                >
                                                    ANULAR o COMUNICAR DE BAJA
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
                                                    Verificar XML en la SUNAT
                                                </a>
                                            </Popover>
                                        </>
                                    </td>
                                </tr>
                            )
                        )}
                    </tbody>
                    <tfoot>
                        <tr>
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
                            <td colSpan={9}></td>
                        </tr>
                        <tr>
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
                            <td colSpan={9}></td>
                        </tr>
                        <tr>
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
                            <td colSpan={9}></td>
                        </tr>
                        <tr>
                            <td
                                colSpan={7}
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
                            <td colSpan={9}></td>
                        </tr>
                    </tfoot>
                </table>
                <div className="flex flex-row items-center my-4 gap-4 pl-3">
                    <button
                        className="btn-blue-xs"
                        disabled={filterObj.page === 1}
                        onClick={() =>
                            setFilterObj({
                                ...filterObj,
                                page: filterObj.page - 1,
                            })
                        }
                    >
                        Prev
                    </button>
                    <span className="text-sm">Página {filterObj.page}</span>
                    <button
                        className="btn-blue-xs"
                        onClick={() =>
                            setFilterObj({
                                ...filterObj,
                                page: filterObj.page + 1,
                            })
                        }
                    >
                        Next
                    </button>
                </div>
            </div>
        </>
    );
}

export default SaleList;
