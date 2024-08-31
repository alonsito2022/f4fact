import { IUnit, ITypeAffectation } from "@/app/types";
import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { toast } from "react-toastify";
import Save from '@/components/icons/Save';

function ProductForm({ modal, product, setProduct, fetchProductsByCriteria, initialState, accessToken, typeAffectations }: any) {
    const [units, setUnits] = useState<IUnit[]>([]);

    async function fetchUnits() {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `JWT ${accessToken}`
            },
            body: JSON.stringify({
                query: `
                    query {
                        allUnits {
                            id
                            shortName
                        }
                    }
                `
            })
        })
        .then(res => res.json())
        .then(data => {
            setUnits(data.data.allUnits);
        })
    }

    const handleInputChange = ({ target: { name, value } }: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setProduct({ ...product, [name]: value });
    }

    const handleCheckboxChange = ({ target: { name, checked } }: ChangeEvent<HTMLInputElement>) => {
        setProduct({ ...product, [name]: checked });
    }

    const handleSaveProduct = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (Number(product.minimumFactor) === 0) {
            toast('Por favor ingrese un factor para la unidad minima.', { hideProgressBar: true, autoClose: 2000, type: 'warning' })
            return;
        }

        let queryFetch: String = "";
        if (Number(product.id) !== 0) {
            queryFetch = `
                mutation{
                    updateProduct(id:${product.id}, code: "${product.code}", name: "${product.name}", 
                    available: ${product.available}, activeType: "${product.activeType.replace("A_", "")}", ean: "${product.ean}", weightInKilograms: ${product.weightInKilograms}, 
                    maximumFactor: ${Number(product.maximumFactor)},minimumFactor: ${Number(product.minimumFactor)}, minimumUnitId: ${product.minimumUnitId}, maximumUnitId: ${product.maximumUnitId}, 
                    typeAffectationId: ${product.typeAffectationId}, subjectPerception: ${product.subjectPerception}, observation: "${product.observation}"){
                        message
                    }
                }
            `;
            console.log(queryFetch)
            await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `JWT ${accessToken}`
                },
                body: JSON.stringify({ query: queryFetch })
            })
                .then(res => res.json())
                .then(data => {
                    toast(data.data.updateProduct.message, { hideProgressBar: true, autoClose: 2000, type: 'success' })
                    setProduct({
                        ...product,
                        id: 0,
                        code: "",
                        name: "",

                        available: true,
                        activeType: "01",
                        ean: "",
                        weightInKilograms: 0,
                        
                        minimumUnitId: 0,
                        maximumUnitId: 0,
                        minimumFactor: 1,
                        maximumFactor: 0,

                        typeAffectationId: 0,
                        subjectPerception: false,
                        observation: ""
                    });
                    modal.hide();
                    fetchProductsByCriteria();

                }).catch(e => console.log(e))
        }
        else {

            queryFetch = `
                mutation{
                    createProduct(code: "${product.code}", name: "${product.name}", 
                    available: ${product.available}, activeType: "${product.activeType.replace("A_", "")}", ean: "${product.ean}", weightInKilograms: ${product.weightInKilograms}, 
                    maximumFactor: ${Number(product.maximumFactor)},minimumFactor: ${Number(product.minimumFactor)}, minimumUnitId: ${product.minimumUnitId}, maximumUnitId: ${product.maximumUnitId}, 
                    typeAffectationId: ${product.typeAffectationId}, subjectPerception: ${product.subjectPerception}, observation: "${product.observation}"){
                        message
                    }
                }
            `;
            console.log(queryFetch)

            await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `JWT ${accessToken}`
                },
                body: JSON.stringify({ query: queryFetch })
            })
                .then(res => res.json())
                .then(data => {
                    toast(data.data.createProduct.message, { hideProgressBar: true, autoClose: 2000, type: 'success' })
                    setProduct({
                        ...product,
                        id: 0,
                        code: "",
                        name: "",

                        available: true,
                        activeType: "01",
                        ean: "",
                        weightInKilograms: 0,
                        
                        minimumUnitId: 0,
                        maximumUnitId: 0,
                        minimumFactor: 1,
                        maximumFactor: 0,
                        
                        typeAffectationId: 0,
                        subjectPerception: false,
                        observation: ""
                    });
                    modal.hide();
                    fetchProductsByCriteria();

                }).catch(e => console.log(e))
        }
    }

    useEffect(() => {

        if (accessToken.length > 0) {
            fetchUnits();
            
        }
    }, [accessToken]);

    return (
        <>
            <div id="defaultModal" tabIndex={-1} aria-hidden="true" className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-modal md:h-full">
                <div className="relative w-full max-w-lg max-h-full">

                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">

                        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white" id="modal-title">
                            {Number(product.id) > 0 ? "Editar" : "Registrar nuevo producto"}
                            </h3>
                            <button type="button" id="btn-close-modal"
                                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                                onClick={() => { modal.hide(); }} >
                                <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>

                        <form onSubmit={handleSaveProduct}>

                            <div className="p-4 md:p-5 space-y-4">
                                <input type="hidden" name="id" id="id" value={product.id} />


                                <div className="grid gap-4 mb-4 sm:grid-cols-6">

                                    <div className="sm:col-span-2">
                                        <label htmlFor="code" className="form-label">Codigo</label>
                                        <input type="text" name="code" id="code" maxLength={20} value={product.code || ""} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="form-control-sm" required autoComplete="off" />
                                    </div>

                                    <div className="sm:col-span-4">
                                        <label htmlFor="name" className="form-label">Nombre</label>
                                        <input type="text" name="name" id="name" maxLength={100} value={product.name} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="form-control-sm" placeholder="Escriba un nombre aquí" required autoComplete="off" />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label htmlFor="activeType" className="form-label">Tipo</label>
                                        <select name="activeType" id="activeType" onChange={handleInputChange} value={product.activeType.replace("A_", "")} className="form-control-sm" required>
                                            <option value={"01"}>PRODUCTO</option>
                                            <option value={"02"}>REGALO</option>
                                            <option value={"03"}>SERVICIO</option>
                                        </select>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label htmlFor="ean" className="form-label">EAN</label>
                                        <input type="text" name="ean" id="ean" maxLength={20} value={product.ean} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="form-control-sm" required />
                                    </div>


                                    <div className="sm:col-span-2">
                                        <label htmlFor="weightInKilograms" className="form-label">Peso (Kg)</label>
                                        <input type="number" name="weightInKilograms" id="weightInKilograms" value={product.weightInKilograms} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="form-control-sm" required />
                                    </div>


                                    <div className="sm:col-span-6">
                                        <label htmlFor="typeAffectationId" className="form-label">Tipo afectacion</label>
                                        <select name="typeAffectationId" id="typeAffectationId" onChange={handleInputChange} value={product.typeAffectationId} className="form-control-sm" required>
                                            <option value={0}>Elegir tipo de afectacion</option>
                                            {typeAffectations?.map((o: ITypeAffectation, k: number) => (
                                                <option key={k} value={o.id}>{o.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label htmlFor="minimumUnitId" className="form-label">Unidad Minima</label>
                                        <select name="minimumUnitId" id="minimumUnitId" onChange={handleInputChange} value={product.minimumUnitId} className="form-control-sm" required>
                                            <option value={0}>Elegir unidad</option>
                                            {units?.map((o: IUnit, k: number) => (
                                                <option key={k} value={o.id}>{o.shortName}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="sm:col-span-3">
                                        <label htmlFor="maximumUnitId" className="form-label">Unidad Maxima</label>
                                        <select name="maximumUnitId" id="maximumUnitId" onChange={handleInputChange} value={product.maximumUnitId} className="form-control-sm" required>
                                            <option value={0}>Elegir unidad</option>
                                            {units?.map((o: IUnit, k: number) => (
                                                <option key={k} value={o.id}>{o.shortName}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label htmlFor="minimumFactor" className="form-label">Factor Minimo</label>
                                        <input type="number" name="minimumFactor" id="minimumFactor" value={product.minimumFactor} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="form-control-sm" required />
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label htmlFor="maximumFactor" className="form-label">Factor Maximo</label>
                                        <input type="number" name="maximumFactor" id="maximumFactor" value={product.maximumFactor} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="form-control-sm" required />
                                    </div>


                                    <div className="sm:col-span-3 mb-2">
                                        <input id="subjectPerception3" name="subjectPerception" checked={product.subjectPerception} type="checkbox" onChange={handleCheckboxChange} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                        <label htmlFor="subjectPerception3" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Sujeto a percepcion</label>
                                    </div>

                                    <div className="sm:col-span-3 mb-2">
                                        <input id="available3" name="available" checked={product.available} type="checkbox" onChange={handleCheckboxChange} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                        <label htmlFor="available3" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Activo</label>
                                    </div>

                                    <div className="sm:col-span-6 mb-2">
                                        <label htmlFor="observation3" className="form-label">Observación</label>
                                        <textarea
                                            id="observation3"
                                            name='observation'
                                            rows={5}
                                            className='form-control-sm'
                                            maxLength={500}
                                            onChange={handleInputChange}
                                            value={product.observation || ""}
                                            onFocus={(e) => e.target.select()}
                                            placeholder='Escribe un comentario aquí'
                                        ></textarea>
                                    </div>


                                </div>



                            </div>
                            <div className="flex p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600  justify-end">
                                <button id="btn-save" type="submit" className="btn-green px-5 py-2 inline-flex items-center gap-2">
                                    <Save />{Number(product.id) > 0 ? "Actualizar" : "Guardar"}
                                </button>
                            </div>


                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ProductForm
