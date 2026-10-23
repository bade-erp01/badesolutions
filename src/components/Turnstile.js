"use client";

// Cloudflare Turnstile ("are you a human") widget for the sign-in forms. The token it gives is
// sent with the sign-in as `turnstileToken`; the backend verifies it (lib/turnstile.js).
// Shows nothing when NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set (the sign-in then works as before).
//
// If the widget itself can't work (wrong site key, Cloudflare blocked or unreachable, script not
// loaded within 10 s) it calls onUnavailable, so the form doesn't lock everyone out. Whether a
// sign-in without a token is accepted is the backend's decision (TURNSTILE_LOGIN).

import { useEffect, useRef, useState } from "react";

export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAAFf_KvT7txweThQQKJlI6iMXnHw";

const LOAD_TIMEOUT_MS = 10_000;

/**
 * @param {{ onToken: (token: string) => void, onUnavailable?: () => void, resetKey?: any, className?: string }} props
 *   onToken        receives the token, or "" when it expires or fails
 *   onUnavailable  called when the widget can't be used at all
 *   resetKey       change it (e.g. after a failed sign-in) to get a fresh check
 */
export default function Turnstile({ onToken, onUnavailable, resetKey, className = "" }) {
  const box = useRef(null);
  const widget = useRef(null);
  const tokenCb = useRef(onToken);
  const failCb = useRef(onUnavailable);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    tokenCb.current = onToken;
    failCb.current = onUnavailable;
  });

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return undefined;
    let cancelled = false;
    const giveUp = (reason) => {
      if (cancelled) return;
      console.warn("[turnstile] security check unavailable:", reason);
      if (widget.current && window.turnstile) {
        try {
          window.turnstile.remove(widget.current);
        } catch {}
      }
      widget.current = null;
      tokenCb.current("");
      setFailed(true);
      failCb.current?.();
    };
    const timer = setTimeout(() => {
      if (!window.turnstile) giveUp("script did not load");
    }, LOAD_TIMEOUT_MS);
    const render = () => {
      if (cancelled || !box.current || !window.turnstile) return;
      clearTimeout(timer);
      if (widget.current) window.turnstile.remove(widget.current);
      tokenCb.current("");
      try {
        widget.current = window.turnstile.render(box.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (t) => tokenCb.current(t),
          "expired-callback": () => tokenCb.current(""),
          // e.g. 400020 = the site key is wrong; 110200 = this domain isn't allowed for the key
          "error-callback": (code) => {
            giveUp(`Cloudflare error ${code}`);
            return true; // handled: don't let Turnstile keep retrying
          },
        });
      } catch (err) {
        giveUp(err?.message || "render failed");
      }
    };
    if (window.turnstile) render();
    else {
      let s = document.querySelector("script[data-turnstile]");
      if (!s) {
        s = document.createElement("script");
        s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        s.async = true;
        s.dataset.turnstile = "1";
        s.addEventListener("error", () => giveUp("script blocked"));
        document.head.appendChild(s);
      }
      s.addEventListener("load", render);
    }
    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (widget.current && window.turnstile) window.turnstile.remove(widget.current);
      widget.current = null;
    };
  }, [resetKey]);

  if (!TURNSTILE_SITE_KEY) return null;
  if (failed) {
    return <p className={`text-center text-xs text-zinc-500 ${className}`}>Security check unavailable right now. You can still sign in.</p>;
  }
  return <div ref={box} className={`flex min-h-[65px] justify-center ${className}`} />;
}
