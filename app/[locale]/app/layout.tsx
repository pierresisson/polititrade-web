import { AppSidebar } from "@/components/app/sidebar";
import { AppHeader } from "@/components/app/header";
import { CommandPalette } from "@/components/command-palette";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <AppHeader />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      <CommandPalette />
    </div>
  );
}
