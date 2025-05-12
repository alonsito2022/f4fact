import { useCallback, useState } from "react";
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
            priceWithIgv4
            priceWithoutIgv4
            minimumUnitId
            maximumUnitId
            maximumFactor
            minimumFactor
        }
    }
`;
// Add this type definition near the top of the file, after imports

type ColumnName = keyof typeof initialVisibleColumns;
// Add this constant
const initialVisibleColumns = {
    id: true,
    name: true,
    code: true,
    price1WithIgv: false,
    price1WithoutIgv: false,
    price2WithIgv: false,
    price2WithoutIgv: false,
    price3WithIgv: true,
    price3WithoutIgv: true,
    price4WithIgv: false,
    price4WithoutIgv: false,
    company: false,
    subsidiary: false,
} as const;

function ProductList({
    filteredProducts,
    modalProduct,
    setProduct,
    authContext,
}: any) {
    const [visibleColumns, setVisibleColumns] = useState(initialVisibleColumns);

    const toggleColumn = (columnName: ColumnName) => {
        setVisibleColumns((prev) => ({
            ...prev,
            [columnName]: !prev[columnName],
        }));
    };
    const [
        productQuery,
        {
            loading: foundProductLoading,
            error: foundProductError,
            data: foundProductData,
        },
    ] = useLazyQuery(PRODUCT_QUERY, {
        context: authContext,
        fetchPolicy: "network-only",
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
                typeAffectationId: productFound?.typeAffectationId ?? 0,
                maximumUnitId: productFound?.maximumUnitId ?? 0,
                activeType: String(productFound?.activeType).replace("A_", ""),
                priceWithIgv1: Number(productFound?.priceWithIgv1).toFixed(2),
                priceWithoutIgv1: Number(
                    productFound?.priceWithoutIgv1
                ).toFixed(2),
                priceWithIgv3: Number(productFound?.priceWithIgv3).toFixed(2),
                priceWithoutIgv3: Number(
                    productFound?.priceWithoutIgv3
                ).toFixed(2),
                priceWithIgv4: Number(productFound?.priceWithIgv4).toFixed(2),
                priceWithoutIgv4: Number(
                    productFound?.priceWithoutIgv4
                ).toFixed(2),
            };
            setProduct(updatedProduct);
            modalProduct.show();
        },
        [productQuery, setProduct, modalProduct]
    );
    // Add this memoized component for table rows
    const TableRows = useCallback(
        ({ products }: { products: IProduct[] }) => {
            return (
                <>
                    {products?.map((item: IProduct) => (
                        <tr
                            key={item.id}
                            className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            {/* Move all td elements here */}
                            {visibleColumns.id && (
                                <td
                                    className={getCellClassName(item.available)}
                                >
                                    {item.id}
                                </td>
                            )}
                            {visibleColumns.name && (
                                <td
                                    className={getCellClassName(item.available)}
                                >
                                    {item.name}
                                </td>
                            )}
                            {visibleColumns.code && (
                                <td
                                    className={getCellClassName(item.available)}
                                >
                                    {item.code}
                                </td>
                            )}
                            {visibleColumns.price1WithIgv && (
                                <td
                                    className={getCellClassName(item.available)}
                                >
                                    {item.priceWithIgv1}
                                </td>
                            )}
                            {visibleColumns.price1WithoutIgv && (
                                <td
                                    className={getCellClassName(item.available)}
                                >
                                    {item.priceWithoutIgv1}
                                </td>
                            )}
                            {visibleColumns.price2WithIgv && (
                                <td
                                    className={getCellClassName(item.available)}
                                >
                                    {item.priceWithIgv2}
                                </td>
                            )}
                            {visibleColumns.price2WithoutIgv && (
                                <td
                                    className={getCellClassName(item.available)}
                                >
                                    {item.priceWithoutIgv2}
                                </td>
                            )}
                            {visibleColumns.price3WithIgv && (
                                <td
                                    className={getCellClassName(item.available)}
                                >
                                    {item.priceWithIgv3}
                                </td>
                            )}
                            {visibleColumns.price3WithoutIgv && (
                                <td
                                    className={getCellClassName(item.available)}
                                >
                                    {item.priceWithoutIgv3}
                                </td>
                            )}
                            {visibleColumns.price4WithIgv && (
                                <td
                                    className={getCellClassName(item.available)}
                                >
                                    {item.priceWithIgv4}
                                </td>
                            )}
                            {visibleColumns.price4WithoutIgv && (
                                <td
                                    className={getCellClassName(item.available)}
                                >
                                    {item.priceWithoutIgv4}
                                </td>
                            )}
                            {visibleColumns.company && (
                                <td
                                    className={getCellClassName(item.available)}
                                >
                                    {item?.subsidiary?.companyName}
                                </td>
                            )}
                            {visibleColumns.subsidiary && (
                                <td
                                    className={getCellClassName(item.available)}
                                >
                                    {item?.subsidiary?.serial}
                                </td>
                            )}
                            <td className="px-4 py-2 text-right">
                                <a
                                    className="cursor-pointer"
                                    onClick={() => handleEditProduct(item.id)}
                                >
                                    <Edit />
                                </a>
                            </td>
                        </tr>
                    ))}
                </>
            );
        },
        [visibleColumns] // Only re-render when visibleColumns changes
    );
    // Add this utility function for cell className
    const getCellClassName = useCallback((available: boolean) => {
        return `px-4 py-2 font-medium whitespace-nowrap ${
            !available
                ? "text-red-500 line-through"
                : "text-gray-900 dark:text-white"
        }`;
    }, []);
    if (foundProductLoading) return <p>Loading...</p>;
    if (foundProductError) return <p>Error: {foundProductError.message}</p>;

    return (
        <div className="overflow-x-auto">
            {/* Add column controls panel */}
            <div className="p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                <p className="text-sm font-medium mb-2">
                    Mostrar/Ocultar Columnas:
                </p>
                <div className="flex flex-wrap gap-4">
                    <label className="inline-flex items-center">
                        <input
                            type="checkbox"
                            checked={visibleColumns.id}
                            onChange={() => toggleColumn("id")}
                            className="form-checkbox h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2 text-sm">ID</span>
                    </label>
                    <label className="inline-flex items-center">
                        <input
                            type="checkbox"
                            checked={visibleColumns.name}
                            onChange={() => toggleColumn("name")}
                            className="form-checkbox h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2 text-sm">NOMBRE</span>
                    </label>
                    <label className="inline-flex items-center">
                        <input
                            type="checkbox"
                            checked={visibleColumns.code}
                            onChange={() => toggleColumn("code")}
                            className="form-checkbox h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2 text-sm">CODIGO</span>
                    </label>
                    <label className="inline-flex items-center">
                        <input
                            type="checkbox"
                            checked={visibleColumns.price1WithIgv}
                            onChange={() => toggleColumn("price1WithIgv")}
                            className="form-checkbox h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2 text-sm">C.U. C/IGV</span>
                    </label>
                    <label className="inline-flex items-center">
                        <input
                            type="checkbox"
                            checked={visibleColumns.price1WithoutIgv}
                            onChange={() => toggleColumn("price1WithoutIgv")}
                            className="form-checkbox h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2 text-sm">C.U. S/IGV</span>
                    </label>
                    <label className="inline-flex items-center">
                        <input
                            type="checkbox"
                            checked={visibleColumns.price2WithIgv}
                            onChange={() => toggleColumn("price2WithIgv")}
                            className="form-checkbox h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2 text-sm">C.M. C/IGV</span>
                    </label>
                    <label className="inline-flex items-center">
                        <input
                            type="checkbox"
                            checked={visibleColumns.price2WithoutIgv}
                            onChange={() => toggleColumn("price2WithoutIgv")}
                            className="form-checkbox h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2 text-sm">C.M. S/IGV</span>
                    </label>
                    <label className="inline-flex items-center">
                        <input
                            type="checkbox"
                            checked={visibleColumns.price3WithIgv}
                            onChange={() => toggleColumn("price3WithIgv")}
                            className="form-checkbox h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2 text-sm">P.U. C/IGV</span>
                    </label>
                    <label className="inline-flex items-center">
                        <input
                            type="checkbox"
                            checked={visibleColumns.price3WithoutIgv}
                            onChange={() => toggleColumn("price3WithoutIgv")}
                            className="form-checkbox h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2 text-sm">P.U. S/IGV</span>
                    </label>
                    <label className="inline-flex items-center">
                        <input
                            type="checkbox"
                            checked={visibleColumns.price4WithIgv}
                            onChange={() => toggleColumn("price4WithIgv")}
                            className="form-checkbox h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2 text-sm">P.M. C/IGV</span>
                    </label>
                    <label className="inline-flex items-center">
                        <input
                            type="checkbox"
                            checked={visibleColumns.price4WithoutIgv}
                            onChange={() => toggleColumn("price4WithoutIgv")}
                            className="form-checkbox h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2 text-sm">P.M. S/IGV</span>
                    </label>
                    <label className="inline-flex items-center">
                        <input
                            type="checkbox"
                            checked={visibleColumns.company}
                            onChange={() => toggleColumn("company")}
                            className="form-checkbox h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2 text-sm">EMPRESA</span>
                    </label>
                    <label className="inline-flex items-center">
                        <input
                            type="checkbox"
                            checked={visibleColumns.subsidiary}
                            onChange={() => toggleColumn("subsidiary")}
                            className="form-checkbox h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2 text-sm">SUC. SERIE</span>
                    </label>

                    {/* Add similar checkboxes for other columns */}
                </div>
            </div>

            <div className="p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Mostrando {filteredProducts?.length} registros
                </p>
            </div>
            <table className="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-600">
                <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                        {visibleColumns.id && (
                            <th
                                scope="col"
                                className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                            >
                                ID
                            </th>
                        )}
                        {visibleColumns.name && (
                            <th
                                scope="col"
                                className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                            >
                                NOMBRE
                            </th>
                        )}
                        {visibleColumns.code && (
                            <th
                                scope="col"
                                className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                            >
                                CODIGO
                            </th>
                        )}
                        {visibleColumns.price1WithIgv && (
                            <th
                                scope="col"
                                className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                            >
                                C.U. C/IGV
                            </th>
                        )}
                        {visibleColumns.price1WithoutIgv && (
                            <th
                                scope="col"
                                className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                            >
                                C.U. S/IGV
                            </th>
                        )}
                        {visibleColumns.price2WithIgv && (
                            <th
                                scope="col"
                                className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                            >
                                C.M. C/IGV
                            </th>
                        )}
                        {visibleColumns.price2WithoutIgv && (
                            <th
                                scope="col"
                                className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                            >
                                C.M. S/IGV
                            </th>
                        )}
                        {visibleColumns.price3WithIgv && (
                            <th
                                scope="col"
                                className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                            >
                                P.U. C/IGV
                            </th>
                        )}
                        {visibleColumns.price3WithoutIgv && (
                            <th
                                scope="col"
                                className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                            >
                                P.U. S/IGV
                            </th>
                        )}
                        {visibleColumns.price4WithIgv && (
                            <th
                                scope="col"
                                className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                            >
                                P.M. C/IGV
                            </th>
                        )}
                        {visibleColumns.price4WithoutIgv && (
                            <th
                                scope="col"
                                className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                            >
                                P.M. S/IGV
                            </th>
                        )}
                        {visibleColumns.company && (
                            <th
                                scope="col"
                                className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                            >
                                EMPRESA
                            </th>
                        )}
                        {visibleColumns.subsidiary && (
                            <th
                                scope="col"
                                className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                            >
                                SUC. SERIE
                            </th>
                        )}

                        <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                        >
                            ACCION
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <TableRows products={filteredProducts} />
                </tbody>
            </table>
        </div>
    );
}

export default ProductList;
