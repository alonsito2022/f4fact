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

// Función para extraer operationId del orderId
function extractOperationId(orderId: string): number | null {
    try {
        // Intentar extraer del orderId (formato: ORDER_123456789_abc123)
        const orderMatch = orderId.match(/ORDER_(\d+)_/);
        if (orderMatch) {
            return parseInt(orderMatch[1]);
        }
        return null;
    } catch (error) {
        console.error("❌ Error extrayendo operationId:", error);
        return null;
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const formData = new URLSearchParams(body);

        // Extraer datos del webhook
        const orderId = formData.get("kr-hash-key");
        const transactionId = formData.get("kr-hash");
        const status = formData.get("kr-status");
        const amount = formData.get("kr-amount");
        const currency = formData.get("kr-currency");
        const orderInfo = formData.get("kr-order-id");
        const signature = formData.get("kr-hash-algorithm");

        console.log("Webhook recibido:", {
            orderId,
            transactionId,
            status,
            amount,
            currency,
            orderInfo,
            signature,
        });

        // Verificar HMAC si está presente
        if (signature) {
            const isValidSignature = verifyHmac(
                body,
                signature,
                currentConfig.password
            );
            if (!isValidSignature) {
                console.log(
                    "⚠️ Firma HMAC no coincide en webhook - verificando datos..."
                );

                // En modo desarrollo, ser más permisivo con la firma HMAC
                const shouldContinue = process.env.NODE_ENV === "development";

                if (!shouldContinue) {
                    console.error("❌ Firma HMAC inválida en producción");
                    return NextResponse.json(
                        { error: "Firma inválida" },
                        { status: 401 }
                    );
                }
            } else {
                console.log("✅ Firma HMAC válida en webhook");
            }
        } else {
            console.log("⚠️ No se recibió firma HMAC en webhook");
        }

        // Verificar que tenemos los datos mínimos
        if (!orderId || !status) {
            console.error("Datos de webhook incompletos");
            return NextResponse.json(
                { error: "Datos incompletos" },
                { status: 400 }
            );
        }

        // Extraer operationId para registrar eventos
        const operationId = extractOperationId(orderId);

        // Procesar el estado del pago
        switch (status) {
            case "SUCCESS":
                // Pago exitoso
                console.log(`Pago exitoso para orden: ${orderId}`);

                if (operationId) {
                    try {
                        // Evento: Pago enviado por el cliente
                        await registerPaymentEvent(
                            operationId,
                            "PAYMENT_SUBMITTED",
                            "SUBMITTED",
                            {
                                orderId,
                                amount,
                                currency,
                                status,
                            }
                        );

                        // Evento: Pago autorizado
                        await registerPaymentEvent(
                            operationId,
                            "PAYMENT_AUTHORIZED",
                            "AUTHORIZED",
                            {
                                orderId,
                                transactionId,
                                status,
                            }
                        );

                        // Evento: Fondos capturados (solo en producción)
                        if (process.env.NODE_ENV === "production") {
                            await registerPaymentEvent(
                                operationId,
                                "PAYMENT_CAPTURED",
                                "CAPTURED",
                                {
                                    orderId,
                                    transactionId,
                                    amount,
                                    currency,
                                }
                            );
                        }

                        // Evento: Pago completado
                        await registerPaymentEvent(
                            operationId,
                            "PAYMENT_SUCCESS",
                            "PAID",
                            {
                                orderId,
                                transactionId,
                                amount,
                                currency,
                                status,
                            }
                        );
                    } catch (error) {
                        console.error(
                            "❌ Error registrando eventos de pago:",
                            error
                        );
                    }
                }

                // Aquí deberías actualizar tu base de datos
                // await updatePaymentStatus(orderId, 'PAID', transactionId);

                // Enviar notificación por email, etc.
                // await sendPaymentConfirmation(orderId);

                break;

            case "FAILED":
                // Pago fallido
                console.log(`Pago fallido para orden: ${orderId}`);

                if (operationId) {
                    try {
                        await registerPaymentEvent(
                            operationId,
                            "PAYMENT_FAILED",
                            "FAILED",
                            {
                                orderId,
                                status,
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

                // Actualizar estado en base de datos
                // await updatePaymentStatus(orderId, 'FAILED', transactionId);

                break;

            case "CANCELLED":
                // Pago cancelado
                console.log(`Pago cancelado para orden: ${orderId}`);

                if (operationId) {
                    try {
                        await registerPaymentEvent(
                            operationId,
                            "USER_CANCELLED_PAYMENT",
                            "CANCELLED",
                            {
                                orderId,
                                status,
                            }
                        );
                    } catch (error) {
                        console.error(
                            "❌ Error registrando evento de pago cancelado:",
                            error
                        );
                    }
                }

                // Actualizar estado en base de datos
                // await updatePaymentStatus(orderId, 'CANCELLED', transactionId);

                break;

            default:
                console.log(
                    `Estado desconocido: ${status} para orden: ${orderId}`
                );
        }

        // Responder con éxito
        return NextResponse.json({
            success: true,
            message: "Webhook procesado correctamente",
        });
    } catch (error) {
        console.error("Error procesando webhook:", error);
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
        message: "Webhook endpoint activo",
        timestamp: new Date().toISOString(),
        status: "OK",
        environment: process.env.NODE_ENV,
    });
}
