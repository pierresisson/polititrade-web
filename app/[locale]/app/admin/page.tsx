import { redirect } from "next/navigation";
import { getUserAccessLevel } from "@/lib/auth";
import { AdminDashboard } from "@/components/app/admin-dashboard";
import { buildLocalePath } from "@/lib/i18n";

export const metadata = {
  title: "Admin | PolitiTrades",
  description: "Admin dashboard for PolitiTrades.",
};

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { isAdmin } = await getUserAccessLevel();

  if (!isAdmin) {
    redirect(buildLocalePath("/app/admin/denied", locale));
  }

  return <AdminDashboard />;
}
