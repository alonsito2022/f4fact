import { ChangeEvent, FormEvent, MouseEvent, useEffect, useRef } from "react";
import { Modal, ModalOptions } from 'flowbite'
import { toast } from "react-toastify";
import { DocumentNode, gql, useMutation } from "@apollo/client";
function CompanyModal({ modal, setModal, company, setCompany, initialState, fetchCompanies }: any) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const handleFileReset = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Restablece el valor del input a una cadena vacía para deseleccionar el archivo
        }
    };
    const handleInputChange = async (
        event: ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>
      ) => {
        const { name, value, type } = event.target;
    
        if (name === "certification" && event.target instanceof HTMLInputElement) {
          // Verificación adicional para asegurarse de que `files` esté disponible
          const files = event.target.files; // Ahora TypeScript sabe que `files` existe
          setCompany({
            ...company,
            [name]: files?.[0] ?? null, // Guardar el archivo seleccionado o null si no hay archivo
          });
        } else {
          // Manejo general para texto, área de texto y selección
          setCompany({
            ...company,
            [name]: value,
          });
        }
    };
    const handleCheckboxChange = ({ target: { name, checked } }: ChangeEvent<HTMLInputElement>) => {
        setCompany({ ...company, [name]: checked });
    }
    const handleSaveCompany = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        let queryFetch: String = "";
        if (Number(company.id) !== 0) {
            queryFetch = `
                mutation{
                    updateCompany(
                        id:${company.id}, 
                        typeDoc:"6",
                        doc: "${company.doc}", 
                        shortName: "${company.shortName}", 
                        businessName: "${company.businessName}", 
                        address: "${company.address}", 
                        email: "${company.email}",
                        phone: "${company.phone}",
                        userSol: "${company.userSol}",
                        keySol: "${company.keySol}",
                        limit: ${company.limit},
                        emissionInvoiceWithPreviousDate: "${company.emissionInvoiceWithPreviousDate}",
                        emissionReceiptWithPreviousDate: "${company.emissionReceiptWithPreviousDate}",
                        logo: "${company.logo}"                       
                        includeIgv: ${company.includeIgv},
                        percentageIgv: ${company.percentageIgv},
                        isEnabled: ${company.isEnabled},
                        isProduction: ${company.isProduction},
                        passwordSignature: "${company.passwordSignature}",
                        certification: "${company.logo}",
                        certificationExpirationDate: "${company.certificationExpirationDate}",
                        withStock: ${company.withStock},
                        catalog: ${company.catalog},
                        invoiceF: ${company.invoiceF},
                        invoiceB: ${company.invoiceB},
                        guide: ${company.guide},
                        app: ${company.app},
                    ){
                        message
                    }
                }
            `;
            console.log(queryFetch)
            await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: queryFetch })
            })
                .then(res => res.json())
                .then(data => {
                    toast(data.data.updateCompany.message, { hideProgressBar: true, autoClose: 2000, type: 'success' })
                    setCompany(initialState);
                    fetchCompanies();
                    modal.hide();

                }).catch(e => console.log(e))
        }
        else {
            queryFetch = `
                mutation{
                    createCompany(
                        typeDoc:"6",
                        doc: "${company.doc}", 
                        shortName: "${company.shortName}", 
                        businessName: "${company.businessName}", 
                        address: "${company.address}", 
                        email: "${company.email}",
                        phone: "${company.phone}",
                        userSol: "${company.userSol}",
                        keySol: "${company.keySol}",
                        limit: ${company.limit},
                        emissionInvoiceWithPreviousDate: "${company.emissionInvoiceWithPreviousDate}",
                        emissionReceiptWithPreviousDate: "${company.emissionReceiptWithPreviousDate}",
                        logo: "${company.logo}"                       
                        includeIgv: ${company.includeIgv},
                        percentageIgv: ${company.percentageIgv},
                        isEnabled: ${company.isEnabled},
                        isProduction: ${company.isProduction},
                        passwordSignature: "${company.passwordSignature}",
                        certification: "${company.logo}",
                        certificationExpirationDate: "${company.certificationExpirationDate}",
                        withStock: ${company.withStock},
                        catalog: ${company.catalog},
                        invoiceF: ${company.invoiceF},
                        invoiceB: ${company.invoiceB},
                        guide: ${company.guide},
                        app: ${company.app},
                    ){
                        message
                    }
                }
            `;
            console.log(queryFetch)
            await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: queryFetch })
            })
                .then(res => res.json())
                .then(data => {
                    toast(data.data.createCompany.message, { hideProgressBar: true, autoClose: 2000, type: 'success' })
                    setCompany(initialState);
                    fetchCompanies();
                    modal.hide();
                }).catch(e => console.log(e))
        }


    }
    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]; // Obtiene el primer archivo seleccionado
        // Verifica si se seleccionó un archivo
        if (file) {
            const reader = new FileReader();

            // Cuando se carga el archivo, muestra la imagen en el componente
            reader.onload = (e: ProgressEvent<FileReader>) => {
                if (e.target?.result) {
                    // console.log(e.target?.result)
                    //   setUser({...user, avatar:e.target.result});
                    setCompany((prevCompany: any) => ({
                        ...prevCompany,
                        logo: e.target?.result as string // Asegúrate de definir el tipo correcto para e.target.result
                    }));
                }
            };
            reader.readAsDataURL(file);
        }
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
                                                    <input type="text" name="doc" id="doc" value={company.doc} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
                                                    <label htmlFor="doc" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Numero ruc</label>
                                                </div>
                                                <div className="relative z-0 w-full mb-2 group sm:col-span-1">
                                                    <input type="text" name="shortName" id="shortName" value={company.shortName} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
                                                    <label htmlFor="shortName" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Nombre comercial</label>
                                                </div>
                                                <div className="relative z-0 w-full mb-2 group sm:col-span-2">
                                                    <input type="text" name="businessName" id="businessName" value={company.businessName} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
                                                    <label htmlFor="businessName" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Razon Social</label>
                                                </div>
                                                <div className="relative z-0 w-full mb-2 group sm:col-span-2">
                                                    <input type="text" name="address" id="address" value={company.address} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
                                                    <label htmlFor="address" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Direccion</label>
                                                </div>
                                                <div className="relative z-0 w-full mb-2 group sm:col-span-1">
                                                    <input type="email" name="email" id="email" value={company.email} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
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
                                        <input type="text" name="userSol" id="userSol" value={company.userSol} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
                                        <label htmlFor="userSol" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Usuario Sol</label>
                                        </div>
                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                        <input type="text" name="keySol" id="keySol" value={company.keySol ? company.keySol : ''} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                                        <label htmlFor="keySol" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Clave Sol</label>
                                        </div>
                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">                                           
                                            <input
                                                type="date"
                                                value={company.certificationExpirationDate}
                                                onChange={handleInputChange}
                                                name="certificationExpirationDate"
                                                className="block pb-2 pt-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                                required
                                            />
                                             <label htmlFor="certificationExpirationDate" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Fecha expiración</label>
                                        </div>

                                        <div className="sm:col-span-2 relative z-0 w-full mb-2 group">                                        
                                        <input className="block pt-2.5 pb-1 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" id="default_size" type="file" />
                                        <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6" htmlFor="default_size">Certificado Digital</label>
                                        </div>
                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                        <input type="text" name="passwordSignature" id="passwordSignature" value={company.passwordSignature ? company.passwordSignature : ''} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder="" />
                                        <label htmlFor="passwordSignature" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Contraseña firma</label>
                                        </div>
                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">

                                        </div>
                                    </div>
                                </fieldset>

                                <fieldset>
                                    <legend className=' text-blue-600 font-semibold mb-2'>Configuraciones</legend>
                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                        <input type="number" step={1} min={0} name="limit" id="limit" value={company.limit!} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="block py-2.5 px-0 w-full text-right text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                                        <label htmlFor="limit" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Limite comprobantes</label>
                                        </div>
                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                        <input type="number" step={1} min={0} max={7} name="emissionInvoiceWithPreviousDate" id="emissionInvoiceWithPreviousDate" value={company.emissionInvoiceWithPreviousDate} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="text-right block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                                        <label htmlFor="emissionInvoiceWithPreviousDate" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Días atras(Facturas)</label>
                                        </div>
                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">                                           
                                        <input type="number" step={1} min={0} max={7} name="emissionReceiptWithPreviousDate" id="emissionReceiptWithPreviousDate" value={company.emissionReceiptWithPreviousDate!} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="block py-2.5 px-0 w-full text-right text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                                        <label htmlFor="emissionReceiptWithPreviousDate" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Días atras(Boletas)</label>
                                        </div>                                        
                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                        <select value={company.percentageIgv} name="percentageIgv" onChange={handleInputChange} className="text-right block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:bg-gray-700 dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" required>
                                            {/* <option selected>Porcentaje IGV %</option> */}
                                            <option value={18}>18%</option>
                                            <option value={10}>10% (Ley 31556)</option>
                                            <option value={4}>4% (IVAP)</option>
                                        </select>
                                        <label htmlFor="percentageIgv" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300  transform -translate-y-6 scale-75 top-3  origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Porcentaje IGV %</label>
                                        </div>


                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                        <label className="inline-flex items-center mb-1 cursor-pointer">
                                            <input type="checkbox" value="" id="isEnabled" name="isEnabled" className="sr-only peer" checked={company.isEnabled} onChange={handleCheckboxChange} />
                                            <div className="relative w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-500 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                            <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Estado Activo</span>
                                        </label>
                                        </div>
                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                        <label className="inline-flex items-center mb-1 cursor-pointer">
                                            <input type="checkbox" value="" id="includeIgv" name="includeIgv" className="sr-only peer" checked={company.includeIgv} onChange={handleCheckboxChange} />
                                            <div className="relative w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-500 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                            <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Incluir IGV</span>
                                        </label>
                                        </div>
                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                        <label className="inline-flex items-center mb-1 cursor-pointer">
                                            <input type="checkbox" value="" id="isProduction" name="isProduction" className="sr-only peer" checked={company.isProduction} onChange={handleCheckboxChange} />
                                            <div className="relative w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-500 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                            <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Producción</span>
                                        </label>
                                        </div>
                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                        <label className="inline-flex items-center mb-1 cursor-pointer">
                                            <input type="checkbox" value="" id="withStock" name="withStock" className="sr-only peer" checked={company.withStock} onChange={handleCheckboxChange} />
                                            <div className="relative w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-500 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                            <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Incluir Stock</span>
                                        </label>
                                        </div>

                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                        <label className="inline-flex items-center mb-1 cursor-pointer">
                                            <input type="checkbox" value="" id="invoiceF" name="invoiceF" className="sr-only peer" checked={company.invoiceF} onChange={handleCheckboxChange} />
                                            <div className="relative w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-500 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                            <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Incluir Factura</span>
                                        </label>
                                        </div>
                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                        <label className="inline-flex items-center mb-1 cursor-pointer">
                                            <input type="checkbox" value="" id="invoiceB" name="invoiceB" className="sr-only peer" checked={company.invoiceB} onChange={handleCheckboxChange} />
                                            <div className="relative w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-500 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                            <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Incluir Boleta</span>
                                        </label>
                                        </div>
                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                        <label className="inline-flex items-center mb-1 cursor-pointer">
                                            <input type="checkbox" value="" id="guide" name="guide" className="sr-only peer" checked={company.guide} onChange={handleCheckboxChange} />
                                            <div className="relative w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-500 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                            <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Incluir Guía</span>
                                        </label>
                                        </div>

                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                        <label className="inline-flex items-center mb-1 cursor-pointer">
                                            <input type="checkbox" value="" id="app" name="app" className="sr-only peer" checked={company.app} onChange={handleCheckboxChange} />
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
