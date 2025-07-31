import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Configuración de Izipay (misma que en webhook)
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

// Función para verificar HMAC (similar a Django)
function verifyHmac(data: string, signature: string, key: string): boolean {
    const expectedSignature = crypto
        .createHmac("sha256", key)
        .update(data)
        .digest("base64");

    return signature === expectedSignature;
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

        if (krHash && krHashAlgorithm === "sha256_hmac") {
            const isValidSignature = verifyHmac(
                krAnswer,
                krHash,
                currentConfig.password
            );

            if (!isValidSignature) {
                console.error("❌ Firma HMAC inválida");
                const errorUrl = `/dashboard/payment-balance/payment/error?message=${encodeURIComponent(
                    "Firma de seguridad inválida"
                )}`;
                return NextResponse.redirect(new URL(errorUrl, request.url));
            }

            console.log("✅ Firma HMAC válida");
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
                const answerData = JSON.parse(krAnswer);

                // Dividir el monto por 100 para mostrar el valor correcto (como en Django)
                const rawAmount =
                    answerData.orderDetails?.orderTotalAmount || 0;
                const correctedAmount = rawAmount / 100;

                paymentInfo = {
                    orderId: answerData.orderDetails?.orderId || "",
                    amount: correctedAmount.toString(),
                    currency: answerData.orderDetails?.orderCurrency || "",
                    status: answerData.orderStatus || "",
                    transactionId: answerData.transactions?.[0]?.uuid || "",
                };

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

// También manejar GET para casos donde se accede directamente
export async function GET(request: NextRequest) {
    const successUrl = `/dashboard/payment-balance/payment/success`;
    return NextResponse.redirect(new URL(successUrl, request.url));
}
