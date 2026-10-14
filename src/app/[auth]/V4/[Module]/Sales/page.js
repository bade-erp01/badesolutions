"use client";

import { useState, useEffect, Suspense, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { Encrypt } from "../../../../../../Functions/Mics";
import { pricelistSetter, EXPRESS_PRIVATE_URL } from "../../../../../../Functions/Functions";
import SuspenenseFallBack from "@/app/Components/SuspenenseFallBack";
import { Paperclip, ShoppingCart } from "lucide-react";
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
import { useUser } from "@/components/UserProvider";

export default function InvoiceLandingPage({ baseUrl = EXPRESS_PRIVATE_URL }) {
  const [searchRef, setSearchRef] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [billList, setBillList] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Once the user clicks "Load More", auto-refresh is permanently disabled
  // until filters change (or you force a full reset).
  const hasLoadedMore = useRef(false);

  const { user } = useUser();
  const userData = user;
  const params = useParams();
  const itemsPerPage = 20;

  const fetchBills = useCallback(
    async ({ cursor = null, append = false, isAutoRefresh = false } = {}) => {
      // Never auto-refresh after the user has loaded more pages
      if (isAutoRefresh && hasLoadedMore.current) return;

      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        const queryParams = new URLSearchParams({
          limit: itemsPerPage.toString(),
        });

        if (cursor) queryParams.set("cursor", cursor);
        if (searchRef) queryParams.set("searchRef", searchRef);
        if (startDate) queryParams.set("startDate", startDate);
        if (endDate) queryParams.set("endDate", endDate);

        const response = await axios.get(
          `${baseUrl}/api/Invoice?${queryParams.toString()}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
              access: `${Encrypt(userData.user._id)}`,
              sessionKey: `Bearer ${Encrypt(userData.SessionId)}`,
            },
          }
        );

        const data = response.data;
        const newInvoices = data.invoices || [];

        setBillList((prev) =>
          append ? [...prev, ...newInvoices] : newInvoices
        );

        setNextCursor(data.nextCursor || null);
        setHasMore(Boolean(data.hasMore));

        if (append) {
          hasLoadedMore.current = true; // ← stop auto-refresh from now on
        }
      } catch (error) {
        // console.error(error);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [baseUrl, userData, searchRef, startDate, endDate]
  );

  // ────────────────────────────────────────────────
  // Initial load + auto-refresh
  // Auto-refresh is skipped as soon as the user has clicked "Load More"
  // ────────────────────────────────────────────────
  useEffect(() => {
    let intervalId;

    const startAutoRefresh = () => {
      // Only do the initial / visibility fetch if user has NOT loaded more
      if (!hasLoadedMore.current) {
        fetchBills({ append: false });
      }

      clearInterval(intervalId);
      intervalId = setInterval(() => {
        fetchBills({ append: false, isAutoRefresh: true });
      }, 60000);
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

    if (document.visibilityState === "visible") {
      startAutoRefresh();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopAutoRefresh();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchBills]);

  // When filters change → reset the "loaded more" flag so auto-refresh can start again
  useEffect(() => {
    hasLoadedMore.current = false;
  }, [searchRef, startDate, endDate]);

  const handleLoadMore = () => {
    if (!hasMore || !nextCursor || isLoadingMore) return;

    fetchBills({
      cursor: nextCursor,
      append: true,
    });
  };

  const getStatusBadge = (status) => {
    const base = "px-2 py-0.5 text-xs rounded-full font-semibold";
    switch (status) {
      case "Invoice":
        return `${base} bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300`;
      case "Order":
        return `${base} bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300`;
      case "Cancelled":
        return `${base} bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300`;
      case "Processing":
        return `${base} bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200`;
      default:
        return `${base} bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300`;
    }
  };

  return (
    <Suspense fallback={<SuspenenseFallBack pagedata={"Sales List"} />}>
      <Card className="w-full border bg-card text-card-foreground shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-lg sm:text-xl">Sales Management</CardTitle>
          <Badge variant="secondary" className="text-xs w-fit">
            {hasLoadedMore.current
              ? "Auto refresh paused (Load More active)"
              : "Auto refresh is enabled"}
          </Badge>
        </CardHeader>

        <Separator />

        <CardContent className="p-3 sm:p-6">
          {isLoading && billList.length === 0 ? (
            <SuspenenseFallBack pagedata={"Sales List"} />
          ) : billList.length > 0 ? (
            <>
              {/* ========== DESKTOP / TABLET TABLE ========== */}
              <div className="hidden md:block overflow-x-auto">
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
                      <TableHead>Source</TableHead>
                      <TableHead>Raised By</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billList.map((bill) => {
                      const url =
                        bill.billStatus?.toLowerCase() === "draft"
                          ? `/${params.auth}/V4/${params.Module}/${params.Module}/Draft/${Encrypt(bill._id)}`
                          : `/${params.auth}/V4/${params.Module}/${params.Module}/${Encrypt(bill._id)}`;

                      return (
                        <TableRow key={bill._id}>
                          <TableCell>
                            <Link
                              href={url}
                              className="text-indigo-600 hover:underline font-medium dark:text-indigo-400"
                            >
                              {bill?.billReferenceNo && bill?.invoicelocation
                                ? `${bill.billReferenceNo}/${bill.invoicelocation}`
                                : "View Draft"}
                            </Link>
                          </TableCell>
                          <TableCell>{bill.customerName}</TableCell>
                          <TableCell>{bill.startDate}</TableCell>
                          <TableCell>{bill.whId?.WHName}</TableCell>
                          <TableCell>
                            {pricelistSetter(bill.priceList, userData.business)}
                          </TableCell>
                          <TableCell>
                            {bill.memoId && (
                              <Paperclip className="h-4 w-4 text-muted-foreground" />
                            )}
                          </TableCell>
                          <TableCell>{bill.orders?.length || 0} SKU</TableCell>
                          <TableCell>
                            <Badge variant="outline">{bill.means ?? "—"}</Badge>
                          </TableCell>
                          <TableCell>{bill.RaiseBy}</TableCell>
                          <TableCell>
                            <span className={getStatusBadge(bill.billStatus)}>
                              {bill.billStatus}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            ₦
                            {bill.grandTotal
                              ? bill.grandTotal.toLocaleString()
                              : "0.00"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* ========== MOBILE CARD LAYOUT ========== */}
              <div className="md:hidden space-y-4">
                {billList.map((bill) => {
                  const url =
                    bill.billStatus?.toLowerCase() === "draft"
                      ? `/${params.auth}/V4/${params.Module}/${params.Module}/Draft/${Encrypt(bill._id)}`
                      : `/${params.auth}/V4/${params.Module}/${params.Module}/${Encrypt(bill._id)}`;

                  return (
                    <Card
                      key={bill._id}
                      className="overflow-hidden border bg-card text-card-foreground shadow-sm dark:border-border"
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={url}
                            className="text-indigo-600 hover:underline font-semibold text-sm dark:text-indigo-400"
                          >
                            {bill?.billReferenceNo && bill?.invoicelocation
                              ? `${bill.billReferenceNo}/${bill.invoicelocation}`
                              : "View Draft"}
                          </Link>
                          <span className={getStatusBadge(bill.billStatus)}>
                            {bill.billStatus}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <p className="font-medium text-sm break-words">{bill.customerName}</p>
                          <p className="text-xs text-muted-foreground">
                            {bill.startDate}
                          </p>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm [&>*]:min-w-0">
                          <div>
                            <p className="text-xs text-muted-foreground">Store</p>
                            <p className="font-medium truncate">
                              {bill.whId?.WHName || "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Pricelist</p>
                            <p className="font-medium truncate">
                              {pricelistSetter(bill.priceList, userData.business)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Items</p>
                            <p className="font-medium">
                              {bill.orders?.length || 0} SKU
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Source</p>
                            <Badge variant="outline" className="mt-0.5">
                              {bill.means ?? "—"}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Raised By</p>
                            <p className="font-medium truncate">{bill.RaiseBy}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Value</p>
                            <p className="font-bold text-base">
                              ₦
                              {bill.grandTotal
                                ? bill.grandTotal.toLocaleString()
                                : "0.00"}
                            </p>
                          </div>
                        </div>

                        {bill.memoId && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1">
                            <Paperclip className="h-3.5 w-3.5" />
                            <span>Has attachment</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="flex justify-center mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="w-full sm:w-auto"
                  >
                    {isLoadingMore ? "Loading..." : "Load More"}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Empty>
              <EmptyTitle>No sales registered yet</EmptyTitle>
              <EmptyDescription>
                You haven&apos;t created any order yet. Get started by recording
                your first sales.
              </EmptyDescription>
            </Empty>
          )}
        </CardContent>
      </Card>
    </Suspense>
  );
}