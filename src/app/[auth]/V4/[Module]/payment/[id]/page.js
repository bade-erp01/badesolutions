"use client"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import Image from "next/image"
import moment from "moment"
import Swal from "sweetalert2"
import { plsWait, ErrorMessage, SuccessToast } from "../../../../../../../Functions/Mics"
import api from "@/lib/api"

export default function SinglePaymentPage({ userInfo, payment, cust, bank }) {
  const router = useRouter()

  const paymentAction = async (id, action) => {
    const result = await Swal.fire({
      title: `Set payment status to ${action}?`,
      text: "This will also reflect in the customer's transaction ledger.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, proceed",
    })

    if (!result.isConfirmed) return

    try {
      plsWait("Processing...")
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const res = await api.patch(
        `/api/payment/revoke/${id}?action=${action}`,
        { date: moment().format("L") },
        {
          headers: {
            "idempotency-key": `payment-${action}-${id}`,
          },
        }
      )

      const data = res.data || {}
      if (data.message) {
        SuccessToast(data.message)
        router.refresh()
      } else {
        throw new Error(data.error || "Unknown error")
      }
    } catch (error) {
      ErrorMessage(error.message)
    }
  }

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    posted: "bg-green-100 text-green-800",
    Reversed: "bg-red-100 text-red-800",
    Reject: "bg-gray-100 text-gray-800",
  }
  const activityLog = Array.isArray(payment.ActitvityLog)
    ? payment.ActitvityLog
    : Array.isArray(payment.ActivityLog)
      ? payment.ActivityLog
      : [];

  return (
    <div className="container max-w-full py-2 sm:py-8">
      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Image
              src={payment.image || "https://img.icons8.com/hands/100/card-in-use.png"}
              alt="Payment"
              width={48}
              height={48}
              className="rounded"
            />
            <div>
              <CardTitle>{cust?.Username?.toUpperCase() || "Customer"}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Created on {moment(payment.createdAt).format("dddd, DD MMM YYYY [at] hh:mm A")}
              </p>
            </div>
          </div>
          <Badge className={statusColors[payment.status] || "bg-gray-200 text-gray-700"}>
            {payment.status}
          </Badge>
        </CardHeader>

        <Separator />

        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <Detail label="Collection Ref" value={payment.collectionRef} />
          <Detail label="Payment Ref" value={payment.paymentReferenceNo?.toUpperCase()} />
          <Detail label="Bank" value={bank?.NAME || "—"} />
          <Detail label="Amount" value={payment?.crAmount || payment?.drAmount} />
          <Detail label="Payment Date" value={payment?.PaymentDate} />
          <Detail label="Registered By" value={payment?.Accountant} />
          <Detail label="Gateway" value={payment?.type} />
        </CardContent>

        {activityLog.length > 0 && (
          <CardContent className="space-y-3 border-t pt-5">
            <h2 className="font-semibold">Payment activity</h2>
            <ol className="divide-y rounded-md border">
              {activityLog.slice().reverse().map((entry, index) => (
                <li key={entry._id || `${entry.logMsg || entry.message}-${index}`} className="p-3 text-sm">
                  <p>{entry.logMsg || entry.message || "Payment updated"}</p>
                  {entry.at || entry.createdAt || entry.date ? (
                    <time className="mt-1 block text-xs text-muted-foreground">
                      {moment(entry.at || entry.createdAt || entry.date).format("DD MMM YYYY, hh:mm A")}
                    </time>
                  ) : null}
                </li>
              ))}
            </ol>
          </CardContent>
        )}

        <CardFooter className="flex flex-col gap-4">
          {payment.status === "pending" && userInfo?.user?.isAccountant && (
            <div className="flex gap-3">
              <Button
                variant="default"
                className="flex-1"
                onClick={() => paymentAction(payment._id, "posted")}
              >
                Confirm Payment
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => paymentAction(payment._id, "Reject")}
              >
                Cancel Entry
              </Button>
            </div>
          )}

          {payment.status === "posted" && userInfo?.user?.isAccountant && (
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => paymentAction(payment._id, "Reversed")}
            >
              Reverse Payment
            </Button>
          )}
          <Separator />
          <p className="text-xs text-muted-foreground">
            Last edited {moment(payment.updatedAt).format("dddd, DD MMM YYYY [at] hh:mm A")}
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground uppercase">{label}</p>
      <p className="text-sm font-semibold break-words">{value || "—"}</p>
    </div>
  )
}
