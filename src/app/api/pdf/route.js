// import { NextResponse } from "next/server";
// import path from "path";
// import { readFile } from "fs/promises";

// export async function GET() {
//     try {
//         const filePath = path.join(process.cwd(), "public/pdfs/sample.pdf");
//         const fileBuffer = await readFile(filePath);
//         return new NextResponse(fileBuffer, {
//             headers: {
//                 "Content-Type": "application/pdf",
//             },
//         });
//     } catch (error) {
//         return new NextResponse("File not found", { status: 404 });
//     }
// }
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const url = searchParams.get("url");
        const asAttachment = searchParams.get("download") === "1";
        const requestedFilename = (searchParams.get("filename") || "")
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
        if (!requestedFilename || requestedFilename === "documento.pdf") {
            const contentDisposition = response.headers.get("content-disposition");
            if (contentDisposition && contentDisposition.includes("filename=")) {
                const backendFilename = contentDisposition
                    .split("filename=")[1]
                    .replace(/"/g, "")
                    .trim();
                if (
                    backendFilename &&
                    !backendFilename.match(
                        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
                    )
                ) {
                    responseFilename = backendFilename;
                }
            }
        }

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
                "Permissions-Policy": "unload=*",
            },
        });
    } catch (error) {
        return new NextResponse("Error fetching PDF", { status: 500 });
    }
}
