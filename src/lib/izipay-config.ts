import crypto from "crypto";

// Configuración de Izipay
export const IZIPAY_CONFIG = {
    test: {
        username: "81325114",
        password: "testpassword_LlOkH8bsEV6VavZxPxg8kfDeFzoQDZhuG201WEcaOMMo0",
        publicKey:
            "81325114:testpublickey_4VfiAtUJdrZI97FxPU41vgaNAbm0GVWEkmWIX4vnnAhM2",
        // Clave HMACSHA256 para validación de firma (según documentación de Izipay)
        HMACSHA256: "QRvv0G8LRO0hwiGU5SsCoFy540g8vEjGu3EnsNXx5GQW4",
    },
    production: {
        username: "81325114",
        password: "prodpassword_CKAvckvYUJd3UCquAG44VRzB8JaIFKPcmqNPubOhgQV2y",
        publicKey:
            "81325114:publickey_2DdsrTALR3DnARWKhzNXN2aPUsjXazw5WeqLddEv2RH6l",
        // Clave HMACSHA256 para validación de firma (según documentación de Izipay)
        HMACSHA256: "gATgd7wWlfpKygEJdLh7QPR28pM7wu2dUOYEgayd0zY0L",
    },
};

// Determinar configuración según entorno
export const isProduction = process.env.NODE_ENV === "production";
export const currentConfig = isProduction
    ? IZIPAY_CONFIG.production
    : IZIPAY_CONFIG.test;

// URLs de Izipay
export const IZIPAY_URLS = {
    apiUrl: "https://api.micuentaweb.pe",
    paymentUrl:
        "https://api.micuentaweb.pe/api-payment/V4/Charge/CreatePayment",
    jsUrl: "https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js",
    redirectUrl: "https://secure.micuentaweb.pe/payment/init-payment",
};

// Función para verificar HMAC (coincide con implementación de Django)
export function verifyHmac(
    data: string,
    signature: string,
    key: string
): boolean {
    try {
        console.log("🔍 Verificación HMAC (coincide con Django):");
        console.log("  - Key length:", key.length);
        console.log("  - Key (first 10 chars):", key.substring(0, 10) + "...");
        console.log("  - Data length:", data.length);

        // Método 1: Usar HMACSHA256 como en Django (hex)
        const expectedSignature1 = crypto
            .createHmac("sha256", key)
            .update(data, "utf-8")
            .digest("hex");

        // Método 2: Usar base64
        const expectedSignature2 = crypto
            .createHmac("sha256", key)
            .update(data, "utf-8")
            .digest("base64");

        // Método 3: Usar la clave como password
        const expectedSignature3 = crypto
            .createHmac("sha256", currentConfig.password)
            .update(data, "utf-8")
            .digest("hex");

        console.log("  - Firma recibida:", signature);
        console.log("  - Firma calculada (hex):", expectedSignature1);
        console.log("  - Firma calculada (base64):", expectedSignature2);
        console.log("  - Firma calculada (password):", expectedSignature3);
        console.log("  - Coinciden (hex):", signature === expectedSignature1);
        console.log(
            "  - Coinciden (base64):",
            signature === expectedSignature2
        );
        console.log(
            "  - Coinciden (password):",
            signature === expectedSignature3
        );

        // Retornar true si alguna coincide (para desarrollo)
        return (
            signature === expectedSignature1 ||
            signature === expectedSignature2 ||
            signature === expectedSignature3
        );
    } catch (error) {
        console.error("❌ Error en verificación HMAC:", error);
        return false;
    }
}

// Función para crear autenticación Basic
export function createBasicAuth(username: string, password: string): string {
    const credentials = `${username}:${password}`;
    return Buffer.from(credentials).toString("base64");
}

// Función para validar datos de pago
export function validatePaymentData(answerData: any): boolean {
    return (
        answerData.orderStatus === "PAID" &&
        answerData.orderDetails?.orderTotalAmount > 0 &&
        answerData.orderDetails?.orderId &&
        answerData.transactions?.[0]?.uuid
    );
}

// Función para extraer información del pago
export function extractPaymentInfo(answerData: any) {
    const rawAmount = answerData.orderDetails?.orderTotalAmount || 0;
    const correctedAmount = rawAmount / 100;

    return {
        orderId: answerData.orderDetails?.orderId || "",
        amount: correctedAmount.toString(),
        currency: answerData.orderDetails?.orderCurrency || "",
        status: answerData.orderStatus || "",
        transactionId: answerData.transactions?.[0]?.uuid || "",
    };
}

// Función para crear payload de pago
export function createPaymentPayload(
    orderId: string,
    amount: number,
    currency: string,
    customer: any,
    orderDetails: any
) {
    return {
        orderId,
        amount: amount * 100, // Convertir a centavos
        currency,
        customer,
        orderDetails,
    };
}
