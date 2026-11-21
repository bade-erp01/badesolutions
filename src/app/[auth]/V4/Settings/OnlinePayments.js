"use client";

// Online payments into the business's OWN Paystack account: customers pay subscription invoices
// and contract instalments from a link (and may save a card for automatic charges).
// Backend: lib/subscriptions/payments.js, /api/subscriptions/payments/settings.

import { useEffect, useState } from "react";
import { CheckCircle2, Copy, Loader2, ShieldCheck, Trash2 } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ErrorMessage, SuccessToast } from "../../../../../Functions/Mics";

export default function OnlinePayments({ isAdmin }) {
  const [settings, setSettings] = useState(null);
  const [problem, setProblem] = useState("");
  const [banks, setBanks] = useState([]);
  const [form, setForm] = useState({ publicKey: "", secretKey: "", bankAccountId: "", enabled: false });
  const [busy, setBusy] = useState("");

  const load = async () => {
    const r = await api.get("/api/subscriptions/payments/settings");
    if (!r.ok) {
      setProblem(r.data?.error || r.error || "Could not load the payment settings");
      return;
    }
    setProblem("");
    setSettings(r.data);
    setForm({ publicKey: r.data.publicKey || "", secretKey: "", bankAccountId: r.data.bankAccountId || "", enabled: r.data.enabled });
  };

  useEffect(() => {
    if (!isAdmin) return;
    load();
    api.get("/api/Bank/Accounts").then((r) => { if (r.ok && Array.isArray(r.data)) setBanks(r.data); });
  }, [isAdmin]);

  const save = async () => {
    setBusy("save");
    const body = { publicKey: form.publicKey, bankAccountId: form.bankAccountId || undefined, enabled: form.enabled };
    if (form.secretKey.trim()) body.secretKey = form.secretKey.trim();
    const r = await api.put("/api/subscriptions/payments/settings", body);
    setBusy("");
    if (!r.ok) return ErrorMessage(r.data?.error || r.error || "Not saved");
    SuccessToast(r.data?.message || "Saved");
    setSettings(r.data.settings);
    setForm((f) => ({ ...f, secretKey: "", enabled: r.data.settings.enabled }));
  };

  const disconnect = async () => {
    if (!window.confirm("Disconnect Paystack? Pay links stop working and saved cards can no longer be charged.")) return;
    setBusy("remove");
    const r = await api.del("/api/subscriptions/payments/settings");
    setBusy("");
    if (!r.ok) return ErrorMessage(r.data?.error || r.error || "Not removed");
    SuccessToast("Paystack disconnected");
    load();
  };

  if (!isAdmin) return null;
  if (problem) return <p className="text-sm text-destructive">{problem}</p>;
  if (!settings) return <p className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</p>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold">Online payments (Paystack)</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Connect your own Paystack account so customers can pay subscription invoices and contract instalments from a link, straight into your account.
          Customers can choose to save their card; saved cards are charged automatically on each new invoice or due instalment. Payments are posted to the customer&apos;s account automatically.
        </p>
      </div>

      <div className="rounded-lg border p-4 flex items-start gap-3">
        {settings.connected ? <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" /> : <ShieldCheck className="h-5 w-5 text-muted-foreground mt-0.5" />}
        <div className="text-sm">
          {settings.connected ? (
            <p>
              Connected in <b>{settings.mode === "live" ? "live" : "test"}</b> mode{settings.connectedAt ? ` since ${new Date(settings.connectedAt).toLocaleDateString()}` : ""}.{" "}
              {settings.enabled ? "Customers can pay online." : "Online payment is switched off."}
            </p>
          ) : (
            <p>Not connected. Enter your Paystack keys (Paystack dashboard → Settings → API Keys &amp; Webhooks).</p>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="pk">Public key</Label>
          <Input id="pk" placeholder="pk_live_…" value={form.publicKey} onChange={(e) => setForm({ ...form, publicKey: e.target.value })} autoComplete="off" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sk">Secret key {settings.connected && <span className="text-muted-foreground font-normal">(saved; enter a new one only to replace it)</span>}</Label>
          <Input id="sk" type="password" placeholder={settings.connected ? "••••••••" : "sk_live_…"} value={form.secretKey} onChange={(e) => setForm({ ...form, secretKey: e.target.value })} autoComplete="new-password" />
          <p className="text-xs text-muted-foreground">Checked with Paystack before it is saved, stored encrypted, and never shown again.</p>
        </div>
        <div className="space-y-2">
          <Label>Bank account your Paystack payouts go into</Label>
          <Select value={form.bankAccountId || undefined} onValueChange={(v) => setForm({ ...form, bankAccountId: v })}>
            <SelectTrigger><SelectValue placeholder="Choose the bank account" /></SelectTrigger>
            <SelectContent>
              {banks.map((b) => <SelectItem key={b._id} value={String(b._id)}>{b.NAME || b.name || String(b._id).slice(-6)}</SelectItem>)}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Online payments are posted to this account (Dr Bank, Cr Accounts Receivable), like a payment posted by your accountant.</p>
        </div>
        <div className="flex items-center gap-3">
          <Switch id="on" checked={form.enabled} onCheckedChange={(v) => setForm({ ...form, enabled: v })} />
          <Label htmlFor="on">Customers can pay online</Label>
        </div>
      </div>

      <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
        <p className="text-sm font-medium">Webhook (recommended)</p>
        <p className="text-xs text-muted-foreground">In your Paystack dashboard, set this as the webhook URL, so payments are posted even when a customer closes the page before returning.</p>
        <div className="flex gap-2">
          <Input readOnly value={settings.webhookUrl} className="font-mono text-xs" />
          <Button type="button" variant="outline" size="icon" onClick={() => { navigator.clipboard?.writeText(settings.webhookUrl); SuccessToast("Copied"); }}><Copy className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={save} disabled={busy !== ""}>{busy === "save" ? "Checking with Paystack…" : "Save"}</Button>
        {settings.connected && (
          <Button variant="outline" onClick={disconnect} disabled={busy !== ""} className="gap-2"><Trash2 className="h-4 w-4" /> Disconnect</Button>
        )}
      </div>
    </div>
  );
}
