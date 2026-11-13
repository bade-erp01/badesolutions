
"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import {
  plsWait,
  ErrorMessage,
  SuccessToast,
} from "../../../Functions/Mics";
import api from "@/lib/api";

export default function AuditSnapshotButton({ productId, storeProduct }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  async function querySnapshot() {
    if (!startDate || !endDate) {
      ErrorMessage("Please select both start date and end date.");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      ErrorMessage("End date must be on or after start date.");
      return;
    }

    try {
      setLoading(true);
      plsWait("Querying audit snapshot...");

      const response = await api.get(
        `/api/audit-snapshot?productId=${encodeURIComponent(productId)}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
      );

      const snapshot = response.data;

      if (!snapshot || !Array.isArray(snapshot.data)) {
        throw new Error("Invalid audit snapshot response.");
      }

      if (snapshot.data.length === 0) {
        ErrorMessage("No inventory audit records found for the selected date range.");
        return;
      }

      const excelData = snapshot.data.map((record, index) => ({
        "S/N": index + 1,
        "Reference": record.reference || "",
        "Action": record.action || "",
        "Movement Type": record.movementType || "",
        "Quantity": Number(record.qty || 0),
        "Pieces": Number(record.pcs || 0),
        "Transaction Date": record.transactionDate
          ? new Date(record.transactionDate).toLocaleString()
          : "",
        "Record Created": record.createdAt
          ? new Date(record.createdAt).toLocaleString()
          : "",
        "Audit ID": record._id || "",
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);

      worksheet["!cols"] = [
        { wch: 8 },
        { wch: 20 },
        { wch: 18 },
        { wch: 16 },
        { wch: 14 },
        { wch: 12 },
        { wch: 24 },
        { wch: 24 },
        { wch: 28 },
      ];

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Audit Snapshot"
      );

      const productName =
        storeProduct?.productName ||
        storeProduct?.name ||
        "Product";

      XLSX.writeFile(
        workbook,
        `audit-snapshot-${productId}-${startDate}-to-${endDate}.xlsx`
      );

      SuccessToast(
        `Audit snapshot downloaded successfully. ${snapshot.count} records exported.`
      );

      setOpen(false);
    } catch (err) {
      console.error("Audit snapshot download:", err);

      ErrorMessage(
        err.response?.data?.error ||
        err.message ||
        "Failed to download audit snapshot."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full flex gap-2"
        >
          <CalendarDaysIcon className="h-5 w-5" />
          Query Audit Snapshot
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Audit Snapshot</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-80">
          <div className="space-y-4 p-2">
            <div className="space-y-2">
              <label className="text-sm font-medium block">
                Start Date
              </label>

              <input
                type="date"
                className="w-full border rounded px-2 py-2 text-sm"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium block">
                End Date
              </label>

              <input
                type="date"
                className="w-full border rounded px-2 py-2 text-sm"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={loading}
              />
            </div>

            <Button
              variant="primary"
              className="w-full"
              onClick={querySnapshot}
              disabled={loading || !startDate || !endDate || !productId}
            >
              {loading ? "Downloading..." : "Download XLSX"}
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
