"use client";

// Delivery fees for the online store (Settings → Delivery fees). Admins add, edit, switch
// off and delete them; the store shows the active ones at checkout and the backend charges
// exactly these prices.
//   GET    /api/DeliveryFees               list
//   POST   /api/DeliveryFees {name, price}  add
//   PATCH  /api/DeliveryFees/:id {name?, price?, active?}
//   DELETE /api/DeliveryFees/:id

import { useCallback, useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ErrorMessage, SuccessToast } from "../../../../../Functions/Mics";

const naira = (n) => `₦${Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function DeliveryFees({ isAdmin }) {
  const [fees, setFees] = useState(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null); // null | {} (new) | fee
  const [deleting, setDeleting] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    const r = await api.get("/api/DeliveryFees");
    if (!r.ok) {
      setFees([]);
      return ErrorMessage(r.error);
    }
    setFees(r.data?.data || []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const shown = useMemo(() => {
    const s = search.trim().toLowerCase();
    return (fees || [])
      .filter((f) => !s || f.name.toLowerCase().includes(s))
      .sort((a, b) => a.price - b.price || a.name.localeCompare(b.name));
  }, [fees, search]);
  const activeCount = (fees || []).filter((f) => f.active).length;

  const replace = (fee) => setFees((list) => [...(list || []).filter((f) => f._id !== fee._id), fee]);

  const toggle = async (fee) => {
    setBusyId(fee._id);
    const r = await api.patch(`/api/DeliveryFees/${fee._id}`, { active: !fee.active });
    setBusyId(null);
    if (!r.ok) return ErrorMessage(r.error);
    replace(r.data.data);
    SuccessToast(r.data.data.active ? `${fee.name} is shown in the store` : `${fee.name} is hidden from the store`);
  };

  const remove = async () => {
    const fee = deleting;
    setBusyId(fee._id);
    const r = await api.del(`/api/DeliveryFees/${fee._id}`);
    setBusyId(null);
    if (!r.ok) return ErrorMessage(r.error);
    setDeleting(null);
    setFees((list) => list.filter((f) => f._id !== fee._id));
    SuccessToast(`${fee.name} deleted`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Delivery fees</h2>
          <p className="text-sm text-muted-foreground max-w-2xl">
            The delivery options shoppers choose from at checkout in your online store, and what each costs. The store
            charges exactly these prices. Add a ₦0 &ldquo;Pickup&rdquo; option if customers can collect orders.
            {fees ? ` ${activeCount} shown in the store.` : ""}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setEditing({})} className="w-full sm:w-auto">
            Add delivery fee
          </Button>
        )}
      </div>

      {!isAdmin && (
        <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          Only an admin can change delivery fees.
        </p>
      )}

      {(fees?.length || 0) > 6 && (
        <Input placeholder="Search delivery fees" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
      )}

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Delivery option</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead>In store</TableHead>
              {isAdmin && <TableHead />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {fees === null ? (
              <TableRow>
                <TableCell colSpan={4} className="h-20 text-center text-muted-foreground">Loading…</TableCell>
              </TableRow>
            ) : shown.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-20 text-center text-muted-foreground">
                  {fees.length
                    ? "No delivery fee matches."
                    : "No delivery fees yet. Until you add some, online orders are pickup only (₦0)."}
                </TableCell>
              </TableRow>
            ) : (
              shown.map((f) => (
                <TableRow key={f._id} className={busyId === f._id ? "opacity-60" : ""}>
                  <TableCell className="font-medium">{f.name}</TableCell>
                  <TableCell className="text-right whitespace-nowrap tabular-nums">{naira(f.price)}</TableCell>
                  <TableCell>
                    {isAdmin ? (
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={f.active}
                          disabled={busyId === f._id}
                          onCheckedChange={() => toggle(f)}
                          aria-label={`Show ${f.name} in the store`}
                        />
                        <span className="text-xs text-muted-foreground">{f.active ? "Shown" : "Hidden"}</span>
                      </div>
                    ) : (
                      <Badge variant={f.active ? "secondary" : "outline"}>{f.active ? "Shown" : "Hidden"}</Badge>
                    )}
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" disabled={busyId === f._id} onClick={() => setEditing(f)}>
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          disabled={busyId === f._id}
                          onClick={() => setDeleting(f)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editing && (
        <FeeDialog
          fee={editing}
          onClose={() => setEditing(null)}
          onSaved={(fee, isNew) => {
            setEditing(null);
            replace(fee);
            SuccessToast(isNew ? `${fee.name} added` : `${fee.name} updated`);
          }}
        />
      )}

      <Dialog open={Boolean(deleting)} onOpenChange={(o) => !o && !busyId && setDeleting(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete {deleting?.name}?</DialogTitle>
            <DialogDescription>
              Shoppers can no longer choose it. Orders already placed keep the fee they were charged. To hide it for a
              while instead, switch it off.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" disabled={Boolean(busyId)} onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={Boolean(busyId)} onClick={remove}>
              {busyId ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FeeDialog({ fee, onClose, onSaved }) {
  const isNew = !fee._id;
  const [name, setName] = useState(fee.name || "");
  const [price, setPrice] = useState(fee.price !== undefined ? String(fee.price) : "");
  const [busy, setBusy] = useState(false);

  const priceNum = Number(price);
  const valid = name.trim() && price !== "" && Number.isFinite(priceNum) && priceNum >= 0;

  const save = async (e) => {
    e.preventDefault();
    if (!valid) return;
    setBusy(true);
    const body = { name: name.trim(), price: priceNum };
    const r = isNew ? await api.post("/api/DeliveryFees", body) : await api.patch(`/api/DeliveryFees/${fee._id}`, body);
    setBusy(false);
    if (!r.ok) return ErrorMessage(r.error);
    onSaved(r.data.data, isNew);
  };

  return (
    <Dialog open onOpenChange={(o) => !o && !busy && onClose()}>
      <DialogContent className="max-w-md">
        <form onSubmit={save} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{isNew ? "Add delivery fee" : `Edit ${fee.name}`}</DialogTitle>
            <DialogDescription>Shoppers see the name and price when they check out.</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="df-name">Delivery option</Label>
            <Input
              id="df-name"
              value={name}
              maxLength={80}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Delivery – Ikeja, Oshodi, Mushin"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="df-price">Price (₦)</Label>
            <Input
              id="df-price"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0 for pickup"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" disabled={busy} onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy || !valid}>
              {busy ? "Saving…" : isNew ? "Add" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
