"use client";

// Customer credit risk: who owes what, for how long, who is paying slower.
// Backend: GET /api/reports/credit-risk (lib/accounting/creditRisk.js).

import { useEffect, useMemo, useState } from "react";
import moment from "moment";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { AlertTriangle, Download, Loader2, RefreshCw, Search } from "lucide-react";

import BackButton from "@/app/Components/BackBotton";
import Notch from "@/app/Components/Notch";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const naira = (n) => `₦${(Number(n) || 0).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
const date = (d) => (d ? moment(d).format("DD MMM YYYY") : "—");
const LEVEL_STYLE = {
  high: "bg-red-600 hover:bg-red-600 text-white",
  medium: "bg-amber-500 hover:bg-amber-500 text-white",
  low: "bg-emerald-600 hover:bg-emerald-600 text-white",
};
const BUCKET_COLORS = ["bg-emerald-500", "bg-lime-500", "bg-amber-500", "bg-orange-600", "bg-red-600"];

export default function CreditRisk() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("customers");
  const [level, setLevel] = useState("all");
  const [query, setQuery] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);
    const r = await api.get("/api/reports/credit-risk");
    setLoading(false);
    if (!r.ok) return setError(r.error);
    setReport(r.data);
  };

  useEffect(() => {
    load();
  }, []);

  const s = report?.summary;
  const byId = useMemo(() => new Map((report?.customers || []).map((c) => [c.customerId, c])), [report]);
  const customers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (report?.customers || []).filter(
      (c) => (level === "all" || c.level === level) && (!q || c.name.toLowerCase().includes(q) || (c.salesRep || "").toLowerCase().includes(q)),
    );
  }, [report, level, query]);

  const exportExcel = () => {
    if (!report) return;
    const wb = XLSX.utils.book_new();
    const labels = Object.fromEntries(report.buckets.map((b) => [b.key, b.label]));
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet([
        ["Credit risk", moment(report.asOf).format("DD MMM YYYY")],
        [],
        ["Total receivables", s.totalReceivables],
        ["Customers owing", s.customersOwing],
        ["Overdue (over 30 days)", s.overdue],
        ["Overdue share %", s.overdueShare],
        ["Days sales outstanding", s.dso ?? ""],
        ["Average days to pay", s.avgDaysToPay ?? ""],
        ["Top 10 customers' share %", s.top10Share],
        ["Over credit limit", s.overLimit],
        ["High risk", s.highRisk],
        [],
        ...report.buckets.map((b) => [b.label, report.aging[b.key]]),
        ["Not on statement", s.notOnStatement],
      ]),
      "Summary",
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        report.customers.map((c) => ({
          Customer: c.name,
          "Sales rep": c.salesRep || "",
          Owes: c.debt,
          "Credit limit": c.creditLimit,
          "Limit used %": c.limitUsed ?? "",
          ...Object.fromEntries(report.buckets.map((b) => [labels[b.key], c.buckets[b.key]])),
          "Not on statement": c.notOnStatement,
          "Oldest open (days)": c.oldestDays,
          "Avg days to pay": c.avgDaysToPay ?? "",
          "Days to pay, previous 90 days": c.priorDaysToPay ?? "",
          "Days to pay, last 90 days": c.recentDaysToPay ?? "",
          "Last payment": date(c.lastPayment),
          "Last purchase": date(c.lastPurchase),
          Risk: c.level,
          Score: c.score,
          Why: c.reasons.join("; "),
        })),
      ),
      "Customers",
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(report.byRep.map((r) => ({ "Sales rep": r.salesRep, Customers: r.customers, Owes: r.debt, Overdue: r.overdue, "High risk": r.highRisk }))),
      "By sales rep",
    );
    const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([out], { type: "application/octet-stream" }), `Credit_risk_${moment(report.asOf).format("YYYY-MM-DD")}.xlsx`);
  };

  return (
    <div className="flex flex-col min-w-0">
      <Notch>
        <BackButton />
      </Notch>

      <main className="p-4 space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Credit risk</h1>
            <p className="text-sm text-muted-foreground">
              Who owes what, for how long, and who is paying slower. Payments are matched to the oldest invoices first.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={load} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span className="ml-2">Refresh</span>
            </Button>
            <Button variant="outline" onClick={exportExcel} disabled={!report || loading}>
              <Download className="h-4 w-4" />
              <span className="ml-2">Excel</span>
            </Button>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {loading && !report && <p className="text-sm text-muted-foreground">Working through every customer&apos;s statement…</p>}

        {s && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
              <Stat label="Owed to you" value={naira(s.totalReceivables)} hint={`${s.customersOwing} customers`} />
              <Stat label="Overdue (30+ days)" value={naira(s.overdue)} hint={`${s.overdueShare}% of what's owed`} warn={s.overdueShare >= 50} />
              <Stat label="Days sales outstanding" value={s.dso ?? "—"} hint="days of sales owed" />
              <Stat label="Average days to pay" value={s.avgDaysToPay ?? "—"} hint="last 12 months" />
              <Stat label="Top 10 customers" value={`${s.top10Share}%`} hint="of what's owed" warn={s.top10Share >= 60} />
              <Stat label="High risk" value={s.highRisk} hint={`${s.overLimit} over credit limit`} warn={s.highRisk > 0} />
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Ageing of what&apos;s owed</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex h-4 w-full overflow-hidden rounded">
                  {report.buckets.map((b, i) => {
                    const pct = s.totalReceivables ? (report.aging[b.key] / s.totalReceivables) * 100 : 0;
                    return pct > 0 ? <div key={b.key} className={BUCKET_COLORS[i]} style={{ width: `${pct}%` }} title={`${b.label}: ${naira(report.aging[b.key])}`} /> : null;
                  })}
                  {s.notOnStatement > 0 && (
                    <div className="bg-slate-400" style={{ width: `${(s.notOnStatement / s.totalReceivables) * 100}%` }} title={`Not on statement: ${naira(s.notOnStatement)}`} />
                  )}
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs">
                  {report.buckets.map((b, i) => (
                    <span key={b.key} className="flex items-center gap-1">
                      <span className={`inline-block h-2 w-2 rounded-sm ${BUCKET_COLORS[i]}`} /> {b.label}: <b>{naira(report.aging[b.key])}</b>
                    </span>
                  ))}
                  {s.notOnStatement > 0 && (
                    <span className="flex items-center gap-1" title="Part of the balance the customer statement doesn't explain (e.g. opening balances)">
                      <span className="inline-block h-2 w-2 rounded-sm bg-slate-400" /> Not on statement: <b>{naira(s.notOnStatement)}</b>
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-2">
              {[
                ["customers", "Customers"],
                ["watch", "Watch lists"],
                ["reps", "By sales rep"],
              ].map(([k, label]) => (
                <Button key={k} size="sm" variant={tab === k ? "default" : "outline"} onClick={() => setTab(k)}>
                  {label}
                </Button>
              ))}
            </div>

            {tab === "customers" && (
              <Card>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {["all", "high", "medium", "low"].map((l) => (
                      <Button key={l} size="sm" variant={level === l ? "default" : "outline"} onClick={() => setLevel(l)}>
                        {l === "all" ? "All" : `${l[0].toUpperCase()}${l.slice(1)} risk`}
                      </Button>
                    ))}
                    <div className="relative ml-auto w-full sm:w-64">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input className="pl-8" placeholder="Customer or sales rep" value={query} onChange={(e) => setQuery(e.target.value)} />
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Customer</TableHead>
                          <TableHead>Risk</TableHead>
                          <TableHead className="text-right">Owes</TableHead>
                          <TableHead className="text-right">Overdue</TableHead>
                          <TableHead className="text-right">Limit used</TableHead>
                          <TableHead className="text-right">Oldest</TableHead>
                          <TableHead className="text-right">Days to pay</TableHead>
                          <TableHead>Last payment</TableHead>
                          <TableHead>Why</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customers.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center text-muted-foreground">
                              No customers match.
                            </TableCell>
                          </TableRow>
                        )}
                        {customers.map((c) => (
                          <TableRow key={c.customerId}>
                            <TableCell>
                              <div className="font-medium">{c.name}</div>
                              {c.salesRep && <div className="text-xs text-muted-foreground">{c.salesRep}</div>}
                            </TableCell>
                            <TableCell>
                              <Badge className={LEVEL_STYLE[c.level]}>{c.level}</Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">{naira(c.debt)}</TableCell>
                            <TableCell className="text-right">{naira(c.overdue)}</TableCell>
                            <TableCell className={`text-right ${c.limitUsed > 100 ? "text-red-600 font-medium" : ""}`}>
                              {c.limitUsed === null ? "—" : `${c.limitUsed}%`}
                            </TableCell>
                            <TableCell className="text-right">{c.oldestDays ? `${c.oldestDays} d` : "—"}</TableCell>
                            <TableCell className="text-right whitespace-nowrap">
                              {c.avgDaysToPay ?? "—"}
                              {c.priorDaysToPay !== null && c.recentDaysToPay !== null && c.recentDaysToPay !== c.priorDaysToPay && (
                                <span className={`ml-1 text-xs ${c.recentDaysToPay > c.priorDaysToPay ? "text-red-600" : "text-emerald-600"}`}>
                                  {c.recentDaysToPay > c.priorDaysToPay ? "▲" : "▼"} {c.recentDaysToPay}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">{date(c.lastPayment)}</TableCell>
                            <TableCell className="text-xs text-muted-foreground max-w-[18rem]">{c.reasons.join("; ") || "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {tab === "watch" && (
              <div className="grid gap-4 lg:grid-cols-2">
                <WatchList title="Over credit limit" ids={report.lists.overLimit} byId={byId} detail={(c) => `${naira(c.debt)} of ${naira(c.creditLimit)} limit`} />
                <WatchList title="Gone quiet (owing, no payment in 60 days)" ids={report.lists.goneQuiet} byId={byId} detail={(c) => `${naira(c.debt)} · last paid ${date(c.lastPayment)}`} />
                <WatchList title="Paying slower" ids={report.lists.slowing} byId={byId} detail={(c) => `${c.priorDaysToPay} → ${c.recentDaysToPay} days · owes ${naira(c.debt)}`} />
                <WatchList title="Top 10 debtors" ids={report.lists.topDebtors} byId={byId} detail={(c) => `${naira(c.debt)} · ${c.level} risk`} />
              </div>
            )}

            {tab === "reps" && (
              <Card>
                <CardContent className="pt-4 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sales rep</TableHead>
                        <TableHead className="text-right">Customers owing</TableHead>
                        <TableHead className="text-right">Owed</TableHead>
                        <TableHead className="text-right">Overdue</TableHead>
                        <TableHead className="text-right">High risk</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.byRep.map((r) => (
                        <TableRow key={r.salesRep}>
                          <TableCell className="font-medium">{r.salesRep}</TableCell>
                          <TableCell className="text-right">{r.customers}</TableCell>
                          <TableCell className="text-right">{naira(r.debt)}</TableCell>
                          <TableCell className="text-right">{naira(r.overdue)}</TableCell>
                          <TableCell className={`text-right ${r.highRisk ? "text-red-600 font-medium" : ""}`}>{r.highRisk}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            <p className="text-xs text-muted-foreground">
              Risk weighs debt over 90 days old, credit-limit use, time since the last payment and whether payments are getting
              slower (last 90 days vs the 90 before). “Not on statement” is part of a balance the customer statement doesn&apos;t
              explain, usually an opening balance.
            </p>
          </>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value, hint, warn }) {
  return (
    <Card className={warn ? "border-amber-300" : ""}>
      <CardContent className="pt-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold">{value}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function WatchList({ title, ids, byId, detail }) {
  const rows = ids.map((id) => byId.get(id)).filter(Boolean);
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          {rows.length > 0 && <AlertTriangle className="h-4 w-4 text-amber-500" />} {title}
          <Badge variant="secondary">{rows.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">None.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {rows.slice(0, 15).map((c) => (
              <li key={c.customerId} className="flex justify-between gap-3">
                <span className="font-medium truncate">{c.name}</span>
                <span className="text-muted-foreground whitespace-nowrap">{detail(c)}</span>
              </li>
            ))}
            {rows.length > 15 && <li className="text-xs text-muted-foreground">and {rows.length - 15} more (see Customers)</li>}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
