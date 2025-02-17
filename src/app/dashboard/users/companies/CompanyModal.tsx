import { ChangeEvent, FormEvent, MouseEvent, useEffect, useRef } from "react";
import { Modal, ModalOptions } from 'flowbite'
import { toast } from "react-toastify";
import { DocumentNode, gql, useMutation } from "@apollo/client";
import { ICompany } from "@/app/types";
const CREATE_COMPANY = gql`
  mutation CreateCompany(
    $typeDoc: String!,
    $doc: String!,
    $shortName: String!,
    $businessName: String!,
    $address: String!,
    $email: String!,
    $phone: String!,
    $userSol: String!,
    $keySol: String!,
    $limit: Int!,
    $emissionInvoiceWithPreviousDate: Int!,
    $emissionReceiptWithPreviousDate: Int!,
    $logo: String!,
    $includeIgv: Boolean!,
    $percentageIgv: Int!,
    $isEnabled: Boolean!,
    $isProduction: Boolean!,
    $certification: String!, # Upload,  
    $certificationExpirationDate: String!,
    $certificationKey: String!, #Upload,
    $withStock: Boolean!,
    $catalog: Boolean!,
    $invoiceF: Boolean!,
    $invoiceB: Boolean!,
    $guide: Boolean!,
    $app: Boolean!
  ) {
    createCompany(
      typeDoc: $typeDoc,
      doc: $doc,
      shortName: $shortName,
      businessName: $businessName,
      address: $address,
      email: $email,
      phone: $phone,
      userSol: $userSol,
      keySol: $keySol,
      limit: $limit,
      emissionInvoiceWithPreviousDate: $emissionInvoiceWithPreviousDate,
      emissionReceiptWithPreviousDate: $emissionReceiptWithPreviousDate,
      logo: $logo,
      includeIgv: $includeIgv,
      percentageIgv: $percentageIgv,
      isEnabled: $isEnabled,
      isProduction: $isProduction,
      certification: $certification, 
      certificationExpirationDate: $certificationExpirationDate,
      certificationKey: $certificationKey,
      withStock: $withStock,
      catalog: $catalog,
      invoiceF: $invoiceF,
      invoiceB: $invoiceB,
      guide: $guide,
      app: $app
    ) {
      success
      message
    }
  }
`;
const UPDATE_COMPANY = gql`
  mutation UpdateCompany(
    $id: ID!,
    $typeDoc: String!,
    $doc: String!,
    $shortName: String!,
    $businessName: String!,
    $address: String!,
    $email: String!,
    $phone: String!,
    $userSol: String!,
    $keySol: String!,
    $limit: Int!,
    $emissionInvoiceWithPreviousDate: Int!,
    $emissionReceiptWithPreviousDate: Int!,
    $logo: String!,
    $includeIgv: Boolean!,
    $percentageIgv: Int!,
    $isEnabled: Boolean!,
    $isProduction: Boolean!,
    $certification: String!, #Upload,  
    $certificationExpirationDate: String!,
    $certificationKey: String!, #Upload,
    $withStock: Boolean!,
    $catalog: Boolean!,
    $invoiceF: Boolean!,
    $invoiceB: Boolean!,
    $guide: Boolean!,
    $app: Boolean!
  ) {
    updateCompany(
      id: $id,
      typeDoc: $typeDoc,
      doc: $doc,
      shortName: $shortName,
      businessName: $businessName,
      address: $address,
      email: $email,
      phone: $phone,
      userSol: $userSol,
      keySol: $keySol,
      limit: $limit,
      emissionInvoiceWithPreviousDate: $emissionInvoiceWithPreviousDate,
      emissionReceiptWithPreviousDate: $emissionReceiptWithPreviousDate,
      logo: $logo,
      includeIgv: $includeIgv,
      percentageIgv: $percentageIgv,
      isEnabled: $isEnabled,
      isProduction: $isProduction,
      certification: $certification, 
      certificationExpirationDate: $certificationExpirationDate,
      certificationKey: $certificationKey,
      withStock: $withStock,
      catalog: $catalog,
      invoiceF: $invoiceF,
      invoiceB: $invoiceB,
      guide: $guide,
      app: $app
    ) {
      message
    }
  }
`;
function CompanyModal({ modal, setModal, jwtToken, company, setCompany, initialState, fetchCompanies, COMPANIES_QUERY }: any) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    function useCustomMutation(mutation: DocumentNode, refetchQuery: DocumentNode) {
        const getAuthContext = () => ({
            headers: {
                "Content-Type": "application/json",
                "Authorization": jwtToken ? `JWT ${jwtToken}` : "",
            },
        });

        return useMutation(mutation, {
            context: getAuthContext(),
            refetchQueries: () => [{ query: refetchQuery, context: getAuthContext() }],
            onError: (err) => console.error("Error in unit:", err), // Log the error for debugging
        });
    }
    const [createCompany] = useCustomMutation(CREATE_COMPANY, COMPANIES_QUERY);
    const [updateCompany] = useCustomMutation(UPDATE_COMPANY, COMPANIES_QUERY);
    const handleFileReset = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Restablece el valor del input a una cadena vacía para deseleccionar el archivo
        }
    };
    const handleInputChange = async (
        event: ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = event.target;
        if ((name === "certification" || name === "certificationKey") && event.target instanceof HTMLInputElement) {
           const file = event.target.files?.[0];
        
            if (file) {
                try {
                    const base64 = await new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result as string);
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                    });

                    setCompany((prevCompany: ICompany) => ({
                        ...prevCompany,
                        [name]: base64
                        // {
                            // file: file,
                            // base64: base64
                        // }
                    }));
                } catch (error) {
                    console.error('File reading error:', error);
                }
            }
            // Verificación adicional para asegurarse de que `files` esté disponible
            // const files = event.target.files; // Ahora TypeScript sabe que `files` existe
            // setCompany((prevCompany: ICompany) => ({
            //     ...prevCompany,
            //     [name]: files?.[0] ?? null, // Guardar el archivo seleccionado o null si no hay archivo
            // }));
        }else {
            setCompany((prevCompany: ICompany) => ({
                ...prevCompany,
                [name]: value,
            }));
        }
        
    };
    const handleCheckboxChange = ({ target: { name, checked } }: ChangeEvent<HTMLInputElement>) => {
        setCompany({ ...company, [name]: checked });
    }
    // const fileToBase64 = (file: File): Promise<string> => {
    //     return new Promise((resolve, reject) => {
    //         const reader = new FileReader();
    //         reader.readAsDataURL(file);
    //         reader.onload = () => resolve(reader.result as string);
    //         reader.onerror = error => reject(error);
    //     });
    // };
    const handleSaveCompany = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            console.log("Empresa:", company)
            if (Number(company.id) !== 0) {
                const { data, errors } = await updateCompany({
                    variables: {
                        id: company.id,
                        typeDoc: "6",
                        doc: company.doc,
                        shortName: company.shortName,
                        businessName: company.businessName,
                        address: company.address,
                        email: company.email,
                        phone: company.phone,
                        userSol: company.userSol,
                        keySol: company.keySol,
                        limit: company.limit,
                        emissionInvoiceWithPreviousDate: company.emissionInvoiceWithPreviousDate,
                        emissionReceiptWithPreviousDate: company.emissionReceiptWithPreviousDate,
                        logo: company.logo || "",
                        includeIgv: company.includeIgv,
                        percentageIgv: company.percentageIgv,
                        isEnabled: company.isEnabled,
                        isProduction: company.isProduction,
                        certification: company.certification || "" ,
                        certificationExpirationDate: company.certificationExpirationDate,
                        certificationKey: company.certificationKey || "",
                        withStock: company.withStock,
                        catalog: company.catalog,
                        invoiceF: company.invoiceF,
                        invoiceB: company.invoiceB,
                        guide: company.guide,
                        app: company.app
                    }
                });
    
                if (errors) {
                    toast(errors.map((error: any) => error.message).join(", "), {
                        hideProgressBar: true,
                        autoClose: 2000,
                        type: 'error'
                    });
                } else {
                    toast(data.updateCompany.message, {
                        hideProgressBar: true,
                        autoClose: 2000,
                        type: 'success'
                    });
                    setCompany(initialState);
                    modal.hide();
                }
            } 
            else {               
                const { data, errors } = await createCompany({
                    variables: {
                        typeDoc: "6",
                        doc: company.doc,
                        shortName: company.shortName,
                        businessName: company.businessName,
                        address: company.address,
                        email: company.email,
                        phone: company.phone,
                        userSol: company.userSol,
                        keySol: company.keySol,
                        limit: company.limit,
                        emissionInvoiceWithPreviousDate: company.emissionInvoiceWithPreviousDate,
                        emissionReceiptWithPreviousDate: company.emissionReceiptWithPreviousDate,
                        logo: company.logo || "",
                        includeIgv: company.includeIgv,
                        percentageIgv: company.percentageIgv,
                        isEnabled: company.isEnabled,
                        isProduction: company.isProduction,
                        certification: company.certification || "" ,
                        certificationExpirationDate: company.certificationExpirationDate,
                        certificationKey: company.certificationKey || "",
                        withStock: company.withStock,
                        catalog: company.catalog,
                        invoiceF: company.invoiceF,
                        invoiceB: company.invoiceB,
                        guide: company.guide,
                        app: company.app
                    }
                });
    
                if (errors) {
                    toast(errors.map((error: any) => error.message).join(", "), {
                        hideProgressBar: true,
                        autoClose: 2000,
                        type: 'error'
                    });
                } else {
                    toast(data.createCompany.message, {
                        hideProgressBar: true,
                        autoClose: 2000,
                        type: 'success'
                    });
                    setCompany(initialState);
                    modal.hide();
                }
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unexpected error occurred';
            toast(errorMessage, {
                hideProgressBar: true,
                autoClose: 2000,
                type: 'error'
            });
        }
    };
    

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]; // Obtiene el primer archivo seleccionado
        // Verifica si se seleccionó un archivo
        if (file) {
            // Verifica el tamaño del archivo
            if (file.size > 20000) { // 20KB en bytes
                toast.error("El tamaño del archivo no debe superar los 20KB", {
                    hideProgressBar: true,
                    autoClose: 2000,
                });
                handleFileReset(); // Restablece el input de archivo
                return;
            }
    
            const reader = new FileReader();
    
            // Cuando se carga el archivo, verifica las dimensiones de la imagen
            reader.onload = (e: ProgressEvent<FileReader>) => {
                if (e.target?.result) {
                    const img = new Image();
                    img.onload = () => {
                        if (img.width > 320 || img.height > 80) {
                            toast.error("La imagen no debe superar los 320x80 píxeles", {
                                hideProgressBar: true,
                                autoClose: 2000,
                            });
                            handleFileReset(); // Restablece el input de archivo
                        } else {
                            setCompany((prevCompany: any) => ({
                                ...prevCompany,
                                logo: e.target?.result as string // Asegúrate de definir el tipo correcto para e.target.result
                            }));
                        }
                    };
                    img.src = e.target.result as string;
                }
            };
            reader.readAsDataURL(file);
        }
        // const file = event.target.files?.[0]; // Obtiene el primer archivo seleccionado
        // // Verifica si se seleccionó un archivo
        // if (file) {
        //     const reader = new FileReader();

        //     // Cuando se carga el archivo, muestra la imagen en el componente
        //     reader.onload = (e: ProgressEvent<FileReader>) => {
        //         if (e.target?.result) {
        //             // console.log(e.target?.result)
        //             //   setUser({...user, avatar:e.target.result});
        //             setCompany((prevCompany: any) => ({
        //                 ...prevCompany,
        //                 logo: e.target?.result as string // Asegúrate de definir el tipo correcto para e.target.result
        //             }));
        //         }
        //     };
        //     reader.readAsDataURL(file);
        // }
    };
    useEffect(() => {
        if (modal == null) {
            const $targetEl = document.getElementById('company-modal');
            const options: ModalOptions = {
                placement: 'bottom-right',
                backdrop: 'static',
                backdropClasses: 'bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
                closable: false
            };
            setModal(new Modal($targetEl, options))
        }
    }, []);
    useEffect(() => {
        console.log(company)
    }, [company]);
    return (
        <div>
            <div id="company-modal" tabIndex={-1} aria-hidden="true" className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
                <div className="relative p-4 w-full max-w-4xl max-h-full">
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                        <div className="flex items-center justify-between p-3 md:p-3 border-b rounded-t dark:border-gray-600">
                            <h6 className="font-semibold text-gray-900 dark:text-gray-200">
                                {company.id ? <p>Actualizar Empresa</p> : <p>Registrar Empresa</p>}
                            </h6>
                            <button type="button" onClick={(e) => { modal.hide(); setCompany(initialState); }} className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                </svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>
                        <div className="p-4 md:p-5">
                            <form onSubmit={handleSaveCompany}>
                                <fieldset>
                                    <legend className=' text-blue-600 font-semibold mb-2'>Datos Empresa</legend>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="sm:col-span-2">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="relative z-0 w-full mb-2 group sm:col-span-1">
                                                    <input type="text" name="doc" id="doc" value={company?.doc ? company?.doc : ''} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
                                                    <label htmlFor="doc" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Numero ruc</label>
                                                </div>
                                                <div className="relative z-0 w-full mb-2 group sm:col-span-1">
                                                    <input type="text" name="shortName" id="shortName" value={company?.shortName ? company?.shortName : ''} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
                                                    <label htmlFor="shortName" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Nombre comercial</label>
                                                </div>
                                                <div className="relative z-0 w-full mb-2 group sm:col-span-2">
                                                    <input type="text" name="businessName" id="businessName" value={company?.businessName ? company?.businessName : ''} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
                                                    <label htmlFor="businessName" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Razon Social</label>
                                                </div>
                                                <div className="relative z-0 w-full mb-2 group sm:col-span-2">
                                                    <input type="text" name="address" id="address" value={company?.address ? company?.address : ''} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
                                                    <label htmlFor="address" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Direccion</label>
                                                </div>
                                                <div className="relative z-0 w-full mb-2 group sm:col-span-1">
                                                    <input type="email" name="email" id="email" value={company?.email ? company?.email : ''} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
                                                    <label htmlFor="email" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Correo Electronico</label>
                                                </div>
                                                <div className="relative z-0 w-full mb-2 group sm:col-span-1">
                                                    <input type="text" name="phone" id="phone" value={company.phone ? company.phone : ''} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                                                    <label htmlFor="phone" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Telefono/Celular</label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="sm:col-span-1">
                                            <div className="flex items-center justify-center w-full mb-2">
                                                <label htmlFor="logo" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                                                    <div className="flex flex-col items-center justify-center p-2">
                                                        {company?.logo?.length ?
                                                            <img
                                                                src={company.id && company.logo?.search("base64") == -1 ? `${process.env.NEXT_PUBLIC_BASE_API}/${company.logo}` : company.logo}
                                                                alt="Imagen seleccionada"
                                                                style={{ maxWidth: '100%', maxHeight: '200px' }}
                                                            /> :
                                                            <>
                                                                <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                                                </svg>
                                                                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Haga clic para cargar</span> o arrastrar</p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 400x400px)</p>
                                                            </>}
                                                    </div>
                                                    <input id="logo" name="logo" type="file" className="hidden" ref={fileInputRef} onClick={handleFileReset} onChange={handleFileChange} accept="image/*" />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </fieldset>

                                <fieldset>
                                    <legend className=' text-blue-600 font-semibold mb-2'>Cuenta Sunat</legend>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                            <input type="text" name="userSol" id="userSol" value={company?.userSol ? company?.userSol : ''} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
                                            <label htmlFor="userSol" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Usuario Sol</label>
                                        </div>
                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                            <input type="text" name="keySol" id="keySol" value={company?.keySol ? company.keySol : ''} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                                            <label htmlFor="keySol" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Clave Sol</label>
                                        </div>
                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                            <input
                                                type="date"
                                                value={company?.certificationExpirationDate ? company?.certificationExpirationDate : ''}
                                                onChange={handleInputChange}
                                                name="certificationExpirationDate"
                                                className="block pb-2 pt-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                                required
                                            />
                                            <label htmlFor="certificationExpirationDate" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Fecha expiración</label>
                                        </div>

                                        <div className="sm:col-span-3 relative z-0 w-full mb-2 group">
                                            <input ref={fileInputRef} onChange={handleInputChange} className="block pt-2.5 pb-1 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" id="certification" name="certification" type="file" />
                                            <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6" htmlFor="certification">Certificado Digital</label>
                                            {company.certification && (<p className="text-sm text-gray-500 mt-1">Archivo cargado: server.pem</p>)}
                                        </div>
                                        <div className="sm:col-span-3 relative z-0 w-full mb-2 group">
                                            <input ref={fileInputRef} onChange={handleInputChange} className="block pt-2.5 pb-1 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" id="certificationKey" name="certificationKey" type="file" />
                                            <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6" htmlFor="certificationKey">Clave Certificado Digital</label>
                                            {company.certificationKey && (<p className="text-sm text-gray-500 mt-1">Archivo cargado: server_key.pem</p>)}
                                        </div>
                                    </div>
                                </fieldset>

                                <fieldset>
                                    <legend className=' text-blue-600 font-semibold mb-2'>Configuraciones</legend>
                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                            <input type="number" step={1} min={0} name="limit" id="limit" value={company?.limit!} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="block py-2.5 px-0 w-full text-right text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                                            <label htmlFor="limit" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Limite comprobantes</label>
                                        </div>
                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                            <input type="number" step={1} min={0} max={7} name="emissionInvoiceWithPreviousDate" id="emissionInvoiceWithPreviousDate" value={company?.emissionInvoiceWithPreviousDate ? company?.emissionInvoiceWithPreviousDate! : 0} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="text-right block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                                            <label htmlFor="emissionInvoiceWithPreviousDate" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Días atras(Facturas)</label>
                                        </div>
                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                            <input type="number" step={1} min={0} max={7} name="emissionReceiptWithPreviousDate" id="emissionReceiptWithPreviousDate" value={company?.emissionReceiptWithPreviousDate ? company?.emissionReceiptWithPreviousDate! : 0} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="block py-2.5 px-0 w-full text-right text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                                            <label htmlFor="emissionReceiptWithPreviousDate" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Días atras(Boletas)</label>
                                        </div>
                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                            <select value={company?.percentageIgv ? company?.percentageIgv : 18} name="percentageIgv" onChange={handleInputChange} className="text-right block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:bg-gray-700 dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" required>
                                                {/* <option selected>Porcentaje IGV %</option> */}
                                                <option value={18}>18%</option>
                                                <option value={10}>10% (Ley 31556)</option>
                                                <option value={4}>4% (IVAP)</option>
                                            </select>
                                            <label htmlFor="percentageIgv" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300  transform -translate-y-6 scale-75 top-3  origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Porcentaje IGV %</label>
                                        </div>


                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                            <label className="inline-flex items-center mb-1 cursor-pointer">
                                                <input type="checkbox" value="" id="isEnabled" name="isEnabled" className="sr-only peer" checked={company?.isEnabled ? company?.isEnabled : false} onChange={handleCheckboxChange} />
                                                <div className="relative w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-500 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Estado Activo</span>
                                            </label>
                                        </div>
                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                            <label className="inline-flex items-center mb-1 cursor-pointer">
                                                <input type="checkbox" value="" id="includeIgv" name="includeIgv" className="sr-only peer" checked={company?.includeIgv ? company?.includeIgv : false} onChange={handleCheckboxChange} />
                                                <div className="relative w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-500 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Incluir IGV</span>
                                            </label>
                                        </div>
                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                            <label className="inline-flex items-center mb-1 cursor-pointer">
                                                <input type="checkbox" value="" id="isProduction" name="isProduction" className="sr-only peer" checked={company?.isProduction ? company?.isProduction : false} onChange={handleCheckboxChange} />
                                                <div className="relative w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-500 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Producción</span>
                                            </label>
                                        </div>
                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                            <label className="inline-flex items-center mb-1 cursor-pointer">
                                                <input type="checkbox" value="" id="withStock" name="withStock" className="sr-only peer" checked={company?.withStock ? company?.withStock : false} onChange={handleCheckboxChange} />
                                                <div className="relative w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-500 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Incluir Stock</span>
                                            </label>
                                        </div>

                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                            <label className="inline-flex items-center mb-1 cursor-pointer">
                                                <input type="checkbox" value="" id="invoiceF" name="invoiceF" className="sr-only peer" checked={company?.invoiceF ? company?.invoiceF : false} onChange={handleCheckboxChange} />
                                                <div className="relative w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-500 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Incluir Factura</span>
                                            </label>
                                        </div>
                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                            <label className="inline-flex items-center mb-1 cursor-pointer">
                                                <input type="checkbox" value="" id="invoiceB" name="invoiceB" className="sr-only peer" checked={company?.invoiceB ? company?.invoiceB : false} onChange={handleCheckboxChange} />
                                                <div className="relative w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-500 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Incluir Boleta</span>
                                            </label>
                                        </div>
                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                            <label className="inline-flex items-center mb-1 cursor-pointer">
                                                <input type="checkbox" value="" id="guide" name="guide" className="sr-only peer" checked={company?.guide ? company?.guide : false} onChange={handleCheckboxChange} />
                                                <div className="relative w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-500 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Incluir Guía</span>
                                            </label>
                                        </div>

                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                            <label className="inline-flex items-center mb-1 cursor-pointer">
                                                <input type="checkbox" value="" id="app" name="app" className="sr-only peer" checked={company?.app ? company?.app : false} onChange={handleCheckboxChange} />
                                                <div className="relative w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-500 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Incluir App Mobil</span>
                                            </label>
                                        </div>
                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                            <label className="inline-flex items-center mb-1 cursor-pointer">
                                                <input type="checkbox" value="" id="catalog" name="catalog" className="sr-only peer" checked={company.catalog} onChange={handleCheckboxChange} />
                                                <div className="relative w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-500 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Incluir Catalago</span>
                                            </label>
                                        </div>
                                    </div>
                                </fieldset>


                                <button type="submit" className="btn-blue">{company.id ? <p>Actualizar datos empresa</p> : <p>Crear datos empresa</p>}</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default CompanyModal
