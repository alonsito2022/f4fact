import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./styles.css";
import AuthProvider from "@/components/providers/AuthProvider";
import ThemeProvider from "@/components/providers/ThemeProvider";
import { ApolloWrapper } from "@/lib/apollo-wrapper";
import { getServerSession } from "next-auth/next";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { authOptions } from "@/app/api/auth/authOptions";
import { InvoiceTypeModalProvider } from '@/components/context/InvoiceTypeModalContext'
import InvoiceTypeModal from "./dashboard/sales/new/InvoiceTypeModal";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "TUFACT",
    description: "TUFACT - Automatiza, factura, crece",
};

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                {/*
                    Nota: no se usa public/favicon.ico porque el servidor de
                    desarrollo de Next responde 500 con archivos .ico (pasa
                    incluso con el favicon original del proyecto). Estos PNG
                    funcionan y son los que usan los navegadores modernos.
                */}
                <link
                    rel="icon"
                    type="image/png"
                    sizes="32x32"
                    href="/images/tufact-icon-32.png"
                />
                <link
                    rel="icon"
                    type="image/png"
                    sizes="192x192"
                    href="/images/tufact-icon-192.png"
                />
                <link
                    rel="icon"
                    type="image/png"
                    sizes="512x512"
                    href="/images/tufact-icon-512.png"
                />
                <link
                    rel="apple-touch-icon"
                    sizes="180x180"
                    href="/images/tufact-icon-180.png"
                />
            </head>
            <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 `}>
                <AuthProvider session={session}>
                    <InvoiceTypeModalProvider>                    
                        <ThemeProvider
                            attribute="class"
                            defaultTheme="system"
                            enableSystem
                        >
                            <ApolloWrapper>{children}</ApolloWrapper>
                            <ToastContainer />
                        </ThemeProvider>
                        <InvoiceTypeModal />
                    </InvoiceTypeModalProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
