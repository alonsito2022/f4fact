import { NextRequest, NextResponse } from "next/server";
import { currentConfig, verifyHmac } from "@/lib/izipay-config";

// Función para registrar eventos de pago en Django
async function registerPaymentEvent(
    operationId: number | null,
    eventType: string,
    status: string,
    data?: any
) {
    try {
        // Validar que operationId no sea null (permitir 0 para webhooks)
        if (operationId === null || (operationId !== 0 && isNaN(operationId))) {
            console.warn(
                `⚠️ No se puede registrar evento ${eventType} - operationId inválido:`,
                operationId
            );
            return null;
        }

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
                        operationId: parseInt(operationId.toString()),
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

// Función para extraer información detallada de la tarjeta y cliente
function extractDetailedInfo(answerData: any) {
    try {
        const transaction = answerData.transactions?.[0];
        const cardDetails = transaction?.transactionDetails?.cardDetails;
        const customer = answerData.customer;
        const extraDetails = customer?.extraDetails;

        return {
            cardInfo: {
                brand: cardDetails?.effectiveBrand,
                lastFourDigits: cardDetails?.pan?.replace(/.*XXXXXX/, ""),
                cardType: cardDetails?.productCategory,
                nature: cardDetails?.nature,
                installments: cardDetails?.installmentNumber || 1,
                expiryMonth: cardDetails?.expiryMonth,
                expiryYear: cardDetails?.expiryYear,
                issuerName: cardDetails?.issuerName,
                issuerCode: cardDetails?.issuerCode,
            },
            clientInfo: {
                ipAddress: extraDetails?.ipAddress,
                userAgent: extraDetails?.browserUserAgent,
                email: customer?.email,
                reference: customer?.reference,
            },
            transactionInfo: {
                authorizationNumber:
                    cardDetails?.authorizationResponse?.authorizationNumber,
                authorizationDate:
                    cardDetails?.authorizationResponse?.authorizationDate,
                captureDate: cardDetails?.captureResponse?.captureDate,
                captureFileNumber:
                    cardDetails?.captureResponse?.captureFileNumber,
                detailedStatus: transaction?.detailedStatus,
                externalTransactionId:
                    transaction?.transactionDetails?.externalTransactionId,
            },
        };
    } catch (error) {
        console.error("❌ Error extrayendo información detallada:", error);
        return { cardInfo: {}, clientInfo: {}, transactionInfo: {} };
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

        // 4. Intentar extraer del timestamp en el orderId
        const timestampMatch = orderId.match(/ORDER_(\d+)_/);
        if (timestampMatch) {
            const timestamp = parseInt(timestampMatch[1]);
            // Usar timestamp como fallback (no ideal pero funcional)
            console.log("⚠️ Usando timestamp como operationId:", timestamp);
            return timestamp;
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

        // Registrar evento WEBHOOK_RECEIVED
        try {
            // Crear un operationId temporal para webhook recibido
            const webhookOperationId = 0; // Usar 0 como valor especial para webhooks
            await registerPaymentEvent(
                webhookOperationId,
                "WEBHOOK_RECEIVED",
                "RECEIVED",
                {
                    timestamp: new Date().toISOString(),
                    source: "IZIPAY_IPN",
                    headers: Object.fromEntries(request.headers.entries()),
                }
            );
        } catch (error) {
            console.warn("⚠️ No se pudo registrar WEBHOOK_RECEIVED:", error);
        }

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

        // Extraer información detallada
        const detailedInfo = extractDetailedInfo(answerData);
        console.log("📊 Información detallada extraída:", detailedInfo);

        // Validar operationId antes de procesar
        if (!operationId) {
            console.warn(
                "⚠️ No se pudo extraer operationId válido, continuando sin registrar eventos"
            );
        } else {
            console.log("✅ OperationId válido encontrado:", operationId);
        }

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
                                cardInfo: detailedInfo.cardInfo,
                                clientInfo: detailedInfo.clientInfo,
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
                                authorizationNumber:
                                    detailedInfo.transactionInfo
                                        .authorizationNumber,
                                authorizationDate:
                                    detailedInfo.transactionInfo
                                        .authorizationDate,
                                cardInfo: detailedInfo.cardInfo,
                                clientInfo: detailedInfo.clientInfo,
                            }
                        );

                        // Verificar si los fondos fueron capturados
                        const detailedStatus =
                            detailedInfo.transactionInfo.detailedStatus;
                        if (detailedStatus === "CAPTURED") {
                            console.log("💰 Fondos capturados detectados");
                            await registerPaymentEvent(
                                operationId,
                                "PAYMENT_CAPTURED",
                                "CAPTURED",
                                {
                                    orderId,
                                    transactionId: transactionUuid,
                                    captureDate:
                                        detailedInfo.transactionInfo
                                            .captureDate,
                                    captureFileNumber:
                                        detailedInfo.transactionInfo
                                            .captureFileNumber,
                                    status: detailedStatus,
                                    cardInfo: detailedInfo.cardInfo,
                                    clientInfo: detailedInfo.clientInfo,
                                }
                            );
                        }

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
                                cardInfo: detailedInfo.cardInfo,
                                clientInfo: detailedInfo.clientInfo,
                                transactionInfo: detailedInfo.transactionInfo,
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

        // Registrar evento WEBHOOK_PROCESSED
        try {
            await registerPaymentEvent(
                operationId,
                "WEBHOOK_PROCESSED",
                "PROCESSED",
                {
                    orderStatus,
                    orderId,
                    transactionUuid,
                    timestamp: new Date().toISOString(),
                }
            );
        } catch (error) {
            console.warn("⚠️ No se pudo registrar WEBHOOK_PROCESSED:", error);
        }

        // Responder con éxito como en Django
        return NextResponse.json({
            success: true,
            message: `OK! OrderStatus is ${orderStatus}`,
        });
    } catch (error) {
        console.error("❌ Error procesando IPN:", error);

        // Registrar evento WEBHOOK_ERROR
        try {
            await registerPaymentEvent(null, "WEBHOOK_ERROR", "ERROR", {
                error: error instanceof Error ? error.message : "Error interno",
                timestamp: new Date().toISOString(),
                stack: error instanceof Error ? error.stack : undefined,
            });
        } catch (logError) {
            console.error("❌ Error registrando WEBHOOK_ERROR:", logError);
        }

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
