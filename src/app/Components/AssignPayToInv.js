"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

export default function DialogDemo({PayId}) {
  const [invoices, setInvoices] = useState([]);
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button
            variant="default"
            className="mt-3 flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition text-sm w-full"
          >
            Assign {PayId.paymentReferenceNo} to an invoice
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign {PayId.crAmount.toLocaleString()} to customer's Invoice</DialogTitle>
            <DialogDescription className="text-red-400 text-xs">
              Note that changes will be reflected in the customer's Aging
              ledger. and once assigned, the payment cannot be reassigned to
              another invoice. Ensure to verify and confirm the invoice details
              before proceeding.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="invoice-select">Invoice Ref</Label>
              <select
                id="invoice-select"
                name="invoice"
                className="border rounded-md p-2"
              >
                <option value="">Select an invoice</option>
                {invoices?.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.billReference}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
