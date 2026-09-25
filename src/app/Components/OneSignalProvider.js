"use client";

import { useEffect, useRef } from "react";
import OneSignal from "react-onesignal";

export default function OneSignalProvider({ children }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (initialized.current) return; // prevent double init (React Strict Mode)
    initialized.current = true;

    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;

    if (!appId) {
      console.error("OneSignal: NEXT_PUBLIC_ONESIGNAL_APP_ID is missing");
      return;
    }

    OneSignal.init({
      appId,
    //   allowLocalhostAsSecureOrigin: true, // required for localhost
      serviceWorkerPath: "/OneSignalSDKWorker.js",
      serviceWorkerParam: { scope: "/" },
      notifyButton: {
        enable: true, // shows the bell so you can see it works
      },
    })
      .then(() => {
        console.log("OneSignal: initialized successfully");
      })
      .catch((err) => {
        console.error("OneSignal: init failed", err);
      });
  }, []);

  return children;
}