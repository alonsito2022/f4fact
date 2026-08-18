import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    try {
        const { searchParams } = new URL(request.url);
        const url = searchParams.get("url");
        const asAttachment = searchParams.get("download") === "1";
        const requestedFilename = decodeURIComponent(params.filename || "")
            .replace(/["\\\r\n]/g, "")
            .trim();

        if (!url) {
            return new NextResponse("URL parameter is required", {
                status: 400,
            });
        }

        const response = await fetch(url);

        if (!response.ok) {
            return new NextResponse("Failed to fetch PDF", {
                status: response.status,
            });
        }

        let responseFilename = requestedFilename || "documento.pdf";
        if (!responseFilename.toLowerCase().endsWith(".pdf")) {
            responseFilename = `${responseFilename}.pdf`;
        }

        const pdfBuffer = await response.arrayBuffer();
        const disposition = asAttachment ? "attachment" : "inline";
        const encodedFilename = encodeURIComponent(responseFilename);

        return new NextResponse(pdfBuffer, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `${disposition}; filename="${responseFilename}"; filename*=UTF-8''${encodedFilename}`,
                "Permissions-Policy": "unload=(self)",
            },
        });
    } catch (error) {
        return new NextResponse("Error fetching PDF", { status: 500 });
    }
}
