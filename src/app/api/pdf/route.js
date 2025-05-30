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
        const filename = searchParams.get("filename") || "documento.pdf";

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

        // Try to get filename from response headers
        const contentDisposition = response.headers.get("content-disposition");
        console.log("contentDisposition", contentDisposition);
        let responseFilename = filename; // default to our parameter
        if (contentDisposition && contentDisposition.includes("filename=")) {
            responseFilename = contentDisposition
                .split("filename=")[1]
                .replace(/"/g, "");
        }

        const pdfBuffer = await response.arrayBuffer();

        return new NextResponse(pdfBuffer, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `inline; filename="${responseFilename}"`,
            },
        });
    } catch (error) {
        return new NextResponse("Error fetching PDF", { status: 500 });
    }
}
