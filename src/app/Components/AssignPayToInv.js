"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { Encrypt, ErrorMessage, plsWait, SuccessToast } from "../../../Functions/Mics"
import { EXPRESS_PRIVATE_URL } from "../../../Functions/Functions"

export default function DialogDemo({ PayId, pendingInvoices, userData }) {
  const [invoices] = useState(pendingInvoices || [])
  const [invoice, setInvoice] = useState("")
  const router = useRouter()

  const OnSubmit = async () => {
    try {
      plsWait("Registering payment to sales...")

      const formData = { invId:Encrypt(invoice) }

      const response = await fetch(`${EXPRESS_PRIVATE_URL}/api/DownPayToInvoice/${Encrypt(PayId._id)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
           Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
           access: `${Encrypt(userData.user._id)}`,
          "idempotency-key": `assign-payment-${PayId._id}`,
          sessionKey: `Bearer ${Encrypt(userData.SessionId)}`
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error)
      } else {
        SuccessToast(data.message)
        router.refresh()
      }
    } catch (err) {
      ErrorMessage(err.message)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="w-full mt-3">
          Assign {PayId.paymentReferenceNo.slice(0, 10)}... to an invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Assign {PayId.crAmount.toLocaleString()} to customer’s Invoice
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Once assigned, the payment cannot be reassigned. Ensure invoice details are correct before proceeding.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="invoice-select">Invoice Ref</Label>
            <Select onValueChange={(val) => setInvoice(val)}>
              <SelectTrigger id="invoice-select">
                <SelectValue placeholder="Select an invoice" />
              </SelectTrigger>
              <SelectContent>
                {invoices
                  ?.filter((inv) => inv.paymentMethod < inv.grandTotal)
                  .map((inv) => (
                    <SelectItem key={inv._id} value={inv._id}>
                      {inv.billStatus.toUpperCase().slice(0, 3)}/{inv.billReferenceNo} – ₦
                      {(inv.grandTotal - inv.paymentMethod).toLocaleString()} unsettled
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>

          {/* Confirmation using shadcn AlertDialog */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button disabled={!invoice}>Save changes</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  Once assigned, this payment cannot be reassigned. Do you want to proceed?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={OnSubmit}>Yes, proceed</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
