import { redirect } from "next/navigation";
import { getUserAccessLevel } from "@/lib/auth";
import { AdminDashboard } from "@/components/app/admin-dashboard";

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
    redirect(`/${locale}/app/admin/denied`);
  }

  return <AdminDashboard />;
}
