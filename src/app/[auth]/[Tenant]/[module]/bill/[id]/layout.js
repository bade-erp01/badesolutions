import React, { Suspense } from "react";
import SingleInvoice from "./page";
import { fetchUser } from "../../../../../../../Functions/useerDataRefresh";
import {Encrypt} from "../../../../../../../Functions/Functions";
import axios from "axios";
import { notFound } from "next/navigation";
import SuspenenseFallBack from "@/app/Components/SuspenenseFallBack";
import Nav1 from "@/app/Components/Nav1";
import BackButton from "@/app/Components/BackBotton";
import Footer2 from "@/app/Components/Footer2";
import MailAndWhatsapp from "@/app/Components/MailAndWhatsapp";
import ShareInvToStore from "@/app/Components/ShareInvToStore"
import PartialInvoiceDisplay from "@/app/Components/PartialInvoiceDisplay";
import SideNavWrapper from "@/app/Components/sideNavWrapper"



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
  themeColor: "#f4a8ff",
  applicationName: "B.A.D.E ERP",
  creator: "Bernard Fidels Ogoh",
  favicon: "favicon.ico",
};



// Async data fetching component
async function StoreLayoutContent({ params }) {
  const userInfo = await fetchUser();
  const Params = await params;
  let Inv = [],
    cust = [];

 const crmApp = userInfo.user.Apps.find((app) => app.Name === "CRM");

 // Option 1: Strict check (only allow if they have CRM or are on Basic plan)
 if (userInfo.business?.subscriptionplan !== "Basic" && !crmApp) {
   return notFound(); // or redirect, or show upgrade message
 }

  try {
    const baseUrl = process.env.EXPRESS_PRIVATE_URL;

    const res = await axios.get(`${baseUrl}/api/Invoice/${Params.id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Encrypt(userInfo.business.tenantId)}`,
        access: `${Encrypt(userInfo.user._id)}`,
        sessionKey: `Bearer ${Encrypt(userInfo.SessionId)}`
      },
    });

    const data = await res.data;

    Inv = data.Inv || [];
    cust = data.cust || [];
  } catch (err) {
    return (
      <div className="text-red-500 p-6">
        Failed to load. Please try again later.
      </div>
    );
  }

 return (
  <div className="flex flex-col">
    {/* Navigation Bar */}
    <Nav1
     user={userInfo.user}
     business={userInfo.business}
     page={`${Inv.billStatus?.toUpperCase() || "N/A"} / ${
      Inv.billReferenceNo || "N/A"
     } /${Inv.invoicelocation || "N/A"}`}
    />

    {/* Main Content Area */}
    <div className="flex flex-2 max-h-[83vh] overflow-y-hidden">
     {/* Aside (Left Sidebar) */}
     <SideNavWrapper>
      <BackButton />
      <hr className="my-4 border-gray-700" />
      <nav className="grow">
        <div className="bg-gray-700 rounded-lg shadow-md overflow-y-scroll max-h-[30vh]"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#4B5563 transparent' }}
        >
        
         <ul className="divide-y divide-gray-700">
          {Inv.ActivityLog?.map((log, index) => {
            return (
             <li key={index} className="py-3 px-4 text-xs text-italic">
              <div className="flex justify-between items-center">
                <span className="text-italic">{log.logMsg}</span>
              </div>
              <hr className="border-gray-500" />
             </li>
            );
          }) || <li className="py-3 px-4 text-sm">No activity logs.</li>}
         </ul>
        </div>
        <br />
        <hr/>
        {/* <span className="text-xs mt-2">Share via</span> */}
        <MailAndWhatsapp baseUrl={process.env.EXPRESS_PRIVATE_URL} billId={Inv._id} firstName={userInfo.user.firstName} userId={userInfo.user._id} businessToken={userInfo.business.tenantId} sessionId={userInfo.SessionId}/>
        <ShareInvToStore baseUrl={process.env.EXPRESS_PRIVATE_URL} billId={Inv._id} firstName={userInfo.user.firstName} userId={userInfo.user._id} businessToken={userInfo.business.tenantId} />
        <br />
        {Inv.memoId && (<PartialInvoiceDisplay data={Inv.memoId} business={userInfo.business} />)}
        <hr/>
       <div className="mt-4 p-4 rounded-lg bg-gray-200 shadow-md">
          <span className="block text-xs text-black/80 tracking-wide uppercase">
            Total Payment Recorded
          </span>
          <h5 className="mt-1 text-2xl font-semibold text-black">
            {userInfo.business.currency?.currency.Symbol}
            {Number(Inv?.paymentMethod)?.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            }) || 0}
          </h5>
        </div>
        <br />
      </nav>
     </SideNavWrapper>

     {/* Main Content (Right Side) */}
     <main className="flex-1 overflow-hidden">
      <section className=" flex-2 max-w-7xl h-[83vh] overflow-y-scroll">
        <SingleInvoice
         userInfo={userInfo}
         SinglebillItem={Inv}
         customerList={cust}
        />
      </section>
     </main>
    </div>

    {/* Footer */}
    <Footer2 />
  </div>
 );
}

// Main component with Suspense
export default function StoreLayout({ params }) {
  return (
    <Suspense fallback={<SuspenenseFallBack pagedata="invoice" />}>
      <StoreLayoutContent params={params} />
    </Suspense>
  );
}