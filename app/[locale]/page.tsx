import { ComponentExample } from "@/components/component-example";
import { getDictionary, type Locale } from "@/lib/i18n";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return <ComponentExample />;
}
