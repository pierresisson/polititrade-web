import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getDictionary, type Locale, buildLocalePath } from "@/lib/i18n";

export default async function AuthErrorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const auth = dict.auth as Record<string, string>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="text-center">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {auth.errorTitle}
        </h1>
        <p className="mt-4 text-muted-foreground">
          {auth.errorDescription}
        </p>
        <Button asChild className="mt-8">
          <Link href={buildLocalePath("/", locale)}>{auth.backToHome}</Link>
        </Button>
      </div>
    </div>
  );
}
