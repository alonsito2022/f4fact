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
    subsidiaryId: number; // Add this prop
    onCreateSerial: (serial: string, documentType: string) => void; // Add this prop
    onDeleteSerial: (id: number) => void;
}

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
        <div className="mb-6 bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                    Series asociadas
                </h4>
                <button
                    type="button"
                    onClick={() => setIsCreating(true)}
                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                >
                    Nueva Serie
                </button>
            </div>
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">
                                ID
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Tipo Documento
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Serie
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Origen
                            </th>
                            <th scope="col" className="px-6 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {isCreating && (
                            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                <td className="px-6 py-4">Nuevo</td>
                                <td className="px-6 py-4">
                                    <select
                                        className="bg-gray-50 border border-gray-300 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 uppercase"
                                        value={newDocumentType}
                                        onChange={(e) =>
                                            setNewDocumentType(e.target.value)
                                        }
                                    >
                                        <option value="01">Factura</option>
                                        <option value="03">Boleta</option>
                                        <option value="07">
                                            Nota de Crédito
                                        </option>
                                        <option value="08">
                                            Nota de Débito
                                        </option>
                                        <option value="09">
                                            Guía de Remisión Remitente
                                        </option>
                                        <option value="31">
                                            Guía de Remisión Transportista
                                        </option>
                                        <option value="20">
                                            Comprobante de Retención
                                        </option>
                                        <option value="40">
                                            Comprobante de Percepción
                                        </option>
                                        <option value="89">Cotización</option>
                                        <option value="NE">
                                            Nota de entrada
                                        </option>
                                        <option value="NS">
                                            Nota de salida
                                        </option>
                                    </select>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-2">
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
                                            className="bg-gray-50 border border-gray-300 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600"
                                            placeholder="Serie"
                                        />
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                        WEB
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={handleCreate}
                                            className="text-green-600 hover:text-green-800"
                                            type="button"
                                        >
                                            ✓
                                        </button>
                                        <button
                                            onClick={() => setIsCreating(false)}
                                            className="text-gray-500 hover:text-red-600"
                                            type="button"
                                        >
                                            ⊗
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {/* ... existing tbody content ... */}
                        {serialassignedSet?.length ? (
                            serialassignedSet.map(
                                (o: ISerialAssigned, k: number) => (
                                    <tr
                                        key={k}
                                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                                    >
                                        <td className="px-6 py-4">{o.id}</td>
                                        <td className="px-6 py-4">
                                            {editingSerial === o.id &&
                                            !o.isGeneratedViaApi ? (
                                                <select
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 uppercase"
                                                    defaultValue={
                                                        o.documentType
                                                    }
                                                    onChange={(e) =>
                                                        handleSerialUpdate(
                                                            o.id!,
                                                            o.serial,
                                                            e.target.value
                                                        )
                                                    }
                                                >
                                                    <option value="01">
                                                        Factura
                                                    </option>
                                                    <option value="03">
                                                        Boleta
                                                    </option>
                                                    <option value="07">
                                                        Nota de Crédito
                                                    </option>
                                                    <option value="08">
                                                        Nota de Débito
                                                    </option>
                                                    <option value="09">
                                                        Guía de Remisión
                                                        Remitente
                                                    </option>
                                                    <option value="31">
                                                        Guía de Remisión
                                                        Transportista
                                                    </option>
                                                    <option value="20">
                                                        Comprobante de Retención
                                                    </option>
                                                    <option value="40">
                                                        Comprobante de
                                                        Percepción
                                                    </option>
                                                    <option value="89">
                                                        Cotización
                                                    </option>
                                                    <option value="NE">
                                                        Nota de entrada
                                                    </option>
                                                    <option value="NS">
                                                        Nota de salida
                                                    </option>
                                                </select>
                                            ) : (
                                                <span
                                                    onClick={() =>
                                                        setEditingSerial(o.id)
                                                    }
                                                    className="cursor-pointer hover:text-blue-600 uppercase"
                                                >
                                                    {o.documentType === "01"
                                                        ? "Factura"
                                                        : o.documentType ===
                                                          "03"
                                                        ? "Boleta"
                                                        : o.documentType ===
                                                          "07"
                                                        ? "Nota de Crédito"
                                                        : o.documentType ===
                                                          "08"
                                                        ? "Nota de Débito"
                                                        : o.documentType ===
                                                          "09"
                                                        ? "Guía de Remisión Remitente"
                                                        : o.documentType ===
                                                          "31"
                                                        ? "Guía de Remisión Transportista"
                                                        : o.documentType ===
                                                          "20"
                                                        ? "Comprobante de Retención"
                                                        : o.documentType ===
                                                          "40"
                                                        ? "Comprobante de Percepción"
                                                        : o.documentType ===
                                                          "89"
                                                        ? "Cotización"
                                                        : o.documentType ===
                                                          "NE"
                                                        ? "Nota de entrada"
                                                        : o.documentType ===
                                                          "NS"
                                                        ? "Nota de salida"
                                                        : o.documentType}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            {editingSerial === o.id &&
                                            !o.isGeneratedViaApi ? (
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="text"
                                                        defaultValue={o.serial}
                                                        maxLength={4}
                                                        className="bg-gray-50 border border-gray-300 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600"
                                                        onKeyDown={(e) => {
                                                            if (
                                                                e.key ===
                                                                "Enter"
                                                            ) {
                                                                e.preventDefault(); // Add this line
                                                                handleSerialUpdate(
                                                                    o.id!,
                                                                    (
                                                                        e.target as HTMLInputElement
                                                                    ).value,
                                                                    o.documentType
                                                                );
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-between">
                                                    <span
                                                        onClick={() =>
                                                            setEditingSerial(
                                                                o.id
                                                            )
                                                        }
                                                    >
                                                        {o.serial}
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs ${
                                                    o.isGeneratedViaApi
                                                        ? "bg-blue-100 text-blue-800"
                                                        : "bg-green-100 text-green-800"
                                                }`}
                                            >
                                                {o.isGeneratedViaApi
                                                    ? "API"
                                                    : "WEB"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {editingSerial === o.id &&
                                            !o.isGeneratedViaApi ? (
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() =>
                                                            setEditingSerial(
                                                                null
                                                            )
                                                        }
                                                        type="button"
                                                        className="text-gray-500 hover:text-red-600"
                                                    >
                                                        ⊗
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-between">
                                                    {!o.isGeneratedViaApi && (
                                                        <button
                                                            onClick={() => {
                                                                if (
                                                                    window.confirm(
                                                                        "¿Está seguro de eliminar esta serie?"
                                                                    )
                                                                ) {
                                                                    onDeleteSerial(
                                                                        o.id!
                                                                    );
                                                                }
                                                            }}
                                                            type="button"
                                                            className="ml-2 text-red-600 hover:text-red-800"
                                                        >
                                                            ✕
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )
                            )
                        ) : (
                            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                <td
                                    colSpan={3}
                                    className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                                >
                                    No hay series asociadas
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
