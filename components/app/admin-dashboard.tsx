"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, AlertCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslations } from "@/lib/i18n-context";

interface SourceStats {
  total: number;
  parsed: number;
  errors: number;
  lastRun: string | null;
}

interface Trade {
  id: string;
  person_name: string;
  ticker: string | null;
  trade_type: string;
  trade_date: string | null;
  review_status: string | null;
}

export function AdminDashboard() {
  const { t } = useTranslations();
  const [sources, setSources] = useState<Record<string, SourceStats>>({});
  const [trades, setTrades] = useState<Trade[]>([]);
  const [ingesting, setIngesting] = useState(false);
  const [ingestResult, setIngestResult] = useState<"success" | "failed" | null>(null);

  const fetchIngestionStatus = useCallback(async () => {
    const res = await fetch("/api/admin/ingestion");
    if (res.ok) {
      const data = await res.json();
      setSources(data.sources);
    }
  }, []);

  const fetchTrades = useCallback(async () => {
    const res = await fetch("/api/trades?limit=20");
    if (res.ok) {
      const data = await res.json();
      setTrades(data.trades);
    }
  }, []);

  useEffect(() => {
    fetchIngestionStatus();
    fetchTrades();
  }, [fetchIngestionStatus, fetchTrades]);

  const handleTriggerIngestion = async () => {
    setIngesting(true);
    setIngestResult(null);
    try {
      const res = await fetch("/api/admin/ingestion/trigger", { method: "POST" });
      setIngestResult(res.ok ? "success" : "failed");
      if (res.ok) {
        await fetchIngestionStatus();
        await fetchTrades();
      }
    } catch {
      setIngestResult("failed");
    } finally {
      setIngesting(false);
    }
  };

  const handleReviewStatus = async (
    tradeId: string,
    status: "verified" | "to_review" | null
  ) => {
    const res = await fetch(`/api/admin/trades/${tradeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ review_status: status }),
    });
    if (res.ok) {
      setTrades((prev) =>
        prev.map((t) =>
          t.id === tradeId ? { ...t, review_status: status } : t
        )
      );
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        {t("app.admin.title")}
      </h1>

      {/* Ingestion Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>{t("app.admin.ingestion.title")}</CardTitle>
          <div className="flex items-center gap-2">
            {ingestResult === "success" && (
              <span className="text-sm text-success">
                {t("app.admin.ingestion.success")}
              </span>
            )}
            {ingestResult === "failed" && (
              <span className="text-sm text-destructive">
                {t("app.admin.ingestion.failed")}
              </span>
            )}
            <Button
              size="sm"
              onClick={handleTriggerIngestion}
              disabled={ingesting}
            >
              {ingesting && <Loader2 className="h-4 w-4 animate-spin" />}
              {ingesting
                ? t("app.admin.ingestion.running")
                : t("app.admin.ingestion.trigger")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("app.admin.ingestion.source")}</TableHead>
                <TableHead className="text-right">{t("app.admin.ingestion.totalDocs")}</TableHead>
                <TableHead className="text-right">{t("app.admin.ingestion.parsed")}</TableHead>
                <TableHead className="text-right">{t("app.admin.ingestion.errors")}</TableHead>
                <TableHead>{t("app.admin.ingestion.lastRun")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(sources).map(([source, stats]) => (
                <TableRow key={source}>
                  <TableCell className="font-medium">{source}</TableCell>
                  <TableCell className="text-right">{stats.total}</TableCell>
                  <TableCell className="text-right">{stats.parsed}</TableCell>
                  <TableCell className="text-right">
                    {stats.errors > 0 ? (
                      <span className="text-destructive">{stats.errors}</span>
                    ) : (
                      0
                    )}
                  </TableCell>
                  <TableCell>
                    {stats.lastRun
                      ? new Date(stats.lastRun).toLocaleString()
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
              {Object.keys(sources).length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    —
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Trade Review */}
      <Card>
        <CardHeader>
          <CardTitle>{t("app.admin.trades.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("app.admin.trades.person")}</TableHead>
                <TableHead>{t("app.admin.trades.ticker")}</TableHead>
                <TableHead>{t("app.admin.trades.type")}</TableHead>
                <TableHead>{t("app.admin.trades.date")}</TableHead>
                <TableHead>{t("app.admin.trades.reviewStatus")}</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trades.map((trade) => (
                <TableRow key={trade.id}>
                  <TableCell className="font-medium">
                    {trade.person_name}
                  </TableCell>
                  <TableCell>{trade.ticker ?? "—"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        trade.trade_type?.toLowerCase().includes("purchase")
                          ? "default"
                          : "secondary"
                      }
                    >
                      {trade.trade_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {trade.trade_date
                      ? new Date(trade.trade_date).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {trade.review_status === "verified" && (
                      <Badge variant="default" className="gap-1 bg-success text-white">
                        <CheckCircle2 className="h-3 w-3" />
                        {t("app.admin.trades.verified")}
                      </Badge>
                    )}
                    {trade.review_status === "to_review" && (
                      <Badge variant="destructive" className="gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {t("app.admin.trades.toReview")}
                      </Badge>
                    )}
                    {!trade.review_status && (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        title={t("app.admin.trades.markVerified")}
                        onClick={() => handleReviewStatus(trade.id, "verified")}
                      >
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        title={t("app.admin.trades.markToReview")}
                        onClick={() =>
                          handleReviewStatus(trade.id, "to_review")
                        }
                      >
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      </Button>
                      {trade.review_status && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          title={t("app.admin.trades.clearStatus")}
                          onClick={() => handleReviewStatus(trade.id, null)}
                        >
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
