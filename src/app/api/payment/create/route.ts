import { NextRequest, NextResponse } from "next/server";
import {
    currentConfig,
    IZIPAY_URLS,
    createBasicAuth,
    createPaymentPayload,
} from "@/lib/izipay-config";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log("🚀 API: Iniciando creación de pago con Izipay real");
        console.log("📥 API: Datos recibidos:", body);

        // Crear autenticación Basic
        const authHeader = createBasicAuth(
            currentConfig.username,
            currentConfig.password
        );
        console.log("🔐 API: Autenticación creada");

        // Crear payload del pago
        const paymentPayload = createPaymentPayload(
            body.orderId,
            body.amount,
            body.currency,
            body.customer,
            body.orderDetails
        );

        console.log("📤 API: Payload preparado:", paymentPayload);

        // Realizar petición a Izipay
        const response = await fetch(IZIPAY_URLS.paymentUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${authHeader}`,
            },
            body: JSON.stringify(paymentPayload),
        });

        console.log("📥 API: Respuesta de Izipay - Status:", response.status);
        console.log(
            "📥 API: Respuesta de Izipay - Headers:",
            Object.fromEntries(response.headers.entries())
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ API: Error en respuesta de Izipay:", errorText);
            throw new Error(
                `Error de Izipay: ${response.status} - ${errorText}`
            );
        }

        const result = await response.json();
        console.log("📥 API: Respuesta de Izipay - Body:", result);
        console.log("🎯 API: Resultado parseado:", result);

        if (result.status === "SUCCESS" && result.answer?.formToken) {
            console.log(
                "✅ API: Transacción exitosa, formToken:",
                result.answer.formToken
            );
            return NextResponse.json({
                success: true,
                formToken: result.answer.formToken,
                ticket: result.ticket,
                serverDate: result.serverDate,
            });
        } else {
            console.error("❌ API: Error en respuesta de Izipay:", result);
            throw new Error(
                result.message || "Error en la respuesta de Izipay"
            );
        }
    } catch (error) {
        console.error("❌ API: Error procesando pago:", error);
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
