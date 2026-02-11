import { ICompany } from "@/app/types";
import Check from "@/components/icons/Check";
import CloseCircle from "@/components/icons/CloseCircle";
import UserCircle from "@/components/icons/UserCircle";
import ImageCircle from "@/components/images/ImageCircle";
import React from "react";

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
            deductionAccount
            guideClientId
            guideClientSecret
            withStock
            catalog
            invoiceF
            invoiceB
            guide
            app
            ose
            accountNumber
            comment
            disableContinuePay
            registerDate
            isRus
            isAgentRetention
            isAgentPerception
            showUser
        }
        }
        `;
        await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query: queryfetch,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                let companyData = data.data.companyById;

                // Normalizar percentageIgv a número para que coincida con los
                // valores de los <option> del formulario (p. ej. 10.5 en vez de "10.50").
                if (
                    companyData.percentageIgv !== null &&
                    companyData.percentageIgv !== undefined
                ) {
                    companyData.percentageIgv = parseFloat(
                        companyData.percentageIgv as any,
                    );
                } else {
                    companyData.percentageIgv = 18;
                }

                const stringFields = [
                    "phone",
                    "certification",
                    "certificationKey",
                    "logo",
                    "productionDate",
                    "accountNumber",
                    "comment",
                    "guideClientId",
                    "guideClientSecret",
                    "deductionAccount",
                    "certificationExpirationDate",
                    "registerDate",
                ];

                // Convertir cada campo null a string vacío
                stringFields.forEach((field) => {
                    companyData[field] = companyData[field] || "";
                });

                // Finalmente actualizar el estado con la data normalizada
                setCompany(companyData);
            });
    }
    return (
        <>
            <div className="p-2 sm:p-4 bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-800">
                {/* Leyenda de colores */}
                <div className="mb-4 flex flex-wrap items-center gap-4 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700"></div>
                        <span className="text-gray-700 dark:text-gray-300">
                            <span className="font-semibold">
                                Empresa deshabilitada
                            </span>{" "}
                            (isEnabled = false)
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 dark:border-yellow-700"></div>
                        <span className="text-gray-700 dark:text-gray-300">
                            <span className="font-semibold">
                                Certificado próximo a vencer
                            </span>{" "}
                            (≤ 20 días)
                        </span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-gray-700 dark:text-gray-200">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-[11px] uppercase">
                                <th className="px-2 py-2 font-semibold">ID</th>
                                <th className="px-2 py-2 font-semibold">Ruc</th>
                                <th className="px-2 py-2 font-semibold">
                                    Razon Social
                                </th>
                                <th className="px-2 py-2 font-semibold">
                                    Nombre
                                </th>
                                <th className="px-2 py-2 font-semibold">
                                    Dirección
                                </th>
                                <th className="px-2 py-2 font-semibold">
                                    Teléfono
                                </th>
                                <th className="px-2 py-2 font-semibold">
                                    Correo
                                </th>
                                <th className="px-2 py-2 font-semibold">
                                    Límite
                                </th>
                                <th className="px-2 py-2 font-semibold">
                                    Prod.
                                </th>
                                <th className="px-2 py-2 font-semibold">
                                    Estado
                                </th>
                                <th className="px-2 py-2 font-semibold">
                                    Logo
                                </th>
                                <th className="px-2 py-2 font-semibold">
                                    Acción
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {companies?.map((item: ICompany) => {
                                // Calcular si faltan 20 días o menos para expirar
                                let isExpiring = false;
                                if (item.certificationExpirationDate) {
                                    const today = new Date();
                                    const expiration = new Date(
                                        item.certificationExpirationDate,
                                    );
                                    const diffTime =
                                        expiration.getTime() - today.getTime();
                                    const diffDays =
                                        diffTime / (1000 * 60 * 60 * 24);
                                    isExpiring = diffDays <= 20;
                                }

                                // Determinar si la fila debe estar resaltada
                                const isDisabled = !item.isEnabled;
                                const shouldHighlight =
                                    isExpiring || isDisabled;

                                return (
                                    <tr
                                        key={item.id}
                                        className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors group ${
                                            shouldHighlight
                                                ? isDisabled
                                                    ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                                                    : "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400"
                                                : "text-gray-700 dark:text-gray-200"
                                        }`}
                                    >
                                        <td className="px-2 py-1 flex items-center gap-1">
                                            {item.id}
                                            {item.isRus ? (
                                                <svg
                                                    className="w-6 h-6 text-gray-800 dark:text-white"
                                                    aria-hidden="true"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="24"
                                                    height="24"
                                                    fill="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M12 20a7.966 7.966 0 0 1-5.002-1.756l.002.001v-.683c0-1.794 1.492-3.25 3.333-3.25h3.334c1.84 0 3.333 1.456 3.333 3.25v.683A7.966 7.966 0 0 1 12 20ZM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10c0 5.5-4.44 9.963-9.932 10h-.138C6.438 21.962 2 17.5 2 12Zm10-5c-1.84 0-3.333 1.455-3.333 3.25S10.159 13.5 12 13.5c1.84 0 3.333-1.455 3.333-3.25S13.841 7 12 7Z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            ) : (
                                                <svg
                                                    className="w-6 h-6 text-gray-800 dark:text-white"
                                                    aria-hidden="true"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="24"
                                                    height="24"
                                                    fill="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M15 4c0-.55228.4477-1 1-1h4c.5523 0 1 .44772 1 1v3c0 .55228-.4477 1-1 1h-4v13H8V7.86853l-1.44532.96352c-.45952.30635-1.08039.18218-1.38675-.27735-.30635-.45953-.18217-1.0804.27735-1.38675l6.00002-4c.3359-.22393.7735-.22393 1.1094 0L15 4.79816V4Zm-5 8c0-.5523.4477-1 1-1h2c.5523 0 1 .4477 1 1s-.4477 1-1 1h-2c-.5523 0-1-.4477-1-1Zm1-4c-.5523 0-1 .44772-1 1s.4477 1 1 1h2c.5523 0 1-.44772 1-1s-.4477-1-1-1h-2Z"
                                                        clipRule="evenodd"
                                                    />
                                                    <path d="M18 9.00011 17.9843 9h.0296L18 9.00011ZM6 10.5237l-2.27075.6386C3.29797 11.2836 3 11.677 3 12.125V20c0 .5523.44772 1 1 1h2V10.5237Zm14.2707.6386L18 10.5237V21h2c.5523 0 1-.4477 1-1v-7.875c0-.448-.298-.8414-.7293-.9627Z" />
                                                </svg>
                                            )}
                                        </td>
                                        <td className="px-2 py-1 truncate max-w-[80px]">
                                            {item.doc}
                                        </td>
                                        <td className="px-2 py-1 truncate max-w-[120px]">
                                            {item.businessName}
                                        </td>
                                        <td className="px-2 py-1 truncate max-w-[80px]">
                                            {item.shortName}
                                        </td>
                                        <td className="px-2 py-1 truncate max-w-[100px]">
                                            {item.address}
                                        </td>
                                        <td className="px-2 py-1 truncate max-w-[70px]">
                                            {item.phone}
                                        </td>
                                        <td className="px-2 py-1 truncate max-w-[100px]">
                                            {item.email}
                                        </td>
                                        <td className="px-2 py-1">
                                            {item.limit}
                                        </td>
                                        <td className="px-2 py-1 text-center">
                                            {item.isProduction ? (
                                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300">
                                                    <Check />
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-400">
                                                    <CloseCircle />
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-2 py-1 text-center">
                                            {item.isEnabled ? (
                                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                                                    <Check />
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-400">
                                                    <CloseCircle />
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-2 py-1">
                                            <div className="flex items-center justify-center">
                                                {item?.logo ? (
                                                    <ImageCircle
                                                        image={
                                                            item.id &&
                                                            (
                                                                item.logo as string
                                                            ).search(
                                                                "base64",
                                                            ) == -1
                                                                ? `${process.env.NEXT_PUBLIC_BASE_API}/${item.logo}`
                                                                : (item.logo as string)
                                                        }
                                                        className="w-5 h-5 object-cover rounded-full"
                                                    />
                                                ) : (
                                                    <UserCircle />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-2 py-1 text-right">
                                            <a
                                                href="#"
                                                className="inline-flex items-center justify-center p-1.5 rounded-md bg-blue-500 hover:bg-blue-600 text-white shadow transition-all duration-100"
                                                onClick={async () => {
                                                    await fetchCompanyByID(
                                                        item.id!,
                                                    );
                                                    modal.show();
                                                }}
                                                title="Editar"
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    aria-hidden="true"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 18"
                                                >
                                                    <path d="M12.687 14.408a3.01 3.01 0 0 1-1.533.821l-3.566.713a3 3 0 0 1-3.53-3.53l.713-3.566a3.01 3.01 0 0 1 .821-1.533L10.905 2H2.167A2.169 2.169 0 0 0 0 4.167v11.666A2.169 2.169 0 0 0 2.167 18h11.666A2.169 2.169 0 0 0 16 15.833V11.1l-3.313 3.308Zm5.53-9.065.546-.546a2.518 2.518 0 0 0 0-3.56 2.576 2.576 0 0 0-3.559 0l-.547.547 3.56 3.56Z" />
                                                    <path d="M13.243 3.2 7.359 9.081a.5.5 0 0 0-.136.256L6.51 12.9a.5.5 0 0 0 .59.59l3.566-.713a.5.5 0 0 0 .255-.136L16.8 6.757 13.243 3.2Z" />
                                                </svg>
                                            </a>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

export default CompanyList;
