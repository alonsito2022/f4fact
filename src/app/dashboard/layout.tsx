import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import ReduxProviders from '@/redux/providers';
export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ReduxProviders>
            {/* <ThemeProvider attribute="class" defaultTheme="system" enableSystem> */}
            <Navbar />
            <div className="flex pt-16 overflow-hidden bg-gray-50 dark:bg-gray-900">
                <Sidebar />
                <div id="main-content" className="relative w-full h-full overflow-y-auto lg:ms-64 bg-gray-50 dark:bg-gray-900">
                    <main>
                        {children}
                    </main>
                    <Footer />
                </div>
            </div>
            {/* </ThemeProvider> */}
        </ReduxProviders>
    )
}