"use client";

// Cloudflare Turnstile ("are you a human") widget for the sign-in forms. The token it gives is
// sent with the sign-in as `turnstileToken`; the backend verifies it (lib/turnstile.js).
// Shows nothing when NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set (the sign-in then works as before).

import { useEffect, useRef } from "react";

export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

/**
 * @param {{ onToken: (token: string) => void, resetKey?: any, className?: string }} props
 *   onToken  receives the token, or "" when it expires or fails
 *   resetKey change it (e.g. after a failed sign-in) to get a fresh check
 */
export default function Turnstile({ onToken, resetKey, className = "" }) {
  const box = useRef(null);
  const widget = useRef(null);
  const tokenCb = useRef(onToken);
  tokenCb.current = onToken;

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return undefined;
    let cancelled = false;
    const render = () => {
      if (cancelled || !box.current || !window.turnstile) return;
      if (widget.current) window.turnstile.remove(widget.current);
      tokenCb.current("");
      widget.current = window.turnstile.render(box.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (t) => tokenCb.current(t),
        "expired-callback": () => tokenCb.current(""),
        "error-callback": () => tokenCb.current(""),
      });
    };
    if (window.turnstile) render();
    else {
      let s = document.querySelector("script[data-turnstile]");
      if (!s) {
        s = document.createElement("script");
        s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        s.async = true;
        s.dataset.turnstile = "1";
        document.head.appendChild(s);
      }
      s.addEventListener("load", render);
    }
    return () => {
      cancelled = true;
      if (widget.current && window.turnstile) window.turnstile.remove(widget.current);
      widget.current = null;
    };
  }, [resetKey]);

  if (!TURNSTILE_SITE_KEY) return null;
  return <div ref={box} className={`flex min-h-[65px] justify-center ${className}`} />;
}
