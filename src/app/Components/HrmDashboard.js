"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  ClipboardList,
  Clock3,
  RefreshCw,
  Target,
  UserPlus,
  UsersRound,
  Wallet,
} from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const emptyDashboard = {
  salesKpis: [],
  activeUsers: [],
  activeLeaves: [],
  tasks: [],
};

function displayName(person) {
  return [person.firstName, person.lastName].filter(Boolean).join(" ") || "Staff member";
}

function formatDate(value) {
  if (!value) return "Date not set";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date not set"
    : date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function money(value, currency) {
  const amount = Number(value) || 0;
  return `${currency}${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function payrollMoney(value, currency) {
  const amount = Number(value) || 0;
  return `${currency}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function HrmDashboard({ userData }) {
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [payroll, setPayroll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payrollLoading, setPayrollLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState("");
  const [payrollError, setPayrollError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", notes: "", assigneeId: "", dueDate: "" });

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/api/HRM/dashboard");
        if (!response.ok) throw new Error(response.error || "Could not load HR dashboard");
        if (active) setDashboard({ ...emptyDashboard, ...(response.data?.data || {}) });
      } catch (loadError) {
        if (active) setError(loadError.message || "Could not load HR dashboard");
      } finally {
        if (active) setLoading(false);
      }
    };

    const loadPayroll = async () => {
      setPayrollLoading(true);
      setPayrollError("");
      try {
        const response = await api.get("/api/PayRoll");
        if (!response.ok) throw new Error(response.data?.error || "Could not load payroll summary");
        if (active) setPayroll(response.data || {});
      } catch (loadError) {
        if (active) setPayrollError(loadError.message || "Could not load payroll summary");
      } finally {
        if (active) setPayrollLoading(false);
      }
    };

    loadDashboard();
    loadPayroll();
    return () => {
      active = false;
    };
  }, [refreshKey]);

  const activeUsers = dashboard.activeUsers || [];
  const salesKpis = dashboard.salesKpis || [];
  const activeLeaves = dashboard.activeLeaves || [];
  const tasks = dashboard.tasks || [];
  const payrollRows = payroll?.data || [];
  const openTasks = tasks.filter((task) => !["done", "completed"].includes(String(task.status).toLowerCase()));
  const currency = userData?.business?.currency?.currency?.Symbol || "";

  const submitTask = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.assigneeId) return;

    setSaving(true);
    setError("");
    try {
      const response = await api.post("/api/HRM/tasks", {
        title: form.title.trim(),
        notes: form.notes.trim(),
        assigneeId: form.assigneeId,
        dueDate: form.dueDate || null,
      });
      if (!response.ok) throw new Error(response.error || "Could not assign task");
      setForm({ title: "", notes: "", assigneeId: "", dueDate: "" });
      setRefreshKey((key) => key + 1);
    } catch (submitError) {
      setError(submitError.message || "Could not assign task");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-6" aria-labelledby="hr-dashboard-title">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">People operations</p>
          <h2 id="hr-dashboard-title" className="mt-1 text-2xl font-semibold">HR team overview</h2>
          <p className="mt-1 text-sm text-muted-foreground">Sales targets, team tasks, and staff currently on leave.</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setRefreshKey((key) => key + 1)} disabled={loading}>
          <RefreshCw className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </header>

      {error && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 border-l-4 border-rose-500 bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
          <span>{error}</span>
          <Button type="button" variant="outline" size="sm" onClick={() => setRefreshKey((key) => key + 1)}>Retry</Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryMetric icon={UsersRound} label="Active staff" value={activeUsers.length} tone="emerald" />
        <SummaryMetric icon={CalendarDays} label="Currently on leave" value={activeLeaves.length} tone="amber" />
        <SummaryMetric icon={ClipboardList} label="Open team tasks" value={openTasks.length} tone="coral" />
      </div>

      <section className="space-y-4" aria-labelledby="hr-payroll-title">
        <div className="flex items-end justify-between gap-3 border-b border-border pb-3">
          <div>
            <h3 id="hr-payroll-title" className="flex items-center gap-2 text-lg font-semibold">
              <Wallet className="h-5 w-5 text-emerald-700" /> Payroll snapshot
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">Payout and pending-run overview for this tenant.</p>
          </div>
        </div>
        {payrollError ? (
          <div role="alert" className="border-l-4 border-rose-500 bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
            Payroll summary unavailable: {payrollError}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryMetric icon={Wallet} label="Total paid out" value={payrollLoading ? "..." : payrollMoney(payroll?.payout, currency)} tone="emerald" />
              <SummaryMetric icon={UsersRound} label="Active employees" value={payrollLoading ? "..." : payroll?.staff ?? 0} tone="coral" />
              <SummaryMetric icon={Clock3} label="Awaiting payment" value={payrollLoading ? "..." : payroll?.pendingCount ?? 0} tone="amber" />
              <SummaryMetric icon={ClipboardList} label="Pending net pay" value={payrollLoading ? "..." : payrollMoney(payroll?.pendingAmount, currency)} tone="coral" />
            </div>
            <div className="border-y border-border">
              <div className="flex items-center justify-between gap-3 py-3">
                <h4 className="text-sm font-semibold">Recent payroll runs</h4>
                <span className="text-xs text-muted-foreground">Latest {Math.min(payrollRows.length, 4)}</span>
              </div>
              {payrollLoading ? <LoadingRows /> : payrollRows.length ? payrollRows.slice(0, 4).map((run) => (
                <div key={run._id} className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{run.title || "Payroll run"}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(run.date)} · {run.entryCount ?? 0} payslips</p>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-semibold tabular-nums">{payrollMoney(run.totalAmount, currency)}</span>
                    <span className="rounded-sm bg-muted px-2 py-1 text-xs capitalize text-muted-foreground">{run.status || "Pending"}</span>
                  </div>
                </div>
              )) : <EmptyState text="No payroll runs are available." />}
            </div>
          </>
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.8fr)]">
        <Card className="min-w-0 shadow-none">
          <CardHeader className="border-b border-border px-5 py-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4 text-emerald-700" /> Staff sales targets
            </CardTitle>
            <p className="text-sm text-muted-foreground">Same achieved-sales / target measure used by the main dashboard.</p>
          </CardHeader>
          <CardContent className="space-y-4 px-5 py-4">
            {loading ? (
              <LoadingRows />
            ) : salesKpis.length ? salesKpis.map((person) => {
              const achieved = Number(person.percentage) || 0;
              const progress = Math.min(Math.max(achieved, 0), 100);
              return (
                <div key={person.userId || person._id} className="grid gap-2 border-b border-border/70 pb-4 last:border-0 last:pb-0 sm:grid-cols-[minmax(140px,0.8fr)_minmax(0,1.4fr)_auto] sm:items-center">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{displayName(person)}</p>
                    <p className="text-xs text-muted-foreground">{person.email || "Sales team"}</p>
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between gap-3 text-xs">
                      <span className="text-muted-foreground">{money(person.totalSales, currency)} of {money(person.salesTarget, currency)}</span>
                      <span className="font-semibold tabular-nums">{achieved.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label={`${displayName(person)} sales target`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
                      <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground sm:text-right">Target {money(person.salesTarget, currency)}</span>
                </div>
              );
            }) : (
              <EmptyState text={loading ? "Loading staff targets..." : "No staff sales targets are available."} />
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0 shadow-none">
          <CardHeader className="border-b border-border px-5 py-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <UserPlus className="h-4 w-4 text-emerald-700" /> Assign a team task
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 py-4">
            <form className="space-y-4" onSubmit={submitTask}>
              <label className="block space-y-1.5 text-sm font-medium">
                Task
                <Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} maxLength={160} required placeholder="e.g. Submit weekly sales report" />
              </label>
              <label className="block space-y-1.5 text-sm font-medium">
                Assign to active staff
                <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.assigneeId} onChange={(event) => setForm((current) => ({ ...current, assigneeId: event.target.value }))} required disabled={loading || activeUsers.length === 0}>
                  <option value="">{activeUsers.length ? "Choose a staff member" : "No active staff available"}</option>
                  {activeUsers.map((person) => <option key={person._id} value={person._id}>{displayName(person)}{person.email ? ` · ${person.email}` : ""}</option>)}
                </select>
              </label>
              <label className="block space-y-1.5 text-sm font-medium">
                Notes <span className="font-normal text-muted-foreground">(optional)</span>
                <Textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} maxLength={1000} rows={3} placeholder="Add context or expected outcome" />
              </label>
              <label className="block space-y-1.5 text-sm font-medium">
                Due date <span className="font-normal text-muted-foreground">(optional)</span>
                <Input type="date" value={form.dueDate} onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))} />
              </label>
              <Button type="submit" className="w-full" disabled={saving || loading || activeUsers.length === 0}>
                <UserPlus /> {saving ? "Assigning..." : "Assign task"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="min-w-0 shadow-none">
          <CardHeader className="border-b border-border px-5 py-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="h-4 w-4 text-amber-700" /> Staff on leave
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border px-5">
            {loading ? <LoadingRows /> : activeLeaves.length ? activeLeaves.map((leave) => (
              <div key={leave.leaveId || leave._id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{displayName(leave)}</p>
                  <p className="text-xs text-muted-foreground">{leave.leaveType || "Leave"} · through {formatDate(leave.endDate)}</p>
                </div>
                <div className="flex items-center gap-2 text-right text-sm">
                  <Clock3 className="h-4 w-4 text-amber-700" />
                  <span className="font-medium">{Number(leave.daysUntilResume) <= 0 ? "Resumes today" : `Resumes in ${leave.daysUntilResume} ${Number(leave.daysUntilResume) === 1 ? "day" : "days"}`}</span>
                </div>
              </div>
            )) : <EmptyState text="No staff are currently on leave." />}
          </CardContent>
        </Card>

        <Card className="min-w-0 shadow-none">
          <CardHeader className="border-b border-border px-5 py-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="h-4 w-4 text-rose-700" /> Recent assigned tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border px-5">
            {loading ? <LoadingRows /> : tasks.length ? tasks.slice(0, 6).map((task) => (
              <div key={task._id} className="flex items-start justify-between gap-4 py-4">
                <div className="min-w-0">
                  <p className="wrap-break-word text-sm font-semibold">{task.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{task.assigneeName || "Assigned staff"}{task.dueDate ? ` · Due ${formatDate(task.dueDate)}` : ""}</p>
                </div>
                <span className="shrink-0 rounded-sm bg-muted px-2 py-1 text-xs capitalize text-muted-foreground">{task.status || "open"}</span>
              </div>
            )) : <EmptyState text="No tasks assigned yet." />}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function SummaryMetric({ icon: Icon, label, value, tone }) {
  const toneClasses = {
    emerald: "border-l-emerald-600 text-emerald-700",
    amber: "border-l-amber-500 text-amber-700",
    coral: "border-l-rose-600 text-rose-700",
  };

  return (
    <Card className={`rounded-md border-l-4 shadow-none ${toneClasses[tone]}`}>
      <CardContent className="flex items-center justify-between gap-3 p-4">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{value}</p>
        </div>
        <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      </CardContent>
    </Card>
  );
}

function LoadingRows() {
  return (
    <div className="space-y-4 py-2" aria-label="Loading dashboard data">
      {[0, 1, 2].map((row) => <div key={row} className="h-10 animate-pulse rounded-sm bg-muted" />)}
    </div>
  );
}

function EmptyState({ text }) {
  return <p className="py-8 text-center text-sm text-muted-foreground">{text}</p>;
}