import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import MainContent from "@/components/MainContent";
import ReduxProviders from "@/redux/providers";
import { SidebarProvider } from "@/components/context/SidebarContext";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ReduxProviders>
            <SidebarProvider>
                <Navbar />
                <div className="flex pt-4 overflow-hidden bg-gray-50 dark:bg-gray-900 font-encodeSansCondensed">
                    <Sidebar />
                    <MainContent>{children}</MainContent>
                </div>
            </SidebarProvider>
        </ReduxProviders>
    );
}
