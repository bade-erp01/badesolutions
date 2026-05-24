import React from "react";
import SingleProductpage from "./page";
import { Dencrypt, Encrypt } from "../../../../../../../Functions/Functions";
import { fetchUser } from "../../../../../../../Functions/useerDataRefresh";
import Nav1 from "@/app/Components/Nav1";
import Footer2 from "@/app/Components/Footer2";
import Link from "next/link";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import BackButton from "@/app/Components/BackBotton";
import SideNavWrapper from "@/app/Components/sideNavWrapper";



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
  ogTitle:
    "Business Automated Dynamic Enterprise [B.A.D.E] | Next-Level Automation",
  ogDescription:
    "Streamline your business with AI-driven automation, real-time insights, and scalability",
  ogImage: "/assets/bade.png", // Preview image when shared on social media
  ogUrl: "https://badesolutions.com.ng",
  twitterCard: "/assets/bade.png",
  twitterTitle: "Business Automated Dynamic Enterprise [B.A.D.E]",
  twitterDescription:
    "Automate and optimize your enterprise with cutting-edge business solutions",
  twitterImage: "/assets/bade.png",
  favicon: "favicon.ico",
};

export default async function layout({ params, children }) {
  const userInfo = await fetchUser();
  const baseUrl = process.env.EXPRESS_PRIVATE_URL;
  const decoy = await params;

  const res = await fetch(`${baseUrl}/api/Product/${decoy.id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Encrypt(userInfo.business.tenantId)}`,
      access: `${Encrypt(userInfo.user._id)}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    return (
      <div className="text-black p-6">
        Failed to load. Please try again later.
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Nav1
        user={userInfo.user}
        business={userInfo.business}
        page={data.product.Name}
      />

      <div className="flex flex-1 text-white bt-2">
        {/* Sidebar */}
        <SideNavWrapper>
            <BackButton/>
          <hr />
          <nav className="space-y-4">
            {userInfo?.user?.createProduct && (
              <Link
                href={`/${userInfo.business.companyName
                  .toLowerCase()
                  .replace(/\s+/g, "-")
                  .replace(/[^a-z0-9-]/g, "")}/${Encrypt(
                  userInfo.user._id
                )}/Module/Forms/${decoy.module.toLowerCase()}`}
                className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition"
              >
                <PlusCircleIcon className="h-4 w-4 text-gray-100" />
                <span className="text-xs">New Product</span>
              </Link>
            )}
            {/* activity log */}
            <div className="bg-gray-700 rounded-lg shadow-md overflow-y-scroll max-h-[30vh]"
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#4B5563 transparent' }}
              >
            <ul className="divide-y divide-gray-700">
              {data.product.ActivityLog?.map((log, index) => {
                return (
                <li key={index} className="py-3 px-4 text-xs text-italic">
                  <div className="flex justify-between items-center">
                    <span className="text-italic text-xs">{log.logMsg}</span>
                  </div>
                  <hr className="border-gray-500" />
                </li>
                );
              }) || <li className="py-3 px-4 text-sm">No audit logs.</li>}
            </ul>
          </div>
          </nav>
        </SideNavWrapper>

        {/* Main Content */}
        <main className="flex-1">
          <section className="w-full max-w-screen-xl mx-auto flex flex-col gap-6 rounded-lg p-3 relative z-10 max-h-[83dvh] overflow-y-auto">
            <SingleProductpage
              userInfo={userInfo.user}
              businessInfo={userInfo.business}
              Backdata={data.product}
              vendor={data.vendorList}
              module={decoy.module}
              storeProducts={data.inventoryItem}
            />
          </section>
        </main>
      </div>

      <Footer2 />
    </div>
  );
}
