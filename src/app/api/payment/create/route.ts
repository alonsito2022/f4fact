import { NextRequest, NextResponse } from "next/server";

// Configuración de Izipay
const IZIPAY_CONFIG = {
    // URLs
    apiUrl: "https://api.micuentaweb.pe",
    paymentUrl:
        "https://api.micuentaweb.pe/api-payment/V4/Charge/CreatePayment",

    // Credenciales de test
    test: {
        username: "81325114",
        password: "testpassword_LlOkH8bsEV6VavZxPxg8kfDeFzoQDZhuG201WEcaOMMo0",
        publicKey:
            "81325114:testpublickey_4VfiAtUJdrZI97FxPU41vgaNAbm0GVWEkmWIX4vnnAhM2",
    },

    // Credenciales de producción
    production: {
        username: "81325114",
        password: "prodpassword_CKAvckvYUJd3UCquAG44VRzB8JaIFKPcmqNPubOhgQV2y",
        publicKey:
            "81325114:publickey_2DdsrTALR3DnARWKhzNXN2aPUsjXazw5WeqLddEv2RH6l",
    },
};

// Determinar si estamos en modo test o producción
const isProduction = process.env.NODE_ENV === "production";
const currentConfig = isProduction
    ? IZIPAY_CONFIG.production
    : IZIPAY_CONFIG.test;

// Función para crear autenticación básica
function createBasicAuth(username: string, password: string): string {
    const credentials = `${username}:${password}`;
    return Buffer.from(credentials).toString("base64");
}

export async function POST(request: NextRequest) {
    console.log("🚀 API: Iniciando creación de pago con Izipay real");

    try {
        const body = await request.json();
        console.log("📥 API: Datos recibidos:", body);

        // Crear autenticación básica
        const authHeader = createBasicAuth(
            currentConfig.username,
            currentConfig.password
        );
        console.log("🔐 API: Autenticación creada");

        // Preparar payload según documentación de Izipay (solo campos obligatorios)
        const paymentPayload = {
            orderId: body.orderId,
            amount: body.amount,
            currency: body.currency,
            customer: {
                email: body.customer.email,
                reference: body.customer.reference,
            },
            orderDetails: {
                orderId: body.orderDetails.orderId,
                orderInfo: body.orderDetails.orderInfo,
                orderMetaData: body.orderDetails.orderMetaData,
            },
            // Solo incluir URLs si están presentes
            ...(body.formAction && { formAction: body.formAction }),
            ...(body.formMethod && { formMethod: body.formMethod }),
            ...(body.returnUrl && { returnUrl: body.returnUrl }),
            ...(body.cancelUrl && { cancelUrl: body.cancelUrl }),
            ...(body.notifyUrl && { notifyUrl: body.notifyUrl }),
        };

        console.log("📤 API: Payload preparado:", paymentPayload);

        // Hacer petición a Izipay
        const response = await fetch(IZIPAY_CONFIG.paymentUrl, {
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

        const responseText = await response.text();
        console.log("📥 API: Respuesta de Izipay - Body:", responseText);

        if (!response.ok) {
            console.error(
                "❌ API: Error en respuesta de Izipay:",
                response.status,
                responseText
            );
            return NextResponse.json(
                {
                    success: false,
                    message: `Error de Izipay: ${response.status}`,
                    details: responseText,
                },
                { status: response.status }
            );
        }

        // Parsear respuesta JSON
        const result = JSON.parse(responseText);
        console.log("🎯 API: Resultado parseado:", result);

        // Verificar si la transacción fue exitosa
        if (
            result.status === "SUCCESS" &&
            result.answer &&
            result.answer.formToken
        ) {
            console.log(
                "✅ API: Transacción exitosa, formToken:",
                result.answer.formToken
            );

            return NextResponse.json({
                success: true,
                formToken: result.answer.formToken,
                orderId: body.orderId,
                ticket: result.ticket,
                status: result.status,
            });
        } else {
            console.error("❌ API: Transacción fallida:", result);
            return NextResponse.json(
                {
                    success: false,
                    message: "Error en la transacción de Izipay",
                    details: result,
                },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error("💥 API: Error en la creación de pago:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Error interno del servidor",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
