"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import SuspenenseFallBack from "@/app/Components/SuspenenseFallBack";
import  Link  from "next/link";

import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

export default function InvoiceLandingPage({ baseUrl, userData }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [billList, setBillList] = useState([]);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams()
  const itemsPerPage = 15;

  // Fetch bills from API
  useEffect(() => {
    const fetchBills = async () => {
      setIsLoading(true);
      try {
        const query = new URLSearchParams({
          page: currentPage,
          itemsPerPage,
        }).toString();

        const response = await api.get(`/api/ExpenseList?${query}`);
        if (!response.ok) throw new Error(response.error);

        const data = response.data || {};

        setBillList(data.expenses || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalInvoices(data.pagination?.total || 0);
        setCurrentPage(data.pagination?.page || 1);
      } catch (error) {
        console.error("Failed to fetch expenses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBills();
  }, [currentPage, baseUrl, userData]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div>
              <CardTitle>Expenses</CardTitle>
              <CardDescription>
                Total Records: <span className="font-medium">{totalInvoices}</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <SuspenenseFallBack pagedata={"Expenses"} />
          ) : billList.length > 0 ? (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Initiated</TableHead>
                      <TableHead>Payee</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billList.map((expense) => (
                      <TableRow key={expense._id}>
                        <TableCell>
                          <Link
                            href={`/${params.auth}/V4/${params.Module}/${params.Module}/${expense._id}`}
                            className="text-blue-500 hover:underline" >
                            {expense.refNo}
                          </Link>
                        </TableCell>
                        <TableCell className="font-medium">
                          {new Date(expense.date || expense.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="max-w-md truncate">
                          {expense.initiatorId}
                        </TableCell>
                        <TableCell className="max-w-md truncate">
                          {expense.payee}
                        </TableCell>
                        <TableCell className="max-w-md truncate">
                          {expense?.category?.NAME}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {expense?.category?.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={expense.status !== "pending" ? "default" : "secondary"}
                          >
                            {expense.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ₦{parseFloat(expense.Amount || 0).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, totalInvoices)} of {totalInvoices} entries
                </p>

                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            isActive={currentPage === pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No expenses registered yet</EmptyTitle>
                <EmptyDescription>
                  You haven&apos;t created any expense yet. Get started by recording your first expense.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>
    </div>
  );
}