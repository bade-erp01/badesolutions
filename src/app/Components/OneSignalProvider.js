"use client";

import { useEffect, useRef } from "react";
import OneSignal from "react-onesignal";

export default function OneSignalProvider({ children, user }) {
  const initialized = useRef(false);

  useEffect(() => {
    const initializeOneSignal = async () => {
      if (typeof window === "undefined") return;
      if (initialized.current) return;

      const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;

      if (!appId) {
        return;
      }

      try {
        await OneSignal.init({
          appId,
          // Own scope so it doesn't replace the next-pwa worker (/sw.js) at "/".
          serviceWorkerPath: "push/onesignal/OneSignalSDKWorker.js",
          serviceWorkerParam: {
            scope: "/push/onesignal/",
          },
          notifyButton: {
            enable: true,
          },
        });

        initialized.current = true;

      } catch (error) {
        // console.error(
        //   "OneSignal initialization failed:",
        //   error
        // );
      }
    };

    initializeOneSignal();
  }, []);

  useEffect(() => {
    if (!initialized.current) return;
    
    if (!user) return;

    const identifyUser = async () => {
      try {
        const userId = String(user.user._id);

        await OneSignal.login(userId);

        await OneSignal.User.addTags({
          _id: userId,
          tenantId: String(user.tenantId || ""),
        });

      } catch (error) {
        // console.error(
        //   "OneSignal user identification failed:",
        //   error
        // );
      }
    };

    identifyUser();
  }, [user]);

  return children;
}