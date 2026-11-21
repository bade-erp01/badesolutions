"use client";

// Public pay page: a customer pays a subscription invoice or a contract instalment into the
// business's own Paystack account (backend: lib/subscriptions/payments.js). The signed token in
// the link is the permission; nobody logs in.

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const naira = (n) => `₦${Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function PayPage() {
  const { token } = useParams();
  const [info, setInfo] = useState(null);
  const [problem, setProblem] = useState("");
  const [email, setEmail] = useState("");
  const [saveCard, setSaveCard] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let live = true;
    api.get(`/api/v1/pay/${encodeURIComponent(token)}`).then((r) => {
      if (!live) return;
      if (!r.ok) setProblem(r.data?.error || r.error || "This payment link can't be opened.");
      else setInfo(r.data);
    });
    return () => { live = false; };
  }, [token]);

  const pay = async () => {
    setBusy(true);
    const r = await api.post(`/api/v1/pay/${encodeURIComponent(token)}/start`, { saveCard, ...(info.needsEmail ? { email } : {}) });
    if (!r.ok || !r.data?.url) {
      setBusy(false);
      setProblem(r.data?.error || r.error || "The payment could not be started.");
      return;
    }
    window.location.assign(r.data.url);
  };

  return (
    <main className="min-h-dvh flex items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm space-y-5">
        {!info && !problem && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</p>
        )}
        {problem && <p className="text-sm text-destructive">{problem}</p>}
        {info && (
          <>
            <div>
              <p className="text-sm text-muted-foreground">{info.business}</p>
              <h1 className="text-xl font-semibold mt-1">{info.what}</h1>
              {info.customer && <p className="text-sm text-muted-foreground mt-1">For {info.customer}</p>}
            </div>
            {info.paid ? (
              <p className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 p-3 text-sm">This is already paid. Thank you.</p>
            ) : (
              <>
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm text-muted-foreground">Amount to pay</p>
                  <p className="text-3xl font-bold mt-1">{naira(info.amount)}</p>
                </div>
                {info.needsEmail && (
                  <div className="space-y-2">
                    <Label htmlFor="email">Your email (for the receipt)</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                  </div>
                )}
                {info.canSaveCard && (
                  <label className="flex items-start gap-3 text-sm cursor-pointer">
                    <Checkbox checked={saveCard} onCheckedChange={(v) => setSaveCard(Boolean(v))} className="mt-0.5" />
                    <span>
                      Save my card with Paystack and charge it automatically for my next invoices or instalments from {info.business}.
                      <span className="block text-xs text-muted-foreground mt-1">You can ask {info.business} to remove the card at any time.</span>
                    </span>
                  </label>
                )}
                {info.cardOnFile && <p className="text-xs text-muted-foreground">Card on file: {info.cardOnFile}</p>}
                <Button className="w-full h-11" onClick={pay} disabled={busy || (info.needsEmail && !email.trim())}>
                  {busy ? "Opening Paystack…" : `Pay ${naira(info.amount)}`}
                </Button>
              </>
            )}
            <p className="flex items-center gap-2 text-xs text-muted-foreground"><Lock className="h-3.5 w-3.5" /> Secured by Paystack. Your card details never reach {info.business} or BADE.</p>
          </>
        )}
      </div>
    </main>
  );
}
