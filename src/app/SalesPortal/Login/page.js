"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { ArrowRight } from "lucide-react";
import { loginSuccess, loginFailure } from "../../../../lib/SalesPortalUser";
import { Dencrypt } from "../../../../Functions/Functions";
import { Alert, Avatar, Button, Field, Input, LinkButton, PoweredByBade } from "../_ui/ui";

export default function Login({ userInfo, businessInfo, url }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
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
    setBusy(true);
    setError("");
    try {
      // same-origin dev proxy (ERP_API_PROXY): through this site; otherwise the backend address
      const base = process.env.NEXT_PUBLIC_API_URL === "same-origin" ? "" : url;
      const response = await fetch(`${base}/Sales_Portal/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // keep the session cookie
        body: JSON.stringify({ email: email.trim(), password }),
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
      dispatch(loginFailure(message));
      setBusy(false);
    }
  };

  return (
    <main className="sales-app mx-auto flex min-h-dvh max-w-sm flex-col justify-center bg-sp-bg px-5 py-10 text-sp-ink">
      <div className="mb-8 space-y-3">
        <Link href="/SalesPortal" aria-label="BADE Sales">
          <Image src="/icons/icon-192.png" priority alt="BADE" width={48} height={48} className="h-12 w-12 rounded-2xl" />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">{isLoggedIn ? "Welcome back" : "Sales sign in"}</h1>
        <p className="text-sm text-sp-muted">
          {isLoggedIn ? "You're already signed in on this phone." : "Use the email and password your company gave you."}
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
        <form onSubmit={submit} className="space-y-4">
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
          <Button type="submit" className="w-full" busy={busy}>
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
  );
}
