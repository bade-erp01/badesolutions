"use client";

// Delivery of one sales order / invoice (merchant & delivery portals, backend lib/portals/delivery.js):
// status timeline, agent, failure reason, proof (photo, signature, map) and, for invoicers,
// Assign / Reassign / Resend code. Refreshes live on "delivery:changed" for this bill.
//   GET  /api/bills/:id/delivery                 { delivery: { status, agentName, assignedAt, startedAt, deliveredAt, failedAt, failReason, proof? } }
//   GET  /api/delivery-agents                    { items: [{ id, name, phone }] }
//   POST /api/bills/:id/delivery/assign {agentId}
//   POST /api/bills/:id/delivery/otp/resend

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import moment from "moment";
import { Loader2, MapPin, Truck } from "lucide-react";
import api from "@/lib/api";
import { useOptionalWebSocket } from "./WebSocketProvider";
import { useUser } from "@/components/UserProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ErrorMessage, SuccessToast } from "../../../Functions/Mics";

const NOT_DELIVERABLE = ["DRAFT", "REQUISITION", "CANCELLED"];
const STATUS = {
  not_assigned: ["Not assigned", "outline"],
  assigned: ["Assigned", "secondary"],
  out: ["Out for delivery", "default"],
  delivered: ["Delivered", "secondary"],
  failed: ["Couldn't deliver", "destructive"],
};
const noSubscribe = () => () => {};
const when = (d) => (d ? moment(d).format("D MMM YYYY, h:mm a") : null);

export default function DeliveryPanel({ billId, billStatus, canAssign: canAssignRole }) {
  // works on any confirmed sale, but only where the Delivery app is installed (on its own or in
  // the Merchant app); the backend refuses assigning otherwise (lib/portals/staffRoutes.js)
  // UserProvider holds the session view ({ user, business }) as `user`
  const locked = useUser()?.user?.business?.lockedApps || [];
  const appOn = !locked.includes("delivery") || !locked.includes("merchant-biller");
  const canAssign = canAssignRole && appOn;
  const [delivery, setDelivery] = useState(null);
  const [error, setError] = useState("");
  const [assignOpen, setAssignOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const subscribe = useOptionalWebSocket()?.subscribe ?? noSubscribe;
  const deliverable = !NOT_DELIVERABLE.includes(String(billStatus || "").toUpperCase());

  const load = useCallback(async () => {
    const r = await api.get(`/api/bills/${billId}/delivery`);
    if (r.ok) {
      setDelivery(r.data?.delivery || { status: "not_assigned" });
      setError("");
    } else setError(r.error);
  }, [billId]);

  useEffect(() => {
    if (billId) load();
  }, [billId, load]);

  // live: assigned / out / delivered / failed for this bill
  useEffect(() => subscribe("delivery:changed", (e) => e?.id === String(billId) && load()), [subscribe, billId, load]);

  // opened from a notification link (…#delivery): bring the panel into view
  useEffect(() => {
    if (delivery && typeof window !== "undefined" && window.location.hash === "#delivery") {
      document.getElementById("delivery")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [delivery]);

  const resend = async () => {
    setBusy(true);
    const r = await api.post(`/api/bills/${billId}/delivery/otp/resend`, {});
    setBusy(false);
    if (!r.ok) return ErrorMessage(r.error);
    SuccessToast(`New delivery code sent to ${r.data?.sentTo || "the customer"}`);
  };

  // without the app: past deliveries are still shown; otherwise the Delivery app is offered instead
  if (!appOn && !delivery?.agentName) return deliverable ? <DeliveryPromo /> : null;
  if (!deliverable && !delivery?.agentName) return null;
  const status = delivery?.status || "not_assigned";
  const [label, variant] = STATUS[status] || STATUS.not_assigned;
  const open = status === "assigned" || status === "out";
  const proof = delivery?.proof;
  const map = proof?.location ? `https://www.google.com/maps/search/?api=1&query=${proof.location.lat},${proof.location.lng}` : null;
  const steps = [
    ["Assigned", delivery?.assignedAt],
    ["Out for delivery", delivery?.startedAt],
    status === "failed" ? ["Couldn't deliver", delivery?.failedAt] : ["Delivered", delivery?.deliveredAt],
  ];

  return (
    <section id="delivery" className="mb-6 rounded-lg border border-border bg-muted/20 p-4 space-y-4 scroll-mt-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Truck className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Delivery</span>
          {delivery ? <Badge variant={variant}>{label}</Badge> : <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          {delivery?.agentName && <span className="text-sm text-muted-foreground">· {delivery.agentName}</span>}
        </div>
        {canAssign && deliverable && delivery && status !== "delivered" && (
          <div className="flex flex-wrap gap-2">
            {open && (
              <Button size="sm" variant="outline" disabled={busy} onClick={resend} className="w-full sm:w-auto">
                Resend code
              </Button>
            )}
            <Button size="sm" disabled={busy} onClick={() => setAssignOpen(true)} className="w-full sm:w-auto">
              {status === "not_assigned" ? "Assign delivery" : "Reassign"}
            </Button>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {delivery && status !== "not_assigned" && (
        <ol className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          {steps.map(([name, at]) => (
            <li key={name} className={`rounded-md border p-3 ${at ? "border-border bg-card" : "border-dashed border-border/70 text-muted-foreground"}`}>
              <p className={`font-medium ${name === "Couldn't deliver" && at ? "text-destructive" : ""}`}>{name}</p>
              <p className="text-xs text-muted-foreground">{when(at) || "—"}</p>
            </li>
          ))}
        </ol>
      )}

      {status === "failed" && delivery?.failReason && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">Reason: {delivery.failReason}</p>
      )}

      {status === "not_assigned" && delivery && (
        <p className="text-sm text-muted-foreground">
          {canAssign ? "Assign a delivery person: the customer gets a code by SMS to give them on arrival." : "No delivery person assigned yet."}
        </p>
      )}

      {proof && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Proof of delivery</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {proof.photoUrl && (
              <a href={proof.photoUrl} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-md border border-border bg-card">
                <Image src={proof.photoUrl} alt="Delivered goods" width={400} height={300} className="h-40 w-full object-cover" />
                <span className="block px-2 py-1 text-xs text-muted-foreground">Photo of the goods</span>
              </a>
            )}
            {proof.signatureUrl && (
              <a href={proof.signatureUrl} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-md border border-border bg-white">
                <Image src={proof.signatureUrl} alt="Customer signature" width={400} height={300} className="h-40 w-full object-contain" />
                <span className="block px-2 py-1 text-xs text-muted-foreground bg-card">Customer&apos;s signature</span>
              </a>
            )}
            {map && (
              <a href={map} target="_blank" rel="noopener noreferrer" className="flex h-full min-h-40 flex-col justify-center gap-1 rounded-md border border-border bg-card p-3 text-sm hover:bg-muted/40">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="font-medium text-primary">Open delivery location</span>
                <span className="text-xs text-muted-foreground">
                  {Number(proof.location.lat).toFixed(5)}, {Number(proof.location.lng).toFixed(5)}
                  {proof.location.accuracy ? ` · ±${Math.round(proof.location.accuracy)} m` : ""}
                </span>
              </a>
            )}
          </div>
        </div>
      )}

      {assignOpen && (
        <AssignDialog
          billId={billId}
          reassign={status !== "not_assigned"}
          onClose={() => setAssignOpen(false)}
          onDone={(d) => {
            setAssignOpen(false);
            setDelivery(d);
          }}
        />
      )}
    </section>
  );
}

function AssignDialog({ billId, reassign, onClose, onDone }) {
  const [agents, setAgents] = useState(null);
  const [agentId, setAgentId] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get("/api/delivery-agents").then((r) => {
      if (!r.ok) ErrorMessage(r.error);
      setAgents(r.data?.items || []);
    });
  }, []);

  const assign = async () => {
    setBusy(true);
    const r = await api.post(`/api/bills/${billId}/delivery/assign`, { agentId });
    setBusy(false);
    if (!r.ok) return ErrorMessage(r.error);
    SuccessToast("Delivery assigned. The customer has been sent their delivery code.");
    onDone(r.data?.delivery);
  };

  return (
    <Dialog open onOpenChange={(o) => !o && !busy && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{reassign ? "Reassign delivery" : "Assign delivery"}</DialogTitle>
          <DialogDescription>
            The customer gets an SMS code to give the delivery person on arrival.{reassign ? " Reassigning sends a new code." : ""}
          </DialogDescription>
        </DialogHeader>
        {agents === null ? (
          <p className="text-sm text-muted-foreground">Loading delivery people…</p>
        ) : agents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No delivery people yet. An admin can add them under Merchant biller → Delivery people.</p>
        ) : (
          <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={agentId} onChange={(e) => setAgentId(e.target.value)}>
            <option value="">Choose a delivery person</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
                {a.phone ? ` · ${a.phone}` : ""}
              </option>
            ))}
          </select>
        )}
        <DialogFooter className="gap-2">
          <Button variant="outline" disabled={busy} onClick={onClose}>Cancel</Button>
          <Button disabled={!agentId || busy} onClick={assign}>{busy ? "Assigning…" : "Assign"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Shown on a confirmed sale when the business has neither the Delivery app nor the Merchant app:
// what delivery would do here, and the way to the app store (admins install, others ask them).
function DeliveryPromo() {
  const { auth } = useParams() || {};
  const isAdmin = Boolean(useUser()?.user?.user?.isAdmin);
  return (
    <section id="delivery" className="mb-6 rounded-lg border border-dashed border-border bg-muted/20 p-4 scroll-mt-24">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Truck className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">Deliver this order with the BADE Delivery app</p>
            <p className="text-sm text-muted-foreground">
              Assign the order to a driver and follow it live. Each drop is confirmed with the customer&apos;s SMS code, a photo, a signature and the
              driver&apos;s location, all saved on this invoice.
            </p>
            {!isAdmin && <p className="text-xs text-muted-foreground">Ask an administrator to add it from the app store.</p>}
          </div>
        </div>
        {auth && (
          <Button asChild size="sm" variant={isAdmin ? "default" : "outline"} className="w-full shrink-0 sm:w-auto">
            <Link href={`/${auth}/Apps`}>{isAdmin ? "Get the Delivery app" : "See the app store"}</Link>
          </Button>
        )}
      </div>
    </section>
  );
}
