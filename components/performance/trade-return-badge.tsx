"use client";

import { formatReturn, getReturnColor } from "@/lib/helpers";

type Props = {
  value: number | null | undefined;
  className?: string;
};

export function TradeReturnBadge({ value, className }: Props) {
  return (
    <span
      className={`inline-block font-mono text-sm font-medium ${getReturnColor(value)} ${className ?? ""}`}
    >
      {formatReturn(value)}
    </span>
  );
}
