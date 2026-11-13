"use client";

import { useState } from "react";
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
import { plsWait, ErrorMessage, SuccessToast } from "../../../Functions/Mics";
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
      const r = await api.get(
        `/api/Store/AuditSnapshot?productId=${productId}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
        { responseType: "blob" },
      );
      if (!r.ok) throw new Error(r.error || "Failed to fetch audit snapshot");

      const url = URL.createObjectURL(new Blob([r.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-snapshot-${productId}-${startDate}-to-${endDate}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      SuccessToast("Audit snapshot downloaded");
    } catch (err) {
      ErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full flex gap-2" onClick={() => setOpen(true)}>
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
              <label className="text-sm font-medium block">Start Date</label>
              <input
                type="date"
                className="w-full border rounded px-2 py-1 text-sm"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium block">End Date</label>
              <input
                type="date"
                className="w-full border rounded px-2 py-1 text-sm"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button
              variant="primary"
              className="w-full"
              onClick={querySnapshot}
              disabled={loading || !startDate || !endDate}
            >
              {loading ? "Downloading..." : "Download XLSX"}
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}