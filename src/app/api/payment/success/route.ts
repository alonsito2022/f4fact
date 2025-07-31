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
    data?: any
) {
    try {
        console.log(`📤 Registrando evento ${eventType}:`, {
            operationId,
            eventType,
            status,
            data,
        });

        const variables = {
            operationId,
            eventType,
            status,
            requestData: data ? JSON.stringify(data) : undefined,
            responseData: data ? JSON.stringify(data) : undefined,
        };

        console.log("🔧 Variables para GraphQL:", variables);

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_API}/graphql`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query: `
                        mutation PaymentStatus($operationId: Int!, $eventType: String!, $status: String!, $requestData: JSONString, $responseData: JSONString) {
                            paymentStatus(
                                operationId: $operationId
                                eventType: $eventType
                                status: $status
                                requestData: $requestData
                                responseData: $responseData
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
            console.log("  - Password length:", currentConfig.password.length);

            // Usar la password como en la versión anterior que funcionaba
            const isValidSignature = verifyHmac(
                krAnswer,
                krHash,
                currentConfig.password
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
                // 1. Evento: Pago enviado por el cliente
                await registerPaymentEvent(
                    operationId,
                    "PAYMENT_SUBMITTED",
                    "SUBMITTED",
                    {
                        orderId,
                        amount: answerData.orderDetails?.orderTotalAmount,
                        currency: answerData.orderDetails?.orderCurrency,
                        paymentMethod:
                            answerData.transactions?.[0]?.paymentMethod,
                    }
                );

                // 2. Evento: Pago autorizado
                await registerPaymentEvent(
                    operationId,
                    "PAYMENT_AUTHORIZED",
                    "AUTHORIZED",
                    {
                        orderId,
                        transactionId: answerData.transactions?.[0]?.uuid,
                        authorizationCode:
                            answerData.transactions?.[0]?.authorizationCode,
                        paymentMethod:
                            answerData.transactions?.[0]?.paymentMethod,
                    }
                );

                // 3. Evento: Fondos capturados (solo en producción)
                if (process.env.NODE_ENV === "production") {
                    await registerPaymentEvent(
                        operationId,
                        "PAYMENT_CAPTURED",
                        "CAPTURED",
                        {
                            orderId,
                            transactionId: answerData.transactions?.[0]?.uuid,
                            capturedAmount:
                                answerData.orderDetails?.orderTotalAmount,
                            currency: answerData.orderDetails?.orderCurrency,
                        }
                    );
                }

                // 4. Evento: Pago completado
                await registerPaymentEvent(
                    operationId,
                    "PAYMENT_SUCCESS",
                    "PAID",
                    {
                        orderId,
                        transactionId: answerData.transactions?.[0]?.uuid,
                        amount: answerData.orderDetails?.orderTotalAmount,
                        currency: answerData.orderDetails?.orderCurrency,
                        status: answerData.orderStatus,
                        paymentMethod:
                            answerData.transactions?.[0]?.paymentMethod,
                    }
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
