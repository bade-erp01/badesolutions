"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { Encrypt } from "../../../../../../Functions/Mics";
import { pricelistSetter } from "../../../../../../Functions/Functions";
import SuspenenseFallBack from "@/app/Components/SuspenenseFallBack";
import { Paperclip, ShoppingCart,Database } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function InvoiceLandingPage({ baseUrl, userData }) {
  const [searchRef, setSearchRef] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [billList, setBillList] = useState([]);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const params = useParams();
  const itemsPerPage = 20;

  // 🔹 Fetch function lifted out of useEffect
  const fetchBills = async (append = false, page = currentPage) => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        itemsPerPage: itemsPerPage.toString(),
        searchRef,
        startDate,
        endDate,
      }).toString();

      const response = await axios.get(`${baseUrl}/api/Invoice?${query}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
          access: `${Encrypt(userData.user._id)}`,
          sessionKey: `Bearer ${Encrypt(userData.SessionId)}`
        },
      });

      const data = response.data;

      setBillList(prev =>
        append ? [...prev, ...(data.invoices || [])] : (data.invoices || [])
      );
      setTotalPages(data.totalPages);
      setTotalInvoices(data.totalInvoices);
      setCurrentPage(data.currentPage);
    } catch (error) {
      // console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  //  Auto-refresh effect
// Auto refresh ONLY when exactly 20 invoices are loaded
useEffect(() => {
  let intervalId;

  // stop completely if invoices are more than 20
  if (billList.length > 20) {
    return;
  }

  const startAutoRefresh = () => {
    // refresh immediately
    fetchBills(false);

    // clear previous interval before creating new one
    clearInterval(intervalId);

    intervalId = setInterval(() => {
      fetchBills(false);
    }, 120000); // 2 mins
  };

  const stopAutoRefresh = () => {
    clearInterval(intervalId);
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }
  };

  // start only if page is visible
  if (document.visibilityState === "visible") {
    startAutoRefresh();
  }

  document.addEventListener(
    "visibilitychange",
    handleVisibilityChange
  );

  return () => {
    stopAutoRefresh();

    document.removeEventListener(
      "visibilitychange",
      handleVisibilityChange
    );
  };
}, [billList.length, searchRef, startDate, endDate]);

  // 🔹 Load More handler
  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchBills(true, nextPage); // append new invoices
    }
  };

  return (
    <Suspense fallback={<SuspenenseFallBack pagedata={"Invoice List"} />}>
      <Card>
        <CardHeader className="flex justify-between gap-2">
          <CardTitle>Sales Management</CardTitle>
          <Badge variant="secondary" className="text-xs">
            Auto refresh is enabled
          </Badge>
        </CardHeader>
        <Separator />
        <CardContent>
          {isLoading && billList.length === 0 ? (
            <SuspenenseFallBack pagedata={"Invoice List"} />
          ) : billList.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ref No</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Store</TableHead>
                    <TableHead>Pricelist</TableHead>
                    <TableHead>Alt</TableHead>
                    <TableHead>
                      <ShoppingCart className="h-4 w-4" />
                    </TableHead>
                    <TableHead>
                      <Database className="w-4 h-4" />
                    </TableHead>
                    <TableHead>Raised By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billList.map((bill) => {
                    const url =
                      bill.billStatus?.toLowerCase() === "draft"
                        ? `/${params.auth}/${params.Tenant}/${params.module}/Forms/invoice/${Encrypt(bill._id)}`
                        : `/${params.auth}/${params.Tenant}/bill/bill/${Encrypt(bill._id)}`;

                    return (
                      <TableRow key={bill._id}>
                        <TableCell>
                          <Link
                            href={url}
                            className="text-indigo-600 hover:underline font-medium"
                          >
                            {bill?.billReferenceNo && bill?.invoicelocation
                              ? `${bill.billReferenceNo}/${bill.invoicelocation}`
                              : "View Draft"}
                          </Link>
                        </TableCell>
                        <TableCell>{bill.customerName}</TableCell>
                        <TableCell>{bill.startDate}</TableCell>
                        <TableCell>{bill.whId.WHName}</TableCell>
                        <TableCell>{pricelistSetter(bill.priceList,userData.business)}</TableCell>
                        <TableCell>
                          {bill.memoId && (
                            <Paperclip className="h-4 w-4 text-gray-400" />
                          )}
                        </TableCell>
                        <TableCell>{bill.orders.length} SKU</TableCell>
                        <TableCell>{bill.means ?? "—"}</TableCell>
                        <TableCell>{bill.RaiseBy}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full font-semibold ${
                              bill.billStatus === "Invoice"
                                ? "bg-green-100 text-green-700"
                                : bill.billStatus === "Order"
                                ? "bg-yellow-100 text-yellow-700"
                                : bill.billStatus === "Cancelled"
                                ? "bg-red-100 text-red-700"
                                : bill.billStatus === "Processing"
                                ? "bg-gray-200 text-gray-800"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {bill.billStatus}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          ₦{bill.grandTotal.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Load More Button */}
              {currentPage < totalPages && (
                <div className="flex justify-center mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLoadMore}
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : "Load More"}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Empty>
              <EmptyTitle>No sales registered yet</EmptyTitle>
              <EmptyDescription>
                You haven&apos;t created any order yet. Get started by recording your first sales.
              </EmptyDescription>
            </Empty>
          )}
        </CardContent>
      </Card>
    </Suspense>
  );
}
