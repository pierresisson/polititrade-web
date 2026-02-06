"use client";

import Link from "next/link";
import { Check, Lock, Info } from "lucide-react";
import { useTranslations, useLocalePath } from "@/lib/i18n-context";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  m,
  Reveal,
  fadeUp,
  fadeUpReduced,
  useIsReducedMotion,
} from "./motion";

const planKeys = ["guest", "account", "premium"] as const;

interface PlanData {
  name: string;
  tag: string;
  price: string;
  period: string;
  cta: string;
  microcopy: string;
  features: string[];
  locked?: string[];
}

interface ComparisonRow {
  feature: string;
  guest: string;
  account: string;
  premium: string;
}

function getTooltipForFeature(
  feature: string,
  tooltips: Record<string, string>
): string | null {
  const lower = feature.toLowerCase();
  if (lower.includes("csv") || lower.includes("export"))
    return tooltips.exportCsv;
  if (lower.includes("alert") || lower.includes("alerte"))
    return tooltips.alertes;
  if (
    lower.includes("filtr") &&
    (lower.includes("avanc") || lower.includes("advanc"))
  )
    return tooltips.filtresAvances;
  return null;
}

export function Pricing() {
  const { t, getSection } = useTranslations();
  const localePath = useLocalePath();
  const prefersReducedMotion = useIsReducedMotion();
  const tooltips = getSection("pricing.tooltips") as Record<string, string>;
  const comparison = getSection("pricing.comparison") as ComparisonRow[];

  return (
    <TooltipProvider delayDuration={300}>
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
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {planKeys.map((planKey, index) => {
            const plan = getSection(
              `pricing.plans.${planKey}`
            ) as PlanData;
            const isFeatured = planKey === "premium";
            const delay = index * 0.08;

            return (
              <m.div
                key={planKey}
                className="flex"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={prefersReducedMotion ? fadeUpReduced : fadeUp}
                transition={{ delay }}
                whileHover={
                  prefersReducedMotion ? undefined : { y: -4 }
                }
              >
                <Card
                  className={cn(
                    "flex h-full w-full flex-col transition-shadow duration-200",
                    isFeatured
                      ? "bg-accent ring-2 ring-primary/20 shadow-md"
                      : "hover:shadow-sm"
                  )}
                >
                  <CardHeader>
                    <Badge
                      variant={isFeatured ? "default" : "secondary"}
                      className={cn(
                        "w-fit",
                        isFeatured &&
                          "border-transparent bg-amber-light text-foreground"
                      )}
                    >
                      {plan.tag}
                    </Badge>
                    <CardTitle className="mt-3 font-display text-xl font-semibold">
                      {plan.name}
                    </CardTitle>
                    <div className="mt-4">
                      <span className="font-display text-4xl font-semibold tracking-tight">
                        {plan.price}
                      </span>
                      <span className="ml-1 text-sm text-muted-foreground">
                        {plan.period}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="flex flex-1 flex-col">
                    <Separator className="mb-6" />

                    {/* Included features */}
                    <ul className="flex-1 space-y-3">
                      {plan.features.map((feature, i) => {
                        const tooltip = getTooltipForFeature(
                          feature,
                          tooltips
                        );
                        return (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm"
                          >
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                            <span className="flex-1">{feature}</span>
                            {tooltip && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    className="cursor-help"
                                    aria-label="Info"
                                  >
                                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  {tooltip}
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </li>
                        );
                      })}
                    </ul>

                    {/* Locked features */}
                    {plan.locked && plan.locked.length > 0 && (
                      <ul className="mt-4 space-y-2 border-t border-border pt-4">
                        {plan.locked.map((feature, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* CTA */}
                    <div className="mt-8">
                      <m.div
                        whileTap={
                          prefersReducedMotion
                            ? undefined
                            : { scale: 0.98 }
                        }
                        transition={{ duration: 0.12 }}
                      >
                        <Button
                          asChild
                          variant={isFeatured ? "default" : "outline"}
                          size="lg"
                          className="w-full"
                        >
                          <Link href={localePath("/signup")}>
                            {plan.cta}
                          </Link>
                        </Button>
                      </m.div>
                      <p className="mt-2 text-center text-xs text-muted-foreground">
                        {plan.microcopy}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </m.div>
            );
          })}
        </div>

        {/* Comparison table — desktop */}
        <Reveal delay={0.15} className="mt-16 hidden md:block">
          <h3 className="mb-6 text-center font-display text-xl font-semibold">
            {t("pricing.compareTitle")}
          </h3>
          <div className="mx-auto max-w-4xl overflow-hidden rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[200px]" />
                  <TableHead className="text-center">Guest</TableHead>
                  <TableHead className="text-center">Account</TableHead>
                  <TableHead className="text-center font-semibold text-primary">
                    Premium
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparison.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">
                      {row.feature}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {row.guest}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {row.account}
                    </TableCell>
                    <TableCell className="text-center font-medium text-primary">
                      {row.premium}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Reveal>

        {/* Comparison accordion — mobile */}
        <Reveal delay={0.15} className="mt-12 md:hidden">
          <h3 className="mb-6 text-center font-display text-xl font-semibold">
            {t("pricing.compareTitle")}
          </h3>
          <Accordion
            type="single"
            collapsible
            className="overflow-hidden rounded-lg border border-border"
          >
            {comparison.map((row, i) => (
              <AccordionItem key={i} value={`compare-${i}`}>
                <AccordionTrigger className="px-4">
                  {row.feature}
                </AccordionTrigger>
                <AccordionContent className="px-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Guest</span>
                      <span>{row.guest}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Account
                      </span>
                      <span>{row.account}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-primary">
                        Premium
                      </span>
                      <span className="font-medium">{row.premium}</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>

        {/* Transparency note */}
        <Reveal delay={0.2}>
          <p className="mt-10 text-center text-sm text-muted-foreground">
            {t("pricing.transparency")}
          </p>
        </Reveal>
      </section>
    </TooltipProvider>
  );
}
