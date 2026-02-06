"use client";

import { BarChart3, Shield, Clock, Users, FileText } from "lucide-react";
import { useTranslations } from "@/lib/i18n-context";
import {
  m,
  Reveal,
  fadeUp,
  fadeUpReduced,
  stagger,
  useIsReducedMotion,
} from "./motion";

const featureKeys = [
  { icon: Clock, key: "realtime" },
  { icon: FileText, key: "official" },
  { icon: BarChart3, key: "analytics" },
  { icon: Users, key: "follow" },
  { icon: Shield, key: "history" },
];

export function ValueProps() {
  const { t } = useTranslations();
  const prefersReducedMotion = useIsReducedMotion();

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
      {/* Section header */}
      <Reveal className="mb-12 max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          {t("valueProps.eyebrow")}
        </p>
        <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
          {t("valueProps.title")}
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          {t("valueProps.subtitle")}
        </p>
      </Reveal>

      {/* Features grid - minimal, text-focused */}
      <m.div
        className="grid gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-3"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={stagger}
      >
        {featureKeys.map((feature) => (
          <m.div
            key={feature.key}
            className="group"
            variants={prefersReducedMotion ? fadeUpReduced : fadeUp}
          >
            <feature.icon className="h-5 w-5 text-primary" />
            <h3 className="mt-3 font-display text-lg font-semibold">
              {t(`valueProps.features.${feature.key}.title`)}
            </h3>
            <p className="mt-2 text-muted-foreground">
              {t(`valueProps.features.${feature.key}.description`)}
            </p>
          </m.div>
        ))}
      </m.div>

      {/* Pull quote */}
      <Reveal delay={0.2}>
        <blockquote className="pull-quote mt-16 max-w-3xl text-xl text-muted-foreground md:text-2xl">
          &ldquo;{t("valueProps.quote")}&rdquo;
        </blockquote>
      </Reveal>
    </section>
  );
}
