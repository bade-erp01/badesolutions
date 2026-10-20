"use client";

// Delivery app: every invoice that has a delivery (GET /api/deliveries), the customer map, and,
// for admins, the delivery people (same screen as Merchant biller → Delivery people). Deliveries are assigned
// from each invoice's Delivery panel. Refreshes live on "delivery:changed".

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import moment from "moment";
import api from "@/lib/api";
import { useOptionalWebSocket } from "@/app/Components/WebSocketProvider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import DeliveryPeople from "../merchant-biller/DeliveryPeople";
import CustomerMap from "./CustomerMap";
import { ErrorMessage } from "../../../../../../Functions/Mics";

const noSubscribe = () => () => {};
const FILTERS = [
  ["", "All"],
  ["assigned", "Assigned"],
  ["out", "Out for delivery"],
  ["delivered", "Delivered"],
  ["failed", "Couldn't deliver"],
];
const BADGE = {
  assigned: ["Assigned", "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200"],
  out: ["Out for delivery", "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"],
  delivered: ["Delivered", "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200"],
  failed: ["Couldn't deliver", "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200"],
};

export default function DeliveryApp({ auth, isAdmin }) {
  const router = useRouter();
  const [tab, setTab] = useState("deliveries");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [data, setData] = useState(null);
  const subscribe = useOptionalWebSocket()?.subscribe ?? noSubscribe;

  const load = useCallback(async () => {
    const r = await api.get("/api/deliveries");
    if (!r.ok) {
      setData({ items: [] });
      return ErrorMessage(r.error);
    }
    setData(r.data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);
  // live: assigned / out / delivered / failed anywhere in the business
  useEffect(() => subscribe("delivery:changed", () => load()), [subscribe, load]);

  const shown = useMemo(() => {
    const s = search.trim().toLowerCase();
    return (data?.items || []).filter(
      (b) => (!status || b.delivery?.status === status) && (!s || `${b.ref} ${b.customerName} ${b.delivery?.agentName || ""}`.toLowerCase().includes(s)),
    );
  }, [data, status, search]);
  const count = (st) => (data?.items || []).filter((b) => b.delivery?.status === st).length;

  return (
    <div className="space-y-4 p-2 sm:p-4 min-w-0">
      <div>
        <h1 className="text-xl font-semibold">Delivery</h1>
        <p className="text-sm text-muted-foreground">Every delivery and its proof. Assign a delivery from the invoice&apos;s Delivery panel.</p>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b" role="tablist">
          {[
            ["deliveries", "Deliveries"],
            ["map", "Customer map"],
            ...(isAdmin ? [["people", "Delivery people"]] : []),
          ].map(([key, label]) => (
            <button
              key={key}
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium ${tab === key ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              {label}
            </button>
          ))}
      </div>

      {tab === "people" && isAdmin && <DeliveryPeople />}
      {tab === "map" && <CustomerMap />}

      {tab === "deliveries" && (
        <>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map(([value, label]) => (
              <button
                key={value || "all"}
                onClick={() => setStatus(value)}
                className={`rounded-full border px-3 py-1 text-sm ${status === value ? "bg-primary text-primary-foreground" : "bg-background hover:bg-accent"}`}
              >
                {label}
                {value && data ? ` (${count(value)})` : ""}
              </button>
            ))}
          </div>
          <Input placeholder="Search invoice, customer or delivery person" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-md" />

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Delivery person</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="whitespace-nowrap">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!data ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">Loading…</TableCell>
                  </TableRow>
                ) : shown.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                      {data.items.length ? "Nothing matches." : "No deliveries yet. Assign one from an invoice's Delivery panel."}
                    </TableCell>
                  </TableRow>
                ) : (
                  shown.map((b) => {
                    const [label, cls] = BADGE[b.delivery?.status] || ["—", "text-muted-foreground"];
                    return (
                      <TableRow key={b.id} className="cursor-pointer" onClick={() => router.push(`/${auth}/V4/Sales/Sales/${b.id}#delivery`)}>
                        <TableCell className="font-medium">{b.ref}</TableCell>
                        <TableCell>{b.customerName}</TableCell>
                        <TableCell>{b.delivery?.agentName || "—"}</TableCell>
                        <TableCell>
                          <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${cls}`} title={b.delivery?.failReason || ""}>
                            {label}
                          </span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{b.date ? moment(b.date).format("D MMM YYYY") : "—"}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          {data?.capped && <p className="text-xs text-muted-foreground">Showing the latest 500.</p>}
        </>
      )}
    </div>
  );
}
