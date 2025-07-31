import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        console.log("🚫 Pago cancelado recibido:", {
            krAnswer: formData.get("kr-answer"),
            krHash: formData.get("kr-hash"),
            krHashAlgorithm: formData.get("kr-hash-algorithm"),
        });

        // Aquí puedes procesar el pago cancelado
        // Por ejemplo, actualizar el estado en tu base de datos

        // Redirigir a la página de error con mensaje específico
        const errorUrl = `/dashboard/payment-balance/payment/error?message=${encodeURIComponent(
            "El pago fue cancelado por el usuario"
        )}`;
        return NextResponse.redirect(new URL(errorUrl, request.url));
    } catch (error) {
        console.error("❌ Error procesando pago cancelado:", error);

        // En caso de error, redirigir a una página de error genérica
        const errorUrl = `/dashboard/payment-balance/payment/error?message=${encodeURIComponent(
            "Error procesando pago cancelado"
        )}`;
        return NextResponse.redirect(new URL(errorUrl, request.url));
    }
}

// También manejar GET para casos donde se accede directamente
export async function GET(request: NextRequest) {
    const errorUrl = `/dashboard/payment-balance/payment/error?message=${encodeURIComponent(
        "El pago fue cancelado"
    )}`;
    return NextResponse.redirect(new URL(errorUrl, request.url));
}
