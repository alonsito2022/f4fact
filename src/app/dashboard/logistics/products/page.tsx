"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import ProductList from './ProductList'
import ProductForm from "./ProductForm";
import ProductFilter from "./ProductFilter";
import ProductCriteriaForm from "./ProductCriteriaForm";
import Breadcrumb from "@/components/Breadcrumb"
import { useSession } from 'next-auth/react'
import { IUser, IProduct, ITypeAffectation } from '@/app/types';
import { Modal, ModalOptions } from 'flowbite'
import { gql, useLazyQuery, useQuery } from "@apollo/client";

const initialStateProduct = {
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

const initialStateProductFilterObj = {
    criteria: "name",
    searchText: "",
    supplierId: 0,
    lineId: 0,
    subLineId: 0,
    available: true,
    activeType: "01",
    subjectPerception: false,
    typeAffectationId: 0,
    limit: 50
}

const PRODUCTS_QUERY = gql`
    query ($criteria: String!, $searchText: String!, $available: Boolean!, $activeType: String!, $subjectPerception: Boolean!, $typeAffectationId: Int!, $limit: Int!) {
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
    
const TYPE_AFFECTATION_QUERY = gql`
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
`;

function ProductPage() {
    const [products, setProducts] = useState<IProduct[]>([]);
    const [product, setProduct] = useState(initialStateProduct);
    const [modalProduct, setModalProduct] = useState<Modal | any>(null);
    const [modalCriteria, setModalCriteria] = useState<Modal | any>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [searchField, setSearchField] = useState<'name' | 'code' | 'ean'>('code');
    const [productFilterObj, setProductFilterObj] = useState(initialStateProductFilterObj);
    const { data: session } = useSession();
    const [jwtToken, setJwtToken] = useState<string | null>(null);
    const u = session?.user as IUser;

    useEffect(() => {
        if (session?.user) {
            const user = session.user as IUser;
            setJwtToken(user.accessToken as string);
        }
    }, [session]);

    const getAuthContext = () => ({
        headers: {
            "Content-Type": "application/json",
            "Authorization": jwtToken ? `JWT ${jwtToken}` : "",
        },
    });

    const { loading: typeAffectationsLoading, error: typeAffectationsError, data: typeAffectationsData } = useQuery(TYPE_AFFECTATION_QUERY, {
        context: getAuthContext(),
        skip: !jwtToken, // Esto evita que la consulta se ejecute si no hay token
        onError: (err) => console.error("Error in typeAffectations:", err),
    });

    const [productsQuery, { loading: filteredProductsLoading, error: filteredProductsError, data: filteredProductsData }] = useLazyQuery(PRODUCTS_QUERY, {
        context: getAuthContext(),
        variables: {
            criteria: productFilterObj.criteria, searchText: productFilterObj.searchText,
            available: productFilterObj.available, activeType: productFilterObj.activeType,
            subjectPerception: productFilterObj.subjectPerception, typeAffectationId: Number(productFilterObj.typeAffectationId), limit: Number(productFilterObj.limit)
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

    const filteredProducts = useMemo(() => {
        return products?.filter((w: IProduct) => searchField === "name" ? w?.name?.toLowerCase().includes(searchTerm.toLowerCase()) : w?.code?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, searchField, products]);

    return (
        <>
            <div className="p-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 lg:mt-1.5 dark:bg-gray-800 dark:border-gray-700">
                <div className="w-full mb-1">
                    <Breadcrumb section={"Productos"} article={"Productos"} />
                    <ProductFilter productFilterObj={productFilterObj} setProductFilterObj={setProductFilterObj} modalCriteria={modalCriteria} searchTerm={searchTerm} setSearchTerm={setSearchTerm} searchField={searchField} setSearchField={setSearchField} modalProduct={modalProduct} initialStateProduct={initialStateProduct} 
                    setProduct={setProduct} fetchProducts={fetchProducts} />
                </div>
            </div>

            <div className="flex flex-col">
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden shadow">
                        {filteredProductsLoading ? <div>Cargando...</div> : 
                        filteredProductsError? <div>Error: No autorizado o error en la consulta. {filteredProductsError.message}</div> 
                        : <ProductList filteredProducts={filteredProducts} modalProduct={modalProduct} setProduct={setProduct} jwtToken={jwtToken} />}
                            
                        </div>
                    </div>
                </div>
            </div>


            <ProductForm modalProduct={modalProduct} setModalProduct={setModalProduct} product={product} setProduct={setProduct} initialStateProduct={initialStateProduct} 
            jwtToken={jwtToken} typeAffectationsData={typeAffectationsData} PRODUCTS_QUERY={PRODUCTS_QUERY} productFilterObj={productFilterObj} />
            <ProductCriteriaForm modalCriteria={modalCriteria} setModalCriteria={setModalCriteria} productFilterObj={productFilterObj} setProductFilterObj={setProductFilterObj} typeAffectationsData={typeAffectationsData} fetchProducts={fetchProducts} />
        </>
    )

}

export default ProductPage