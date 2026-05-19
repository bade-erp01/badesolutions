"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { Encrypt } from "../../../../../../Functions/Mics";
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
import { EmptyIcon } from "lucide-react";

import { Separator } from "@/components/ui/separator"

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

  useEffect(() => {
    const fetchBills = async () => {
      setIsLoading(true);
      try {
        const query = new URLSearchParams({
          page: currentPage.toString(),
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
          },
        });

        const data = await response.data;
        setBillList(data.invoices || []);
        setTotalPages(data.totalPages);
        setTotalInvoices(data.totalInvoices);
        setCurrentPage(data.currentPage);
      } catch (error) {
        // console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBills();

    // 🔹 Set interval to refresh every 2 minutes (120000 ms)
      const intervalId = setInterval(() => {
        fetchBills();
      }, 120000);

      // 🔹 Cleanup on unmount
      return () => clearInterval(intervalId);

  }, [currentPage, searchRef, startDate, endDate]);

  return (
    <Suspense fallback={<SuspenenseFallBack pagedata={"Invoice List"} />}>
      <Card>
        <CardHeader>
          <CardTitle>Sales Management</CardTitle>
          <Separator/>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <SuspenenseFallBack pagedata={"Invoice List"} />
          ) : billList.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ref No</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Alt</TableHead>
                    <TableHead>
                      <ShoppingCart className="h-4 w-4" />
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
                        <TableCell>
                          {bill.memoId && (
                            <Paperclip className="h-4 w-4 text-gray-400" />
                          )}
                        </TableCell>
                        <TableCell>{bill.orders.length} SKU</TableCell>
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

              {/* Pagination Buttons */}
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <Empty>
              <EmptyIcon />
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
