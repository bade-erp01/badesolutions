"use client";

// Where Paystack sends the customer back after paying (…/pay/result?reference=…): the backend
// confirms the payment with Paystack and posts it (lib/subscriptions/payments.js confirm).

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import api from "@/lib/api";

function Result() {
  const params = useSearchParams();
  const reference = params.get("reference") || params.get("trxref") || "";
  const [state, setState] = useState({ loading: true });

  useEffect(() => {
    if (!reference) {
      setState({ loading: false, ok: false, message: "No payment reference was given." });
      return;
    }
    let live = true;
    api.post("/api/v1/pay-confirm", { reference }).then((r) => {
      if (!live) return;
      if (!r.ok) return setState({ loading: false, ok: false, message: r.data?.error || r.error || "The payment could not be confirmed." });
      const done = r.data.status === "posted" || r.data.status === "already";
      setState({
        loading: false,
        ok: done,
        business: r.data.business,
        message: done ? "Payment received. Thank you!" : `Paystack reports this payment as "${r.data.paystackStatus || r.data.status}". If you were charged, it will be applied automatically.`,
      });
    });
    return () => { live = false; };
  }, [reference]);

  return (
    <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm text-center space-y-3">
      {state.loading ? (
        <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Confirming your payment…</p>
      ) : (
        <>
          {state.ok ? <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" /> : <XCircle className="h-10 w-10 text-destructive mx-auto" />}
          {state.business && <p className="text-sm text-muted-foreground">{state.business}</p>}
          <p className="font-medium">{state.message}</p>
          {reference && <p className="text-xs text-muted-foreground font-mono break-all">Reference {reference}</p>}
        </>
      )}
    </div>
  );
}

export default function PayResultPage() {
  return (
    <main className="min-h-dvh flex items-center justify-center bg-muted/40 p-4">
      <Suspense fallback={<Loader2 className="h-5 w-5 animate-spin" />}>
        <Result />
      </Suspense>
    </main>
  );
}
