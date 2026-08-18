"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import {
  EXPRESS_PRIVATE_URL,
  Dencrypt,
} from "../../../../../../Functions/Functions";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
          <TableHead>####</TableHead>
          <TableHead>####</TableHead>
          <TableHead>####</TableHead>
          <TableHead>####</TableHead>
          <TableHead>####</TableHead>
          <TableHead>####</TableHead>
          <TableHead>####</TableHead>
          <TableHead>####</TableHead>
          <TableHead>####</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {Array.from({ length: 9 }).map((_, i) => (
          <TableRow key={i}>
            {Array.from({ length: 9 }).map((__, j) => (
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
  if (!user?.user) {
    throw new Error("User not available");
  }

  const res = await fetch(`${EXPRESS_PRIVATE_URL}/api/Contracts`, {
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
    throw new Error("Failed to fetch data");
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
      const res = await fetch(`${EXPRESS_PRIVATE_URL}/api/Contracts`, {
        method: "POST",
        body: JSON.stringify({
          data: Encrypt(newSubscription),
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(user.user.business.tenantId)}`,
          access: `${Encrypt(user.user.user._id)}`,
          sessionKey: `Bearer ${Encrypt(user.user.SessionId)}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to create contract");
      }

      const reqData = await res.json();

      SuccessToast("Contract created successfully!");

      setTimeout(() => {
        router.push(
          `/${params.auth}/V4/${params.Module}/${params.Module}/${reqData.data}`,
        );
      }, 1500);
    } catch (err) {
      console.error(err);
      ErrorMessage("Failed to create Contract. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contracts</h1>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>

          {user.user.user.raiseInvoice && 
            <NewSubscriptionModal
              user={user}
              onSubscriptionCreated={handleNewSubscription}
            >
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
                  "New contract"
                )}
              </Button>
            </NewSubscriptionModal>
          }
        </div>
      </div>

      {/* TABLE */}

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
        ErrorMessage("Failed to load data");
      } finally {
        if (mounted) {
          setLoading(false);
        }
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

    const pending = list.filter(
      (entry) => entry.status === "pending" || entry.status === "draft",
    );

    return [
      {
        title: "All Contracts",
        value: list.length.toString(),
        icon: Users,
      },

      {
        title: "Active / Running",
        value: list
          .filter((e) => e.status === "active" || e.status === "Paid")
          .length.toString(),
        icon: TrendingUp,
      },

      {
        title: "Pending",
        value: pending.length.toString(),
        icon: Clock,
      },

      {
        title: "Active Sum",
        value: `₦${list
          .filter((e) => e.status === "active" || e.status === "Paid")
          .reduce((acc, record) => acc + Number(record.contractAmount || 0), 0)
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
      {/* KPI */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

      {/* CONTRACT TABLE */}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Contract NO:</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead>Contract Amount</TableHead>
            <TableHead>Installment Fee</TableHead>
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
                    href={`/${params.auth}/V4/${params.Module}/${params.Module}/${Encrypt(
                      item._id,
                    )}`}
                    className="hover:underline"
                  >
                    {item.contractNumber?.toUpperCase() || "—"}
                  </Link>
                </TableCell>

                <TableCell>{item.customerId.Username || "—"}</TableCell>

                <TableCell>{item.customerId.Email || "—"}</TableCell>

                <TableCell>{item.invoiceId.billStatus}</TableCell>

                <TableCell>₦{Number(item.invoiceId.paymentMethod || 0).toLocaleString()}</TableCell>

                <TableCell className="font-mono">
                  ₦
                  {Number(
                    item.contractAmount ?? item.principalAmount ?? 0,
                  ).toLocaleString()}
                </TableCell>

                <TableCell>
                  ₦{Number(item.installmentFee ?? 0).toLocaleString()}
                </TableCell>

                <TableCell className="font-mono">
                  {item.installmentPeriod || 0} Months
                </TableCell>

                <TableCell>
                  <Badge
                    className={
                      item.status === "active"
                        ? "bg-emerald-600 hover:bg-emerald-600"
                        : "bg-amber-600 hover:bg-amber-600"
                    }
                  >
                    {item.status || "draft"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center py-16 text-muted-foreground"
              >
                No contracts found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
}

// ============================================================
// CREATE CONTRACT MODAL
// ============================================================

function NewSubscriptionModal({ children, onSubscriptionCreated, user }) {
  const [open, setOpen] = useState(false);

  // ==================== CUSTOMERS ====================

  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  const [selectedCustomerId, setSelectedCustomerId] = useState("");

  // ==================== INVOICES ====================

  const [invoices, setInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");

  // ==================== CONTRACT ====================

  const [title, setTitle] = useState("");

  const [paymentPlan, setPaymentPlan] = useState("monthly");

  const [principalAmount, setPrincipalAmount] = useState("");

  const [installmentPeriod, setInstallmentPeriod] = useState("");

  const [installmentFee, setInstallmentFee] = useState("");

  const [description, setDescription] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================================================
  // LOAD CUSTOMERS
  // ============================================================

  useEffect(() => {
    if (!open || !user?.user) return;

    let mounted = true;

    const loadCustomers = async () => {
      setLoadingCustomers(true);

      try {
        const res = await fetch(`${EXPRESS_PRIVATE_URL}/api/crm`, {
          method: "GET",

          headers: {
            "Content-Type": "application/json",

            Authorization: `Bearer ${Encrypt(user.user.business.tenantId)}`,

            access: `${Encrypt(user.user.user._id)}`,

            sessionKey: `Bearer ${Encrypt(user.user.SessionId)}`,
          },

          next: {
            revalidate: 120,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to load customers");
        }

        const data = await res.json();

        const decrypted = data;

        if (mounted) {
          const customerList = Array.isArray(decrypted) ? decrypted : [];

          // SORT BY USERNAME
          customerList.sort((a, b) =>
            String(a.Username || "").localeCompare(
              String(b.Username || ""),
              undefined,
              {
                sensitivity: "base",
              },
            ),
          );

          setCustomers(customerList);
        }
      } catch (err) {
        console.error(err);

        ErrorMessage("Failed to load customers");

        if (mounted) {
          setCustomers([]);
        }
      } finally {
        if (mounted) {
          setLoadingCustomers(false);
        }
      }
    };

    loadCustomers();

    return () => {
      mounted = false;
    };
  }, [open, user]);

  // ============================================================
  // LOAD INVOICES WHEN CUSTOMER CHANGES
  // ============================================================

  useEffect(() => {
    if (!selectedCustomerId || !user?.user) {
      setInvoices([]);
      setSelectedInvoiceId("");
      setTitle("");
      setPrincipalAmount("");
      setInstallmentFee("");

      return;
    }

    let mounted = true;

    const loadInvoices = async () => {
      setLoadingInvoices(true);

      setSelectedInvoiceId("");
      setInvoices([]);

      try {
        const res = await fetch(
          `${EXPRESS_PRIVATE_URL}/api/Contract/invoice/${Encrypt(
            selectedCustomerId,
          )}`,
          {
            method: "GET",

            headers: {
              "Content-Type": "application/json",

              Authorization: `Bearer ${Encrypt(user.user.business.tenantId)}`,

              access: `${Encrypt(user.user.user._id)}`,

              sessionKey: `Bearer ${Encrypt(user.user.SessionId)}`,
            },
          },
        );

        if (!res.ok) {
          throw new Error("Failed to load invoices");
        }

        const data = await res.json();

        const decrypted = Dencrypt(data.data);

        if (mounted) {
          setInvoices(Array.isArray(decrypted) ? decrypted : []);
        }
      } catch (err) {
        console.error(err);

        ErrorMessage("Failed to load invoices for this customer");

        if (mounted) {
          setInvoices([]);
        }
      } finally {
        if (mounted) {
          setLoadingInvoices(false);
        }
      }
    };

    loadInvoices();

    return () => {
      mounted = false;
    };
  }, [selectedCustomerId, user]);

  // ============================================================
  // WHEN INVOICE IS SELECTED
  // ============================================================

  useEffect(() => {
    if (!selectedInvoiceId) {
      setTitle("");
      setPrincipalAmount("");
      setInstallmentFee("");

      return;
    }

    const selectedInvoice = invoices.find(
      (invoice) => String(invoice._id) === String(selectedInvoiceId),
    );

    if (!selectedInvoice) {
      return;
    }

    // Current year
    const year = new Date().getFullYear();

    // Invoice reference
    const billReference = selectedInvoice.billReferenceNo || "";

    // Automatically generate contract title
    const generatedTitle = `CON/${billReference}/${year}`;

    setTitle(generatedTitle);

    // Contract amount MUST come from invoice
    const invoiceAmount = Number(selectedInvoice.grandTotal || 0);

    setPrincipalAmount(invoiceAmount);
    setInstallmentFee("");
  }, [selectedInvoiceId, invoices]);

  // ============================================================
  // CALCULATED INSTALLMENT
  // ============================================================

  const calculatedInstallment = useMemo(() => {
    const principal = Number(principalAmount);

    const period = Number(installmentPeriod);

    if (!principal || !period || period <= 0) {
      return 0;
    }

    return principal / period;
  }, [principalAmount, installmentPeriod]);

  // ============================================================
  // CURRENCY FORMAT
  // ============================================================

  const formatCurrency = (value) => {
    return Number(value || 0).toLocaleString("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 2,
    });
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Invoice is mandatory
    if (
      !selectedCustomerId ||
      !selectedInvoiceId ||
      !title.trim() ||
      !paymentPlan ||
      !principalAmount ||
      !installmentPeriod
    ) {
      ErrorMessage(
        "Please select a customer, invoice and fill all required fields.",
      );

      return;
    }

    const principal = Number(principalAmount);

    const period = Number(installmentPeriod);

    if (principal <= 0) {
      ErrorMessage("Invoice amount must be greater than zero.");

      return;
    }

    if (period <= 0) {
      ErrorMessage("Installment period must be at least 1 month.");

      return;
    }

    // Find selected invoice again
    const selectedInvoice = invoices.find(
      (invoice) => String(invoice._id) === String(selectedInvoiceId),
    );

    if (!selectedInvoice) {
      ErrorMessage("Selected invoice could not be found.");

      return;
    }

    // ALWAYS use invoice grandTotal
    const invoiceGrandTotal = Number(selectedInvoice.grandTotal || 0);

    if (invoiceGrandTotal <= 0) {
      ErrorMessage("Selected invoice has an invalid grand total.");

      return;
    }

    setIsSubmitting(true);

    try {
      const newSubscription = {
        // Customer
        customerId: selectedCustomerId,

        // Invoice
        invoiceId: selectedInvoiceId,

        // Contract
        title: title.trim(),

        // Automatically generated contract number/title
        contractNumber: title.trim(),

        // Payment
        paymentPlan,

        installmentFrequency: paymentPlan,

        installmentPeriod: period,

        // Amount comes DIRECTLY from invoice
        principalAmount: invoiceGrandTotal,

        contractAmount: invoiceGrandTotal,

        totalContractAmount: invoiceGrandTotal,

        // Installment
        installmentFee: Number(
          (installmentFee
            ? Number(installmentFee)
            : invoiceGrandTotal / period
          ).toFixed(2),
        ),

        description: description.trim(),
      };

      await onSubscriptionCreated(newSubscription);

      // ========================================================
      // RESET FORM
      // ========================================================

      setSelectedCustomerId("");
      setSelectedInvoiceId("");
      setInvoices([]);

      setTitle("");

      setPaymentPlan("monthly");

      setPrincipalAmount("");

      setInstallmentPeriod("");

      setInstallmentFee("");

      setDescription("");

      setOpen(false);
    } catch (error) {
      console.error(error);

      ErrorMessage("Failed to create contract");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div onClick={() => setOpen(true)} className="inline-flex">
        {children}
      </div>

      <DialogContent className="w-[calc(100%-2rem)] max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Contract</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ==================================================
              CUSTOMER
          ================================================== */}

          <div className="space-y-2">
            <Label>
              Customer <span className="text-red-500">*</span>
            </Label>

            <Select
              value={selectedCustomerId}
              onValueChange={setSelectedCustomerId}
              disabled={loadingCustomers}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    loadingCustomers
                      ? "Loading customers..."
                      : "Select customer"
                  }
                />
              </SelectTrigger>

              <SelectContent>
                {customers.length === 0 && !loadingCustomers ? (
                  <SelectItem value="none" disabled>
                    No customers found
                  </SelectItem>
                ) : (
                  customers.map((customer) => (
                    <SelectItem key={customer._id} value={customer._id}>
                      {customer.Username}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* ==================================================
              INVOICE
          ================================================== */}

          <div className="space-y-2">
            <Label>
              Linked Invoice <span className="text-red-500">*</span>
            </Label>

            <Select
              value={selectedInvoiceId}
              onValueChange={setSelectedInvoiceId}
              disabled={!selectedCustomerId || loadingInvoices}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    !selectedCustomerId
                      ? "Select a customer first"
                      : loadingInvoices
                        ? "Loading invoices..."
                        : "Select invoice"
                  }
                />
              </SelectTrigger>

              <SelectContent>
                {invoices.length === 0 &&
                selectedCustomerId &&
                !loadingInvoices ? (
                  <SelectItem value="none" disabled>
                    No invoices found for this customer
                  </SelectItem>
                ) : (
                  invoices.map((invoice) => (
                    <SelectItem key={invoice._id} value={invoice._id}>
                      {invoice.billReferenceNo || "Invoice"}
                      {" — "}₦{Number(invoice.grandTotal || 0).toLocaleString()}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* ==================================================
              CONTRACT TITLE
          ================================================== */}

          <div className="space-y-2">
            <Label htmlFor="contract-title">Contract Title</Label>

            <Input
              id="contract-title"
              value={title}
              readOnly
              placeholder="Select an invoice"
              className="bg-muted"
            />

            <p className="text-xs text-muted-foreground">
              Automatically generated from the selected invoice.
            </p>
          </div>

          {/* ==================================================
              PAYMENT PLAN
          ================================================== */}

          <div className="space-y-2">
            <Label>
              Payment Plan <span className="text-red-500">*</span>
            </Label>

            <Select value={paymentPlan} onValueChange={setPaymentPlan}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select payment plan" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ==================================================
              CONTRACT AMOUNT
          ================================================== */}

          <div className="space-y-2">
            <Label>Contract Amount</Label>

            <Input
              type="text"
              value={principalAmount ? formatCurrency(principalAmount) : ""}
              readOnly
              placeholder="Select an invoice"
              className="bg-muted"
            />

            <p className="text-xs text-muted-foreground">
              Automatically taken from the selected invoice's grand total.
            </p>
          </div>

          {/* ==================================================
              INSTALLMENT PERIOD
          ================================================== */}

          <div className="space-y-2">
            <Label htmlFor="installment-period">
              Installment Period (Months){" "}
              <span className="text-red-500">*</span>
            </Label>

            <Input
              id="installment-period"
              type="number"
              min="1"
              step="1"
              placeholder="6"
              value={installmentPeriod}
              onChange={(e) => setInstallmentPeriod(e.target.value)}
              required
            />
          </div>

          {/* ==================================================
              CALCULATED INSTALLMENT
          ================================================== */}

          <div className="rounded-xl border bg-muted/40 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Monthly Installment</p>

                <p className="text-xs text-muted-foreground">
                  Automatically calculated from invoice total
                </p>
              </div>

              <p className="text-lg font-bold whitespace-nowrap">
                {formatCurrency(calculatedInstallment)}
              </p>
            </div>
          </div>

          {/* ==================================================
              OPTIONAL MANUAL INSTALLMENT
          ================================================== */}

          <div className="space-y-2">
            <Label htmlFor="installment-fee">Installment Fee (Optional)</Label>

            <Input
              id="installment-fee"
              type="number"
              min="0"
              step="0.01"
              placeholder={
                calculatedInstallment ? calculatedInstallment.toFixed(2) : "0"
              }
              value={installmentFee}
              onChange={(e) => setInstallmentFee(e.target.value)}
            />
          </div>

          {/* ==================================================
              DESCRIPTION
          ================================================== */}

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>

            <Textarea
              id="description"
              placeholder="Add notes about this contract..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          {/* ==================================================
              SUMMARY
          ================================================== */}

          {principalAmount && installmentPeriod && (
            <div className="rounded-xl border p-4 space-y-3">
              <p className="text-sm font-semibold">Contract Summary</p>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Invoice Amount</span>

                <span className="font-medium">
                  {formatCurrency(principalAmount)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Term</span>

                <span className="font-medium">
                  {installmentPeriod || 0} month
                  {Number(installmentPeriod) === 1 ? "" : "s"}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Monthly Installment
                </span>

                <span className="font-medium">
                  {formatCurrency(calculatedInstallment)}
                </span>
              </div>

              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold">Total Contract Amount</span>

                <span className="font-bold">
                  {formatCurrency(principalAmount)}
                </span>
              </div>
            </div>
          )}

          {/* ==================================================
              FOOTER
          ================================================== */}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={
                isSubmitting ||
                loadingCustomers ||
                loadingInvoices ||
                !selectedCustomerId ||
                !selectedInvoiceId ||
                !title.trim() ||
                !paymentPlan ||
                !principalAmount ||
                !installmentPeriod
              }
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? "Creating..." : "Create Contract"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
