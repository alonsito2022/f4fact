import { ChangeEvent, FormEvent ,useState, useEffect } from "react";
import { Modal, ModalOptions } from 'flowbite'
import { toast } from "react-toastify";
import { ICompany } from '@/app/types';
function SubsidiaryModal({modal, setModal, subsidiary, setSubsidiary, initialState, fetchSubsidiaries}:any) {
    const [companies, setCompanies] = useState< ICompany[]>([]);

    const handleInputChange = ({target: {name, value} }: ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) => {
        setSubsidiary({...subsidiary, [name]: value});
    }

    const handleSaveSubsidiary = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        let queryFetch: String = "";
        if(Number(subsidiary.id)!==0){
            queryFetch = `
                mutation{
                    updateSubsidiary(
                        id:${subsidiary.id}, serial: "${subsidiary.serial}", name: "${subsidiary.name}", address: "${subsidiary.address}", phone: "${subsidiary.phone}", ubigeo: "${subsidiary.ubigeo}", companyId: ${subsidiary.companyId}
                    ){
                        message
                    }
                }
            `;
            console.log(queryFetch)
            await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
                method: 'POST',
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify({query: queryFetch})
            })
            .then(res=>res.json())
            .then(data=>{
                toast(data.data.updateSubsidiary.message, { hideProgressBar: true, autoClose: 2000, type: 'success' })
                setSubsidiary(initialState);
                fetchSubsidiaries();
                modal.hide();

            }).catch(e=>console.log(e))
        }
        else{
            queryFetch = `
                mutation{
                    createSubsidiary(
                      serial: "${subsidiary.serial}", name: "${subsidiary.name}", address: "${subsidiary.address}", phone: "${subsidiary.phone}", ubigeo: "${subsidiary.ubigeo}", companyId: ${subsidiary.companyId}
                    ){
                        message
                    }
                }
            `;
            console.log(queryFetch)
            await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
                method: 'POST',
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify({query: queryFetch})
            })
            .then(res=>res.json())
            .then(data=>{
                toast(data.data.createSubsidiary.message, { hideProgressBar: true, autoClose: 2000, type: 'success' })
                setSubsidiary(initialState);
                fetchSubsidiaries();
                modal.hide();
            }).catch(e=>console.log(e))
        }


    }    

    async function fetchCompanies(){
        await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
            method: 'POST',
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({
                query: `
                    {
                        companies {
                            id
                            businessName
                        }
                    }
                `                
            })            
        })
        .then(res=>res.json())
        .then(data=>{
            setCompanies(data.data.companies);
        })
    }
    useEffect(() => {        
        if(modal == null){
            const $targetEl = document.getElementById('subsidiary-modal');
            const options: ModalOptions = {
                placement: 'bottom-right',
                backdrop: 'static',
                backdropClasses: 'bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
                closable: false 
            };
            setModal(new Modal($targetEl, options))
        }
        fetchCompanies()
      }, []);
  return (
    <div>
      <div id="subsidiary-modal" tabIndex={-1} aria-hidden="true" className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
        <div className="relative p-4 w-full max-w-lg max-h-full">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {subsidiary.id ? <p>Actualizar Local</p> : <p>Registrar Nuevo Local</p>}
                    </h3>
                    <button type="button" onClick={(e)=>{modal.hide();setSubsidiary(initialState);}} className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                        </svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                </div>
                <div className="p-4 md:p-5">
                    <form onSubmit={handleSaveSubsidiary}>               
                    <div className="grid md:grid-cols-2 md:gap-6">
                        <div className="relative z-0 w-full mb-6 group">
                            <input type="text" name="serial" id="serial" value={subsidiary.serial} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
                            <label htmlFor="serial" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Serie Local</label>
                        </div>
                        <div className="relative z-0 w-full mb-6 group">
                            <input type="text" name="name" id="name" value={subsidiary.name} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
                            <label htmlFor="name" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Nombre Local</label>
                        </div>
                    </div>     
                    <div className="relative z-0 w-full mb-6 group">
                            <input type="text" name="address" id="address" value={subsidiary.address?subsidiary.address:''} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                            <label htmlFor="address" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Direccion</label>
                    </div>               
                    <div className="grid md:grid-cols-2 md:gap-6">
                      <div className="relative z-0 w-full mb-6 group">
                          <input type="text" name="ubigeo" id="ubigeo" value={subsidiary.ubigeo?subsidiary.ubigeo:''} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                          <label htmlFor="ubigeo" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Ubigeo Local</label>
                      </div> 
                      <div className="relative z-0 w-full mb-6 group">
                          <input type="text" name="phone" id="phone" value={subsidiary.phone?subsidiary.phone:''} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" "/>
                          <label htmlFor="phone" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Telefono/Celular</label>
                      </div>
                    </div>  
                                           
                    <div className="grid md:grid-cols-2 md:gap-6">
                        <label htmlFor="companyId" className="sr-only">Empresa</label>
                        <select id="companyId" name="companyId" onChange={handleInputChange} value={subsidiary.companyId} className="block py-2.5 px-0 w-full text-sm text-gray-500 bg-transparent border-0 border-b-2 border-gray-200 appearance-none dark:text-gray-400 dark:border-gray-700 focus:outline-none focus:ring-0 focus:border-gray-200 peer">
                        {companies?.map((o,k)=>(
                                <option key={k} value={o.id}>{o.businessName}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="btn-blue">{subsidiary.id? <p>Actualizar Datos de Local</p> : <p>Crear Datos de Local</p>}</button>
                    </form>
                </div>
            </div>
        </div>
    </div> 
    </div>
  )
}

export default SubsidiaryModal
