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
            {/* Botón Agregar Item */}
            <div className="">
                <div id="details" className="w-full grid gap-4 mb-4">
                    {guide.operationdetailSet.map(
                        (item: IOperationDetail, index: number) => (
                            <div
                                key={index}
                                className="border border-gray-300 dark:border-gray-600 p-4 rounded-lg shadow-sm bg-white dark:bg-gray-800"
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
                    className="px-5 py-2 bg-blue-600 dark:bg-cyan-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
                    onClick={handleAddItem}
                >
                    AGREGAR LINEA O ITEM
                </button>
            </div>

            {/* Botón Agregar Documentos Relacionados */}
            <div className="">
                <div id="related_documents" className="w-full grid gap-4 mb-4">
                    {guide.relatedDocuments.map(
                        (item: IRelatedDocument, index: number) => (
                            <div
                                key={index}
                                className="border border-gray-300 dark:border-gray-600 p-4 rounded-lg shadow-sm bg-white dark:bg-gray-800"
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
                    className="px-5 py-2 bg-blue-600 dark:bg-cyan-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
                    onClick={handleAddDocument}
                >
                    AGREGAR DOCUMENTO RELACIONADO
                </button>
            </div>
        </>
    );
}

export default GuideDetailAndDocument;
