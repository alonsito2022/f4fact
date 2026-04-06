import { IOperation } from "@/app/types";
import SunatCancel from "@/components/icons/SunatCancel";
import SunatCheck from "@/components/icons/SunatCheck";
import Popover from "@/components/Popover";
import { Modal } from "flowbite";
import React, { useState } from "react";
import { toast } from "react-toastify";
import PdfPreviewModal from "../sales/PdfPreviewModal";

function RetentionList({
  setFilterObj,
  filterObj,
  retentionsQuery,
  retentionsData,
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
      .catch((error) => console.error("Error al descargar el archivo:", error));
  };
  const transformedSalesData = retentionsData?.allRetentions?.retentions?.map(
    (item: IOperation) => ({
      ...item,
      operationStatus: item.operationStatus.replace("A_", ""),
      documentType: item.documentType?.replace("A_", ""),
      fileNameXml: `${item?.subsidiary?.company?.doc}-${item?.documentType}-${item.serial}-${item.correlative}.xml`,
      fileNameCdr: `R-${item?.subsidiary?.company?.doc}-${item?.documentType}-${item.serial}-${item.correlative}.xml`,
    }),
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

  const getPopoverContent = (item: IOperation) => {
    if (item.operationStatus === "02") return <p>{item.sunatDescription}</p>;
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
              defaultValue={retentionsData?.allRetentions?.totalNumberOfPages}
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
              defaultValue={retentionsData?.allRetentions?.totalNumberOfSales}
              className="form-control-sm w-16 text-center"
            />
          </div>
        </div>

        <table className="w-full border-collapse border border-gray-100 dark:border-gray-600 text-12">
          <thead className="bg-gray-100 dark:bg-gray-700 text-black-500 uppercase dark:text-gray-400">
            <tr>
              {user?.isSuperuser && (
                <th className="w-4 dark:border-gray-600">Id</th>
              )}
              <th className="pl-2 w-8 dark:border-gray-600 text-left">
                Fecha Emisión
              </th>
              <th className="w-4 dark:border-gray-600">Tipo</th>
              <th className="pl-2 pr-2 w-8 dark:border-gray-600">Serie</th>
              <th className="pr-2 w-8 dark:border-gray-600 text-left">Num.</th>
              <th className="w-80 dark:border-gray-600">ENTIDAD</th>
              <th className="w-16 dark:border-gray-600">
                Enviado <br />
                al
                <br /> Cliente
              </th>
              <th className="pr-2 w-8 dark:border-gray-600">PDF</th>
              <th className="pr-2 w-8 dark:border-gray-600">XML</th>
              <th className="pr-2 w-8 dark:border-gray-600">CDR</th>
              <th className="w-8 text-center dark:border-gray-600">
                Estado <br />
                en la
                <br />
                SUNAT
              </th>
            </tr>
          </thead>
          <tbody className="text-[13px] [&>tr:nth-child(even)]:bg-gray-100 dark:[&>tr:nth-child(even)]:bg-gray-800">
            {transformedSalesData?.map((item: IOperation, index: number) => (
              <tr
                key={item.id}
                className={`border border-gray-100 dark:border-gray-600 ${
                  item.operationStatus === "06"
                    ? "line-through text-red-600 dark:text-red-400"
                    : ""
                }`}
              >
                {user?.isSuperuser && (
                  <td className="p-0.5 font-bold text-blue-600 dark:text-blue-500">
                    {index + 1}
                  </td>
                )}

                <td className="p-0.5 pl-2 text-nowrap">{item.emitDate}</td>
                <td className="p-0.5 text-center">{item.documentType}</td>
                <td className="p-0.5 text-center">{item.serial}</td>
                <td className="p-0.5 text-left">{item.correlative}</td>
                <td className="p-0.5">{item.subsidiary?.companyName}</td>

                <td className="p-0.5 text-center">
                  {item.sendWhatsapp ? (
                    "SI"
                  ) : (
                    <span className="text-red-800 font-black">x</span>
                  )}
                </td>
                <td className="p-0.5 text-center">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPdfUrl(
                        process.env.NEXT_PUBLIC_BASE_API +
                          "/operations/print_retention/" +
                          item.id +
                          "/"
                      );
                      pdfModal?.show();
                    }}
                    className="hover:underline"
                  >
                    <span className="bg-red-600 text-white text-[11px] font-semibold me-2 px-1.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
                      PDF
                    </span>
                  </a>
                </td>
                <td className="p-0.5 text-center">
                  {(() => {
                    const hasXml =
                      (item.operationStatus === "02" && item.linkXml) ||
                      (item.operationStatus === "06" && item.linkXmlLow);

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
                          handleDownload(xmlUrl, item?.fileNameXml);
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
                      (item.operationStatus === "02" && item.linkCdr) ||
                      (item.operationStatus === "06" && item.linkCdrLow);

                    if (!hasCdr) return null;

                    const cdrUrl =
                      item.operationStatus === "02"
                        ? item.linkCdr
                        : item.linkCdrLow;

                    const getCdrStyle = () => {
                      if (item.operationStatus === "02") {
                        return item.documentType === "01"
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
                          handleDownload(cdrUrl, item?.fileNameCdr);
                        }}
                        className="hover:underline"
                      >
                        <span
                          className={`text-white text-[11px] font-semibold me-2 px-1.5 py-0.5 rounded-full text-nowrap ${getCdrStyle()}`}
                        >
                          CDR
                        </span>
                      </a>
                    );
                  })()}
                </td>
                <td className="p-0.5 text-center">
                  <>
                    <span
                      data-popover-target={`popover-status-${item.id}`}
                      className={getStatusClassName(item.operationStatus)}
                    >
                      {item.operationStatus === "02" ? (
                        <>
                          {item?.documentType === "01" ? (
                            <>
                              <SunatCheck /> 0
                            </>
                          ) : item?.documentType === "03" ? (
                            <>
                              <SunatCheck />
                            </>
                          ) : (
                            "-"
                          )}
                        </>
                      ) : item.operationStatus === "06" ? (
                        <>
                          <SunatCancel />
                        </>
                      ) : (
                        ""
                      )}
                    </span>
                    <Popover id={`popover-status-${item.id}`}>
                      {getPopoverContent(item)}
                    </Popover>
                  </>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex flex-row items-center my-4 gap-4 pl-3">
          <button
            className="btn-blue-xs"
            disabled={filterObj.page === 1}
            onClick={() => {
              setFilterObj({
                ...filterObj,
                page: filterObj.page - 1,
              });
              // Llama a salesQuery con los nuevos parámetros
              retentionsQuery({
                variables: {
                  subsidiaryId: Number(user?.subsidiaryId),
                  startDate: filterObj.startDate,
                  endDate: filterObj.endDate,
                  documentType: filterObj.documentType,
                  page: filterObj.page - 1,
                  pageSize: Number(filterObj.pageSize),
                },
              });
            }}
          >
            Prev
          </button>
          <span className="text-sm">Página {filterObj.page}</span>
          <button
            className="btn-blue-xs"
            onClick={() => {
              setFilterObj({
                ...filterObj,
                page: filterObj.page + 1,
              });
              retentionsQuery({
                variables: {
                  subsidiaryId: Number(user?.subsidiaryId),
                  startDate: filterObj.startDate,
                  endDate: filterObj.endDate,
                  documentType: filterObj.documentType,
                  page: filterObj.page + 1,
                  pageSize: Number(filterObj.pageSize),
                },
              });
            }}
            style={{
              display:
                filterObj.page ===
                retentionsData?.allRetentions?.totalNumberOfPages
                  ? "none"
                  : "inline-block",
            }}
          >
            Next
          </button>
        </div>
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

export default RetentionList;
