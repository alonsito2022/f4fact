import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        console.log("❌ Pago rechazado recibido:", {
            krAnswer: formData.get("kr-answer"),
            krHash: formData.get("kr-hash"),
            krHashAlgorithm: formData.get("kr-hash-algorithm"),
        });

        // Parsear la respuesta de Izipay para obtener información del error
        const krAnswer = formData.get("kr-answer") as string;
        let errorMessage = "El pago fue rechazado";

        if (krAnswer) {
            try {
                const answerData = JSON.parse(krAnswer);
                const errorCode = answerData.transactions?.[0]?.errorCode;
                const detailedError =
                    answerData.transactions?.[0]?.detailedErrorMessage;

                if (detailedError) {
                    errorMessage = detailedError;
                } else if (errorCode) {
                    errorMessage = `Error ${errorCode}: El pago fue rechazado`;
                }
            } catch (error) {
                console.error("Error parsing kr-answer:", error);
            }
        }

        // Aquí puedes procesar el pago rechazado
        // Por ejemplo, actualizar el estado en tu base de datos

        // Redirigir a la página de error con mensaje específico
        const errorUrl = `/dashboard/payment-balance/payment/error?message=${encodeURIComponent(
            errorMessage
        )}`;
        return NextResponse.redirect(new URL(errorUrl, request.url));
    } catch (error) {
        console.error("❌ Error procesando pago rechazado:", error);

        // En caso de error, redirigir a una página de error genérica
        const errorUrl = `/dashboard/payment-balance/payment/error?message=${encodeURIComponent(
            "Error procesando pago rechazado"
        )}`;
        return NextResponse.redirect(new URL(errorUrl, request.url));
    }
}

// También manejar GET para casos donde se accede directamente
export async function GET(request: NextRequest) {
    const errorUrl = `/dashboard/payment-balance/payment/error?message=${encodeURIComponent(
        "El pago fue rechazado"
    )}`;
    return NextResponse.redirect(new URL(errorUrl, request.url));
}
