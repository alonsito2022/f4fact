import { useCallback } from "react";
import Edit from "@/components/icons/Edit";
import { IProduct } from "@/app/types";
import { gql, useLazyQuery } from "@apollo/client";

const PRODUCT_QUERY = gql`
    query ($pk: ID!) {
        productById(pk: $pk) {
            id
            name
            code
            available
            activeType
            ean
            weightInKilograms
            typeAffectationId
            subjectPerception
            observation
            priceWithIgv1
            priceWithoutIgv1
            priceWithIgv2
            priceWithoutIgv2
            priceWithIgv3
            priceWithoutIgv3
            minimumUnitId
            maximumUnitId
            maximumFactor
            minimumFactor
        }
    }
`;

function ProductList({
    filteredProducts,
    modalProduct,
    setProduct,
    authContext,
}: any) {
    const [
        productQuery,
        {
            loading: foundProductLoading,
            error: foundProductError,
            data: foundProductData,
        },
    ] = useLazyQuery(PRODUCT_QUERY, {
        context: authContext,
    });

    const handleEditProduct = useCallback(
        async (productId: number) => {
            const { data } = await productQuery({
                variables: { pk: Number(productId) },
            });
            const productFound = data.productById;
            const updatedProduct = {
                ...productFound,
                code: productFound?.code ?? "",
                ean: productFound?.ean ?? "",
                activeType: String(productFound?.activeType).replace("A_", ""),
                priceWithIgv1: Number(productFound?.priceWithIgv1).toFixed(2),
                priceWithoutIgv1: Number(
                    productFound?.priceWithoutIgv1
                ).toFixed(2),
                priceWithIgv3: Number(productFound?.priceWithIgv3).toFixed(2),
                priceWithoutIgv3: Number(
                    productFound?.priceWithoutIgv3
                ).toFixed(2),
            };
            setProduct(updatedProduct);
            modalProduct.show();
        },
        [productQuery, setProduct, modalProduct]
    );
    if (foundProductLoading) return <p>Loading...</p>;
    if (foundProductError) return <p>Error: {foundProductError.message}</p>;

    return (
        <div className="overflow-x-auto">
            <div className="p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Mostrando {filteredProducts?.length} registros
                </p>
            </div>
            <table className="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-600">
                <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                        <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                        >
                            ID
                        </th>
                        <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                        >
                            NOMBRE
                        </th>
                        <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                        >
                            CODIGO
                        </th>
                        <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                        >
                            EMPRESA
                        </th>
                        <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                        >
                            SUC. SERIE
                        </th>
                        <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                        >
                            ACCION
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {filteredProducts?.map((item: IProduct) => (
                        <tr
                            key={item.id}
                            className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {item.id}
                            </td>
                            <td className="px-4 py-2">{item.name}</td>
                            <td className="px-4 py-2">{item.code}</td>
                            <td className="px-4 py-2">
                                {item.subsidiary?.companyName}
                            </td>
                            <td className="px-4 py-2">
                                {item.subsidiary?.serial}
                            </td>
                            <td className="px-4 py-2">
                                <a
                                    href="#"
                                    className="text-blue-600 hover:underline dark:text-blue-400"
                                    onClick={() => handleEditProduct(item.id)}
                                >
                                    <Edit />
                                </a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ProductList;
