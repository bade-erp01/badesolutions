import React, { Suspense } from "react";
import Wrapper from "@/app/Components/Wrapper";
import { ThemeProvider } from "@/components/theme-provider";
import { fetchUser } from "../../../../Functions/useerDataRefresh";
import { UserProvider } from "@/components/UserProvider";
import moment from "moment";
import RenewSubscription from "@/app/Components/RenewSubcription";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { WebSocketProvider } from "@/app/Components/WebSocketProvider";
import OneSignalProvider from "@/app/Components/OneSignalProvider";
import PushNotificationGate from "@/app/Components/PushNotificationGate";
import { Toaster } from "sonner";
import PaymentReturnNotice from "@/app/Components/PaymentReturnNotice";

export const metadata = {
  title: "Business Automated Dynamic Enterprise [B.A.D.E]",
  description:
    "Business Automated Dynamic Enterprise [B.A.D.E] - Automate, Optimize, and Scale Your Business Operations",
  keywords: [
    "Business Automation",
    "Enterprise Solutions",
    "B.A.D.E",
    "AI-powered Business",
    "Workflow Optimization",
    "Process Automation",
  ],
  author: "Business Automated Dynamic Enterprise",
  robots: "index, follow",
  ogTitle:
    "Business Automated Dynamic Enterprise [B.A.D.E] | Next-Level Automation",
  ogDescription:
    "Streamline your business with AI-driven automation, real-time insights, and scalability",
  ogImage: "/assets/bade.png",
  ogUrl: "https://badesolutions.com.ng",
  twitterCard: "favicon.ico",
  twitterTitle: "Business Automated Dynamic Enterprise [B.A.D.E]",
  twitterDescription:
    "Automate and optimize your enterprise with cutting-edge business solutions",
  twitterImage: "favicon.ico",
  favicon: "favicon.ico",
};

export default async function layout({ children }) {
  const userData = await fetchUser();
  // next-themes injects an inline script; it needs the CSP nonce.
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const userInfo = userData?.user;
  const businessInfo = userData?.business;
  const baseUrl = process.env.EXPRESS_PRIVATE_URL;
  // Redirect if either user OR business is missing (fetchUser already checked the
  // backend session)
  if (
    !userInfo ||
    !businessInfo ||
    userInfo.status !== "active"
  ) {
    redirect("/Login");
  }

  const isSubscriptionExpired = moment().isAfter(
    moment(businessInfo.subscriptionEndDate),
  );

  if (isSubscriptionExpired) {
    // Show renewal component directly
    return (
      <>
        {/* result of a renewal that didn't go through */}
        <Toaster position="top-right" closeButton />
        <Suspense fallback={null}>
          <PaymentReturnNotice />
        </Suspense>
        <RenewSubscription
          business={businessInfo}
          baseUrl={baseUrl}
          User={userInfo}
        />
      </>
    );
  }

  return (
    <OneSignalProvider user={userData}>
      <WebSocketProvider user={userData}>
        <Toaster
          position="top-right"
          expand={true}
          richColors={false}
          closeButton
          duration={6000}
          toastOptions={{
            classNames: {
              toast:
                "group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:border group-[.toaster]:border-gray-200 group-[.toaster]:shadow-xl group-[.toaster]:rounded-2xl group-[.toaster]:p-4",
              title:
                "group-[.toast]:text-sm group-[.toast]:font-semibold group-[.toast]:text-gray-900",
              description:
                "group-[.toast]:text-sm group-[.toast]:text-gray-500",
              actionButton:
                "group-[.toast]:bg-gray-900 group-[.toast]:text-white group-[.toast]:text-xs group-[.toast]:font-medium group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:rounded-lg group-[.toast]:hover:bg-gray-800 transition-colors",
              cancelButton:
                "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-600 group-[.toast]:text-xs group-[.toast]:rounded-lg",
              closeButton:
                "group-[.toast]:bg-white group-[.toast]:border group-[.toast]:border-gray-200 group-[.toast]:text-gray-400 hover:group-[.toast]:text-gray-600",
            },
          }}
        />
        <PushNotificationGate />
        <Suspense fallback={null}>
          <PaymentReturnNotice />
        </Suspense>
        <ThemeProvider nonce={nonce}>
          <UserProvider user={userData}>
            <Wrapper>{children}</Wrapper>
          </UserProvider>
        </ThemeProvider>
      </WebSocketProvider>
    </OneSignalProvider>
  );
}
