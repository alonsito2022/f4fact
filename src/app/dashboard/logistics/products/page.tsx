"use client";
import { useState, useEffect, useMemo } from "react";
import ProductList from "./ProductList";
import ProductForm from "./ProductForm";
import ProductFilter from "./ProductFilter";
import ProductCriteriaForm from "./ProductCriteriaForm";
import Breadcrumb from "@/components/Breadcrumb";
import { useAuth } from "@/components/providers/AuthProvider";
import { IUser, IProduct, ITypeAffectation } from "@/app/types";
import { Modal, ModalOptions } from "flowbite";
import { gql, useLazyQuery, useQuery } from "@apollo/client";

const initialStateProduct = {
    id: 0,
    name: "",
    code: "",
    barcode: "",

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

    priceWithIgv4: 0,
    priceWithoutIgv4: 0,

    minimumUnitId: 0,
    maximumUnitId: 0,
    maximumFactor: "1",
    minimumFactor: "1",
    // subsidiaryId: 0,
    stock: 0,
    retailQuantityThreshold: 0,
};

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
    subsidiaryId: "",
    subsidiaryName: "",
    isSuperuser: false,
    limit: 50,
};

const PRODUCTS_QUERY = gql`
    query ($subsidiaryId: Int!, $available: Boolean) {
        allProducts(subsidiaryId: $subsidiaryId, available: $available) {
            id
            code
            barcode
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
            subsidiary {
                id
                serial
                companyName
            }
            priceWithIgv1
            priceWithIgv2
            priceWithIgv3
            priceWithIgv4
            priceWithoutIgv1
            priceWithoutIgv2
            priceWithoutIgv3
            priceWithoutIgv4
            stock
            retailQuantityThreshold
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
    const [productFilterObj, setProductFilterObj] = useState(
        initialStateProductFilterObj
    );
    const auth = useAuth();

    const authContext = useMemo(
        () => ({
            headers: {
                "Content-Type": "application/json",
                Authorization: auth?.jwtToken ? `JWT ${auth.jwtToken}` : "",
            },
        }),
        [auth?.jwtToken]
    );

    useEffect(() => {
        if (auth?.user) {
            const user = auth?.user as IUser;
            setProductFilterObj((prev) => ({
                ...prev,
                subsidiaryId: user.subsidiaryId! || "0",
                subsidiaryName: user.subsidiaryName! || "",
                isSuperuser: user.isSuperuser ?? false,
            }));
        }
    }, [auth?.user]);

    const [product, setProduct] = useState(initialStateProduct);
    const [modalProduct, setModalProduct] = useState<Modal | any>(null);
    const [modalCriteria, setModalCriteria] = useState<Modal | any>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");

    const {
        loading: typeAffectationsLoading,
        error: typeAffectationsError,
        data: typeAffectationsData,
    } = useQuery(TYPE_AFFECTATION_QUERY, {
        context: authContext,
        skip: !auth?.jwtToken, // Esto evita que la consulta se ejecute si no hay token
        onError: (err) => console.error("Error in typeAffectations:", err),
    });
    const getVariables = () => ({
        subsidiaryId: Number(productFilterObj?.subsidiaryId),
        // available: true,
    });
    const [
        productsQuery,
        {
            loading: filteredProductsLoading,
            error: filteredProductsError,
            data: filteredProductsData,
        },
    ] = useLazyQuery(PRODUCTS_QUERY, {
        context: authContext,
        variables: getVariables(),
        fetchPolicy: "network-only",
        // onCompleted: (data) => {},
        onError: (err) => console.error("Error in products:", err),
    });

    const fetchProducts = () => {
        productsQuery();
    };

    useEffect(() => {
        if (auth?.jwtToken && Number(productFilterObj.subsidiaryId) > 0) {
            fetchProducts();
        }
    }, [auth?.jwtToken, productFilterObj.subsidiaryId]);
    const filteredProducts = useMemo(() => {
        if (!filteredProductsData?.allProducts) return [];

        const searchTermLower = searchTerm.toLowerCase();
        return filteredProductsData.allProducts.filter((w: IProduct) => {
            const nameMatch = w?.name?.toLowerCase().includes(searchTermLower);
            const codeMatch = w?.code
                ?.toString()
                .toLowerCase()
                .includes(searchTermLower);
            return nameMatch || codeMatch;
        });
    }, [searchTerm, filteredProductsData]);

    return (
        <>
            <div className="min-h-full bg-slate-50 dark:bg-gray-900">
                <div className="mx-auto max-w-[1600px] space-y-5 px-4 py-5 sm:px-6 lg:px-8">
                    <Breadcrumb section={"Logística"} article={"Productos"} />

                    <ProductFilter
                        productFilterObj={productFilterObj}
                        setProductFilterObj={setProductFilterObj}
                        modalCriteria={modalCriteria}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        modalProduct={modalProduct}
                        initialStateProduct={initialStateProduct}
                        setProduct={setProduct}
                        fetchProducts={fetchProducts}
                        authContext={authContext}
                        jwtToken={auth?.jwtToken}
                        filteredProducts={filteredProducts}
                    />

                    {filteredProductsLoading ? (
                        <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-16 text-sm text-slate-500 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                            Cargando productos...
                        </div>
                    ) : filteredProductsError ? (
                        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">
                            No se pudieron cargar los productos.{" "}
                            {filteredProductsError.message}
                        </div>
                    ) : (
                        <ProductList
                            filteredProducts={filteredProducts}
                            modalProduct={modalProduct}
                            setProduct={setProduct}
                            authContext={authContext}
                        />
                    )}
                </div>
            </div>

            <ProductForm
                modalProduct={modalProduct}
                setModalProduct={setModalProduct}
                product={product}
                setProduct={setProduct}
                initialStateProduct={initialStateProduct}
                auth={auth}
                authContext={authContext}
                typeAffectationsData={typeAffectationsData}
                PRODUCTS_QUERY={PRODUCTS_QUERY}
                getVariables={getVariables}
            />
            <ProductCriteriaForm
                modalCriteria={modalCriteria}
                setModalCriteria={setModalCriteria}
                productFilterObj={productFilterObj}
                setProductFilterObj={setProductFilterObj}
                typeAffectationsData={typeAffectationsData}
                fetchProducts={fetchProducts}
            />
        </>
    );
}

export default ProductPage;
