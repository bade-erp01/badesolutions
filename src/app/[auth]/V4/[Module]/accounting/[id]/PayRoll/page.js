"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import moment from "moment";
import { format } from "date-fns";
import {
  Wallet,
  Users,
  Clock,
  Hourglass,
  Download,
  Loader2,
  Plus,
  Search,
  Calendar as CalendarIcon,
} from "lucide-react";

import { useUser } from "@/components/UserProvider";
import {
  ErrorMessage,
  SuccessToast,
} from "../../../../../../../../Functions/Mics";
import api from "@/lib/api";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const naira = (v) =>
  `₦${num(v).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const STATUS_CLASS = {
  Pending: "bg-amber-500 hover:bg-amber-500 text-white",
  Paid: "bg-emerald-600 hover:bg-emerald-600 text-white",
  Reversed: "bg-red-600 hover:bg-red-600 text-white",
};

function KpiCard({ title, value, sub, icon: Icon, accent = "" }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${accent || "text-muted-foreground"}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-xl lg:text-2xl font-bold break-all ${accent}`}>{value}</div>
        {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function RowsSkeleton() {
  return Array.from({ length: 5 }).map((_, i) => (
    <TableRow key={i}>
      {Array.from({ length: 6 }).map((__, j) => (
        <TableCell key={j}>
          <div className="h-5 animate-pulse rounded bg-muted" />
        </TableCell>
      ))}
    </TableRow>
  ));
}

export default function PayrollDashboard() {
  const user = useUser();
  const router = useRouter();
  const params = useParams();

  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", date: new Date(), description: "" });

  const me = user?.user?.user || {};
  const canCreate = Boolean(me.isHRM || me.isAdmin);

  const load = useCallback(async () => {
    try {
      setError("");
      const res = await api.get(`/api/PayRoll`);
      const body = res.data || {};
      if (!res.ok) throw new Error(body.error || "Failed to load payrolls");
      setData(body);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    if (user?.user) load();
  }, [user, load]);

  const detailHref = (id) => `/${params.auth}/V4/${params.Module}/${params.Module}/PayRoll/PayRoll/${id}`;

  const rows = useMemo(() => {
    const list = data?.data || [];
    const q = query.trim().toLowerCase();
    return list.filter(
      (p) =>
        (!statusFilter || p.status === statusFilter) &&
        (!q || String(p.title || "").toLowerCase().includes(q) || String(p.description || "").toLowerCase().includes(q))
    );
  }, [data, query, statusFilter]);

  const createPayroll = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date) return;
    setCreating(true);
    try {
      const res = await api.post(`/api/PayRoll`, {
          data: {
            title: form.title.trim(),
            date: format(form.date, "yyyy-MM-dd"),
            description: form.description.trim(),
          },
        }, {
        headers: { "idempotency-key": `payroll-create-${crypto.randomUUID()}` },
      });
      const body = res.data || {};
      if (!res.ok) throw new Error(body.error || "Failed to create payroll");
      SuccessToast("Payroll created with a payslip for every active employee");
      setCreateOpen(false);
      setForm({ title: "", date: new Date(), description: "" });
      router.push(detailHref(body._id)); // backend returns the id already encrypted
    } catch (err) {
      ErrorMessage(err.message || "Failed to create payroll. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const exportCsv = () => {
    if (!rows.length) return;
    const cell = (v) => {
      const s = String(v ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [
      ["Title", "Pay period", "Status", "Payslips", "Net pay", "Prepared by", "Paid on", "Reversed on"].join(","),
      ...rows.map((p) =>
        [
          p.title,
          moment(p.date).format("YYYY-MM"),
          p.status,
          p.entryCount ?? 0,
          num(p.totalAmount),
          [p.processedBy?.firstName, p.processedBy?.lastName].filter(Boolean).join(" "),
          p.paidAt ? moment(p.paidAt).format("YYYY-MM-DD") : "",
          p.reversedAt ? moment(p.reversedAt).format("YYYY-MM-DD") : "",
        ].map(cell).join(",")
      ),
    ].join("\n");
    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payrolls_${moment().format("YYYY-MM-DD")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Payroll</h1>
          <p className="mt-1 text-muted-foreground">Salary runs, payslips and payments</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="gap-2" onClick={exportCsv} disabled={!rows.length}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          {canCreate && (
            <Button className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> New payroll
            </Button>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total paid out" value={data ? naira(data.payout) : "…"} sub="Paid payrolls only" icon={Wallet} accent="text-emerald-600" />
        <KpiCard title="Active employees" value={data ? data.staff : "…"} icon={Users} />
        <KpiCard title="Payrolls awaiting payment" value={data ? data.pendingCount : "…"} icon={Hourglass} />
        <KpiCard title="Pending net pay" value={data ? naira(data.pendingAmount) : "…"} icon={Clock} accent="text-amber-600" />
      </div>

      {/* Records */}
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Payroll records</CardTitle>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <div className="relative sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search payrolls…" className="pl-8 text-base sm:text-sm" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-md border bg-background px-3 text-base sm:text-sm"
            >
              <option value="">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Reversed">Reversed</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="py-10 text-center text-muted-foreground">
              {error}
              <div className="mt-3">
                <Button variant="outline" size="sm" onClick={load}>Try again</Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Title</TableHead>
                    <TableHead>Pay period</TableHead>
                    <TableHead className="text-center">Payslips</TableHead>
                    <TableHead className="text-right">Net pay</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Prepared by</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!data && <RowsSkeleton />}
                  {data && rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-16 text-center text-muted-foreground">
                        {data.data.length ? "No payroll matches your filters." : "No payroll records yet."}
                      </TableCell>
                    </TableRow>
                  )}
                  {rows.map((p) => (
                    <TableRow key={p._id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(detailHref(p._id))}>
                      <TableCell className="font-medium">
                        <Link href={detailHref(p._id)} className="hover:underline" onClick={(e) => e.stopPropagation()}>
                          {String(p.title || "").toUpperCase()}
                        </Link>
                        {p.description && <div className="max-w-xs truncate text-xs text-muted-foreground">{p.description}</div>}
                      </TableCell>
                      <TableCell>{moment(p.date).format("MMM YYYY")}</TableCell>
                      <TableCell className="text-center">{p.entryCount ?? 0}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">{naira(p.totalAmount)}</TableCell>
                      <TableCell>
                        <Badge className={STATUS_CLASS[p.status] || ""}>{p.status}</Badge>
                        {p.paidAt && p.status === "Paid" && (
                          <div className="mt-1 text-xs text-muted-foreground">{moment(p.paidAt).format("DD MMM YYYY")}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {[p.processedBy?.firstName, p.processedBy?.lastName].filter(Boolean).join(" ") || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create payroll */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New payroll</DialogTitle>
            <DialogDescription>
              A payslip is created for every active employee from their salary record. You can adjust bonuses and deductions before it is paid.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={createPayroll} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                placeholder="October salaries"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                maxLength={100}
                className="text-base sm:text-sm"
              />
              <p className="text-xs text-muted-foreground">Saved as PAY/{form.title.trim() || "…"}/{form.date ? form.date.getFullYear() : ""}</p>
            </div>
            <div className="space-y-2">
              <Label>Payroll date <span className="text-red-500">*</span></Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" className={cn("w-full justify-start text-left font-normal", !form.date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.date ? format(form.date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={form.date} onSelect={(d) => setForm({ ...form, date: d })} />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Notes about this payroll run…"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                maxLength={500}
                className="text-base sm:text-sm"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>Cancel</Button>
              <Button type="submit" disabled={creating || !form.title.trim() || !form.date} className="bg-emerald-600 text-white hover:bg-emerald-700">
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create payroll
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
