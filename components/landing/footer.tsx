"use client";

import Link from "next/link";
import { useTranslations, useLocalePath } from "@/lib/i18n-context";

export function Footer() {
  const { t } = useTranslations();
  const localePath = useLocalePath();

  return (
    <footer className="border-t border-border">
      {/* Main footer */}
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href={localePath("/")} className="font-display text-xl font-semibold">
              Politi<span className="text-primary">Trades</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              {t("footer.tagline")}
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("footer.product")}
            </p>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="#feed" className="text-sm hover:text-primary">
                  {t("header.liveFeed")}
                </Link>
              </li>
              <li>
                <Link href="#politicians" className="text-sm hover:text-primary">
                  {t("header.politicians")}
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-sm hover:text-primary">
                  {t("pricing.eyebrow")}
                </Link>
              </li>
              <li>
                <Link href={localePath("/api")} className="text-sm hover:text-primary">
                  {t("footer.api")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("footer.company")}
            </p>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href={localePath("/about")} className="text-sm hover:text-primary">
                  {t("footer.about")}
                </Link>
              </li>
              <li>
                <Link href={localePath("/blog")} className="text-sm hover:text-primary">
                  {t("footer.blog")}
                </Link>
              </li>
              <li>
                <Link href={localePath("/privacy")} className="text-sm hover:text-primary">
                  {t("footer.privacy")}
                </Link>
              </li>
              <li>
                <Link href={localePath("/terms")} className="text-sm hover:text-primary">
                  {t("footer.terms")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar - disclaimer */}
      <div className="border-t border-border bg-secondary/30">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <p className="text-xs text-muted-foreground">
            <strong>Disclaimer:</strong> {t("footer.disclaimer")}
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            © {new Date().getFullYear()} {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
