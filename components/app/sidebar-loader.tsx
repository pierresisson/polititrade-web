import { Suspense } from "react";
import { getUserAccessLevel } from "@/lib/auth";
import { AppSidebar } from "@/components/app/sidebar";
import { TestModeBanner } from "@/components/app/test-mode-banner";

function SidebarSkeleton() {
  return (
    <aside className="hidden h-screen w-64 flex-col border-r border-border bg-card lg:flex animate-pulse">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-border px-4">
        <div className="h-6 w-32 rounded bg-muted" />
      </div>
      {/* Nav items */}
      <nav className="flex-1 space-y-1 p-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-md px-3 py-2">
            <div className="h-5 w-5 rounded bg-muted" />
            <div className="h-4 w-24 rounded bg-muted" />
          </div>
        ))}
      </nav>
      {/* User */}
      <div className="border-t border-border p-2">
        <div className="flex items-center gap-3 rounded-md px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-muted" />
          <div className="flex-1 space-y-1">
            <div className="h-3 w-20 rounded bg-muted" />
            <div className="h-2.5 w-28 rounded bg-muted" />
          </div>
        </div>
      </div>
    </aside>
  );
}

async function SidebarWithUser() {
  const { user, isAdmin } = await getUserAccessLevel();
  return <AppSidebar user={user} isAdmin={isAdmin} />;
}

async function TestModeBannerLoader() {
  const { isSimulated, level } = await getUserAccessLevel();
  if (!isSimulated) return null;
  return <TestModeBanner level={level} />;
}

export function SuspendedSidebar() {
  return (
    <Suspense fallback={<SidebarSkeleton />}>
      <SidebarWithUser />
    </Suspense>
  );
}

export function SuspendedTestBanner() {
  return (
    <Suspense fallback={null}>
      <TestModeBannerLoader />
    </Suspense>
  );
}
