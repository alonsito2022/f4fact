import { ChangeEvent, FormEvent ,useState, useEffect } from "react";
import { toast } from "react-toastify";

export interface ICompany {
    id?: number
    name?: string
}

export interface ISubsidiary {
    id?: number
    name?: string
    business_name?: string
    address?: string
    phone?: string
    ruc?: string
    company?: ICompany
}

function WarehouseForm({modal, warehouse, setWarehouse, fetchWarehouses, initialState}: any) {
    const [subsidiaries, setSubsidiaries] = useState<ISubsidiary[]>([]);

    const handleInputChange = ({target: {name, value} }: ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) => {
        if(name==="category"){
            setWarehouse({...warehouse, [name]: value, truckLicensePlate: ""});
        }else{
            setWarehouse({...warehouse, [name]: value});
        }
        
    }

    const handleSaveSubLine = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        let queryFetch: String = "";
        if(Number(warehouse.id)!==0){
            queryFetch = `
                mutation{
                    updateWarehouse(
                        id:${warehouse.id}, 
                        name: "${warehouse.name}", subsidiaryId: ${warehouse.subsidiaryId}, 
                        truckLicensePlate: "${warehouse.truckLicensePlate}", category: "${warehouse.category.replace("A_","")}"
                    ){
                        message
                    }
                }
            `;
            await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    // "Authorization": `JWT ${Cookies.get('accessToken')}`
                },
                body: JSON.stringify({query: queryFetch})
            })
            .then(res=>res.json())
            .then(data=>{
                toast(data.data.updateWarehouse.message, { hideProgressBar: true, autoClose: 2000, type: 'success' })
                setWarehouse(initialState);
                modal.hide();
                fetchWarehouses();

            }).catch(e=>console.log(e))
        }
        else{
            queryFetch = `
                mutation{
                    createWarehouse(
                        name: "${warehouse.name}", subsidiaryId: ${warehouse.subsidiaryId}, 
                        truckLicensePlate: "${warehouse.truckLicensePlate}", category: "${warehouse.category}"
                    ){
                        message
                    }
                }
            `;
            await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    // "Authorization": `JWT ${Cookies.get('accessToken')}`
                },
                body: JSON.stringify({query: queryFetch})
            })
            .then(res=>res.json())
            .then(data=>{
                toast(data.data.createWarehouse.message, { hideProgressBar: true, autoClose: 2000, type: 'success' })
                setWarehouse(initialState);
                modal.hide();
                fetchWarehouses();

            }).catch(e=>console.log(e))
        }

    }
    
    async function fetchSubsidiaries() {
        let queryfetch = `
                    query {
                        subsidiaries {
                            id
                            name
                        }
                    }
                `;
        await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                // "Authorization": `JWT ${Cookies.get('accessToken')}`
            },
            body: JSON.stringify({
                query: queryfetch
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.data.subsidiaries)
                setSubsidiaries(data.data.subsidiaries);
        })
    }
    

    useEffect(() => {
        
        // if(Cookies.get('accessToken')) {
        //     fetchSubsidiaries();
        // }

    }, []);

    return (
        <>
            <div id="defaultModal" tabIndex={-1} aria-hidden="true" className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-modal md:h-full">
                <div className="relative p-4 w-full max-w-2xl h-full md:h-auto mt-16">

                    <div className="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
                        
                        <div className="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white" id="modal-title">
                                Editar
                            </h3>
                            <button type="button" id="btn-close-modal" 
                            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white" 
                            onClick={()=>{modal.hide();}} >
                                <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>
                        
                        <form onSubmit={handleSaveSubLine}>
                            <input type="hidden" name="id" id="id" value={warehouse.id} />

                            <div className="sm:col-span-2 mb-2">
                                <label htmlFor="name" className="form-label">Nombre</label>
                                <input type="text" name="name" id="name" maxLength={45} value={warehouse.name||""} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="form-control" required autoComplete="off" />
                            </div>

                            <div className="sm:col-span-2 mb-2">
                                <label htmlFor="subsidiaryId" className="form-label">Sede</label>
                                <select name="subsidiaryId" id="subsidiaryId" onChange={handleInputChange} value={warehouse.subsidiaryId} className="form-control" required>
                                    <option value={0}>Elegir sede</option>
                                    {subsidiaries.map((o: ISubsidiary,k: number)=>(
                                        <option key={k} value={o.id}>{o.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="sm:col-span-2 mb-2">
                                <label htmlFor="category" className="form-label">Categoria</label>
                                <select name="category" id="category" onChange={handleInputChange} value={warehouse.category.replace("A_","")} className="form-control" required>
                                    <option value={"01"}>VENTA</option>
                                    <option value={"02"}>VEHICULO</option>
                                    <option value={"NA"}>NO APLICA</option>
                                </select>
                            </div>



                            <div className="sm:col-span-4 text-right">
                                <button id="btn-save" type="submit" className="btn-blue px-2 py-2">
                                    Actualizar
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export default WarehouseForm
