import { AppSidebar } from "@/components/app/sidebar";
import { AppHeader } from "@/components/app/header";
import { LazyCommandPalette } from "@/components/lazy-command-palette";
import { TestModeBanner } from "@/components/app/test-mode-banner";
import { getUserAccessLevel } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin, isSimulated, level } = await getUserAccessLevel();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <AppSidebar user={user} isAdmin={isAdmin} />

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {isSimulated && <TestModeBanner level={level} />}
        <AppHeader />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      <LazyCommandPalette />
    </div>
  );
}
