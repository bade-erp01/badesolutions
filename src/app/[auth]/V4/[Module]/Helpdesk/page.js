"use client";

// Help Desk app (add-on "Help Desk", ₦5,000/month): the officers' queue, one ticket's thread with
// replies and internal notes, assignment/status/priority, the figures, and (admins) the settings.
// Tickets are raised by sales reps from the Sales Portal, or from a customer's CRM page.
// Backend: controllers/helpdesk.js (GET/POST /api/helpdesk/...).

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import moment from "moment";
import { AlertTriangle, Clock, Inbox, LifeBuoy, Loader2, Lock, RefreshCw, Search, Send, Settings, StickyNote } from "lucide-react";
import api from "@/lib/api";
import { useUser } from "@/components/UserProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ErrorMessage, SuccessToast } from "../../../../../../Functions/Mics";

const STATUSES = ["Open", "Processing", "Waiting", "Resolved", "Closed"];
const PRIORITIES = ["High", "Medium", "Low"];
const STATUS_TONE = {
  Open: "bg-blue-100 text-blue-800",
  Processing: "bg-amber-100 text-amber-800",
  Waiting: "bg-purple-100 text-purple-800",
  Resolved: "bg-green-100 text-green-800",
  Closed: "bg-muted text-muted-foreground",
};
const PRIORITY_TONE = { High: "bg-red-100 text-red-800", Medium: "bg-amber-100 text-amber-800", Low: "bg-muted text-muted-foreground" };

const nameOf = (e) => (e ? `${e.firstName || ""} ${e.lastName || ""}`.trim() : "");
const fmt = (d) => (d ? moment(d).format("D MMM YYYY, HH:mm") : "—");
const duration = (mins) => {
  if (mins == null) return "—";
  if (mins < 60) return `${mins} min`;
  const h = mins / 60;
  return h < 24 ? `${h.toFixed(1)} h` : `${(h / 24).toFixed(1)} days`;
};

function dueText(t) {
  if (!["Open", "Processing", "Waiting"].includes(t.status)) return null;
  const now = Date.now();
  const target = !t.firstResponseAt && t.firstResponseDue ? { what: "first response", at: t.firstResponseDue } : t.resolutionDue ? { what: "resolution", at: t.resolutionDue } : null;
  if (!target) return null;
  const late = new Date(target.at).getTime() < now;
  return { late, text: `${target.what} ${late ? "was due" : "due"} ${moment(target.at).fromNow()}` };
}

export default function HelpdeskPage() {
  const userInfo = useUser()?.user;
  const me = userInfo?.user || {};
  const isAdmin = me.isAdmin === true;
  const router = useRouter();
  const search = useSearchParams();
  const openId = search.get("ticket");

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [closed, setClosed] = useState("");
  const [summary, setSummary] = useState(null);
  const [officers, setOfficers] = useState([]);
  const [filter, setFilter] = useState({ status: "open", priority: "all", assignee: "all", q: "" });
  const [query, setQuery] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (filter.status !== "all") p.set("status", filter.status);
    if (filter.priority !== "all") p.set("priority", filter.priority);
    if (filter.assignee === "breached") p.set("breached", "1");
    else if (filter.assignee !== "all") p.set("assignee", filter.assignee);
    if (filter.q) p.set("q", filter.q);
    const r = await api.get(`/api/helpdesk/tickets?${p.toString()}`);
    setLoading(false);
    if (r.status === 402) return setClosed(r.data?.error || "Help Desk isn't active for your business.");
    if (!r.ok) return ErrorMessage(r.data?.error || r.error || "Couldn't load the tickets");
    setClosed("");
    setTickets(r.data?.tickets || []);
  }, [filter]);

  const loadSummary = useCallback(async () => {
    const r = await api.get(`/api/helpdesk/summary?days=30`);
    if (r.ok) setSummary(r.data);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    loadSummary();
    api.get(`/api/helpdesk/officers`).then((r) => r.ok && setOfficers(r.data?.officers || []));
  }, [loadSummary]);

  const openTicket = (id) => router.replace(`?ticket=${id}`, { scroll: false });
  const closeTicket = () => router.replace(`?`, { scroll: false });
  const refresh = () => { load(); loadSummary(); };

  if (closed) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-4">
        <Card className="max-w-md text-center">
          <CardContent className="space-y-3 pt-6">
            <Lock className="mx-auto h-10 w-10 text-muted-foreground" />
            <h1 className="text-lg font-semibold">Help Desk</h1>
            <p className="text-sm text-muted-foreground">{closed}</p>
            <p className="text-sm text-muted-foreground">Help Desk is ₦5,000 a month. An administrator can add it from the Apps page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl"><LifeBuoy className="h-7 w-7" /> Help Desk</h1>
          <p className="text-sm text-muted-foreground">Tickets your sales reps raise for customers, with response targets by priority.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refresh}><RefreshCw className="mr-2 h-4 w-4" /> Refresh</Button>
          {isAdmin && <Button variant="outline" onClick={() => setSettingsOpen(true)}><Settings className="mr-2 h-4 w-4" /> Settings</Button>}
        </div>
      </div>

      <Kpis summary={summary} />

      <Card>
        <CardHeader className="space-y-3">
          <CardTitle className="text-base">Tickets</CardTitle>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
            <form className="relative col-span-2" onSubmit={(e) => { e.preventDefault(); setFilter((f) => ({ ...f, q: query.trim() })); }}>
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input className="pl-8" placeholder="Ticket id, subject or customer (Enter)" value={query} onChange={(e) => setQuery(e.target.value)} />
            </form>
            <Select value={filter.status} onValueChange={(v) => setFilter((f) => ({ ...f, status: v }))}>
              <SelectTrigger aria-label="Status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="open">All open</SelectItem>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filter.priority} onValueChange={(v) => setFilter((f) => ({ ...f, priority: v }))}>
              <SelectTrigger aria-label="Priority"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                {PRIORITIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filter.assignee} onValueChange={(v) => setFilter((f) => ({ ...f, assignee: v }))}>
              <SelectTrigger aria-label="Assigned to"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Anyone</SelectItem>
                <SelectItem value="me">Assigned to me</SelectItem>
                <SelectItem value="none">Unassigned</SelectItem>
                <SelectItem value="breached">Missed a target</SelectItem>
                {officers.map((o) => <SelectItem key={o._id} value={String(o._id)}>{o.name || "Unnamed"}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : !tickets.length ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
              <Inbox className="h-8 w-8" />
              No tickets here. Sales reps raise tickets from a customer in the Sales Portal; you can also raise one from the customer&apos;s CRM page.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned to</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Opened</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((t) => {
                    const due = dueText(t);
                    return (
                      <TableRow key={t._id} className="cursor-pointer" onClick={() => openTicket(t._id)}>
                        <TableCell className="font-mono text-xs">{t.TicketId}</TableCell>
                        <TableCell>{t.customerId?.Username || "—"}</TableCell>
                        <TableCell className="max-w-[260px] truncate">{t.subject || t.comment}</TableCell>
                        <TableCell><Badge className={PRIORITY_TONE[t.SLA] || ""} variant="secondary">{t.SLA || "—"}</Badge></TableCell>
                        <TableCell><Badge className={STATUS_TONE[t.status] || ""} variant="secondary">{t.status}</Badge></TableCell>
                        <TableCell>{nameOf(t.AssignedTo) || <span className="text-muted-foreground">Unassigned</span>}</TableCell>
                        <TableCell className={`whitespace-nowrap text-xs ${t.overdue ? "font-semibold text-red-600" : "text-muted-foreground"}`}>
                          {t.overdue && <AlertTriangle className="mr-1 inline h-3.5 w-3.5" />}
                          {due ? due.text : "—"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{fmt(t.createdAt)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <TicketSheet id={openId} onClose={closeTicket} officers={officers} me={me} onChanged={refresh} />
      {isAdmin && <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}

function Kpis({ summary }) {
  const s = summary;
  const items = [
    { label: "Open tickets", value: s ? s.open : "…", sub: s ? PRIORITIES.map((p) => `${p} ${s.openByPriority?.[p] || 0}`).join(" · ") : "" },
    { label: "Missed a target (open)", value: s ? s.breachedOpen : "…", warn: s && s.breachedOpen > 0 },
    { label: "Avg first response (30 days)", value: s ? duration(s.avgFirstResponseMinutes) : "…", sub: s ? (s.hours === "24/7" ? "round the clock" : "in business hours") : "" },
    { label: "Avg resolution (30 days)", value: s ? duration(s.avgResolutionMinutes) : "…", sub: s ? `${s.resolved} resolved of ${s.created} raised` : "" },
    { label: "Within targets (30 days)", value: s ? (s.withinTargets == null ? "—" : `${s.withinTargets}%`) : "…" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      {items.map((k) => (
        <Card key={k.label}>
          <CardContent className="space-y-1 p-4">
            <p className="text-xs text-muted-foreground">{k.label}</p>
            <p className={`text-2xl font-bold ${k.warn ? "text-red-600" : ""}`}>{k.value}</p>
            {k.sub && <p className="text-xs text-muted-foreground">{k.sub}</p>}
          </CardContent>
        </Card>
      ))}
      {s?.agents?.length > 0 && (
        <Card className="col-span-2 lg:col-span-5">
          <CardContent className="flex flex-wrap gap-x-6 gap-y-1 p-4 text-sm">
            <span className="text-muted-foreground">Open per person:</span>
            {s.agents.map((a) => <span key={a.name}><span className="font-medium">{a.name}</span> {a.open}</span>)}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TicketSheet({ id, onClose, officers, me, onChanged }) {
  const [t, setT] = useState(null);
  const [error, setError] = useState("");
  const [body, setBody] = useState("");
  const [internal, setInternal] = useState(false);
  const [busy, setBusy] = useState("");

  useEffect(() => {
    setT(null);
    setError("");
    setBody("");
    setInternal(false);
    if (!id) return;
    api.get(`/api/helpdesk/tickets/${id}`).then((r) => {
      if (r.ok) setT(r.data?.ticket);
      else setError(r.data?.error || r.error || "Couldn't open the ticket");
    });
  }, [id]);

  const change = async (changes) => {
    setBusy("change");
    const r = await api.patch(`/api/helpdesk/tickets/${id}`, changes);
    setBusy("");
    if (!r.ok) return ErrorMessage(r.data?.error || r.error || "Couldn't change the ticket");
    setT(r.data?.ticket);
    SuccessToast("Ticket updated");
    onChanged();
  };

  const send = async () => {
    if (!body.trim()) return;
    setBusy("send");
    const r = await api.post(`/api/helpdesk/tickets/${id}/messages`, { body, internal });
    setBusy("");
    if (!r.ok) return ErrorMessage(r.data?.error || r.error || "Couldn't send");
    setT(r.data?.ticket);
    setBody("");
    onChanged();
  };

  const thread = useMemo(() => {
    if (!t) return [];
    // the problem as raised is the first message (older tickets only have it there)
    const first = { _id: "raised", author: t.raisedByName || "Raised", messageBody: t.comment, createdAt: t.createdAt, attachments: t.attachments || [], raised: true };
    return [first, ...(t.conversation || [])];
  }, [t]);

  const due = t && dueText(t);
  const closedTicket = t?.status === "Closed";

  return (
    <Sheet open={Boolean(id)} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-2xl">
        <SheetHeader className="border-b p-4 text-left">
          <SheetTitle className="pr-6">{t ? `${t.TicketId} · ${t.subject || "Ticket"}` : "Ticket"}</SheetTitle>
          <SheetDescription>
            {t ? <>{t.customerId?.Username || "Customer"}{t.customerId?.CustomerCode ? ` (${t.customerId.CustomerCode})` : ""} · raised {fmt(t.createdAt)}{t.raisedByName ? ` by ${t.raisedByName}` : ""}{t.raisedVia === "erp" ? " from the ERP" : t.raisedVia ? " from the Sales Portal" : ""}</> : error || "Loading…"}
          </SheetDescription>
        </SheetHeader>

        {!t ? (
          <div className="flex justify-center py-10">{error ? <p className="text-sm text-red-600">{error}</p> : <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />}</div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 border-b p-4 sm:grid-cols-4">
              <div className="space-y-1">
                <Label className="text-xs">Status</Label>
                <Select value={t.status} onValueChange={(v) => change({ status: v })} disabled={busy === "change"}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Priority</Label>
                <Select value={t.SLA || "Low"} onValueChange={(v) => change({ priority: v })} disabled={busy === "change" || closedTicket}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PRIORITIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-xs">Assigned to</Label>
                <Select value={t.AssignedTo ? String(t.AssignedTo._id || t.AssignedTo) : "none"} onValueChange={(v) => v !== "none" && change({ assignedTo: v })} disabled={busy === "change" || closedTicket}>
                  <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" disabled>Unassigned</SelectItem>
                    {officers.map((o) => <SelectItem key={o._id} value={String(o._id)}>{o.name || "Unnamed"}{String(o._id) === String(me._id) ? " (me)" : ""}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 flex items-center gap-2 text-xs text-muted-foreground sm:col-span-4">
                <Clock className="h-3.5 w-3.5" />
                <span>First response due {fmt(t.firstResponseDue)}{t.firstResponseAt ? ` — answered ${fmt(t.firstResponseAt)}` : ""}</span>
                <span>· Resolution due {fmt(t.resolutionDue)}{t.resolvedAt ? ` — resolved ${fmt(t.resolvedAt)}` : ""}</span>
              </div>
              {due?.late && <p className="col-span-2 text-xs font-semibold text-red-600 sm:col-span-4"><AlertTriangle className="mr-1 inline h-3.5 w-3.5" />Past its {due.text.split(" was")[0]} target</p>}
            </div>

            <div className="flex-1 space-y-3 p-4">
              {thread.map((m) => (
                <div key={m._id} className={`rounded-lg border p-3 text-sm ${m.internal ? "border-amber-300 bg-amber-50 dark:bg-amber-950/30" : m.raised ? "bg-muted/40" : ""}`}>
                  <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{m.author || "Staff"}</span>
                    {m.raised && <Badge variant="secondary">Raised</Badge>}
                    {m.internal && <Badge variant="secondary" className="bg-amber-100 text-amber-800"><StickyNote className="mr-1 h-3 w-3" />Internal note</Badge>}
                    <span>{fmt(m.createdAt || m.Timestamp)}</span>
                  </div>
                  <p className="whitespace-pre-wrap">{m.messageBody}</p>
                  {m.attachments?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {m.attachments.map((a, i) => (a?.url ? (
                        <a key={a._id || i} href={a.url} target="_blank" rel="noreferrer" className="block h-16 w-16 overflow-hidden rounded border">
                          <img src={a.url} alt="Attachment" className="h-full w-full object-cover" />
                        </a>
                      ) : null))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="sticky bottom-0 space-y-2 border-t bg-background p-4">
              {closedTicket ? (
                <p className="text-sm text-muted-foreground">This ticket is closed. Reopen it (status) to reply.</p>
              ) : (
                <>
                  <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder={internal ? "Internal note (staff only; the sales rep doesn't see it)" : "Reply (the sales rep sees it and is notified)"} className={`min-h-24 ${internal ? "border-amber-300" : ""}`} maxLength={5000} />
                  <div className="flex items-center justify-between gap-2">
                    <label className="flex items-center gap-2 text-sm">
                      <Switch checked={internal} onCheckedChange={setInternal} /> Internal note
                    </label>
                    <Button onClick={send} disabled={!body.trim() || busy === "send"}>
                      {busy === "send" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                      {internal ? "Add note" : "Send reply"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function SettingsDialog({ open, onClose }) {
  const [s, setS] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setS(null);
    api.get(`/api/helpdesk/settings`).then((r) => {
      if (r.ok) setS(r.data?.settings);
      else { ErrorMessage(r.data?.error || "Couldn't load the settings"); onClose(); }
    });
  }, [open, onClose]);

  const setTarget = (p, k, v) => setS((x) => ({ ...x, targets: { ...x.targets, [p]: { ...x.targets[p], [k]: v } } }));

  const save = async () => {
    setBusy(true);
    const targets = Object.fromEntries(PRIORITIES.map((p) => [p, { firstResponse: Number(s.targets[p].firstResponse), resolution: Number(s.targets[p].resolution) }]));
    const r = await api.put(`/api/helpdesk/settings`, { hours: s.hours, autoAssign: s.autoAssign, targets });
    setBusy(false);
    if (!r.ok) return ErrorMessage(r.data?.error || r.error || "Couldn't save");
    SuccessToast(r.data?.message || "Saved");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !busy && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Help desk settings</DialogTitle></DialogHeader>
        {!s ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Targets count</Label>
              <Select value={s.hours} onValueChange={(v) => setS((x) => ({ ...x, hours: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="business">Business hours only (Mon–Fri, 08:00–17:00)</SelectItem>
                  <SelectItem value="24/7">Round the clock (24/7)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Response targets (hours)</Label>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                <span>Priority</span><span>First response</span><span>Resolution</span>
              </div>
              {PRIORITIES.map((p) => (
                <div key={p} className="mt-2 grid grid-cols-3 items-center gap-2">
                  <span className="text-sm font-medium">{p}</span>
                  <Input type="number" min="0.25" step="0.25" value={s.targets[p].firstResponse} onChange={(e) => setTarget(p, "firstResponse", e.target.value)} aria-label={`${p} first response hours`} />
                  <Input type="number" min="0.25" step="0.25" value={s.targets[p].resolution} onChange={(e) => setTarget(p, "resolution", e.target.value)} aria-label={`${p} resolution hours`} />
                </div>
              ))}
            </div>
            <label className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm">
              <span>
                <span className="font-medium">Assign new tickets automatically</span>
                <span className="block text-xs text-muted-foreground">In turn among active help-desk officers</span>
              </span>
              <Switch checked={s.autoAssign} onCheckedChange={(v) => setS((x) => ({ ...x, autoAssign: v }))} />
            </label>
            <p className="text-xs text-muted-foreground">Changes apply to new tickets and to priority changes.</p>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button onClick={save} disabled={!s || busy}>{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
