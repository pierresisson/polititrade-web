import { AppPoliticiansList } from "@/components/app/politicians-list";
import { getTopPoliticians } from "@/lib/supabase/queries";

export const metadata = {
  title: "Politicians | PolitiTrades",
  description: "Browse and track all members of Congress and their stock trades.",
};

export default async function PoliticiansPage() {
  const politicians = await getTopPoliticians(100);

  return <AppPoliticiansList politicians={politicians} />;
}
