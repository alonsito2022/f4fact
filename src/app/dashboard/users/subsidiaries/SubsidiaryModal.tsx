import { ChangeEvent, FormEvent, useState, useEffect, useRef, useMemo } from "react";
import { Modal, ModalOptions } from "flowbite";
import { toast } from "react-toastify";
import { ICompany } from "@/app/types";
import { gql, useApolloClient, useMutation } from "@apollo/client";
import SerialAssignedTable from "./SerialAssignedTable";
import SearchableDropdown from "@/components/SearchableDropdown";

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
        isGeneratedViaApi
      }
      fillColor
      logo
    }
  }
`;

const PRESET_COLORS = [
  { name: "Gris", color: "#D2D7DA" },
  { name: "Azul", color: "#2563eb" },
  { name: "Esmeralda", color: "#059669" },
  { name: "Violeta", color: "#7c3aed" },
  { name: "Ámbar", color: "#d97706" },
  { name: "Rojo", color: "#e11d48" },
  { name: "Cian", color: "#0891b2" },
  { name: "Pizarra", color: "#475569" },
];

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
  const [companySearch, setCompanySearch] = useState("");
  const [copiedToken, setCopiedToken] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [createSerialAssigned] = useMutation(CREATE_SERIAL_ASSIGNED);
  const [deleteSerialAssigned] = useMutation(DELETE_SERIAL_ASSIGNED);
  const [updateSerialAssigned] = useMutation(UPDATE_SERIAL_ASSIGNED);
  const [editingSerial, setEditingSerial] = useState<number | null>(null);
  const client = useApolloClient();

  const selectedCompany = useMemo(() => {
    if (!subsidiary.companyId || !companies.length) return null;
    return (
      companies.find(
        (c: any) => Number(c.id) === Number(subsidiary.companyId)
      ) || null
    );
  }, [subsidiary.companyId, companies]);

  const refreshSubsidiaryData = async (subsidiaryId: number) => {
    const { data: subsidiaryData } = await client.query({
      query: GET_SUBSIDIARY,
      variables: { id: Number(subsidiaryId) },
      fetchPolicy: "network-only",
    });

    if (subsidiaryData.subsidiaryById) {
      const subsidiaryFound = {
        ...subsidiaryData.subsidiaryById,
        serialassignedSet: subsidiaryData.subsidiaryById.serialassignedSet?.map(
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

  const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Por favor selecciona un archivo de imagen válido (PNG, JPG, SVG)", {
          hideProgressBar: true,
          autoClose: 2500,
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      // Validación de peso: Menos de 30 KB
      const MAX_SIZE_BYTES = 30 * 1024; // 30 KB
      if (file.size >= MAX_SIZE_BYTES) {
        const sizeKb = (file.size / 1024).toFixed(1);
        toast.error(
          `La imagen debe pesar menos de 30 KB (tamaño actual: ${sizeKb} KB).`,
          {
            hideProgressBar: true,
            autoClose: 3500,
          }
        );
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          const img = new Image();
          img.onload = () => {
            // Validación de dimensiones: Máximo 320px por 300px
            if (img.width > 320 || img.height > 300) {
              toast.error(
                `La imagen no debe superar los 320x300 píxeles (dimensiones actuales: ${img.width}x${img.height}px).`,
                {
                  hideProgressBar: true,
                  autoClose: 4000,
                }
              );
              if (fileInputRef.current) fileInputRef.current.value = "";
              return;
            }

            setSubsidiary((prev: any) => ({
              ...prev,
              logo: e.target?.result as string,
            }));
          };
          img.src = e.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoRemove = () => {
    setSubsidiary((prev: any) => ({
      ...prev,
      logo: "",
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

    const pdfFormatForInvoices = subsidiary.pdfFormatForInvoices || 1;
    const pdfFormatForReceiptInvoices =
      subsidiary.pdfFormatForReceiptInvoices || 1;
    const pdfFormatForGuides = subsidiary.pdfFormatForGuides || 1;
    const pdfFormatForExitNotes = subsidiary.pdfFormatForExitNotes || 1;
    const fillColor = subsidiary.fillColor || "#D2D7DA";
    const logo = subsidiary.logo || "";

    setIsSaving(true);
    if (Number(subsidiary.id) !== 0) {
      const mutationQuery = `
        mutation UpdateSubsidiary(
          $id: ID!
          $serial: String
          $name: String
          $address: String
          $phone: String
          $districtId: String
          $companyId: Int
          $pdfFormatForInvoices: Int
          $pdfFormatForReceiptInvoices: Int
          $pdfFormatForGuides: Int
          $pdfFormatForExitNotes: Int
          $fillColor: String
          $logo: String
        ) {
          updateSubsidiary(
            id: $id
            serial: $serial
            name: $name
            address: $address
            phone: $phone
            districtId: $districtId
            companyId: $companyId
            pdfFormatForInvoices: $pdfFormatForInvoices
            pdfFormatForReceiptInvoices: $pdfFormatForReceiptInvoices
            pdfFormatForGuides: $pdfFormatForGuides
            pdfFormatForExitNotes: $pdfFormatForExitNotes
            fillColor: $fillColor
            logo: $logo
          ) {
            message
          }
        }
      `;
      const variables = {
        id: subsidiary.id,
        serial: subsidiary.serial,
        name: subsidiary.name,
        address: subsidiary.address,
        phone: subsidiary.phone,
        districtId: subsidiary.districtId,
        companyId: Number(subsidiary.companyId),
        pdfFormatForInvoices: Number(pdfFormatForInvoices),
        pdfFormatForReceiptInvoices: Number(pdfFormatForReceiptInvoices),
        pdfFormatForGuides: Number(pdfFormatForGuides),
        pdfFormatForExitNotes: Number(pdfFormatForExitNotes),
        fillColor: fillColor,
        logo: logo,
      };

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: mutationQuery, variables }),
        });
        const data = await res.json();
        if (data?.data?.updateSubsidiary?.message) {
          toast(data.data.updateSubsidiary.message, {
            hideProgressBar: true,
            autoClose: 2000,
            type: "success",
          });
        }
        setSubsidiary(initialState);
        subsidiariesQuery({
          variables: { companyId: user.companyId },
        });
        modal.hide();
      } catch (e) {
        console.error(e);
      } finally {
        setIsSaving(false);
      }
    } else {
      const mutationQuery = `
        mutation CreateSubsidiary(
          $serial: String
          $name: String
          $address: String
          $phone: String
          $districtId: String
          $companyId: Int
          $pdfFormatForInvoices: Int
          $pdfFormatForReceiptInvoices: Int
          $pdfFormatForGuides: Int
          $fillColor: String
          $logo: String
        ) {
          createSubsidiary(
            serial: $serial
            name: $name
            address: $address
            phone: $phone
            districtId: $districtId
            companyId: $companyId
            pdfFormatForInvoices: $pdfFormatForInvoices
            pdfFormatForReceiptInvoices: $pdfFormatForReceiptInvoices
            pdfFormatForGuides: $pdfFormatForGuides
            fillColor: $fillColor
            logo: $logo
          ) {
            message
          }
        }
      `;
      const variables = {
        serial: subsidiary.serial,
        name: subsidiary.name,
        address: subsidiary.address,
        phone: subsidiary.phone,
        districtId: subsidiary.districtId,
        companyId: Number(subsidiary.companyId),
        pdfFormatForInvoices: Number(pdfFormatForInvoices),
        pdfFormatForReceiptInvoices: Number(pdfFormatForReceiptInvoices),
        pdfFormatForGuides: Number(pdfFormatForGuides),
        fillColor: fillColor,
        logo: logo,
      };

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: mutationQuery, variables }),
        });
        const data = await res.json();
        if (data?.data?.createSubsidiary?.message) {
          toast(data.data.createSubsidiary.message, {
            hideProgressBar: true,
            autoClose: 2000,
            type: "success",
          });
        }
        setSubsidiary(initialState);
        subsidiariesQuery({
          variables: { companyId: user.companyId },
        });
        modal.hide();
      } catch (e) {
        console.error(e);
      } finally {
        setIsSaving(false);
      }
    }
  };

  async function fetchCompanies() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
                      {
                          companies {
                              id
                              businessName
                              logo
                          }
                      }
                  `,
        }),
      });
      const data = await res.json();
      if (data?.data?.companies) {
        setCompanies(data.data.companies);
      }
    } catch (e) {
      console.error(e);
    }
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

  useEffect(() => {
    if (subsidiary.companyId && companies.length > 0) {
      const company = companies.find(
        (c: ICompany) => Number(c.id) === Number(subsidiary.companyId)
      );
      if (company && company.businessName) {
        setCompanySearch(company.businessName);
      }
    } else if (!subsidiary.companyId) {
      setCompanySearch("");
    }
  }, [subsidiary.companyId, companies]);

  const handleCopyToken = () => {
    if (!subsidiary.token) return;
    navigator.clipboard
      .writeText(subsidiary.token || "")
      .then(() => {
        setCopiedToken(true);
        setTimeout(() => setCopiedToken(false), 2000);
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

  // Helper para resolver la URL o base64 de la imagen de la empresa o sucursal
  const formatImageUrl = (imgStr?: any) => {
    if (!imgStr || typeof imgStr !== "string") return "";
    if (imgStr.startsWith("data:") || imgStr.includes("base64")) {
      return imgStr;
    }
    return `${process.env.NEXT_PUBLIC_BASE_API}/${imgStr}`;
  };

  return (
    <div>
      <div
        id="subsidiary-modal"
        tabIndex={-1}
        aria-hidden="true"
        className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
      >
        <div className="relative p-4 w-full max-w-4xl max-h-full">
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700/80 dark:bg-gray-800 flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header del Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/80 dark:border-gray-700/70 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-800/60 shadow-xs">
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
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {subsidiary.id ? "Actualizar Local" : "Registrar Nuevo Local"}
                    </h3>
                    {subsidiary.id ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                        ID: #{subsidiary.id}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                        Nuevo
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Configuración de sucursal, imagen institucional para PDFs y series
                  </p>
                </div>
              </div>

              {/* Botón Cerrar */}
              <button
                type="button"
                onClick={() => {
                  modal.hide();
                  setSubsidiary(initialState);
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

            {/* Contenido / Formulario con Scroll */}
            <div className="p-6 overflow-y-auto space-y-6">
              <form id="subsidiary-form" onSubmit={handleSaveSubsidiary} className="space-y-6">
                {/* Sección 1: Empresa */}
                <div className="bg-slate-50/70 dark:bg-gray-700/30 border border-slate-200/80 dark:border-gray-700/60 rounded-xl p-5 space-y-3">
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
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200">
                      Empresa Matriz
                    </h4>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Selecciona la empresa o razón social a la que pertenece esta sucursal.
                  </p>

                  <div className="relative w-full">
                    <label
                      htmlFor="companyId"
                      className="block mb-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300"
                    >
                      Empresa <span className="text-red-500">*</span>
                    </label>
                    <SearchableDropdown
                      value={companySearch}
                      onChange={(val) => {
                        setCompanySearch(val);
                        if (val === "") {
                          setSubsidiary({ ...subsidiary, companyId: "" });
                        }
                      }}
                      onSelect={(company) => {
                        setCompanySearch(company.businessName);
                        setSubsidiary({
                          ...subsidiary,
                          companyId: company.id,
                        });
                      }}
                      items={companies.filter((c: ICompany) =>
                        c.businessName
                          ?.toLowerCase()
                          .includes(companySearch.toLowerCase())
                      )}
                      displayKey="businessName"
                      placeholder="Buscar por razón social..."
                      className="bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    />
                  </div>
                </div>

                {/* Sección 2: Datos del Local */}
                <div className="bg-slate-50/70 dark:bg-gray-700/30 border border-slate-200/80 dark:border-gray-700/60 rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200">
                      Datos de la Sucursal
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Serie Local */}
                    <div>
                      <label
                        htmlFor="serial"
                        className="block mb-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300"
                      >
                        Serie del Local <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="serial"
                        id="serial"
                        value={subsidiary.serial}
                        onChange={handleInputChange}
                        maxLength={4}
                        onFocus={(e) => e.target.select()}
                        className="bg-white border border-gray-200 text-gray-900 text-sm font-mono font-bold rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white uppercase placeholder:normal-case placeholder:font-normal"
                        placeholder="Ej: 0001"
                        required
                      />
                      <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                        Exactamente 4 dígitos o caracteres alfanuméricos.
                      </p>
                    </div>

                    {/* Nombre Local */}
                    <div>
                      <label
                        htmlFor="name"
                        className="block mb-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300"
                      >
                        Nombre / Descripción <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={subsidiary.name}
                        onChange={handleInputChange}
                        onFocus={(e) => e.target.select()}
                        className="bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        placeholder="Ej: Sede Principal, Sucursal Norte..."
                        required
                      />
                    </div>
                  </div>

                  {/* Dirección */}
                  <div>
                    <label
                      htmlFor="address"
                      className="block mb-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300"
                    >
                      Dirección Completa
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        name="address"
                        id="address"
                        value={subsidiary.address || ""}
                        onChange={handleInputChange}
                        onFocus={(e) => e.target.select()}
                        className="bg-white border border-gray-200 text-gray-900 text-sm rounded-xl pl-9 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        placeholder="Av. Principal 123, Urb. Centro"
                      />
                    </div>
                  </div>

                  {/* Ubigeo, Teléfono, Color */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Ubigeo */}
                    <div>
                      <label
                        htmlFor="districtId"
                        className="block mb-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300"
                      >
                        Ubigeo SUNAT <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="districtId"
                        id="districtId"
                        value={subsidiary.districtId || ""}
                        maxLength={6}
                        onChange={handleInputChange}
                        onFocus={(e) => e.target.select()}
                        className="bg-white border border-gray-200 text-gray-900 text-sm font-mono rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        placeholder="Ej: 150101"
                      />
                      <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                        Código oficial de 6 dígitos.
                      </p>
                    </div>

                    {/* Teléfono */}
                    <div>
                      <label
                        htmlFor="phone"
                        className="block mb-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300"
                      >
                        Teléfono / Celular
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          name="phone"
                          id="phone"
                          value={subsidiary.phone || ""}
                          maxLength={9}
                          onChange={handleInputChange}
                          onFocus={(e) => e.target.select()}
                          className="bg-white border border-gray-200 text-gray-900 text-sm rounded-xl pl-9 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                          placeholder="999888777"
                        />
                      </div>
                    </div>

                    {/* Color Distintivo */}
                    <div>
                      <label
                        htmlFor="fillColor"
                        className="block mb-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300"
                      >
                        Color Distintivo
                      </label>
                      <div className="flex items-center gap-2">
                        {/* Selector de color */}
                        <div className="relative flex-1">
                          <input
                            type="color"
                            name="fillColor"
                            id="fillColor"
                            value={subsidiary.fillColor || "#D2D7DA"}
                            onChange={handleInputChange}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                          <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl px-2.5 py-1.5 cursor-pointer shadow-xs hover:border-gray-300 dark:hover:border-gray-500 transition-colors">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-6 h-6 rounded-lg ring-1 ring-black/10 dark:ring-white/20 shadow-xs shrink-0"
                                style={{
                                  backgroundColor:
                                    subsidiary.fillColor || "#D2D7DA",
                                }}
                              />
                              <span className="font-mono text-xs font-medium text-gray-800 dark:text-gray-200">
                                {subsidiary.fillColor || "#D2D7DA"}
                              </span>
                            </div>
                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>

                        {/* Resetear color */}
                        <button
                          type="button"
                          onClick={() =>
                            setSubsidiary({
                              ...subsidiary,
                              fillColor: "#D2D7DA",
                            })
                          }
                          className="p-2.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-xs"
                          title="Restablecer color por defecto (#D2D7DA)"
                        >
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
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                        </button>
                      </div>

                      {/* Swatches rápidos */}
                      <div className="flex items-center gap-1.5 mt-2">
                        {PRESET_COLORS.map((item) => (
                          <button
                            key={item.color}
                            type="button"
                            onClick={() =>
                              setSubsidiary({
                                ...subsidiary,
                                fillColor: item.color,
                              })
                            }
                            className={`w-4 h-4 rounded-full transition-transform hover:scale-125 focus:outline-none ring-1 ring-black/10 dark:ring-white/20 ${
                              (subsidiary.fillColor || "#D2D7DA") === item.color
                                ? "ring-2 ring-blue-600 ring-offset-1 scale-110"
                                : ""
                            }`}
                            style={{ backgroundColor: item.color }}
                            title={item.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sección 3: Logo / Imagen del Local para PDFs */}
                <div className="bg-slate-50/70 dark:bg-gray-700/30 border border-slate-200/80 dark:border-gray-700/60 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-indigo-600 dark:text-indigo-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200">
                          Logo / Imagen del Local (Para Comprobantes PDF)
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Si configuras una imagen para este local, se usará en sus PDFs. Si no tiene, se imprimirá el logo de la empresa matriz.
                        </p>
                      </div>
                    </div>

                    {subsidiary.logo ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Logo Propio del Local
                      </span>
                    ) : selectedCompany?.logo ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        Heredando de Empresa
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700">
                        Sin logo asignado
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* Visualización / Preview */}
                    <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 min-h-[140px]">
                      {subsidiary.logo ? (
                        <div className="flex flex-col items-center gap-2">
                          <img
                            src={formatImageUrl(subsidiary.logo)}
                            alt="Logo sucursal"
                            className="max-h-24 max-w-full object-contain rounded-lg p-1"
                          />
                          <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                            Logo activo para este local
                          </p>
                        </div>
                      ) : selectedCompany?.logo ? (
                        <div className="flex flex-col items-center gap-2">
                          <img
                            src={formatImageUrl(selectedCompany.logo)}
                            alt="Logo empresa"
                            className="max-h-24 max-w-full object-contain rounded-lg p-1 opacity-75 grayscale-25"
                          />
                          <p className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
                            Usando logo de {selectedCompany.businessName || "la empresa"}
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-gray-400">
                          <svg
                            className="w-10 h-10 mb-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="text-xs">Sin imagen disponible</span>
                        </div>
                      )}
                    </div>

                    {/* Acciones de Carga */}
                    <div className="md:col-span-7 flex flex-col justify-center space-y-3">
                      <input
                        type="file"
                        id="subsidiary-logo-input"
                        name="logo"
                        ref={fileInputRef}
                        accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp"
                        onChange={handleLogoChange}
                        className="hidden"
                      />

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <span>{subsidiary.logo ? "Cambiar Imagen" : "Subir Logo del Local"}</span>
                        </button>

                        {subsidiary.logo && (
                          <button
                            type="button"
                            onClick={handleLogoRemove}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 hover:text-red-700 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800/60 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>Eliminar (Usar de Empresa)</span>
                          </button>
                        )}
                      </div>

                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                        <strong className="text-gray-700 dark:text-gray-300">Restricciones:</strong> Máximo <span className="font-semibold text-blue-600 dark:text-blue-400">320px de ancho por 300px de alto</span> y un peso <span className="font-semibold text-blue-600 dark:text-blue-400">menor a 30 KB</span>. Formatos: PNG, JPG, SVG.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sección 4: Series Asociadas (Solo para actualización) */}
                {Number(subsidiary.id) > 0 && (
                  <SerialAssignedTable
                    serialassignedSet={subsidiary.serialassignedSet || []}
                    editingSerial={editingSerial}
                    setEditingSerial={setEditingSerial}
                    handleSerialUpdate={handleSerialUpdate}
                    subsidiaryId={subsidiary.id}
                    onCreateSerial={handleCreateSerial}
                    onDeleteSerial={handleDeleteSerial}
                  />
                )}

                {/* Sección 5: Formato de Impresión PDF */}
                <div className="bg-slate-50/70 dark:bg-gray-700/30 border border-slate-200/80 dark:border-gray-700/60 rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-purple-600 dark:text-purple-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                      />
                    </svg>
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200">
                        Formatos de Impresión PDF
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Elige el formato de impresión predeterminado para cada comprobante electrónico emitido.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Facturas */}
                    <div className="bg-white dark:bg-gray-800 p-3.5 rounded-xl border border-gray-200/80 dark:border-gray-600/70 shadow-xs">
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Formato en Facturas
                      </label>
                      <select
                        name="pdfFormatForInvoices"
                        onChange={handleInputChange}
                        value={subsidiary.pdfFormatForInvoices || 1}
                        className="bg-gray-50 border border-gray-200 text-gray-900 text-xs font-medium rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value={1}>📄 Tamaño A4 (Hoja Completa)</option>
                        <option value={3}>🧾 Tamaño Ticketera (80mm)</option>
                      </select>
                    </div>

                    {/* Boletas */}
                    <div className="bg-white dark:bg-gray-800 p-3.5 rounded-xl border border-gray-200/80 dark:border-gray-600/70 shadow-xs">
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Formato en Boletas
                      </label>
                      <select
                        name="pdfFormatForReceiptInvoices"
                        onChange={handleInputChange}
                        value={subsidiary.pdfFormatForReceiptInvoices || 1}
                        className="bg-gray-50 border border-gray-200 text-gray-900 text-xs font-medium rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value={1}>📄 Tamaño A4 (Hoja Completa)</option>
                        <option value={3}>🧾 Tamaño Ticketera (80mm)</option>
                      </select>
                    </div>

                    {/* Guías */}
                    <div className="bg-white dark:bg-gray-800 p-3.5 rounded-xl border border-gray-200/80 dark:border-gray-600/70 shadow-xs">
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Formato en Guías de Remisión
                      </label>
                      <select
                        name="pdfFormatForGuides"
                        onChange={handleInputChange}
                        value={subsidiary.pdfFormatForGuides || 1}
                        className="bg-gray-50 border border-gray-200 text-gray-900 text-xs font-medium rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value={1}>📄 Tamaño A4 (Hoja Completa)</option>
                        <option value={3}>🧾 Tamaño Ticketera (80mm)</option>
                      </select>
                    </div>

                    {/* Notas de Salida */}
                    <div className="bg-white dark:bg-gray-800 p-3.5 rounded-xl border border-gray-200/80 dark:border-gray-600/70 shadow-xs">
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Formato en Notas de Salida
                      </label>
                      <select
                        name="pdfFormatForExitNotes"
                        onChange={handleInputChange}
                        value={subsidiary.pdfFormatForExitNotes || 1}
                        className="bg-gray-50 border border-gray-200 text-gray-900 text-xs font-medium rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value={1}>📄 Tamaño A4 (Hoja Completa)</option>
                        <option value={3}>🧾 Tamaño Ticketera (80mm)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Sección 6: Token de Acceso */}
                <div className="bg-slate-50/70 dark:bg-gray-700/30 border border-slate-200/80 dark:border-gray-700/60 rounded-xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-amber-600 dark:text-amber-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                      />
                    </svg>
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200">
                        Token de Acceso
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Identificador de autorización para integración con servicios móviles y terminales.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        name="token"
                        id="token"
                        value={subsidiary.token || ""}
                        disabled
                        className="bg-white border border-gray-200 text-gray-800 text-xs font-mono rounded-xl block w-full p-2.5 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 disabled:opacity-85"
                        placeholder="El token se generará automáticamente"
                      />
                    </div>
                    {subsidiary.token && (
                      <button
                        type="button"
                        onClick={handleCopyToken}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-colors shrink-0"
                        title="Copiar token al portapapeles"
                      >
                        {copiedToken ? (
                          <>
                            <svg className="w-4 h-4 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                            <span>Copiar Token</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* Footer con Acciones */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/90 border-t border-gray-200/80 dark:border-gray-700/70 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  modal.hide();
                  setSubsidiary(initialState);
                }}
                className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 rounded-xl shadow-xs transition-colors"
              >
                Cancelar
              </button>

              <button
                type="submit"
                form="subsidiary-form"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 rounded-xl shadow-sm hover:shadow transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/20"
              >
                {isSaving ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>
                      {subsidiary.id ? "Guardar Cambios" : "Crear Local"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubsidiaryModal;
