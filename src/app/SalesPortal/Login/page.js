"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { loginSuccess, loginFailure } from "../../../../lib/SalesPortalUser";
import { Dencrypt } from "../../../../Functions/Functions";
import { Alert, Avatar, Button, Field, Input, LinkButton, PoweredByBade } from "../_ui/ui";
import Turnstile, { TURNSTILE_SITE_KEY } from "@/components/Turnstile";

export default function Login({ userInfo, businessInfo, url }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  // Cloudflare Turnstile: keeps bots off the sign-in (empty until the check passes)
  const [humanToken, setHumanToken] = useState("");
  const [humanReset, setHumanReset] = useState(0);
  // the widget itself failed (bad key, blocked): don't lock people out; the backend decides
  const [humanUnavailable, setHumanUnavailable] = useState(false);
  const needHuman = Boolean(TURNSTILE_SITE_KEY) && !humanUnavailable;
  // ?reason=elsewhere: sent here because this account signed in on another device
  const [signedOutElsewhere, setSignedOutElsewhere] = useState(false);
  useEffect(() => {
    setSignedOutElsewhere(new URLSearchParams(window.location.search).get("reason") === "elsewhere");
  }, []);

  // the layout only passes a user when the backend session is valid
  const isLoggedIn = Boolean(userInfo && businessInfo);

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (needHuman && !humanToken) {
      setError("Please complete the security check.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      // same-origin dev proxy (ERP_API_PROXY): through this site; otherwise the backend address
      const base = process.env.NEXT_PUBLIC_API_URL === "same-origin" ? "" : url;
      const response = await fetch(`${base}/Sales_Portal/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // keep the session cookie
        body: JSON.stringify({ email: email.trim(), password, turnstileToken: humanToken }),
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok && data.Newcustomer) {
        dispatch(loginSuccess({ salesPerson: Dencrypt(data.Newcustomer) }));
        router.push("/SalesPortal/Dashboard");
        router.refresh();
        return;
      }
      throw new Error(data.error || "Sign in failed. Check your email and password.");
    } catch (err) {
      const message = err.message === "Failed to fetch" ? "Can't reach the server. Check your connection." : err.message;
      setError(message);
      setPassword("");
      setHumanReset((n) => n + 1); // a check is used once: get a fresh one
      dispatch(loginFailure(message));
      setBusy(false);
    }
  };

  // Phones: the form alone. From 768px (md): a brand panel on the left, in the style of the
  // Sales Portal landing page, and the same form on the right.
  return (
    <div className="sales-app min-h-dvh bg-sp-bg text-sp-ink md:grid md:grid-cols-2 lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white md:flex md:flex-col md:justify-between md:p-10 lg:p-14">
        <div className="absolute inset-0 bg-[url('/salesfolks.jpg')] bg-cover bg-center opacity-25" aria-hidden />
        <Link href="/SalesPortal" className="relative flex items-center gap-3" aria-label="BADE Sales home">
          <Image src="/icons/icon-192.png" alt="" width={40} height={40} className="h-10 w-10 rounded-xl" />
          <span className="text-lg font-semibold">BADE Sales</span>
        </Link>
        <div className="relative max-w-md space-y-5">
          <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">Your route, customers and orders, in one place.</h2>
          <ul className="space-y-3 text-[15px] text-slate-200">
            {["Today's route and customer visits", "Orders with cases and pieces, from the customer's shop", "Stock checks with photos, sent straight to your company"].map((t) => (
              <li key={t} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-slate-400">Powered by BADE ERP · badesolutions.com.ng</p>
      </aside>

    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-5 py-10 md:w-full md:max-w-md md:px-10">
      <div className="mb-8 space-y-3">
        <Link href="/SalesPortal" aria-label="BADE Sales">
          <Image src="/icons/icon-192.png" priority alt="BADE" width={48} height={48} className="h-12 w-12 rounded-2xl" />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">{isLoggedIn ? "Welcome back" : "Sales sign in"}</h1>
        <p className="text-sm text-sp-muted">
          {isLoggedIn ? "You're already signed in on this device." : "Use the email and password your company gave you."}
        </p>
      </div>

      {isLoggedIn ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-2xl border border-sp-line bg-sp-surface p-4">
            <Avatar src={userInfo?.image || businessInfo?.companyLogo} name={`${userInfo?.firstName || ""} ${userInfo?.lastName || ""}`} size={48} />
            <div className="min-w-0">
              <p className="truncate font-semibold">
                {userInfo?.firstName} {userInfo?.lastName}
              </p>
              <p className="truncate text-sm text-sp-muted">{businessInfo?.companyName}</p>
            </div>
          </div>
          <LinkButton href="/SalesPortal/Dashboard" className="w-full">
            Continue <ArrowRight className="h-4 w-4" />
          </LinkButton>
        </div>
      ) : (
        <form method="post" onSubmit={submit} className="space-y-4">{/* post: a tap before the page has loaded must never put the password in the address */}
          <Field label="Email address">
            <Input type="email" name="email" autoComplete="username" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required />
          </Field>
          <Field label="Password">
            <Input type="password" name="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Field>
          {!error && signedOutElsewhere && (
            <Alert>You were signed out because this account signed in on another device. One device at a time: sign in here to use this one instead.</Alert>
          )}
          {error && <Alert>{error}</Alert>}
          <Turnstile onToken={setHumanToken} onUnavailable={() => setHumanUnavailable(true)} resetKey={humanReset} />
          <Button type="submit" className="w-full" busy={busy} disabled={needHuman && !humanToken}>
            {busy ? "Signing in…" : "Sign in"}
          </Button>
          <div className="flex items-center justify-between text-sm">
            <Link href="/auth/Forgot_password" className="font-medium text-sp-info">
              Forgot password?
            </Link>
            <Link href="/Careers" className="text-sp-muted">
              Careers
            </Link>
          </div>
        </form>
      )}

      <PoweredByBade className="mt-10" />
    </main>
    </div>
  );
}
