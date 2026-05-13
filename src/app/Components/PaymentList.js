"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";

import Card from "@/app/Components/Card";

/* shadcn/ui */
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import {
  Card as UiCard,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PaymentListpage({
  bank,
  Customers,
  Payments,
}) {
  const { module } = useParams();

  const [currentPage, setCurrentPage] = useState(1);
  const [status, setStatus] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [accountId, setAccountId] = useState("");

  const CustomersList = useMemo(() => Customers || [], [Customers]);
  const PaymentList = useMemo(() => Payments || [], [Payments]);
  const Accountslist = useMemo(() => bank || [], [bank]);

  const itemsPerPage = 12;

  const filteredPayments = useMemo(() => {
    return PaymentList.filter((p) => {
      return (
        (!status || p.status === status) &&
        (!customerId || p.customer === customerId) &&
        (!paymentDate || p.PaymentDate === paymentDate) &&
        (!accountId || p.bankAccount === accountId)
      );
    });
  }, [PaymentList, status, customerId, paymentDate, accountId]);

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPayments.slice(start, start + itemsPerPage);
  }, [filteredPayments, currentPage]);

  const resetFilters = () => {
    setStatus("");
    setCustomerId("");
    setPaymentDate("");
    setAccountId("");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">

      {/* FILTER CARD */}
      <UiCard className="shadow-sm border">
        <CardContent className="p-2">

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

            {/* Customer */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Customer</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="All Customers" />
                </SelectTrigger>
                <SelectContent>
                  {CustomersList.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.Username || c.customer_code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="posted">Posted</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="Reversed">Reversed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Account */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Account</Label>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="All Accounts" />
                </SelectTrigger>
                <SelectContent>
                  {Accountslist.map((a) => (
                    <SelectItem key={a._id} value={a._id}>
                      {a.NAME || a.bankCode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Payment Date</Label>
              <Input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="h-10"
              />
            </div>
          </div>

          <div className="flex justify-end mt-6 pt-4 border-t">
            <Button variant="outline" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </UiCard>

      {/* PAYMENT GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {paginatedPayments.length > 0 ? (
          paginatedPayments.map((payment) => (
            <Card key={payment._id} data={payment} module={module} />
          ))
        ) : (
          <UiCard className="col-span-full">
            <CardContent className="p-6 text-center text-muted-foreground">
              No payments found
            </CardContent>
          </UiCard>
        )}
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-center gap-3">

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          className="gap-2 text-black"
        >
          Prev
        </Button>

        <Badge variant="secondary">
          Page {currentPage} of {totalPages || 1}
        </Badge>

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          className="gap-2 text-black"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}