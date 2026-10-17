"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  ErrorMessage,
  SuccessToast,
} from "../../../../../../../../Functions/Mics";
import api from "@/lib/api";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Page({
  data,
  EXPRESS_PRIVATE_URL,
  userData,
}) {
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);

  const [selectedAction, setSelectedAction] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState(null);

  const isRowLoading = (id, action) =>
  loading &&
  selectedAction?.id === id &&
  selectedAction?.action === action;


  const itemsPerPage = 50;

  const payments = data?.journals?.slice(0, 1050) || [];

  const totalPages = Math.ceil(payments.length / itemsPerPage);

  const paginatedPayments = payments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openActionDialog = (action, id) => {
    setSelectedAction({ action, id });
    setDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedAction) return;

    try {
      setLoadingId(selectedAction.id);
      setLoading(true);

      const response = await api.patch(
        `/api/Equity/journal/${selectedAction.id}`,
        {
          status: selectedAction.action,
        },
        {
          headers: {
            "idempotency-key": `Equity-${selectedAction.action}-${selectedAction.id}`,
          },
        }
      );

      const result = response.data || {};

      if (!response.ok) {
        throw new Error(result.error || "Failed to update");
      }

      SuccessToast(result.message);

      router.refresh();
    } catch (error) {
      ErrorMessage(error.message);
    } finally {
      setLoadingId(null);
      setLoading(false);
      setDialogOpen(false);
      setSelectedAction(null);
    }
  };

  const formatAmount = (amount) => {
    const value =
      amount?.$numberDecimal ??
      amount ??
      0;

    return Number(value).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="w-full sm:p-4">
      <Card>
        <CardHeader>
          <CardTitle>Equity Table</CardTitle>

          <CardDescription>
            Equity in business is the net worth of a company after
            liabilities are deducted from assets. These journal
            entries affect shareholder and owner equity balances.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <div className="max-h-[70vh] overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-20">
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Raised By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Transaction</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-[180px]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {paginatedPayments.length > 0 ? (
                    paginatedPayments.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell
                          className="max-w-[200px] truncate"
                          title={item.description}
                        >
                          {item.description}
                        </TableCell>

                        <TableCell>
                          <Badge variant="secondary">
                            {item.accountType}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          {item.status === "Posted" && (
                            <Badge className="bg-green-600">
                              Posted
                            </Badge>
                          )}

                          {item.status === "Pending" && (
                            <Badge variant="outline">
                              Pending
                            </Badge>
                          )}

                          {item.status === "Reversed" && (
                            <Badge variant="destructive">
                              Reversed
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell>
                          {item.raisedBy}
                        </TableCell>

                        <TableCell>
                          {new Date(
                            item.date
                          ).toLocaleDateString()}
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline">
                            {item.debitCredit}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right font-semibold">
                          ₦{formatAmount(item.amount)}
                        </TableCell>

                        <TableCell>
                          <div className="flex gap-2">
                            {item.status === "Pending" && (
                              <>
                                <Button
                                  size="sm"
                                  disabled={isRowLoading(item._id, "Posted")}
                                  onClick={() => openActionDialog("Posted", item._id)}
                                >
                                  {isRowLoading(item._id, "Posted") ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Posting...
                                    </>
                                  ) : (
                                    "Post"
                                  )}
                                </Button>

                                <Button
                                  size="sm"
                                  variant="destructive"
                                  disabled={isRowLoading(item._id, "delete")}
                                  onClick={() => openActionDialog("delete", item._id)}
                                >
                                  {isRowLoading(item._id, "delete") ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Deleting...
                                    </>
                                  ) : (
                                    "Delete"
                                  )}
                                </Button>
                              </>
                            )}

                            {item.status === "Posted" && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isRowLoading(item._id, "Reversed")}
                                onClick={() => openActionDialog("Reversed", item._id)}
                              >
                                {isRowLoading(item._id, "Reversed") ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Reversing...
                                  </>
                                ) : (
                                  "Reverse"
                                )}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-8"
                      >
                        No entry found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}

            <div className="flex flex-wrap items-center justify-between gap-2 border-t p-3 sm:p-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.max(prev - 1, 1)
                    )
                  }
                >
                  Previous
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(prev + 1, totalPages)
                    )
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}

      <AlertDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Confirm Action
            </AlertDialogTitle>

            <AlertDialogDescription>
              Are you sure you want to proceed with this
              action?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              disabled={loading}
              onClick={confirmAction}
            >
              {loading ? "Processing..." : "Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}