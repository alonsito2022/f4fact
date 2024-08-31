"use client";
import { useState, useEffect, useMemo  } from "react";
import ProductList from './ProductList'
import ProductForm from "./ProductForm";
import ProductFilter from "./ProductFilter";
import ProductCriteriaForm from "./ProductCriteriaForm";
import Breadcrumb from "@/components/Breadcrumb"
import { Modal, ModalOptions } from 'flowbite'
import { useSession } from 'next-auth/react'
import { IUser, IProduct, ITypeAffectation } from '@/app/types';
import { toast } from "react-toastify";

const initialState = {
    id: 0,
    name: "",
    code: "",

    available: true,
    activeType: "01",
    ean: "",
    weightInKilograms: 0,

    minimumUnitId: 0,
    maximumUnitId: 0,
    maximumFactor: "",
    minimumFactor: "1",

    typeAffectationId: 0,
    typeAffectationName: "",
    subjectPerception: false,
    observation: "",
}

const initialStateFilterObj = {
    criteria: "name",
    searchText: "",
    supplierId: 0,
    lineId: 0,
    subLineId: 0,
    available: "A",
    activeType: "01", 
    subjectPerception: false, 
    typeAffectationId: 0,
}
function ProductPage() {
    const [products, setProducts] = useState< IProduct[]>([]);
    const [product, setProduct] = useState(initialState);
    const [modal, setModal] = useState<Modal | any>(null);
    const [modalCriteria, setModalCriteria] = useState<Modal | any>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [searchField, setSearchField] = useState<'name' | 'code' | 'ean'>('code');
    const [accessToken, setAccessToken] = useState<string>('');
    const [typeAffectations, setTypeAffectations] = useState<ITypeAffectation[]>([]);

    const [filterObj, setFilterObj] = useState(initialStateFilterObj);
    const { data: session } = useSession();
    const u = session?.user as IUser;

    async function fetchProductsByCriteria(){
        const queryFetch = `
                    query {
                        allProducts(
                            criteria: "${filterObj.criteria}",
                            searchText: "${filterObj.searchText}",
                            available: "${filterObj.available}",
                            activeType: "${filterObj.activeType}",
                            subjectPerception: ${filterObj.subjectPerception},
                            typeAffectationId: ${filterObj.typeAffectationId}
                        ){
                            id
                            code
                            name
                            available
                            activeType
                            activeTypeReadable
                            ean
                            weightInKilograms
                            
                            minimumUnitId
                            maximumUnitId
                            minimumUnitName
                            maximumUnitName
                            maximumFactor
                            minimumFactor

                            typeAffectationId
                            typeAffectationName
                            subjectPerception
                            observation
                        }
                    }
                `;
        await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `JWT ${accessToken}`
            },
            body: JSON.stringify({
                query: queryFetch
            })
        })
        .then(res=>res.json())
        .then(data=>{
            setProducts(data.data.allProducts);
            toast(`Se encontraron ${data.data.allProducts.length} resultados.`, { hideProgressBar: true, autoClose: 2000, type: 'info' })
        })
    }

    async function fetchProductById(pk: number=0){
        const queryFetch = `
                    {
                        productById(pk: ${pk}){
                            id
                            code
                            name

                            available
                            activeType
                            ean
                            weightInKilograms
                            
                            minimumUnitId
                            maximumUnitId
                            maximumFactor
                            minimumFactor

                            typeAffectationId
                            typeAffectationName
                            subjectPerception
                            observation
                        }
                    }
                `
                console.log(queryFetch)
        await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `JWT ${accessToken}`
            },
            body: JSON.stringify({
                query: queryFetch
            })
        })
        .then(res=>res.json())
        .then(data=>{
            if(data.data.productById){
                console.log(data.data.productById)
                let product = data.data.productById;
                if(!product.minimumUnitId){
                    product.minimumUnitId = 0
                    product.maximumUnitId = 0
                    product.maximumFactor = 0
                    product.minimumFactor = 1
                }
                product.maximumFactor = Number(product.maximumFactor);
                product.minimumFactor = Number(product.minimumFactor);
                setProduct(product);
            }
            
        })
    }

    
    async function fetchTypeAffectations() {
        console.log(accessToken)
        await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `JWT ${accessToken}`
            },
            body: JSON.stringify({
                query: `
                    query {
                        allTypeAffectations {
                            id
                            code
                            name
                            affectCode
                            affectName
                            affectType
                        }
                    }
                `
            })
        })
        .then(res => res.json())
        .then(data => {
            console.log(data.data.allTypeAffectations)
            setTypeAffectations(data.data.allTypeAffectations);
        })
    }

    const filteredProducts = useMemo(() => {
        return products?.filter((w:IProduct) => searchField === "name" ? w?.name?.toLowerCase().includes(searchTerm.toLowerCase()) : w?.code?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, searchField, products]);

    useEffect(() => {
        if (u !== undefined && u.token != undefined)
            setAccessToken(u.token);
    }, [u])

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
        
        if(modalCriteria == null){

            const $targetE2 = document.getElementById('modalCriteria');
            const options: ModalOptions = {
                placement: 'bottom-right',
                backdrop: 'static',
                backdropClasses: 'bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
                closable: false ,

            };

            setModalCriteria(new Modal($targetE2))
        }

  
    }, []);

    useEffect(() => {

        if (accessToken.length > 0) {

            fetchTypeAffectations();
        }
    }, [accessToken]);

    return (
        <>
            <div className="p-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 lg:mt-1.5 dark:bg-gray-800 dark:border-gray-700">
                <div className="w-full mb-1">
                    <Breadcrumb section={"Activos"} article={"Productos"} />
                    <ProductFilter modalCriteria={modalCriteria} searchTerm={searchTerm} setSearchTerm={setSearchTerm} searchField={searchField} setSearchField={setSearchField} modal={modal} initialState={initialState} setProduct={setProduct}  fetchProductsByCriteria={fetchProductsByCriteria} />
                </div>
            </div>

            <div className="flex flex-col">
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden shadow">
                            <ProductList filteredProducts={filteredProducts} modal={modal} fetchProductById={fetchProductById} />
                        </div>
                    </div>
                </div>
            </div>


            <ProductForm modal={modal} product={product} setProduct={setProduct} fetchProductsByCriteria={fetchProductsByCriteria} initialState={initialState} accessToken={accessToken} typeAffectations={typeAffectations} />
            <ProductCriteriaForm modalCriteria={modalCriteria} filterObj={filterObj} setFilterObj={setFilterObj} typeAffectations={typeAffectations} fetchProductsByCriteria={fetchProductsByCriteria} />
        </>
    )
    
}

export default ProductPage