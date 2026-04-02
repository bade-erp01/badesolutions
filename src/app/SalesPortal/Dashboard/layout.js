import React from 'react'
import { fetchUser } from "../../../../Functions/whoIsSalesPerson";
import { redirect } from "next/navigation";
import CookiesPolicyAlert from "@/app/Components/Cookies"
import TenantPage from "./page"
import moment from "moment";
import RenewSubscription from "@/app/Components/RenewSubcription";
import { Dencrypt } from "../../../../Functions/Functions"

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

// Force dynamic rendering
export const dynamic = "force-dynamic";

export default async function Layout() {
  const userData = await fetchUser();
  const SessionId = Dencrypt(userData?.SessionId)
  const baseUrl = process.env.EXPRESS_PRIVATE_URL

  // Redirect if either user OR business is missing 
  if (!userData?.user || !userData?.business || !SessionId || userData.user.status !== "active" || SessionId !== userData.user.SessionId) {
    redirect('/SalesPortal/Login');
  }

  const isSubscriptionExpired = moment().isAfter(moment(userData.business.subscriptionEndDate));

  if (isSubscriptionExpired) {
    // Show renewal component directly
    return <RenewSubscription business={userData.business} baseUrl={baseUrl} User={userData}/>;
  }

  return (
    <>
      <CookiesPolicyAlert />
      <TenantPage userData={userData}/>
    </>
  );
}
