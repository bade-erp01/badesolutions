import React from "react";
import { fetchUser } from "../../../../Functions/whoIsSalesPerson";
import { redirect } from "next/navigation";
import { Encrypt, Dencrypt } from "../../../../Functions/Functions";
import Page from"./page";
import BackButton from "@/app/Components/BackBotton";

export const metadata = {
  title: "B.A.D.E ERP Platform",
  description:
    "Configure and manage your stores with B.A.D.E — Nigeria’s leading AI-powered ERP solution for businesses of all sizes. Built for scalability, automation, and real-time insights.",
  keywords: [
    "Store Management",
    "ERP Nigeria",
    "Business Automation",
    "B.A.D.E",
    "AI ERP",
    "Retail Optimization",
    "Inventory Control",
    "Bernard Fidels Ogoh",
    "ERP Abuja",
    "ERP Lagos",
    "ERP Port Harcourt",
    "Nigerian Business Software",
    "SME ERP",
    "Enterprise Resource Planning",
    "AI Business Tools",
    "Affordable ERP Nigeria",
    "Scalable ERP",
    "Digital Transformation",
    "Next-gen ERP",
    "Business Intelligence",
    "Workflow Automation",
    "Store Settings Dashboard",
    "Tenant Management",
    "Multi-store ERP",
  ],
  author: "Business Automated Dynamic Enterprise [B.A.D.E]",
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1, theme-color=#f4a8ff",
  ogTitle: " B.A.D.E ERP Platform",
  ogDescription:
    "Take control of your store operations with B.A.D.E — the smart ERP for Nigerian enterprises.",
  ogImage: "/assets/store-settings-og.png",
  ogUrl: "https://badesolutions.com.ng/storelayout",
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: " B.A.D.E ERP Platform",
  twitterDescription:
    "Manage your stores with ease using B.A.D.E — Nigeria’s AI-powered ERP solution.",
  twitterImage: "/assets/store-settings-og.png",
  applicationName: "B.A.D.E ERP",
  creator: "Bernard Fidels Ogoh",
  favicon: "favicon.ico",
};

export const dynamic = "force-dynamic";

export default async function layout({ params }) {
  const userData = await fetchUser();
  const baseUrl = process.env.EXPRESS_PRIVATE_URL;
  const SessionId = Dencrypt(userData?.SessionId);
  const Params = await params;

  // Redirect if either user OR business is missing
  if (
    !userData?.user ||
    !userData?.business ||
    !SessionId ||
    userData.user.status !== "active" ||
    SessionId !== userData.user.SessionId || !userData.user.isSalesRep
  ) {
    redirect("/SalesPortal/Login");
  }

  let data;

  try {
    const res = await fetch(`${baseUrl}/api/Sales_Portal/Route/${Encrypt(userData?.user._id)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Encrypt(userData?.user?.tenantId)}`,
        access: `${Encrypt(userData?.user?._id)}`,
        sessionKey: `Bearer ${userData.SessionId}`
      },
      next: { revalidate: 60 },
    });
    if (res.ok) {
      data = await res.json();
    }else{
      throw new Error(res.error || "Failed to fetch data")
    }
  } catch (err) {
    return (<p>{err.message}</p>)
  }
  return (
    <div className="">
     <nav className="sticky top-0 z-20 backdrop-blur bg-white/80 border-b border-slate-200 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
            {/* Left: Username */}
            <h1 className="min-w-0 truncate text-base sm:text-lg font-semibold tracking-tight text-slate-900">
            Todays Routes 
            </h1>

            {/* Right: Back button */}
            <div className="flex shrink-0 items-center">
            <BackButton />
            </div>
        </div>
        </nav>
      <Page
        userInfo={userData}
        data={data.todayRoute}
      />
    </div>
  );
}
