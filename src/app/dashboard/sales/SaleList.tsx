import React, {
    memo,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { IOperation } from "@/app/types";
import { toast } from "react-toastify";
import { gql, useMutation } from "@apollo/client";
import SunatCheck from "@/components/icons/SunatCheck";
import SunatCancel from "@/components/icons/SunatCancel";
import Link from "next/link";
import SalePagination from "./SalePagination";
import LoadingIcon from "@/components/icons/LoadingIcon";
import { Modal } from "flowbite";
import PdfPreviewModal from "./PdfPreviewModal";
import { downloadCpeFile } from "@/lib/downloadCpeFile";
const limaTodayDate = new Date(
  new Date().toLocaleString("en-US", { timeZone: "America/Lima" }),
);
const today =
  limaTodayDate.getFullYear() +
  "-" +
  String(limaTodayDate.getMonth() + 1).padStart(2, "0") +
  "-" +
  String(limaTodayDate.getDate()).padStart(2, "0");

const CANCEL_INVOICE = gql`
  mutation CancelInvoice($operationId: Int!, $lowDate: Date!) {
    cancelInvoice(operationId: $operationId, lowDate: $lowDate) {
      message
      success
    }
  }
`;

const normalizeDate = (date: string) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
};

const canCancelInvoice = (
    emitDate: string,
    documentType: string,
): { allowed: boolean; message: string } => {
    const limaDate = new Date(
        new Date().toLocaleString("en-US", { timeZone: "America/Lima" }),
    );
    limaDate.setHours(0, 0, 0, 0);

    const emitDateObj = normalizeDate(emitDate);

    if (emitDateObj > limaDate) {
        return {
            allowed: false,
            message: "No se puede anular un comprobante con fecha futura.",
        };
    }

    if (documentType === "03") {
        const minDate = new Date(limaDate);
        minDate.setDate(limaDate.getDate() - 5);

        if (emitDateObj.getTime() === limaDate.getTime()) {
            return {
                allowed: false,
                message:
                    "No se puede anular una boleta emitida el día de hoy (sin contar el día presente). Intente nuevamente mañana.",
            };
        }
        if (emitDateObj < minDate) {
            return {
                allowed: false,
                message:
                    "Las boletas solo pueden ser anuladas hasta 5 días después de su emisión (sin contar el día presente). Esta boleta excede el plazo máximo permitido por la SUNAT.",
            };
        }
    } else if (documentType === "01") {
        const minDate = new Date(limaDate);
        minDate.setDate(limaDate.getDate() - 3);

        if (emitDateObj.getTime() === limaDate.getTime()) {
            return {
                allowed: false,
                message:
                    "No se puede anular una factura emitida el día de hoy (sin contar el día presente). Intente nuevamente mañana.",
            };
        }
        if (emitDateObj < minDate) {
            return {
                allowed: false,
                message:
                    "Las facturas solo pueden ser anuladas hasta 3 días después de su emisión (sin contar el día presente). Esta factura excede el plazo máximo permitido por la SUNAT.",
            };
        }
    }

    return { allowed: true, message: "" };
};

const getStatusClassName = (status: string) => {
    const baseClasses = "flex items-center justify-center";
    if (status === "02") {
        return `${baseClasses} text-green-600 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300`;
    }
    if (status === "06") {
        return `${baseClasses} bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300 text-nowrap`;
    }
    if (status === "07") {
        return `${baseClasses} text-red-600 text-xs font-medium px-2.5 py-0.5 rounded-full dark:text-red-400`;
    }
    return `${baseClasses} text-gray-400`;
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
    if (status === "07") return <LoadingIcon className="text-red-600" />;
    return "";
};

const getStatusMessage = (item: IOperation) => {
    if (item.operationStatus === "02") return item.sunatDescription || "";
    if (item.operationStatus === "06") {
        return (
            item.sunatDescriptionLow ||
            "Los documentos no aceptados por la SUNAT se consideran como documentos ANULADOS para efectos tributarios en la mayoría de casos."
        );
    }
    if (item.sunatDescription) return item.sunatDescription;
    if (item.operationStatus === "07") {
        return "El comprobante ya esta informado y se encuentra con estado anulado o rechazado.";
    }
    return "Sin información";
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
  const [pdfFileName, setPdfFileName] = useState<string>("");
  const handleDownload = downloadCpeFile;
  const [cancelInvoice, { loading, error, data }] = useMutation(CANCEL_INVOICE);

  // Referencia al filtro actual: permite mantener estables los handlers de las
  // filas para que las filas memoizadas no se repinten al cambiar el filtro.
  const filterRef = useRef(filterObj);
  useEffect(() => {
    filterRef.current = filterObj;
  }, [filterObj]);

  const handleCancelInvoice = useCallback(
    (
      operationId: number,
      emitDate: string,
      documentType: string,
    ) => {
      const validation = canCancelInvoice(emitDate, documentType);
      if (!validation.allowed) {
        toast.error(validation.message);
        return;
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
            const currentFilter = filterRef.current;
            salesQuery({
              variables: {
                subsidiaryId: Number(user?.subsidiaryId),
                clientId: Number(currentFilter.clientId),
                startDate: currentFilter.startDate,
                endDate: currentFilter.endDate,
                documentType: currentFilter.documentType,
                page: Number(currentFilter.page),
                pageSize: Number(currentFilter.pageSize),
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
    },
    [cancelInvoice, salesQuery, user],
  );

  const transformedSalesData = useMemo(
    () =>
      filteredSalesData?.allSales?.sales?.map((item: IOperation) => ({
        ...item,
        operationStatus: item.operationStatus.replace("A_", ""),
        documentType: item.documentType?.replace("A_", ""),
        fileNameXml: `${item?.subsidiary?.company?.doc}-${item?.documentType}-${item.serial}-${item.correlative}.xml`,
        fileNameCdr: `R-${item?.subsidiary?.company?.doc}-${item?.documentType}-${item.serial}-${item.correlative}.xml`,
      })),
    [filteredSalesData],
  );

  const handleWhatsAppClick = useCallback(
    (item: IOperation) => {
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
    },
    [modalWhatsApp, cpe, setCpe],
  );

  const openPdf = useCallback(
    (item: IOperation) => {
      setPdfUrl(
        `${process.env.NEXT_PUBLIC_BASE_API}/operations/${
          item.documentType === "07" ? "print_credit_note" : "print_invoice"
        }/${item.id}/`,
      );
      setPdfFileName(
        `${item?.subsidiary?.company?.doc}-${item.documentType}-${item.serial}-${item.correlative}.pdf`,
      );
      pdfModal?.show();
    },
    [pdfModal],
  );

  const downloadXml = useCallback(
    (item: IOperation) => {
      const useDriveXml =
        item.operationStatus === "02" && Boolean(item.driveFirmaId);
      const xmlUrl =
        item.operationStatus === "02" ? item.linkXml : item.linkXmlLow;
      handleDownload(
        xmlUrl,
        item?.fileNameXml,
        useDriveXml ? "firma" : undefined,
        useDriveXml ? item.id : undefined,
      );
    },
    [handleDownload],
  );

  const downloadCdr = useCallback(
    (item: IOperation) => {
      const useDriveCdr =
        item.operationStatus === "02" && Boolean(item.driveCdrId);
      const cdrUrl =
        item.operationStatus === "02" ? item.linkCdr : item.linkCdrLow;
      handleDownload(
        cdrUrl,
        item?.fileNameCdr,
        useDriveCdr ? "cdr" : undefined,
        useDriveCdr ? item.id : undefined,
      );
    },
    [handleDownload],
  );

  const confirmCancel = useCallback(
    (item: IOperation) => {
      const validation = canCancelInvoice(item.emitDate, item.documentType);
      if (!validation.allowed) {
        toast.error(validation.message);
        return;
      }
      const confirmDelete = window.confirm(
        "¿Estás seguro de que deseas anular esta factura? Esta acción no se puede deshacer.",
      );
      if (confirmDelete) {
        handleCancelInvoice(
          Number(item?.id),
          item.emitDate,
          item.documentType,
        );
      }
    },
    [handleCancelInvoice],
  );

  const hasCreditNote = useMemo(
    () =>
      transformedSalesData?.some(
        (item: IOperation) => item?.creditNoteReferences?.length > 0,
      ),
    [transformedSalesData],
  );

  // Las filas solo se repintan si cambian los datos o el usuario: escribir en
  // los filtros ya no obliga a reconstruir las 25 filas de la tabla.
  const rows = useMemo(
    () =>
      transformedSalesData?.map((item: IOperation, index: number) => (
        <SaleRow
          key={item.id}
          item={item}
          index={index}
          isSuperuser={Boolean(user?.isSuperuser)}
          showUserColumn={Boolean(
            user?.isSuperuser || user?.companyShowUser,
          )}
          hasCreditNote={Boolean(hasCreditNote)}
          onPdf={openPdf}
          onXml={downloadXml}
          onCdr={downloadCdr}
          onWhatsApp={handleWhatsAppClick}
          onCancel={confirmCancel}
        />
      )),
    [
      transformedSalesData,
      user?.isSuperuser,
      user?.companyShowUser,
      hasCreditNote,
      openPdf,
      downloadXml,
      downloadCdr,
      handleWhatsAppClick,
      confirmCancel,
    ],
  );

  if (!transformedSalesData || transformedSalesData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="w-20 h-20 mb-6 rounded-full bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-gray-300 dark:text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.2}
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
          No se encontraron comprobantes
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
          No hay registros que coincidan con los filtros de búsqueda aplicados.
          Intente ajustar las fechas o los criterios de filtrado.
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Verifique que las fechas y la sede sean correctas</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full overflow-x-auto">
        <SalePagination
          filterObj={filterObj}
          setFilterObj={setFilterObj}
          salesQuery={salesQuery}
          filteredSalesData={filteredSalesData}
          compact
        />
        <table className="w-full border-collapse border border-gray-100 dark:border-gray-600 text-12">
          <thead className="bg-gray-100 dark:bg-gray-700 text-black-500 uppercase dark:text-gray-400">
            <tr>
              {user?.isSuperuser && (
                <>
                  <th className="w-4 dark:border-gray-600">Id</th>
                  <th className="w-80 dark:border-gray-600">Empresa</th>
                  <th className="w-4 dark:border-gray-600">Hora</th>
                </>
              )}
              <th className="pl-2 w-8 dark:border-gray-600 text-left">Fecha</th>
              <th className="w-4 dark:border-gray-600">Tipo</th>
              <th className="pl-2 pr-2 w-8 dark:border-gray-600">Serie</th>
              <th className="pr-2 w-8 dark:border-gray-600 text-left">Num.</th>
              <th className="w-8 dark:border-gray-600 text-left">
                RUC / DNI / <br />
                ETC
              </th>
              <th className="w-80 dark:border-gray-600">Denominación</th>
              <th className="w-4 dark:border-gray-600">M</th>

              <th className="pl-2 pr-1 w-16 dark:border-gray-600 text-right">
                Total Onerosa
              </th>
              <th className="pl-1 pr-1 w-16 dark:border-gray-600 text-right">
                Total Gratuita
              </th>
              <th className="pl-2 w-8 dark:border-gray-600">Pagado?</th>
              <th className="w-8 dark:border-gray-600">Anulado?</th>
              {hasCreditNote && (
                <th className="w-16 dark:border-gray-600">Nota de Crédito</th>
              )}
              <th className="w-16 dark:border-gray-600">
                Enviado <br />
                al
                <br /> Cliente
              </th>
              <th className="pr-2 w-8 dark:border-gray-600">PDF</th>
              <th className="pr-2 w-8 dark:border-gray-600">VER</th>
              <th className="pr-2 w-8 dark:border-gray-600">XML</th>
              <th className="pr-2 w-8 dark:border-gray-600">CDR</th>
              <th className="w-8 text-center dark:border-gray-600">
                Estado <br />
                en la
                <br />
                SUNAT
              </th>
              {(user?.isSuperuser ||
                (!user?.isSuperuser && user?.companyShowUser)) && (
                <th className="w-4 dark:border-gray-600">Usuario</th>
              )}
              <th className="w-8 dark:border-gray-600"></th>
            </tr>
          </thead>
          <tbody className="text-[13px] [&>tr:nth-child(even)]:bg-gray-100 dark:[&>tr:nth-child(even)]:bg-gray-800">
            {rows}
          </tbody>
          <tfoot>
            <tr>
              {user?.isSuperuser && (
                <td
                  colSpan={3}
                  className="p-1 text-sm font-bold text-nowrap text-right"
                ></td>
              )}
              <td
                colSpan={7}
                className="p-1 text-sm font-bold text-nowrap text-right"
              >
                Total de FACTURAS:
              </td>
              <td colSpan={1} className="p-1 text-sm font-bold text-nowrap">
                {" S/ "}
              </td>
              <td
                colSpan={1}
                className="p-1 text-sm font-bold text-nowrap text-right"
              >
                {filteredSalesData?.allSales?.totalInvoices
                  ? Number(filteredSalesData?.allSales?.totalInvoices).toFixed(
                      2,
                    )
                  : "0.00"}
              </td>
              <td colSpan={11}></td>
            </tr>
            <tr>
              {user?.isSuperuser && (
                <td
                  colSpan={3}
                  className="p-1 text-sm font-bold text-nowrap text-right"
                ></td>
              )}
              <td
                colSpan={7}
                className="p-1 text-sm font-bold text-nowrap text-right"
              >
                Total de BOLETAS DE VENTA:
              </td>
              <td colSpan={1} className="p-1 text-sm font-bold text-nowrap">
                {" S/ "}
              </td>
              <td
                colSpan={1}
                className="p-1 text-sm font-bold text-nowrap text-right"
              >
                {filteredSalesData?.allSales?.totalSalesTickets
                  ? Number(
                      filteredSalesData?.allSales?.totalSalesTickets,
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
                ></td>
              )}
              <td
                colSpan={7}
                className="p-1 text-sm font-bold text-nowrap text-right"
              >
                Total de NOTAS DE CRÉDITO:
              </td>
              <td colSpan={1} className="p-1 text-sm font-bold text-nowrap">
                {" S/ "}
              </td>

              <td
                colSpan={1}
                className="p-1 text-sm font-bold text-nowrap text-right"
              >
                {filteredSalesData?.allSales?.totalCreditNotes
                  ? Number(
                      filteredSalesData?.allSales?.totalCreditNotes,
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
          compact
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

/**
 * Menu de acciones por fila. Antes usaba un Popover de Flowbite (2 instancias
 * por fila => ~50 objetos + listeners de Flowbite en cada respuesta). Con
 * <details> es HTML nativo: cero inicializacion y cero coste de redibujo.
 */
const OptionsMenu = memo(function OptionsMenu({
  item,
  onWhatsApp,
  onCancel,
}: {
  item: IOperation;
  onWhatsApp: (item: IOperation) => void;
  onCancel: (item: IOperation) => void;
}) {
  const close = (
    event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
  ) => {
    const details = (event.currentTarget as HTMLElement).closest("details");
    if (details) details.removeAttribute("open");
  };

  const linkClass =
    "block w-full rounded-md px-2 py-1.5 text-left font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-700";

  return (
    <details className="group relative inline-block text-left">
      <summary
        className={`cursor-pointer list-none font-medium text-blue-600 hover:underline dark:text-blue-500 [&::-webkit-details-marker]:hidden`}
      >
        Opciones
      </summary>
      <div className="absolute right-0 z-50 mt-1 w-64 rounded-lg border border-gray-200 bg-white p-1.5 text-[13px] shadow-lg dark:border-gray-600 dark:bg-gray-800">
        <a
          href="#"
          className={linkClass}
          onClick={(e) => {
            e.preventDefault();
            close(e);
            onWhatsApp(item);
          }}
        >
          Enviar por WhatsApp
        </a>

        {item.operationStatus !== "06" && item.codeHash && (
          <>
            <Link
              className={linkClass}
              href={`/dashboard/sales/credit_note/${item.id}`}
            >
              Generar NOTA DE CREDITO
            </Link>
            <Link
              className={linkClass}
              href={`/dashboard/guides/${item.id}/09`}
            >
              Generar GUIA DE REMISIÓN REMITENTE
            </Link>
            <Link
              className={linkClass}
              href={`/dashboard/guides/${item.id}/31`}
            >
              Generar GUIA DE REMISIÓN TRANSPORTISTA
            </Link>
            <button
              type="button"
              className={`${linkClass} text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10`}
              onClick={(e) => {
                close(e);
                onCancel(item);
              }}
            >
              ANULAR o COMUNICAR DE BAJA
            </button>
          </>
        )}

        <a
          className="block w-full rounded-md px-2 py-1.5 text-left font-medium text-green-600 hover:bg-green-50 dark:text-green-500 dark:hover:bg-gray-700"
          target="_blank"
          rel="noreferrer"
          href="https://ww1.sunat.gob.pe/ol-ti-itconsultaunificadalibre/consultaUnificadaLibre/consulta"
        >
          CONSULTA SUNAT 1
        </a>
        <a
          className="block w-full rounded-md px-2 py-1.5 text-left font-medium text-green-600 hover:bg-green-50 dark:text-green-500 dark:hover:bg-gray-700"
          target="_blank"
          rel="noreferrer"
          href="https://ww1.sunat.gob.pe/ol-ti-itconsvalicpe/ConsValiCpe.htm"
        >
          CONSULTA SUNAT 2
        </a>
        <a
          className="block w-full rounded-md px-2 py-1.5 text-left font-medium text-green-600 hover:bg-green-50 dark:text-green-500 dark:hover:bg-gray-700"
          target="_blank"
          rel="noreferrer"
          href="https://ww1.sunat.gob.pe/ol-ti-itconsverixml/ConsVeriXml.htm"
        >
          Verificar XML en la SUNAT
        </a>
      </div>
    </details>
  );
});

const SaleRow = memo(function SaleRow({
  item,
  index,
  isSuperuser,
  showUserColumn,
  hasCreditNote,
  onPdf,
  onXml,
  onCdr,
  onWhatsApp,
  onCancel,
}: {
  item: IOperation;
  index: number;
  isSuperuser: boolean;
  showUserColumn: boolean;
  hasCreditNote: boolean;
  onPdf: (item: IOperation) => void;
  onXml: (item: IOperation) => void;
  onCdr: (item: IOperation) => void;
  onWhatsApp: (item: IOperation) => void;
  onCancel: (item: IOperation) => void;
}) {
  const useDriveXml =
    item.operationStatus === "02" && Boolean(item.driveFirmaId);
  const hasXml =
    useDriveXml ||
    (item.operationStatus === "02" && item.linkXml) ||
    (item.operationStatus === "06" && item.linkXmlLow);

  const useDriveCdr =
    item.operationStatus === "02" && Boolean(item.driveCdrId);
  const hasCdr =
    useDriveCdr ||
    (item.operationStatus === "02" && item.linkCdr) ||
    (item.operationStatus === "06" && item.linkCdrLow);

  const cdrStyle =
    item.operationStatus === "02"
      ? item.documentType === "01"
        ? "bg-blue-500 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
        : "bg-gray-500 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      : "bg-yellow-600 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";

  return (
    <tr
      className={`border border-gray-100 dark:border-gray-600 ${
        item.operationStatus === "06"
          ? "line-through text-red-600 dark:text-red-400"
          : ""
      }`}
    >
      {isSuperuser && (
        <>
          <td className="p-0.5 font-bold text-blue-600 dark:text-blue-500">
            {index + 1}
          </td>
          <td className="p-0.5 font-bold text-blue-600 dark:text-blue-500">
            {item.subsidiary?.companyName}
          </td>
          <td className="p-0.5 pl-2 text-nowrap font-bold text-blue-600 dark:text-blue-500">
            {formatEmitTime(item.emitTime)}
          </td>
        </>
      )}

      <td className="p-0.5 pl-2 text-nowrap">{item.emitDate}</td>
      <td className="p-0.5 text-center">{item.documentType}</td>
      <td className="p-0.5 text-center">{item.serial}</td>
      <td className="p-0.5 tex-left">{item.correlative}</td>
      <td className="p-0.5 tex-left">{item.client?.documentNumber}</td>
      <td className="p-0.5">{item.client?.names}</td>
      <td className="p-0.5 text-center">
        {item.currencyType === "PEN" ? "S/" : item.currencyType}
      </td>
      <td className="p-0.5 text-right">{Number(item.totalToPay).toFixed(2)}</td>
      <td className="p-0.5 text-right">{Number(item.totalFree).toFixed(2)}</td>
      <td className="p-0.5 text-center">
        {Number(item.totalPayed) > 0 ? "SI" : "X"}
      </td>
      <td className="p-0.5 text-center">
        {item.operationStatus === "06" ? "SI" : "NO"}
      </td>
      {hasCreditNote && (
        <td className="p-0.5 text-center">{item.creditNoteReferences}</td>
      )}
      <td className="p-0.5 text-center">
        {item.sendWhatsapp ? (
          "SI"
        ) : (
          <span className="text-red-800 font-black">x</span>
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
              onPdf(item);
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
        <Link
          href={`/dashboard/sales/view/${item.id}`}
          className="hover:underline"
        >
          <span className="bg-blue-600 text-white text-[11px] font-semibold me-2 px-1.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300 text-nowrap">
            VER
          </span>
        </Link>
      </td>
      <td className="p-0.5 text-center">
        {hasXml && (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onXml(item);
            }}
            className="hover:underline"
          >
            <span className="bg-green-600 text-white text-[11px] font-semibold me-2 px-1.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300 text-nowrap">
              XML
            </span>
          </a>
        )}
      </td>
      <td className="p-0.5 text-center">
        {hasCdr && (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onCdr(item);
            }}
            className="hover:underline"
          >
            <span
              className={`text-white text-[11px] font-semibold me-2 px-1.5 py-0.5 rounded-full text-nowrap ${cdrStyle}`}
            >
              {item.operationStatus === "06" && !item.linkCdrLow
                ? "SIN CDR"
                : "CDR"}
            </span>
          </a>
        )}
      </td>
      <td className="p-0.5 text-center">
        <span
          title={getStatusMessage(item)}
          className={`${getStatusClassName(item?.operationStatus)} cursor-help`}
        >
          {getStatusContent(
            item?.operationStatus,
            String(item?.documentType),
          )}
        </span>
      </td>
      {showUserColumn && (
        <td className="p-0.5 text-center">{item?.user?.fullName}</td>
      )}
      <td className="p-0.5">
        {item?.operationStatus === "01" ||
        item?.operationStatus === "02" ||
        item?.operationStatus === "06" ? (
          <OptionsMenu item={item} onWhatsApp={onWhatsApp} onCancel={onCancel} />
        ) : (
          item?.operationStatusReadable
        )}
      </td>
    </tr>
  );
});

export default SaleList;
