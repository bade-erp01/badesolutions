"use client";

// VAT on sales (output tax): the VAT on every approved invoice / POS sale, less VAT
// reversed on returns, checked against the Tax Payable ledger. Backend: GET /api/reports/vat.

import { useCallback, useEffect, useMemo, useState } from "react";
import moment from "moment";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { AlertTriangle, Download, Loader2, RefreshCw } from "lucide-react";

import BackButton from "@/app/Components/BackBotton";
import Notch from "@/app/Components/Notch";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const naira = (n) =>
  `₦${(Number(n) || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const monthLabel = (m) => moment(m, "YYYY-MM").format("MMM YYYY");
const monthsBetween = (from, to) => {
  const out = [];
  for (let m = moment(from, "YYYY-MM"); m.isSameOrBefore(moment(to, "YYYY-MM")); m.add(1, "month")) out.push(m.format("YYYY-MM"));
  return out;
};

// Excel of one frozen month, from GET /api/reports/vat/snapshots/:month
function downloadSnapshot(snap) {
  const wb = XLSX.utils.book_new();
  const s = snap.summary || {};
  const head = [
    [`VAT snapshot ${monthLabel(snap.month)}`],
    ["Status", snap.status === "filed" ? `Filed${snap.filingRef ? ` (${snap.filingRef})` : ""}` : "Captured"],
    ["Captured", `${moment(snap.capturedAt).format("DD MMM YYYY HH:mm")} by ${snap.capturedBy?.name || "-"}`],
    ...(snap.filedAt ? [["Filed", `${moment(snap.filedAt).format("DD MMM YYYY HH:mm")} by ${snap.filedBy?.name || "-"}`]] : []),
    [],
    ["Sales excluding VAT", s.salesExclVat],
    ["VAT charged on sales", s.vatOnSales],
    ["VAT reversed on returns", s.vatReversed],
    ["Other Tax Payable adjustments", s.adjustments],
    ["Net VAT", s.netVat],
    ["Invoices", s.invoices],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(head), "Summary");
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      (snap.rows || []).map((r) => ({
        Date: moment(r.date).format("YYYY-MM-DD"),
        Type: r.kind,
        Reference: r.reference ? `ORD/${r.reference}` : "",
        Channel: r.channel || "",
        Customer: r.customer || "",
        TIN: r.tin || "",
        "Invoice total": r.invoiceTotal ?? "",
        "Net of VAT": r.netOfVat ?? "",
        VAT: r.vat,
      })),
    ),
    "Transactions",
  );
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet((snap.byCustomer || []).map((c) => ({ Customer: c.customer, TIN: c.tin || "", Invoices: c.invoices, "Sales excl. VAT": c.salesExclVat, VAT: c.vat }))),
    "By customer",
  );
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([out], { type: "application/octet-stream" }), `VAT_snapshot_${snap.month}.xlsx`);
}

export default function TaxReport() {
  const lastMonth = moment().subtract(1, "month").format("YYYY-MM");
  const [from, setFrom] = useState(lastMonth);
  const [to, setTo] = useState(lastMonth);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("invoices");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const r = await api.get(`/api/reports/vat?from=${from}&to=${to}`);
    setLoading(false);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setReport(r.data);
  }, [from, to]);

  const [busyMonth, setBusyMonth] = useState(null);
  const monthAction = async (month, action) => {
    let body;
    if (action === "file") {
      const ref = window.prompt(`Mark ${monthLabel(month)} as filed with FIRS.\nFiling reference (optional):`, "");
      if (ref === null) return;
      body = { filingRef: ref.trim() || undefined };
    }
    if (action === "unfile" && !window.confirm(`Unmark ${monthLabel(month)} as filed? It can then be re-captured.`)) return;
    setBusyMonth(month);
    const r = await api.post(`/api/reports/vat/snapshots/${month}/${action}`, body);
    setBusyMonth(null);
    if (!r.ok) return setError(r.error);
    setError(null);
    load();
  };
  const downloadMonth = async (month) => {
    setBusyMonth(month);
    const r = await api.get(`/api/reports/vat/snapshots/${month}`);
    setBusyMonth(null);
    if (!r.ok) return setError(r.error);
    downloadSnapshot(r.data);
  };

  useEffect(() => {
    load();
    // first load only; afterwards the user presses "Run"
  }, []);

  const s = report?.summary;
  const rows = useMemo(() => report?.rows || [], [report]);

  const exportExcel = () => {
    if (!report) return;
    const wb = XLSX.utils.book_new();
    const summary = [
      ["VAT report (output tax on sales)"],
      ["Period", `${monthLabel(report.period.from)} – ${monthLabel(report.period.to)}`],
      [],
      ["Sales excluding VAT", s.salesExclVat],
      ["VAT charged on sales", s.vatOnSales],
      ["VAT reversed on returns", s.vatReversed],
      ["Other Tax Payable adjustments", s.adjustments],
      ["Net VAT", s.netVat],
      ["VAT on invoices not posted to the ledger", s.vatNotInLedger],
      ["Invoices", s.invoices],
      ["Returns", s.returns],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summary), "Summary");
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        report.byMonth.map((m) => ({
          Month: monthLabel(m.month),
          "Sales excl. VAT": m.salesExclVat,
          "VAT on sales": m.vatOnSales,
          "VAT reversed": m.vatReversed,
          Adjustments: m.adjustments,
          "Net VAT": m.netVat,
          Invoices: m.invoices,
        })),
      ),
      "By month",
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        rows.map((r) => ({
          Date: moment(r.date).format("YYYY-MM-DD"),
          Type: r.kind,
          Reference: r.reference ? `ORD/${r.reference}` : r.description,
          Channel: r.channel || "",
          Customer: r.customer || "",
          TIN: r.tin || "",
          "Invoice total": r.invoiceTotal ?? "",
          "Net of VAT": r.netOfVat ?? "",
          VAT: r.vat,
          "In ledger": r.kind === "sale" ? (r.postedToLedger ? "yes" : "no") : "",
        })),
      ),
      "Transactions",
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        report.byCustomer.map((c) => ({
          Customer: c.customer,
          TIN: c.tin || "",
          Invoices: c.invoices,
          "Sales excl. VAT": c.salesExclVat,
          VAT: c.vat,
        })),
      ),
      "By customer",
    );
    const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([out], { type: "application/octet-stream" }), `VAT_${report.period.from}_${report.period.to}.xlsx`);
  };

  return (
    <div className="flex flex-col min-w-0">
      <Notch>
        <BackButton />
      </Notch>

      <main className="p-4 space-y-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold">VAT report</h1>
          <p className="text-sm text-muted-foreground">
            Output VAT on invoices and POS sales, less returns, checked against the Tax Payable ledger. Months are in Lagos time.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6 flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Label htmlFor="vat-from">From</Label>
              <Input id="vat-from" type="month" value={from} max={to} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="vat-to">To</Label>
              <Input id="vat-to" type="month" value={to} min={from} onChange={(e) => setTo(e.target.value)} />
            </div>
            <Button onClick={load} disabled={loading || !from || !to}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span className="ml-2">Run</span>
            </Button>
            <Button variant="outline" onClick={exportExcel} disabled={!report || loading}>
              <Download className="h-4 w-4" />
              <span className="ml-2">Excel</span>
            </Button>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {s && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Stat label="Sales excl. VAT" value={naira(s.salesExclVat)} hint={`${s.invoices} invoice(s)`} />
              <Stat label="VAT on sales" value={naira(s.vatOnSales)} />
              <Stat label="VAT reversed (returns)" value={naira(s.vatReversed)} hint={`${s.returns} return(s)`} />
              <Stat label="Net VAT" value={naira(s.netVat)} strong />
            </div>
            {s.vatNotInLedger > 0 && (
              <p className="text-xs text-amber-700">
                {naira(s.vatNotInLedger)} of this VAT is on invoices but was never posted to the Tax Payable ledger (marked
                “not in ledger” below).
              </p>
            )}
            {s.adjustments !== 0 && (
              <p className="text-xs text-muted-foreground">
                Includes {naira(s.adjustments)} of other entries to Tax Payable (listed under Transactions as “adjustment”).
              </p>
            )}

            {report.issues?.length > 0 && (
              <Card className="border-amber-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" /> {report.issues.length} thing(s) to check
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm list-disc pl-5 space-y-1">
                    {report.issues.slice(0, 20).map((i, n) => (
                      <li key={n}>{i.message}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <MonthlyFiling report={report} busyMonth={busyMonth} onAction={monthAction} onDownload={downloadMonth} />

            <div className="flex gap-2">
              {[
                ["invoices", "Transactions"],
                ["months", "By month"],
                ["customers", "By customer"],
              ].map(([k, label]) => (
                <Button key={k} size="sm" variant={tab === k ? "default" : "outline"} onClick={() => setTab(k)}>
                  {label}
                </Button>
              ))}
            </div>

            <Card>
              <CardContent className="pt-4 overflow-x-auto">
                {tab === "months" && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead className="text-right">Sales excl. VAT</TableHead>
                        <TableHead className="text-right">VAT on sales</TableHead>
                        <TableHead className="text-right">Reversed</TableHead>
                        <TableHead className="text-right">Net VAT</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.byMonth.map((m) => (
                        <TableRow key={m.month}>
                          <TableCell>{monthLabel(m.month)}</TableCell>
                          <TableCell className="text-right">{naira(m.salesExclVat)}</TableCell>
                          <TableCell className="text-right">{naira(m.vatOnSales)}</TableCell>
                          <TableCell className="text-right">{naira(m.vatReversed)}</TableCell>
                          <TableCell className="text-right font-medium">{naira(m.netVat)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                {tab === "customers" && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>TIN</TableHead>
                        <TableHead className="text-right">Invoices</TableHead>
                        <TableHead className="text-right">Sales excl. VAT</TableHead>
                        <TableHead className="text-right">VAT</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.byCustomer.map((c) => (
                        <TableRow key={c.customerId || c.customer}>
                          <TableCell>{c.customer}</TableCell>
                          <TableCell>{c.tin || "—"}</TableCell>
                          <TableCell className="text-right">{c.invoices}</TableCell>
                          <TableCell className="text-right">{naira(c.salesExclVat)}</TableCell>
                          <TableCell className="text-right font-medium">{naira(c.vat)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                {tab === "invoices" && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead className="text-right">Invoice total</TableHead>
                        <TableHead className="text-right">VAT</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No VAT was posted in this period.
                          </TableCell>
                        </TableRow>
                      )}
                      {rows.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell>{moment(r.date).format("DD MMM YYYY")}</TableCell>
                          <TableCell>
                            {r.reference ? `ORD/${r.reference}` : r.description}{" "}
                            {r.kind !== "sale" && <Badge variant="secondary">{r.kind}</Badge>}
                            {r.channel === "POS" && <Badge variant="outline">POS</Badge>}
                            {r.kind === "sale" && r.postedToLedger === false && (
                              <Badge variant="outline" className="text-amber-700 border-amber-300">not in ledger</Badge>
                            )}
                          </TableCell>
                          <TableCell>{r.customer || "—"}</TableCell>
                          <TableCell className="text-right">{r.invoiceTotal == null ? "—" : naira(r.invoiceTotal)}</TableCell>
                          <TableCell className={`text-right ${r.vat < 0 ? "text-red-600" : ""}`}>{naira(r.vat)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <p className="text-xs text-muted-foreground">
              Tax Payable balance today: {naira(report.taxPayableBalance)}. Input VAT on purchases and payments to FIRS
              are not recorded yet, so this is VAT charged, not VAT due.
            </p>
          </>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value, hint, strong }) {
  return (
    <Card>
      <CardContent className="pt-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-lg ${strong ? "font-semibold" : "font-medium"}`}>{value}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

// Each month of the period: live VAT, its frozen snapshot (taken on the 2nd by the
// monthly job or with "Capture"), and whether it was filed with FIRS.
function MonthlyFiling({ report, busyMonth, onAction, onDownload }) {
  const thisMonth = moment().format("YYYY-MM");
  const live = new Map((report.byMonth || []).map((m) => [m.month, m]));
  const snaps = new Map((report.snapshots || []).map((x) => [x.month, x]));
  const months = monthsBetween(report.period.from, report.period.to);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Monthly filing</CardTitle>
        <p className="text-xs text-muted-foreground">
          Each closed month is captured automatically on the 2nd. A captured month keeps its figures as they were;
          mark it as filed once you have filed it with FIRS so it can&apos;t be overwritten.
        </p>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Month</TableHead>
              <TableHead className="text-right">Net VAT now</TableHead>
              <TableHead className="text-right">Captured net VAT</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {months.map((m) => {
              const snap = snaps.get(m);
              const open = m >= thisMonth;
              const busy = busyMonth === m;
              return (
                <TableRow key={m}>
                  <TableCell>{monthLabel(m)}</TableCell>
                  <TableCell className="text-right">{naira(live.get(m)?.netVat || 0)}</TableCell>
                  <TableCell className="text-right">
                    {snap ? naira(snap.netVat) : "—"}
                    {snap && Math.abs(snap.driftNetVat) >= 0.01 && (
                      <span className="block text-xs text-amber-700">
                        {snap.driftNetVat > 0 ? "+" : ""}
                        {naira(snap.driftNetVat)} since captured
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {open ? (
                      <Badge variant="secondary">Open month</Badge>
                    ) : !snap ? (
                      <Badge variant="outline">Not captured</Badge>
                    ) : snap.status === "filed" ? (
                      <div>
                        <Badge className="bg-green-600 hover:bg-green-600">Filed</Badge>
                        <span className="block text-xs text-muted-foreground">
                          {moment(snap.filedAt).format("DD MMM YYYY")}
                          {snap.filedBy ? ` · ${snap.filedBy}` : ""}
                          {snap.filingRef ? ` · ${snap.filingRef}` : ""}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <Badge variant="outline">Captured</Badge>
                        <span className="block text-xs text-muted-foreground">
                          {moment(snap.capturedAt).format("DD MMM YYYY")}
                          {snap.capturedBy ? ` · ${snap.capturedBy}` : ""}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-1 whitespace-nowrap">
                    {busy && <Loader2 className="inline h-4 w-4 animate-spin" />}
                    {!open && report.canFile && snap?.status !== "filed" && (
                      <Button size="sm" variant="outline" disabled={busy} onClick={() => onAction(m, "capture")}>
                        {snap ? "Re-capture" : "Capture"}
                      </Button>
                    )}
                    {snap && report.canFile && snap.status !== "filed" && (
                      <Button size="sm" disabled={busy} onClick={() => onAction(m, "file")}>
                        Mark filed
                      </Button>
                    )}
                    {snap?.status === "filed" && report.canFile && (
                      <Button size="sm" variant="ghost" disabled={busy} onClick={() => onAction(m, "unfile")}>
                        Unmark
                      </Button>
                    )}
                    {snap && (
                      <Button size="sm" variant="ghost" disabled={busy} onClick={() => onDownload(m)} title="Download snapshot">
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
