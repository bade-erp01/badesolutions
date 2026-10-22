"use client";

// Settings → Email sending: the business sends its emails (to customers and staff) from its
// own mailbox. When none is set up, or it stops working, emails go out through BADE's account
// under the business's name, so nothing is lost.
//   GET    /api/EmailSending        current settings (the password is never sent back)
//   PUT    /api/EmailSending        check (log in + test email) and save
//   POST   /api/EmailSending/test   test the saved settings
//   DELETE /api/EmailSending        back to BADE's account

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ErrorMessage, SuccessToast } from "../../../../../Functions/Mics";

const selectCls =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base sm:text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

// Each provider: its server settings and the exact steps to get a password that works.
const PROVIDERS = {
  zoho: {
    label: "Zoho Mail",
    host: "smtp.zoho.com",
    port: 465,
    security: "ssl",
    userHint: "Your full Zoho email address",
    passLabel: "App password",
    steps: [
      "Sign in at accounts.zoho.com and open Security → App Passwords. (If you don't use two-step verification, your normal Zoho password also works, but an app password is safer.)",
      "Click “Generate New Password”, name it “BADE”, and copy the password Zoho shows you. You won't see it again.",
      "Server: use smtp.zoho.com for a personal Zoho address. If your business email uses your own domain on Zoho (e.g. sales@yourcompany.com), use smtppro.zoho.com. If your Zoho account is in Europe, India or Australia, use smtp.zoho.eu / smtp.zoho.in / smtp.zoho.com.au (or smtppro.zoho.eu, …).",
      "Username and “From” address: your Zoho email address. Paste the app password below.",
    ],
    note: "Zoho's free plan may not allow sending from other apps. If the test says the login was refused, check your Zoho plan includes SMTP access (Mail Lite and above do).",
  },
  google: {
    label: "Gmail / Google Workspace",
    host: "smtp.gmail.com",
    port: 465,
    security: "ssl",
    userHint: "Your full Gmail or Google Workspace address",
    passLabel: "App password (16 letters)",
    steps: [
      "Go to myaccount.google.com → Security and turn on 2-Step Verification (Google only gives app passwords to accounts with it on).",
      "Open myaccount.google.com/apppasswords, type “BADE” as the app name and click Create.",
      "Copy the 16-letter password Google shows (spaces don't matter). Your normal Gmail password will NOT work here.",
      "Username and “From” address: your Gmail / Workspace address. To send from another address, first add it in Gmail → Settings → Accounts → “Send mail as”.",
    ],
    note: "Google Workspace admins may need to allow app passwords for the organisation. Gmail sends up to about 500 emails a day (Workspace about 2,000); beyond that, emails go out through BADE's account.",
  },
  microsoft: {
    label: "Microsoft 365 / Outlook (business)",
    host: "smtp.office365.com",
    port: 587,
    security: "starttls",
    userHint: "Your full Microsoft 365 email address",
    passLabel: "Password or app password",
    steps: [
      "Your Microsoft 365 admin must allow it: Microsoft 365 admin center → Users → Active users → select the mailbox → Mail → Manage email apps → tick “Authenticated SMTP” → Save.",
      "If the account uses multi-factor sign-in, create an app password at mysignins.microsoft.com → Security info → Add sign-in method → App password (only if your organisation allows app passwords).",
      "Username and “From” address: the mailbox's email address.",
    ],
    note: "Microsoft is phasing out password sign-in for sending from other apps, so this may stop working for your organisation. Personal Outlook.com / Hotmail addresses no longer accept passwords and can't be used. If the test fails, use another provider or a sending service such as Brevo.",
  },
  yahoo: {
    label: "Yahoo Mail",
    host: "smtp.mail.yahoo.com",
    port: 465,
    security: "ssl",
    userHint: "Your full Yahoo email address",
    passLabel: "App password",
    steps: [
      "Sign in to Yahoo, open Account info → Account security.",
      "Click “Generate app password”, name it “BADE”, and copy the password.",
      "Username and “From” address: your Yahoo email address.",
    ],
  },
  brevo: {
    label: "Brevo (Sendinblue)",
    host: "smtp-relay.brevo.com",
    port: 587,
    security: "starttls",
    userHint: "The SMTP login shown in Brevo (looks like 1a2b3c@smtp-brevo.com)",
    passLabel: "SMTP key",
    steps: [
      "In Brevo, open Senders, Domains & Dedicated IPs → add and verify the address you'll send from (and authenticate your domain so emails don't go to spam).",
      "Open SMTP & API → SMTP tab → “Generate a new SMTP key”, and copy it.",
      "Username: the “Login” shown on that page (not your Brevo email). Password: the SMTP key. “From” address: the sender you verified.",
    ],
    note: "Good for businesses that send a lot of email: Brevo's free plan allows 300 emails a day.",
  },
  sendgrid: {
    label: "SendGrid",
    host: "smtp.sendgrid.net",
    port: 587,
    security: "starttls",
    userHint: "Type exactly: apikey",
    passLabel: "API key",
    steps: [
      "In SendGrid, open Settings → Sender Authentication and verify your sender address or domain.",
      "Open Settings → API Keys → Create API Key, give it “Mail Send” access, and copy the key (it starts with SG.).",
      "Username: the word apikey (exactly that). Password: the API key. “From” address: the sender you verified.",
    ],
  },
  mailgun: {
    label: "Mailgun",
    host: "smtp.mailgun.org",
    port: 587,
    security: "starttls",
    userHint: "The SMTP login from your Mailgun domain (e.g. postmaster@mg.yourcompany.com)",
    passLabel: "SMTP password",
    steps: [
      "In Mailgun, open Sending → Domains → your domain → SMTP credentials, and create (or reset) a login and password.",
      "Server: smtp.mailgun.org, or smtp.eu.mailgun.org if your Mailgun account is in the EU region.",
      "Username: that SMTP login. Password: its password. “From” address: an address on that domain.",
    ],
  },
  ses: {
    label: "Amazon SES",
    host: "email-smtp.us-east-1.amazonaws.com",
    port: 587,
    security: "starttls",
    userHint: "The SMTP username created in SES (not your AWS access key)",
    passLabel: "SMTP password",
    steps: [
      "In the Amazon SES console, verify the address or domain you'll send from (Configuration → Identities).",
      "Open SMTP settings → Create SMTP credentials, and download them.",
      "Server: the SMTP endpoint for your region shown on that page (e.g. email-smtp.eu-west-1.amazonaws.com). Username and password: the SMTP credentials you downloaded.",
    ],
    note: "New SES accounts are in a “sandbox” and can only send to verified addresses until you ask AWS for production access.",
  },
  hosting: {
    label: "My web host / cPanel email",
    host: "",
    port: 465,
    security: "ssl",
    userHint: "Your full email address (e.g. sales@yourcompany.com)",
    passLabel: "Mailbox password",
    steps: [
      "Log in to your hosting control panel (cPanel or similar) → Email Accounts → find the mailbox → “Connect Devices” (or “Configure Mail Client”).",
      "Copy the “Outgoing server (SMTP)” name and the SSL port shown there, usually mail.yourcompany.com and 465.",
      "Username: the full email address. Password: the mailbox password.",
      "If the test says the secure connection failed, use the server name your host's certificate is issued to (often shown on that same page, e.g. server123.yourhost.com).",
    ],
  },
  other: {
    label: "Other provider",
    host: "",
    port: 465,
    security: "ssl",
    userHint: "Usually your full email address",
    passLabel: "Password or app password",
    steps: [
      "Find your provider's “SMTP settings” page (search “<provider> SMTP settings”). You need: the outgoing server name, the port (465 with SSL or 587 with STARTTLS), your username and a password.",
      "If your account uses two-step sign-in, create an “app password” for BADE; your normal password usually won't work.",
    ],
  },
};

const guessProvider = (host = "") => {
  const h = host.toLowerCase();
  if (!h) return "zoho";
  if (h.includes("zoho")) return "zoho";
  if (h.includes("gmail") || h.includes("google")) return "google";
  if (h.includes("office365") || h.includes("outlook")) return "microsoft";
  if (h.includes("yahoo")) return "yahoo";
  if (h.includes("brevo") || h.includes("sendinblue")) return "brevo";
  if (h.includes("sendgrid")) return "sendgrid";
  if (h.includes("mailgun")) return "mailgun";
  if (h.includes("amazonaws")) return "ses";
  return "other";
};

const when = (d) => (d ? new Date(d).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "");

export default function EmailSending({ isAdmin, adminEmail, companyName }) {
  const [current, setCurrent] = useState(null);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(false);

  const load = async () => {
    const r = await api.get("/api/EmailSending");
    if (!r.ok) return ErrorMessage(r.error);
    setCurrent(r.data.data);
  };
  useEffect(() => {
    load();
  }, []);

  const test = async () => {
    setBusy("test");
    const r = await api.post("/api/EmailSending/test", {});
    setBusy("");
    await load();
    if (!r.ok) return ErrorMessage(r.error);
    SuccessToast(r.data.message);
  };

  const remove = async () => {
    setBusy("remove");
    const r = await api.del("/api/EmailSending");
    setBusy("");
    setConfirmRemove(false);
    if (!r.ok) return ErrorMessage(r.error);
    SuccessToast(r.data.message);
    setEditing(false);
    load();
  };

  if (!current) return <p className="text-sm text-muted-foreground">Loading…</p>;

  const own = current.configured && current.enabled;
  const failing = own && current.status === "failing";

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-lg font-semibold">Email sending</h2>
        <p className="text-sm text-muted-foreground">
          Send your business&rsquo;s emails from your own email address, so customers and staff see{" "}
          {companyName || "your business"}&rsquo;s address instead of BADE&rsquo;s. Works with any email provider.
        </p>
      </div>

      {/* current state */}
      <div className={`rounded-lg border p-4 space-y-2 ${failing ? "border-destructive/50 bg-destructive/5" : ""}`}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">Emails are sent from:</span>
          {own ? (
            <>
              <span className="text-sm font-semibold break-all">{current.fromEmail}</span>
              {failing ? <Badge variant="destructive">Not working</Badge> : <Badge variant="secondary">Working</Badge>}
            </>
          ) : (
            <>
              <span className="text-sm font-semibold">BADE&rsquo;s email account</span>
              <Badge variant="outline">Default</Badge>
            </>
          )}
        </div>
        {own && !failing && current.verifiedAt && (
          <p className="text-xs text-muted-foreground">
            Server {current.host}:{current.port} · last checked {when(current.verifiedAt)}
          </p>
        )}
        {failing && (
          <div className="text-sm space-y-1">
            <p className="text-destructive font-medium">
              Your email account stopped working{current.failingSince ? ` on ${when(current.failingSince)}` : ""}. Emails are going out
              through BADE&rsquo;s account under your business name until it&rsquo;s fixed, so nothing is lost.
            </p>
            {current.lastError && <p className="text-muted-foreground">Reason: {current.lastError}</p>}
          </div>
        )}
        {!own && (
          <p className="text-xs text-muted-foreground">
            Your emails go out from BADE&rsquo;s address with {companyName || "your business"}&rsquo;s name, and replies go to your business email.
          </p>
        )}
        {isAdmin && (
          <div className="flex flex-wrap gap-2 pt-1">
            <Button size="sm" onClick={() => setEditing(true)}>
              {current.configured ? "Change email account" : "Use my own email account"}
            </Button>
            {current.configured && (
              <>
                <Button size="sm" variant="outline" disabled={Boolean(busy)} onClick={test}>
                  {busy === "test" ? "Sending…" : `Send a test email to ${adminEmail || "me"}`}
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" disabled={Boolean(busy)} onClick={() => setConfirmRemove(true)}>
                  Stop using it
                </Button>
              </>
            )}
          </div>
        )}
        {!isAdmin && <p className="text-xs text-muted-foreground">Only an admin can change this.</p>}
      </div>

      {editing && isAdmin && (
        <SetupForm
          current={current}
          adminEmail={adminEmail}
          companyName={companyName}
          onCancel={() => setEditing(false)}
          onSaved={(data, message) => {
            setCurrent(data);
            setEditing(false);
            SuccessToast(message);
          }}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border p-4 text-sm space-y-2">
          <p className="font-medium">Which emails use your account</p>
          <ul className="list-disc pl-5 text-muted-foreground space-y-1">
            <li>Emails to your customers: quotes, invoices, statements, store orders and codes, payment links, password resets on your store</li>
            <li>Emails to your staff: approvals, returns, purchase requests, stock reports, leave, appraisals, ops codes and new-staff welcome</li>
          </ul>
          <p className="text-muted-foreground">
            Sign-in alerts, BADE password resets and your BADE subscription emails always come from BADE.
          </p>
        </div>
        <div className="rounded-lg border p-4 text-sm space-y-2">
          <p className="font-medium">If your account stops working</p>
          <p className="text-muted-foreground">
            Emails automatically go out through BADE&rsquo;s account with your business name, and replies still go to you. Your
            admins get a notification with the reason, and BADE tries your account again every 10 minutes.
          </p>
          <p className="font-medium pt-1">Your password is safe</p>
          <p className="text-muted-foreground">
            It is encrypted before it is stored, is never shown again (not even to admins), and is only ever sent to your
            email provider over an encrypted connection.
          </p>
        </div>
      </div>

      <Dialog open={confirmRemove} onOpenChange={(o) => !o && !busy && setConfirmRemove(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Stop using {current.fromEmail}?</DialogTitle>
            <DialogDescription>
              Your emails will go out through BADE&rsquo;s account again, under your business name. The saved login is deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" disabled={Boolean(busy)} onClick={() => setConfirmRemove(false)}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={Boolean(busy)} onClick={remove}>
              {busy === "remove" ? "Removing…" : "Stop using it"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SetupForm({ current, adminEmail, companyName, onCancel, onSaved }) {
  const [provider, setProvider] = useState(current.configured ? guessProvider(current.host) : "zoho");
  const p = PROVIDERS[provider];
  const [form, setForm] = useState({
    fromName: current.fromName || companyName || "",
    fromEmail: current.fromEmail || "",
    user: current.user || "",
    pass: "",
    host: current.configured ? current.host : p.host,
    port: current.configured ? current.port : p.port,
    security: current.configured ? current.security : p.security,
  });
  const [userTouched, setUserTouched] = useState(Boolean(current.user));
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const pickProvider = (id) => {
    setProvider(id);
    const n = PROVIDERS[id];
    setForm((f) => ({ ...f, host: n.host || (id === provider ? f.host : ""), port: n.port, security: n.security }));
    setProblem("");
  };

  // the port decides the security type
  const pickPort = (port) => setForm((f) => ({ ...f, port: Number(port), security: Number(port) === 587 ? "starttls" : "ssl" }));

  const keepsPassword = current.configured && form.host === current.host && form.user === current.user;
  const valid = useMemo(
    () =>
      form.fromName.trim() &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.fromEmail.trim()) &&
      form.user.trim() &&
      form.host.trim() &&
      (form.pass || keepsPassword),
    [form, keepsPassword],
  );

  const save = async (e) => {
    e.preventDefault();
    if (!valid) return;
    setBusy(true);
    setProblem("");
    const body = {
      host: form.host.trim(),
      port: Number(form.port),
      security: form.security,
      user: form.user.trim(),
      fromName: form.fromName.trim(),
      fromEmail: form.fromEmail.trim(),
      ...(form.pass ? { pass: form.pass } : {}),
    };
    const r = await api.put("/api/EmailSending", body);
    setBusy(false);
    if (!r.ok) return setProblem(r.error || "The settings could not be checked");
    setForm((f) => ({ ...f, pass: "" }));
    onSaved(r.data.data, r.data.message);
  };

  return (
    <form onSubmit={save} className="rounded-lg border p-4 sm:p-6 space-y-6">
      <div className="space-y-1.5">
        <Label htmlFor="es-provider">1. Your email provider</Label>
        <select id="es-provider" className={selectCls} value={provider} onChange={(e) => pickProvider(e.target.value)}>
          {Object.entries(PROVIDERS).map(([id, x]) => (
            <option key={id} value={id}>
              {x.label}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-md bg-muted/50 p-4 text-sm space-y-2">
        <p className="font-medium">2. Get a password BADE can use ({p.label})</p>
        <ol className="list-decimal pl-5 space-y-1.5 text-muted-foreground">
          {p.steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
        {p.note && <p className="text-xs text-muted-foreground border-t pt-2">{p.note}</p>}
      </div>

      <div className="space-y-4">
        <p className="text-sm font-medium">3. Fill in your details</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="es-fromName">Sender name</Label>
            <Input id="es-fromName" value={form.fromName} maxLength={100} onChange={(e) => set("fromName", e.target.value)} placeholder="e.g. Okinsa Ideal Ltd" />
            <p className="text-xs text-muted-foreground">What customers see as the sender.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="es-fromEmail">“From” email address</Label>
            <Input
              id="es-fromEmail"
              type="email"
              autoComplete="off"
              value={form.fromEmail}
              onChange={(e) => {
                set("fromEmail", e.target.value);
                if (!userTouched && provider !== "sendgrid") set("user", e.target.value);
              }}
              placeholder="sales@yourcompany.com"
            />
            <p className="text-xs text-muted-foreground">Must be the mailbox you log in with, or an address your provider has verified.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="es-user">Username</Label>
            <Input
              id="es-user"
              autoComplete="off"
              value={form.user}
              onChange={(e) => {
                setUserTouched(true);
                set("user", e.target.value);
              }}
              placeholder={provider === "sendgrid" ? "apikey" : "sales@yourcompany.com"}
            />
            <p className="text-xs text-muted-foreground">{p.userHint}.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="es-pass">{p.passLabel}</Label>
            <Input
              id="es-pass"
              type="password"
              autoComplete="new-password"
              value={form.pass}
              onChange={(e) => set("pass", e.target.value)}
              placeholder={keepsPassword ? "Saved, leave empty to keep it" : "Paste it here"}
            />
            <p className="text-xs text-muted-foreground">Encrypted when saved and never shown again.</p>
          </div>
        </div>

        <details className="rounded-md border px-3 py-2" open={provider === "hosting" || provider === "other" || !form.host}>
          <summary className="cursor-pointer text-sm font-medium">Server settings {form.host ? `(${form.host}, port ${form.port})` : ""}</summary>
          <div className="grid gap-4 sm:grid-cols-3 pt-3">
            <div className="space-y-1.5 sm:col-span-1">
              <Label htmlFor="es-host">Outgoing (SMTP) server</Label>
              <Input id="es-host" autoComplete="off" value={form.host} onChange={(e) => set("host", e.target.value.trim())} placeholder="smtp.yourprovider.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="es-port">Port</Label>
              <select id="es-port" className={selectCls} value={form.port} onChange={(e) => pickPort(e.target.value)}>
                <option value={465}>465 (SSL) – recommended</option>
                <option value={587}>587 (STARTTLS)</option>
                <option value={2525}>2525</option>
                <option value={25}>25</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="es-security">Security</Label>
              <select
                id="es-security"
                className={selectCls}
                value={form.security}
                disabled={form.port === 465 || form.port === 587}
                onChange={(e) => set("security", e.target.value)}
              >
                <option value="ssl">SSL / TLS</option>
                <option value="starttls">STARTTLS</option>
              </select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground pt-2">The connection to your provider is always encrypted; BADE never sends your password over an unencrypted connection.</p>
        </details>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium">4. Check and save</p>
        <p className="text-sm text-muted-foreground">
          BADE logs in to your account and sends a test email to <b>{adminEmail || "you"}</b>. Nothing is saved unless that works.
        </p>
        {problem && (
          <div className="rounded-md border border-destructive/50 bg-destructive/5 px-3 py-2 text-sm text-destructive" role="alert">
            {problem}
          </div>
        )}
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          <Button type="button" variant="outline" disabled={busy} onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy || !valid}>
            {busy ? "Checking your account…" : "Check and save"}
          </Button>
        </div>
      </div>
    </form>
  );
}
