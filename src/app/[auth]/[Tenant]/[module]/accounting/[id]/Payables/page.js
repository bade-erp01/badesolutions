"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import moment from "moment";
import { Dencrypt, Encrypt } from "../../../../../../../../Functions/Functions";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function AccountPayablesPage({ baseUrl, userData, VendorList, BanksList }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [billList, setBillList] = useState([]);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const params = useParams();

  // Fetch bills
  useEffect(() => {
    const fetchBills = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${baseUrl}/api/Payables?page=${currentPage}&limit=100`,
          {
            headers: {
              "Content-Type": "application/json",
              dbConnect: `Bearer ${userData.business.rustyRoof}`,
              Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
            },
          }
        );

        const data = response.data;
        setBillList(Dencrypt(data.data) || []);
        setTotalPages(data.pagination.totalPages);
        setTotalInvoices(data.pagination.total);
      } catch (error) {
        console.error("Error fetching bills:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBills();
  }, [currentPage, baseUrl, userData]);

  const filteredVendors = (id) => {
    try {
      const vendor = VendorList.find((v) => v._id === id);
      return vendor ? vendor.Name : "Unknown";
    } catch {
      return "Unknown";
    }
  };

  const filteredBanksList = (id) => {
    try {
      const bank = BanksList.find((b) => b._id === id);
      return bank ? bank.bankName : "Unknown";
    } catch {
      return "Unknown";
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "posted":
        return <Badge variant="default">Posted</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "reversed":
        return <Badge variant="destructive">Reversed</Badge>;
      default:
        return <Badge variant="outline">N/A</Badge>;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r bg-card flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center text-white font-bold">AP</div>
            <div>
              <div className="font-semibold">ACCOUNT PAYABLES</div>
              <div className="text-xs text-muted-foreground">Vendor Payments</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {["Dashboard", "Invoices", "Payments", "Vendors", "Reports"].map((item) => (
            <Button
              key={item}
              variant={item === "Invoices" ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              {item}
            </Button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="border-b bg-card p-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-3xl font-bold">Account Payables</h1>
            <p className="text-muted-foreground">Manage and track vendor payments</p>
          </div>

          <div className="flex items-center gap-4">
            <Input
              placeholder="Search bills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-80"
            />
            <Button>Export</Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">TOTAL INVOICES</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{totalInvoices}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">CURRENT PAGE</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{currentPage} <span className="text-xl text-muted-foreground">/ {totalPages}</span></div>
              </CardContent>
            </Card>
          </div>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle>Bills List</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-pulse space-y-4">
                    {[...Array(6)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                </div>
              ) : billList.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ref No</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Accountant</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Bank</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billList.map((bill) => (
                      <TableRow key={bill._id} className="hover:bg-muted/50">
                        <TableCell>
                          <Link
                            href={`/${params.auth}/${params.Tenant}/${params.module}/${params.module}/vendorsPayment/vendorsPayment/${Encrypt(bill._id)}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {bill.billReferenceNo}
                          </Link>
                        </TableCell>
                        <TableCell>{filteredVendors(bill.vendor)}</TableCell>
                        <TableCell>{bill.AccountatntId || "—"}</TableCell>
                        <TableCell>{moment(bill.PaymentDate).format("DD MMM YYYY")}</TableCell>
                        <TableCell>{getStatusBadge(bill.ledgerStatus)}</TableCell>
                        <TableCell>{filteredBanksList(bill.bankAccount)}</TableCell>
                        <TableCell className="text-right font-medium">
                          ₦{bill.Amount?.toLocaleString() ?? "0"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-12 text-center text-muted-foreground">
                  No bills found.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}