import { AppPoliticiansList } from "@/components/app/politicians-list";

export const metadata = {
  title: "Politicians | PolitiTrades",
  description: "Browse and track all members of Congress and their stock trades.",
};

export default function PoliticiansPage() {
  return <AppPoliticiansList />;
}
