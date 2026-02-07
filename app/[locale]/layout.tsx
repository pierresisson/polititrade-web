import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Toaster } from "sonner";
import "../globals.css";
import { locales, getDictionary, type Locale } from "@/lib/i18n";
import { I18nProvider } from "@/lib/i18n-context";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PolitiTrades - Trade Like an Insider",
  description: "Track insider trades from politicians and executives. Real-time monitoring of congressional stock trades and financial disclosures.",
};

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale as Locale);

  return (
    <html lang={locale}>
      <body
        className={`${fraunces.variable} ${inter.variable} font-body antialiased`}
      >
        <I18nProvider dictionary={dictionary}>{children}</I18nProvider>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
