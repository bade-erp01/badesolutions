"use client";

// Merchant biller: every bill starts from a merchant (a vendor of the business), then a
// customer. The draft it creates only offers that merchant's products (enforced by the API).
//   GET  /api/merchant-biller/merchants | /api/merchant-biller/bills | /api/crm | /api/Stores
//   POST /api/SalesDraft/:userId { customer, whId, merchant }
//   GET  /api/delivery-agents, POST /api/bills/:id/delivery/assign | /otp/resend

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ErrorMessage, SuccessToast } from "../../../../../../Functions/Mics";
import DeliveryPeople from "./DeliveryPeople";
import { useOptionalWebSocket } from "@/app/Components/WebSocketProvider";

const noSubscribe = () => () => {};

const STATUSES = [
  ["", "All"],
  ["draft", "Drafts"],
  ["open", "Open"],
  ["delivered", "Delivered"],
  ["failed", "Failed delivery"],
  ["cancelled", "Cancelled"],
];

const DELIVERY = {
  not_assigned: ["Not assigned", "bg-gray-100 text-gray-700"],
  assigned: ["Assigned", "bg-blue-100 text-blue-800"],
  out: ["Out for delivery", "bg-amber-100 text-amber-800"],
  delivered: ["Delivered", "bg-green-100 text-green-800"],
  failed: ["Failed", "bg-red-100 text-red-800"],
};

const naira = (n) => `₦${(Number(n) || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
const shortDate = (d) => (d ? new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "—");

function DeliveryBadge({ delivery }) {
  const [label, cls] = DELIVERY[delivery?.status] || DELIVERY.not_assigned;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`} title={delivery?.failReason || ""}>
      {label}
      {delivery?.agentName ? ` · ${delivery.agentName}` : ""}
    </span>
  );
}

export default function MerchantBiller({ auth, userId, canInvoice, isAdmin }) {
  const [tab, setTab] = useState("bills"); // bills | people (admins)
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [search, setSearch] = useState("");
  const [bills, setBills] = useState({ items: [], capped: false });
  const [loading, setLoading] = useState(true);
  const [newOpen, setNewOpen] = useState(false);
  const [assignFor, setAssignFor] = useState(null);

  const loadBills = useCallback(async () => {
    setLoading(true);
    const q = new URLSearchParams();
    if (status) q.set("status", status);
    if (from) q.set("from", from);
    if (to) q.set("to", to);
    const r = await api.get(`/api/merchant-biller/bills?${q}`);
    setLoading(false);
    if (!r.ok) return ErrorMessage(r.error);
    setBills(r.data || { items: [] });
  }, [status, from, to]);

  useEffect(() => {
    loadBills();
  }, [loadBills]);

  // live: a delivery was assigned, started, delivered or failed (backend lib/portals/live.js)
  const subscribe = useOptionalWebSocket()?.subscribe ?? noSubscribe;
  useEffect(() => subscribe("delivery:changed", () => loadBills()), [subscribe, loadBills]);

  const shown = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return bills.items;
    return bills.items.filter((b) => `${b.ref} ${b.customerName} ${b.merchantName}`.toLowerCase().includes(s));
  }, [bills.items, search]);

  const openBill = (b) =>
    router.push(b.billStatus === "Draft" ? `/${auth}/V4/Sales/Sales/Draft/${b.id}` : `/${auth}/V4/Sales/Sales/${b.id}`);

  const resendCode = async (b) => {
    const r = await api.post(`/api/bills/${b.id}/delivery/otp/resend`);
    if (!r.ok) return ErrorMessage(r.error);
    SuccessToast(`Delivery code sent to ${r.data?.sentTo || "the customer"}`);
  };

  return (
    <div className="space-y-4 p-2 sm:p-4 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Merchant biller</h1>
          <p className="text-sm text-muted-foreground">Bills raised for one merchant at a time, with their delivery.</p>
        </div>
        {canInvoice && tab === "bills" && <Button onClick={() => setNewOpen(true)}>New bill</Button>}
      </div>

      {isAdmin && (
        <div className="flex gap-1 border-b" role="tablist">
          {[
            ["bills", "Bills"],
            ["people", "Delivery people"],
          ].map(([key, label]) => (
            <button
              key={key}
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${tab === key ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {tab === "people" && isAdmin && <DeliveryPeople />}

      {tab === "bills" && (
      <>
      <div className="flex flex-wrap gap-2">
        {STATUSES.map(([value, label]) => (
          <button
            key={value || "all"}
            onClick={() => setStatus(value)}
            className={`rounded-full border px-3 py-1 text-sm ${status === value ? "bg-primary text-primary-foreground" : "bg-background hover:bg-accent"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="block text-muted-foreground mb-1">From</span>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label className="text-sm">
          <span className="block text-muted-foreground mb-1">To</span>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
        <label className="text-sm flex-1 min-w-[200px]">
          <span className="block text-muted-foreground mb-1">Search</span>
          <Input placeholder="Invoice, customer or merchant" value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Merchant</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Delivery</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">Loading…</TableCell>
              </TableRow>
            ) : shown.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No merchant bills here yet.</TableCell>
              </TableRow>
            ) : (
              shown.map((b) => {
                const isOrder = b.billStatus !== "Draft" && b.billStatus !== "Cancelled" && b.billStatus !== "Requisition";
                const st = b.delivery?.status;
                return (
                  <TableRow key={b.id} className="cursor-pointer" onClick={() => openBill(b)}>
                    <TableCell className="font-medium">{b.ref}</TableCell>
                    <TableCell>{shortDate(b.date)}</TableCell>
                    <TableCell>{b.merchantName || "—"}</TableCell>
                    <TableCell>{b.customerName}</TableCell>
                    <TableCell className="text-right">{naira(b.total)}</TableCell>
                    <TableCell><DeliveryBadge delivery={b.delivery} /></TableCell>
                    <TableCell className="text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      {canInvoice && isOrder && st !== "delivered" && (
                        <Button size="sm" variant="outline" onClick={() => setAssignFor(b)}>
                          {st === "not_assigned" || !st ? "Assign" : "Reassign"}
                        </Button>
                      )}
                      {canInvoice && (st === "assigned" || st === "out") && (
                        <Button size="sm" variant="ghost" className="ml-1" onClick={() => resendCode(b)}>Resend code</Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      {bills.capped && <p className="text-xs text-muted-foreground">Showing the latest 500 bills. Narrow the dates to see older ones.</p>}
      </>
      )}

      {newOpen && <NewBillDialog auth={auth} userId={userId} onClose={() => setNewOpen(false)} />}
      {assignFor && (
        <AssignDialog
          bill={assignFor}
          onClose={() => setAssignFor(null)}
          onDone={() => {
            setAssignFor(null);
            loadBills();
          }}
        />
      )}
    </div>
  );
}

// Step 1 merchant, step 2 customer, then create the draft. The bill uses the billing location
// the customer already has in the CRM (customer.location); there is no warehouse choice here.
function NewBillDialog({ auth, userId, onClose }) {
  const router = useRouter();
  const [merchants, setMerchants] = useState(null);
  const [customers, setCustomers] = useState(null);
  const [merchant, setMerchant] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const [m, c] = await Promise.all([api.get("/api/merchant-biller/merchants"), api.get("/api/crm")]);
      if (!m.ok) ErrorMessage(m.error);
      setMerchants(m.data?.items || []);
      setCustomers(Array.isArray(c.data) ? c.data : []);
    })();
  }, []);

  const whId = customer?.location ? String(customer.location) : "";

  const step = merchant ? 2 : 1;
  const term = q.trim().toLowerCase();
  const merchantMatches = (merchants || []).filter((m) => !term || m.name.toLowerCase().includes(term));
  const customerMatches = (customers || [])
    .filter((c) => !term || `${c.Username} ${c.CustomerCode || ""} ${c.phone || ""}`.toLowerCase().includes(term))
    .slice(0, 40);

  const pickCustomer = (c) => setCustomer(c);

  const create = async () => {
    if (!merchant || !customer || !whId) return;
    setBusy(true);
    const r = await api.post(`/api/SalesDraft/${userId}`, { customer: customer._id, whId, merchant: merchant.id });
    if (!r.ok || !r.data?.result) {
      setBusy(false);
      return ErrorMessage(r.error || "Could not create the bill");
    }
    router.push(`/${auth}/V4/Sales/Sales/Draft/${r.data.result}`);
  };

  return (
    <Dialog open onOpenChange={(o) => !o && !busy && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{step === 1 ? "Choose a merchant" : `New bill for ${merchant.name}`}</DialogTitle>
          <DialogDescription>
            {step === 1 ? "Only this merchant's products will show on the bill." : "Now choose the customer."}
          </DialogDescription>
        </DialogHeader>

        <Input autoFocus placeholder={step === 1 ? "Search merchants" : "Search customer name, code or phone"} value={q} onChange={(e) => setQ(e.target.value)} />

        <div className="max-h-72 overflow-y-auto rounded-md border divide-y">
          {step === 1 ? (
            merchants === null ? (
              <p className="p-3 text-sm text-muted-foreground">Loading merchants…</p>
            ) : merchantMatches.length === 0 ? (
              <p className="p-3 text-sm text-muted-foreground">No merchants yet. Turn on &quot;Merchant&quot; on a vendor&apos;s page to bill them here.</p>
            ) : (
              merchantMatches.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setMerchant(m);
                    setQ("");
                  }}
                  className="flex w-full items-center justify-between p-3 text-left hover:bg-accent"
                >
                  <span className="font-medium">{m.name}</span>
                  <span className="text-xs text-muted-foreground">{m.products} product{m.products === 1 ? "" : "s"}</span>
                </button>
              ))
            )
          ) : customers === null ? (
            <p className="p-3 text-sm text-muted-foreground">Loading customers…</p>
          ) : customerMatches.length === 0 ? (
            <p className="p-3 text-sm text-muted-foreground">No customer matches.</p>
          ) : (
            customerMatches.map((c) => (
              <button
                key={c._id}
                onClick={() => pickCustomer(c)}
                className={`flex w-full items-center justify-between p-3 text-left hover:bg-accent ${customer?._id === c._id ? "bg-accent" : ""}`}
              >
                <span className="font-medium">{c.Username}</span>
                <span className="text-xs text-muted-foreground">{c.CustomerCode || c.phone || ""}</span>
              </button>
            ))
          )}
        </div>

        {step === 2 && customer && !whId && (
          <p className="text-sm text-destructive">
            {customer.Username} has no billing location in the CRM yet. Set it on the customer&apos;s CRM page, then bill them here.
          </p>
        )}

        <div className="flex justify-between gap-2">
          {step === 2 ? (
            <Button variant="outline" disabled={busy} onClick={() => { setMerchant(null); setCustomer(null); setQ(""); }}>
              Change merchant
            </Button>
          ) : (
            <span />
          )}
          {step === 2 && (
            <Button disabled={!customer || !whId || busy} onClick={create}>
              {busy ? "Creating…" : "Create bill"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AssignDialog({ bill, onClose, onDone }) {
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
    const r = await api.post(`/api/bills/${bill.id}/delivery/assign`, { agentId });
    setBusy(false);
    if (!r.ok) return ErrorMessage(r.error);
    SuccessToast("Delivery assigned. The customer has been sent their delivery code.");
    onDone();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && !busy && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign delivery · {bill.ref}</DialogTitle>
          <DialogDescription>
            {bill.customerName} gets an SMS code to give the delivery agent on arrival.
            {bill.delivery?.status && bill.delivery.status !== "not_assigned" ? " Reassigning sends a new code." : ""}
          </DialogDescription>
        </DialogHeader>
        {agents === null ? (
          <p className="text-sm text-muted-foreground">Loading delivery agents…</p>
        ) : agents.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No delivery agents yet. An admin can add them as portal users.
          </p>
        ) : (
          <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={agentId} onChange={(e) => setAgentId(e.target.value)}>
            <option value="">Choose an agent</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>{a.name}{a.phone ? ` · ${a.phone}` : ""}</option>
            ))}
          </select>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="outline" disabled={busy} onClick={onClose}>Cancel</Button>
          <Button disabled={!agentId || busy} onClick={assign}>{busy ? "Assigning…" : "Assign"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
