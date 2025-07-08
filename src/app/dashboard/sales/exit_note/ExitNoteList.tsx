import { IOperation } from "@/app/types";
import { gql, useMutation } from "@apollo/client";
import { Modal } from "flowbite";
import React, { useState } from "react";
import { toast } from "react-toastify";
import SalePagination from "../SalePagination";
import Link from "next/link";
import Popover from "@/components/Popover";
import PdfPreviewModal from "../PdfPreviewModal";
const CANCEL_INVOICE = gql`
  mutation CancelInvoice($operationId: Int!, $lowDate: Date!) {
    cancelInvoice(operationId: $operationId, lowDate: $lowDate) {
      message
      success
    }
  }
`;
function ExitNoteList({
  filteredExitNotesData,
  setFilterObj,
  filterObj,
  modalWhatsApp,
  cpe,
  setCpe,
  exitNotesQuery,
  user,
}: any) {
  const [pdfModal, setPdfModal] = useState<Modal | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [cancelInvoice] = useMutation(CANCEL_INVOICE);

  const transformedSalesData = filteredExitNotesData?.allExitNotes?.notes?.map(
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
            docType === "1" ? "DNI" : docType === "6" ? "RUC" : docType,
        },
        fileNameXml: `${item?.subsidiary?.company?.doc}-${item?.documentType}-${item.serial}-${item.correlative}.xml`,
        fileNameCdr: `R-${item?.subsidiary?.company?.doc}-${item?.documentType}-${item.serial}-${item.correlative}.xml`,
      };
    }
  );
  const handleWhatsAppClick = (item: IOperation) => {
    modalWhatsApp.show();
    setCpe({
      ...cpe,
      id: Number(item.id),
      documentTypeDisplay: item.documentType === "48" ? "COTIZACION" : "NA",
      serial: item.serial,
      correlative: item.correlative,
      clientName: item.client?.names,
      clientDoc: item.client?.documentNumber,
    });
  };
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
          toast.success("Nota de salida borrada correctamente.");
          exitNotesQuery({
            variables: {
              subsidiaryId: user?.isSuperuser
                ? Number(filterObj.subsidiaryId)
                : Number(user?.subsidiaryId),
              startDate: filterObj.startDate,
              endDate: filterObj.endDate,
              documentType: filterObj.documentType,
              page: Number(filterObj.page),
              pageSize: Number(filterObj.pageSize),
            },
          });
        } else {
          toast.error(`Error: ${response.data.cancelInvoice.message}`);
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
                filteredExitNotesData?.allExitNotes?.totalNumberOfPages
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
                filteredExitNotesData?.allExitNotes?.totalNumberOfNotes
              }
              className="form-control-sm w-16 text-center"
            />
          </div>
          <SalePagination
            filterObj={filterObj}
            setFilterObj={setFilterObj}
            exitNotesQuery={exitNotesQuery}
            exitNotesData={filteredExitNotesData}
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
                "Serie",
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
            {transformedSalesData?.map((item: IOperation, index: number) => (
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
                    <td className="p-2 text-nowrap">{index + 1}</td>
                  </>
                )}

                <td className="p-2 text-nowrap">{item.emitDate}</td>
                <td className="p-0.5 text-center">{item.serial}</td>
                <td className="p-0.5 text-left">{item.correlative}</td>
                <td className="p-2">{item.client?.documentNumber}</td>
                <td className="p-2">{item.client?.names}</td>
                <td className="p-2">
                  {item.currencyType === "PEN" ? "S/" : item.currencyType}
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
                  {item.documentType === "NS" &&
                    (item.operationStatus === "02" ||
                      item.operationStatus === "06") && (
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPdfUrl(
                            `${process.env.NEXT_PUBLIC_BASE_API}/operations/print_exit_note/${item.id}/`
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
                        data-popover-target={"popover-options-" + item.id}
                        className={
                          "font-medium text-blue-600 dark:text-blue-500 hover:underline cursor-pointer"
                        }
                      >
                        Opciones
                      </span>
                      <Popover id={"popover-options-" + item.id}>
                        <a
                          className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                          href="#"
                          onClick={() => handleWhatsAppClick(item)}
                        >
                          Enviar por WhatsApp
                        </a>
                        <br />
                        <Link
                          className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                          href={`/dashboard/quotes/convert/${item.id}`}
                        >
                          CONVERTIR EN COMPROBANTE
                        </Link>

                        <br />

                        <a
                          className="font-medium text-red-600 dark:text-red-500 hover:underline"
                          href="#"
                          onClick={(e) => {
                            e.preventDefault(); // Evita que el enlace cambie de página
                            const confirmDelete = window.confirm(
                              "¿Estás seguro de que deseas borrar esta nota de salida? Esta acción no se puede deshacer."
                            );

                            if (confirmDelete) {
                              handleCancelInvoice(Number(item?.id));
                            }
                          }}
                        >
                          Borrar
                        </a>
                      </Popover>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <SalePagination
          filterObj={filterObj}
          setFilterObj={setFilterObj}
          exitNotesQuery={exitNotesQuery}
          exitNotesData={filteredExitNotesData}
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

export default ExitNoteList;
