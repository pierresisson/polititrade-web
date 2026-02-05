"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslations } from "@/lib/i18n-context";
import { Reveal } from "./motion";

export function FAQ() {
  const { t, getSection } = useTranslations();
  const questions = getSection("faq.questions") as Array<{ q: string; a: string }>;

  return (
    <section id="faq" className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
      {/* Section header */}
      <Reveal className="mb-12 max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          {t("faq.eyebrow")}
        </p>
        <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
          {t("faq.title")}
        </h2>
      </Reveal>

      {/* Accordion - minimal editorial style */}
      <Reveal className="max-w-3xl">
        <Accordion type="single" collapsible className="w-full">
          {questions.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="border-b border-border py-2"
            >
              <AccordionTrigger className="py-4 text-left font-display text-lg font-medium hover:no-underline [&[data-state=open]]:text-primary">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </section>
  );
}
