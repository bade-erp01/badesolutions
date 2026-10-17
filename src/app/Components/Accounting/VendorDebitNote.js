"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { CreditCardIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { plsWait, ErrorMessage, SuccessToast } from "../../../../Functions/Mics";
import api from "@/lib/api";

export default function VendorDebitNoteModal({ customersList, baseUrl, userData }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [remarks, setRemarks] = useState("");
  const Router = useRouter();
  const Path = useParams();

  const handleSubmit = async () => {
    if (!date || !amount || !vendorId || !remarks) {
      ErrorMessage("Please fill in all required fields");
      return;
    }

    plsWait("Working on things..please wait.");

    const r = await api.post("/api/VendorDebit", {
      Date: date,
      Total: amount,
      reference: remarks,
      VendorId: vendorId,
    });

    const response = r.data || {};
    if (r.ok) {
      SuccessToast("Debit note has been created successfully. Awaiting Approval");
      Router.push(
        `/${Path.auth}/${Path.Tenant}/${Path.module}/${Path.module}/Vendor-DebitNote/Vendor-DebitNote/${response.data}`
      );
      setOpen(false);
    } else {
      ErrorMessage(response.error || r.error);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="hover:bg-gray-700 text-white p-4 rounded-md flex items-center gap-2 transition-colors duration-200 shadow-sm w-full text-xs"
      >
        <CreditCardIcon className="h-5 w-5 text-white" />
        Create Debit Note
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Vendor Debit Note</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new debit note.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold">Date</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <div>
              <label className="text-xs font-semibold">Amount</label>
              <Input
                type="number"
                min={1}
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold">Vendor</label>
              <Select onValueChange={setVendorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a vendor" />
                </SelectTrigger>
                <SelectContent>
                  {customersList.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.Name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold">Remarks</label>
              <Textarea
                rows={3}
                placeholder="Enter remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
