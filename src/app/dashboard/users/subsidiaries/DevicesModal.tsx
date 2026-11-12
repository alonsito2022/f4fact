import { useEffect } from "react";
import { Modal, ModalOptions } from "flowbite";
import { toast } from "react-toastify";
import QRCode from "react-qr-code";

function DevicesModal({
    modalDevice,
    setModalDevice,
    subsidiaryDevices,
    setSubsidiaryDevices,
    initialStateDevices,
}: any) {
    useEffect(() => {
        if (modalDevice == null) {
            const $targetEl = document.getElementById("device-modal");
            const options: ModalOptions = {
                placement: "bottom-right",
                backdrop: "static",
                backdropClasses:
                    "bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40",
                closable: false,
            };
            setModalDevice(new Modal($targetEl, options));
        }
    }, [modalDevice, setModalDevice]);

    const handleUnlinkDevice = async (deviceId: number) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_API}/graphql`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        query: `
                    mutation {
                        deleteDevice(id: ${deviceId}) {
                            success
                            message
                        }
                    }
                    `,
                    }),
                }
            );

            const result = await response.json();

            if (response.ok && result.data.deleteDevice.success) {
                setSubsidiaryDevices((prevState: any) => ({
                    ...prevState,
                    devices: prevState.devices.filter(
                        (device: any) => device.id !== deviceId
                    ),
                }));
                toast.success("Dispositivo desvinculado exitosamente");
            } else {
                toast.error("Error al desvincular el dispositivo");
            }
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("Error al desvincular el dispositivo");
        }
    };

    return (
        <div>
            <div
                id="device-modal"
                tabIndex={-1}
                aria-hidden={modalDevice?.isHidden ? "true" : "false"}
                className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
            >
                <div className="relative p-4 w-full max-w-lg max-h-full">
                    <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700/80 dark:bg-gray-800 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/80 dark:border-gray-700/70 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/80">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-800/60 shadow-xs">
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        Vincular Dispositivo Móvil
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Asocia la app móvil escaneando el código QR
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    modalDevice.hide();
                                    setSubsidiaryDevices(initialStateDevices);
                                }}
                                className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white rounded-xl w-8 h-8 inline-flex justify-center items-center transition-colors"
                            >
                                <svg
                                    className="w-4 h-4"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 14 14"
                                >
                                    <path
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                                    />
                                </svg>
                                <span className="sr-only">Cerrar modal</span>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-6">
                            {/* QR Section */}
                            <div className="flex flex-col items-center">
                                <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-200 dark:border-gray-600 flex justify-center">
                                    <QRCode
                                        value={subsidiaryDevices.token || ""}
                                        size={200}
                                        className="w-48 h-48"
                                    />
                                </div>
                                <p className="mt-3 text-xs font-medium text-gray-600 dark:text-gray-300 text-center">
                                    Abre la aplicación móvil y escanea este código para autorizar el dispositivo.
                                </p>
                            </div>

                            {/* Dispositivos vinculados */}
                            <div className="border-t border-gray-200/80 dark:border-gray-700/70 pt-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                        Dispositivos Vinculados ({subsidiaryDevices.devices?.length || 0})
                                    </h4>
                                </div>

                                {subsidiaryDevices.devices?.length > 0 ? (
                                    <ul className="space-y-2">
                                        {subsidiaryDevices.devices.map(
                                            (device: any) => (
                                                <li
                                                    key={device.id}
                                                    className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-700/40 border border-gray-200/60 dark:border-gray-600/50"
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold text-gray-900 dark:text-white">
                                                                {device.mobileDescription || "Dispositivo"}
                                                            </p>
                                                            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">
                                                                ID: #{device.id}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleUnlinkDevice(
                                                                device.id
                                                            )
                                                        }
                                                        className="px-2.5 py-1 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-800"
                                                    >
                                                        Desvincular
                                                    </button>
                                                </li>
                                            )
                                        )}
                                    </ul>
                                ) : (
                                    <p className="text-center py-4 text-xs text-gray-400 dark:text-gray-500 italic">
                                        No hay dispositivos móviles vinculados a esta sucursal.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-3.5 bg-gray-50 dark:bg-gray-800/90 border-t border-gray-200/80 dark:border-gray-700/70 flex justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    modalDevice.hide();
                                    setSubsidiaryDevices(initialStateDevices);
                                }}
                                className="px-4 py-2 text-xs font-semibold text-gray-700 hover:text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 rounded-xl shadow-xs transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DevicesModal;
