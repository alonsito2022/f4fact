import React from "react";
import GuideDetailItem from "./GuideDetailItem";
import GuideDocumentItem from "./GuideDocumentItem";
import { IOperationDetail, IProduct, IRelatedDocument } from "@/app/types";
import { gql, useQuery } from "@apollo/client";
const PRODUCTS_QUERY = gql`
    query ($subsidiaryId: Int!, $available: Boolean!) {
        allProducts(subsidiaryId: $subsidiaryId, available: $available) {
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
            priceWithIgv1
            priceWithIgv2
            priceWithIgv3
            priceWithIgv4
            priceWithoutIgv1
            priceWithoutIgv2
            priceWithoutIgv3
            priceWithoutIgv4
        }
    }
`;

function GuideDetailAndDocument({ guide, setGuide, auth, authContext }: any) {
    const getVariables = () => ({
        subsidiaryId: Number(auth?.user?.subsidiaryId),
        available: true,
    });
    const {
        loading: productsLoading,
        error: productsError,
        data: productsData,
    } = useQuery(PRODUCTS_QUERY, {
        context: authContext,
        variables: getVariables(),
        skip: !auth?.jwtToken,
    });

    const handleAddItem = () => {
        setGuide({
            ...guide,
            operationdetailSet: [
                ...guide.operationdetailSet,
                {
                    index: guide.operationdetailSet.length,
                    productName: "",
                    description: "",
                    productId: 0,
                    quantity: 0,
                },
            ],
        });
    };

    const handleAddDocument = () => {
        setGuide({
            ...guide,
            relatedDocuments: [
                ...guide.relatedDocuments,
                {
                    index: guide.relatedDocuments.length,
                    serial: "",
                    documentType: "01",
                    correlative: 0,
                },
            ],
        });
    };

    const handleRemoveItem = (index: number) => {
        if (window.confirm("¿Estás seguro de eliminar este ítem?")) {
            setGuide({
                ...guide,
                operationdetailSet: guide.operationdetailSet.filter(
                    (_: IOperationDetail, i: number) => i !== index
                ),
            });
        }
    };

    const handleRemoveDocument = (index: number) => {
        if (window.confirm("¿Estás seguro de eliminar este documento?")) {
            setGuide({
                ...guide,
                relatedDocuments: guide.relatedDocuments.filter(
                    (_: IRelatedDocument, i: number) => i !== index
                ),
            });
        }
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...guide.operationdetailSet];
        if (field === "productName") {
            const normalizedValue = value.replace(/[\n\r\s]+/g, " ").trim();
            const selectedData = productsData?.allProducts?.find(
                (product: IProduct) => {
                    const productString = `${
                        product.code ? product.code + " " : ""
                    }${product.name} ${product.minimumUnitName}`
                        .replace(/[\n\r\s]+/g, " ")
                        .trim();
                    return productString === normalizedValue;
                }
            );
            console.log("selectedData", selectedData);

            if (selectedData !== undefined) {
                newItems[index] = {
                    ...newItems[index],
                    productName: selectedData.name,
                    productId: selectedData.id,
                };
            } else {
                newItems[index] = { ...newItems[index], productName: value };
            }
        } else {
            newItems[index] = { ...newItems[index], [field]: value };
        }

        setGuide({ ...guide, operationdetailSet: newItems });
    };

    const handleDocumentChange = (index: number, field: string, value: any) => {
        const newItems = [...guide.relatedDocuments];
        newItems[index] = { ...newItems[index], [field]: value };
        setGuide({ ...guide, relatedDocuments: newItems });
    };

    return (
        <>
            <div className="relative bg-white dark:bg-gray-800/80 backdrop-blur rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.1)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)] overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-60" />
                <div className="p-5 sm:p-6">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
                        Ítems de la Guía
                    </h2>
                    <div id="details" className="w-full grid gap-3 mb-4">
                        {guide.operationdetailSet.map(
                            (item: IOperationDetail, index: number) => (
                                <div
                                    key={index}
                                    className="border border-gray-200/80 dark:border-gray-600/60 p-4 rounded-xl bg-gray-50/70 dark:bg-gray-700/20"
                                >
                                    <GuideDetailItem
                                        index={index}
                                        item={item}
                                        onRemove={() => handleRemoveItem(index)}
                                        onChange={handleItemChange}
                                        products={productsData?.allProducts || []}
                                    />
                                </div>
                            )
                        )}
                    </div>
                    <button
                        type="button"
                        className="group relative inline-flex items-center justify-center gap-2 h-10 px-5 bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300 rounded-xl font-medium text-sm border-2 border-dashed border-blue-300/80 dark:border-blue-500/40 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-md active:scale-[0.98] transition-all duration-200"
                        onClick={handleAddItem}
                    >
                        <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/25">
                            <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                        </span>
                        Agregar ítem
                    </button>
                </div>
            </div>

            <div className="relative bg-white dark:bg-gray-800/80 backdrop-blur rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.1)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)] overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-60" />
                <div className="p-5 sm:p-6">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
                        Documentos Relacionados
                    </h2>
                    <div id="related_documents" className="w-full grid gap-3 mb-4">
                        {guide.relatedDocuments.map(
                            (item: IRelatedDocument, index: number) => (
                                <div
                                    key={index}
                                    className="border border-gray-200/80 dark:border-gray-600/60 p-4 rounded-xl bg-gray-50/70 dark:bg-gray-700/20"
                                >
                                    <GuideDocumentItem
                                        index={index}
                                        item={item}
                                        onRemove={() => handleRemoveDocument(index)}
                                        onChange={handleDocumentChange}
                                    />
                                </div>
                            )
                        )}
                    </div>
                    <button
                        type="button"
                        className="group relative inline-flex items-center justify-center gap-2 h-10 px-5 bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300 rounded-xl font-medium text-sm border-2 border-dashed border-blue-300/80 dark:border-blue-500/40 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-md active:scale-[0.98] transition-all duration-200"
                        onClick={handleAddDocument}
                    >
                        <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/25">
                            <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                        </span>
                        Agregar documento relacionado
                    </button>
                </div>
            </div>
        </>
    );
}

export default GuideDetailAndDocument;
