import Link from "next/link";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Browse and explore",
    features: [
      "View recent transactions",
      "Basic politician profiles",
      "30-day historical data",
      "Weekly email digest",
    ],
    cta: "Get started",
    featured: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/mo",
    description: "For active investors",
    features: [
      "Everything in Free",
      "Real-time alerts (email + push)",
      "Unlimited politician tracking",
      "Full historical archive",
      "Performance analytics",
      "API access",
    ],
    cta: "Start free trial",
    featured: true,
  },
  {
    name: "Team",
    price: "$99",
    period: "/mo",
    description: "For firms and researchers",
    features: [
      "Everything in Pro",
      "5 team seats included",
      "Bulk data export",
      "Priority support",
      "Custom integrations",
    ],
    cta: "Contact sales",
    featured: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
      {/* Section header */}
      <div className="mb-12 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          Pricing
        </p>
        <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
          Simple, transparent pricing
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
          Start free. Upgrade when you need real-time alerts and full data access.
        </p>
      </div>

      {/* Pricing cards */}
      <div className="mx-auto grid max-w-4xl gap-px overflow-hidden border border-border bg-border md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`flex flex-col bg-card p-6 ${
              plan.featured ? "bg-secondary/50" : ""
            }`}
          >
            {/* Plan header */}
            <div>
              {plan.featured && (
                <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-wider text-primary">
                  Most popular
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
            <Link
              href={plan.name === "Team" ? "/contact" : "/signup"}
              className={`mt-8 block py-3 text-center text-sm font-medium transition-colors ${
                plan.featured
                  ? "bg-foreground text-background hover:opacity-90"
                  : "border border-foreground hover:bg-foreground hover:text-background"
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      {/* Note */}
      <p className="mt-8 text-center text-sm text-muted-foreground">
        14-day free trial on Pro. No credit card required. Cancel anytime.
      </p>
    </section>
  );
}
