import React from 'react'
import { fetchUser } from "../../../../Functions/whoIsSalesPerson";
import { redirect } from "next/navigation";
import TenantPage from "./page"
import RenewSubscription from "@/app/Components/RenewSubcription";
import { isSubscriptionExpired as subscriptionExpired } from "@/lib/subscription";

export const metadata = {
  title: "Home",
  robots: { index: false, follow: false },
};

// Force dynamic rendering
export const dynamic = "force-dynamic";

export default async function Layout() {
  const userData = await fetchUser();
  const baseUrl = process.env.EXPRESS_PRIVATE_URL

  // Redirect if either user OR business is missing
  if (!userData?.user || !userData?.business || userData.user.status !== "active" || !userData.user.isSalesRep) {
    redirect(userData?.reason === "elsewhere" ? "/SalesPortal/Login?reason=elsewhere" : "/SalesPortal/Login");
  }

  const isSubscriptionExpired = subscriptionExpired(userData.business.subscriptionEndDate); // to the end of the end date

  if (isSubscriptionExpired) {
    // Show renewal component directly
    return <RenewSubscription business={userData.business} baseUrl={baseUrl} User={userData}/>;
  }

  // (the toaster, push notifications and live updates are in the Sales Portal layout, for every screen)
  return <TenantPage userData={userData} baseUrl={baseUrl}/>;
}
