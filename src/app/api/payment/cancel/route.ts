import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    console.log("🚫 Pago cancelado - Callback recibido");

    try {
        const searchParams = request.nextUrl.searchParams;
        const krAnswer = searchParams.get("kr-answer");

        if (!krAnswer) {
            console.error("❌ No se recibió kr-answer");
            return NextResponse.redirect(
                new URL(
                    "/dashboard/payment-balance/payment/error?message=No se recibió respuesta de pago",
                    request.url
                )
            );
        }

        // Decodificar la respuesta de Izipay
        const decodedAnswer = JSON.parse(
            Buffer.from(krAnswer, "base64").toString()
        );

        console.log("🔍 Datos decodificados:", decodedAnswer);

        // Extraer información del pago cancelado
        const paymentInfo = {
            orderId: decodedAnswer.orderId,
            amount: (decodedAnswer.amount / 100).toFixed(2), // Convertir de centavos
            currency: decodedAnswer.currency,
            status: decodedAnswer.status,
        };

        console.log("💰 Información del pago cancelado:", paymentInfo);

        // Registrar evento de pago cancelado en Django
        try {
            const operationId = extractOperationId(paymentInfo.orderId);
            if (operationId) {
                await registerPaymentCancelled(operationId, paymentInfo);
            }
        } catch (error) {
            console.error(
                "❌ Error registrando evento de pago cancelado:",
                error
            );
        }

        // Redirigir a página de error con los datos del pago
        const errorUrl = `/dashboard/payment-balance/payment/error?${new URLSearchParams(
            {
                message: "Pago cancelado por el usuario",
                orderId: paymentInfo.orderId,
                amount: paymentInfo.amount,
            }
        ).toString()}`;

        return NextResponse.redirect(new URL(errorUrl, request.url));
    } catch (error) {
        console.error("❌ Error procesando pago cancelado:", error);
        return NextResponse.redirect(
            new URL(
                "/dashboard/payment-balance/payment/error?message=Error procesando el pago cancelado",
                request.url
            )
        );
    }
}

// Función para extraer operationId del orderId
function extractOperationId(orderId: string): number | null {
    try {
        const match = orderId.match(/ORDER_(\d+)_/);
        if (match) {
            return parseInt(match[1]);
        }
        return null;
    } catch (error) {
        console.error("❌ Error extrayendo operationId:", error);
        return null;
    }
}

// Función para registrar pago cancelado en Django
async function registerPaymentCancelled(operationId: number, paymentInfo: any) {
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
                        mutation PaymentCancelled($operationId: Int!, $responseData: JSONString) {
                            paymentStatus(
                                operationId: $operationId
                                eventType: "PAYMENT_CANCELLED"
                                status: "CANCELLED"
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
                        responseData: JSON.stringify(paymentInfo),
                    },
                }),
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log("✅ Evento de pago cancelado registrado:", result);
        return result;
    } catch (error) {
        console.error("❌ Error registrando pago cancelado:", error);
        throw error;
    }
}
