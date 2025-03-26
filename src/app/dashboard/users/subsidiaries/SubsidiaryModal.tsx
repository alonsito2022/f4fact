import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { Modal, ModalOptions } from "flowbite";
import { toast } from "react-toastify";
import { ICompany, ISerialAssigned } from "@/app/types";
import { gql, useApolloClient, useMutation } from "@apollo/client";
import SerialAssignedTable from "./SerialAssignedTable";

const UPDATE_SERIAL_ASSIGNED = gql`
    mutation UpdateSerialAssigned(
        $id: Int!
        $subsidiaryId: Int!
        $documentType: String!
        $serial: String!
    ) {
        updateSerialAssigned(
            id: $id
            subsidiaryId: $subsidiaryId
            documentType: $documentType
            serial: $serial
        ) {
            message
            error
        }
    }
`;
const CREATE_SERIAL_ASSIGNED = gql`
    mutation CreateSerialAssigned(
        $subsidiaryId: Int!
        $documentType: String!
        $serial: String!
    ) {
        createSerialAssigned(
            subsidiaryId: $subsidiaryId
            documentType: $documentType
            serial: $serial
        ) {
            message
            error
        }
    }
`;
const DELETE_SERIAL_ASSIGNED = gql`
    mutation DeleteSerialAssigned($id: Int!) {
        deleteSerialAssigned(id: $id) {
            message
            error
        }
    }
`;
const GET_SUBSIDIARY = gql`
    query GetSubsidiary($id: ID!) {
        subsidiaryById(pk: $id) {
            id
            serial
            name
            address
            phone
            districtId
            companyId
            token
            serialassignedSet {
                id
                serial
                documentType
            }
        }
    }
`;
function SubsidiaryModal({
    modal,
    setModal,
    subsidiary,
    setSubsidiary,
    initialState,
    subsidiariesQuery,
    user,
}: any) {
    const [companies, setCompanies] = useState<ICompany[]>([]);
    const [createSerialAssigned] = useMutation(CREATE_SERIAL_ASSIGNED);

    const [deleteSerialAssigned] = useMutation(DELETE_SERIAL_ASSIGNED);

    const [updateSerialAssigned] = useMutation(UPDATE_SERIAL_ASSIGNED);
    const [editingSerial, setEditingSerial] = useState<number | null>(null);
    const client = useApolloClient();

    const refreshSubsidiaryData = async (subsidiaryId: number) => {
        const { data: subsidiaryData } = await client.query({
            query: GET_SUBSIDIARY,
            variables: { id: Number(subsidiaryId) },
            fetchPolicy: "network-only",
        });

        if (subsidiaryData.subsidiaryById) {
            const subsidiaryFound = {
                ...subsidiaryData.subsidiaryById,
                serialassignedSet:
                    subsidiaryData.subsidiaryById.serialassignedSet?.map(
                        (item: any) => ({
                            ...item,
                            documentType: item.documentType.replace("A_", ""),
                        })
                    ),
            };
            setSubsidiary(subsidiaryFound);
        }
    };
    const handleSerialUpdate = async (
        serialId: number,
        newSerial: string,
        newDocumentType: string
    ) => {
        if (newSerial.length !== 4) {
            toast("La serie debe tener exactamente 4 caracteres", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "error",
            });
            return;
        }
        try {
            const { data } = await updateSerialAssigned({
                variables: {
                    id: Number(serialId),
                    subsidiaryId: Number(subsidiary.id),
                    documentType: newDocumentType,
                    serial: newSerial,
                },
            });

            if (data.updateSerialAssigned.message) {
                await refreshSubsidiaryData(subsidiary.id);
                toast(data.updateSerialAssigned.message, {
                    hideProgressBar: true,
                    autoClose: 2000,
                    type: "success",
                });
                setEditingSerial(null);
            }
        } catch (error) {
            toast("Error al actualizar la serie", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "error",
            });
        }
    };
    const handleCreateSerial = async (serial: string, documentType: string) => {
        try {
            const { data } = await createSerialAssigned({
                variables: {
                    subsidiaryId: Number(subsidiary.id),
                    documentType,
                    serial,
                },
            });

            if (data.createSerialAssigned.message) {
                await refreshSubsidiaryData(subsidiary.id);
                toast(data.createSerialAssigned.message, {
                    hideProgressBar: true,
                    autoClose: 2000,
                    type: "success",
                });
            }
        } catch (error) {
            toast("Error al crear la serie", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "error",
            });
        }
    };
    const handleDeleteSerial = async (serialId: number) => {
        try {
            const { data } = await deleteSerialAssigned({
                variables: { id: Number(serialId) },
            });

            if (data.deleteSerialAssigned.message) {
                await refreshSubsidiaryData(subsidiary.id);
                toast(data.deleteSerialAssigned.message, {
                    hideProgressBar: true,
                    autoClose: 2000,
                    type: "success",
                });
            }
        } catch (error) {
            toast("Error al eliminar la serie", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "error",
            });
        }
    };
    const handleInputChange = ({
        target: { name, value },
    }: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >) => {
        setSubsidiary({ ...subsidiary, [name]: value });
    };
    const handleSaveSubsidiary = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (
            subsidiary.companyId === 0 ||
            subsidiary.companyId === "" ||
            subsidiary.companyId === null ||
            subsidiary.companyId === undefined
        ) {
            toast("Seleccione una empresa", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "error",
            });
            return;
        }
        if (
            subsidiary.districtId === 0 ||
            subsidiary.districtId === "" ||
            subsidiary.districtId === null ||
            subsidiary.districtId === undefined
        ) {
            toast("Ingrese un ubigeo", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "error",
            });
            return;
        }
        if (!/^\d{6}$/.test(subsidiary.districtId)) {
            toast("El ubigeo debe contener exactamente 6 dígitos numéricos", {
                hideProgressBar: true,
                autoClose: 2000,
                type: "error",
            });
            return;
        }
        let queryFetch: String = "";
        if (Number(subsidiary.id) !== 0) {
            queryFetch = `
                mutation{
                    updateSubsidiary(
                        id:${subsidiary.id}, serial: "${subsidiary.serial}", name: "${subsidiary.name}", address: "${subsidiary.address}", phone: "${subsidiary.phone}", districtId: "${subsidiary.districtId}", companyId: ${subsidiary.companyId},
                        pdfFormatForInvoices: ${subsidiary.pdfFormatForInvoices},
                        pdfFormatForReceiptInvoices: ${subsidiary.pdfFormatForReceiptInvoices},
                        pdfFormatForGuides: ${subsidiary.pdfFormatForGuides}
                    ){
                        message
                    }
                }
            `;
            console.log(queryFetch);
            await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: queryFetch }),
            })
                .then((res) => res.json())
                .then((data) => {
                    toast(data.data.updateSubsidiary.message, {
                        hideProgressBar: true,
                        autoClose: 2000,
                        type: "success",
                    });
                    setSubsidiary(initialState);
                    subsidiariesQuery({
                        variables: { companyId: user.companyId },
                    });
                    modal.hide();
                })
                .catch((e) => console.log(e));
        } else {
            queryFetch = `
                mutation{
                    createSubsidiary(
                        serial: "${subsidiary.serial}", name: "${subsidiary.name}", address: "${subsidiary.address}", phone: "${subsidiary.phone}", districtId: "${subsidiary.districtId}", companyId: ${subsidiary.companyId},
                        pdfFormatForInvoices: ${subsidiary.pdfFormatForInvoices},
                        pdfFormatForReceiptInvoices: ${subsidiary.pdfFormatForReceiptInvoices},
                        pdfFormatForGuides: ${subsidiary.pdfFormatForGuides}
                    ){
                        message
                    }
                }
            `;
            console.log(queryFetch);
            await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: queryFetch }),
            })
                .then((res) => res.json())
                .then((data) => {
                    toast(data.data.createSubsidiary.message, {
                        hideProgressBar: true,
                        autoClose: 2000,
                        type: "success",
                    });
                    setSubsidiary(initialState);
                    subsidiariesQuery({
                        variables: { companyId: user.companyId },
                    });
                    modal.hide();
                })
                .catch((e) => console.log(e));
        }
    };
    async function fetchCompanies() {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query: `
                    {
                        companies {
                            id
                            businessName
                        }
                    }
                `,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                setCompanies(data.data.companies);
            });
    }
    useEffect(() => {
        if (modal == null) {
            const $targetEl = document.getElementById("subsidiary-modal");
            const options: ModalOptions = {
                placement: "bottom-right",
                backdrop: "static",
                backdropClasses:
                    "bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40",
                closable: false,
            };
            setModal(new Modal($targetEl, options));
        }
        fetchCompanies();
    }, []);
    const handleCopyToken = () => {
        navigator.clipboard
            .writeText(subsidiary.token || "")
            .then(() => {
                toast("Token copiado al portapapeles", {
                    hideProgressBar: true,
                    autoClose: 2000,
                    type: "success",
                });
            })
            .catch((err) => {
                console.error("Error al copiar el token: ", err);
                toast("Error al copiar el token", {
                    hideProgressBar: true,
                    autoClose: 2000,
                    type: "error",
                });
            });
    };
    return (
        <div>
            <div
                id="subsidiary-modal"
                tabIndex={-1}
                aria-hidden="true"
                className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
            >
                <div className="relative p-4 w-full max-w-lg max-h-full">
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {subsidiary.id ? (
                                    <p>Actualizar Local</p>
                                ) : (
                                    <p>Registrar Nuevo Local</p>
                                )}
                            </h3>
                            <button
                                type="button"
                                onClick={(e) => {
                                    modal.hide();
                                    setSubsidiary(initialState);
                                }}
                                className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                            >
                                <svg
                                    className="w-3 h-3"
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
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>
                        <div className="p-4 md:p-5">
                            <form onSubmit={handleSaveSubsidiary}>
                                {/* Company Selection Section */}
                                <div className="mb-6 bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
                                    <h4 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
                                        Información de la Empresa
                                    </h4>
                                    <div className="relative z-0 w-full mb-3">
                                        <label
                                            htmlFor="companyId"
                                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                        >
                                            Empresa
                                        </label>
                                        <select
                                            id="companyId"
                                            name="companyId"
                                            onChange={handleInputChange}
                                            value={subsidiary.companyId}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                        >
                                            <option value="">
                                                Seleccionar Empresa
                                            </option>
                                            {companies?.map((o, k) => (
                                                <option key={k} value={o.id}>
                                                    {o.businessName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Branch Details Section */}
                                <div className="mb-6 bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
                                    <h4 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
                                        Información del Local
                                    </h4>
                                    <div className="grid md:grid-cols-2 md:gap-6">
                                        <div className="relative z-0 w-full mb-3">
                                            <label
                                                htmlFor="serial"
                                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                            >
                                                Serie Local
                                            </label>
                                            <input
                                                type="text"
                                                name="serial"
                                                id="serial"
                                                value={subsidiary.serial}
                                                onChange={handleInputChange}
                                                maxLength={4}
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                                placeholder="Ingrese serie"
                                                required
                                            />
                                        </div>
                                        <div className="relative z-0 w-full mb-3">
                                            <label
                                                htmlFor="name"
                                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                            >
                                                Nombre Local
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                id="name"
                                                value={subsidiary.name}
                                                onChange={handleInputChange}
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                                placeholder="Ingrese nombre"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="relative z-0 w-full mb-3">
                                        <label
                                            htmlFor="address"
                                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                        >
                                            Dirección
                                        </label>
                                        <input
                                            type="text"
                                            name="address"
                                            id="address"
                                            value={subsidiary.address || ""}
                                            onChange={handleInputChange}
                                            onFocus={(e) => e.target.select()}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                            placeholder="Ingrese dirección"
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 md:gap-6">
                                        <div className="relative z-0 w-full mb-3">
                                            <label
                                                htmlFor="districtId"
                                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                            >
                                                Ubigeo Local
                                            </label>
                                            <input
                                                type="text"
                                                name="districtId"
                                                id="districtId"
                                                value={
                                                    subsidiary.districtId || ""
                                                }
                                                maxLength={6}
                                                onChange={handleInputChange}
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                                placeholder="Ingrese ubigeo"
                                            />
                                        </div>
                                        <div className="relative z-0 w-full mb-3">
                                            <label
                                                htmlFor="phone"
                                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                            >
                                                Teléfono/Celular
                                            </label>
                                            <input
                                                type="text"
                                                name="phone"
                                                id="phone"
                                                value={subsidiary.phone || ""}
                                                maxLength={9}
                                                onChange={handleInputChange}
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                                placeholder="Ingrese teléfono"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {Number(subsidiary.id) > 0 && (
                                    <SerialAssignedTable
                                        serialassignedSet={
                                            subsidiary.serialassignedSet || []
                                        }
                                        editingSerial={editingSerial}
                                        setEditingSerial={setEditingSerial}
                                        handleSerialUpdate={handleSerialUpdate}
                                        subsidiaryId={subsidiary.id}
                                        onCreateSerial={handleCreateSerial}
                                        onDeleteSerial={handleDeleteSerial}
                                    />
                                )}

                                <div className="mb-6 bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
                                    <h4 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
                                        Formato de Impresión de Archivos PDF
                                    </h4>
                                    <div className="grid gap-4">
                                        <div className="flex flex-col space-y-2">
                                            <label className="block text-sm font-medium text-gray-900 dark:text-white">
                                                Formato de PDF en Facturas
                                            </label>
                                            <select
                                                name="pdfFormatForInvoices"
                                                onChange={handleInputChange}
                                                value={
                                                    subsidiary.pdfFormatForInvoices
                                                }
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            >
                                                <option value={1}>
                                                    Tamaño A4
                                                </option>
                                                {/* <option value={2}>
                                                    Tamaño A5 (Mitad de A4)
                                                </option> */}
                                                <option value={3}>
                                                    Tamaño Ticketera
                                                </option>
                                            </select>
                                        </div>
                                        <div className="flex flex-col space-y-2">
                                            <label className="block text-sm font-medium text-gray-900 dark:text-white">
                                                Formato de PDF en Boletas
                                            </label>
                                            <select
                                                name="pdfFormatForReceiptInvoices"
                                                onChange={handleInputChange}
                                                value={
                                                    subsidiary.pdfFormatForReceiptInvoices
                                                }
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            >
                                                <option value={1}>
                                                    Tamaño A4
                                                </option>
                                                {/* <option value={2}>
                                                    Tamaño A5 (Mitad de A4)
                                                </option> */}
                                                <option value={3}>
                                                    Tamaño Ticketera
                                                </option>
                                            </select>
                                        </div>
                                        <div className="flex flex-col space-y-2">
                                            <label className="block text-sm font-medium text-gray-900 dark:text-white">
                                                Formato de PDF en Guías
                                            </label>
                                            <select
                                                name="pdfFormatForGuides"
                                                onChange={handleInputChange}
                                                value={
                                                    subsidiary.pdfFormatForGuides
                                                }
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            >
                                                <option value={1}>
                                                    Tamaño A4
                                                </option>
                                                {/* <option value={2}>
                                                    Tamaño A5 (Mitad de A4)
                                                </option>
                                                <option value={3}>
                                                    Tamaño Ticketera
                                                </option> */}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Token Section */}
                                <div className="mb-6 bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
                                    <h4 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
                                        Token de Acceso
                                    </h4>
                                    <div className="flex items-center">
                                        <input
                                            type="text"
                                            name="token"
                                            id="token"
                                            value={subsidiary.token || ""}
                                            disabled
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                            placeholder="Token generado automáticamente"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleCopyToken}
                                            className="ml-2 px-3 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                                        >
                                            <svg
                                                className="w-5 h-5 text-white"
                                                aria-hidden="true"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M18 3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1V9a4 4 0 0 0-4-4h-3a1.99 1.99 0 0 0-1 .267V5a2 2 0 0 1 2-2h7Z"
                                                    clipRule="evenodd"
                                                />
                                                <path
                                                    fillRule="evenodd"
                                                    d="M8 7.054V11H4.2a2 2 0 0 1 .281-.432l2.46-2.87A2 2 0 0 1 8 7.054ZM10 7v4a2 2 0 0 1-2 2H4v6a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3Z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                >
                                    {subsidiary.id
                                        ? "Actualizar Local"
                                        : "Crear Local"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SubsidiaryModal;
