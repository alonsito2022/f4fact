import { ISerialAssigned } from "@/app/types";
import { useState } from "react";
import { toast } from "react-toastify";

interface SerialAssignedTableProps {
    serialassignedSet: ISerialAssigned[];
    editingSerial: number | null;
    setEditingSerial: (id: number | null) => void;
    handleSerialUpdate: (
        serialId: number,
        newSerial: string,
        newDocumentType: string
    ) => void;
    subsidiaryId: number;
    onCreateSerial: (serial: string, documentType: string) => void;
    onDeleteSerial: (id: number) => void;
}

const DOCUMENT_TYPES_MAP: Record<string, string> = {
    "01": "Factura",
    "03": "Boleta",
    "07": "Nota de Crédito",
    "08": "Nota de Débito",
    "09": "Guía de Remisión Remitente",
    "31": "Guía de Remisión Transportista",
    "20": "Comprobante de Retención",
    "40": "Comprobante de Percepción",
    "48": "Cotización",
    NE: "Nota de Entrada",
    NS: "Nota de Salida",
};

function SerialAssignedTable({
    serialassignedSet,
    editingSerial,
    setEditingSerial,
    handleSerialUpdate,
    subsidiaryId,
    onCreateSerial,
    onDeleteSerial,
}: SerialAssignedTableProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [newSerial, setNewSerial] = useState("");
    const [newDocumentType, setNewDocumentType] = useState("01");

    const handleCreate = () => {
        if (newSerial.length !== 4) {
            toast("La serie debe tener exactamente 4 caracteres", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "error",
            });
            return;
        }
        onCreateSerial(newSerial, newDocumentType);
        setIsCreating(false);
        setNewSerial("");
        setNewDocumentType("01");
    };

    return (
        <div className="bg-slate-50/70 dark:bg-gray-700/30 border border-slate-200/80 dark:border-gray-700/60 rounded-xl p-5 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-2">
                    <svg
                        className="w-4 h-4 text-blue-600 dark:text-blue-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200">
                            Series de Comprobantes Autorizadas
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Series alfanuméricas asignadas para la emisión de documentos en esta sucursal.
                        </p>
                    </div>
                </div>

                {!isCreating && (
                    <button
                        type="button"
                        onClick={() => setIsCreating(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-colors"
                    >
                        <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                        <span>Nueva Serie</span>
                    </button>
                )}
            </div>

            <div className="relative overflow-x-auto rounded-xl border border-gray-200/80 dark:border-gray-600/70 bg-white dark:bg-gray-800 shadow-xs">
                <table className="w-full text-left text-xs text-gray-600 dark:text-gray-300">
                    <thead className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/80 dark:bg-gray-700/50 dark:text-gray-400 border-b border-gray-200/80 dark:border-gray-700">
                        <tr>
                            <th scope="col" className="px-4 py-3 w-16">
                                ID
                            </th>
                            <th scope="col" className="px-4 py-3 min-w-[180px]">
                                Tipo Documento
                            </th>
                            <th scope="col" className="px-4 py-3 w-32">
                                Serie
                            </th>
                            <th scope="col" className="px-4 py-3 w-24">
                                Origen
                            </th>
                            <th scope="col" className="px-4 py-3 text-right w-20">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                        {/* Fila para crear nueva serie */}
                        {isCreating && (
                            <tr className="bg-blue-50/50 dark:bg-blue-900/20">
                                <td className="px-4 py-3 font-mono text-blue-600 font-semibold">
                                    Nuevo
                                </td>
                                <td className="px-4 py-3">
                                    <select
                                        className="bg-white border border-gray-300 text-gray-900 dark:text-white text-xs rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block w-full p-1.5 dark:bg-gray-700 dark:border-gray-600"
                                        value={newDocumentType}
                                        onChange={(e) =>
                                            setNewDocumentType(e.target.value)
                                        }
                                    >
                                        <option value="01">Factura</option>
                                        <option value="03">Boleta</option>
                                        <option value="07">Nota de Crédito</option>
                                        <option value="08">Nota de Débito</option>
                                        <option value="09">Guía de Remisión Remitente</option>
                                        <option value="31">Guía de Remisión Transportista</option>
                                        <option value="20">Comprobante de Retención</option>
                                        <option value="40">Comprobante de Percepción</option>
                                        <option value="48">Cotización</option>
                                        <option value="NE">Nota de Entrada</option>
                                        <option value="NS">Nota de Salida</option>
                                    </select>
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                        type="text"
                                        value={newSerial}
                                        onChange={(e) => {
                                            e.preventDefault();
                                            setNewSerial(
                                                e.target.value.toUpperCase()
                                            );
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                handleCreate();
                                            }
                                        }}
                                        maxLength={4}
                                        className="bg-white border border-gray-300 text-gray-900 dark:text-white text-xs font-mono font-bold rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block w-full p-1.5 dark:bg-gray-700 dark:border-gray-600 uppercase"
                                        placeholder="Ej: F001"
                                        autoFocus
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                                        WEB
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <button
                                            onClick={handleCreate}
                                            className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg dark:hover:bg-gray-700 transition-colors"
                                            title="Guardar serie"
                                            type="button"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => setIsCreating(false)}
                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg dark:hover:bg-gray-700 transition-colors"
                                            title="Cancelar"
                                            type="button"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}

                        {/* Listado de series */}
                        {serialassignedSet?.length ? (
                            serialassignedSet.map((o: ISerialAssigned, k: number) => (
                                <tr
                                    key={o.id || k}
                                    className="hover:bg-gray-50/60 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                    <td className="px-4 py-3 font-mono text-gray-500 dark:text-gray-400">
                                        #{o.id}
                                    </td>
                                    <td className="px-4 py-3">
                                        {editingSerial === o.id && !o.isGeneratedViaApi ? (
                                            <select
                                                className="bg-white border border-gray-300 text-gray-900 dark:text-white text-xs rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block w-full p-1.5 dark:bg-gray-700 dark:border-gray-600"
                                                defaultValue={o.documentType}
                                                onChange={(e) =>
                                                    handleSerialUpdate(
                                                        o.id!,
                                                        o.serial,
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option value="01">Factura</option>
                                                <option value="03">Boleta</option>
                                                <option value="07">Nota de Crédito</option>
                                                <option value="08">Nota de Débito</option>
                                                <option value="09">Guía de Remisión Remitente</option>
                                                <option value="31">Guía de Remisión Transportista</option>
                                                <option value="20">Comprobante de Retención</option>
                                                <option value="40">Comprobante de Percepción</option>
                                                <option value="48">Cotización</option>
                                                <option value="NE">Nota de Entrada</option>
                                                <option value="NS">Nota de Salida</option>
                                            </select>
                                        ) : (
                                            <span
                                                onClick={() => {
                                                    if (!o.isGeneratedViaApi) {
                                                        setEditingSerial(o.id);
                                                    }
                                                }}
                                                className={`font-medium ${
                                                    !o.isGeneratedViaApi
                                                        ? "cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                                                        : ""
                                                }`}
                                            >
                                                {DOCUMENT_TYPES_MAP[o.documentType] || o.documentType}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {editingSerial === o.id && !o.isGeneratedViaApi ? (
                                            <input
                                                type="text"
                                                defaultValue={o.serial}
                                                maxLength={4}
                                                className="bg-white border border-gray-300 text-gray-900 dark:text-white text-xs font-mono font-bold rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block w-full p-1.5 dark:bg-gray-700 dark:border-gray-600 uppercase"
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        handleSerialUpdate(
                                                            o.id!,
                                                            (e.target as HTMLInputElement).value,
                                                            o.documentType
                                                        );
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <span
                                                onClick={() => {
                                                    if (!o.isGeneratedViaApi) {
                                                        setEditingSerial(o.id);
                                                    }
                                                }}
                                                className={`inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 ${
                                                    !o.isGeneratedViaApi
                                                        ? "cursor-pointer hover:border-blue-300"
                                                        : ""
                                                }`}
                                            >
                                                {o.serial}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                                o.isGeneratedViaApi
                                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                                                    : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                                            }`}
                                        >
                                            {o.isGeneratedViaApi ? "API" : "WEB"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {editingSerial === o.id && !o.isGeneratedViaApi ? (
                                            <button
                                                onClick={() => setEditingSerial(null)}
                                                type="button"
                                                className="p-1 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                title="Cerrar edición"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        ) : (
                                            !o.isGeneratedViaApi && (
                                                <button
                                                    onClick={() => {
                                                        if (
                                                            window.confirm(
                                                                "¿Está seguro de eliminar esta serie?"
                                                            )
                                                        ) {
                                                            onDeleteSerial(o.id!);
                                                        }
                                                    }}
                                                    type="button"
                                                    className="p-1 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-gray-700 transition-colors"
                                                    title="Eliminar serie"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            )
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="px-4 py-8 text-center text-gray-400 dark:text-gray-500"
                                >
                                    No hay series asociadas a este local.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default SerialAssignedTable;
