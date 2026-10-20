"use client";

// "Install BADE Sales": the Sales Portal as an app on the rep's phone (its own manifest,
// public/salesportal.webmanifest, opens on the Sales Portal). Android / Chrome: the browser's
// install prompt. iPhone: how to add it to the home screen. Hidden once installed; "Not now"
// hides it for 3 days.

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";

const SNOOZE_KEY = "bade:sales-install-snoozed-until";
const SNOOZE_MS = 3 * 24 * 60 * 60 * 1000;

const standalone = () =>
  typeof window !== "undefined" && (window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true);
const isIos = () => typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);
const snoozed = () => {
  try {
    return Number(localStorage.getItem(SNOOZE_KEY) || 0) > Date.now();
  } catch {
    return false;
  }
};

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [show, setShow] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    if (standalone() || snoozed()) return;
    const onPrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
      setShow(true);
    };
    const onInstalled = () => setShow(false);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    if (isIos()) {
      setIos(true);
      setShow(true);
    }
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!show) return null;

  const snooze = () => {
    try {
      localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_MS));
    } catch {
      /* storage unavailable */
    }
    setShow(false);
  };
  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    const choice = await deferred.userChoice.catch(() => null);
    setDeferred(null);
    if (choice?.outcome === "accepted") setShow(false);
  };

  return (
    <div className="sales-app fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] z-[9000] flex justify-center px-4" role="dialog" aria-label="Install BADE Sales">
      <div className="flex w-full max-w-md items-start gap-3 rounded-2xl border border-sp-line bg-sp-surface p-4 shadow-lg">
        <img src="/icons/icon-192.png" alt="" width={40} height={40} className="h-10 w-10 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-sp-ink">Install BADE Sales</p>
          {ios ? (
            <p className="mt-0.5 text-xs text-sp-muted">
              Tap <Share className="inline h-3.5 w-3.5 align-text-bottom" aria-label="Share" /> then &quot;Add to Home Screen&quot; — and turn on notifications from the app.
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-sp-muted">Open it from your home screen and get new orders and messages as notifications.</p>
          )}
          {!ios && (
            <button type="button" onClick={install} className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-sp-ink px-3 py-1.5 text-sm font-semibold text-sp-on-ink">
              <Download className="h-4 w-4" /> Install app
            </button>
          )}
        </div>
        <button type="button" onClick={snooze} className="rounded-lg p-1 text-sp-muted hover:bg-sp-bg" aria-label="Not now">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
