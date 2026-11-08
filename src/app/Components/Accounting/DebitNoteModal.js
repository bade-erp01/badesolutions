"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { BanknotesIcon } from "@heroicons/react/24/outline";
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

export default function DebitNoteModal({ customersList, baseUrl, userData, Accounts }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [bankID, setBankID] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const Router = useRouter();
  const Path = useParams();

  const handleSubmit = async () => {
    if (!date || !amount || !customerId || !remarks) {
      ErrorMessage("Please fill in all required fields");
      return;
    }

    plsWait("Working on things...please wait.");

    const r = await api.post("/api/DebitNote/new", {
      Date: date,
      Total: amount,
      reference: remarks,
      customerId,
      bankID: bankID || null,
    });

    const response = r.data || {};
    if (r.ok) {
      SuccessToast("Debit note has been created successfully. Awaiting Approval");
      Router.push(
        `/${Path.auth}/V4/${Path.Module}/${Path.Module}/debit-note/debit-note/${response.data}`
      );
      setOpen(false);
    } else {
      ErrorMessage(response.error || r.error);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)} variant="default">
        <BanknotesIcon className="h-5 w-5" />
        Create Debit Note
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Debit Note</DialogTitle>
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
              <label className="text-xs font-semibold">Customer</label>
              <Input
                placeholder="Search customer..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="mb-2"
              />
              <Select onValueChange={setCustomerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customersList
                    .filter((c) =>
                      (c.Username || "").toLowerCase().includes(customerSearch.toLowerCase()),
                    )
                    .slice()
                    .sort((a, b) => a.Username?.localeCompare(b.Username || ""))
                    .map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.Username}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold">
                Debit Account <i className="text-red-600 text-xs">
                  Please choose this option only if a real debit refund has taken place — either physical or digital.
                </i>
              </label>
              <Select onValueChange={setBankID}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose..." />
                </SelectTrigger>
                <SelectContent>
                  {Accounts.map((a) => (
                    <SelectItem key={a._id} value={a._id}>
                      {a.bankName} - {a.bankCode}
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
