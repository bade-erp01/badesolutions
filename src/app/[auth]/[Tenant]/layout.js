import CookiesPolicyAlert from "@/app/Components/Cookies";
import { fetchUser } from "../../../../Functions/useerDataRefresh";
import { redirect } from "next/navigation";
import moment from "moment";
import PrivacyIdleOverlay from "@/app/Components/PrivacyOverlay"
import RenewSubscription from "@/app/Components/RenewSubcription"; 
// hypothetical component

export const metadata = {
  title: "Business Automated Dynamic Enterprise [B.A.D.E]",
  description: "Business Automated Dynamic Enterprise [B.A.D.E] - Automate, Optimize, and Scale Your Business Operations",
  keywords: ["Business Automation", "Enterprise Solutions", "B.A.D.E", "AI-powered Business", "Workflow Optimization", "Process Automation"],
  author: "Business Automated Dynamic Enterprise",
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1",
  ogTitle: "Business Automated Dynamic Enterprise [B.A.D.E] | Next-Level Automation",
  ogDescription: "Streamline your business with AI-driven automation, real-time insights, and scalability",
  ogImage: "/assets/bade.png",
  ogUrl: "https://badesolutions.com.ng",
  twitterCard: "favicon.ico",
  twitterTitle: "Business Automated Dynamic Enterprise [B.A.D.E]",
  twitterDescription: "Automate and optimize your enterprise with cutting-edge business solutions",
  twitterImage: "favicon.ico",
  favicon: "favicon.ico",
};

//  Force dynamic rendering
export const dynamic = "force-dynamic";

export default async function Layout({ children }) {
  const userData = await fetchUser();
  const userInfo = userData?.user;
  const businessInfo = userData?.business;
  const SessionId = userData?.SessionId;
  const baseUrl = process.env.EXPRESS_PRIVATE_URL;
  // Redirect if either user OR business is missing 
  if (!userInfo || !businessInfo || !SessionId || userInfo.status !== "active" || SessionId !== userInfo.SessionId) {
    redirect("/Login");
  }

  const isSubscriptionExpired = moment().isAfter(moment(businessInfo.subscriptionEndDate));

  if (isSubscriptionExpired) {
    // Show renewal component directly
    return <RenewSubscription business={businessInfo} baseUrl={baseUrl} User={userInfo} />;
  }

  return (
    <PrivacyIdleOverlay 
      idleTimeMs={300000} // 5 minutes
      userData={userData}
      SessionId={SessionId}
      requirePin={false}
    >
      <CookiesPolicyAlert />
      {children}
    </PrivacyIdleOverlay>
  );
}
