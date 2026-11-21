"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  Download,
  Loader2,
} from "lucide-react";
import { useUser } from "@/components/UserProvider";
import {
  ErrorMessage,
  SuccessToast,
} from "../../../../../../Functions/Mics";
import { Dencrypt } from "../../../../../../Functions/Functions";
import api from "@/lib/api";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import moment from "moment";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ==================== SKELETON ====================
function SubscriptionTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Subscription Plan</TableHead>
          <TableHead>Renewal Date</TableHead>
          <TableHead>Subscription Fee</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created By</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i}>
            {Array.from({ length: 5 }).map((__, j) => (
              <TableCell key={j}>
                <div className="h-5 bg-muted rounded animate-pulse" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ==================== DATA FETCH ====================
async function fetchSubscriptions(user) {
  if (!user?.user) throw new Error("User not available");

  const res = await api.get(`/api/Subscriptions`);

  if (!res.ok) {
    throw new Error("Failed to fetch subscriptions");
  }

  const data = res.data || {};
  return Dencrypt(data.data);
}

// ==================== MAIN DASHBOARD ====================
export default function SubscriptionDashboard() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useUser();
  const router = useRouter();
  const params = useParams();

  const handleNewSubscription = async (newSubscription) => {
    setIsSubmitting(true);
    try {
      const res = await api.post(`/api/Subscriptions`, { data: newSubscription });

      if (!res.ok) throw new Error(res.data?.error || res.error || "Failed to create subscription");

      const reqData = res.data || {};

      SuccessToast("Subscription created successfully!");
      
      // Optional: redirect to detail page if your API returns an _id
      setTimeout(() => {
        router.push(
          `/${params.auth}/V4/${params.Module}/${params.Module}/${reqData.data}`
        );
      }, 1500);
    } catch (err) {
      ErrorMessage(err.message || "Failed to create subscription. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Subscriptions</h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <NewSubscriptionModal onSubscriptionCreated={handleNewSubscription}>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "New Subscription"
              )}
            </Button>
          </NewSubscriptionModal>
        </div>
      </div>

      {/* Content */}
      <Card className="border">
        <CardContent className="pt-6">
          <SubscriptionTableContent user={user} />
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== TABLE + KPI ====================
const naira = (n) => `₦${Number(n || 0).toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;
const BILLS = { monthly: "Monthly", quarterly: "Quarterly", yearly: "Yearly" };

// one CSV cell: quoted, and safe from spreadsheet formulas
function csvCell(v) {
  let t = v === null || v === undefined ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(t)) t = `'${t}`;
  return `"${t.replace(/"/g, '""')}"`;
}

function downloadCsv(filename, rows) {
  const csv = rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function SubscriptionTableContent({ user }) {
  const params = useParams();
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [data, rep] = await Promise.all([
          fetchSubscriptions(user),
          api.get("/api/subscriptions/report?days=30"),
        ]);
        if (mounted) {
          setSubscriptionData(data);
          if (rep.ok) setReport(rep.data);
        }
      } catch (err) {
        console.error(err);
        ErrorMessage("Failed to load subscriptions");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (user?.user) {
      load();
    }

    return () => {
      mounted = false;
    };
  }, [user]);

  const byPlan = useMemo(() => new Map((report?.plans || []).map((p) => [String(p.planId), p])), [report]);

  const kpiData = useMemo(() => {
    const t = report?.totals;
    return [
      { title: "Subscribers", value: String(t?.subscribers ?? 0), sub: `${t?.active ?? 0} active · ${t?.trial ?? 0} on trial`, icon: Users },
      { title: "Monthly recurring revenue", value: naira(t?.mrr), sub: `${naira(t?.arr)} a year`, icon: DollarSign },
      { title: "Overdue", value: String((report?.overdue || []).length), sub: `${t?.paused ?? 0} paused`, icon: Clock },
      { title: "Renewing in 30 days", value: String((report?.upcoming || []).length), sub: naira((report?.upcoming || []).reduce((s, u) => s + (u.amount || 0), 0)), icon: TrendingUp },
    ];
  }, [report]);

  if (loading || !subscriptionData) {
    return <SubscriptionTableSkeleton />;
  }

  const list = subscriptionData || [];

  const exportCsv = () => {
    const rows = [["Plan", "Bills", "Fee (before VAT)", "VAT %", "Duration (months)", "Status", "Active", "Trial", "Overdue", "Paused", "Cancelled", "Monthly recurring revenue"]];
    for (const item of list) {
      const r = byPlan.get(String(item._id));
      rows.push([
        item.title, BILLS[item.plan] || item.plan, item.fee, item.vatRate || 0, item.completionDate, item.status,
        r?.counts?.active ?? 0, r?.counts?.trial ?? 0, r?.counts?.past_due ?? 0, r?.counts?.paused ?? 0, r?.counts?.cancelled ?? 0, r?.mrr ?? 0,
      ]);
    }
    downloadCsv(`subscription-plans-${moment().format("YYYY-MM-DD")}.csv`, rows);
  };

  const planHref = (id) => `/${params.auth}/V4/${params.Module}/${params.Module}/${id}`;

  return (
    <>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        {kpiData.map((kpi, index) => (
          <Card key={index} className="border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl lg:text-3xl font-bold break-all">{kpi.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end mb-3">
        <Button variant="outline" className="gap-2" onClick={exportCsv} disabled={!list.length}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subscription Plan</TableHead>
              <TableHead>Bills</TableHead>
              <TableHead>Fee (before VAT)</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Subscribers</TableHead>
              <TableHead className="text-right">Monthly revenue</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.length > 0 ? (
              list.map((item) => {
                const r = byPlan.get(String(item._id));
                const c = r?.counts || {};
                return (
                  <TableRow key={item._id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <Link href={planHref(item._id)} className="hover:underline">
                        {item.title?.toUpperCase() || "—"}
                      </Link>
                    </TableCell>
                    <TableCell>{BILLS[item.plan] || item.plan || "—"}</TableCell>
                    <TableCell className="font-mono">{naira(item.fee)}{item.vatRate ? ` + ${item.vatRate}% VAT` : ""}</TableCell>
                    <TableCell className="font-mono">{item.completionDate || 0} months</TableCell>
                    <TableCell>
                      {(c.active || 0) + (c.trial || 0) + (c.past_due || 0) + (c.paused || 0)}
                      {c.past_due ? <span className="text-xs text-destructive"> · {c.past_due} overdue</span> : null}
                    </TableCell>
                    <TableCell className="text-right font-mono">{naira(r?.mrr)}</TableCell>
                    <TableCell>
                      <Badge className={item.status === "active" ? "bg-emerald-600 hover:bg-emerald-600" : "bg-amber-600 hover:bg-amber-600"}>
                        {item.status || "pending"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16 text-muted-foreground">
                  No subscriptions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {report && (report.overdue.length > 0 || report.upcoming.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <Card className="border">
            <CardHeader className="pb-2"><CardTitle className="text-base">Overdue</CardTitle></CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Last invoice</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.overdue.length ? report.overdue.slice(0, 20).map((o, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Link className="text-indigo-600 hover:underline" href={`/${params.auth}/V4/crm/crm/${o.customerId}`}>{o.customer}</Link>
                        {o.status === "paused" && <span className="block text-xs text-muted-foreground">paused</span>}
                      </TableCell>
                      <TableCell>{o.plan}</TableCell>
                      <TableCell>{o.lastBillRef || "—"}<span className="block text-xs text-muted-foreground">{o.lastBilledOn}{o.daysSinceBill !== null ? ` · ${o.daysSinceBill} days ago` : ""}</span></TableCell>
                      <TableCell className="text-right">{naira(o.balance)}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">Nobody is overdue.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card className="border">
            <CardHeader className="pb-2"><CardTitle className="text-base">Renewing in the next 30 days</CardTitle></CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.upcoming.length ? report.upcoming.slice(0, 20).map((u, i) => (
                    <TableRow key={i}>
                      <TableCell className="whitespace-nowrap">{u.nextBillDate}</TableCell>
                      <TableCell>{u.customer}</TableCell>
                      <TableCell>{u.plan}</TableCell>
                      <TableCell className="text-right">{naira(u.amount)}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">Nothing due in the next 30 days.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {report && (
        <p className="text-xs text-muted-foreground mt-6">
          Last 12 months: {report.monthly.reduce((t, m) => t + m.started, 0)} new · {report.monthly.reduce((t, m) => t + m.cancelled, 0)} cancelled
          {report.totals.deferredPending ? ` · ${naira(report.totals.deferredPending)} invoiced but not yet earned (deferred)` : ""}
        </p>
      )}
    </>
  );
}

// ==================== CREATE MODAL ====================
function NewSubscriptionModal({ children, onSubscriptionCreated }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [subscriptionType, setSubscriptionType] = useState("");
  const [fee, setFee] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completionDate, setcompletionDate] = useState(1)

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !subscriptionType || !fee) {
      return alert("Please fill all required fields");
    }

    setIsSubmitting(true);

    const newSubscription = {
      title: title.trim(),
      plan:subscriptionType,
      fee: Number(fee),
      description: description.trim(),
      completionDate
    };

    onSubscriptionCreated(newSubscription);

    // Reset form
    setTitle("");
    setSubscriptionType("");
    setFee("");
    setDescription("");
    setOpen(false);
    setIsSubmitting(false);
    setcompletionDate(1)
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-md border">
        <DialogHeader>
          <DialogTitle>Create New Subscription</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">
              Subscription Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Monthly Subscription"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="border"
            />
          </div>

          <div className="space-y-2">
            <Label>
              Subscription Type <span className="text-red-500">*</span>
            </Label>
            <Select value={subscriptionType} onValueChange={setSubscriptionType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select subscription type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly (every 3 months)</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fee">
              Subscription Fee <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fee"
              placeholder="0"
              type="number"
              step="any"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              required
              className="border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fee">
              Duration [Months]<span className="text-red-500">*</span>
            </Label>
            <Input
              id="fee"
              placeholder="1"
              type="number"
              min={1}
              step="1"
              value={completionDate}
              onChange={(e) => {
                const val = e.target.value;
                // Allow empty while typing
                if (val === "") {
                  setcompletionDate("");
                  return;
                }
                const num = Number(val);
                // Force ≥ 1
                setcompletionDate(Math.max(1, num));
              }}
              required
              className="border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add notes about this subscription..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border"
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting || !title.trim() || !subscriptionType || !fee
              }
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? "Creating..." : "Create Subscription"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}