"use client";

import { createContext, useContext, useEffect, useState } from "react";
import OneSignal from "react-onesignal";

const LOG_PREFIX = "[OneSignal]";
export const PUSH_PROMPT_KEY_PREFIX = "bade:push-prompt-last:";

// One init per page load, shared by every caller (strict mode double effects,
// the provider and the logout helper). Reset to null on failure so a later
// call can retry.
let initPromise = null;
// External ID we've already logged in as during this page load.
let loggedInAs = null;

// OneSignal only works on the site URL registered in its dashboard. Elsewhere (localhost,
// preview deployments) its init doesn't fail cleanly: push looked available, the "turn on
// notifications" prompt showed and subscribing never finished. Comma-separated hosts.
const PUSH_HOSTS = (process.env.NEXT_PUBLIC_ONESIGNAL_HOSTS || "badesolutions.com.ng,www.badesolutions.com.ng")
  .split(",")
  .map((h) => h.trim().toLowerCase())
  .filter(Boolean);

const pushAllowedHere = () => PUSH_HOSTS.includes(window.location.hostname.toLowerCase());

export function initOneSignal() {
  if (typeof window === "undefined") return Promise.resolve(false);

  // public app id (sent to every browser anyway); the host setting wins when present
  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || "7a980c29-14af-4971-beef-de19e16e8d90";
  if (!appId) {
    console.warn(`${LOG_PREFIX} NEXT_PUBLIC_ONESIGNAL_APP_ID is not set; push is disabled.`);
    return Promise.resolve(false);
  }

  if (!pushAllowedHere()) {
    console.info(`${LOG_PREFIX} push is off on ${window.location.hostname} (OneSignal is registered for ${PUSH_HOSTS.join(", ")}).`);
    return Promise.resolve(false);
  }

  // react-onesignal rejects init on browsers without web push (e.g. iOS Safari
  // outside an installed PWA). That's expected, not an error.
  if (!OneSignal.Notifications.isPushSupported()) return Promise.resolve(false);

  if (!initPromise) {
    initPromise = OneSignal.init({
      appId,
      // Own scope so it doesn't replace the next-pwa worker (/sw.js) at "/".
      serviceWorkerPath: "push/onesignal/OneSignalSDKWorker.js",
      serviceWorkerParam: {
        scope: "/push/onesignal/",
      },
      persistNotification: true,
      notifyButton: {
        enable: true,
      },
    })
      .then(() => true)
      .catch((error) => {
        // Survives HMR, where this module resets but react-onesignal's doesn't.
        if (String(error).includes("already initialized")) return true;
        console.error(`${LOG_PREFIX} init failed:`, error);
        initPromise = null;
        return false;
      });
  }

  return initPromise;
}

const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`timed out after ${ms}ms`)), ms),
    ),
  ]);

// Call from every logout handler, before navigating away. Never throws and
// gives up after a few seconds so it can't block logout.
export async function logoutOneSignal() {
  try {
    const ready = await withTimeout(initOneSignal(), 5000);
    if (!ready) return;
    await withTimeout(OneSignal.logout(), 3000);
    if (loggedInAs) {
      try {
        localStorage.removeItem(`${PUSH_PROMPT_KEY_PREFIX}${loggedInAs}`);
      } catch {
        /* storage unavailable */
      }
    }
    loggedInAs = null;
  } catch (error) {
    console.error(`${LOG_PREFIX} logout failed:`, error);
  }
}

const OneSignalContext = createContext({
  status: "pending", // "pending" | "ready" | "unavailable"
  userId: "",
});

export const useOneSignal = () => useContext(OneSignalContext);

// `user` is the fetchUser() payload: { user: { _id, tenantId, ... }, business, SessionId }.
export default function OneSignalProvider({ children, user }) {
  const userId = user?.user?._id ? String(user.user._id) : "";
  const tenantId = String(
    user?.user?.tenantId ?? user?.business?.tenantId ?? user?.tenantId ?? "",
  );

  const [status, setStatus] = useState("pending");

  useEffect(() => {
    let cancelled = false;

    const sync = async () => {
      const ready = await initOneSignal();
      if (cancelled) return;
      if (!ready) {
        setStatus("unavailable");
        return;
      }

      try {
        if (userId) {
          if (loggedInAs !== userId) {
            await OneSignal.login(userId);
            loggedInAs = userId;
          }
          await OneSignal.User.addTags({ _id: userId, tenantId });
        } else if (loggedInAs) {
          await OneSignal.logout();
          loggedInAs = null;
        }
      } catch (error) {
        console.error(`${LOG_PREFIX} user ${userId ? "login" : "logout"} failed:`, error);
      }

      if (!cancelled) setStatus("ready");
    };

    sync();

    return () => {
      cancelled = true;
    };
  }, [userId, tenantId]);

  return (
    <OneSignalContext.Provider value={{ status, userId }}>
      {children}
    </OneSignalContext.Provider>
  );
}
