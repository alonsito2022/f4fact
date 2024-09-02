"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import ProductList from './ProductList'
import ProductForm from "./ProductForm";
import ProductFilter from "./ProductFilter";
import ProductCriteriaForm from "./ProductCriteriaForm";
import Breadcrumb from "@/components/Breadcrumb"
import { Modal, ModalOptions } from 'flowbite'
import { useSession } from 'next-auth/react'
import { IUser, IProduct, ITypeAffectation } from '@/app/types';
import { toast } from "react-toastify";
import { gql, useLazyQuery, useQuery } from "@apollo/client";

const initialState = {
    id: 0,
    name: "",
    code: "",

    available: true,
    activeType: "01",
    ean: "",
    weightInKilograms: 0,

    typeAffectationId: 0,
    subjectPerception: false,
    observation: "",

    priceWithIgv1: 0,
    priceWithoutIgv1: 0,

    priceWithIgv2: 0,
    priceWithoutIgv2: 0,

    priceWithIgv3: 0,
    priceWithoutIgv3: 0,

    minimumUnitId: 0,
    maximumUnitId: 0,
    maximumFactor: "1",
    minimumFactor: "1",
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
    limit: 50
}

const PRODUCTS_QUERY = gql`
    query ($criteria: String!, $searchText: String!, $available: String!, $activeType: String!, $subjectPerception: Boolean!, $typeAffectationId: Int!, $limit: Int!) {
        allProducts(
            criteria: $criteria
            searchText: $searchText
            available: $available
            activeType: $activeType
            subjectPerception: $subjectPerception
            typeAffectationId: $typeAffectationId
            limit: $limit
        ) {
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

function ProductPage() {
    const [products, setProducts] = useState<IProduct[]>([]);
    const [product, setProduct] = useState(initialState);
    const [modal, setModal] = useState<Modal | any>(null);
    const [modalCriteria, setModalCriteria] = useState<Modal | any>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [searchField, setSearchField] = useState<'name' | 'code' | 'ean'>('code');
    const [accessToken, setAccessToken] = useState<string>('');
    const [typeAffectations, setTypeAffectations] = useState<ITypeAffectation[]>([]);

    const [filterObj, setFilterObj] = useState(initialStateFilterObj);
    const { data: session } = useSession();
    const [jwtToken, setJwtToken] = useState<string | null>(null);
    const u = session?.user as IUser;

    useEffect(() => {
        if (session?.user) {
            const user = session.user as IUser;
            setJwtToken(user.accessToken as string);
        }
    }, [session]);

    // const { loading: productsLoading, error: productsError, data: productsData } = useQuery(PRODUCTS_QUERY, {
    //     context: {
    //         headers: {
    //             "Content-Type": "application/json",
    //             "Authorization": jwtToken ? `JWT ${jwtToken}` : "",
    //         },
    //     },
    //     skip: !jwtToken, // Esto evita que la consulta se ejecute si no hay token
    //     variables: {
    //         criteria: filterObj.criteria, searchText: filterObj.searchText,
    //         available: filterObj.available, activeType: filterObj.activeType,
    //         subjectPerception: filterObj.subjectPerception, typeAffectationId: Number(filterObj.typeAffectationId), limit: Number(filterObj.limit)
    //     },
    //     onError: (err) => console.error("Error in products:", err),
    // });

    const [productsQuery, { loading: filteredProductsLoading, error: filteredProductsError, data: filteredProductsData }] = useLazyQuery(PRODUCTS_QUERY, {
        context: {
            headers: {
                "Content-Type": "application/json",
                "Authorization": jwtToken ? `JWT ${jwtToken}` : "",
            },
        },
        variables: {
            criteria: filterObj.criteria, searchText: filterObj.searchText,
            available: filterObj.available, activeType: filterObj.activeType,
            subjectPerception: filterObj.subjectPerception, typeAffectationId: Number(filterObj.typeAffectationId), limit: Number(filterObj.limit)
        },
        onCompleted: (data) => {
          if (data.allProducts) {
            setProducts(data?.allProducts)
          }
        },
        onError: (err) => console.error("Error in products:", err),
      });


    const fetchProducts = () => {
        setProducts([]);
        productsQuery();

    };

    // useEffect(() => {
    //     if (productsData?.allProducts)
    //         setProducts(productsData?.allProducts)
    // }, [productsData]);

    // async function fetchProducts() {
    //     const queryFetch = `
    //                 query {
    //                     allProducts(
    //                         criteria: "${filterObj.criteria}",
    //                         searchText: "${filterObj.searchText}",
    //                         available: "${filterObj.available}",
    //                         activeType: "${filterObj.activeType}",
    //                         subjectPerception: ${filterObj.subjectPerception},
    //                         typeAffectationId: ${filterObj.typeAffectationId},
    //                         limit: ${filterObj.limit},
    //                     ){
    //                         id
    //                         code
    //                         name
    //                         available
    //                         activeType
    //                         activeTypeReadable
    //                         ean
    //                         weightInKilograms
                            
    //                         minimumUnitId
    //                         maximumUnitId
    //                         minimumUnitName
    //                         maximumUnitName
    //                         maximumFactor
    //                         minimumFactor

    //                         typeAffectationId
    //                         typeAffectationName
    //                         subjectPerception
    //                         observation
    //                     }
    //                 }
    //             `;
    //     console.log(queryFetch)
    //     await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
    //         method: 'POST',
    //         headers: {
    //             "Content-Type": "application/json",
    //             "Authorization": `JWT ${accessToken}`
    //         },
    //         body: JSON.stringify({
    //             query: queryFetch
    //         })
    //     })
    //         .then(res => res.json())
    //         .then(data => {
    //             setProducts(data.data.allProducts);
    //             toast(`Se encontraron ${data.data.allProducts.length} resultados.`, { hideProgressBar: true, autoClose: 2000, type: 'info' })
    //         })
    // }

    async function fetchProductById(pk: number = 0) {
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
            .then(res => res.json())
            .then(data => {
                if (data.data.productById) {
                    console.log(data.data.productById)
                    let product = data.data.productById;
                    if (!product.minimumUnitId) {
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
        await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `JWT ${jwtToken}`
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
                setTypeAffectations(data.data.allTypeAffectations);
            })
    }

    const filteredProducts = useMemo(() => {
        return products?.filter((w: IProduct) => searchField === "name" ? w?.name?.toLowerCase().includes(searchTerm.toLowerCase()) : w?.code?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, searchField, products]);

    useEffect(() => {
        if (u !== undefined && u.accessToken != undefined)
            setAccessToken(u.accessToken);
    }, [u])

    useEffect(() => {

        if (modal == null) {

            const $targetEl = document.getElementById('defaultModal');
            const options: ModalOptions = {
                placement: 'bottom-right',
                backdrop: 'static',
                backdropClasses: 'bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
                closable: false,

            };

            setModal(new Modal($targetEl, options))
        }

        if (modalCriteria == null) {

            const $targetE2 = document.getElementById('modalCriteria');
            const options: ModalOptions = {
                placement: 'bottom-right',
                backdrop: 'static',
                backdropClasses: 'bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
                closable: false,

            };

            setModalCriteria(new Modal($targetE2))
        }


    }, []);

    useEffect(() => {
        if (jwtToken) {
            fetchTypeAffectations();
        }
    }, [jwtToken]);

    return (
        <>
            <div className="p-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 lg:mt-1.5 dark:bg-gray-800 dark:border-gray-700">
                <div className="w-full mb-1">
                    <Breadcrumb section={"Productos"} article={"Productos"} />
                    <ProductFilter filterObj={filterObj} setFilterObj={setFilterObj} modalCriteria={modalCriteria} searchTerm={searchTerm} setSearchTerm={setSearchTerm} searchField={searchField} setSearchField={setSearchField} modal={modal} initialState={initialState} 
                    setProduct={setProduct} fetchProducts={fetchProducts} />
                </div>
            </div>

            <div className="flex flex-col">
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden shadow">
                        {filteredProductsLoading ? <div>Cargando...</div> : 
                        filteredProductsError? <div>Error: No autorizado o error en la consulta. {filteredProductsError.message}</div> 
                        : <ProductList filteredProducts={filteredProducts} modal={modal} setProduct={setProduct} jwtToken={jwtToken} />}
                            
                        </div>
                    </div>
                </div>
            </div>


            <ProductForm modal={modal} product={product} setProduct={setProduct} initialState={initialState} 
            jwtToken={jwtToken} typeAffectations={typeAffectations} PRODUCTS_QUERY={PRODUCTS_QUERY} filterObj={filterObj} />
            <ProductCriteriaForm modalCriteria={modalCriteria} filterObj={filterObj} setFilterObj={setFilterObj} typeAffectations={typeAffectations} fetchProducts={fetchProducts} />
        </>
    )

}

export default ProductPage