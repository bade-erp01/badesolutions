import React from 'react';
import Wrapper from "@/app/Components/Wrapper";
import { ThemeProvider } from "@/components/theme-provider";
import { fetchUser } from "../../../../Functions/useerDataRefresh";
import { UserProvider } from "@/components/UserProvider";
import moment from "moment";
import RenewSubscription from "@/app/Components/RenewSubcription";
import { redirect } from "next/navigation";

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
  viewport: "width=device-width, initial-scale=1",
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
  const userInfo = userData?.user;
  const businessInfo = userData?.business;
  const SessionId = userData?.SessionId;
  const baseUrl = process.env.EXPRESS_PRIVATE_URL;
  // Redirect if either user OR business is missing
  if (
    !userInfo ||
    !businessInfo ||
    !SessionId ||
    userInfo.status !== "active" ||
    SessionId !== userInfo.SessionId
  ) {
    redirect("/Login");
  }

  const isSubscriptionExpired = moment().isAfter(
    moment(businessInfo.subscriptionEndDate),
  );

  if (isSubscriptionExpired) {
    // Show renewal component directly
    return (
      <RenewSubscription
        business={businessInfo}
        baseUrl={baseUrl}
        User={userInfo}
      />
    );
  }

  return (
    <ThemeProvider>
      <UserProvider user={userData}>
        <Wrapper>
          {children}
        </Wrapper>
      </UserProvider>
    </ThemeProvider>
  );
}