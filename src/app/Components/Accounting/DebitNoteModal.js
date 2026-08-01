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
import { plsWait, ErrorMessage, SuccessToast, Encrypt } from "../../../../Functions/Mics";

export default function DebitNoteModal({ customersList, baseUrl, userData, Accounts }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [bankID, setBankID] = useState("");
  const [remarks, setRemarks] = useState("");
  const Router = useRouter();
  const Path = useParams();

  const handleSubmit = async () => {
    if (!date || !amount || !customerId || !remarks) {
      ErrorMessage("Please fill in all required fields");
      return;
    }

    plsWait("Working on things...please wait.");

    const request = await fetch(`${baseUrl}/api/DebitNote/new`, {
      method: "POST",
      body: JSON.stringify({
        Date: date,
        Total: amount,
        reference: remarks,
        customerId,
        bankID: bankID || null,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
        access: `${Encrypt(userData.user._id)}`,
        sessionKey: `Bearer ${Encrypt(userData.SessionId)}`,
      },
    });

    const response = await request.json();
    if (request.ok) {
      SuccessToast("Debit note has been created successfully. Awaiting Approval");
      Router.push(
        `/${Path.auth}/${Path.Tenant}/${Path.module}/${Path.module}/debit-note/debit-note/${Encrypt(response.data)}`
      );
      setOpen(false);
    } else {
      ErrorMessage(response.error);
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
              <Select onValueChange={setCustomerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customersList
                    .slice() // Create a copy to avoid mutating original array
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
