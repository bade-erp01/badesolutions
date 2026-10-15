"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import OneSignal from "react-onesignal";
import { toast } from "sonner";
import { BellOff, BellRing, Loader2, Lock, Share, Smartphone } from "lucide-react";

import { useOneSignal, PUSH_PROMPT_KEY_PREFIX } from "@/app/Components/OneSignalProvider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const LOG_PREFIX = "[OneSignal]";
const REPROMPT_MS = 30 * 60 * 1000;
// Lets a restored subscription load before we decide the user isn't subscribed.
const SETTLE_MS = 1500;
const PROMPT_STATES = new Set(["can-ask", "blocked", "ios-needs-install"]);
const UNSUPPORTED_KEY_PREFIX = "bade:push-unsupported-noted:";

const storage = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* storage unavailable */
    }
  },
};

function isIOS() {
  const ua = navigator.userAgent;
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    // iPadOS reports itself as a Mac.
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function nativePermission() {
  if (typeof Notification !== "undefined") return Notification.permission;
  return OneSignal.Notifications.permissionNative;
}

// Returns null while we can't tell yet (init pending or failed).
function readPushState(status) {
  if (isIOS() && !isStandalone()) return "ios-needs-install";
  if (!OneSignal.Notifications.isPushSupported()) return "unsupported";
  if (status !== "ready") return null;
  if (OneSignal.User.PushSubscription.optedIn === true) return "subscribed";
  if (nativePermission() === "denied") return "blocked";
  // "default", or "granted" but opted out on this device.
  return "can-ask";
}

const BANNER_COPY = {
  "can-ask": {
    title: "Notifications are off",
    text: "You'll miss order, approval and payment alerts.",
    action: "Turn on notifications",
  },
  blocked: {
    title: "Notifications are blocked",
    text: "This browser is blocking alerts from BADE.",
    action: "How to unblock",
  },
  "ios-needs-install": {
    title: "Install BADE to get notifications",
    text: "On iPhone and iPad, alerts only work from the Home Screen app.",
    action: "Show me how",
  },
};

function Steps({ items }) {
  return (
    <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ol>
  );
}

export default function PushNotificationGate() {
  const { status, userId } = useOneSignal();

  const [pushState, setPushState] = useState(null);
  const [settled, setSettled] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const prevState = useRef(null);
  const bannerRef = useRef(null);

  const refresh = useCallback(() => {
    setPushState(readPushState(status));
  }, [status]);

  // Initial read, then live updates from OneSignal and from the tab regaining
  // focus (the user may have changed site settings elsewhere).
  useEffect(() => {
    if (!userId) return;
    const initial = readPushState(status);
    setPushState(initial);
    // Only start settling once init has finished (or the answer doesn't depend on it).
    const settleTimer =
      status !== "pending" || initial
        ? setTimeout(() => {
            refresh();
            setSettled(true);
          }, SETTLE_MS)
        : null;

    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisible);

    let detach = () => {};
    if (status === "ready") {
      OneSignal.User.PushSubscription.addEventListener("change", refresh);
      OneSignal.Notifications.addEventListener("permissionChange", refresh);
      detach = () => {
        OneSignal.User.PushSubscription.removeEventListener("change", refresh);
        OneSignal.Notifications.removeEventListener("permissionChange", refresh);
      };
    }

    return () => {
      clearTimeout(settleTimer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisible);
      detach();
    };
  }, [userId, status, refresh]);

  // Open the modal on login, then at most every 30 minutes while not subscribed.
  useEffect(() => {
    if (!userId || !settled || !PROMPT_STATES.has(pushState)) return;

    const key = `${PUSH_PROMPT_KEY_PREFIX}${userId}`;
    const maybeOpen = () => {
      const last = Number(storage.get(key)) || 0;
      if (Date.now() - last >= REPROMPT_MS) {
        storage.set(key, String(Date.now()));
        setModalOpen(true);
      }
    };

    maybeOpen();
    const interval = setInterval(maybeOpen, 60 * 1000);
    return () => clearInterval(interval);
  }, [userId, settled, pushState]);

  // One-time toasts.
  useEffect(() => {
    if (!userId || !settled || !pushState) return;
    const prev = prevState.current;
    prevState.current = pushState;

    if (pushState === "subscribed") {
      setModalOpen(false);
      if (prev && prev !== "subscribed") {
        toast.success("Notifications are on", {
          description: "You'll get order, approval and payment alerts on this device.",
        });
      }
    }

    if (pushState === "unsupported") {
      const key = `${UNSUPPORTED_KEY_PREFIX}${userId}`;
      if (!storage.get(key)) {
        storage.set(key, "1");
        toast.info("Notifications aren't available here", {
          description:
            "This browser can't receive push alerts. Use Chrome, Edge or Firefox to get order, approval and payment notifications.",
        });
      }
    }
  }, [userId, settled, pushState]);

  const showBanner = Boolean(userId && settled && PROMPT_STATES.has(pushState));

  // The V4 Wrapper is a fixed-height (100dvh) shell; tell it how much room the
  // banner takes so the page doesn't overflow.
  useEffect(() => {
    const root = document.documentElement;
    const el = bannerRef.current;
    if (!showBanner || !el) {
      root.style.removeProperty("--push-banner-h");
      return;
    }
    const observer = new ResizeObserver(() => {
      root.style.setProperty("--push-banner-h", `${el.offsetHeight}px`);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--push-banner-h");
    };
  }, [showBanner]);

  // Must be called straight from a click so Chrome shows the full prompt.
  const enable = async () => {
    setBusy(true);
    try {
      if (nativePermission() === "granted") {
        await OneSignal.User.PushSubscription.optIn();
      } else {
        await OneSignal.Notifications.requestPermission();
      }
    } catch (error) {
      console.error(`${LOG_PREFIX} enabling push failed:`, error);
    } finally {
      setBusy(false);
      refresh();
    }
  };

  const checkAgain = () => {
    const next = readPushState(status);
    setPushState(next);
    if (next === "blocked") {
      toast.info("Still blocked", {
        description: "After allowing notifications in site settings, reload the page.",
      });
    }
  };

  const bannerAction = () => {
    if (pushState === "can-ask") enable();
    else setModalOpen(true);
  };

  if (!userId) return null;

  const copy = BANNER_COPY[pushState];

  return (
    <>
      {showBanner && copy && (
        <div ref={bannerRef} className="shrink-0">
          <Alert className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-none border-x-0 border-t-0 border-amber-200 bg-amber-50 px-4 py-2.5 text-amber-900 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-100">
            <BellOff className="size-4 shrink-0" />
            <div className="min-w-0 flex-1">
              <AlertTitle className="line-clamp-none">{copy.title}</AlertTitle>
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                {copy.text}
              </AlertDescription>
            </div>
            <Button size="sm" onClick={bannerAction} disabled={busy}>
              {busy && <Loader2 className="animate-spin" />}
              {copy.action}
            </Button>
          </Alert>
        </div>
      )}

      <Dialog open={modalOpen && PROMPT_STATES.has(pushState)} onOpenChange={setModalOpen}>
        <DialogContent>
          {pushState === "can-ask" && (
            <>
              <DialogHeader>
                <div className="mx-auto mb-1 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary sm:mx-0">
                  <BellRing className="size-5" />
                </div>
                <DialogTitle>Turn on notifications</DialogTitle>
                <DialogDescription>
                  Order, approval and payment alerts are sent as notifications. Turn them on so
                  you see what needs your attention, even when BADE isn&apos;t open.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setModalOpen(false)}>
                  Remind me later
                </Button>
                <Button onClick={enable} disabled={busy}>
                  {busy && <Loader2 className="animate-spin" />}
                  Turn on notifications
                </Button>
              </DialogFooter>
            </>
          )}

          {pushState === "blocked" && (
            <>
              <DialogHeader>
                <div className="mx-auto mb-1 flex size-10 items-center justify-center rounded-full bg-amber-100 text-amber-700 sm:mx-0">
                  <Lock className="size-5" />
                </div>
                <DialogTitle>Notifications are blocked</DialogTitle>
                <DialogDescription>
                  Order, approval and payment alerts come as notifications, but this browser is
                  blocking them for BADE. To unblock:
                </DialogDescription>
              </DialogHeader>
              <Steps
                items={[
                  "Click the padlock (or settings icon) at the left of the address bar.",
                  <>
                    Open <strong className="text-foreground">Site settings</strong>.
                  </>,
                  <>
                    Set <strong className="text-foreground">Notifications</strong> to{" "}
                    <strong className="text-foreground">Allow</strong>.
                  </>,
                  "Reload this page.",
                ]}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setModalOpen(false)}>
                  Remind me later
                </Button>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Reload page
                </Button>
                <Button onClick={checkAgain}>Check again</Button>
              </DialogFooter>
            </>
          )}

          {pushState === "ios-needs-install" && (
            <>
              <DialogHeader>
                <div className="mx-auto mb-1 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary sm:mx-0">
                  <Smartphone className="size-5" />
                </div>
                <DialogTitle>Install BADE to get notifications</DialogTitle>
                <DialogDescription>
                  Order, approval and payment alerts come as notifications. On iPhone and iPad
                  they only work from the Home Screen app (iOS 16.4 or later).
                </DialogDescription>
              </DialogHeader>
              <Steps
                items={[
                  <>
                    Tap the <Share className="inline size-4 align-text-bottom" />{" "}
                    <strong className="text-foreground">Share</strong> button in Safari.
                  </>,
                  <>
                    Choose <strong className="text-foreground">Add to Home Screen</strong>.
                  </>,
                  "Open BADE from your Home Screen.",
                  "Log in again.",
                  "Turn on notifications when asked.",
                ]}
              />
              <DialogFooter>
                <Button onClick={() => setModalOpen(false)}>Got it</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
