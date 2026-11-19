"use client";

// Inventory costing (paid add-on): FIFO cost of every stock movement, stock value by batch,
// and the daily check that the costing agrees with the stock.
// Backend: /api/inventory-costing/* (controllers/inventoryCosting.js). In shadow mode nothing
// is posted to the accounts; it runs alongside the existing month-end costing.

import { useEffect, useMemo, useState } from "react";
import moment from "moment";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { AlertTriangle, BookCheck, CheckCircle2, Download, Layers, Loader2, Lock, Play, Power, RefreshCw, Rocket, Search, ShieldCheck, Undo2, XCircle } from "lucide-react";

import BackButton from "@/app/Components/BackBotton";
import Notch from "@/app/Components/Notch";
import api from "@/lib/api";
import { useUser } from "@/components/UserProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SuccessToast } from "../../../../../../../../Functions/Mics";

const naira = (n) => `₦${(Number(n) || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const when = (d) => (d ? moment(d).format("DD MMM YYYY, HH:mm") : "—");
const key = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);

const MODE = {
  off: { label: "Off", style: "bg-slate-500 hover:bg-slate-500 text-white" },
  activating: { label: "Switching on…", style: "bg-amber-500 hover:bg-amber-500 text-white" },
  shadow: { label: "Shadow mode", style: "bg-sky-600 hover:bg-sky-600 text-white" },
  live: { label: "Live", style: "bg-emerald-600 hover:bg-emerald-600 text-white" },
};
const FLAG_TEXT = {
  opening: "opening stock",
  unverified: "unverified value",
  "estimated-cost": "estimated cost",
  "no-cost": "no cost known",
  negative: "sold below zero",
  returned: "customer return",
  adjustment: "stock adjustment",
  "transferred-shortfall": "transferred shortfall",
};

export default function InventoryCosting() {
  const currentUser = useUser();
  const me = currentUser?.user?.user || {};
  const canManage = me.isAdmin === true || me.isCFO === true;
  // going live / rolling back: an accountant or the CFO (separation of duties: not an admin alone)
  const canApprove = me.isAccountant === true || me.isCFO === true;

  const [status, setStatus] = useState(null);
  const [closed, setClosed] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [preview, setPreview] = useState(null);
  const [confirmOn, setConfirmOn] = useState(false);
  const [confirmOff, setConfirmOff] = useState(false);
  const [tab, setTab] = useState("value");

  const [valuation, setValuation] = useState(null);
  const [report, setReport] = useState(null);
  const [query, setQuery] = useState("");
  const [layersFor, setLayersFor] = useState(null); // { stockRowId, product }
  const [layers, setLayers] = useState(null);

  const [plan, setPlan] = useState(null);
  const [failedChecks, setFailedChecks] = useState(null);
  const [liveNote, setLiveNote] = useState("");
  const [liveConfirm, setLiveConfirm] = useState(false);
  const [rollbackOpen, setRollbackOpen] = useState(false);
  const [rollbackReason, setRollbackReason] = useState("");

  const on = status && (status.mode === "shadow" || status.mode === "live");

  const loadStatus = async () => {
    setLoading(true);
    setError("");
    const r = await api.get("/api/inventory-costing/status");
    setLoading(false);
    if (r.status === 403) return setClosed(r.error);
    if (!r.ok) return setError(r.error);
    setClosed("");
    setStatus(r.data?.data || { mode: "off" });
  };
  const loadValuation = async () => {
    const r = await api.get("/api/inventory-costing/valuation");
    if (r.ok) setValuation(r.data?.data || null);
    else setError(r.error);
  };
  const loadReport = async () => {
    const r = await api.get("/api/inventory-costing/reconciliation");
    if (r.ok) setReport(r.data?.data || null);
    else if (r.status === 404) setReport(null);
    else setError(r.error);
  };

  useEffect(() => {
    loadStatus();
  }, []);
  useEffect(() => {
    if (!on) return;
    loadValuation();
    // before the first daily check there is no report to load (the backend answers 404)
    if (status?.reconciliation) loadReport();
  }, [on]);

  const action = async (name, path, body, after) => {
    setBusy(name);
    setError("");
    const r = await api.post(path, body ?? {}, { headers: { "Idempotency-Key": key() } });
    setBusy("");
    if (!r.ok) {
      setError(r.error);
      return null;
    }
    if (r.data?.message) SuccessToast(r.data.message);
    if (after) await after(r.data);
    return r.data;
  };

  const runPreview = () => action("preview", "/api/inventory-costing/activate", { dryRun: true }, (d) => setPreview(d?.data || null));
  const switchOn = () =>
    action("activate", "/api/inventory-costing/activate", {}, async () => {
      setPreview(null);
      setConfirmOn(false);
      await loadStatus();
    });
  const switchOff = () =>
    action("deactivate", "/api/inventory-costing/deactivate", {}, async () => {
      setConfirmOff(false);
      await loadStatus();
    });
  const syncNow = () => action("sync", "/api/inventory-costing/sync", {});
  const checkNow = () =>
    action("reconcile", "/api/inventory-costing/reconcile", {}, async (d) => {
      setReport(d?.data || null);
      await loadStatus();
    });

  const loadPlan = async () => {
    setBusy("plan");
    setError("");
    setFailedChecks(null);
    const r = await api.get("/api/inventory-costing/live/plan");
    setBusy("");
    if (r.ok) setPlan(r.data?.data || null);
    else setError(r.error);
  };
  const goLive = async () => {
    setBusy("golive");
    setError("");
    setFailedChecks(null);
    const r = await api.post("/api/inventory-costing/live", { confirm: true, note: liveNote }, { headers: { "Idempotency-Key": key() } });
    setBusy("");
    if (!r.ok) {
      setError(r.error);
      if (Array.isArray(r.data?.checks)) setFailedChecks(r.data.checks);
      return;
    }
    if (r.data?.message) SuccessToast(r.data.message);
    setPlan(null);
    setLiveNote("");
    setLiveConfirm(false);
    await loadStatus();
  };
  const postJournals = () => action("journals", "/api/inventory-costing/journals", {}, loadStatus);
  const rollback = () =>
    action("rollback", "/api/inventory-costing/live/rollback", { reason: rollbackReason }, async () => {
      setRollbackOpen(false);
      setRollbackReason("");
      await loadStatus();
    });

  const openLayers = async (row) => {
    setLayersFor(row);
    setLayers(null);
    const r = await api.get(`/api/inventory-costing/layers?stock=${encodeURIComponent(row.stockRowId)}`);
    if (r.ok) setLayers(r.data?.data || []);
    else setError(r.error);
  };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (valuation?.rows || [])
      .filter((x) => !q || String(x.product || "").toLowerCase().includes(q))
      .sort((a, b) => b.value - a.value);
  }, [valuation, query]);

  const exportExcel = () => {
    if (!valuation) return;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(valuation.rows.map((x) => ({ Product: x.product, "Stock item": x.stockRowId, Pieces: x.qty, "Value (FIFO)": x.value }))),
      "Stock value",
    );
    const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([out], { type: "application/octet-stream" }), `Stock_value_FIFO_${moment().format("YYYY-MM-DD")}.xlsx`);
  };

  return (
    <div className="flex flex-col min-w-0">
      <Notch>
        <BackButton />
      </Notch>

      <main className="p-4 space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold flex items-center gap-2">
              Inventory costing {status && MODE[status.mode] && <Badge className={MODE[status.mode].style}>{MODE[status.mode].label}</Badge>}
            </h1>
            <p className="text-sm text-muted-foreground">
              The cost of every stock movement, oldest stock first (FIFO), and a daily check that it agrees with your stock.
            </p>
          </div>
          <Button variant="outline" onClick={loadStatus} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="ml-2">Refresh</span>
          </Button>
        </div>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        {closed && (
          <Card>
            <CardContent className="pt-6 flex items-start gap-3">
              <Lock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium">Inventory costing isn&apos;t available</p>
                <p className="text-sm text-muted-foreground">{closed}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {loading && !status && !closed && <p className="text-sm text-muted-foreground">Loading…</p>}

        {status && status.mode === "off" && !closed && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Switch on inventory costing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                Costing starts in <b>shadow mode</b>: every stock movement is costed and checked daily, but nothing is posted to
                your accounts and the month-end close works as before. Going live (posting the costs) comes later, with your
                accountant&apos;s approval.
              </p>
              <p className="text-muted-foreground">
                Your stock at the moment you switch on becomes the opening stock, valued at each product&apos;s buying price. Those
                values are marked <i>unverified</i> until your accountant confirms them.
              </p>
              {!canManage && <p className="text-muted-foreground">Only an admin or the CFO can switch it on.</p>}
              {canManage && !preview && (
                <Button onClick={runPreview} disabled={busy === "preview"}>
                  {busy === "preview" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Layers className="h-4 w-4" />}
                  <span className="ml-2">Preview the opening stock values</span>
                </Button>
              )}
              {canManage && preview && (
                <div className="space-y-3 rounded-md border p-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Stat label="Opening stock value" value={naira(preview.value)} />
                    <Stat label="Stock items with stock" value={preview.layers} hint={`of ${preview.rows}`} />
                    <Stat label="Without a buying price" value={preview.noCost} warn={preview.noCost > 0} hint="valued at 0" />
                    <Stat label="Below zero" value={preview.negative} warn={preview.negative > 0} />
                  </div>
                  {(preview.noCost > 0 || preview.negative > 0) && (
                    <p className="text-xs text-amber-700 flex items-start gap-1">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      Items without a buying price start at zero cost, and items below zero stay negative until stock arrives. You
                      can fix buying prices first and preview again.
                    </p>
                  )}
                  <label className="flex items-start gap-2 text-sm">
                    <Checkbox checked={confirmOn} onCheckedChange={(v) => setConfirmOn(v === true)} />
                    <span>I understand costing starts from today&apos;s stock and runs in shadow mode (nothing is posted).</span>
                  </label>
                  <div className="flex gap-2">
                    <Button onClick={switchOn} disabled={!confirmOn || busy === "activate"}>
                      {busy === "activate" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                      <span className="ml-2">Switch on</span>
                    </Button>
                    <Button variant="outline" onClick={() => { setPreview(null); setConfirmOn(false); }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {status && status.mode === "activating" && (
          <Card className="border-amber-300">
            <CardContent className="pt-6 text-sm space-y-2">
              <p>Switching on was interrupted. Run it again to finish (nothing is counted twice).</p>
              {canManage && (
                <Button onClick={switchOn} disabled={busy === "activate"}>
                  {busy === "activate" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  <span className="ml-2">Finish switching on</span>
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {on && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              <Stat label="Stock value (FIFO)" value={valuation ? naira(valuation.total) : "…"} />
              <Stat label="Opening stock" value={status.opening ? naira(status.opening.value) : "—"} hint={status.opening ? when(status.opening.at) : ""} />
              <Stat label="Costed up to" value={when(status.syncedUpTo)} hint={status.lastSyncAt ? `last run ${moment(status.lastSyncAt).fromNow()}` : "not run yet"} />
              <Stat
                label="Daily check"
                value={status.reconciliation ? (status.reconciliation.clean ? "Agrees" : "Needs attention") : "Not run yet"}
                hint={status.reconciliation ? status.reconciliation.day : ""}
                warn={status.reconciliation && !status.reconciliation.clean}
              />
              <Stat label="Waiting transfers" value={status.waiting} warn={status.waiting > 0} />
            </div>

            {status.lastSyncError && (
              <p className="text-sm text-amber-700 flex items-start gap-1">
                <AlertTriangle className="h-4 w-4 shrink-0" /> The last costing run stopped: {status.lastSyncError}. It resumes
                automatically.
              </p>
            )}

            {canManage && (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={syncNow} disabled={busy === "sync"}>
                  {busy === "sync" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  <span className="ml-2">Cost new movements now</span>
                </Button>
                <Button variant="outline" size="sm" onClick={checkNow} disabled={busy === "reconcile"}>
                  {busy === "reconcile" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  <span className="ml-2">Run the check now</span>
                </Button>
                {status.mode === "shadow" && !confirmOff && (
                  <Button variant="outline" size="sm" className="text-red-600" onClick={() => setConfirmOff(true)}>
                    <Power className="h-4 w-4" />
                    <span className="ml-2">Switch off</span>
                  </Button>
                )}
                {confirmOff && (
                  <span className="flex flex-wrap items-center gap-2 text-sm">
                    Switch off? Starting again later needs BADE support.
                    <Button size="sm" variant="destructive" onClick={switchOff} disabled={busy === "deactivate"}>
                      {busy === "deactivate" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Switch off"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setConfirmOff(false)}>
                      Keep it on
                    </Button>
                  </span>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {[
                ["value", "Stock value"],
                ["check", "Daily check"],
                ["live", status.mode === "live" ? "Live costing" : "Going live"],
              ].map(([k, label]) => (
                <Button key={k} size="sm" variant={tab === k ? "default" : "outline"} onClick={() => setTab(k)}>
                  {label}
                </Button>
              ))}
            </div>

            {tab === "value" && (
              <Card>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative w-full sm:w-72">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input className="pl-8" placeholder="Product" value={query} onChange={(e) => setQuery(e.target.value)} />
                    </div>
                    <Button variant="outline" size="sm" className="ml-auto" onClick={exportExcel} disabled={!valuation}>
                      <Download className="h-4 w-4" />
                      <span className="ml-2">Excel</span>
                    </Button>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead className="text-right">Pieces</TableHead>
                          <TableHead className="text-right">Value (FIFO)</TableHead>
                          <TableHead className="text-right">Cost per piece</TableHead>
                          <TableHead />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {!valuation && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">Loading…</TableCell>
                          </TableRow>
                        )}
                        {valuation && rows.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">No stock items match.</TableCell>
                          </TableRow>
                        )}
                        {rows.map((x) => (
                          <TableRow key={x.stockRowId}>
                            <TableCell className="font-medium">{x.product || x.stockRowId}</TableCell>
                            <TableCell className={`text-right ${x.qty < 0 ? "text-red-600" : ""}`}>{x.qty.toLocaleString("en-NG")}</TableCell>
                            <TableCell className="text-right">{naira(x.value)}</TableCell>
                            <TableCell className="text-right">{x.qty ? naira(x.value / x.qty) : "—"}</TableCell>
                            <TableCell className="text-right">
                              <Button size="sm" variant="ghost" onClick={() => openLayers(x)}>
                                Batches
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {tab === "value" && layersFor && (
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm">Batches (oldest first): {layersFor.product || layersFor.stockRowId}</CardTitle>
                  <Button size="sm" variant="ghost" onClick={() => { setLayersFor(null); setLayers(null); }}>
                    Close
                  </Button>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  {!layers ? (
                    <p className="text-sm text-muted-foreground">Loading…</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Received</TableHead>
                          <TableHead>Batch</TableHead>
                          <TableHead className="text-right">Cost per piece</TableHead>
                          <TableHead className="text-right">Received</TableHead>
                          <TableHead className="text-right">Left</TableHead>
                          <TableHead className="text-right">Value left</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {layers.filter((l) => l.qtyRemaining !== 0).length === 0 && (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground">No stock left in any batch.</TableCell>
                          </TableRow>
                        )}
                        {layers.filter((l) => l.qtyRemaining !== 0).map((l) => (
                          <TableRow key={l.id}>
                            <TableCell className="whitespace-nowrap">{when(l.receivedAt)}</TableCell>
                            <TableCell>{l.lotNo || "—"}</TableCell>
                            <TableCell className="text-right">{naira(l.unitCost)}</TableCell>
                            <TableCell className="text-right">{l.qtyIn}</TableCell>
                            <TableCell className={`text-right ${l.qtyRemaining < 0 ? "text-red-600" : ""}`}>{l.qtyRemaining}</TableCell>
                            <TableCell className="text-right">{naira(l.valueRemaining)}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{(l.flags || []).map((f) => FLAG_TEXT[f] || f).join(", ") || "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            )}

            {tab === "check" && (
              <Card>
                <CardContent className="pt-4 space-y-4 text-sm">
                  {!report ? (
                    <p className="text-muted-foreground">No check has run yet. It runs every night at 01:15{canManage ? ", or run it now above" : ""}.</p>
                  ) : (
                    <>
                      <p className="flex items-center gap-2">
                        {report.clean ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <AlertTriangle className="h-5 w-5 text-amber-500" />}
                        <span>
                          {report.clean ? "The costing agrees with your stock." : "Some items need attention."} Checked {when(report.at)} ·{" "}
                          {report.stockRows} stock items · {report.unsyncedMovements} recent movement(s) not costed yet
                        </span>
                      </p>

                      {report.differenceCount > 0 && (
                        <div className="space-y-2">
                          <p className="font-medium">Stock and costing differ ({report.differenceCount})</p>
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Product</TableHead>
                                  <TableHead className="text-right">Stock (pieces)</TableHead>
                                  <TableHead className="text-right">Costing (pieces)</TableHead>
                                  <TableHead className="text-right">Difference</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {report.differences.map((d) => (
                                  <TableRow key={d.stockRowId}>
                                    <TableCell>{d.product || d.stockRowId}</TableCell>
                                    <TableCell className="text-right">{d.stockPieces}</TableCell>
                                    <TableCell className="text-right">{d.ledgerPieces}</TableCell>
                                    <TableCell className="text-right text-red-600">{d.difference > 0 ? `+${d.difference}` : d.difference}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      )}

                      {report.needsReconciliation?.length > 0 && (
                        <div className="space-y-1">
                          <p className="font-medium">Movements that couldn&apos;t be costed ({report.needsReconciliation.length})</p>
                          <ul className="list-disc pl-5 text-muted-foreground">
                            {report.needsReconciliation.slice(0, 20).map((n) => (
                              <li key={n.postingId}>
                                {n.action || "movement"}: {n.reason}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {report.waiting > 0 && <p>{report.waiting} transfer arrival(s) are waiting for their departure to be costed.</p>}
                      {report.stalePending?.length > 0 && <p>{report.stalePending.length} movement(s) were left half-costed and will be resumed.</p>}

                      <details className="text-xs text-muted-foreground">
                        <summary className="cursor-pointer">Known gaps the check allows for</summary>
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          {(report.knownGaps || []).map((g) => (
                            <li key={g}>{g}</li>
                          ))}
                        </ul>
                      </details>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {tab === "live" && status.mode === "shadow" && (
              <Card>
                <CardContent className="pt-4 space-y-4 text-sm">
                  <p className="text-muted-foreground">
                    Going live posts the cost of every stock movement to your accounts (Inventory, Cost of Goods Sold, Purchase) every
                    night, and the month-end close then uses these costs instead of the periodic count. It starts on the 1st of the current
                    month and needs the approval of an <b>accountant or the CFO</b>.
                  </p>
                  {!plan && (
                    <Button size="sm" onClick={loadPlan} disabled={busy === "plan"}>
                      {busy === "plan" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                      <span className="ml-2">Check readiness</span>
                    </Button>
                  )}
                  {plan && (
                    <div className="space-y-4">
                      <ul className="space-y-1">
                        {plan.checks.map((c) => (
                          <li key={c.label} className="flex items-start gap-2">
                            {c.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" /> : <XCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />}
                            <span>
                              {c.label}
                              {c.detail && <span className="text-xs text-muted-foreground"> — {c.detail}</span>}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <Stat label={`Stock value on ${moment(plan.effectiveFrom).format("D MMM YYYY")} (FIFO)`} value={naira(plan.openingValue)} />
                        <Stat label="Inventory in your accounts" value={naira(plan.glInventory)} />
                        <Stat
                          label="True-up to post"
                          value={naira(plan.trueUp)}
                          hint="Inventory against Inventory Revaluation Reserve (equity)"
                          warn={Math.abs(plan.trueUp) >= 0.01}
                        />
                        <Stat label="Unverified opening values" value={naira(plan.unverifiedValue)} hint={`${plan.unverifiedLayers} batch(es)`} warn={plan.unverifiedLayers > 0} />
                      </div>
                      {plan.unverifiedLayers > 0 && (
                        <p className="text-xs text-amber-700 flex items-start gap-1">
                          <AlertTriangle className="h-4 w-4 shrink-0" />
                          Some stock still carries the buying price it had when costing was switched on. Check those values before going live:
                          they become the cost of goods sold when the stock is sold.
                        </p>
                      )}
                      {!plan.ready && <p className="text-sm">Fix the items marked above, then check again.</p>}
                      {plan.ready && !canApprove && <p className="text-sm text-muted-foreground">Ready. An accountant or the CFO has to approve going live.</p>}
                      {plan.ready && canApprove && (
                        <div className="rounded-md border p-3 space-y-3">
                          <label className="block space-y-1">
                            <span className="text-xs text-muted-foreground">Approval note (who checked the opening values, and how)</span>
                            <textarea
                              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                              rows={3}
                              maxLength={500}
                              value={liveNote}
                              onChange={(e) => setLiveNote(e.target.value)}
                            />
                          </label>
                          <label className="flex items-start gap-2">
                            <Checkbox checked={liveConfirm} onCheckedChange={(v) => setLiveConfirm(v === true)} />
                            <span>
                              I checked the opening values and the journal scheme, and approve posting the true-up of {naira(plan.trueUp)} and the daily
                              inventory journals from {moment(plan.effectiveFrom).format("D MMM YYYY")}.
                            </span>
                          </label>
                          <div className="flex gap-2">
                            <Button onClick={goLive} disabled={!liveConfirm || !liveNote.trim() || busy === "golive"}>
                              {busy === "golive" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
                              <span className="ml-2">Go live from {plan.month}</span>
                            </Button>
                            <Button variant="outline" onClick={() => setPlan(null)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                      {failedChecks && (
                        <ul className="text-xs text-red-600 list-disc pl-5">
                          {failedChecks.map((c) => (
                            <li key={c.label}>
                              {c.label}
                              {c.detail ? ` — ${c.detail}` : ""}
                            </li>
                          ))}
                        </ul>
                      )}
                      <Button size="sm" variant="ghost" onClick={loadPlan} disabled={busy === "plan"}>
                        Check again
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {tab === "live" && status.mode === "live" && status.live && (
              <Card>
                <CardContent className="pt-4 space-y-4 text-sm">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <Stat label="Live since" value={moment(status.live.effectiveFrom).format("D MMM YYYY")} hint={status.live.month} />
                    <Stat label="Opening stock value" value={naira(status.live.openingValue)} />
                    <Stat label="True-up posted" value={naira(status.live.trueUp)} />
                    <Stat label="Journals posted through" value={status.journaledThrough ? moment(status.journaledThrough).format("D MMM YYYY") : "—"} hint="posted every night at 00:30" />
                  </div>
                  <p className="text-muted-foreground">
                    Approved by {status.live.approvedByName || "—"} ({status.live.approvedRole}) on {when(status.live.approvedAt)}
                    {status.live.note ? `: "${status.live.note}"` : ""}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(canManage || canApprove) && (
                      <Button size="sm" variant="outline" onClick={postJournals} disabled={busy === "journals"}>
                        {busy === "journals" ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookCheck className="h-4 w-4" />}
                        <span className="ml-2">Post journals now</span>
                      </Button>
                    )}
                    {canApprove && !rollbackOpen && (
                      <Button size="sm" variant="outline" className="text-red-600" onClick={() => setRollbackOpen(true)}>
                        <Undo2 className="h-4 w-4" />
                        <span className="ml-2">Roll back to shadow mode…</span>
                      </Button>
                    )}
                  </div>
                  {rollbackOpen && (
                    <div className="rounded-md border border-red-300 p-3 space-y-2">
                      <p>
                        Rolling back reverses this live period&apos;s inventory journals and the true-up, and the month-end close goes back to
                        the periodic method. It is refused once a live month has been closed.
                      </p>
                      <Input placeholder="Why (required)" maxLength={500} value={rollbackReason} onChange={(e) => setRollbackReason(e.target.value)} />
                      <div className="flex gap-2">
                        <Button size="sm" variant="destructive" onClick={rollback} disabled={!rollbackReason.trim() || busy === "rollback"}>
                          {busy === "rollback" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Roll back"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setRollbackOpen(false)}>
                          Keep it live
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <p className="text-xs text-muted-foreground">
              Quantities are in pieces. New movements are costed every few minutes; the most recent two minutes are left for the next
              run.{" "}
              {status.mode === "live"
                ? "Live: the costs are posted to your accounts every night, and the month-end close uses them."
                : "In shadow mode nothing is posted to your accounts."}
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
