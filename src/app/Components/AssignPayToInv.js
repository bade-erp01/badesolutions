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
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Encrypt, ErrorMessage, plsWait, SuccessToast } from "../../../Functions/Mics";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function DialogDemo({PayId,pendingInvoices, userData,baseUrl}) {
  const [invoices] = useState(pendingInvoices ||[]);
  const [invoice,setInvoice] = useState("")
  const Router = useRouter()


  const OnSubmit = async (e) => {
    // Ask for confirmation
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Once assigned, this payment cannot be reassigned. Do you want to proceed?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2d5274",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, proceed",
      cancelButtonText: "Cancel"
    });

    if (!result.isConfirmed) {
      return; // stop if user cancels
    }

    try {
      const formData = {
        invId: invoice,
      };

      plsWait("")

      const response = await fetch(`${baseUrl}/api/DownPatToInv/${Encrypt(PayId._id)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
          access: Encrypt(userData.user._id),
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      } else {
        SuccessToast(data.message);
        Router.refresh();
      }
    } catch (err) {
      ErrorMessage(err.message);
    }
  };

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
                name="invId"
                className="border rounded-md p-2"
                onChange={(e)=>setInvoice(e.target.value)}
              >
                <option value="">Select an invoice</option>
                {invoices?.filter(inv =>inv.paymentMethod < inv.grandTotal).map((inv) => (
                  <option key={inv._id} value={inv._id} className="text-xs">
                   {inv.billStatus.toUpperCase().slice(0,3)}/{inv.billReferenceNo} - ₦{(inv.grandTotal - inv.paymentMethod).toLocaleString()} unsettled
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" onClick={OnSubmit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
