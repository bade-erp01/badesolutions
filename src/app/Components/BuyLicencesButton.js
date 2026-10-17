"use client";

// Buy extra user licences: Paystack checkout for N users (admins only; the backend checks).
// Price per user comes from the backend (GET /api/v1/plans); the backend also decides what
// is charged. After paying, Paystack returns to the app and PaymentReturnNotice shows the
// result; admins also get an in-app notification when the licences are added.

import { useEffect, useState } from "react";
import { Loader2, UserPlus } from "lucide-react";

import api from "@/lib/api";
import { safeUrl } from "@/lib/security/safeUrl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const MAX_USERS = 200;
const VAT = 0.075;
const naira = (n) => `₦${Math.round(Number(n) || 0).toLocaleString("en-NG")}`;

export default function BuyLicencesButton({ plan, label = "Buy licences", size = "sm", variant = "outline" }) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState("1");
  const [perUserMonthly, setPerUserMonthly] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || perUserMonthly != null) return;
    api.get("/api/v1/plans").then((r) => {
      const p = r.ok ? r.data?.plans?.find((x) => x.name === plan) : null;
      if (p?.extraUserMonthly) setPerUserMonthly(p.extraUserMonthly);
    });
  }, [open, plan, perUserMonthly]);

  const n = Number(users);
  const valid = Number.isInteger(n) && n >= 1 && n <= MAX_USERS;
  const total = valid && perUserMonthly ? perUserMonthly * n * 12 * (1 + VAT) : null;

  const pay = async () => {
    if (!valid || busy) return;
    setBusy(true);
    setError("");
    const r = await api.post("/api/v1/billing/licences", { users: n });
    const url = r.ok ? safeUrl(r.data?.url || "") : "";
    if (url && url !== "#") {
      window.location.assign(url); // Paystack checkout, then back to the app
      return;
    }
    setBusy(false);
    setError(r.error || "Could not start the payment.");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); setError(""); }}>
      <DialogTrigger asChild>
        <Button size={size} variant={variant}>
          <UserPlus className="mr-1.5 h-4 w-4" /> {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buy user licences</DialogTitle>
          <DialogDescription>
            Each licence lets you add one more user. It is billed for a year and added to your yearly renewal.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="licence-users">Number of users</Label>
          <Input
            id="licence-users"
            type="number"
            inputMode="numeric"
            min={1}
            max={MAX_USERS}
            value={users}
            onChange={(e) => setUsers(e.target.value)}
          />
          {!valid && <p className="text-xs text-red-600">Enter a whole number from 1 to {MAX_USERS}.</p>}
        </div>

        <div className="rounded-lg border bg-muted/40 p-3 text-sm">
          {perUserMonthly ? (
            <>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">
                  {naira(perUserMonthly)} × {valid ? n : "–"} user{n === 1 ? "" : "s"} × 12 months + 7.5% VAT
                </span>
              </div>
              <div className="mt-1 flex justify-between gap-2 font-semibold">
                <span>Total</span>
                <span>{total ? naira(total) : "–"}</span>
              </div>
            </>
          ) : (
            <span className="text-muted-foreground">Loading price…</span>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={pay} disabled={!valid || busy}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Pay with Paystack
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
