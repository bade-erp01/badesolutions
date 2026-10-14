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
  Encrypt,
  ErrorMessage,
  SuccessToast,
} from "../../../../../../Functions/Mics";
import { EXPRESS_PRIVATE_URL, Dencrypt } from "../../../../../../Functions/Functions";

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

  const res = await fetch(`${EXPRESS_PRIVATE_URL}/api/Subscriptions`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Encrypt(user.user.business.tenantId)}`,
      access: `${Encrypt(user.user.user._id)}`,
      sessionKey: `Bearer ${Encrypt(user.user.SessionId)}`,
    },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch subscriptions");
  }

  const data = await res.json();
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
      const res = await fetch(`${EXPRESS_PRIVATE_URL}/api/Subscriptions`, {
        method: "POST",
        body: JSON.stringify({ data: Encrypt(newSubscription) }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(user.user.business.tenantId)}`,
          access: `${Encrypt(user.user.user._id)}`,
          sessionKey: `Bearer ${Encrypt(user.user.SessionId)}`,
        },
      });

      if (!res.ok) throw new Error("Failed to create subscription");

      const reqData = await res.json();

      SuccessToast("Subscription created successfully!");
      
      // Optional: redirect to detail page if your API returns an _id
      setTimeout(() => {
        router.push(
          `/${params.auth}/V4/${params.Module}/${params.Module}/${reqData.data}`
        );
      }, 1500);
    } catch (err) {
      ErrorMessage("Failed to create subscription. Please try again.");
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
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>

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
function SubscriptionTableContent({ user }) {
  const params = useParams();
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const data = await fetchSubscriptions(user);
        if (mounted) {
          setSubscriptionData(data);
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

  const kpiData = useMemo(() => {
    if (!subscriptionData) return [];

    const list = subscriptionData || [];
    const pending = list.filter((entry) => entry.status === "pending");

    return [
      {
        title: "All Subscriptions",
        value: list.length.toString(),
        icon: Users,
      },
      {
        title: "Active / Running",
        value: list.filter((e) => e.status === "Active" || e.status === "Paid").length.toString(),
        icon: TrendingUp,
      },
      {
        title: "Pending",
        value: pending.length.toString(),
        icon: Clock,
      },
      {
        title: "Active Sum",
        value: `₦${list.filter((e) => e.status === "Active" || e.status === "Paid")
          .reduce((acc, record) => acc + (record.fee || 0), 0)
          .toLocaleString()}`,
        icon: DollarSign,
      },
    ];
  }, [subscriptionData]);

  if (loading || !subscriptionData) {
    return <SubscriptionTableSkeleton />;
  }

  const list = subscriptionData || [];

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
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subscription Plan</TableHead>
            <TableHead>Renewable</TableHead>
            <TableHead>Subscription Fee</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.length > 0 ? (
            list.map((item) => (
              <TableRow key={item._id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  <Link
                    href={`/${params.auth}/V4/${params.Module}/${params.Module}/${Encrypt(item._id)}`}
                    className="hover:underline"
                  >
                    {item.title?.toUpperCase() || "—"}
                  </Link>
                </TableCell>
                <TableCell>
                  {item.plan || "—"}
                </TableCell>
                <TableCell className="font-mono">
                  ₦{(item.fee ?? item.fee ?? 0).toLocaleString()}
                </TableCell>
                <TableCell className="font-mono">
                  {item.completionDate || 0} Months
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      item.status === "Paid" || item.status === "Active"
                        ? "bg-emerald-600 hover:bg-emerald-600"
                        : "bg-amber-600 hover:bg-amber-600"
                    }
                  >
                    {item.status || "Pending"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-16 text-muted-foreground"
              >
                No subscriptions found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
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
    setcompletionDate(0)
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
                {/* <SelectItem value="daily">Daily</SelectItem> */}
                <SelectItem value="monthly">Monthly</SelectItem>
                {/* <SelectItem value="yearly">Yearly</SelectItem> */}
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