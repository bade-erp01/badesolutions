"use client";

import React, { useState, Suspense,useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
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
  Search,
  Loader2,
} from "lucide-react";
import { useUser } from "@/components/UserProvider";
import {
  Encrypt,
  ErrorMessage,
  SuccessToast,
} from "../../../../../../../../Functions/Mics";
import { EXPRESS_PRIVATE_URL } from "../../../../../../../../Functions/Functions";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import moment from "moment";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

// ==================== SKELETONS ====================
function PayrollTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Pay-slip Entries</TableHead>
          <TableHead>Salary Paid</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Processed By</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i}>
            {Array.from({ length: 6 }).map((__, j) => (
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

// ==================== ASYNC DATA FETCH ====================
async function PayrollData({ user }) {
  if (!user?.user) throw new Error("fetch failed");

  const res = await fetch(`${EXPRESS_PRIVATE_URL}/api/PayRoll`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Encrypt(user.user.business.tenantId)}`,
      access: `${Encrypt(user.user.user._id)}`,
      sessionKey: `Bearer ${Encrypt(user.user.SessionId)}`,
    },
    //cache: revalidate every 60 seconds
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch payroll data");
  }

  const data = await res.json();
  return data;
}

// ==================== MAIN DASHBOARD ====================
export default function PayrollDashboard() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = useUser();
  const router = useRouter();
  const params = useParams();

  const handleNewPayroll = async (newPayroll) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${EXPRESS_PRIVATE_URL}/api/PayRoll`, {
        method: "POST",
        body: JSON.stringify({ data: Encrypt(newPayroll) }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(user.user.business.tenantId)}`,
          access: `${Encrypt(user.user.user._id)}`,
          sessionKey: `Bearer ${Encrypt(user.user.SessionId)}`,
        },
      });

      if (!res.ok) throw new Error("Failed to create payroll");

      const reqData = await res.json();

      SuccessToast("Payroll created successfully! Redirecting...");
      setTimeout(()=>{
        router.push(
        `/${params.auth}/V4/${params.Module}/${params.Module}/${reqData._id}`,
      );
      },5000)
    } catch (err) {
      ErrorMessage("Failed to create payroll. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payroll</h1>
          <p className="text-muted-foreground mt-1">Overview</p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>

          <NewPayrollModal onPayrollCreated={handleNewPayroll}>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Process Payroll"
              )}
            </Button>
          </NewPayrollModal>
        </div>
      </div>

      {/* Payroll Records Table */}
      <Card className="border">
        <CardHeader>
          <CardTitle>Payroll Records</CardTitle>
        </CardHeader>

        <CardContent>
          <Suspense fallback={<PayrollTableSkeleton />}>
            <PayrollTableContent user={user} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== TABLE CONTENT ====================

function PayrollTableContent({ user }) {
  const params = useParams();
  const [payrollData, setPayrollData] = useState(null);

  // Fetch payroll data once when user changes
  useEffect(() => {
    let mounted = true;
    PayrollData({ user }).then((data) => {
      if (mounted) setPayrollData(data);
    });
    return () => {
      mounted = false;
    };
  }, [user]);

  // Memoize KPI calculations so they only recompute when payrollData changes
  const kpiData = useMemo(() => {
    if (!payrollData) return [];

    return [
      {
        title: "Total Payout",
        value: `₦${payrollData.payout}`,
        icon: DollarSign,
      },
      {
        title: "Employee strength",
        value: `${payrollData.staff}`,
        icon: Users,
      },
      {
        title: "Pending Entries",
        value: `${payrollData.data.filter((entry) => entry.status === "Pending").length}`,
        icon: TrendingUp,
      },
      {
        title: "Pending Payments",
        value: `₦${payrollData.data
          .filter((entry) => entry.status === "Pending")
          .reduce((acc, record) => acc + (record.totalAmount || 0), 0)}`,
        icon: Clock,
      },
    ];
  }, [payrollData]);

  if (!payrollData) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Pay-slip Entries</TableHead>
            <TableHead>Salary Paid</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Processed By</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              {Array.from({ length: 6 }).map((__, j) => (
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

  return (
    <>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <Card key={index} className="border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <br />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Pay-slip Entries</TableHead>
            <TableHead>Salary Paid</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Processed By</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payrollData.data.length > 0 ? (
            payrollData.data.map((emp) => (
              <TableRow key={emp._id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  <Link
                    href={`/${params.auth}/V4/${params.Module}/${params.Module}/PayRoll/PayRoll/${Encrypt(emp._id)}`}
                    className="hover:underline"
                  >
                    {emp.title.toUpperCase()}
                  </Link>
                </TableCell>
                <TableCell>{moment(emp.date).format("YYYY-MM")}</TableCell>
                <TableCell>{emp.entries?.length || 0}</TableCell>
                <TableCell className="font-mono">
                  ₦{emp.totalAmount?.toLocaleString() || "0"}
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      emp.status === "Paid"
                        ? "bg-emerald-600 hover:bg-emerald-600"
                        : "bg-amber-600 hover:bg-amber-600"
                    }
                  >
                    {emp.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {emp.processedBy?.firstName} {emp.processedBy?.lastName}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-16 text-muted-foreground"
              >
                No payroll records found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
}

// New Payroll Modal Component
function NewPayrollModal({ children, onPayrollCreated }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date());
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !date) return alert("Please fill all fields");

    setIsSubmitting(true);

    setTimeout(() => {
      const newPayroll = {
        title: title.trim(),
        date: format(date, "yyyy-MM-dd"),
        description: description.trim(),
      };

      onPayrollCreated(newPayroll);
      setTitle("");
      setDescription("");
      setDate(new Date());
      setOpen(false);
      setIsSubmitting(false);
    }, 700);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-md border">
        <DialogHeader>
          <DialogTitle>Create New Payroll</DialogTitle>
          <DialogDescription>Schedule a new payroll run.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Payroll Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="July 2026 Monthly Payroll"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="border"
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>
              Payroll Date <span className="text-red-500">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal border",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border">
                <Calendar mode="single" selected={date} onSelect={setDate} />
              </PopoverContent>
            </Popover>
          </div>

          {/* Description Textarea */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add notes about this payroll run..."
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
              disabled={isSubmitting || !title.trim()}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? "Creating..." : "Create Payroll"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
