// Pure utility functions for PolitiTrades UI

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function getPartyColor(party: string | null): string {
  if (party === "D") return "text-blue-600";
  if (party === "R") return "text-red-600";
  return "text-muted-foreground";
}

export function getPartyBgColor(party: string | null): string {
  if (party === "D") return "bg-blue-100";
  if (party === "R") return "bg-red-100";
  return "bg-muted";
}

export function formatAmountRange(min: number | null, max: number | null): string {
  if (min == null && max == null) return "—";
  const fmt = (v: number) => {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(v % 1_000_000 === 0 ? 0 : 1)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(v % 1_000 === 0 ? 0 : 0)}K`;
    return `$${v}`;
  };
  if (min != null && max != null) return `${fmt(min)} – ${fmt(max)}`;
  if (min != null) return `${fmt(min)}+`;
  return `Up to ${fmt(max!)}`;
}

export function formatVolume(cents: number): string {
  if (cents >= 1_000_000) return `$${(cents / 1_000_000).toFixed(1)}M`;
  if (cents >= 1_000) return `$${(cents / 1_000).toFixed(0)}K`;
  return `$${cents}`;
}

export function getDaysAgo(date: string | null): number {
  if (!date) return 0;
  const then = new Date(date);
  const now = new Date();
  const diff = now.getTime() - then.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export function formatDate(date: string | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
