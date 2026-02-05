"use client";

import { useTranslations } from "@/lib/i18n-context";

export function PoliticiansPageHeader() {
  const { t } = useTranslations();

  return (
    <section className="mx-auto max-w-6xl px-6 py-12 lg:py-16">
      <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">
        {t("politicians.pageEyebrow")}
      </p>
      <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
        {t("politicians.pageTitle")}
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
        {t("politicians.pageSubtitle")}
      </p>
    </section>
  );
}
