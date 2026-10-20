"use client";

// New-business setup, reached from the signup email: /auth/SetUp/<signed token>.
//   1. Fill the profile; "Save" works once every required field is filled and stores it.
//   2. "Activate my account" (only after a successful save, with nothing unsaved) opens the
//      Paystack checkout.
//   3. Paystack sends the user back here with ?reference=…; the backend verifies the
//      payment, activates the business and emails the admin's set-your-password link.
// Backend: /api/v1/setup/:token (lib/onboarding/businessSetup.js).

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Building2, Camera, CheckCircle2, Circle, Globe, Loader2, Mail, MapPin, Package, Phone } from "lucide-react";

import api from "@/lib/api";
import Footer1 from "@/app/Components/Footer1";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const MAX_LOGO_BYTES = 1.5 * 1024 * 1024;
const FIELDS = ["companyName", "Tel", "website", "shopAddress", "companyCity", "companyState", "BusinessType", "industryType", "invoicePolicy", "clearNotification"];
const SWITCHES = [
  { key: "allowPriceChangeOnInvoice", label: "Allow price change on invoice", desc: "Staff can edit prices when creating invoices" },
  { key: "allowSkuSplitting", label: "Allow SKU splitting", desc: "Split products into smaller units" },
  { key: "monthlyCutStatement", label: "Monthly cut statement", desc: "Automatically generate monthly statements" },
  { key: "dailyReport", label: "Daily report", desc: "Send daily sales summary" },
  { key: "autoLog", label: "Auto log activity", desc: "Automatically record user actions" },
];
const naira = (n) => `₦${(Number(n) || 0).toLocaleString("en-NG")}`;

export default function BusinessSetup() {
  const { token } = useParams();
  const search = useSearchParams();
  const reference = search.get("reference") || search.get("trxref");

  const [phase, setPhase] = useState("loading"); // loading | invalid | form | verifying | activated
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(null); // last server view
  const [form, setForm] = useState(null);
  const [logo, setLogo] = useState(""); // URL or data URL
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  // optional monthly apps (when offered): add-on id → units (0 when not priced per unit)
  const [addOns, setAddOns] = useState({});
  const fileInputRef = useRef(null);

  const adopt = useCallback((view) => {
    setSaved(view);
    setForm({
      ...Object.fromEntries(FIELDS.map((k) => [k, view[k] ?? ""])),
      ...Object.fromEntries(SWITCHES.map(({ key }) => [key, Boolean(view[key])])),
    });
    setLogo(view.companyLogo || "");
    setAddOns(Object.fromEntries((view.addOns?.selected || []).map((s) => [s.id, s.units || 0])));
    setDirty(false);
  }, []);

  // load, or verify the payment when Paystack sends the user back
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (reference) {
        setPhase("verifying");
        const v = await api.post(`/api/v1/setup/${token}/verify`, { reference });
        if (cancelled) return;
        if (v.ok && v.data?.activated) {
          setSaved(v.data);
          setPhase("activated");
          return;
        }
        setNotice("");
        setError(v.error || "We could not confirm your payment yet.");
      }
      const r = await api.get(`/api/v1/setup/${token}`);
      if (cancelled) return;
      if (!r.ok) {
        setMessage(r.error || "This setup link is invalid or has expired.");
        setPhase("invalid");
        return;
      }
      if (r.data.activated) {
        setSaved(r.data);
        setPhase("activated");
        return;
      }
      adopt(r.data);
      setPhase("form");
    })();
    return () => {
      cancelled = true;
    };
  }, [token, reference, adopt]);

  const steps = useMemo(() => {
    if (!form) return [];
    const filled = (...keys) => keys.every((k) => String(form[k] || "").trim() !== "");
    return [
      { id: "logo", label: "Company Logo", completed: Boolean(logo) },
      { id: "basic", label: "Basic Information", completed: filled("companyName", "Tel") },
      { id: "address", label: "Business Address", completed: filled("shopAddress", "companyCity", "companyState") },
      { id: "details", label: "Business Details", completed: filled("BusinessType", "industryType") },
    ];
  }, [form, logo]);
  const done = (id) => steps.find((s) => s.id === id)?.completed;
  const progress = steps.length ? Math.round((steps.filter((s) => s.completed).length / steps.length) * 100) : 0;
  const allRequired = progress === 100;
  const canActivate = Boolean(saved?.setupComplete) && !dirty && !saving;
  // what activation costs: the server's total after a save; while editing, an estimate
  const offer = saved?.addOns?.offer || [];
  const chosenMonthly = offer.reduce((t, o) => (o.id in addOns ? t + o.monthly + (o.unit ? o.unit.monthly * (Number(addOns[o.id]) || 0) : 0) : t), 0);
  const payNow = dirty ? Number(saved?.amount || 0) + chosenMonthly : Number(saved?.total ?? saved?.amount ?? 0);
  const toggleAddOn = (o, on) => {
    setAddOns((cur) => {
      const next = { ...cur };
      // one app per feature: the Merchant app already includes the Delivery app, so picking one drops the other
      if (on) for (const x of offer) if (x.id !== o.id && x.id in next && (x.features || []).some((f) => (o.features || []).includes(f))) delete next[x.id];
      if (on) next[o.id] = o.unit ? Math.max(o.unit.min || 1, Number(cur[o.id]) || o.unit.min || 1) : 0;
      else delete next[o.id];
      return next;
    });
    setDirty(true);
    setNotice("");
  };
  const setUnits = (o, v) => {
    const n = Math.max(o.unit.min || 1, Math.min(o.unit.max || 500, Math.floor(Number(v)) || o.unit.min || 1));
    setAddOns((cur) => ({ ...cur, [o.id]: n }));
    setDirty(true);
  };

  const change = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setDirty(true);
    setNotice("");
  };

  const pickLogo = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) return setError("The logo must be a PNG, JPG or WebP image.");
    if (file.size > MAX_LOGO_BYTES) return setError("The logo must be smaller than 1.5 MB.");
    const reader = new FileReader();
    reader.onload = () => {
      setLogo(String(reader.result));
      setDirty(true);
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!allRequired || saving) return;
    setSaving(true);
    setError("");
    const body = {
      ...form,
      ...(logo.startsWith("data:") ? { logo } : {}),
      ...(saved?.addOns ? { addOns: Object.entries(addOns).map(([id, units]) => ({ id: Number(id), units })) } : {}),
    };
    const r = await api.patch(`/api/v1/setup/${token}`, body);
    setSaving(false);
    if (!r.ok) return setError(r.error);
    adopt(r.data);
    setNotice(r.data.setupComplete ? "Saved. You can now activate your account." : "Saved.");
  };

  const activate = async () => {
    if (!canActivate || paying) return;
    setPaying(true);
    setError("");
    const r = await api.post(`/api/v1/setup/${token}/pay`);
    if (!r.ok || !r.data?.url) {
      setPaying(false);
      return setError(r.error || "Could not start the payment.");
    }
    window.location.assign(r.data.url); // Paystack checkout, then back here
  };

  if (phase === "loading" || phase === "verifying") {
    return (
      <Centered>
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="text-sm text-muted-foreground">{phase === "verifying" ? "Confirming your payment…" : "Loading your setup…"}</p>
      </Centered>
    );
  }
  if (phase === "invalid") {
    return (
      <Centered>
        <p className="font-medium">{message}</p>
        <ResendLink />
      </Centered>
    );
  }
  if (phase === "activated") {
    return (
      <Centered>
        <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        <h1 className="text-xl font-semibold">Your account is active</h1>
        <p className="max-w-md text-center text-sm text-muted-foreground">
          We&apos;ve sent <b>{saved?.email}</b> a welcome message and a link to set your admin password. The link is valid for
          48 hours.
        </p>
        <Button asChild>
          <Link href="/Login">Go to login</Link>
        </Button>
      </Centered>
    );
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background">
      <div className="relative mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-8 sm:mb-10">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Business Profile Setup</h1>
          <p className="mt-2 text-muted-foreground">
            Complete the required fields and save, then activate your {saved.plan} plan ({naira(payNow)}{saved.addOns && Object.keys(addOns).length ? " with your extra apps" : ""}).
          </p>
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Setup Progress</span>
              <span className="text-muted-foreground">{progress}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
              {steps.map((step) => (
                <div key={step.id} className="flex items-center gap-1.5 text-xs sm:text-sm">
                  {step.completed ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                  <span className={step.completed ? "font-medium text-foreground" : "text-muted-foreground"}>{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={save} className="space-y-8">
          <Card className="relative overflow-hidden border shadow-sm">
            <div className="absolute inset-x-0 top-0 h-1 bg-foreground" />
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>Business Information</CardTitle>
                  <CardDescription>This information appears on invoices, receipts and customer-facing documents.</CardDescription>
                </div>
                {done("basic") && done("logo") && <Done label="Completed" />}
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 rounded-xl ring-2 ring-background shadow-md">
                    {logo ? (
                      <AvatarImage src={logo} alt="Company logo" className="object-cover" />
                    ) : (
                      <AvatarFallback className="rounded-xl bg-muted">
                        <Building2 className="h-10 w-10 text-muted-foreground" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-foreground text-background shadow-md transition hover:scale-110"
                    aria-label="Upload logo"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={pickLogo} />
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-medium">
                    Company Logo <span className="text-destructive">*</span>
                  </p>
                  <p className="text-sm text-muted-foreground">Square, at least 400×400px. PNG, JPG or WebP, up to 1.5 MB.</p>
                  <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => fileInputRef.current?.click()}>
                    {logo ? "Change logo" : "Upload logo"}
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Company Name" required>
                  <Input name="companyName" value={form.companyName} onChange={(e) => change("companyName", e.target.value)} placeholder="Enter company name" />
                </Field>
                <Field label="Email">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input className="pl-9" value={saved.email} readOnly disabled />
                  </div>
                </Field>
              </div>
              <Field label="Phone Number" required>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-9" value={form.Tel} onChange={(e) => change("Tel", e.target.value)} placeholder="Enter phone number" />
                </div>
              </Field>
              <Field label="Website">
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-9" value={form.website} onChange={(e) => change("website", e.target.value)} placeholder="e.g. www.yourbusiness.com" />
                </div>
              </Field>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="flex items-center gap-2 text-sm font-medium">
                    <MapPin className="h-4 w-4" /> Business Address
                  </h3>
                  {done("address") && <Done label="Done" />}
                </div>
                <Field label="Street Address" required>
                  <Textarea value={form.shopAddress} onChange={(e) => change("shopAddress", e.target.value)} placeholder="Enter street address" className="min-h-[80px] resize-none" />
                </Field>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field label="City" required>
                    <Input value={form.companyCity} onChange={(e) => change("companyCity", e.target.value)} placeholder="Enter city" />
                  </Field>
                  <Field label="State" required>
                    <Input value={form.companyState} onChange={(e) => change("companyState", e.target.value)} placeholder="Enter state" />
                  </Field>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-medium">Business Details</h3>
                  {done("details") && <Done label="Done" />}
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field label="Business Type" required>
                    <Select value={form.BusinessType} onValueChange={(v) => change("BusinessType", v)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        {["Business", "Individual", "Partnership", "LLC"].map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Industry" required>
                    <Input value={form.industryType} onChange={(e) => change("industryType", e.target.value)} placeholder="e.g. FMCG distribution" />
                  </Field>
                </div>
              </div>

              <Field label="Invoice Policy / Footer Note">
                <Textarea value={form.invoicePolicy} onChange={(e) => change("invoicePolicy", e.target.value)} placeholder="Enter invoice footer note" className="min-h-[80px] resize-none" />
              </Field>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border shadow-sm">
            <div className="absolute inset-x-0 top-0 h-1 bg-foreground" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" /> Included in your {saved.plan} plan
              </CardTitle>
              <CardDescription>These apps are installed when your account is activated.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {saved.modules.map((m) => (
                  <div key={m.Name} className="flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                      <img src={m.icon} alt="" className="h-8 w-8 object-contain" />
                    </div>
                    <div>
                      <h4 className="font-semibold tracking-tight">{m.Name}</h4>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{m.Description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {offer.length > 0 && (
            <Card className="relative overflow-hidden border shadow-sm">
              <div className="absolute inset-x-0 top-0 h-1 bg-foreground" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" /> Add more apps <span className="text-sm font-normal text-muted-foreground">(optional, monthly)</span>
                </CardTitle>
                <CardDescription>Pick extra apps now: you pay their first month today, then month by month under Billing. You can add or stop them later.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {offer.map((o) => {
                  const on = o.id in addOns;
                  const monthly = o.monthly + (o.unit && on ? o.unit.monthly * (Number(addOns[o.id]) || 0) : 0);
                  return (
                    <div key={o.id} className={`rounded-xl border px-4 py-3 ${on ? "border-foreground/40 bg-muted/40" : "bg-card"}`}>
                      <div className="flex items-start gap-3">
                        {o.icon ? <img src={o.icon} alt="" className="mt-0.5 h-8 w-8 shrink-0 object-contain" /> : null}
                        <div className="min-w-0 flex-1">
                          <Label htmlFor={`addon-${o.id}`} className="cursor-pointer font-semibold">{o.name}</Label>
                          {o.description && <p className="text-sm text-muted-foreground">{o.description}</p>}
                          {o.includes?.length > 1 && <p className="mt-1 text-xs text-muted-foreground">Includes: {o.includes.join(", ")}</p>}
                          <p className="mt-1 text-sm">
                            {o.monthly > 0 || (o.unit && o.unit.monthly > 0) ? (
                              <>
                                {o.monthly > 0 ? `${naira(o.monthly)}/month` : ""}
                                {o.unit ? `${o.monthly > 0 ? " + " : ""}${naira(o.unit.monthly)} per ${o.unit.name}${o.monthly > 0 ? "" : "/month"}` : ""}
                                {o.smsPrice ? ` · SMS ${naira(o.smsPrice)} each from your SMS credit` : ""}
                              </>
                            ) : (
                              <span className="text-muted-foreground">Price to be confirmed</span>
                            )}
                          </p>
                        </div>
                        <Switch id={`addon-${o.id}`} className="shrink-0" checked={on} onCheckedChange={(c) => toggleAddOn(o, c)} />
                      </div>
                      {on && o.unit && (
                        <div className="mt-3 flex flex-wrap items-center gap-3 pl-0 sm:pl-11">
                          <Label htmlFor={`addon-units-${o.id}`} className="text-sm capitalize">{o.unit.plural}</Label>
                          <Input id={`addon-units-${o.id}`} type="number" min={o.unit.min} max={o.unit.max} value={addOns[o.id]} onChange={(e) => setUnits(o, e.target.value)} className="w-24" />
                          <span className="text-sm text-muted-foreground">{naira(monthly)}/month</span>
                        </div>
                      )}
                    </div>
                  );
                })}
                {saved.addOns?.lines?.length > 1 && !dirty && (
                  <div className="rounded-xl border bg-muted/30 p-4 text-sm">
                    {saved.addOns.lines.map((l) => (
                      <div key={l.name} className="flex justify-between gap-3 py-0.5">
                        <span className="text-muted-foreground">{l.name}</span>
                        <span>{naira(l.amount)}</span>
                      </div>
                    ))}
                    <Separator className="my-2" />
                    <div className="flex justify-between gap-3 font-semibold">
                      <span>Due today</span>
                      <span>{naira(saved.total)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="relative overflow-hidden border shadow-sm">
            <div className="absolute inset-x-0 top-0 h-1 bg-foreground" />
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Control how your system behaves. (Optional)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {SWITCHES.map((item) => (
                  <div key={item.key} className="flex items-center justify-between gap-4 rounded-xl border bg-muted/40 px-4 py-3">
                    <div className="min-w-0 space-y-0.5">
                      <Label htmlFor={item.key} className="cursor-pointer">
                        {item.label}
                      </Label>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch id={item.key} className="shrink-0" checked={form[item.key]} onCheckedChange={(c) => change(item.key, c)} />
                  </div>
                ))}
              </div>
              <div className="space-y-2 pt-2">
                <Label>Clear notifications</Label>
                <Select value={form.clearNotification || "never"} onValueChange={(v) => change("clearNotification", v === "never" ? "" : v)}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 border-t bg-muted/30 px-4 py-4 sm:px-6">
              {error && <p className="w-full text-sm text-red-600">{error}</p>}
              {notice && <p className="w-full text-sm text-emerald-700">{notice}</p>}
              {!allRequired && <p className="w-full text-xs text-muted-foreground">Fill every field marked * to save.</p>}
              {dirty && saved.setupComplete && <p className="w-full text-xs text-muted-foreground">You have unsaved changes. Save them before activating.</p>}
              <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button type="submit" variant="outline" disabled={!allRequired || saving || (!dirty && saved.setupComplete)}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {saving ? "Saving…" : "Save"}
                </Button>
                <Button type="button" onClick={activate} disabled={!canActivate || paying}>
                  {paying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Activate my account{payNow ? ` · ${naira(payNow)}` : ""}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </form>
      </div>
      <Footer1 />
    </div>
  );
}

// expired or broken link: email a new one (the answer never says whether the email exists)
function ResendLink() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null); // { ok, text }

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim() || busy) return;
    setBusy(true);
    const r = await api.post("/api/v1/setup/resend", { email: email.trim() });
    setBusy(false);
    setResult(r.ok ? { ok: true, text: r.data?.data } : { ok: false, text: r.error });
  };

  if (result?.ok) return <p className="max-w-sm text-sm text-emerald-700">{result.text}</p>;
  return (
    <form onSubmit={submit} className="flex w-full max-w-sm flex-col gap-2">
      <p className="text-sm text-muted-foreground">Enter the email you signed up with and we&apos;ll send you a new link.</p>
      <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Business email" />
      {result && <p className="text-sm text-red-600">{result.text}</p>}
      <Button type="submit" disabled={busy}>
        {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Send me a new link
      </Button>
    </form>
  );
}

function Field({ label, required, children }) {
  return (
    <div className="space-y-2">
      <Label>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}

function Done({ label }) {
  return (
    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
      <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
      {label}
    </Badge>
  );
}

function Centered({ children }) {
  return <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-4 text-center">{children}</div>;
}
