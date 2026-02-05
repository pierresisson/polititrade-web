"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { useTranslations, useLocalePath } from "@/lib/i18n-context";
import {
  m,
  Reveal,
  fadeUp,
  fadeUpReduced,
  useIsReducedMotion,
} from "./motion";

const planKeys = ["free", "pro", "team"] as const;

export function Pricing() {
  const { t, getSection } = useTranslations();
  const localePath = useLocalePath();
  const prefersReducedMotion = useIsReducedMotion();

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
      {/* Section header */}
      <div className="mb-12 text-center">
        <Reveal>
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            {t("pricing.eyebrow")}
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
            {t("pricing.title")}
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            {t("pricing.subtitle")}
          </p>
        </Reveal>
      </div>

      {/* Pricing cards */}
      <div className="mx-auto grid max-w-4xl gap-px overflow-hidden border border-border bg-border md:grid-cols-3">
        {planKeys.map((planKey, index) => {
          const plan = getSection(`pricing.plans.${planKey}`) as {
            name: string;
            price: string;
            period?: string;
            description: string;
            cta: string;
            features: string[];
          };
          const isFeatured = planKey === "pro";
          // Pro plan (featured) appears slightly later
          const delay = isFeatured ? 0.15 : index * 0.08;

          return (
            <m.div
              key={planKey}
              className={`flex flex-col bg-card p-6 transition-shadow duration-200 hover:shadow-sm ${
                isFeatured ? "bg-secondary/50" : ""
              }`}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={prefersReducedMotion ? fadeUpReduced : fadeUp}
              transition={{ delay }}
            >
              {/* Plan header */}
              <div>
                {isFeatured && (
                  <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-wider text-primary">
                    {t("pricing.mostPopular")}
                  </span>
                )}
                <h3 className="font-display text-xl font-semibold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mt-6">
                <span className="font-display text-4xl font-semibold">{plan.price}</span>
                {plan.period && (
                  <span className="text-muted-foreground">{plan.period}</span>
                )}
              </div>

              {/* Features */}
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <m.div
                whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                transition={{ duration: 0.12 }}
              >
                <Link
                  href={localePath(planKey === "team" ? "/contact" : "/signup")}
                  className={`mt-8 block py-3 text-center text-sm font-medium transition-all duration-200 ${
                    isFeatured
                      ? "bg-foreground text-background hover:opacity-90"
                      : "border border-foreground hover:bg-foreground hover:text-background"
                  }`}
                >
                  {plan.cta}
                </Link>
              </m.div>
            </m.div>
          );
        })}
      </div>

      {/* Note */}
      <Reveal delay={0.2}>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          {t("pricing.trialNote")}
        </p>
      </Reveal>
    </section>
  );
}
