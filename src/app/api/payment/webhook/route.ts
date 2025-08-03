import { NextRequest, NextResponse } from "next/server";
import { currentConfig, verifyHmac } from "@/lib/izipay-config";

// Función para registrar eventos de pago en Django
async function registerPaymentEvent(
    operationId: number,
    eventType: string,
    status: string,
    data?: any
) {
    try {
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
                    variables: {
                        operationId,
                        eventType,
                        status,
                        requestData: data ? JSON.stringify(data) : undefined,
                        responseData: data ? JSON.stringify(data) : undefined,
                    },
                }),
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log(`✅ Evento ${eventType} registrado:`, result);
        return result;
    } catch (error) {
        console.error(`❌ Error registrando evento ${eventType}:`, error);
        throw error;
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

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        console.log("🎉 IPN recibido:", {
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
                const shouldContinue = process.env.NODE_ENV === "development";

                if (!shouldContinue) {
                    console.error("❌ Firma HMAC inválida en producción");
                    return NextResponse.json(
                        { error: "Firma de seguridad inválida" },
                        { status: 401 }
                    );
                }
            } else {
                console.log("✅ Firma HMAC válida");
            }
        } else {
            console.log("⚠️ No se pudo validar la firma - datos incompletos");
        }

        // Parsear datos de la respuesta de Izipay
        let answerData: any;
        try {
            answerData = JSON.parse(krAnswer);
        } catch (error) {
            console.error("❌ Error parseando datos de pago:", error);
            return NextResponse.json(
                { error: "Error procesando datos de pago" },
                { status: 400 }
            );
        }

        // Verificar orderStatus como en Django
        const orderStatus = answerData.orderStatus;
        const orderId = answerData.orderDetails?.orderId;
        const transaction = answerData.transactions?.[0];
        const transactionUuid = transaction?.uuid;

        console.log("📊 Estado del pago:", {
            orderStatus,
            orderId,
            transactionUuid,
        });

        // Extraer operationId para registrar eventos
        const operationId = extractOperationId(orderId, answerData);

        // Procesar el estado del pago según orderStatus
        switch (orderStatus) {
            case "PAID":
                // Pago exitoso
                console.log(`✅ Pago exitoso para orden: ${orderId}`);

                if (operationId) {
                    try {
                        // Evento: Pago enviado por el cliente
                        await registerPaymentEvent(
                            operationId,
                            "PAYMENT_SUBMITTED",
                            "SUBMITTED",
                            {
                                orderId,
                                amount: answerData.orderDetails
                                    ?.orderTotalAmount,
                                currency:
                                    answerData.orderDetails?.orderCurrency,
                                status: orderStatus,
                            }
                        );

                        // Evento: Pago autorizado
                        await registerPaymentEvent(
                            operationId,
                            "PAYMENT_AUTHORIZED",
                            "AUTHORIZED",
                            {
                                orderId,
                                transactionId: transactionUuid,
                                status: orderStatus,
                            }
                        );

                        // Evento: Pago exitoso
                        await registerPaymentEvent(
                            operationId,
                            "PAYMENT_SUCCESS",
                            "PAID",
                            {
                                orderId,
                                transactionId: transactionUuid,
                                amount: answerData.orderDetails
                                    ?.orderTotalAmount,
                                currency:
                                    answerData.orderDetails?.orderCurrency,
                                status: orderStatus,
                            }
                        );
                    } catch (error) {
                        console.error(
                            "❌ Error registrando eventos de pago:",
                            error
                        );
                    }
                }

                break;

            case "UNPAID":
                // Pago fallido
                console.log(`❌ Pago fallido para orden: ${orderId}`);

                if (operationId) {
                    try {
                        await registerPaymentEvent(
                            operationId,
                            "PAYMENT_FAILED",
                            "FAILED",
                            {
                                orderId,
                                status: orderStatus,
                                error: "Pago rechazado por el banco",
                            }
                        );
                    } catch (error) {
                        console.error(
                            "❌ Error registrando evento de pago fallido:",
                            error
                        );
                    }
                }

                break;

            default:
                console.log(
                    `⚠️ Estado desconocido: ${orderStatus} para orden: ${orderId}`
                );
        }

        // Responder con éxito como en Django
        return NextResponse.json({
            success: true,
            message: `OK! OrderStatus is ${orderStatus}`,
        });
    } catch (error) {
        console.error("❌ Error procesando IPN:", error);
        return NextResponse.json(
            {
                success: false,
                message:
                    error instanceof Error ? error.message : "Error interno",
            },
            { status: 500 }
        );
    }
}

// También manejar GET para verificación del webhook
export async function GET() {
    return NextResponse.json({
        message: "IPN endpoint activo",
        timestamp: new Date().toISOString(),
        status: "OK",
        environment: process.env.NODE_ENV,
    });
}
