import { NextRequest, NextResponse } from "next/server";
import {
    currentConfig,
    verifyHmac,
    validatePaymentData,
    extractPaymentInfo,
} from "@/lib/izipay-config";

// Función para registrar eventos de pago en Django
async function registerPaymentEvent(
    operationId: number,
    eventType: string,
    status: string,
    data?: any,
    cardInfo?: any,
    clientInfo?: any
) {
    try {
        console.log(`📤 Registrando evento ${eventType}:`, {
            operationId,
            eventType,
            status,
            data,
            cardInfo,
            clientInfo,
        });

        // Extraer información de tarjeta y cliente
        const cardDetails = cardInfo?.cardDetails || cardInfo;
        const extraDetails = clientInfo?.extraDetails || clientInfo;

        const variables = {
            operationId,
            eventType,
            status,
            requestData: data ? JSON.stringify(data) : undefined,
            responseData: data ? JSON.stringify(data) : undefined,
            formToken: data?.formToken,
            amount: data?.amount,
            currency: data?.currency || "PEN",
            cardType: cardDetails?.productCategory,
            cardBrand: cardDetails?.effectiveBrand,
            cardLastFour: cardDetails?.pan?.replace(/.*XXXXXX/, ""),
            installmentNumber: cardDetails?.installmentNumber || 0,
            ipAddress: extraDetails?.ipAddress,
            userAgent: extraDetails?.browserUserAgent,
            // Información adicional de captura
            // captureDate: cardDetails?.captureResponse?.captureDate,
            // captureFileNumber: cardDetails?.captureResponse?.captureFileNumber,
            // authorizationNumber:
            //     cardDetails?.authorizationResponse?.authorizationNumber,
            // authorizationDate:
            //     cardDetails?.authorizationResponse?.authorizationDate,
            // transactionStatus: cardInfo?.status,
            // detailedStatus: cardInfo?.detailedStatus,
        };

        console.log("🔧 Variables para GraphQL:", variables);

        // Log adicional para verificar datos de tarjeta
        console.log("💳 Datos de tarjeta para GraphQL:", {
            cardType: cardDetails?.productCategory,
            cardBrand: cardDetails?.effectiveBrand,
            cardLastFour: cardDetails?.pan?.replace(/.*XXXXXX/, ""),
            installmentNumber: cardDetails?.installmentNumber || 0,
        });

        console.log("👤 Datos de cliente para GraphQL:", {
            ipAddress: extraDetails?.ipAddress,
            userAgent: extraDetails?.browserUserAgent,
        });

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_API}/graphql`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query: `
                        mutation PaymentStatus(
                            $operationId: Int!
                            $eventType: String!
                            $status: String!
                            $requestData: JSONString
                            $responseData: JSONString
                            $formToken: String
                            $amount: Float
                            $currency: String
                            $cardType: String
                            $cardBrand: String
                            $cardLastFour: String
                            $installmentNumber: Int
                            $ipAddress: String
                            $userAgent: String
                        ) {
                            paymentStatus(
                                operationId: $operationId
                                eventType: $eventType
                                status: $status
                                requestData: $requestData
                                responseData: $responseData
                                formToken: $formToken
                                amount: $amount
                                currency: $currency
                                cardType: $cardType
                                cardBrand: $cardBrand
                                cardLastFour: $cardLastFour
                                installmentNumber: $installmentNumber
                                ipAddress: $ipAddress
                                userAgent: $userAgent
                            ) {
                                success
                                cashFlow {
                                    id
                                    status
                                }
                            }
                        }
                    `,
                    variables,
                }),
            }
        );

        console.log("📥 Respuesta del servidor:", {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ Error en respuesta:", {
                status: response.status,
                statusText: response.statusText,
                errorText,
            });
            throw new Error(
                `HTTP ${response.status}: ${response.statusText} - ${errorText}`
            );
        }

        const result = await response.json();
        console.log(`✅ Evento ${eventType} registrado:`, result);
        return result;
    } catch (error) {
        console.error(`❌ Error registrando evento ${eventType}:`, error);
        throw error;
    }
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        console.log("🎉 Pago exitoso recibido:", {
            krAnswer: formData.get("kr-answer"),
            krHash: formData.get("kr-hash"),
            krHashAlgorithm: formData.get("kr-hash-algorithm"),
        });

        // Validación de firma HMAC (como en Django)
        const krHash = formData.get("kr-hash") as string;
        const krHashAlgorithm = formData.get("kr-hash-algorithm") as string;
        const krAnswer = formData.get("kr-answer") as string;

        // Solo validar si tenemos todos los datos necesarios
        if (krHash && krAnswer && krHashAlgorithm === "sha256_hmac") {
            console.log("🔑 Configuración actual:");
            console.log("  - Entorno:", process.env.NODE_ENV);
            console.log(
                "  - Usando configuración:",
                process.env.NODE_ENV === "production" ? "production" : "test"
            );
            console.log("  - Username:", currentConfig.username);
            console.log(
                "  - HMACSHA256 length:",
                currentConfig.HMACSHA256.length
            );

            // Usar HMACSHA256 como en Django
            const isValidSignature = verifyHmac(
                krAnswer,
                krHash,
                currentConfig.HMACSHA256
            );

            if (!isValidSignature) {
                console.log(
                    "⚠️ Firma HMAC no coincide - verificando datos del pago..."
                );

                // En modo desarrollo, ser más permisivo con la firma HMAC
                // pero verificar rigurosamente los datos del pago
                const shouldContinue = process.env.NODE_ENV === "development";

                if (!shouldContinue) {
                    console.error("❌ Firma HMAC inválida en producción");
                    const errorUrl = `/dashboard/payment-balance/payment/error?message=${encodeURIComponent(
                        "Firma de seguridad inválida"
                    )}`;
                    return NextResponse.redirect(
                        new URL(errorUrl, request.url)
                    );
                }
            } else {
                console.log("✅ Firma HMAC válida");
            }
        } else {
            console.log("⚠️ No se pudo validar la firma - datos incompletos");
        }

        // Validación de datos del pago (más importante que la firma HMAC)
        let answerData: any;
        try {
            answerData = JSON.parse(krAnswer);

            if (validatePaymentData(answerData)) {
                console.log("✅ Datos de pago válidos - continuando");
                console.log("  - Status:", answerData.orderStatus);
                console.log(
                    "  - Amount:",
                    answerData.orderDetails?.orderTotalAmount
                );
                console.log("  - OrderId:", answerData.orderDetails?.orderId);
                console.log(
                    "  - TransactionId:",
                    answerData.transactions?.[0]?.uuid
                );
            } else {
                console.error("❌ Datos de pago inválidos");
                const errorUrl = `/dashboard/payment-balance/payment/error?message=${encodeURIComponent(
                    "Datos de pago inválidos"
                )}`;
                return NextResponse.redirect(new URL(errorUrl, request.url));
            }
        } catch (error) {
            console.error("❌ Error parseando datos de pago:", error);
            const errorUrl = `/dashboard/payment-balance/payment/error?message=${encodeURIComponent(
                "Error procesando datos de pago"
            )}`;
            return NextResponse.redirect(new URL(errorUrl, request.url));
        }

        // Extraer operationId del orderId o metadata
        const orderId = answerData.orderDetails?.orderId || "";
        const operationId = extractOperationId(orderId, answerData);

        if (operationId) {
            try {
                // Extraer información de tarjeta y cliente
                const transaction = answerData.transactions?.[0];
                const cardDetails =
                    transaction?.transactionDetails?.cardDetails;
                const customer = answerData.customer;
                const extraDetails = customer?.extraDetails;

                console.log("💳 Información de tarjeta extraída:", {
                    cardType: cardDetails?.productCategory,
                    cardBrand: cardDetails?.effectiveBrand,
                    lastFourDigits: cardDetails?.pan?.replace(/.*XXXXXX/, ""),
                    installments: cardDetails?.installmentNumber || 0,
                });

                console.log("👤 Información del cliente extraída:", {
                    ipAddress: extraDetails?.ipAddress,
                    userAgent: extraDetails?.browserUserAgent,
                    email: customer?.email,
                    reference: customer?.reference,
                });

                // Log adicional para información de captura
                console.log("📋 Información de captura disponible:", {
                    captureResponse: cardDetails?.captureResponse,
                    authorizationResponse: cardDetails?.authorizationResponse,
                    transactionStatus: transaction?.status,
                    detailedStatus: transaction?.detailedStatus,
                    operationType: transaction?.operationType,
                    effectiveStrongAuthentication:
                        transaction?.effectiveStrongAuthentication,
                });

                // 1. Evento: Pago enviado por el cliente
                await registerPaymentEvent(
                    operationId,
                    "PAYMENT_SUBMITTED",
                    "SUBMITTED",
                    {
                        orderId,
                        amount: answerData.orderDetails?.orderTotalAmount,
                        currency: answerData.orderDetails?.orderCurrency,
                        paymentMethod: transaction?.paymentMethodType,
                        formToken: answerData.formToken,
                    },
                    cardDetails,
                    customer
                );

                // 2. Evento: Pago autorizado
                await registerPaymentEvent(
                    operationId,
                    "PAYMENT_AUTHORIZED",
                    "AUTHORIZED",
                    {
                        orderId,
                        transactionId: transaction?.uuid,
                        authorizationCode:
                            cardDetails?.authorizationResponse
                                ?.authorizationNumber,
                        paymentMethod: transaction?.paymentMethodType,
                        formToken: answerData.formToken,
                        amount: answerData.orderDetails?.orderTotalAmount,
                        currency: answerData.orderDetails?.orderCurrency,
                    },
                    cardDetails,
                    customer
                );

                // 3. Evento: Pago exitoso
                await registerPaymentEvent(
                    operationId,
                    "PAYMENT_SUCCESS",
                    "PAID",
                    {
                        orderId,
                        transactionId: transaction?.uuid,
                        amount: answerData.orderDetails?.orderTotalAmount,
                        currency: answerData.orderDetails?.orderCurrency,
                        status: answerData.orderStatus,
                        paymentMethod: transaction?.paymentMethodType,
                        formToken: answerData.formToken,
                    },
                    cardDetails,
                    customer
                );
            } catch (error) {
                console.error("❌ Error registrando eventos de pago:", error);
                // Continuar con el flujo aunque falle el registro de eventos
            }
        }

        // Parsear la respuesta de Izipay para obtener información del pago
        let paymentInfo = {
            orderId: "",
            amount: "",
            currency: "",
            status: "",
            transactionId: "",
        };

        if (krAnswer) {
            try {
                paymentInfo = extractPaymentInfo(answerData);
                console.log("📊 Información del pago procesada:", paymentInfo);
            } catch (error) {
                console.error("Error parsing kr-answer:", error);
            }
        }

        // Aquí puedes procesar la respuesta del pago
        // Por ejemplo, actualizar el estado en tu base de datos
        // await updatePaymentStatus(paymentInfo.orderId, 'PAID', paymentInfo.transactionId);

        // Redirigir a una página de éxito amigable
        const successUrl = `/dashboard/payment-balance/payment/success?${new URLSearchParams(
            {
                orderId: paymentInfo.orderId,
                amount: paymentInfo.amount,
                currency: paymentInfo.currency,
                status: paymentInfo.status,
                transactionId: paymentInfo.transactionId,
                reference:
                    answerData.customer?.reference ||
                    operationId?.toString() ||
                    "",
            }
        ).toString()}`;

        console.log("🔄 Redirigiendo a:", successUrl);
        return NextResponse.redirect(new URL(successUrl, request.url));
    } catch (error) {
        console.error("❌ Error procesando pago exitoso:", error);

        // En caso de error, redirigir a una página de error
        const errorUrl = `/dashboard/payment-balance/payment/error?message=${encodeURIComponent(
            "Error procesando el pago"
        )}`;
        return NextResponse.redirect(new URL(errorUrl, request.url));
    }
}

// Función para extraer operationId del orderId o metadata
function extractOperationId(orderId: string, answerData: any): number | null {
    try {
        console.log("🔍 Extrayendo operationId de:", { orderId, answerData });

        // 1. Intentar extraer de customer reference (más confiable)
        const customerRef = answerData.customer?.reference;
        if (customerRef && !isNaN(parseInt(customerRef))) {
            const operationId = parseInt(customerRef);
            console.log(
                "✅ OperationId extraído de customer.reference:",
                operationId
            );
            return operationId;
        }

        // 2. Intentar extraer del orderId (formato: ORDER_123456789_abc123)
        const orderMatch = orderId.match(/ORDER_(\d+)_/);
        if (orderMatch) {
            const operationId = parseInt(orderMatch[1]);
            console.log("✅ OperationId extraído de orderId:", operationId);
            return operationId;
        }

        // 3. Intentar extraer de metadata si está disponible
        const metadata = answerData.orderDetails?.orderMetaData;
        if (metadata?.documentId) {
            const operationId = parseInt(metadata.documentId);
            console.log(
                "✅ OperationId extraído de metadata.documentId:",
                operationId
            );
            return operationId;
        }

        console.log("⚠️ No se pudo extraer operationId de:", {
            orderId,
            customerRef,
            metadata: answerData.orderDetails?.orderMetaData,
        });
        return null;
    } catch (error) {
        console.error("❌ Error extrayendo operationId:", error);
        return null;
    }
}

// También manejar GET para casos donde se accede directamente
export async function GET(request: NextRequest) {
    const successUrl = `/dashboard/payment-balance/payment/success`;
    return NextResponse.redirect(new URL(successUrl, request.url));
}
