"use client";

// One subscription plan: its settings, and the customers assigned to it (a customer can be on
// several plans). Backend: controllers/subscriptions.js.

import React, { useState, useEffect, useMemo, Suspense } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import SuspenenseFallBack from "@/app/Components/SuspenenseFallBack";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Dencrypt } from "../../../../../../../Functions/Functions";
import { ErrorMessage, SuccessToast } from "../../../../../../../Functions/Mics";
import api from "@/lib/api";

const NO_CONTRACT = "none";
const FIRST_WAREHOUSE = "first";
const naira = (n) => `₦${Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
const lagosToday = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" }).format(new Date());
const lagosTime = (v) => (v ? new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lagos", dateStyle: "medium", timeStyle: "short" }).format(new Date(v)) : "—");
const STATUS_STYLE = {
  active: "default",
  trial: "secondary",
  paused: "outline",
  past_due: "destructive",
  cancelled: "outline",
};
const STATUS_LABEL = { active: "Active", trial: "Trial", paused: "Paused", past_due: "Overdue", cancelled: "Cancelled" };

function formFrom(data) {
  return {
    title: data.title || "",
    plan: data.plan || "monthly",
    fee: data.fee ?? "",
    status: data.status || "pending",
    completionDate: data.completionDate ?? "",
    description: data.description || "",
    generatDebit: data.generatDebit ?? false,
    Whatsapp: data.Whatsapp ?? false,
    contractId: data.contractId ? String(data.contractId) : NO_CONTRACT,
    vatRate: data.vatRate ?? 0,
    billingDay: data.billingDay ?? "",
    trialDays: data.trialDays ?? 0,
    graceDays: data.graceDays ?? 7,
    suspendAfterDays: data.suspendAfterDays ?? 30,
    whId: data.whId ? String(data.whId) : FIRST_WAREHOUSE,
    autoRenew: data.autoRenew ?? true,
    autoCharge: data.autoCharge ?? true,
    Sms: data.Sms ?? false,
  };
}

export default function Page({ data, subscribers }) {
  const path = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState(() => formFrom(data || {}));
  const [saving, setSaving] = useState(false);
  const [contracts, setContracts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [billingRun, setBillingRun] = useState(null);
  const [running, setRunning] = useState(false);
  const [rows, setRows] = useState(subscribers || []);
  const [busyRow, setBusyRow] = useState(null);
  const [showCancelled, setShowCancelled] = useState(false);

  // add-customers dialog
  const [addOpen, setAddOpen] = useState(false);
  const [allCustomers, setAllCustomers] = useState(null);
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState(() => new Set());
  const [startDate, setStartDate] = useState(lagosToday());
  const [adding, setAdding] = useState(false);

  useEffect(() => { if (data) setFormData(formFrom(data)); }, [data]);
  useEffect(() => { setRows(subscribers || []); }, [subscribers]);

  // the business's contracts, when it has the Contract app
  useEffect(() => {
    let live = true;
    api.get("/api/Contracts").then((r) => {
      if (!live || !r.ok) return;
      const list = Dencrypt(r.data?.data);
      if (Array.isArray(list)) setContracts(list);
    });
    api.get("/api/Stores").then((r) => {
      if (live && r.ok && Array.isArray(r.data)) setWarehouses(r.data);
    });
    return () => { live = false; };
  }, []);

  const set = (name, value) => setFormData((prev) => ({ ...prev, [name]: value }));
  const handleChange = (e) => set(e.target.name, e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        ...formData,
        fee: Number(formData.fee),
        completionDate: Number(formData.completionDate),
        vatRate: Number(formData.vatRate || 0),
        trialDays: Number(formData.trialDays || 0),
        graceDays: Number(formData.graceDays || 0),
        suspendAfterDays: Number(formData.suspendAfterDays || 0),
        whId: formData.whId === FIRST_WAREHOUSE ? null : formData.whId,
        billingDay: formData.billingDay === "" ? null : Number(formData.billingDay),
        contractId: formData.contractId === NO_CONTRACT ? null : formData.contractId,
      };
      const res = await api.put(`/api/subscriptions/${data._id}`, body);
      if (!res.ok) throw new Error(res.data?.error || res.error || "Update failed");
      SuccessToast(res.data?.message || "Subscription plan updated");
      router.refresh();
    } catch (error) {
      ErrorMessage(error.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  // ── subscribers ──
  const visible = useMemo(
    () => rows.filter((r) => showCancelled || r.enrolment?.status !== "cancelled"),
    [rows, showCancelled],
  );
  const current = rows.filter((r) => r.enrolment && r.enrolment.status !== "cancelled");
  const cancelledCount = rows.filter((r) => r.enrolment?.status === "cancelled").length;
  const totalDebt = visible.reduce((acc, s) => acc + Number(s.Debt || 0), 0);
  const monthlyValue = current
    .filter((r) => ["active", "past_due"].includes(r.enrolment.status))
    .reduce((acc, r) => acc + Number(r.enrolment.price ?? data.fee ?? 0) * Number(r.enrolment.quantity || 1), 0);

  const act = async (row, action, when) => {
    if (action === "cancel" && when !== "period_end" && !window.confirm(`Cancel ${row.Username}'s subscription now? No further bills will be raised.`)) return;
    setBusyRow(row._id);
    try {
      const res = await api.patch(`/api/subscriptions/${data._id}/enrolments/${row.enrolment._id}`, { action, when });
      if (!res.ok) throw new Error(res.data?.error || res.error || "Not changed");
      setRows((prev) => prev.map((r) => (r._id === row._id ? { ...r, enrolment: res.data.enrolment } : r)));
      SuccessToast(res.data.message);
    } catch (err) {
      ErrorMessage(err.message);
    } finally {
      setBusyRow(null);
    }
  };

  const enrol = async (customerIds, start) => {
    const res = await api.post(
      `/api/subscriptions/${data._id}/enrolments`,
      { customerIds, startDate: start },
      { headers: { "Idempotency-Key": `enrol-${data._id}-${crypto.randomUUID()}` } },
    );
    if (!res.ok) throw new Error(res.data?.error || res.error || "Customers were not added");
    return res.data;
  };

  const openAdd = async () => {
    setAddOpen(true);
    setPicked(new Set());
    setSearch("");
    setStartDate(lagosToday());
    if (allCustomers) return;
    const r = await api.get("/api/crm");
    setAllCustomers(r.ok && Array.isArray(r.data) ? r.data : []);
    if (!r.ok) ErrorMessage(r.data?.error || r.error || "Could not load customers");
  };

  const onPlan = useMemo(() => new Set(current.map((r) => String(r._id))), [current]);
  const candidates = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (allCustomers || [])
      .filter((c) => !onPlan.has(String(c._id)))
      .filter((c) => !q || [c.Username, c.CustomerCode, c.phone, c.Email].some((v) => String(v || "").toLowerCase().includes(q)))
      .slice(0, 200);
  }, [allCustomers, search, onPlan]);

  const toggle = (id) => setPicked((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const addPicked = async () => {
    if (!picked.size) return;
    setAdding(true);
    try {
      const out = await enrol([...picked], startDate);
      const skipped = out.skipped?.length ? ` (${out.skipped.length} skipped: ${out.skipped.map((s) => `${s.name || s.customerId} — ${s.reason}`).join("; ")})` : "";
      SuccessToast(`${out.message}${skipped}`);
      setAddOpen(false);
      router.refresh();
    } catch (err) {
      ErrorMessage(err.message);
    } finally {
      setAdding(false);
    }
  };

  const copyPayLink = async (billId) => {
    const r = await api.get(`/api/subscriptions/pay-link?kind=inv&id=${billId}`);
    if (!r.ok) return ErrorMessage(r.data?.error || r.error || "No pay link");
    try { await navigator.clipboard.writeText(r.data.url); SuccessToast("Pay link copied: send it to the customer"); } catch { window.prompt("Pay link", r.data.url); }
  };

  const removeCard = async (row) => {
    if (!window.confirm(`Remove ${row.Username}'s saved card? Future invoices won't be charged to it.`)) return;
    const r = await api.del(`/api/subscriptions/customer/${row._id}/card`);
    if (!r.ok) return ErrorMessage(r.data?.error || r.error || "Not removed");
    setRows((prev) => prev.map((x) => (x._id === row._id ? { ...x, cardOnFile: null } : x)));
    SuccessToast("Saved card removed");
  };

  const runBilling = async () => {
    if (!window.confirm("Raise the invoices that are due now for every plan of this business? (This also runs automatically every day at 06:00.)")) return;
    setRunning(true);
    try {
      const res = await api.post("/api/subscriptions/run-billing", {});
      if (!res.ok) throw new Error(res.data?.error || res.error || "Billing did not run");
      setBillingRun(res.data.summary);
      SuccessToast(res.data.message);
      router.refresh();
    } catch (err) {
      ErrorMessage(err.message);
    } finally {
      setRunning(false);
    }
  };

  if (!data) {
    return <div className="p-6 text-muted-foreground">No data available</div>;
  }

  const open = ["pending", "active"].includes(data.status);

  return (
    <Suspense fallback={<SuspenenseFallBack pagedata={`${formData.title}`} />}>
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-xl min-w-0 break-words">{data.title}</CardTitle>
              <Badge variant={data.status === "active" ? "default" : "secondary"}>{data.status}</Badge>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" value={formData.title} onChange={handleChange} required maxLength={120} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plan">Bills every</Label>
                  <Select value={formData.plan} onValueChange={(v) => set("plan", v)}>
                    <SelectTrigger id="plan"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Month</SelectItem>
                      <SelectItem value="quarterly">Quarter (3 months)</SelectItem>
                      <SelectItem value="yearly">Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fee">Fee per period, before VAT (₦)</Label>
                  <Input id="fee" name="fee" type="number" min={0} step="0.01" value={formData.fee} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vatRate">VAT (%)</Label>
                  <Input id="vatRate" name="vatRate" type="number" min={0} max={100} step="0.01" value={formData.vatRate} onChange={handleChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(v) => set("status", v)}>
                    <SelectTrigger id="status"><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending review</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive (no new customers)</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="completionDate">Duration (months)</Label>
                  <Input id="completionDate" name="completionDate" type="number" min={1} value={formData.completionDate} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billingDay">Billing day of the month (optional)</Label>
                  <Input id="billingDay" name="billingDay" type="number" min={1} max={28} placeholder="Same day as the start" value={formData.billingDay} onChange={handleChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trialDays">Free trial (days)</Label>
                  <Input id="trialDays" name="trialDays" type="number" min={0} max={365} value={formData.trialDays} onChange={handleChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="graceDays">Days to pay before overdue</Label>
                  <Input id="graceDays" name="graceDays" type="number" min={0} max={90} value={formData.graceDays} onChange={handleChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="suspendAfterDays">Pause after this many days overdue (0 = never)</Label>
                  <Input id="suspendAfterDays" name="suspendAfterDays" type="number" min={0} max={365} value={formData.suspendAfterDays} onChange={handleChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whId">Invoice from (warehouse)</Label>
                  <Select value={formData.whId} onValueChange={(v) => set("whId", v)}>
                    <SelectTrigger id="whId"><SelectValue placeholder="First warehouse" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={FIRST_WAREHOUSE}>First warehouse</SelectItem>
                      {warehouses.map((w) => (
                        <SelectItem key={w._id} value={String(w._id)}>{w.WHName || w.InvoiceNo || String(w._id).slice(-6)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contractId">Contract</Label>
                  <Select value={formData.contractId} onValueChange={(v) => set("contractId", v)}>
                    <SelectTrigger id="contractId"><SelectValue placeholder="No contract" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_CONTRACT}>No contract</SelectItem>
                      {contracts.map((c) => (
                        <SelectItem key={c._id} value={String(c._id)}>{c.title || c.customerId?.Username || String(c._id).slice(-6)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} maxLength={2000} />
              </div>

              <Separator />

              <div className="space-y-4">
                <Label className="text-base font-semibold">Settings</Label>
                <div className="flex items-center space-x-3">
                  <Switch id="autoRenew" checked={formData.autoRenew} onCheckedChange={(c) => set("autoRenew", c)} />
                  <Label htmlFor="autoRenew">Renew automatically at the end of the duration</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <Switch id="autoCharge" checked={formData.autoCharge} onCheckedChange={(c) => set("autoCharge", c)} />
                  <Label htmlFor="autoCharge">Charge a customer&apos;s saved card on each invoice (only customers who saved their card when paying online)</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <Switch id="Sms" checked={formData.Sms} onCheckedChange={(c) => set("Sms", c)} />
                  <Label htmlFor="Sms">Also send notices by SMS (₦8 per SMS from your SMS credit; skipped when the credit is used up)</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <Switch id="generatDebit" checked={formData.generatDebit} onCheckedChange={(c) => set("generatDebit", c)} />
                  <Label htmlFor="generatDebit">Generate a debit receipt when a subscription is billed</Label>
                </div>
                <div className="mt-4 pt-4 border-t border-border bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Switch id="Whatsapp" checked={formData.Whatsapp} onCheckedChange={(c) => set("Whatsapp", c)} className="mt-0.5" />
                    <div className="text-sm">
                      <Label htmlFor="Whatsapp" className="font-medium text-amber-700 dark:text-amber-400">Send credit receipt via WhatsApp</Label>
                      <p className="text-amber-600/80 dark:text-amber-500 mt-1">This service may attract extra charges.</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-wrap justify-end gap-3 border-t pt-6">
              <Button type="button" variant="outline" onClick={() => setFormData(formFrom(data))} disabled={saving}>Undo changes</Button>
              <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
            </CardFooter>
          </form>
        </Card>

        {/* ── Subscribers ── */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg">Subscribers</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {current.length} on this plan · {naira(monthlyValue)} per {data.plan === "yearly" ? "year" : data.plan === "quarterly" ? "quarter" : "month"} from active subscribers
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {cancelledCount > 0 && (
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Checkbox checked={showCancelled} onCheckedChange={(c) => setShowCancelled(Boolean(c))} />
                    Show cancelled ({cancelledCount})
                  </label>
                )}
                <Button type="button" variant="outline" onClick={runBilling} disabled={running}>
                  {running ? "Billing…" : "Run billing now"}
                </Button>
                <Button type="button" onClick={openAdd} disabled={!open} title={open ? "" : "Only pending or active plans take new customers"}>
                  Add customers
                </Button>
              </div>
            </div>
            {billingRun && (
              <div className="text-sm rounded-md border bg-muted/40 px-3 py-2 mt-3 space-y-1">
                <p className="font-medium">Billing run for {billingRun.today}</p>
                <p className="text-muted-foreground">
                  {billingRun.invoices.length} invoice(s) raised · {billingRun.charged || 0} paid by saved card · {billingRun.reminders} reminder(s) · {billingRun.overdue} newly overdue · {billingRun.paused} paused · {billingRun.resumed} active again · {billingRun.ended} ended
                  {billingRun.recognised ? ` · ${naira(billingRun.recognised)} deferred revenue recognised` : ""}
                </p>
                {billingRun.problems.map((pr, i) => (
                  <p key={i} className="text-destructive">{pr.customer} / {pr.plan}: {pr.problem}</p>
                ))}
              </div>
            )}
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Next bill</TableHead>
                  <TableHead>Last invoice</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.length > 0 ? (
                  <>
                    {visible.map((row) => {
                      const e = row.enrolment;
                      const busy = busyRow === row._id;
                      return (
                        <TableRow key={row._id}>
                          <TableCell className="font-medium">
                            <Link className="text-indigo-600 hover:underline" href={`/${path.auth}/V4/crm/crm/${row._id}`}>
                              {row.Username ?? "—"}
                            </Link>
                            <div className="text-xs text-muted-foreground">{[row.CustomerCode, row.phone].filter(Boolean).join(" · ")}</div>
                            {row.cardOnFile?.last4 && (
                              <div className="text-xs text-muted-foreground">
                                Card {row.cardOnFile.brand || ""} •••• {row.cardOnFile.last4}{" "}
                                <button type="button" className="text-destructive hover:underline" onClick={() => removeCard(row)}>remove</button>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {e ? (
                              <div className="flex flex-col gap-1">
                                <Badge variant={STATUS_STYLE[e.status] || "secondary"}>{STATUS_LABEL[e.status] || e.status}</Badge>
                                {e.cancelAtPeriodEnd && e.status !== "cancelled" && <span className="text-xs text-muted-foreground">Ends {e.nextBillDate}</span>}
                              </div>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell>{e?.startDate || "—"}</TableCell>
                          <TableCell>{e && e.status !== "cancelled" && e.status !== "paused" ? e.nextBillDate || "—" : "—"}</TableCell>
                          <TableCell>
                            {e?.lastBillRef ? (
                              <span className="whitespace-nowrap">{e.lastBillRef}<span className="block text-xs text-muted-foreground">{e.lastBilledOn}</span></span>
                            ) : "—"}
                            {e?.billingIssue && <span className="block text-xs text-destructive max-w-[16rem]">{e.billingIssue}</span>}
                          </TableCell>
                          <TableCell className="text-right">
                            {e ? `${naira(e.price ?? data.fee)}${Number(e.quantity) > 1 ? ` × ${e.quantity}` : ""}` : "—"}
                          </TableCell>
                          <TableCell className="text-right">{naira(row.Debt)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-wrap justify-end gap-2">
                              {e?.lastBillId && Number(row.Debt) > 0 && (
                                <Button size="sm" variant="outline" disabled={busy} onClick={() => copyPayLink(e.lastBillId)}>Pay link</Button>
                              )}
                              {e && ["trial", "active", "past_due"].includes(e.status) && (
                                <Button size="sm" variant="outline" disabled={busy} onClick={() => act(row, "pause")}>Pause</Button>
                              )}
                              {e?.status === "paused" && (
                                <Button size="sm" variant="outline" disabled={busy} onClick={() => act(row, "resume")}>Resume</Button>
                              )}
                              {e && e.status !== "cancelled" && !e.cancelAtPeriodEnd && (
                                <Button size="sm" variant="outline" disabled={busy} onClick={() => act(row, "cancel", "period_end")}>End at period end</Button>
                              )}
                              {e?.cancelAtPeriodEnd && e.status !== "cancelled" && (
                                <Button size="sm" variant="outline" disabled={busy} onClick={() => act(row, "reinstate")}>Keep going</Button>
                              )}
                              {e && e.status !== "cancelled" && (
                                <Button size="sm" variant="destructive" disabled={busy} onClick={() => act(row, "cancel", "now")}>Cancel now</Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow className="bg-muted/50 font-medium">
                      <TableCell colSpan={6}>Total outstanding</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={totalDebt > 0 ? "destructive" : "secondary"}>{naira(totalDebt)}</Badge>
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </>
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                      No customers on this plan yet. Use “Add customers”.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* ── Activity ── */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label>Activity log</Label>
              <div className="rounded-md border bg-muted/40 p-4 space-y-1.5">
                {data.activityLog?.length > 0 ? (
                  data.activityLog.map((log, index) => (
                    <p key={index} className="text-sm text-muted-foreground">• {log}</p>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No activity yet</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
              {/* Lagos time, the same on the server and in the browser (no hydration mismatch) */}
              <div><span className="font-medium text-foreground">Created:</span> {lagosTime(data.createdAt)}</div>
              <div><span className="font-medium text-foreground">Updated:</span> {lagosTime(data.updatedAt)}</div>
            </div>
          </CardContent>
        </Card>

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add customers to {data.title}</DialogTitle>
              <DialogDescription>
                Pick the customers to put on this plan. Customers already on it are not listed. The first bill is on the start date{data.trialDays ? ` after a ${data.trialDays}-day trial` : ""}{data.billingDay ? `, on the ${data.billingDay}th of the month` : ""}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start date</Label>
                <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerSearch">Customers</Label>
                <Input id="customerSearch" placeholder="Search name, code, phone or email" value={search} onChange={(e) => setSearch(e.target.value)} />
                <div className="max-h-72 overflow-y-auto rounded-md border divide-y">
                  {allCustomers === null ? (
                    <p className="p-3 text-sm text-muted-foreground">Loading customers…</p>
                  ) : candidates.length === 0 ? (
                    <p className="p-3 text-sm text-muted-foreground">No customers match.</p>
                  ) : (
                    candidates.map((c) => (
                      <label key={c._id} className="flex items-center gap-3 p-2.5 text-sm cursor-pointer hover:bg-muted/50">
                        <Checkbox checked={picked.has(String(c._id))} onCheckedChange={() => toggle(String(c._id))} />
                        <span className="flex-1 min-w-0">
                          <span className="font-medium">{c.Username}</span>
                          <span className="block text-xs text-muted-foreground truncate">{[c.CustomerCode, c.phone].filter(Boolean).join(" · ")}</span>
                        </span>
                      </label>
                    ))
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{picked.size} selected (up to 100 at a time)</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)} disabled={adding}>Close</Button>
              <Button onClick={addPicked} disabled={adding || !picked.size || picked.size > 100 || !startDate}>
                {adding ? "Adding…" : `Add ${picked.size || ""} customer${picked.size === 1 ? "" : "s"}`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Suspense>
  );
}
