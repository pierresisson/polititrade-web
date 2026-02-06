"use client";

import { useTranslations } from "@/lib/i18n-context";
import {
  m,
  Reveal,
  fadeUp,
  fadeUpReduced,
  stagger,
  useIsReducedMotion,
} from "./motion";

const sourceKeys = ["house", "senate", "sec", "stock"] as const;

export function TrustSection() {
  const { t } = useTranslations();
  const prefersReducedMotion = useIsReducedMotion();

  return (
    <section className="border-y border-border bg-secondary/30">
      <div className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
        {/* Section header */}
        <Reveal className="mb-12 max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            {t("trust.eyebrow")}
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
            {t("trust.title")}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t("trust.subtitle")}
          </p>
        </Reveal>

        {/* Sources - editorial list */}
        <m.div
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
        >
          {sourceKeys.map((key) => (
            <m.div
              key={key}
              variants={prefersReducedMotion ? fadeUpReduced : fadeUp}
            >
              <p className="font-display text-lg font-semibold">
                {t(`trust.sources.${key}.title`)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t(`trust.sources.${key}.description`)}
              </p>
            </m.div>
          ))}
        </m.div>

        {/* Stats bar */}
        <m.div
          className="mt-16 grid grid-cols-2 gap-8 border-t border-border pt-8 md:grid-cols-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
        >
          <m.div variants={prefersReducedMotion ? fadeUpReduced : fadeUp}>
            <p className="font-display text-3xl font-semibold md:text-4xl">99.9%</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("trust.stats.accuracy")}</p>
          </m.div>
          <m.div variants={prefersReducedMotion ? fadeUpReduced : fadeUp}>
            <p className="font-display text-3xl font-semibold md:text-4xl">&lt;15min</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("trust.stats.filingToFeed")}</p>
          </m.div>
          <m.div variants={prefersReducedMotion ? fadeUpReduced : fadeUp}>
            <p className="font-display text-3xl font-semibold md:text-4xl">12 yrs</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("trust.stats.historicalData")}</p>
          </m.div>
          <m.div variants={prefersReducedMotion ? fadeUpReduced : fadeUp}>
            <p className="font-display text-3xl font-semibold md:text-4xl">535</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("trust.stats.membersTracked")}</p>
          </m.div>
        </m.div>
      </div>
    </section>
  );
}
