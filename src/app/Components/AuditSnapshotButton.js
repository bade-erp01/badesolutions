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
import { plsWait, ErrorMessage, SuccessToast } from "../../../../Functions/Mics";
import api from "@/lib/api";

export default function AuditSnapshotButton({ productId, storeProduct }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function querySnapshot() {
    try {
      setLoading(true);
      plsWait("Querying audit snapshot...");
      const r = await api.get(
        `/api/Store/AuditSnapshot?productId=${productId}`,
        { responseType: "blob" },
      );
      if (!r.ok) throw new Error(r.error || "Failed to fetch audit snapshot");

      const url = URL.createObjectURL(new Blob([r.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-snapshot-${productId}.xlsx`;
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
        <Button variant="outline" className="w-full flex gap-2" onClick={querySnapshot}>
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
            <p className="text-sm text-muted-foreground">
              Click below to download the audit snapshot for this product as XLSX.
            </p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}