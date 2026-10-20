"use client";

// Purchase requests with a merchant (backend lib/portals/purchaseRequests.js):
//   POST /api/purchase-requests/:id/send-to-merchant   (raiseLpo or admin)
//   POST /api/purchase-requests/:id/decline {reason}   (allowInternalTransfers or admin; a merchant's PO)
// Shows where the request stands with the merchant, the merchant's changes and reasons.

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import api from "@/lib/api";
import { ErrorMessage, SuccessToast } from "../../../../../../../Functions/Mics";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// label, Badge variant
const STATE = {
  awaiting_merchant: ["Waiting for the merchant", "outline"],
  awaiting_business: ["Sent by the merchant: waiting for you", "default"],
  accepted: ["Accepted", "secondary"],
  declined: ["Declined", "destructive"],
  withdrawn: ["Taken back from the merchant", "outline"],
};

const when = (d) => (d ? new Date(d).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }) : "");
const qty = (q) => `${q?.cartons ?? 0} ctn${q?.pieces ? ` + ${q.pieces} pcs` : ""}`;

export default function MerchantRequestPanel({ request, user }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const m = request.merchantRequest;
  const vendor = request.Vendor || {};
  const status = String(request.status || "").toLowerCase();
  const canRaise = Boolean(user?.raiseLpo || user?.isAdmin);
  const canApprove = Boolean(user?.allowInternalTransfers || user?.isAdmin);

  const canSend =
    canRaise &&
    vendor.isMerchant &&
    !vendor.block_vendor &&
    m?.origin !== "merchant" &&
    (status === "draft" || status === "pending") &&
    m?.state !== "awaiting_merchant" &&
    m?.state !== "accepted" &&
    (request.orders || []).length > 0;
  const canDecline = canApprove && m?.origin === "merchant" && m?.state === "awaiting_business" && (status === "pending" || status === "draft");

  const send = async () => {
    const ok = await Swal.fire({
      title: `Send to ${vendor.Name}?`,
      text: "The merchant can accept it, change quantities, or decline it from the merchant portal. You can't change the lines while they review it.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Send",
    });
    if (!ok.isConfirmed) return;
    setBusy(true);
    const r = await api.post(`/api/purchase-requests/${request._id}/send-to-merchant`);
    setBusy(false);
    if (!r.ok) return ErrorMessage(r.error);
    SuccessToast(
      r.data?.merchantHasPortalAccount
        ? `Sent to ${vendor.Name}`
        : `Sent. ${vendor.Name} has no merchant portal login yet, so ask an admin to create one.`,
    );
    router.refresh();
    window.location.reload();
  };

  const decline = async () => {
    const { value: reason, isConfirmed } = await Swal.fire({
      title: "Decline this purchase order?",
      input: "textarea",
      inputLabel: `Tell ${vendor.Name || "the merchant"} why`,
      inputAttributes: { maxlength: 300 },
      showCancelButton: true,
      confirmButtonText: "Decline",
      inputValidator: (v) => (!v || !v.trim() ? "Give a reason" : undefined),
    });
    if (!isConfirmed) return;
    setBusy(true);
    const r = await api.post(`/api/purchase-requests/${request._id}/decline`, { reason });
    setBusy(false);
    if (!r.ok) return ErrorMessage(r.error);
    SuccessToast("Declined. The merchant can see your reason.");
    router.refresh();
    window.location.reload();
  };

  if (!m && !canSend) return null;
  const [label, variant] = STATE[m?.state] || [];

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3 text-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-foreground">Merchant</span>
          {m?.origin === "merchant" && <Badge variant="secondary">From the merchant portal</Badge>}
          {label && <Badge variant={variant}>{label}</Badge>}
        </div>
        <div className="flex flex-wrap gap-2">
          {canSend && (
            <Button size="sm" disabled={busy} onClick={send} className="w-full sm:w-auto">
              {m?.state === "declined" || m?.state === "withdrawn" ? "Send to merchant again" : "Send to merchant"}
            </Button>
          )}
          {canDecline && (
            <Button size="sm" variant="destructive" disabled={busy} onClick={decline} className="w-full sm:w-auto">
              Decline
            </Button>
          )}
        </div>
      </div>

      {m && (
        <div className="space-y-1 text-muted-foreground break-words">
          {m.sentAt && (
            <p>
              {m.origin === "merchant" ? "Sent by" : "Sent to the merchant by"} <span className="text-foreground">{m.sentBy?.name || "—"}</span> on {when(m.sentAt)}
            </p>
          )}
          {m.note && <p>Merchant&apos;s note: <span className="text-foreground">{m.note}</span></p>}
          {m.respondedAt && (
            <p>
              {m.state === "declined" ? "Declined" : "Answered"} by <span className="text-foreground">{m.respondedBy?.name || "—"}</span> on {when(m.respondedAt)}
            </p>
          )}
          {m.reply && <p>Merchant&apos;s reply: <span className="text-foreground">{m.reply}</span></p>}
          {m.declineReason && <p className="text-destructive">Reason: {m.declineReason}</p>}
          {Array.isArray(m.adjustments) && m.adjustments.length > 0 && (
            <div className="pt-1">
              <p className="font-medium text-foreground">The merchant changed these quantities:</p>
              <ul className="list-disc pl-5">
                {m.adjustments.map((a) => (
                  <li key={a.line}>
                    {a.name}: {qty(a.from)} → {qty(a.to)}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {m.state === "accepted" && status === "pending" && canApprove && (
            <p className="font-medium text-foreground">You can convert it to a purchase order now.</p>
          )}
        </div>
      )}
      {!m && canSend && (
        <p className="text-muted-foreground">{vendor.Name} is a merchant: send this request to them to confirm before converting it.</p>
      )}
    </div>
  );
}
