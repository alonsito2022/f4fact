import { ICompany } from '@/app/types';
import Check from '@/components/icons/Check';
import CloseCircle from '@/components/icons/CloseCircle';
import UserCircle from '@/components/icons/UserCircle';
import ImageCircle from '@/components/images/ImageCircle';
import React from 'react'

function CompanyList({ companies, modal, setModal, company, setCompany }: any) {
    async function fetchCompanyByID(pk: number) {
        let queryfetch = `
    {
        companyById(pk: ${pk}){
            id
            typeDoc
            doc
            businessName
            address
            email
            phone
            shortName
            logo                        
            isEnabled
            limit
            country
            userSol
            keySol
            emissionInvoiceWithPreviousDate
            emissionReceiptWithPreviousDate
            includeIgv
            percentageIgv
            isEnabled
            productionDate
            isProduction
            disabledDate            
            certification
            certificationKey
            certificationExpirationDate
            withStock
            catalog
            invoiceF
            invoiceB
            guide
            app
        }
    }
`
        console.log(queryfetch)
        await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query: queryfetch
            })
        })
            .then(res => res.json())
            .then(data => {
                console.log(data.data.companyById)
                // if (data.data.userById.avatar) {
                //     // Concatenar el dominio con la URL relativa del avatar
                //     const avatarUrl = `${process.env.NEXT_PUBLIC_BASE_API}/${data.data.userById.avatar}`;

                //     // Actualizar la propiedad 'avatarUrl' en los datos del usuario
                //     data.data.userById.avatarUrl = avatarUrl;
                //   }
                setCompany(data.data.companyById);
            })
    }
    return (
        <>
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr className="text-center">
                        <th scope="col" className="px-2 py-3">
                            ID
                        </th>
                        <th scope="col" className="px-2 py-3">
                            Ruc
                        </th>
                        <th scope="col" className="px-2 py-3">
                            Razon Social
                        </th>
                        <th scope="col" className="px-2 py-3">
                            Nombre
                        </th>
                        <th scope="col" className="px-2 py-3">
                            Direccion
                        </th>
                        <th scope="col" className="px-2 py-3">
                            Telefono
                        </th>
                        <th scope="col" className="px-2 py-3">
                            Correo
                        </th>
                        <th scope="col" className="px-2 py-3">
                            Limite
                        </th>
                        <th scope="col" className="px-2 py-3">
                            Producción
                        </th>
                        <th scope="col" className="px-2 py-3">
                            Estado
                        </th>
                        <th scope="col" className="px-2 py-3">
                            Logo
                        </th>
                        <th scope="col" className="px-2 py-3">
                            Acción
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {companies?.map((item: ICompany) =>
                        <tr key={item.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-300 dark:hover:bg-gray-700">
                            <th scope="row" className="px-2 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {item.id}
                            </th>
                            <td className="px-2 py-3">
                                {item.doc}
                            </td>
                            <td className="px-2 py-3">
                                {item.businessName}
                            </td>
                            <td className="px-2 py-3">
                                {item.shortName}
                            </td>
                            <td className="px-2 py-3">
                                {item.address}
                            </td>
                            <td className="px-2 py-3">
                                {item.phone}
                            </td>
                            <td className="px-2 py-3">
                                {item.email}
                            </td>
                            <td className="px-2 py-3">
                                {item.limit}
                            </td>
                            <td className="px-2 py-3 text-sm">
                                {item.isProduction ?
                                    <>
                                        <Check />
                                    </>
                                    :
                                    <>
                                        <CloseCircle />
                                    </>
                                }
                                {/* <svg className="w-4 h-4 text-green-600 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
                </svg>
                </>
                :
                <>
                <svg className="w-4 h-4 text-red-600 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z"/>
                </svg> */}
                            </td>
                            <td className="px-2 py-3 text-sm">
                                {item.isEnabled ?
                                    <>
                                        <Check />
                                    </>
                                    :
                                    <>
                                        <CloseCircle />
                                    </>
                                }
                            </td>
                            <td className="px-2 py-1">
                                {item?.logo ?
                                    <>
                                        <ImageCircle image={item.id && (item.logo as string).search("base64") == -1 ? `${process.env.NEXT_PUBLIC_BASE_API}/${item.logo}` : item.logo as string} />
                                    </>
                                    :
                                    <>
                                        <UserCircle />
                                    </>
                                }
                            </td>
                            <td className="px-2 py-3 text-right">
                                <a href="#" className="hover:underline" onClick={async () => {
                                    await fetchCompanyByID(item.id!);
                                    modal.show();
                                }}>
                                    <svg className="w-4 h-4 text-green-500 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                                        <path d="M12.687 14.408a3.01 3.01 0 0 1-1.533.821l-3.566.713a3 3 0 0 1-3.53-3.53l.713-3.566a3.01 3.01 0 0 1 .821-1.533L10.905 2H2.167A2.169 2.169 0 0 0 0 4.167v11.666A2.169 2.169 0 0 0 2.167 18h11.666A2.169 2.169 0 0 0 16 15.833V11.1l-3.313 3.308Zm5.53-9.065.546-.546a2.518 2.518 0 0 0 0-3.56 2.576 2.576 0 0 0-3.559 0l-.547.547 3.56 3.56Z" />
                                        <path d="M13.243 3.2 7.359 9.081a.5.5 0 0 0-.136.256L6.51 12.9a.5.5 0 0 0 .59.59l3.566-.713a.5.5 0 0 0 .255-.136L16.8 6.757 13.243 3.2Z" />
                                    </svg></a>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </>
    )
}

export default CompanyList
