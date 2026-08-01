import { fetchUser } from "../../../../../../../../../Functions/useerDataRefresh";
import BackButton from "@/app/Components/BackBotton";
import {
  Encrypt,
  Dencrypt,
} from "../../../../../../../../../Functions/Functions";
import Link from "next/link";
import { CreditCardIcon, BanknotesIcon } from "@heroicons/react/24/outline";
import { notFound } from "next/navigation";
import React, { Suspense, lazy } from "react";
const Page = lazy(() => import("./page"));
import SuspenenseFallBack from "@/app/Components/SuspenenseFallBack";
import Notch from "@/app/Components/Notch";

export const metadata = {
  title: "Business Automated Dynamic Enterprise [B.A.D.E]",
  description: "Automate, Optimize, and Scale Your Business Operations",
  keywords: [
    "Business Automation",
    "Enterprise Solutions",
    "B.A.D.E",
    "AI-powered Business",
    "Workflow Optimization",
    "Process Automation",
    "ERP in Nigeria",
    "Bernard fidels ogoh",
    "ERP in Abuja",
    "ERP in Lagos",
    "ERP in Port Harcourt",
    "Locally built ERP",
    "ERP for SMEs",
    "ERP for Enterprises",
    "ERP for Startups",
    "ERP for Corporates",
    "AI-powered ERP",
    "AI-driven Business Solutions",
    "AI Automation",
    "Affordable ERP",
    "Scalable ERP Solutions",
  ],
  author: "Business Automated Dynamic Enterprise",
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1, theme-color=#f4a8ff",
  ogTitle: "Business Automated Dynamic Enterprise [B.A.D.E]",
  ogDescription: "Streamline your business with AI-driven automation",
  ogImage: "/assets/bade.png",
  ogUrl: "https://badesolutions.com.ng",
  twitterCard: "/assets/bade.png",
  twitterTitle: "Business Automated Dynamic Enterprise [B.A.D.E]",
  twitterDescription: "Automate and optimize your enterprise",
  twitterImage: "/assets/bade.png",
  favicon: "favicon.ico",
};

export default async function AccountingPage({ params }) {
  const userData = await fetchUser();
  const moduleList = await params;

  // check if user has access to crm and cash register
  const AccountingFinder = userData.user.Apps.find((app) => {
    return app.Name === "Accounting";
  });

  if (!AccountingFinder) {
    return notFound();
  }

  // fetch all credit payment from all bank account
  const baseUrl = process.env.EXPRESS_PRIVATE_URL;
  const payable = await fetch(
    `${baseUrl}/api/Payable/Payment/${moduleList.SinglePayable}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
        access: `${Encrypt(userData.user._id)}`,
        sessionKey: `Bearer ${Encrypt(userData.SessionId)}`,
      },
      // next: { revalidate: 120 }, // Revalidate every 2 minutes
    },
  );

  const SinglePayable = await payable.json();
  try {
    return (
      <div className="flex flex-col min-h-screen overflow-hidden">
        {/* Sidebar */}
        <Notch>
          <BackButton />
          <hr className="border-gray-100 mb-4" />

          {(userData.user.creditOfficer || userData.user.isAccountant) && (
            <>
              <Link
                href={`/${moduleList.auth}/V4/${moduleList.Module}/${moduleList.Module}/Vendor-CreditNote/Vendor-CreditNote`}
                className="flex items-center gap-3 p-3 rounded-md hover:transition"
              >
                <CreditCardIcon className="h-5 w-5 text-gray-100" />
                <span className="text-xs">Vendor Credit Notes</span>
              </Link>

              <Link
                href={`/${moduleList.auth}/V4/${moduleList.Module}/${moduleList.Module}/Vendor-DebitNote/Vendor-DebitNote`}
                className="flex items-center gap-3 p-3 rounded-md hover:transition"
              >
                <BanknotesIcon className="h-5 w-5 text-gray-100" />
                <span className="text-xs">Vendor Debit Notes</span>
              </Link>
            </>
          )}
        </Notch>

        {/* Main Content */}
        <main className="flex-1">
          <Suspense fallback={<SuspenenseFallBack pagedata={``} />}>
            <Page
              data={SinglePayable?.data}
              userInfo={userData}
              baseUrl={baseUrl}
            />
          </Suspense>
        </main>
      </div>
    );
  } catch (err) {
    return <div className="">Failed to load. Please try again later.</div>;
  }
}
