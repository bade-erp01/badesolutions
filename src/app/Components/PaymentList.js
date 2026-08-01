"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
import {Encrypt} from "../../../Functions/Mics"
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
  
  const [currentPage, setCurrentPage] = useState(1);
  const [status, setStatus] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [accountId, setAccountId] = useState("");
  const CustomersList = useMemo(() => Customers || [], [Customers]);
  const PaymentList = useMemo(() => Payments || [], [Payments]);
  const Accountslist = useMemo(() => bank || [], [bank]);
  const module  = useParams();

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

  // Helper functions to get display names
  const getCustomerName = (id) => {
    const customer = CustomersList.find((c) => c._id === id);
    return customer ? (customer.Username || customer.customer_code || id) : id;
  };

  const getAccountName = (id) => {
    const account = Accountslist.find((a) => a._id === id);
    return account ? (account.NAME || account.bankCode || id) : id;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "posted":
        return <Badge variant="default">Posted</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "Reversed":
        return <Badge variant="destructive">Reversed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

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
        <CardContent className="p-6">
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
            <Button variant="default" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </UiCard>

      {/* PAYMENT TABLE */}
      <UiCard className="shadow-sm border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Posted by</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPayments.length > 0 ? (
                paginatedPayments.map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell>
                      <Link href={`/${module.auth}/V4/${module.Module}/${module.Module}/${Encrypt(payment._id)}`} className="text-blue-500">
                        {payment.paymentReferenceNo.trim().toUpperCase()}
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium">
                      {payment.PaymentDate 
                        ? new Date(payment.PaymentDate).toLocaleDateString() 
                        : "—"}
                    </TableCell>
                    <TableCell>{getCustomerName(payment.customer)}</TableCell>
                    <TableCell>{payment.Accountant}</TableCell>
                    <TableCell>{getAccountName(payment.bankAccount)}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No payments found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </UiCard>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </Button>

          <Badge variant="secondary">
            Page {currentPage} of {totalPages}
          </Badge>

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            className="gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}