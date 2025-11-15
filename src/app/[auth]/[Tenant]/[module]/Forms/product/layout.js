import React from 'react'
import ProductForm from "./page"
import Nav1 from '@/app/Components/Nav1'
import Footer2 from '@/app/Components/Footer2'
import {fetchUser} from '../../../../../../../Functions/useerDataRefresh'
import {Encrypt} from "../../../../../../../Functions/Functions"
import BackButton from "@/app/Components/BackBotton";

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
   const baseUrl = process.env.EXPRESS_PRIVATE_URL;
  const res = await fetch(`${baseUrl}/api/Vendors`, {
    method: "GET",
    headers: {
         "Content-Type": "application/json",
         Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
         dbConnect: `Bearer ${userData.business.rustyRoof}`,
         access: `${Encrypt(userData.user._id)}`,
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
         className="w-70 bg-[#1e1e20]/70 backdrop-blur-md text-white px-4 py-6 transition-all duration-300 max-h-[90dvh] md:block"
          style={{ overflowY: "auto" }}
        >
         <h2 className="text-lg text-white font-bold mb-4">New Product</h2>
          <hr />
          <nav className="space-y-4 ">
           <BackButton />
          </nav>

          
        </aside>{" "}
        {/* Main Content Area */}
        <main className="flex-1 ">
          <section className="w-full max-w-screen-xl mx-auto flex flex-col gap-6 rounded-lg p-3 relative z-10 max-h-[83dvh] overflow-y-auto">
            {/* {children} */}
             <ProductForm EXPRESS_PRIVATE_URL={baseUrl} userData={userData.user} businessData={userData.business} VendorList={VendorList}/>
          </section>
        </main>
      </div>
      <Footer2 />
    </div>
  );
}



