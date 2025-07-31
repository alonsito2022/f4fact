import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Configuración de Izipay
const IZIPAY_CONFIG = {
    test: {
        username: "81325114",
        password: "testpassword_LlOkH8bsEV6VavZxPxg8kfDeFzoQDZhuG201WEcaOMMo0",
        publicKey:
            "81325114:testpublickey_4VfiAtUJdrZI97FxPU41vgaNAbm0GVWEkmWIX4vnnAhM2",
    },
    production: {
        username: "81325114",
        password: "prodpassword_CKAvckvYUJd3UCquAG44VRzB8JaIFKPcmqNPubOhgQV2y",
        publicKey:
            "81325114:publickey_2DdsrTALR3DnARWKhzNXN2aPUsjXazw5WeqLddEv2RH6l",
    },
};

// Determinar configuración según entorno
const isProduction = process.env.NODE_ENV === "production";
const currentConfig = isProduction
    ? IZIPAY_CONFIG.production
    : IZIPAY_CONFIG.test;

// Función para verificar HMAC
function verifyHmac(data: string, signature: string, key: string): boolean {
    const expectedSignature = crypto
        .createHmac("sha256", key)
        .update(data)
        .digest("base64");

    // Comparación simple de strings (menos segura pero evita problemas de tipos)
    return signature === expectedSignature;
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

        // Verificar que tenemos los datos mínimos
        if (!orderId || !status) {
            console.error("Datos de webhook incompletos");
            return NextResponse.json(
                { error: "Datos incompletos" },
                { status: 400 }
            );
        }

        // Verificar HMAC si está presente
        if (signature) {
            const isValidSignature = verifyHmac(
                body,
                signature,
                currentConfig.password
            );
            if (!isValidSignature) {
                console.error("Firma HMAC inválida");
                return NextResponse.json(
                    { error: "Firma inválida" },
                    { status: 401 }
                );
            }
        }

        // Procesar el estado del pago
        switch (status) {
            case "SUCCESS":
                // Pago exitoso
                console.log(`Pago exitoso para orden: ${orderId}`);

                // Aquí deberías actualizar tu base de datos
                // await updatePaymentStatus(orderId, 'PAID', transactionId);

                // Enviar notificación por email, etc.
                // await sendPaymentConfirmation(orderId);

                break;

            case "FAILED":
                // Pago fallido
                console.log(`Pago fallido para orden: ${orderId}`);

                // Actualizar estado en base de datos
                // await updatePaymentStatus(orderId, 'FAILED', transactionId);

                break;

            case "CANCELLED":
                // Pago cancelado
                console.log(`Pago cancelado para orden: ${orderId}`);

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
    });
}
