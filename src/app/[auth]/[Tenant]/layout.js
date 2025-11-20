import CookiesPolicyAlert from "@/app/Components/Cookies";
import { fetchUser } from "../../../../Functions/useerDataRefresh";
import { redirect } from "next/navigation";
import moment from "moment";
import RenewSubscription from "@/app/Components/RenewSubcription"; // hypothetical component

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

export default async function Layout({ children }) {
  const userData = await fetchUser();
  const userInfo = userData?.user;
  const businessInfo = userData?.business;

  if (!userInfo || !businessInfo || userInfo.status !== "active") {
    redirect("/Login");
  }

  const isSubscriptionExpired = moment().isAfter(moment(businessInfo.subscriptionEndDate));

  if (isSubscriptionExpired) {
    // Option 1: Redirect to renewal page
    // redirect("/Renew");

    // Option 2: Show renewal component directly
    return <RenewSubscription business={businessInfo}/>;
  }

  return <div style={{ overflowY: "hidden" }}>
     <CookiesPolicyAlert />
    {children}
    </div>;
}
