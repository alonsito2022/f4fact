import { ChangeEvent, FormEvent, MouseEvent, useEffect, useRef, useState } from "react";
import { Modal, ModalOptions } from "flowbite";
import { toast } from "react-toastify";
import { DocumentNode, gql, useMutation } from "@apollo/client";
import { ICompany } from "@/app/types";
import { signOut } from "next-auth/react";
const CREATE_COMPANY = gql`
    mutation CreateCompany(
        $typeDoc: String!
        $doc: String!
        $shortName: String!
        $businessName: String!
        $address: String!
        $email: String!
        $phone: String!
        $userSol: String!
        $keySol: String!
        $limit: Int!
        $emissionInvoiceWithPreviousDate: Int!
        $emissionReceiptWithPreviousDate: Int!
        $logo: String!
        $includeIgv: Boolean!
        $percentageIgv: Int!
        $isEnabled: Boolean!
        $isProduction: Boolean!
        $certification: String! # Upload,
        $certificationExpirationDate: String!
        $certificationKey: String! #Upload,
        $guideClientId: String!
        $guideClientSecret: String!
        $deductionAccount: String!
        $withStock: Boolean!
        $catalog: Boolean!
        $invoiceF: Boolean!
        $invoiceB: Boolean!
        $guide: Boolean!
        $app: Boolean!
        $ose: Boolean       
        $accountNumber: String!
        $comment: String!
        $disableContinuePay: Boolean
    ) {
        createCompany(
            typeDoc: $typeDoc
            doc: $doc
            shortName: $shortName
            businessName: $businessName
            address: $address
            email: $email
            phone: $phone
            userSol: $userSol
            keySol: $keySol
            limit: $limit
            emissionInvoiceWithPreviousDate: $emissionInvoiceWithPreviousDate
            emissionReceiptWithPreviousDate: $emissionReceiptWithPreviousDate
            logo: $logo
            includeIgv: $includeIgv
            percentageIgv: $percentageIgv
            isEnabled: $isEnabled
            isProduction: $isProduction
            certification: $certification
            certificationExpirationDate: $certificationExpirationDate
            certificationKey: $certificationKey
            guideClientId: $guideClientId
            guideClientSecret: $guideClientSecret
            deductionAccount: $deductionAccount
            withStock: $withStock
            catalog: $catalog
            invoiceF: $invoiceF
            invoiceB: $invoiceB
            guide: $guide
            app: $app
            ose: $ose
            accountNumber: $accountNumber
            comment: $comment
            disableContinuePay: $disableContinuePay
        ) {
            success
            message
        }
    }
`;
const UPDATE_COMPANY = gql`
    mutation UpdateCompany(
        $id: ID!
        $typeDoc: String!
        $doc: String!
        $shortName: String!
        $businessName: String!
        $address: String!
        $email: String!
        $phone: String!
        $userSol: String!
        $keySol: String!
        $limit: Int!
        $emissionInvoiceWithPreviousDate: Int!
        $emissionReceiptWithPreviousDate: Int!
        $logo: String!
        $includeIgv: Boolean!
        $percentageIgv: Int!
        $isEnabled: Boolean!
        $isProduction: Boolean!
        $certification: String! #Upload,
        $certificationExpirationDate: String!
        $certificationKey: String! #Upload,
        $guideClientId: String!
        $guideClientSecret: String!
        $deductionAccount: String!
        $withStock: Boolean!
        $catalog: Boolean!
        $invoiceF: Boolean!
        $invoiceB: Boolean!
        $guide: Boolean!
        $app: Boolean!
        $ose: Boolean!
        $accountNumber: String!
        $comment: String!
        $disableContinuePay: Boolean!
    ) {
        updateCompany(
            id: $id
            typeDoc: $typeDoc
            doc: $doc
            shortName: $shortName
            businessName: $businessName
            address: $address
            email: $email
            phone: $phone
            userSol: $userSol
            keySol: $keySol
            limit: $limit
            emissionInvoiceWithPreviousDate: $emissionInvoiceWithPreviousDate
            emissionReceiptWithPreviousDate: $emissionReceiptWithPreviousDate
            logo: $logo
            includeIgv: $includeIgv
            percentageIgv: $percentageIgv
            isEnabled: $isEnabled
            isProduction: $isProduction
            certification: $certification
            certificationExpirationDate: $certificationExpirationDate
            certificationKey: $certificationKey
            guideClientId: $guideClientId
            guideClientSecret: $guideClientSecret
            deductionAccount: $deductionAccount
            withStock: $withStock
            catalog: $catalog
            invoiceF: $invoiceF
            invoiceB: $invoiceB
            guide: $guide
            app: $app
            ose: $ose
            accountNumber: $accountNumber
            comment: $comment
            disableContinuePay: $disableContinuePay
        ) {
            message
        }
    }
`;
function CompanyModal({
    modal,
    setModal,
    auth,
    company,
    setCompany,
    initialState,
    fetchCompanies,
    COMPANIES_QUERY,
}: any) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const getAuthContext = () => ({
        headers: {
            "Content-Type": "application/json",
            Authorization: auth?.jwtToken ? `JWT ${auth.jwtToken}` : "",
        },
    });

    function useCustomMutation(
        mutation: DocumentNode,
        refetchQuery: DocumentNode
    ) {
        console.log("USUARIO:", auth?.user.isSuperuser);
        const getAuthContext = () => ({
            headers: {
                "Content-Type": "application/json",
                Authorization: auth?.jwtToken ? `JWT ${auth?.jwtToken}` : "",
            },
        });

        return useMutation(mutation, {
            context: getAuthContext(),
            refetchQueries: () => [
                { query: refetchQuery, context: getAuthContext() },
            ],
            onError: (err) => console.error("Error in unit:", err), // Log the error for debugging
        });
    }
    // Declara las mutaciones al nivel superior del componente
    const [updateCompanyMutation] = useMutation(UPDATE_COMPANY, {
        context: getAuthContext(),
        refetchQueries: [
            {
                query: COMPANIES_QUERY,
                context: getAuthContext()
            }
        ],
        onError: (err) => {
            console.error("Update error:", err);
        }
    });

    const [createCompanyMutation] = useMutation(CREATE_COMPANY, {
        context: getAuthContext(),
        refetchQueries: [
            {
                query: COMPANIES_QUERY,
                context: getAuthContext()
            }
        ],
        onError: (err) => {
            console.error("Create error:", err);
        }
    });
    const [createCompany] = useCustomMutation(CREATE_COMPANY, COMPANIES_QUERY);
    const [updateCompany] = useCustomMutation(UPDATE_COMPANY, COMPANIES_QUERY);
    const handleFileReset = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Restablece el valor del input a una cadena vacía para deseleccionar el archivo
        }
    };
    const handleInputChange = async (
        event: ChangeEvent<
            HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value, type } = event.target;
        if (
            (name === "certification" || name === "certificationKey") &&
            event.target instanceof HTMLInputElement
        ) {
            const file = event.target.files?.[0];

            if (file) {
                try {
                    const base64 = await new Promise<string>(
                        (resolve, reject) => {
                            const reader = new FileReader();
                            reader.onloadend = () =>
                                resolve(reader.result as string);
                            reader.onerror = reject;
                            reader.readAsDataURL(file);
                        }
                    );

                    setCompany((prevCompany: ICompany) => ({
                        ...prevCompany,
                        [name]: base64,
                        // {
                        // file: file,
                        // base64: base64
                        // }
                    }));
                } catch (error) {
                    console.error("File reading error:", error);
                }
            }
            // Verificación adicional para asegurarse de que `files` esté disponible
            // const files = event.target.files; // Ahora TypeScript sabe que `files` existe
            // setCompany((prevCompany: ICompany) => ({
            //     ...prevCompany,
            //     [name]: files?.[0] ?? null, // Guardar el archivo seleccionado o null si no hay archivo
            // }));
        } else {
            setCompany((prevCompany: ICompany) => ({
                ...prevCompany,
                [name]: value,
            }));
        }
    };
    const handleCheckboxChange = ({
        target: { name, checked },
        }: ChangeEvent<HTMLInputElement>) => {
            setCompany({ ...company, [name]: checked });
        };
        // const fileToBase64 = (file: File): Promise<string> => {
        //     return new Promise((resolve, reject) => {
        //         const reader = new FileReader();
        //         reader.readAsDataURL(file);
        //         reader.onload = () => resolve(reader.result as string);
        //         reader.onerror = error => reject(error);
        //     });
        // };
    const validateCompanyData = (companyData: ICompany): string[] => {
        const errors: string[] = [];
        
        // Validación del RUC (11 dígitos)
        if (!companyData.doc || companyData.doc.length !== 11) {
            errors.push("El RUC debe tener exactamente 11 dígitos");
        }
        
        // Validación de razón social
        if (!companyData.businessName || companyData.businessName.trim().length < 3) {
            errors.push("La razón social es requerida y debe tener al menos 3 caracteres");
        }
        
        // Validación de nombre comercial
        if (!companyData.shortName || companyData.shortName.trim().length < 3) {
            errors.push("El nombre comercial es requerido y debe tener al menos 3 caracteres");
        }
        
        // Validación de dirección
        if (!companyData.address || companyData.address.trim().length < 5) {
            errors.push("La dirección es requerida y debe tener al menos 5 caracteres");
        }
        
        // Validación de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!companyData.email || !emailRegex.test(companyData.email)) {
            errors.push("Ingrese un correo electrónico válido");
        }
        
        // Validación de certificación si está en producción
        if (companyData.isProduction && !companyData.certification) {
            errors.push("Se requiere certificado digital para modo producción");
        }
        
        // Agrega más validaciones según necesites...
        
        return errors;
    };
    // const handleSaveCompany = async (e: FormEvent<HTMLFormElement>) => {
    //     e.preventDefault();
    //     setIsSubmitting(true);
    //     // 1. Validación inicial de datos
    //     const validationErrors = validateCompanyData(company);
    //     if (validationErrors.length > 0) {
    //         toast(validationErrors.join("\n"), {
    //             hideProgressBar: true,
    //             autoClose: 5000,
    //             type: "error",
    //         });
    //         return;
    //     }
    //     try {
    //         let result;
    //         let mutationError;
    //         if (Number(company.id) !== 0) {
    //             // Mutación para actualizar
    //             const [update, { loading: updateLoading, error: updateError }] = useMutation(UPDATE_COMPANY, {
    //                 context: getAuthContext(),
    //                 refetchQueries: [
    //                     {
    //                         query: COMPANIES_QUERY,
    //                         context: getAuthContext()
    //                     }
    //                 ],
    //                 onError: (err) => {
    //                     console.error("Update error:", err);
    //                     mutationError = err;
    //                 }
    //             });
    //             result = await update({
    //                 variables: {
    //                     id: company.id,
    //                     typeDoc: "6",
    //                     doc: company.doc,
    //                     shortName: company.shortName,
    //                     businessName: company.businessName,
    //                     address: company.address,
    //                     email: company.email,
    //                     phone: company.phone,
    //                     userSol: company.userSol,
    //                     keySol: company.keySol,
    //                     limit: company.limit,
    //                     emissionInvoiceWithPreviousDate:
    //                         company.emissionInvoiceWithPreviousDate,
    //                     emissionReceiptWithPreviousDate:
    //                         company.emissionReceiptWithPreviousDate,
    //                     logo: company.logo || "",
    //                     includeIgv: company.includeIgv,
    //                     percentageIgv: company.percentageIgv,
    //                     isEnabled: company.isEnabled,
    //                     isProduction: company.isProduction,
    //                     certification: company.certification || "",
    //                     certificationExpirationDate:
    //                         company.certificationExpirationDate,
    //                     certificationKey: company.certificationKey || "",
    //                     guideClientId: company.guideClientId,
    //                     guideClientSecret: company.guideClientSecret,
    //                     deductionAccount: company.deductionAccount,
    //                     withStock: company.withStock,
    //                     catalog: company.catalog,
    //                     invoiceF: company.invoiceF,
    //                     invoiceB: company.invoiceB,
    //                     guide: company.guide,
    //                     app: company.app,
    //                     ose: company.ose,
    //                     accountNumber: company.accountNumber,
    //                     comment: company.comment,
    //                     disableContinuePay: company.disableContinuePay || false,
    //                 },
    //             });
    //             if (updateLoading) {
    //                 toast.info("Actualizando empresa...", {
    //                     hideProgressBar: true,
    //                     autoClose: 2000,
    //                 });
    //             }
    
    //             if (updateError) throw updateError;
    //         } else {
    //             const [create, { loading: createLoading, error: createError }] = useMutation(CREATE_COMPANY, {
    //                 context: getAuthContext(),
    //                 refetchQueries: [
    //                     {
    //                         query: COMPANIES_QUERY,
    //                         context: getAuthContext()
    //                     }
    //                 ],
    //                 onError: (err) => {
    //                     console.error("Create error:", err);
    //                     mutationError = err;
    //                 }
    //             });
    //             result = await createCompany({
    //                 variables: {
    //                     typeDoc: "6",
    //                     doc: company.doc,
    //                     shortName: company.shortName,
    //                     businessName: company.businessName,
    //                     address: company.address,
    //                     email: company.email,
    //                     phone: company.phone,
    //                     userSol: company.userSol,
    //                     keySol: company.keySol,
    //                     limit: company.limit,
    //                     emissionInvoiceWithPreviousDate:
    //                         company.emissionInvoiceWithPreviousDate,
    //                     emissionReceiptWithPreviousDate:
    //                         company.emissionReceiptWithPreviousDate,
    //                     logo: company.logo || "",
    //                     includeIgv: company.includeIgv,
    //                     percentageIgv: company.percentageIgv,
    //                     isEnabled: company.isEnabled,
    //                     isProduction: company.isProduction,
    //                     certification: company.certification || "",
    //                     certificationExpirationDate:
    //                         company.certificationExpirationDate,
    //                     certificationKey: company.certificationKey || "",
    //                     guideClientId: company.guideClientId,
    //                     guideClientSecret: company.guideClientSecret,
    //                     deductionAccount: company.deductionAccount,
    //                     withStock: company.withStock,
    //                     catalog: company.catalog,
    //                     invoiceF: company.invoiceF,
    //                     invoiceB: company.invoiceB,
    //                     guide: company.guide,
    //                     app: company.app,
    //                     ose: company.ose,
    //                     disableContinuePay: company.disableContinuePay || false,
    //                 },
    //             });
    //             if (createLoading) {
    //                 toast.info("Creando empresa...", {
    //                     hideProgressBar: true,
    //                     autoClose: 2000,
    //                 });
    //             }
    
    //             if (createError) throw createError;
    //         }
    //          // 3. Manejar la respuesta
    //         if (!result) {
    //             throw new Error("No se recibió respuesta del servidor");
    //         }

    //         // Verificar errores de GraphQL
    //         if (result.errors) {
    //             const errorMessages = result.errors
    //                 .filter(err => err?.message)
    //                 .map(err => err.message)
    //                 .join(", ");
    //             throw new Error(errorMessages || "Error desconocido en la mutación");
    //         }

    //         // Verificar errores específicos de la operación
    //         const operationResult = Number(company.id) !== 0 
    //             ? result.data?.updateCompany 
    //             : result.data?.createCompany;

    //         if (!operationResult?.success && operationResult?.errors) {
    //             throw new Error(operationResult.errors.join(", "));
    //         }

    //         // 4. Éxito - Mostrar mensaje y resetear
    //         const successMessage = operationResult?.message || 
    //                             (Number(company.id) !== 0 
    //                                 ? "Empresa actualizada correctamente" 
    //                                 : "Empresa creada correctamente");

    //         toast(successMessage, {
    //             hideProgressBar: true,
    //             autoClose: 2000,
    //             type: "success",
    //         });

    //         // 5. Manejar cierre de sesión si es necesario
    //         if (auth?.user?.companyId === Number(company.id)) {
    //             toast.info("Los cambios requieren reiniciar sesión", {
    //                 hideProgressBar: true,
    //                 autoClose: 3000,
    //             });

    //             setTimeout(async () => {
    //                 localStorage.removeItem("auth");
    //                 await signOut({ redirect: true, callbackUrl: "/" });
    //             }, 3000);
    //         } else {
    //             setCompany(initialState);
    //             modal.hide();
    //         }
    //     } catch (error: any) {
    //         console.error("Error completo:", error);
            
    //         // 6. Manejo de errores detallado
    //         let errorMessage = "Error al guardar la empresa";
            
    //         if (error.networkError) {
    //             errorMessage = "Error de conexión con el servidor";
    //             console.error("Network error details:", error.networkError);
    //         } else if (error.graphQLErrors?.length > 0) {
    //             errorMessage = error.graphQLErrors
    //                 .map((e: any) => e.message)
    //                 .join(", ");
    //         } else if (error.message) {
    //             errorMessage = error.message;
    //         } else if (typeof error === 'string') {
    //             errorMessage = error;
    //         }
    
    //         toast(errorMessage, {
    //             hideProgressBar: true,
    //             autoClose: 5000,
    //             type: "error",
    //         });
    //     } finally {
    //         setIsSubmitting(false);
    //     }
    // };
    const handleSaveCompany = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // 1. Validación inicial de datos
        const validationErrors = validateCompanyData(company);
        if (validationErrors.length > 0) {
            toast.error(validationErrors.join("\n"), {
                hideProgressBar: true,
                autoClose: 5000,
            });
            setIsSubmitting(false);
            return;
        }
    
        try {
            // 2. Preparar variables comunes
            const commonVariables = {
                typeDoc: "6",
                doc: company.doc,
                shortName: company.shortName,
                businessName: company.businessName,
                address: company.address,
                email: company.email,
                phone: company.phone,
                userSol: company.userSol,
                keySol: company.keySol,
                limit: company.limit,
                emissionInvoiceWithPreviousDate: company.emissionInvoiceWithPreviousDate,
                emissionReceiptWithPreviousDate: company.emissionReceiptWithPreviousDate,
                logo: company.logo || "",
                includeIgv: company.includeIgv,
                percentageIgv: company.percentageIgv,
                isEnabled: company.isEnabled,
                isProduction: company.isProduction,
                certification: company.certification || "",
                certificationExpirationDate: company.certificationExpirationDate,
                certificationKey: company.certificationKey || "",
                guideClientId: company.guideClientId,
                guideClientSecret: company.guideClientSecret,
                deductionAccount: company.deductionAccount,
                withStock: company.withStock,
                catalog: company.catalog,
                invoiceF: company.invoiceF,
                invoiceB: company.invoiceB,
                guide: company.guide,
                app: company.app,
                ose: company.ose,
                accountNumber: company.accountNumber,
                comment: company.comment,
                disableContinuePay: company.disableContinuePay || false,
            };
    
            // Debug: Mostrar variables que se enviarán
            console.log("Enviando variables:", JSON.stringify({
                ...commonVariables,
                ...(Number(company.id) !== 0 ? { id: company.id } : {})
            }, null, 2));
    
            let result;
            if (Number(company.id) !== 0) {
                // Mutación para actualizar
                toast.info("Actualizando empresa...", {
                    hideProgressBar: true,
                    autoClose: 2000,
                });
    
                result = await updateCompanyMutation({
                    variables: {
                        id: company.id,
                        ...commonVariables
                    },
                });
            } else {
                // Mutación para crear
                toast.info("Creando empresa...", {
                    hideProgressBar: true,
                    autoClose: 2000,
                });
    
                result = await createCompanyMutation({
                    variables: commonVariables,
                });
            }
    
            // 3. Manejo de respuesta mejorado
            if (!result) {
                throw new Error("No se recibió respuesta del servidor");
            }
    
            // Función para extraer mensajes de error de cualquier formato
            const extractErrorMessages = (errorObj: any): string[] => {
                if (!errorObj) return [];
                if (typeof errorObj === 'string') return [errorObj];
                if (Array.isArray(errorObj)) return errorObj.flatMap(e => extractErrorMessages(e));
                if (errorObj.message) return [errorObj.message];
                return [JSON.stringify(errorObj)];
            };
    
            // Combinar todos los posibles errores
            const allErrorMessages = [
                ...extractErrorMessages(result.errors),
                ...extractErrorMessages(result.data?.updateCompany?.errors),
                ...extractErrorMessages(result.data?.createCompany?.errors)
            ];
    
            if (allErrorMessages.length > 0) {
                throw new Error(allErrorMessages.join(" | "));
            }
    
            // Verificar éxito de la operación
            const operationResult = Number(company.id) !== 0 
                ? result.data?.updateCompany 
                : result.data?.createCompany;
            console.log('Operation Result update:', result.data);
            console.log('Operation Result:', {
                result: operationResult,
                success: operationResult?.success,
                typeOfSuccess: typeof operationResult?.success
                });
    
            if (!operationResult?.success) {
                throw new Error(operationResult?.message || "La operación no fue exitosa");
            }
    
            // 4. Éxito - Mostrar mensaje
            const successMessage = operationResult?.message || 
                (Number(company.id) !== 0 
                    ? "Empresa actualizada correctamente" 
                    : "Empresa creada correctamente");
    
            toast.success(successMessage, {
                hideProgressBar: true,
                autoClose: 2000,
            });
    
            // 5. Manejo post-éxito
            if (auth?.user?.companyId === Number(company.id)) {
                toast.info("Los cambios requieren reiniciar sesión", {
                    hideProgressBar: true,
                    autoClose: 3000,
                });
    
                setTimeout(async () => {
                    localStorage.removeItem("auth");
                    await signOut({ redirect: true, callbackUrl: "/" });
                }, 3000);
            } else {
                setCompany(initialState);
                modal.hide();
            }
        } catch (error: any) {
            console.error("Error completo:", error);
            
            // 6. Manejo detallado de errores
            let errorMessage = "Error al guardar la empresa";
            
            // Error de GraphQL
            if (error.graphQLErrors?.length > 0) {
                errorMessage = error.graphQLErrors
                    .map((e: any) => e.message)
                    .join(", ");
            } 
            // Error de red (incluyendo 400)
            else if (error.networkError) {
                console.error("Detalles del error de red:", error.networkError);
                
                if (error.networkError.statusCode === 400) {
                    try {
                        // Intenta parsear el cuerpo del error 400
                        const errorBody = JSON.parse(error.networkError.bodyText);
                        errorMessage = errorBody.message || "Datos inválidos enviados al servidor";
                        
                        // Debug adicional para errores 400
                        console.error("Detalles del error 400:", {
                            statusCode: error.networkError.statusCode,
                            body: errorBody,
                            operation: Number(company.id) !== 0 ? "update" : "create"
                        });
                    } catch (e) {
                        errorMessage = "Error en la solicitud (400)";
                    }
                } else {
                    errorMessage = `Error de conexión (${error.networkError.statusCode || "desconocido"})`;
                }
            } 
            // Error de mensaje directo
            else if (error.message) {
                errorMessage = error.message;
            }
    
            toast.error(errorMessage, {
                hideProgressBar: true,
                autoClose: 5000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]; // Obtiene el primer archivo seleccionado
        // Verifica si se seleccionó un archivo
        if (file) {
            // Verifica el tamaño del archivo
            if (file.size > 30000) {
                // 30KB en bytes
                toast.error("El tamaño del archivo no debe superar los 30KB", {
                    hideProgressBar: true,
                    autoClose: 2000,
                });
                handleFileReset(); // Restablece el input de archivo
                return;
            }

            const reader = new FileReader();

            // Cuando se carga el archivo, verifica las dimensiones de la imagen
            reader.onload = (e: ProgressEvent<FileReader>) => {
                if (e.target?.result) {
                    const img = new Image();
                    img.onload = () => {
                        if (img.width > 300 || img.height > 300) {
                            toast.error(
                                "La imagen no debe superar los 300x300 píxeles",
                                {
                                    hideProgressBar: true,
                                    autoClose: 2000,
                                }
                            );
                            handleFileReset(); // Restablece el input de archivo
                        } else {
                            setCompany((prevCompany: any) => ({
                                ...prevCompany,
                                logo: e.target?.result as string, // Asegúrate de definir el tipo correcto para e.target.result
                            }));
                        }
                    };
                    img.src = e.target.result as string;
                }
            };
            reader.readAsDataURL(file);
        }
        // const file = event.target.files?.[0]; // Obtiene el primer archivo seleccionado
        // // Verifica si se seleccionó un archivo
        // if (file) {
        //     const reader = new FileReader();

        //     // Cuando se carga el archivo, muestra la imagen en el componente
        //     reader.onload = (e: ProgressEvent<FileReader>) => {
        //         if (e.target?.result) {
        //             // console.log(e.target?.result)
        //             //   setUser({...user, avatar:e.target.result});
        //             setCompany((prevCompany: any) => ({
        //                 ...prevCompany,
        //                 logo: e.target?.result as string // Asegúrate de definir el tipo correcto para e.target.result
        //             }));
        //         }
        //     };
        //     reader.readAsDataURL(file);
        // }
    };
    useEffect(() => {
        if (modal == null) {
            const $targetEl = document.getElementById("company-modal");
            const options: ModalOptions = {
                placement: "bottom-right",
                backdrop: "static",
                backdropClasses:
                    "bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40",
                closable: false,
            };
            setModal(new Modal($targetEl, options));
        }
    }, []);
    useEffect(() => {
        console.log(company);
    }, [company]);
    return (
        <div>
            <div
                id="company-modal"
                tabIndex={-1}
                aria-hidden="true"
                className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
            >
                <div className="relative p-4 w-full max-w-4xl max-h-full">
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                        <div className="flex items-center justify-between p-3 md:p-3 border-b rounded-t dark:border-gray-600">
                            <h6 className="font-semibold text-gray-900 dark:text-gray-200">
                                {company.id ? (
                                    <p>Actualizar Empresa</p>
                                ) : (
                                    <p>Registrar Empresa</p>
                                )}
                            </h6>
                            <button
                                type="button"
                                onClick={(e) => {
                                    modal.hide();
                                    setCompany(initialState);
                                }}
                                className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                            >
                                <svg
                                    className="w-3 h-3"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 14 14"
                                >
                                    <path
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                                    />
                                </svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>
                        <div className="p-4 md:p-5">
                            <form onSubmit={handleSaveCompany}>
                                <fieldset>
                                    <legend className=" text-blue-600 font-semibold mb-2">
                                        Datos Empresa
                                    </legend>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="sm:col-span-2">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="relative z-0 w-full mb-2 group sm:col-span-1">
                                                    <input
                                                        type="text"
                                                        name="doc"
                                                        id="doc"
                                                        value={
                                                            company?.doc
                                                                ? company?.doc
                                                                : ""
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        onFocus={(e) =>
                                                            e.target.select()
                                                        }
                                                        className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                                        placeholder=" "
                                                        required
                                                    />
                                                    <label
                                                        htmlFor="doc"
                                                        className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                                                    >
                                                        Numero ruc
                                                    </label>
                                                </div>
                                                <div className="relative z-0 w-full mb-2 group sm:col-span-1">
                                                    <input
                                                        type="text"
                                                        name="shortName"
                                                        id="shortName"
                                                        value={
                                                            company?.shortName
                                                                ? company?.shortName
                                                                : ""
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        onFocus={(e) =>
                                                            e.target.select()
                                                        }
                                                        className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                                        placeholder=" "
                                                        required
                                                    />
                                                    <label
                                                        htmlFor="shortName"
                                                        className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                                                    >
                                                        Nombre comercial
                                                    </label>
                                                </div>
                                                <div className="relative z-0 w-full mb-2 group sm:col-span-2">
                                                    <input
                                                        type="text"
                                                        name="businessName"
                                                        id="businessName"
                                                        value={
                                                            company?.businessName
                                                                ? company?.businessName
                                                                : ""
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        onFocus={(e) =>
                                                            e.target.select()
                                                        }
                                                        className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                                        placeholder=" "
                                                        required
                                                    />
                                                    <label
                                                        htmlFor="businessName"
                                                        className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                                                    >
                                                        Razon Social
                                                    </label>
                                                </div>
                                                <div className="relative z-0 w-full mb-2 group sm:col-span-2">
                                                    <input
                                                        type="text"
                                                        name="address"
                                                        id="address"
                                                        value={
                                                            company?.address
                                                                ? company?.address
                                                                : ""
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        onFocus={(e) =>
                                                            e.target.select()
                                                        }
                                                        className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                                        placeholder=" "
                                                        required
                                                    />
                                                    <label
                                                        htmlFor="address"
                                                        className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                                                    >
                                                        Direccion
                                                    </label>
                                                </div>
                                                <div className="relative z-0 w-full mb-2 group sm:col-span-1">
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        id="email"
                                                        value={
                                                            company?.email
                                                                ? company?.email
                                                                : ""
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        onFocus={(e) =>
                                                            e.target.select()
                                                        }
                                                        className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                                        placeholder=" "
                                                        required
                                                    />
                                                    <label
                                                        htmlFor="email"
                                                        className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                                                    >
                                                        Correo Electronico
                                                    </label>
                                                </div>
                                                <div className="relative z-0 w-full mb-2 group sm:col-span-1">
                                                    <input
                                                        type="text"
                                                        name="phone"
                                                        id="phone"
                                                        value={
                                                            company.phone
                                                                ? company.phone
                                                                : ""
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        onFocus={(e) =>
                                                            e.target.select()
                                                        }
                                                        className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                                        placeholder=" "
                                                    />
                                                    <label
                                                        htmlFor="phone"
                                                        className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                                                    >
                                                        Telefono/Celular
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="sm:col-span-1">
                                            <div className="flex items-center justify-center w-full mb-2">
                                                <label
                                                    htmlFor="logo"
                                                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                                                >
                                                    <div className="flex flex-col items-center justify-center p-2">
                                                        {company?.logo
                                                            ?.length ? (
                                                            <img
                                                                src={
                                                                    company.id &&
                                                                    company.logo?.search(
                                                                        "base64"
                                                                    ) == -1
                                                                        ? `${process.env.NEXT_PUBLIC_BASE_API}/${company.logo}`
                                                                        : company.logo
                                                                }
                                                                alt="Imagen seleccionada"
                                                                style={{
                                                                    maxWidth:
                                                                        "100%",
                                                                    maxHeight:
                                                                        "200px",
                                                                }}
                                                            />
                                                        ) : (
                                                            <>
                                                                <svg
                                                                    className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                                                                    aria-hidden="true"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 20 16"
                                                                >
                                                                    <path
                                                                        stroke="currentColor"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth="2"
                                                                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                                                                    />
                                                                </svg>
                                                                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                                                    <span className="font-semibold">
                                                                        Haga
                                                                        clic
                                                                        para
                                                                        cargar
                                                                    </span>{" "}
                                                                    o arrastrar
                                                                </p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    SVG, PNG,
                                                                    JPG or GIF
                                                                    (MAX.
                                                                    300x300px)
                                                                </p>
                                                            </>
                                                        )}
                                                    </div>
                                                    <input
                                                        id="logo"
                                                        name="logo"
                                                        type="file"
                                                        className="hidden"
                                                        ref={fileInputRef}
                                                        onClick={
                                                            handleFileReset
                                                        }
                                                        onChange={
                                                            handleFileChange
                                                        }
                                                        accept="image/*"
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="relative z-0 w-full mb-2 group sm:col-span-1">
                                            <textarea
                                                name="accountNumber"
                                                id="accountNumber"
                                                rows={2}
                                                maxLength={200}
                                                value={company?.accountNumber ? company?.accountNumber : ""}
                                                onChange={handleInputChange}
                                                onFocus={(e) => e.target.select()}
                                                className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                                placeholder=" "                                                
                                            ></textarea>
                                            <label
                                                htmlFor="accountNumber"
                                                className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                                            >
                                                Cuentas Bancarias
                                            </label>
                                        </div>
                                        <div className="relative z-0 w-full mb-2 group sm:col-span-1">
                                            <textarea
                                                name="deductionAccount"
                                                id="deductionAccount"
                                                rows={2}
                                                maxLength={200}
                                                value={company?.deductionAccount ? company.deductionAccount : ""}
                                                onChange={handleInputChange}
                                                onFocus={(e) => e.target.select()}
                                                className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                                placeholder=" "
                                            ></textarea>
                                            <label
                                                htmlFor="deductionAccount"
                                                className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                                            >
                                                Cuenta de tracción(BN)
                                            </label>
                                        </div>
                                        <div className="relative z-0 w-full mb-2 group sm:col-span-1">
                                            <textarea
                                                name="comment"
                                                id="comment"
                                                rows={2}
                                                maxLength={200}
                                                value={company?.comment ? company?.comment : ""}
                                                onChange={handleInputChange}
                                                onFocus={(e) => e.target.select()}
                                                className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                                placeholder=" "
                                            ></textarea>
                                            <label
                                                htmlFor="comment"
                                                className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                                            >
                                                Comentario
                                            </label>
                                        </div>
                                    </div>
                                </fieldset>
                                {auth?.user.isSuperuser && (
                                    <>
                                <fieldset>
                                    <legend className=" text-blue-600 font-semibold mb-2">
                                        Cuenta Sunat
                                    </legend>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                            <input
                                                type="text"
                                                name="userSol"
                                                id="userSol"
                                                value={
                                                    company?.userSol
                                                        ? company?.userSol
                                                        : ""
                                                }
                                                onChange={handleInputChange}
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                                placeholder=" "                                                
                                            />
                                            <label
                                                htmlFor="userSol"
                                                className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                                            >
                                                Usuario Sol
                                            </label>
                                        </div>
                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                            <input
                                                type="text"
                                                name="keySol"
                                                id="keySol"
                                                value={
                                                    company?.keySol
                                                        ? company.keySol
                                                        : ""
                                                }
                                                onChange={handleInputChange}
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                                placeholder=" "
                                            />
                                            <label
                                                htmlFor="keySol"
                                                className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                                            >
                                                Clave Sol
                                            </label>
                                        </div>
                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                            <input
                                                type="date"
                                                value={
                                                    company?.certificationExpirationDate
                                                        ? company?.certificationExpirationDate
                                                        : ""
                                                }
                                                onChange={handleInputChange}
                                                name="certificationExpirationDate"
                                                className="block pb-2 pt-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                                
                                            />
                                            <label
                                                htmlFor="certificationExpirationDate"
                                                className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                                            >
                                                Fecha expiración
                                            </label>
                                        </div>
                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                            <input
                                                type="text"
                                                name="guideClientId"
                                                id="guideClientId"
                                                maxLength={500}
                                                value={
                                                    company?.guideClientId
                                                        ? company?.guideClientId
                                                        : ""
                                                }
                                                onChange={handleInputChange}
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                                placeholder=" "                                                
                                            />
                                            <label
                                                htmlFor="guideClientId"
                                                className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                                            >
                                                ID Guia cliente
                                            </label>
                                        </div>
                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                            <input
                                                type="text"
                                                name="guideClientSecret"
                                                id="guideClientSecret"
                                                maxLength={500}
                                                value={
                                                    company?.guideClientSecret
                                                        ? company.guideClientSecret
                                                        : ""
                                                }
                                                onChange={handleInputChange}
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                                placeholder=" "
                                            />
                                            <label
                                                htmlFor="guideClientSecret"
                                                className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                                            >
                                                Token Guia Cliente
                                            </label>
                                        </div>
                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                            {/* <input
                                                type="text"
                                                name="deductionAccount"
                                                id="deductionAccount"
                                                maxLength={100}
                                                value={
                                                    company?.deductionAccount
                                                        ? company.deductionAccount
                                                        : ""
                                                }
                                                onChange={handleInputChange}
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                                placeholder=" "
                                            />
                                            <label
                                                htmlFor="deductionAccount"
                                                className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                                            >
                                                Cuenta de tracción(BN)
                                            </label> */}
                                        </div>

                                        <div className="sm:col-span-3 relative z-0 w-full mb-2 group">
                                            <input
                                                ref={fileInputRef}
                                                onChange={handleInputChange}
                                                className="block pt-2.5 pb-1 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                                id="certification"
                                                name="certification"
                                                type="file"
                                            />
                                            <label
                                                className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                                                htmlFor="certification"
                                            >
                                                Certificado Digital
                                            </label>
                                            {company.certification && (
                                                <p className="text-sm text-orange-500 font-bold mt-1">
                                                    Archivo cargado: server.pem
                                                </p>
                                            )}
                                        </div>
                                        <div className="sm:col-span-3 relative z-0 w-full mb-2 group">
                                            <input
                                                ref={fileInputRef}
                                                onChange={handleInputChange}
                                                className="block pt-2.5 pb-1 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                                id="certificationKey"
                                                name="certificationKey"
                                                type="file"
                                            />
                                            <label
                                                className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                                                htmlFor="certificationKey"
                                            >
                                                Clave Certificado Digital
                                            </label>
                                            {company.certificationKey && (
                                                <p className="text-sm text-orange-500 font-bold mt-1">
                                                    Archivo cargado:
                                                    server_key.pem
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </fieldset>

                                <fieldset>
                                    <legend className=" text-blue-600 font-semibold mb-2">
                                        Configuraciones
                                    </legend>
                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                            <input
                                                type="number"
                                                step={1}
                                                min={0}
                                                name="limit"
                                                id="limit"
                                                value={company?.limit!}
                                                onChange={handleInputChange}
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                className="block py-2.5 px-0 w-full text-right text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                                placeholder=" "
                                            />
                                            <label
                                                htmlFor="limit"
                                                className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                                            >
                                                Limite comprobantes
                                            </label>
                                        </div>
                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                            <input
                                                type="number"
                                                step={1}
                                                min={0}
                                                max={7}
                                                name="emissionInvoiceWithPreviousDate"
                                                id="emissionInvoiceWithPreviousDate"
                                                value={
                                                    company?.emissionInvoiceWithPreviousDate
                                                        ? company?.emissionInvoiceWithPreviousDate!
                                                        : 0
                                                }
                                                onChange={handleInputChange}
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                className="text-right block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                                placeholder=" "
                                            />
                                            <label
                                                htmlFor="emissionInvoiceWithPreviousDate"
                                                className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                                            >
                                                Días atras(Facturas)
                                            </label>
                                        </div>
                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                            <input
                                                type="number"
                                                step={1}
                                                min={0}
                                                max={7}
                                                name="emissionReceiptWithPreviousDate"
                                                id="emissionReceiptWithPreviousDate"
                                                value={
                                                    company?.emissionReceiptWithPreviousDate
                                                        ? company?.emissionReceiptWithPreviousDate!
                                                        : 0
                                                }
                                                onChange={handleInputChange}
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                className="block py-2.5 px-0 w-full text-right text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                                placeholder=" "
                                            />
                                            <label
                                                htmlFor="emissionReceiptWithPreviousDate"
                                                className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                                            >
                                                Días atras(Boletas)
                                            </label>
                                        </div>
                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                            <select
                                                value={
                                                    company?.percentageIgv
                                                        ? company?.percentageIgv
                                                        : 18
                                                }
                                                name="percentageIgv"
                                                onChange={handleInputChange}
                                                className="text-right block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:bg-gray-700 dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                                required
                                            >
                                                {/* <option selected>Porcentaje IGV %</option> */}
                                                <option value={18}>18%</option>
                                                <option value={10}>
                                                    10% (Ley 31556)
                                                </option>
                                                <option value={4}>
                                                    4% (IVAP)
                                                </option>
                                            </select>
                                            <label
                                                htmlFor="percentageIgv"
                                                className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300  transform -translate-y-6 scale-75 top-3  origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                                            >
                                                Porcentaje IGV %
                                            </label>
                                        </div>

                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                            <label className="inline-flex items-center mb-1 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    value=""
                                                    id="isEnabled"
                                                    name="isEnabled"
                                                    className="sr-only peer"
                                                    checked={
                                                        company?.isEnabled
                                                            ? company?.isEnabled
                                                            : false
                                                    }
                                                    onChange={
                                                        handleCheckboxChange
                                                    }
                                                />
                                                <div className="relative w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-500 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                                    Estado Activo
                                                </span>
                                            </label>
                                        </div>
                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                            <label className="inline-flex items-center mb-1 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    value=""
                                                    id="includeIgv"
                                                    name="includeIgv"
                                                    className="sr-only peer"
                                                    checked={
                                                        company?.includeIgv
                                                            ? company?.includeIgv
                                                            : false
                                                    }
                                                    onChange={
                                                        handleCheckboxChange
                                                    }
                                                />
                                                <div className="relative w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-500 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                                    Incluir IGV
                                                </span>
                                            </label>
                                        </div>
                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                            <label className="inline-flex items-center mb-1 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    value=""
                                                    id="isProduction"
                                                    name="isProduction"
                                                    className="sr-only peer"
                                                    checked={
                                                        company?.isProduction
                                                            ? company?.isProduction
                                                            : false
                                                    }
                                                    onChange={
                                                        handleCheckboxChange
                                                    }
                                                    disabled={company.isProduction}
                                                />
                                                <div className="relative w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-500 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                                    Producción
                                                </span>
                                            </label>
                                        </div>
                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                            <label className="inline-flex items-center mb-1 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    value=""
                                                    id="withStock"
                                                    name="withStock"
                                                    className="sr-only peer"
                                                    checked={
                                                        company?.withStock
                                                            ? company?.withStock
                                                            : false
                                                    }
                                                    onChange={
                                                        handleCheckboxChange
                                                    }
                                                />
                                                <div className="relative w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-500 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                                    Incluir Stock
                                                </span>
                                            </label>
                                        </div>

                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                            <label className="inline-flex items-center mb-1 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    value=""
                                                    id="invoiceF"
                                                    name="invoiceF"
                                                    className="sr-only peer"
                                                    checked={
                                                        company?.invoiceF
                                                            ? company?.invoiceF
                                                            : false
                                                    }
                                                    onChange={
                                                        handleCheckboxChange
                                                    }
                                                />
                                                <div className="relative w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-500 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                                    Incluir Factura
                                                </span>
                                            </label>
                                        </div>
                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                            <label className="inline-flex items-center mb-1 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    value=""
                                                    id="invoiceB"
                                                    name="invoiceB"
                                                    className="sr-only peer"
                                                    checked={
                                                        company?.invoiceB
                                                            ? company?.invoiceB
                                                            : false
                                                    }
                                                    onChange={
                                                        handleCheckboxChange
                                                    }
                                                />
                                                <div className="relative w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-500 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                                    Incluir Boleta
                                                </span>
                                            </label>
                                        </div>
                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                            <label className="inline-flex items-center mb-1 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    value=""
                                                    id="guide"
                                                    name="guide"
                                                    className="sr-only peer"
                                                    checked={
                                                        company?.guide
                                                            ? company?.guide
                                                            : false
                                                    }
                                                    onChange={
                                                        handleCheckboxChange
                                                    }
                                                />
                                                <div className="relative w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-500 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                                    Incluir Guía
                                                </span>
                                            </label>
                                        </div>

                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                            <label className="inline-flex items-center mb-1 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    value=""
                                                    id="app"
                                                    name="app"
                                                    className="sr-only peer"
                                                    checked={
                                                        company?.app
                                                            ? company?.app
                                                            : false
                                                    }
                                                    onChange={
                                                        handleCheckboxChange
                                                    }
                                                />
                                                <div className="relative w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-500 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                                    Incluir App Mobil
                                                </span>
                                            </label>
                                        </div>
                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                            <label className="inline-flex items-center mb-1 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    value=""
                                                    id="catalog"
                                                    name="catalog"
                                                    className="sr-only peer"
                                                    checked={company.catalog}
                                                    onChange={
                                                        handleCheckboxChange
                                                    }
                                                />
                                                <div className="relative w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-500 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                                    Incluir Catalago
                                                </span>
                                            </label>
                                        </div>
                                        <div className="sm:col-span-1 relative z-0 w-full mb-2 group">
                                            <label className="inline-flex items-center mb-1 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    value=""
                                                    id="ose"
                                                    name="ose"
                                                    className="sr-only peer"
                                                    checked={company.ose}
                                                    onChange={
                                                        handleCheckboxChange
                                                    }
                                                    disabled={company.ose}
                                                />
                                                <div className="relative w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-500 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                                    Ose
                                                </span>
                                            </label>
                                        </div>
                                        <div className="sm:col-span-2 relative z-0 w-full mb-2 group">
                                            <label className="inline-flex items-center mb-1 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    value=""
                                                    id="disableContinuePay"
                                                    name="disableContinuePay"
                                                    className="sr-only peer"
                                                    checked={company.disableContinuePay ||
                                                        false
                                                    }
                                                    onChange={
                                                        handleCheckboxChange
                                                    }
                                                />
                                                <div className="relative w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-500 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                                Deshabilitar Continuar con el
                                                Pago
                                                </span>
                                            </label>
                                        </div>                                        
                                    </div>
                                </fieldset>
                                </>)}
                                <button type="submit" className="btn-blue" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <span>Procesando...</span>
                                    ) : company.id ? (
                                        <span>Actualizar datos empresa</span>
                                    ) : (
                                        <span>Crear datos empresa</span>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CompanyModal;
