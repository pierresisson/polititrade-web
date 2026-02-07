import { AppHeader } from "@/components/app/header";
import { LazyCommandPalette } from "@/components/lazy-command-palette";
import { SuspendedSidebar, SuspendedTestBanner } from "@/components/app/sidebar-loader";
import { SidebarProvider } from "@/lib/sidebar-context";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        {/* Sidebar — streams in after auth resolves */}
        <SuspendedSidebar />

        {/* Main content — renders immediately */}
        <div className="flex flex-1 flex-col">
          <SuspendedTestBanner />
          <AppHeader />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>

        <LazyCommandPalette />
      </div>
    </SidebarProvider>
  );
}
