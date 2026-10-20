import React from "react";
import { headers } from "next/headers";
import { Toasts } from "./_ui/ui";
import GeoUpdater from "@/app/Components/LocationGrabber";
import { fetchUser } from "../../../Functions/whoIsSalesPerson";
import LocationGuard from "@/app/Components/GpsTracker";
import OneSignalProvider from "@/app/Components/OneSignalProvider";
import PushNotificationGate from "@/app/Components/PushNotificationGate";
import { WebSocketProvider } from "@/app/Components/WebSocketProvider";
import InstallPrompt from "./_ui/InstallPrompt";
import SalesManifest from "./_ui/SalesManifest";
import { SalesTheme } from "./_ui/theme";
import { THEME_BOOT } from "./_ui/themeBoot";

// Prevent static prerendering (session data is only available at request time)
export const dynamic = "force-dynamic";

export const metadata = {
  title: { default: "BADE Sales", template: "%s · BADE Sales" },
  description: "Your route, customers, products, orders and stock checks. Powered by BADE ERP.",
  applicationName: "BADE Sales",
  appleWebApp: { capable: true, title: "BADE Sales", statusBarStyle: "default" },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff", // switched to the dark header colour by _ui/theme.js in dark mode
};

export default async function layout({ children }) {
  const userData = await fetchUser();
  const nonce = (await headers()).get("x-nonce") || undefined; // the CSP allows only nonce'd inline scripts

  const hasValidSession = Boolean(userData?.user && userData?.business);

  // Signed in: push notifications (OneSignal) and live updates (Socket.IO) on every screen,
  // with the prompts to turn notifications on and to install the app.
  const signedIn = (
    <OneSignalProvider user={userData}>
      <WebSocketProvider user={userData}>
        <GeoUpdater userData={userData} baseUrl={process.env.EXPRESS_PRIVATE_URL} />
        <PushNotificationGate />
        <InstallPrompt />
        {children}
        <Toasts />
      </WebSocketProvider>
    </OneSignalProvider>
  );

  return (
    <>
      {/* light / dark mode: set before the first paint (outside the location gate, which
          holds its children back), then kept in sync */}
      <script
        nonce={nonce}
        suppressHydrationWarning // browsers hide a used nonce (nonce=""), which React reports as a mismatch
        // eslint-disable-next-line react/no-danger -- constant script from themeBoot.js, no user data
        dangerouslySetInnerHTML={{ __html: THEME_BOOT }}
      />
      <SalesTheme />
      <LocationGuard>
        {/* installs as "BADE Sales", opening on the Sales Portal */}
        <SalesManifest />
        {hasValidSession ? signedIn : (
          <>
            {children}
            <Toasts />
          </>
        )}
      </LocationGuard>
    </>
  );
}
