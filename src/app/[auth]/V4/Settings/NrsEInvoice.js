"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, ShieldCheck, Trash2 } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ErrorMessage, SuccessToast } from "../../../../../Functions/Mics";

const reportHostPattern = /^https:\/\/(?:[a-z0-9-]+\.)*nrs\.gov\.ng(?::\d+)?(?:\/[^\s]*)?$/i;

export default function NrsEInvoice({ isAdmin }) {
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState({
    enabled: false,
    baseUrl: "",
    serviceId: "",
    sellerTin: "",
    apiKey: "",
    apiSecret: "",
  });
  const [busy, setBusy] = useState("");
  const [problem, setProblem] = useState("");

  const load = async () => {
    const response = await api.get("/api/NrsEInvoice");
    if (!response.ok) {
      setProblem(response.error || "Could not load NRS settings");
      return;
    }
    const data = response.data?.data || {};
    setSettings(data);
    setForm({
      enabled: data.enabled === true,
      baseUrl: data.baseUrl || "",
      serviceId: data.serviceId || "",
      sellerTin: data.sellerTin || "",
      apiKey: "",
      apiSecret: "",
    });
    setProblem("");
  };

  useEffect(() => {
    load();
  }, []);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const save = async (event) => {
    event.preventDefault();
    setProblem("");
    if (form.enabled && (!form.baseUrl || !form.serviceId || !form.sellerTin)) {
      setProblem("Enter the NRS Report Host, Service ID, and seller Tax ID before enabling reporting.");
      return;
    }
    if (form.baseUrl && !reportHostPattern.test(form.baseUrl.trim())) {
      setProblem("Use the HTTPS Report Host provided in your NRS taxpayer dashboard.");
      return;
    }
    setBusy("save");
    const response = await api.put("/api/NrsEInvoice", {
      enabled: form.enabled,
      baseUrl: form.baseUrl.trim(),
      serviceId: form.serviceId.trim(),
      sellerTin: form.sellerTin.trim(),
      ...(form.apiKey ? { apiKey: form.apiKey.trim() } : {}),
      ...(form.apiSecret ? { apiSecret: form.apiSecret.trim() } : {}),
    });
    setBusy("");
    if (!response.ok) {
      setProblem(response.error || "NRS settings could not be saved");
      return;
    }
    setForm((current) => ({ ...current, apiKey: "", apiSecret: "" }));
    SuccessToast(response.data?.message || "NRS settings saved");
    await load();
  };

  const remove = async () => {
    setBusy("remove");
    const response = await api.del("/api/NrsEInvoice");
    setBusy("");
    if (!response.ok) {
      setProblem(response.error || "NRS settings could not be removed");
      return;
    }
    SuccessToast(response.data?.message || "NRS settings removed");
    await load();
  };

  if (!settings) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading NRS settings…
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold">NRS e-invoicing</h2>
        <p className="text-sm text-muted-foreground">
          Connect this business&rsquo;s NRS taxpayer account to report eligible finalized invoices from BADE.
          Credentials are encrypted and never shown after saving.
        </p>
      </header>

      <div className="flex items-start gap-3 rounded-md border p-4 text-sm">
        {settings.configured ? (
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
        ) : (
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        )}
        <div>
          <p className="font-medium">{settings.enabled ? "NRS reporting is enabled" : settings.configured ? "NRS account connected" : "Not connected"}</p>
          <p className="mt-1 text-muted-foreground">
            {settings.configured
              ? `API key ${settings.hasApiKey ? "saved" : "missing"} · API secret ${settings.hasApiSecret ? "saved" : "missing"}`
              : "Add the NRS details below to configure this business."}
          </p>
        </div>
      </div>

      {isAdmin ? (
        <form onSubmit={save} className="space-y-5 rounded-md border p-4 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <Label htmlFor="nrs-enabled">Enable NRS reporting</Label>
              <p className="text-xs text-muted-foreground">Invoice reporting remains a deliberate admin/accountant action.</p>
            </div>
            <Switch id="nrs-enabled" checked={form.enabled} onCheckedChange={(checked) => set("enabled", checked)} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="nrs-host">NRS Report Host</Label>
              <Input id="nrs-host" type="url" inputMode="url" autoComplete="url" value={form.baseUrl} onChange={(event) => set("baseUrl", event.target.value)} placeholder="https://report-host.nrs.gov.ng" />
              <p className="text-xs text-muted-foreground">Copy the Report Host shown in this taxpayer&rsquo;s NRS dashboard.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nrs-service-id">NRS Service ID</Label>
              <Input id="nrs-service-id" autoComplete="off" maxLength={8} value={form.serviceId} onChange={(event) => set("serviceId", event.target.value.toUpperCase())} placeholder="8 characters" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nrs-tax-id">Business Tax ID</Label>
              <Input id="nrs-tax-id" autoComplete="off" maxLength={80} value={form.sellerTin} onChange={(event) => set("sellerTin", event.target.value)} placeholder="Tax ID registered with NRS" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nrs-api-key">NRS API key</Label>
              <Input id="nrs-api-key" type="password" autoComplete="new-password" value={form.apiKey} onChange={(event) => set("apiKey", event.target.value)} placeholder={settings.hasApiKey ? "Saved; leave blank to keep" : "Paste API key"} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nrs-api-secret">NRS API secret</Label>
              <Input id="nrs-api-secret" type="password" autoComplete="new-password" value={form.apiSecret} onChange={(event) => set("apiSecret", event.target.value)} placeholder={settings.hasApiSecret ? "Saved; leave blank to keep" : "Paste API secret"} />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Find the API key and secret in the NRS e-invoicing dashboard. BADE does not display saved credentials. Currently, reporting supports finalized invoices with one non-zero VAT rate and a buyer Tax ID.
          </p>
          {problem && <p className="text-sm text-destructive" role="alert">{problem}</p>}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={Boolean(busy)}>
              {busy === "save" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {busy === "save" ? "Saving…" : "Save NRS settings"}
            </Button>
            {settings.configured && (
              <Button type="button" variant="outline" disabled={Boolean(busy)} onClick={remove}>
                {busy === "remove" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                {busy === "remove" ? "Removing…" : "Remove connection"}
              </Button>
            )}
          </div>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">Only a business admin can configure NRS credentials.</p>
      )}

      {problem && !isAdmin && <p className="text-sm text-destructive" role="alert">{problem}</p>}
    </section>
  );
}