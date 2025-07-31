import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { orderId, amount, currency, status, transactionId } = body;

        console.log("📄 Generando recibo PDF para:", {
            orderId,
            amount,
            currency,
            status,
        });

        // Aquí puedes implementar la generación de PDF del lado del servidor
        // Por ejemplo, usando librerías como puppeteer, pdfkit, o similar

        // Por ahora, retornamos un JSON con la información del recibo
        // En una implementación real, generarías un PDF y lo retornarías como blob

        const receiptData = {
            orderId,
            amount,
            currency,
            status,
            transactionId,
            date: new Date().toISOString(),
            company: "SISTEMAS DE TECNOLOGIA 4 SOLUCIONES S.A.C.",
        };

        // Simular generación de PDF (en producción, aquí generarías el PDF real)
        const pdfContent = `COMPROBANTE DE PAGO
        
Estado: ${status === "PAID" ? "PAGADO" : status}
Monto: ${currency} ${amount}
Número de Orden: ${orderId}
ID de Transacción: ${transactionId}
Fecha: ${new Date().toLocaleDateString("es-PE")}

${receiptData.company}
Gracias por su pago`;

        // Retornar como texto plano (en producción sería un PDF real)
        return new NextResponse(pdfContent, {
            headers: {
                "Content-Type": "text/plain",
                "Content-Disposition": `attachment; filename="recibo-${orderId}.txt"`,
            },
        });
    } catch (error) {
        console.error("❌ Error generando recibo:", error);
        return NextResponse.json(
            { error: "Error generando recibo" },
            { status: 500 }
        );
    }
}
