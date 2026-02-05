"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Where does PolitiTrades get its data?",
    a: "All data is sourced directly from official government disclosure filings—the House Financial Disclosure Reports, Senate Periodic Transaction Reports, and SEC EDGAR filings. We verify every transaction against the original documents.",
  },
  {
    q: "How quickly do new trades appear?",
    a: "We monitor official filing systems continuously. New trades typically appear within 15 minutes of publication. Pro subscribers receive real-time push notifications.",
  },
  {
    q: "Is it legal for Congress members to trade stocks?",
    a: "Yes. Members of Congress can legally trade stocks, but must disclose trades within 45 days under the STOCK Act (Stop Trading on Congressional Knowledge Act) of 2012. There's ongoing debate about whether this should change.",
  },
  {
    q: "Should I use this data to make investment decisions?",
    a: "PolitiTrades provides information for research and educational purposes. Congressional trading data is one signal among many. Past performance doesn't guarantee future results. Always do your own research and consider consulting a financial advisor.",
  },
  {
    q: "What's included in Pro?",
    a: "Pro includes real-time alerts via email and push, unlimited politician tracking, full historical data back to 2012, performance analytics comparing returns to benchmarks, and API access for building your own tools.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. You can cancel your subscription at any time from your account settings. You'll retain access through the end of your current billing period.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
      {/* Section header */}
      <div className="mb-12 max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          FAQ
        </p>
        <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
          Questions & answers
        </h2>
      </div>

      {/* Accordion - minimal editorial style */}
      <div className="max-w-3xl">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
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
      </div>
    </section>
  );
}
