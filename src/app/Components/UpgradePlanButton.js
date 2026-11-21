"use client";

// Upgrade Basic → Standard (Settings, admins only; the backend checks). The price comes from
// the backend (GET /api/v1/billing/upgrade): the monthly difference for every month left in
// the business's year. Paying opens Paystack; back in the app PaymentReturnNotice shows the
// result and admins get a notification once the business is on Standard.

import { useEffect, useState } from "react";
import { ArrowUpCircle, Loader2 } from "lucide-react";

import api from "@/lib/api";
import { safeUrl } from "@/lib/security/safeUrl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const naira = (n) => `₦${Math.round(Number(n) || 0).toLocaleString("en-NG")}`;

export default function UpgradePlanButton({ plan }) {
  const [open, setOpen] = useState(false);
  const [quote, setQuote] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setQuote(null);
    setError("");
    api.get("/api/v1/billing/upgrade").then((r) => {
      if (r.ok) setQuote(r.data);
      else setError(r.error || "Could not get the upgrade price.");
    });
  }, [open]);

  if (plan !== "Basic") return null;

  const pay = async () => {
    if (busy || !quote?.available) return;
    setBusy(true);
    setError("");
    const r = await api.post("/api/v1/billing/upgrade");
    const url = r.ok ? safeUrl(r.data?.url || "") : "";
    if (url && url !== "#") {
      window.location.assign(url); // Paystack checkout, then back to the app
      return;
    }
    setBusy(false);
    setError(r.error || "Could not start the payment.");
  };

  return (
    <>
      <Button type="button" size="sm" onClick={() => setOpen(true)}>
        <ArrowUpCircle className="mr-2 h-4 w-4" /> Upgrade to Standard
      </Button>
      <Dialog open={open} onOpenChange={(o) => !busy && setOpen(o)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upgrade to Standard</DialogTitle>
            <DialogDescription>Accounting, 2 more users and more warehouses, from the moment you pay.</DialogDescription>
          </DialogHeader>
          {!quote && !error && (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
          {quote && !quote.available && <p className="text-sm text-muted-foreground">{quote.reason}</p>}
          {quote?.available && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Difference per month</span>
                <span className="font-medium">{naira(quote.monthlyDifference)}</span>
              </div>
              <div className="flex justify-between">
                <span>Months left in your year (to {quote.endDate})</span>
                <span className="font-medium">{quote.months}</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-base">
                <span className="font-semibold">To pay now</span>
                <span className="font-semibold">{naira(quote.amount)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                VAT included. From your next renewal the yearly price goes up by {naira(quote.yearlyIncrease)}.
              </p>
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button type="button" onClick={pay} disabled={busy || !quote?.available}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Pay {quote?.available ? naira(quote.amount) : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
