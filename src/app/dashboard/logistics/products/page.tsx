"use client";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent ,useState, useEffect } from "react";
import { IProduct } from '@/app/types';
import { toast } from "react-toastify";
import { Modal, ModalOptions } from 'flowbite'

const initialState = {
    id: 0,
    code: 0,
    name: "",
    stockMin: 50,
    stockMax: 100,
    path: "",
    classification: "NA",
    isCollected: false,
    isPurchased: false,
    isManufactured: false,
    available: true,
}

const initialStateQualification = {
    "filter-qualification-1": false,
    "filter-qualification-2": false,
    "filter-qualification-3": false,
    "filter-qualification-4": false,
}

function ProductPage() {
    const router = useRouter();
    const options = [
        {id: '01', value: 'MATERIAS PRIMAS Y INGREDIENTES'}, 
        {id: '02', value: 'MATERIALES DE EMPAQUE'}, 
        {id: '03', value: 'PRODUCTOS DE LIMPIEZA Y DESINFECCIÓN'},  
        {id: '04', value: 'COMBUSTIBLES Y ENERGÍA'}, 
        {id: 'NA', value: 'NO APLICA'},
    ];
    const [products, setProducts] = useState< IProduct[]>([]);
    const [product, setProduct] = useState(initialState);
    const [qualifications, setQualifications] = useState(initialStateQualification);
    const [modal, setModal] = useState< Modal | any>(null);

    const filterProducts = ({target: { name, checked} }: ChangeEvent<HTMLInputElement>) => {
        setQualifications({...qualifications, [name]: checked});
    }

    const handleInputChange = ({target: {name, value} }: ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) => {
        setProduct({...product, [name]: value});
    }

    const handleCheckboxChange = ({target: { name, checked} }: ChangeEvent<HTMLInputElement>) => {
        setProduct({...product, [name]: checked});
    }

    const handleSaveProduct = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        let queryFetch: String = "";
        let operation: String = "create"
        if(Number(product.id)!==0){
            queryFetch = `
                mutation{
                    updateProduct(
                        id:${product.id}, code:${product.code}, name: "${product.name}", stockMin:${product.stockMin}, stockMax:${product.stockMax}, classification: "${product.classification}",
                        isCollected: ${product.isCollected}, isPurchased: ${product.isPurchased}, isManufactured: ${product.isManufactured}, available: ${product.available}
                    ){
                        product {
                            id
                            code
                            name
                            stockMin
                            stockMax 
                            path
                            classification
                            isCollected
                            isPurchased
                            isManufactured
                            available
                        }
                        message
                    }
                }
            `;
            
            await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
                method: 'POST',
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify({query: queryFetch})
            })
            .then(res=>res.json())
            .then(data=>{
                toast(data.data.updateProduct.message, { hideProgressBar: true, autoClose: 2000, type: 'success' })
                setProduct(initialState);
                modal.hide();
                fetchProducts();

            }).catch(e=>console.log(e))
        }
        else{
            queryFetch = `
                mutation{
                    createProduct(
                        code:${product.code}, name: "${product.name}", stockMin:${product.stockMin}, stockMax:${product.stockMax}, classification: "${product.classification}",
                        isCollected: ${product.isCollected}, isPurchased: ${product.isPurchased}, isManufactured: ${product.isManufactured}, available: ${product.available}
                    ){
                        product {
                            id
                            code
                            name
                            stockMin
                            stockMax 
                            path
                            classification
                            isCollected
                            isPurchased
                            isManufactured
                            available
                        }
                        message
                    }
                }
            `;
            await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
                method: 'POST',
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify({query: queryFetch})
            })
            .then(res=>res.json())
            .then(data=>{
                toast(data.data.createProduct.message, { hideProgressBar: true, autoClose: 2000, type: 'success' })
                setProduct(initialState);
                modal.hide();
                fetchProducts();

            }).catch(e=>console.log(e))
        }

        
        

    }

    async function fetchProducts(){
        // const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/manufacturing/api/v1/get_all_products/`);
        // const data = await res.json();
        // setProducts(data);
        await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
            method: 'POST',
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({
                query: `
                    query {
                        products {
                            id
                            code
                            name
                            stockMin
                            stockMax
                            path
                            classification
                            classificationReadable
                            isCollected
                            isPurchased
                            isManufactured
                            available
                            totalProductTariff
                        }
                    }
                `
            })
        })
        .then(res=>res.json())
        .then(data=>{
            setProducts(data.data.products);
        })
        
    }

    async function fetchProductByID(pk: number){

        /*const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/manufacturing/api/v1/get_product_by_id/`, {
            method: "POST", headers: { "Content-Type": "application/json",}, body: JSON.stringify({'productID': pk} as any)
        });
        const data = await res.json();
        setProduct(data);*/

        await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
            method: 'POST',
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({
                query: `
                    {
                        productById(pk: ${pk}){
                            id
                            code
                            name
                            stockMin
                            stockMax
                            path
                            classification
                            isCollected
                            isPurchased
                            isManufactured
                            available
                        }
                    }
                `
            })
        })
        .then(res=>res.json())
        .then(data=>{
            setProduct(data.data.productById);
        })
    }

    async function deleteProductByID(pk: number){
        
        await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
            method: 'POST',
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({
                query: `
                mutation {
                        deleteProduct(id: ${pk}) {
                            message
                        }
                    }
                `
            })
        })
        .then(res=>res.json())
        .then(data=>{
            toast(data.data.deleteProduct.message, { hideProgressBar: true, autoClose: 2000, type: 'success' })
            fetchProducts()
        })
        
    }

    useEffect(() => {
        
        if(modal == null){

            const $targetEl = document.getElementById('defaultModal');
            const options: ModalOptions = {
                placement: 'bottom-right',
                backdrop: 'static',
                backdropClasses: 'bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
                closable: false ,

            };

            setModal(new Modal($targetEl, options))
        }

        fetchProducts();
    }, []);


    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
            method: 'POST',
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({
                query: `
                    query {
                        qualificationOfProducts(
                            isCollected: ${qualifications["filter-qualification-1"]},
                            isPurchased: ${qualifications["filter-qualification-2"]},
                            isManufactured: ${qualifications["filter-qualification-3"]},
                            available: ${qualifications["filter-qualification-4"]}
                        ) {
                            id
                            code
                            name
                            stockMin
                            stockMax
                            path
                            classification
                            classificationReadable
                            isCollected
                            isPurchased
                            isManufactured
                            available
                            totalProductTariff
                        }
                    }
                `
            })
        })
        .then(res=>res.json())
        .then(data=>{
            setProducts(data.data.qualificationOfProducts)
        })

    }, [qualifications]);

    return (
        <>
        <h2 className="text-4xl font-bold dark:text-white pb-4">Productos del negocio</h2>

   


        <div className="p-4 relative overflow-x-auto shadow-md sm:rounded-lg">
            <div className="flex  justify-end pb-4 gap-2">
                <div>
                    
                    <label htmlFor="table-search" className="sr-only">Search</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path></svg>
                        </div>
                        <input type="text" id="table-search" className="block px-2 py-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search for items" />
                    </div>
                </div>
                <div>
                    <button id="dropdownRadioButton" data-dropdown-toggle="dropdownRadio" className="inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-3 py-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700" type="button">
                        <svg className="w-3 h-3 text-gray-500 dark:text-gray-400 mr-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm3.982 13.982a1 1 0 0 1-1.414 0l-3.274-3.274A1.012 1.012 0 0 1 9 10V6a1 1 0 0 1 2 0v3.586l2.982 2.982a1 1 0 0 1 0 1.414Z"/>
                            </svg>
                            Calificación
                        <svg className="w-2.5 h-2.5 ml-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
                        </svg>
                    </button>
                    
                    <div suppressHydrationWarning={true}  id="dropdownRadio" className="z-10 hidden w-48 bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700 dark:divide-gray-600" >
                        <ul className="p-3 space-y-1 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownRadioButton">
                            <li>
                                <div className="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600">
                                    <input id="filter-qualification-1" type="checkbox" onChange={filterProducts} checked={qualifications["filter-qualification-1"]} name="filter-qualification-1" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                    <label htmlFor="filter-qualification-1" className="w-full ml-2 text-sm font-medium text-gray-900 rounded dark:text-gray-300">Es elaborado</label>
                                </div>
                            </li>
                            <li>
                                <div className="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600">
                                    <input id="filter-qualification-2" type="checkbox" onChange={filterProducts} checked={qualifications["filter-qualification-2"]} name="filter-qualification-2" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                    <label htmlFor="filter-qualification-2" className="w-full ml-2 text-sm font-medium text-gray-900 rounded dark:text-gray-300">Es comprado</label>
                                </div>
                            </li>
                            <li>
                                <div className="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600">
                                    <input id="filter-qualification-3" type="checkbox" onChange={filterProducts} checked={qualifications["filter-qualification-3"]} name="filter-qualification-3" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                    <label htmlFor="filter-qualification-3" className="w-full ml-2 text-sm font-medium text-gray-900 rounded dark:text-gray-300">Es elaborado</label>
                                </div>
                            </li>
                            <li>
                                <div className="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600">
                                    <input id="filter-qualification-4" type="checkbox" onChange={filterProducts} checked={qualifications["filter-qualification-4"]} name="filter-qualification-4" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                    <label htmlFor="filter-qualification-4" className="w-full ml-2 text-sm font-medium text-gray-900 rounded dark:text-gray-300">Disponible</label>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

     
       
                <div >
                    <button id="btn-new" onClick={(e)=>{
                            modal.show();
                            document.getElementById("modal-title")!.innerHTML = "Nuevo producto";
                            document.getElementById("btn-save-product")!.innerHTML = "Guardar producto";
                            setProduct(initialState);

                    }} className="border block text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800" type="button">
                        Crear producto
                    </button>


                </div>

            </div>
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="px-2 py-2 text-center">#</th>
                        <th scope="col" className="px-2 py-2 text-center">NOMBRE</th>
                        <th scope="col" className="px-2 py-2 text-center">Clasificacion</th>
                        <th scope="col" className="px-2 py-2 text-center">ES elaborado?</th>
                        <th scope="col" className="px-2 py-2 text-center">Es comprado?</th>
                        <th scope="col" className="px-2 py-2 text-center">Es elaborado?</th>
                        <th scope="col" className="px-2 py-2 text-center">Disponible</th>
                        <th scope="col" className="px-2 py-2 text-center">AcCion</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((item) => 
                    <tr key={item.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <td className="w-4 px-2 py-2  bg-gray-50 dark:bg-gray-800">{item.code}</td>
                        <th scope="row" className="px-2 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">{item.name}</th>
                        <td className="px-2 py-2">{item.classificationReadable}</td>
                        <td className="px-2 py-2 text-center">{item.isCollected?"SI":"NO"}</td>
                        <td className="px-2 py-2 text-center bg-gray-50 dark:bg-gray-800">{item.isPurchased?"SI":"NO"}</td>
                        <td className="px-2 py-2 text-center">{item.isManufactured?"SI":"NO"}</td>
                        <td className="px-2 py-2 text-center bg-gray-50 dark:bg-gray-800">{item.available?"SI":"NO"}</td>
                        <td className="px-2 py-2 text-center">
                            <button type="button" onClick={ async ()=>{

                                    await fetchProductByID(item.id);
                                    modal.show();
                                    document.getElementById("modal-title")!.innerHTML = "Editar producto";
                                    document.getElementById("btn-save-product")!.innerHTML = "Actualizar producto";
                                }}
                                className="w-full block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                Editar
                            </button>
                            {item.totalProductTariff==0?
                            <button type="button" onClick={ ()=>{deleteProductByID(item.id)}} 
                                className="w-full block text-white bg-red-600 hover:bg-blue-900 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                   Quitar
                            </button>
                            
                            :""}
                            
                        
                        </td>
                    </tr>
                    )}
                </tbody>
            </table>
        </div>



<div id="defaultModal" tabIndex={-1} aria-hidden="true" className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-modal md:h-full">
    <div className="relative p-4 w-full max-w-2xl h-full md:h-auto mt-16">

        <div className="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
            
            <div className="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white" id="modal-title">
                    Editar Producto
                </h3>
                <button type="button" onClick={()=>{modal.hide();}} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white">
                    <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                    <span className="sr-only">Close modal</span>
                </button>
            </div>
            
            <form onSubmit={handleSaveProduct}>
                <input type="hidden" name="id" id="id" value={product.id} />
                <div className="grid gap-4 mb-4 sm:grid-cols-4">

                    <div className="sm:col-span-3">
                        <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nombre</label>
                        <input type="text" name="name" id="name" value={product.name} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Type product name" required />
                    </div>
                    <div>
                        <label htmlFor="code" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Codigo</label>
                        <input type="text" name="code" id="code" value={product.code} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Product brand" required />
                    </div>
                    <div>
                        <label htmlFor="stockMin" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">stock Min.</label>
                        <input type="number" name="stockMin" id="stockMin" value={product.stockMin} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="$2999" required />
                    </div>
                    <div>
                        <label htmlFor="stockMax" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">stock Max.</label>
                        <input type="number" name="stockMax" id="stockMax" value={product.stockMax} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="$2999" required />
                    </div>

                    <div className="sm:col-span-2">
                        <label htmlFor="classification" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Clasificacion</label>
                        <select name="classification" id="classification" onChange={handleInputChange} value={product.classification.replace("A_", "")} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            {options.map((o,k)=>(
                                <option key={k} value={o.id}>{o.value}</option>
                            ))}
                        </select>
                    </div>

                    <div className="sm:col-span-4 ">
                        <ul className="text-sm font-medium text-gray-900 bg-gray-50 border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <li className="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
                            <div className="flex items-center pl-3 w-full">
                                <input name="isCollected" id="isCollected" type="checkbox" checked={product.isCollected} onChange={handleCheckboxChange} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                <label htmlFor="isCollected" className="w-full py-3 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Es recolectado</label>
                            </div></li>
                            <li className="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
                            <div className="flex items-center pl-3">
                                <input name="isPurchased" id="isPurchased" type="checkbox" checked={product.isPurchased} onChange={handleCheckboxChange} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                <label htmlFor="isPurchased" className="w-full py-3 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Es comprado</label>
                            </div></li>
                            <li className="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
                            <div className="flex items-center pl-3">
                                <input name="isManufactured" id="isManufactured" type="checkbox" checked={product.isManufactured} onChange={handleCheckboxChange} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                <label htmlFor="isManufactured" className="w-full py-3 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Es elaborado</label>
                            </div></li>
                            <li className="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
                            <div className="flex items-center pl-3">
                                <input name="available" id="available" type="checkbox" checked={product.available} onChange={handleCheckboxChange} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                <label htmlFor="available" className="w-full py-3 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Disponible</label>
                            </div></li>
                        </ul>
                    </div>
                </div>

                 


                <button id="btn-save-product" type="submit" className="text-white inline-flex items-center bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 ">
                    <svg className="mr-1 -ml-1 w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path></svg>
                    Actualizar producto
                </button>
            </form>
        </div>
    </div>
</div>


        </>
        

    )
}

export default ProductPage