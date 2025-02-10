import React from "react";
import { IOperation, IProduct } from "@/app/types";
import Close from "@/components/icons/Close";
import Popover from "@/components/Popover";
import Check from "@/components/icons/Check";

function SaleList({ filteredSalesData, setFilterObj, filterObj }: any) {
    const handleDownload = (url: string, filename: string) => {
        fetch(url)
            .then((response) => response.blob())
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
                        {filteredSalesData?.allSales?.sales?.map(
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
                                    <td className="p-2">
                                        {item.documentType?.replace("A_", "")}
                                    </td>
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
                                        {item.operationStatus.replace(
                                            "A_",
                                            ""
                                        ) === "06"
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
                                            href={
                                                item.operationStatus.replace(
                                                    "A_",
                                                    ""
                                                ) === "02"
                                                    ? item.linkXml
                                                    : item.linkXmlLow
                                            }
                                            className="hover:underline"
                                            target="_blank"
                                            download
                                        >
                                            <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
                                                XML
                                            </span>
                                        </a>
                                    </td>
                                    <td className="p-2 text-center">
                                        <a
                                            href={
                                                item.operationStatus.replace(
                                                    "A_",
                                                    ""
                                                ) === "02"
                                                    ? item.linkCdr
                                                    : item.operationStatus.replace(
                                                          "A_",
                                                          ""
                                                      ) === "06"
                                                    ? item.linkCdrLow
                                                    : "#"
                                            }
                                            className="hover:underline"
                                            target="_blank"
                                            download
                                        >
                                            {item.operationStatus.replace(
                                                "A_",
                                                ""
                                            ) === "03" ? (
                                                <div
                                                    role="status"
                                                    className="flex justify-center"
                                                    title="Cuando es una Boleta de Venta o Nota asociada el CDR es el del resumen de ese documento."
                                                >
                                                    <svg
                                                        aria-hidden="true"
                                                        className="w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                                                        viewBox="0 0 100 101"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path
                                                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                                            fill="currentColor"
                                                        />
                                                        <path
                                                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                                            fill="currentFill"
                                                        />
                                                    </svg>
                                                    <span className="sr-only">
                                                        loading...
                                                    </span>
                                                </div>
                                            ) : item.operationStatus.replace(
                                                  "A_",
                                                  ""
                                              ) === "02" ? (
                                                <span className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
                                                    CDR
                                                </span>
                                            ) : item.operationStatus.replace(
                                                  "A_",
                                                  ""
                                              ) === "06" ? (
                                                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300">
                                                    CDR
                                                </span>
                                            ) : (
                                                ""
                                            )}
                                        </a>
                                    </td>
                                    <td className="p-2 text-center">
                                        {item.operationStatus.replace(
                                            "A_",
                                            ""
                                        ) === "02" ? (
                                            <>
                                                <span
                                                    title={
                                                        item.operationStatus.replace(
                                                            "A_",
                                                            ""
                                                        ) === "02"
                                                            ? item.sunatDescription
                                                            : item.operationStatus.replace(
                                                                  "A_",
                                                                  ""
                                                              ) === "06"
                                                            ? item.sunatDescriptionLow
                                                            : ""
                                                    }
                                                    className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1.5 rounded-full dark:bg-green-900 dark:text-green-300"
                                                >
                                                    <span className="inline-block w-4 h-4 align-middle mr-1">
                                                        OK
                                                    </span>
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
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    data-popover-target={
                                                        "popover-company-" +
                                                        item.id
                                                    }
                                                    type="button"
                                                    className="btn-blue-xs"
                                                >
                                                    {
                                                        item.operationStatusReadable
                                                    }
                                                </button>
                                                <Popover
                                                    id={item.id}
                                                    description={
                                                        item.operationStatus.replace(
                                                            "A_",
                                                            ""
                                                        ) === "02"
                                                            ? item.sunatDescription
                                                            : item.operationStatus.replace(
                                                                  "A_",
                                                                  ""
                                                              ) === "06"
                                                            ? item.sunatDescriptionLow
                                                            : item.operationStatus.replace(
                                                                  "A_",
                                                                  ""
                                                              ) === "03"
                                                            ? "Pendiente de generación<br>Nosotros generamos y enviamos AUTOMÁTICAMENTE AL DÍA SIGUIENTE o a más tardar hasta el SÉTIMO DÍA CALENDARIO a la SUNAT o al OSE el Resumen Diario de las Boletas de Venta Electrónicas, las Notas de Crédito y Débito Electrónicas relacionadas. "
                                                            : ""
                                                    }
                                                />
                                            </>
                                        )}
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
                            <td colSpan={8}></td>
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
                            <td colSpan={8}></td>
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
                            <td colSpan={8}></td>
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
                            <td colSpan={8}></td>
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
