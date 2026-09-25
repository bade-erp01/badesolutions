"use client";

import { useEffect } from "react";
import OneSignal from "react-onesignal";

export default function OneSignalProvider({ children }) {
  useEffect(() => {
    // Must only run in the browser
    if (typeof window === "undefined") return;

    OneSignal.init({
      appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
      // Required for localhost testing
    //   allowLocalhostAsSecureOrigin: true,
      // Optional: shows the bell icon
      notifyButton: {
        enable: true,
      },
      // Only needed if the worker is NOT at the site root
    //   serviceWorkerPath: "OneSignalSDKWorker.js",
    //   serviceWorkerParam: { scope: "/" },
    });
  }, []);

  return children;
}