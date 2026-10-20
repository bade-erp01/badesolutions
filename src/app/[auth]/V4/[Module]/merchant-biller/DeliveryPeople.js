"use client";

// Delivery people (admins only): the business's delivery-portal logins.
//   GET   /api/portal-users?kind=delivery            list
//   POST  /api/portal-users {kind, name, phone, email} add → temporary password (shown once)
//   PATCH /api/portal-users/:id {name, phone, email, status}
//   POST  /api/portal-users/:id/reset-password       new temporary password (signs them out)

import { useCallback, useEffect, useMemo, useState } from "react";
import moment from "moment";
import api from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ErrorMessage, SuccessToast } from "../../../../../../Functions/Mics";

const DELIVERY_APP_URL = process.env.NEXT_PUBLIC_DELIVERY_PORTAL_URL || "https://delivery.badesolutions.com.ng";

export default function DeliveryPeople() {
  const [people, setPeople] = useState(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null); // null | {} (new) | person
  const [password, setPassword] = useState(null); // { name, phone, temporaryPassword } shown once
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    const r = await api.get("/api/portal-users?kind=delivery");
    if (!r.ok) {
      setPeople([]);
      return ErrorMessage(r.error);
    }
    setPeople(r.data?.items || []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const shown = useMemo(() => {
    const s = search.trim().toLowerCase();
    return (people || []).filter((p) => !s || `${p.name} ${p.phone} ${p.email}`.toLowerCase().includes(s));
  }, [people, search]);
  const activeCount = (people || []).filter((p) => p.status === "active").length;

  const setStatus = async (person, status) => {
    if (status === "suspended" && !window.confirm(`Suspend ${person.name}? They are signed out at once and can't sign in until reactivated.`)) return;
    setBusyId(person.id);
    const r = await api.patch(`/api/portal-users/${person.id}`, { status });
    setBusyId(null);
    if (!r.ok) return ErrorMessage(r.error);
    setPeople((list) => list.map((p) => (p.id === person.id ? r.data.user : p)));
    SuccessToast(status === "active" ? `${person.name} can sign in again` : `${person.name} is suspended`);
  };

  const resetPassword = async (person) => {
    if (!window.confirm(`Give ${person.name} a new temporary password? Their current password stops working and they are signed out.`)) return;
    setBusyId(person.id);
    const r = await api.post(`/api/portal-users/${person.id}/reset-password`, {});
    setBusyId(null);
    if (!r.ok) return ErrorMessage(r.error);
    setPassword({ name: person.name, phone: person.phone, temporaryPassword: r.data.temporaryPassword });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Delivery people</h2>
          <p className="text-sm text-muted-foreground">
            They sign in to the delivery app with their phone number to see and close the deliveries you assign them.
            {people ? ` ${activeCount} active.` : ""}
          </p>
        </div>
        <Button onClick={() => setEditing({})} className="w-full sm:w-auto">
          Add delivery person
        </Button>
      </div>

      <Input placeholder="Search name or phone" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="whitespace-nowrap">Last signed in</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {people === null ? (
              <TableRow>
                <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">Loading…</TableCell>
              </TableRow>
            ) : shown.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                  {people.length ? "No one matches." : "No delivery people yet. Add the first one."}
                </TableCell>
              </TableRow>
            ) : (
              shown.map((p) => (
                <TableRow key={p.id} className={busyId === p.id ? "opacity-60" : ""}>
                  <TableCell className="font-medium">
                    {p.name}
                    {p.email && <span className="block text-xs text-muted-foreground">{p.email}</span>}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <a href={`tel:${p.phone}`} className="text-primary hover:underline">{p.phone}</a>
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.status === "active" ? "secondary" : "destructive"}>{p.status === "active" ? "Active" : "Suspended"}</Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {p.lastLoginAt ? moment(p.lastLoginAt).fromNow() : "Never"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-1">
                      <Button size="sm" variant="ghost" disabled={busyId === p.id} onClick={() => setEditing(p)}>Edit</Button>
                      <Button size="sm" variant="ghost" disabled={busyId === p.id} onClick={() => resetPassword(p)}>Reset password</Button>
                      {p.status === "active" ? (
                        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" disabled={busyId === p.id} onClick={() => setStatus(p, "suspended")}>
                          Suspend
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" disabled={busyId === p.id} onClick={() => setStatus(p, "active")}>Reactivate</Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editing && (
        <PersonDialog
          person={editing}
          onClose={() => setEditing(null)}
          onSaved={(user, temporaryPassword) => {
            setEditing(null);
            setPeople((list) => {
              const rest = (list || []).filter((p) => p.id !== user.id);
              return [...rest, user].sort((a, b) => a.name.localeCompare(b.name));
            });
            if (temporaryPassword) setPassword({ name: user.name, phone: user.phone, temporaryPassword });
            else SuccessToast(`${user.name} updated`);
          }}
        />
      )}

      <Dialog open={Boolean(password)} onOpenChange={(o) => !o && setPassword(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Give {password?.name} these sign-in details</DialogTitle>
            <DialogDescription>The temporary password is shown only now. They choose their own password after signing in.</DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border bg-muted/30 divide-y text-sm">
            <div className="flex justify-between gap-3 p-3"><span className="text-muted-foreground">Delivery app</span><span className="font-medium break-all">{DELIVERY_APP_URL.replace(/^https?:\/\//, "")}</span></div>
            <div className="flex justify-between gap-3 p-3"><span className="text-muted-foreground">Phone</span><span className="font-medium">{password?.phone}</span></div>
            <div className="flex justify-between gap-3 p-3"><span className="text-muted-foreground">Temporary password</span><span className="font-mono text-base font-semibold tracking-wider">{password?.temporaryPassword}</span></div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                const text = `Your ${DELIVERY_APP_URL.replace(/^https?:\/\//, "")} sign-in: phone ${password.phone}, temporary password ${password.temporaryPassword}`;
                navigator.clipboard?.writeText(text).then(() => SuccessToast("Copied"), () => ErrorMessage("Couldn't copy"));
              }}
            >
              Copy details
            </Button>
            <Button onClick={() => setPassword(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PersonDialog({ person, onClose, onSaved }) {
  const isNew = !person.id;
  const [name, setName] = useState(person.name || "");
  const [phone, setPhone] = useState(person.phone || "");
  const [email, setEmail] = useState(person.email || "");
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    const body = { name: name.trim(), phone: phone.trim(), email: email.trim() };
    const r = isNew ? await api.post("/api/portal-users", { kind: "delivery", ...body }) : await api.patch(`/api/portal-users/${person.id}`, body);
    setBusy(false);
    if (!r.ok) return ErrorMessage(r.error);
    onSaved(r.data.user, r.data.temporaryPassword);
  };

  return (
    <Dialog open onOpenChange={(o) => !o && !busy && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isNew ? "Add delivery person" : `Edit ${person.name}`}</DialogTitle>
          <DialogDescription>
            {isNew ? "They sign in to the delivery app with this phone number." : "Changing the phone number changes how they sign in."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="dp-name">Full name</Label>
            <Input id="dp-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Musa Ibrahim" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dp-phone">Phone number</Label>
            <Input id="dp-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0803 000 0000" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dp-email">Email (optional)</Label>
            <Input id="dp-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" disabled={busy} onClick={onClose}>Cancel</Button>
          <Button disabled={busy || !name.trim() || !phone.trim()} onClick={save}>
            {busy ? "Saving…" : isNew ? "Add and show password" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
