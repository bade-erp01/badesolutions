import React from 'react'
import ProductForm from "./page"
import Nav1 from '@/app/Components/Nav1'
import Footer2 from '@/app/Components/Footer2'
import {fetchUser} from '../../../../../../../Functions/useerDataRefresh'
import {Encrypt} from "../../../../../../../Functions/Functions"
import Link from "next/link";
import Image from "next/image";

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
  favicon:'/favicon.ico'
};


export default async function Productlayout({ children, params }) {
  // const module = await params;
  const userData = await fetchUser();
   const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const res = await fetch(`${baseUrl}/api/vendors`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${ Encrypt(userData.business.tenantId)}`
    },
     // cache: 'no-store', // Ensures fresh data on every request
    next: {
      revalidate: 60 ,// revalidate every 60 seconds
      cache: "force-cache"
    }
  })

  const VendorList = await res.json()

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Nav1
        user={userData.user}
        business={userData.business}
        page={`New Product`}
      />

      <div
        className="flex flex-1 text-white bt-2"
      >
        {/* Sidebar (collapsible on mobile) */}
        <aside
          className={`w-70  bg-[#1e1e20]/70 backdrop-blur-md text-white px-4 py-6 transition-all duration-300 h-[500px] max-h-[600px] overflow-y-auto md:block`}
          style={{ maxHeight: "600px", overflowY: "scroll" }}
        >
         <h2 className="text-lg text-white font-bold mb-4">New Product</h2>
          <hr />
          <nav className="space-y-4 ">
            {userData?.user?.isAdmin && (
              <Link
                href={`/auth/Apps`}
                className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition"
              >
                <Image
                  src="https://img.icons8.com/avantgarde/100/apple-app-store.png"
                  width={24}
                  height={24}
                  alt="Settings"
                />
                <small>App Store</small>
              </Link>
            )}
          </nav>

          {/* Bottom Section with Settings Link */}
          <div className="absolute bottom-4 left-4">
            {userData?.user?.isAdmin && (
              <Link
                href={`/${userData?.business?.companyName
                  .toLowerCase()
                  .replace(/\s+/g, "-")
                  .replace(/[^a-z0-9-]/g, "")}/SetUp`}
                className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition"
              >
                <Image
                  src="https://img.icons8.com/3d-fluency/94/gear--v1.png"
                  width={24}
                  height={24}
                  alt="Settings"
                />
                <span>Settings</span>
              </Link>
            )}
          </div>
        </aside>{" "}
        {/* Main Content Area */}
        <main className="flex-1 ">
          <section className="w-full max-w-screen-xl mx-auto flex flex-col gap-6 rounded-lg p-6 relative z-10 h-[500px] overflow-y-auto">
            {/* {children} */}
             <ProductForm userData={userData.user} businessData={userData.business} VendorList={VendorList}/>
          </section>
        </main>
      </div>
      <Footer2 />
    </div>
  );
}



