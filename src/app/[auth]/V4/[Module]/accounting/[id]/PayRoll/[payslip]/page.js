"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import moment from "moment";
import {
  Download,
  Trash2,
  Users,
  Wallet,
  TrendingUp,
  Receipt,
  Pencil,
  Banknote,
  Undo2,
  Search,
  Loader2,
  AlertTriangle,
} from "lucide-react";

import { useUser } from "@/components/UserProvider";
import {
  Encrypt,
  ErrorMessage,
  SuccessToast,
} from "../../../../../../../../../Functions/Mics";
import { EXPRESS_PRIVATE_URL } from "../../../../../../../../../Functions/Functions";

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------
const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const naira = (v) =>
  `₦${num(v).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Must match computePayslip() in the backend (controllers/DepreciationShedule.js)
const EARNINGS = ["BASIC", "HRA", "TRANSPORT", "WELFARE", "ADHOC", "MEDICAL", "Bonus", "Cash_Retirement"];
const DEDUCTIONS = ["PENSION", "PAYEE", "CONTRIBUTION_8", "CONTRIBUTION_10", "CLA", "IOU_DEDUCTED"];
const computeSlip = (s) => {
  const gross = EARNINGS.reduce((t, k) => t + num(s[k]), 0);
  const deductions = DEDUCTIONS.reduce((t, k) => t + num(s[k]), 0);
  return { gross, deductions, net: gross - deductions };
};
const allowancesOf = (e) => num(e.HRA) + num(e.TRANSPORT) + num(e.WELFARE) + num(e.ADHOC) + num(e.MEDICAL);
const otherDeductionsOf = (e) => num(e.CONTRIBUTION_8) + num(e.CONTRIBUTION_10) + num(e.CLA) + num(e.IOU_DEDUCTED);
const employeeName = (e) =>
  [e.employeeId?.firstName, e.employeeId?.lastName].filter(Boolean).join(" ") || "Former employee";

const STATUS_CLASS = {
  Pending: "bg-amber-500 hover:bg-amber-500 text-white",
  Paid: "bg-emerald-600 hover:bg-emerald-600 text-white",
  Reversed: "bg-red-600 hover:bg-red-600 text-white",
};

const EDIT_FIELDS = [
  { key: "Bonus", label: "Bonus", group: "Earnings" },
  { key: "Cash_Retirement", label: "Cash retirement", group: "Earnings" },
  { key: "PENSION", label: "Pension", group: "Deductions" },
  { key: "PAYEE", label: "PAYE tax", group: "Deductions" },
  { key: "CONTRIBUTION_8", label: "Contribution (8%)", group: "Deductions" },
  { key: "CONTRIBUTION_10", label: "Contribution (10%)", group: "Deductions" },
  { key: "CLA", label: "CLA", group: "Deductions" },
  { key: "IOU_DEDUCTED", label: "IOU repayment", group: "Deductions" },
  { key: "IOU_BALANCE", label: "IOU balance left", group: "Info" },
];

function KpiCard({ title, value, icon: Icon, accent = "" }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${accent || "text-muted-foreground"}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-xl lg:text-2xl font-bold break-all ${accent}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// page
// ---------------------------------------------------------------------------
export default function PayrollPage() {
  const user = useUser();
  const params = useParams();

  const [payroll, setPayroll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);

  const [editSlip, setEditSlip] = useState(null); // payslip being edited
  const [slipForm, setSlipForm] = useState({});
  const [deleteSlip, setDeleteSlip] = useState(null);
  const [editHeader, setEditHeader] = useState(false);
  const [headerForm, setHeaderForm] = useState({ title: "", date: "", description: "" });
  const [payOpen, setPayOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [bankAccount, setBankAccount] = useState("");
  const [reverseOpen, setReverseOpen] = useState(false);

  const headers = useCallback(
    (extra = {}) => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${Encrypt(user.user.business.tenantId)}`,
      access: `${Encrypt(user.user.user._id)}`,
      sessionKey: `Bearer ${Encrypt(user.user.SessionId)}`,
      ...extra,
    }),
    [user]
  );

  const api = useCallback(
    async (path, { method = "GET", body, idempotent = false } = {}) => {
      const res = await fetch(`${EXPRESS_PRIVATE_URL}/api${path}`, {
        method,
        headers: headers(idempotent ? { "idempotency-key": `${method}-${path}-${crypto.randomUUID()}` } : {}),
        body: body ? JSON.stringify(body) : undefined,
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || data.message || `Request failed (${res.status})`);
      return data;
    },
    [headers]
  );

  const load = useCallback(async () => {
    try {
      setLoadError("");
      const data = await api(`/Entries/${encodeURIComponent(params.payslip)}`);
      setPayroll(data);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, [api, params.payslip]);

  useEffect(() => {
    if (user?.user) load();
  }, [user, load]);

  // ---------- derived ----------
  const entries = payroll?.entries || [];
  const isPending = payroll?.status === "Pending";
  const perms = payroll?.permissions || {};

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((e) =>
      [employeeName(e), e.employeeId?.staffId, e.employeeId?.employeeCode, e.DEPT, e.JOB_ROLE]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [entries, query]);

  const totals = useMemo(() => {
    const t = { gross: 0, net: 0, pension: 0, paye: 0, other: 0, basic: 0, allowances: 0, bonus: 0 };
    for (const e of entries) {
      t.gross += num(e.GROSS);
      t.net += num(e.NET_PAYABLE);
      t.pension += num(e.PENSION);
      t.paye += num(e.PAYEE);
      t.other += otherDeductionsOf(e);
      t.basic += num(e.BASIC);
      t.allowances += allowancesOf(e);
      t.bonus += num(e.Bonus);
    }
    t.deductions = t.gross - t.net;
    return t;
  }, [entries]);

  // ---------- actions ----------
  const run = async (fn) => {
    setBusy(true);
    try {
      await fn();
    } catch (err) {
      ErrorMessage(err.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const openSlipEditor = (e) => {
    setSlipForm(Object.fromEntries(EDIT_FIELDS.map((f) => [f.key, num(e[f.key])]).concat([["DEPT", e.DEPT || ""], ["JOB_ROLE", e.JOB_ROLE || ""]])));
    setEditSlip(e);
  };

  const saveSlip = () =>
    run(async () => {
      const data = await api(
        `/payslip/Edit?payroll=${payroll._id}&payslip=${editSlip._id}`,
        { method: "PATCH", body: slipForm, idempotent: true }
      );
      SuccessToast(data.message || "Payslip updated");
      setEditSlip(null);
      await load();
    });

  const removeSlip = () =>
    run(async () => {
      const data = await api(
        `/payslip/Delete?payroll=${payroll._id}&payslip=${deleteSlip._id}`,
        { method: "DELETE", idempotent: true }
      );
      SuccessToast(data.message || "Payslip removed");
      setDeleteSlip(null);
      await load();
    });

  const openHeaderEditor = () => {
    setHeaderForm({
      title: payroll.title || "",
      date: payroll.date ? moment(payroll.date).format("YYYY-MM-DD") : "",
      description: payroll.description || "",
    });
    setEditHeader(true);
  };

  const saveHeader = () =>
    run(async () => {
      const data = await api(`/payroll/Edit?payroll=${payroll._id}`, { method: "PATCH", body: headerForm, idempotent: true });
      SuccessToast(data.message || "Payroll updated");
      setEditHeader(false);
      await load();
    });

  const openPay = () =>
    run(async () => {
      const list = await api(`/Bank/Accounts`);
      setAccounts(Array.isArray(list) ? list : []);
      setBankAccount("");
      setPayOpen(true);
    });

  const pay = () =>
    run(async () => {
      const data = await api(`/payroll/${payroll._id}/pay`, { method: "PATCH", body: { bankAccount }, idempotent: true });
      SuccessToast(`Payroll paid from ${data.bank || "the selected account"}: ${naira(data.net)}`);
      setPayOpen(false);
      await load();
    });

  const reverse = () =>
    run(async () => {
      await api(`/payroll/${payroll._id}/reverse`, { method: "PATCH", idempotent: true });
      SuccessToast("Payroll reversed: the money is back in the bank account");
      setReverseOpen(false);
      await load();
    });

  const downloadCsv = () => {
    if (!entries.length) return;
    const cols = [
      ["SN", (e, i) => i + 1],
      ["Employee", employeeName],
      ["Staff ID", (e) => e.employeeId?.staffId || e.employeeId?.employeeCode || ""],
      ["Department", (e) => e.DEPT || ""],
      ["Job Role", (e) => e.JOB_ROLE || ""],
      ["Basic", (e) => num(e.BASIC)],
      ["HRA", (e) => num(e.HRA)],
      ["Transport", (e) => num(e.TRANSPORT)],
      ["Welfare", (e) => num(e.WELFARE)],
      ["Adhoc", (e) => num(e.ADHOC)],
      ["Medical", (e) => num(e.MEDICAL)],
      ["Bonus", (e) => num(e.Bonus)],
      ["Cash Retirement", (e) => num(e.Cash_Retirement)],
      ["Gross", (e) => num(e.GROSS)],
      ["Pension", (e) => num(e.PENSION)],
      ["PAYE", (e) => num(e.PAYEE)],
      ["Contribution 8%", (e) => num(e.CONTRIBUTION_8)],
      ["Contribution 10%", (e) => num(e.CONTRIBUTION_10)],
      ["CLA", (e) => num(e.CLA)],
      ["IOU Repayment", (e) => num(e.IOU_DEDUCTED)],
      ["Total Deduction", (e) => num(e.TOTAL_DEDUCTION)],
      ["Net Payable", (e) => num(e.NET_PAYABLE)],
      ["PFA", (e) => e.PFA || ""],
      ["PFA Code", (e) => e.PFA_CODE || ""],
    ];
    const cell = (v) => {
      const s = String(v ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [
      cols.map(([h]) => h).join(","),
      ...entries.map((e, i) => cols.map(([, get]) => cell(get(e, i))).join(",")),
    ].join("\n");
    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${String(payroll.title || "payroll").replace(/[^\w.-]+/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---------- render ----------
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-10 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading payroll…
      </div>
    );
  }
  if (loadError || !payroll) {
    return (
      <Card className="m-4">
        <CardContent className="p-8 text-center text-muted-foreground">
          {loadError || "Payroll not found"}
        </CardContent>
      </Card>
    );
  }

  const selectedAccount = accounts.find((a) => String(a._id) === String(bankAccount));
  const slipPreview = editSlip ? computeSlip({ ...editSlip, ...slipForm }) : null;
  const who = (p) => [p?.firstName, p?.lastName].filter(Boolean).join(" ");

  return (
    <div className="container mx-auto space-y-6 px-0 py-2 sm:px-4 sm:py-6 lg:py-8">
      {/* Header */}
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="break-words text-xl font-bold sm:text-2xl">
                  {String(payroll.title).toUpperCase()}
                </CardTitle>
                <Badge className={STATUS_CLASS[payroll.status] || ""}>{payroll.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Pay period {moment(payroll.date).format("MMMM YYYY")} · dated {moment(payroll.date).format("DD MMM YYYY")}
              </p>
              {payroll.description && <p className="text-sm">{payroll.description}</p>}
              <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-xs text-muted-foreground">
                {who(payroll.processedBy) && <span>Prepared by {who(payroll.processedBy)}</span>}
                {payroll.paidAt && (
                  <span>
                    Paid {moment(payroll.paidAt).format("DD MMM YYYY, HH:mm")}
                    {who(payroll.paidBy) ? ` by ${who(payroll.paidBy)}` : ""}
                    {payroll.bankAccountName ? ` from ${payroll.bankAccountName}` : ""}
                  </span>
                )}
                {payroll.reversedAt && (
                  <span className="text-red-600">
                    Reversed {moment(payroll.reversedAt).format("DD MMM YYYY, HH:mm")}
                    {who(payroll.reversedBy) ? ` by ${who(payroll.reversedBy)}` : ""}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {perms.manage && isPending && (
                <Button variant="outline" size="sm" className="gap-2" onClick={openHeaderEditor} disabled={busy}>
                  <Pencil className="h-4 w-4" /> Edit details
                </Button>
              )}
              {perms.pay && isPending && (
                <Button size="sm" className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700" onClick={openPay} disabled={busy || !entries.length}>
                  <Banknote className="h-4 w-4" /> Pay salaries
                </Button>
              )}
              {perms.reverse && payroll.status === "Paid" && (
                <Button variant="destructive" size="sm" className="gap-2" onClick={() => setReverseOpen(true)} disabled={busy}>
                  <Undo2 className="h-4 w-4" /> Reverse payment
                </Button>
              )}
              <Button variant="secondary" size="sm" className="gap-2" onClick={downloadCsv} disabled={!entries.length}>
                <Download className="h-4 w-4" /> CSV
              </Button>
            </div>
          </div>

          {payroll.status === "Reversed" && (
            <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              This payroll was paid and then reversed: the money went back into the bank account and the salary journal was reversed. Create a new payroll to pay these salaries again.
            </div>
          )}
        </CardHeader>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Employees" value={entries.length} icon={Users} />
        <KpiCard title="Gross pay" value={naira(totals.gross)} icon={Wallet} />
        <KpiCard title="Deductions (pension, PAYE, other)" value={naira(totals.deductions)} icon={Receipt} />
        <KpiCard title="Net payable" value={naira(totals.net)} icon={TrendingUp} accent="text-emerald-600" />
      </div>

      {/* Payslips */}
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg">Payslips</CardTitle>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, staff ID, department…"
              className="pl-8 text-base sm:text-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department / Role</TableHead>
                  <TableHead className="text-right">Basic</TableHead>
                  <TableHead className="text-right">Allowances</TableHead>
                  <TableHead className="text-right">Bonus</TableHead>
                  <TableHead className="text-right">Gross</TableHead>
                  <TableHead className="text-right">Pension</TableHead>
                  <TableHead className="text-right">PAYE</TableHead>
                  <TableHead className="text-right">Other ded.</TableHead>
                  <TableHead className="text-right font-semibold">Net pay</TableHead>
                  {perms.manage && isPending && <TableHead className="w-24 text-center">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={12} className="py-10 text-center text-muted-foreground">
                      {entries.length ? "No payslip matches your search." : "This payroll has no payslips."}
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((e, i) => (
                  <TableRow key={e._id}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>
                      <div className="font-medium">{employeeName(e)}</div>
                      <div className="text-xs text-muted-foreground">
                        {e.employeeId?.staffId || e.employeeId?.employeeCode || e.employeeId?.Email || ""}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>{e.DEPT || "—"}</div>
                      <div className="text-xs text-muted-foreground">{e.JOB_ROLE || ""}</div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{naira(e.BASIC)}</TableCell>
                    <TableCell className="text-right tabular-nums">{naira(allowancesOf(e))}</TableCell>
                    <TableCell className="text-right tabular-nums">{naira(e.Bonus)}</TableCell>
                    <TableCell className="text-right tabular-nums">{naira(e.GROSS)}</TableCell>
                    <TableCell className="text-right tabular-nums">{naira(e.PENSION)}</TableCell>
                    <TableCell className="text-right tabular-nums">{naira(e.PAYEE)}</TableCell>
                    <TableCell className="text-right tabular-nums">{naira(otherDeductionsOf(e))}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums text-emerald-600">{naira(e.NET_PAYABLE)}</TableCell>
                    {perms.manage && isPending && (
                      <TableCell>
                        <div className="flex justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit payslip" onClick={() => openSlipEditor(e)} disabled={busy}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700" title="Remove from payroll" onClick={() => setDeleteSlip(e)} disabled={busy}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
              {entries.length > 0 && (
                <TableFooter>
                  <TableRow className="font-semibold">
                    <TableCell colSpan={3}>Totals ({entries.length})</TableCell>
                    <TableCell className="text-right tabular-nums">{naira(totals.basic)}</TableCell>
                    <TableCell className="text-right tabular-nums">{naira(totals.allowances)}</TableCell>
                    <TableCell className="text-right tabular-nums">{naira(totals.bonus)}</TableCell>
                    <TableCell className="text-right tabular-nums">{naira(totals.gross)}</TableCell>
                    <TableCell className="text-right tabular-nums">{naira(totals.pension)}</TableCell>
                    <TableCell className="text-right tabular-nums">{naira(totals.paye)}</TableCell>
                    <TableCell className="text-right tabular-nums">{naira(totals.other)}</TableCell>
                    <TableCell className="text-right tabular-nums text-emerald-600">{naira(totals.net)}</TableCell>
                    {perms.manage && isPending && <TableCell />}
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </div>
          {isPending && perms.manage && (
            <p className="mt-3 text-xs text-muted-foreground">
              Basic pay and allowances come from each employee's record. Edit bonuses and deductions here before the payroll is paid; once paid, payslips are locked.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Edit payslip */}
      <Dialog open={Boolean(editSlip)} onOpenChange={(o) => !o && setEditSlip(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit payslip</DialogTitle>
            <DialogDescription>{editSlip && employeeName(editSlip)}</DialogDescription>
          </DialogHeader>
          {editSlip && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Department</Label>
                  <Input value={slipForm.DEPT} onChange={(e) => setSlipForm({ ...slipForm, DEPT: e.target.value })} className="text-base sm:text-sm" />
                </div>
                <div className="space-y-1">
                  <Label>Job role</Label>
                  <Input value={slipForm.JOB_ROLE} onChange={(e) => setSlipForm({ ...slipForm, JOB_ROLE: e.target.value })} className="text-base sm:text-sm" />
                </div>
              </div>
              {["Earnings", "Deductions", "Info"].map((group) => (
                <div key={group} className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {EDIT_FIELDS.filter((f) => f.group === group).map((f) => (
                      <div key={f.key} className="space-y-1">
                        <Label htmlFor={f.key}>{f.label}</Label>
                        <Input
                          id={f.key}
                          type="number"
                          min="0"
                          step="0.01"
                          inputMode="decimal"
                          value={slipForm[f.key]}
                          onChange={(e) => setSlipForm({ ...slipForm, [f.key]: e.target.value })}
                          className="text-base sm:text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="rounded-md bg-muted/50 p-3 text-sm">
                <div className="flex justify-between"><span>Gross</span><span className="tabular-nums">{naira(slipPreview.gross)}</span></div>
                <div className="flex justify-between"><span>Deductions</span><span className="tabular-nums">{naira(slipPreview.deductions)}</span></div>
                <div className={`flex justify-between font-semibold ${slipPreview.net < 0 ? "text-red-600" : "text-emerald-600"}`}>
                  <span>Net pay</span><span className="tabular-nums">{naira(slipPreview.net)}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditSlip(null)} disabled={busy}>Cancel</Button>
            <Button onClick={saveSlip} disabled={busy || (slipPreview && slipPreview.net < 0)}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save payslip
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove payslip */}
      <AlertDialog open={Boolean(deleteSlip)} onOpenChange={(o) => !o && setDeleteSlip(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {deleteSlip && employeeName(deleteSlip)} from this payroll?</AlertDialogTitle>
            <AlertDialogDescription>
              Their payslip of {deleteSlip && naira(deleteSlip.NET_PAYABLE)} will be removed and the payroll total updated. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); removeSlip(); }} className="bg-red-600 hover:bg-red-700" disabled={busy}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit payroll details */}
      <Dialog open={editHeader} onOpenChange={setEditHeader}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit payroll details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="pr-title">Title</Label>
              <Input id="pr-title" value={headerForm.title} onChange={(e) => setHeaderForm({ ...headerForm, title: e.target.value })} className="text-base sm:text-sm" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="pr-date">Payroll date</Label>
              <Input id="pr-date" type="date" value={headerForm.date} onChange={(e) => setHeaderForm({ ...headerForm, date: e.target.value })} className="text-base sm:text-sm" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="pr-desc">Description</Label>
              <Textarea id="pr-desc" rows={3} value={headerForm.description} onChange={(e) => setHeaderForm({ ...headerForm, description: e.target.value })} className="text-base sm:text-sm" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditHeader(false)} disabled={busy}>Cancel</Button>
            <Button onClick={saveHeader} disabled={busy || !headerForm.title.trim() || !headerForm.date}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pay */}
      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pay salaries</DialogTitle>
            <DialogDescription>
              {naira(totals.net)} will be paid to {entries.length} employee{entries.length === 1 ? "" : "s"}. The bank balance is reduced and the salary journal is posted to the books.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="pay-bank">Pay from</Label>
            <select
              id="pay-bank"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              className="h-10 w-full rounded-md border bg-background px-3 text-base sm:text-sm"
            >
              <option value="">Choose a bank account…</option>
              {accounts.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.NAME} — {naira(a.Balance)}
                </option>
              ))}
            </select>
            {selectedAccount && num(selectedAccount.Balance) < totals.net && (
              <p className="flex items-center gap-1 text-xs text-amber-600">
                <AlertTriangle className="h-3.5 w-3.5" /> This account's balance is lower than the net pay.
              </p>
            )}
            <div className="rounded-md bg-muted/50 p-3 text-sm">
              <div className="flex justify-between"><span>Gross pay</span><span className="tabular-nums">{naira(totals.gross)}</span></div>
              <div className="flex justify-between"><span>Withheld (pension, PAYE, other)</span><span className="tabular-nums">{naira(totals.deductions)}</span></div>
              <div className="flex justify-between font-semibold"><span>Paid out now</span><span className="tabular-nums">{naira(totals.net)}</span></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayOpen(false)} disabled={busy}>Cancel</Button>
            <Button onClick={pay} disabled={busy || !bankAccount} className="bg-emerald-600 text-white hover:bg-emerald-700">
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Pay {naira(totals.net)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reverse */}
      <AlertDialog open={reverseOpen} onOpenChange={setReverseOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reverse this salary payment?</AlertDialogTitle>
            <AlertDialogDescription>
              {naira(payroll.totalAmount)} goes back into {payroll.bankAccountName || "the bank account it was paid from"} and the salary journal is reversed. Use this only if the salaries were not actually paid. It can't be undone; you would create a new payroll to pay again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); reverse(); }} className="bg-red-600 hover:bg-red-700" disabled={busy}>
              Reverse payment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
