"use client";

// PostHog product analytics.
//
// Events go to /ingest on our own origin, and next.config.mjs rewrites them to
// PostHog. Because of that, ad blockers don't drop them and the CSP needs no
// PostHog hosts (connect-src and script-src are 'self').
//
// Pageviews: posthog-js tracks App Router navigations by itself
// (capture_pageview: "history_change"), so there's no useSearchParams here.
// That hook would need a Suspense boundary in the root layout.
//
// Off when NEXT_PUBLIC_POSTHOG_KEY isn't set (e.g. local dev without a key).

import { useEffect } from "react";
import posthog from "posthog-js";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
// The PostHog app, for links from the toolbar ("https://eu.posthog.com" for an EU project).
const UI_HOST = process.env.NEXT_PUBLIC_POSTHOG_UI_HOST || "https://us.posthog.com";

let started = false;

function initPostHog() {
  if (started || typeof window === "undefined" || !KEY) return started;
  posthog.init(KEY, {
    api_host: "/ingest",
    ui_host: UI_HOST,
    capture_pageview: "history_change",
    capture_pageleave: true,
    // only signed-in users get person profiles; anonymous visitors stay cheap
    person_profiles: "identified_only",
    // ERP screens show customer names, amounts and prices: mask text in session replay
    session_recording: { maskAllInputs: true, maskTextSelector: "*" },
    debug: process.env.NODE_ENV === "development",
  });
  started = true;
  return started;
}

// `user` is the fetchUser() payload: { user: { _id, firstName, ... }, business: { _id, companyName, ... } }.
export function identifyPostHog(user) {
  if (!initPostHog()) return;
  const u = user?.user;
  const b = user?.business;
  if (!u?._id) return;

  const id = String(u._id);
  if (posthog.get_distinct_id() !== id) {
    posthog.identify(id, {
      email: u.email,
      name: [u.firstName, u.lastName].filter(Boolean).join(" ") || undefined,
      role: u.role,
    });
  }
  // Group events by business (one tenant = one company in PostHog).
  const businessId = b?._id ?? b?.tenantId ?? u.tenantId;
  if (businessId) {
    posthog.group("business", String(businessId), {
      name: b?.companyName,
    });
  }
}

// A product event (e.g. "signup_started"). Does nothing when PostHog is off.
export function trackEvent(name, properties) {
  try {
    if (initPostHog()) posthog.capture(name, properties);
  } catch (error) {
    console.error("[PostHog] capture failed:", error);
  }
}

// Call from every logout handler so the next person on this browser isn't merged into this one.
export function resetPostHog() {
  try {
    if (started) posthog.reset();
  } catch (error) {
    console.error("[PostHog] reset failed:", error);
  }
}

export default function PostHogProvider({ children }) {
  useEffect(() => {
    initPostHog();
  }, []);
  return children;
}

// Rendered inside the signed-in layouts (ERP and Sales Portal), where the user is known.
export function PostHogIdentify({ user }) {
  const userId = user?.user?._id ? String(user.user._id) : "";
  const businessId = String(user?.business?._id ?? "");
  useEffect(() => {
    if (userId) identifyPostHog(user);
  }, [userId, businessId]); // re-identify only when the user or business changes
  return null;
}
