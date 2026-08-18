"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  MessageCircle,
  Building2,
  Calendar,
  CreditCard,
  Clock,
  Banknote,
  ArrowRight,
  Download,
  Trash2,
  Receipt,
  Loader2,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import{  ErrorMessage, SuccessToast} from "../../../../../../../Functions/Mics";
import { Encrypt, Dencrypt} from "../../../../../../../Functions/Functions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ContractDetailsPage({
  data,
  payment,
  baseUrl,
  Currentuser,
  business,
}) {
  const [contract, setContract] = useState(data);
  const [payments] = useState(payment);
  const [loading, setLoading] = useState({
    activate: false,
    delete: false,
    download: false,
  });
  const router = useRouter();
  const params = useParams();

  const progress = Math.min(
    (contract.PeriodCount / contract.installmentPeriod) * 100,
    100,
  );

  // Simulate API delay
  const delay = (ms = 800) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleActivate = async (status) => {
    setLoading((prev) => ({ ...prev, activate: true }));

    try {
      const response = await fetch(`${baseUrl}/api/Contract/${Encrypt(contract._id)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(business.tenantId)}`,
          access: `${Encrypt(Currentuser._id)}`,
          sessionKey: `Bearer ${Encrypt(Currentuser.SessionId)}`,
        },
        body: JSON.stringify({ update: Encrypt(status) }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update contract");
      }else{
         const updatedContract = await response.json();
        SuccessToast(updatedContract.message)
        setContract(Dencrypt(updatedContract.data));
      }

    } catch (err) {
      ErrorMessage(err.message || "Failed to activate contract");
    } finally {
      setLoading((prev) => ({ ...prev, activate: false }));
    }
  };

  const handleDownloadPDF = async () => {
    setLoading((prev) => ({ ...prev, download: true }));
    try {
      await delay(1000);
      // Simulate PDF download
      alert(`Downloading PDF for ${contract.contractNumber}`);
      // Real implementation:
      // const res = await fetch(`/api/contracts/${contract._id}/pdf`)
      // const blob = await res.blob()
      // const url = URL.createObjectURL(blob)
      // const a = document.createElement('a')
      // a.href = url
      // a.download = `${contract.contractNumber}.pdf`
      // a.click()
    } catch (err) {
      alert("Failed to download PDF");
    } finally {
      setLoading((prev) => ({ ...prev, download: false }));
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete contract ${contract.contractNumber}? This action cannot be undone.`,
    );
    if (!confirmed) return;

    setLoading((prev) => ({ ...prev, delete: true }));

    try {
      const response = await fetch(
        `${baseUrl}/api/Contract/${Encrypt(contract._id)}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Encrypt(business.tenantId)}`,
            access: `${Encrypt(Currentuser._id)}`,
            sessionKey: `Bearer ${Encrypt(Currentuser.SessionId)}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete contract");
      }

      const result = await response.json();

      SuccessToast(result.message || "Contract deleted successfully");

      // Update local state (soft delete style)
      setContract((prev) => ({
        ...prev,
        isDeleted: true,
        deletedAt: new Date().toISOString(),
        status: "cancelled",
        updatedAt: new Date().toISOString(),
      }));

      // Optional: redirect after delete
      router.push(`/${params.auth}/V4/${params.Module}/${params.Module}`);
    } catch (err) {
      ErrorMessage(err.message || "Failed to delete contract");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      <main className="px-4 sm:px-6 py-8 space-y-6">
        {/* Hero Status Card */}
        <section className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-fuchsia-500/5 dark:from-violet-500/10 dark:to-fuchsia-500/10 pointer-events-none" />

          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div>
                    <h1 className="text-lg font-semibold tracking-tight">
                      {contract.contractNumber}
                    </h1>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Contract Details
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`
                    inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase
                    ${
                      contract.status === "draft"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                        : contract.status === "active"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                          : "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"
                    }
                  `}
                  >
                    {contract.status}
                  </span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400 capitalize">
                    {contract.type} · {contract.paymentPlan}
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    {formatCurrency(contract.totalContractAmount)}
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    Total Contract Value
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-start sm:items-end gap-1 text-sm">
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                  <Calendar className="w-4 h-4" />
                  <span>Created {formatDate(contract.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                  <Clock className="w-4 h-4" />
                  <span>Last updated {formatDateTime(contract.updatedAt)}</span>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="mt-8">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  Installment Progress
                </span>
                <span className="text-zinc-500 dark:text-zinc-400">
                  {contract.PeriodCount} of {contract.installmentPeriod} periods
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Financial Breakdown */}
            <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                  <Banknote className="w-4 h-4" />
                  Financial Breakdown
                </h3>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                <div className="px-6 py-4 flex items-center justify-between">
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    Principal Amount
                  </span>
                  <span className="text-sm font-semibold">
                    {formatCurrency(contract.principalAmount)}
                  </span>
                </div>
                <div className="px-6 py-4 flex items-center justify-between">
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    Installment Fee
                  </span>
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    + {formatCurrency(contract.installmentFee)}
                  </span>
                </div>
                <div className="px-6 py-4 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50">
                  <span className="text-sm font-medium">
                    Total Contract Residues{" "}
                  </span>
                  <span className="text-base font-bold">
                    {formatCurrency(
                      contract.totalContractAmount -
                        contract.invoiceId.paymentMethod,
                    )}
                  </span>
                </div>
              </div>
            </section>

            {/* Payment Terms */}
            <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Payment Log
                </h3>
              </div>

              <div className="p-3">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ref</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Accountant</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {payments.length > 0 ? (
                      payments.map((payment) => (
                        <TableRow key={payment._id}>
                          <TableCell>{payment.paymentReferenceNo}</TableCell>
                          <TableCell>{payment.PaymentDate}</TableCell>
                          <TableCell>{payment.Accountant}</TableCell>
                          <TableCell>{payment.status}</TableCell>
                          <TableCell>{formatCurrency(payment.crAmount)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center">
                          No payments found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Customer */}
            <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Customer
                </h3>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate capitalize">
                      {contract.customerId.Username}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Primary Customer
                    </p>
                  </div>
                </div>
                {/* customer details */}
                <div className="p-6 space-y-4 text-sm">
                  {/* Email */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                      <Mail className="w-4 h-4 shrink-0" />
                      <span>Email</span>
                    </div>
                    {contract.customerId?.Email ? (
                      <Link
                        href={`mailto:${contract.customerId.Email}`}
                        className="font-mono text-xs text-right truncate max-w-[160px] text-violet-600 dark:text-violet-400 hover:underline"
                      >
                        {contract.customerId.Email}
                      </Link>
                    ) : (
                      <span className="text-xs text-zinc-400">—</span>
                    )}
                  </div>

                  {/* WhatsApp */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                      <MessageCircle className="w-4 h-4 shrink-0" />
                      <span>WhatsApp</span>
                    </div>
                    {contract.customerId?.phone ? (
                      <Link
                        href={`https://wa.me/${contract.customerId.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs text-right truncate max-w-[160px] text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        {contract.customerId.phone}
                      </Link>
                    ) : (
                      <span className="text-xs text-zinc-400">—</span>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Meta Info */}
            <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Meta
                </h3>
              </div>
              <div className="p-6 space-y-4 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-zinc-500 dark:text-zinc-400">
                    Invoice Status
                  </span>
                  <span className="font-mono text-xs text-right truncate max-w-[140px]">
                    {contract.invoiceId.billStatus}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-zinc-500 dark:text-zinc-400">
                    Invoice Ref;
                  </span>
                  <span className="font-mono text-xs text-right truncate max-w-[140px]">
                    {contract.invoiceId.billReferenceNo}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">
                    Discount
                  </span>
                  <span className="capitalize font-medium">
                    {contract.invoiceId.discount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">
                    Duration
                  </span>
                  <span className="font-medium">
                    {contract.installmentPeriod} months
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">Plan</span>
                  <span className="font-medium capitalize">
                    {contract.installmentFrequency}
                  </span>
                </div>
              </div>
            </section>

            {/* Actions */}
            <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
              <div className="p-3 space-y-1">
                <button
                  onClick={() =>
                    router.push(
                      `/${params.auth}/V4/Sales/Sales/${Encrypt(contract.invoiceId._id)}`,
                    )
                  }
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  <Receipt className="w-4 h-4" />
                  View Invoice
                </button>

                <button
                  onClick={handleDownloadPDF}
                  disabled={loading.download}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition disabled:opacity-60"
                >
                  {loading.download ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {loading.download ? "Downloading..." : "Download PDF"}
                </button>

                <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />

                {contract.status === "draft" && 
                  <button
                    onClick={handleDelete}
                    disabled={loading.delete || contract.isDeleted}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition disabled:opacity-60"
                  >
                    {loading.delete ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    {loading.delete
                      ? "Deleting..."
                      : contract.isDeleted
                        ? "Deleted"
                        : "Delete Contract"}
                  </button>
                }

                {/* Status Action Buttons - sequential approval flow */}
                {contract.status === "draft" && (
                  <button
                    onClick={() => handleActivate("under_review")}
                    disabled={loading.activate || contract.isDeleted}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading.activate ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit for Review
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}

                {contract.status === "under_review" && (
                  <button
                    onClick={() => handleActivate("active")}
                    disabled={loading.activate || contract.isDeleted}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading.activate ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Activating...
                      </>
                    ) : (
                      <>
                        Activate
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}

                {contract.status === "active" && (
                  <button
                    onClick={() => handleActivate("terminated")}
                    disabled={loading.activate || contract.isDeleted}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading.activate ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Terminating...
                      </>
                    ) : (
                      <>
                        Terminate
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
