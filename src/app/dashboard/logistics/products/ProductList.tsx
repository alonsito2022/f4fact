import { useState, useEffect } from "react";
import Edit from '@/components/icons/Edit'
import { IProduct } from '@/app/types';


function ProductList({ filteredProducts, modal, fetchProductById }: any) {
    const [hostname, setHostname] = useState("");

    useEffect(() => {
        if (hostname == "") {
            setHostname(`${process.env.NEXT_PUBLIC_BASE_API}`)
        }
    }, [hostname]);
    
    return (
        <>
            <table className="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-600">
                <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">ID </th>
                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">NOMBRE</th>
                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">CODIGO</th>
                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">EAN</th>
                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">ACCION</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredProducts?.map((item: IProduct) =>
                        <tr key={item.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                            <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">{item.id}</td>
                            <td className="px-4 py-2">{item.name}</td>
                            <td className="px-4 py-2">{item.code}</td>
                            <td className="px-4 py-2">{item.ean}</td>
                            <td className="px-4 py-2">
                                <>
                                    <a href="#" className="hover:underline" onClick={async () => {
                                        await fetchProductById(item.id);
                                        modal.show();
                                    }}>
                                        <Edit />
                                    </a>

                                </>

                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </>
    )
}

export default ProductList
