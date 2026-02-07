"use client";

import Link from "next/link";
import { getInitials, getPartyColor, getPartyBgColor, formatVolume, formatDisplayName } from "@/lib/helpers";
import type { PoliticianWithStats } from "@/lib/supabase/types";
import { useTranslations, useLocalePath } from "@/lib/i18n-context";
import {
  m,
  Reveal,
  fadeUp,
  fadeUpReduced,
  stagger,
  useIsReducedMotion,
} from "./motion";

type Props = {
  politicians: PoliticianWithStats[];
};

export function TopPoliticians({ politicians }: Props) {
  const { t } = useTranslations();
  const localePath = useLocalePath();
  const prefersReducedMotion = useIsReducedMotion();

  return (
    <section id="politicians" className="border-y border-border bg-secondary/30">
      <div className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
        {/* Section header */}
        <div className="mb-10 flex items-end justify-between">
          <Reveal>
            <div>
              <p className="text-sm font-medium uppercase tracking-widest text-primary">
                {t("politicians.eyebrow")}
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
                {t("politicians.title")}
              </h2>
              <p className="mt-2 max-w-xl text-muted-foreground">
                {t("politicians.subtitle")}
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <Link
              href={localePath("/politicians")}
              className="editorial-link hidden text-sm font-medium sm:inline"
            >
              {t("politicians.viewAllMembers")}
            </Link>
          </Reveal>
        </div>

        {/* Grid */}
        <m.div
          className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
        >
          {politicians.map((p, index) => (
            <m.div
              key={p.id}
              variants={prefersReducedMotion ? fadeUpReduced : fadeUp}
            >
              <Link
                href={localePath(`/politician/${p.id}`)}
                className="group block h-full bg-card p-5 transition-all duration-200 hover:bg-secondary/50 hover:shadow-sm"
              >
                {/* Rank + Avatar */}
                <div className="flex items-start justify-between">
                  <span className="font-display text-3xl font-semibold text-muted-foreground/20">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold ${getPartyBgColor(p.party)} ${getPartyColor(p.party)}`}
                  >
                    {getInitials(p.name)}
                  </div>
                </div>

                {/* Name */}
                <h3 className="mt-3 font-display text-lg font-semibold leading-tight group-hover:text-primary">
                  {formatDisplayName(p.name)}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  <span className={getPartyColor(p.party)}>
                    {p.party === "D" ? t("politicians.dem") : p.party === "R" ? t("politicians.rep") : "Ind"}
                  </span>
                  {" · "}
                  {p.chamber === "House" ? t("politicians.house") : p.chamber === "Senate" ? t("politicians.senate") : "—"}
                  {" · "}
                  {p.state ?? ""}
                </p>

                {/* Stats */}
                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
                  <div>
                    <p className="text-xs text-muted-foreground">{t("politicians.trades")}</p>
                    <p className="font-display text-xl font-semibold">{p.trade_count}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("politicians.volume")}</p>
                    <p className="font-display text-xl font-semibold">{formatVolume(p.volume)}</p>
                  </div>
                </div>
              </Link>
            </m.div>
          ))}
        </m.div>

        {/* Mobile CTA */}
        <Reveal>
          <Link
            href={localePath("/politicians")}
            className="mt-6 block text-sm font-medium text-primary hover:underline sm:hidden"
          >
            {t("politicians.viewAllMembers")} →
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
