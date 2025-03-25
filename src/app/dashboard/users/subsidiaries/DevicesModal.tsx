import { ChangeEvent, FormEvent ,useState, useEffect } from "react";
import { Modal, ModalOptions } from 'flowbite'
import { toast } from "react-toastify";
import QRCode from "react-qr-code";
function DevicesModal({modalDevice, setModalDevice, subsidiaryDevices,setSubsidiaryDevices, initialStateDevices}:any) {
      

    useEffect(() => {
        if (modalDevice == null) {
            const $targetEl = document.getElementById('device-modal');
            const options: ModalOptions = {
                placement: 'bottom-right',
                backdrop: 'static',
                backdropClasses: 'bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
                closable: false
            };
            setModalDevice(new Modal($targetEl, options));
        }
    }, [modalDevice, setModalDevice]);  
    const handleUnlinkDevice = async (deviceId: number) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
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
            });

            const result = await response.json();

            if (response.ok && result.data.deleteDevice.success) {
                // Actualizar la lista de dispositivos después de eliminar
                setSubsidiaryDevices((prevState: any) => ({
                    ...prevState,
                    devices: prevState.devices.filter((device: any) => device.id !== deviceId),
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
    <div id="device-modal" tabIndex={-1} aria-hidden={modalDevice?.isHidden ? "true" : "false"} className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
        <div className="relative p-4 w-full max-w-lg max-h-full">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                    <h3 className="text-xl text-gray-900 dark:text-white">
                        Vincular Dispositivo
                    </h3>
                    <button type="button" onClick={(e)=>{modalDevice.hide();setSubsidiaryDevices(initialStateDevices);}} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                </div>
                <div className="p-4 md:p-5">
                    <div className="mb-4 flex flex-col items-center">
                        <div className="p-4 bg-white rounded-lg shadow-lg w-full flex justify-center">
                            <QRCode value={subsidiaryDevices.token} size={256} className="w-full h-auto" />
                        </div>
                        <p className="mt-2 text-center text-gray-900 dark:text-white">Escanea este QR para asociar un dispositivo</p>
                    </div>
                    <div className="border-t border-gray-300 dark:border-gray-600 mt-4 pt-4">
                        <h4 className="text-lg text-gray-900 dark:text-white mb-2">Dispositivos</h4>
                        <ul className="list-disc pl-5 space-y-2">
                            {subsidiaryDevices.devices.map((device: any) => (
                                <li key={device.id} className="flex justify-between items-center text-gray-900 dark:text-white">
                                    {device.mobileDescription}{device.id}
                                    <button onClick={() => handleUnlinkDevice(device.id)} className="ml-4 px-2 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600">
                                      Desvincular
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
  )
}

export default DevicesModal
