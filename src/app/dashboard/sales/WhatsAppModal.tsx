import Whatsapp from "@/components/icons/Whatsapp";
import { DocumentNode, gql, useMutation } from "@apollo/client";
import { Modal, ModalOptions } from "flowbite";
import React, { ChangeEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";

const SEND_CPE_BY_WHATSAPP = gql`
    mutation SendCpeByWhatsapp($id: Int!) {
        sendCpeByWhatsapp(id: $id) {
            message
            error
        }
    }
`;

function WhatsAppModal({
    modalWhatsApp,
    setModalWhatsApp,
    cpe,
    setCpe,
    initialStateCpe,
    authContext,
}: any) {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [countryCode, setCountryCode] = useState("51");

    useEffect(() => {
        if (modalWhatsApp == null) {
            const $targetEl = document.getElementById("modalWhatsApp");
            const options: ModalOptions = {
                placement: "top-center",
                backdrop: "static",
                backdropClasses:
                    "bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40",
                closable: false,
            };
            setModalWhatsApp(new Modal($targetEl, options));
        }
    }, [modalWhatsApp, setModalWhatsApp]);

    const padCorrelative = (correlative: string | number) => {
        return correlative?.toString().padStart(6, "0");
    };

    function useCustomMutation(mutation: DocumentNode) {
        return useMutation(mutation, {
            context: authContext,
            onError: (err) => console.error("Error of sent:", err), // Log the error for debugging
        });
    }

    const [sendCpe] = useCustomMutation(SEND_CPE_BY_WHATSAPP);

    const handleSend = () => {
        if (!phoneNumber) {
            toast.error("Ingrese un número de teléfono válido");
            return;
        }

        const variables = {
            id: cpe.id,
        };

        sendCpe({
            variables,
            onCompleted: (data) => {
                if (data.sendCpeByWhatsapp.error) {
                    toast.error(data.sendCpeByWhatsapp.message);
                    return;
                }
                toast.success(data.sendCpeByWhatsapp.message);
            },
            onError: (err) => {
                console.error("Error sending CPE:", err);
                toast.error("Error al enviar el CPE");
            },
        });

        const message = `Estimado cliente,\nSe envía la ${
            cpe?.documentTypeDisplay
        } ELECTRÓNICA ${cpe?.serial}-${padCorrelative(
            cpe?.correlative
        )}.\nPara ver, haga clic en el siguiente enlace:\n\n${
            process.env.NEXT_PUBLIC_BASE_API
        }/operations/print_invoice/${cpe.id}/`;

        const whatsappURL = `https://web.whatsapp.com/send?phone=${countryCode}${phoneNumber}&text=${encodeURIComponent(
            message
        )}`;

        window.open(whatsappURL, "_blank");
        modalWhatsApp.hide();
        setCpe(initialStateCpe);
        setPhoneNumber("");
    };

    return (
        <>
            {/* Default Modal */}
            <div
                id="modalWhatsApp"
                tabIndex={-1}
                className="fixed top-0 left-0 right-0 z-50 hidden w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"
            >
                <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b dark:border-gray-600">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Enviar a WhatsApp
                        </h3>
                        <button
                            onClick={() => {
                                modalWhatsApp.hide();
                                setCpe(initialStateCpe);
                                setPhoneNumber("");
                            }}
                            className="text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg p-2"
                        >
                            ✕
                        </button>
                    </div>
                    {/* Modal body */}
                    <div className="p-5 space-y-2">
                        <h2 className="text-md font-semibold text-center text-gray-900 dark:text-white">
                            {cpe?.documentTypeDisplay} ELECTRÓNICA {cpe?.serial}
                            -{padCorrelative(cpe?.correlative)}
                        </h2>
                        <h4 className="text-sm text-center text-gray-500 dark:text-gray-300">
                            {cpe?.clientDoc} - {cpe?.clientName}
                        </h4>

                        {/* Código de país */}
                        <div>
                            <label
                                htmlFor="country-code"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Código de país
                            </label>
                            <select
                                id="country-code"
                                name="countryCode"
                                value={countryCode}
                                className="w-full mt-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                onChange={(e) => setCountryCode(e.target.value)}
                            >
                                <option value="51">Perú +51</option>
                                <option value="56">Chile +56</option>
                                <option value="57">Colombia +57</option>
                                <option value="52">México +52</option>
                                <option value="54">Argentina +54</option>
                                <option value="591">Bolivia +591</option>
                                <option value="593">Ecuador +593</option>
                                <option value="1">Estados Unidos +1</option>
                                <option value="34">España +34</option>
                            </select>
                        </div>

                        {/* Número de teléfono */}
                        <div>
                            <label
                                htmlFor="phone-number"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Número de teléfono
                            </label>
                            <input
                                type="text"
                                id="phone-number"
                                name="phoneNumber"
                                value={phoneNumber}
                                maxLength={9}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                autoComplete="off"
                                placeholder="Ingrese el número de teléfono"
                                className="w-full mt-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Modal footer */}
                    <div className="flex items-center p-4 md:p-5 space-x-3 rtl:space-x-reverse border-t border-gray-200 rounded-b dark:border-gray-600">
                        <button
                            type="button"
                            onClick={() => {
                                modalWhatsApp.hide();
                                setCpe(initialStateCpe);
                                setPhoneNumber("");
                            }}
                            className="btn-dark px-5 py-2 inline-flex items-center gap-2 m-0"
                        >
                            Cerrar
                        </button>
                        <button
                            type="button"
                            onClick={handleSend}
                            className="btn-blue px-5 py-2 inline-flex items-center gap-2"
                        >
                            Enviar a WhatsApp WEB <Whatsapp />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default WhatsAppModal;
