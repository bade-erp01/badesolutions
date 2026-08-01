import React from 'react'
import ProductForm from "./page"
import {fetchUser} from '../../../../../../Functions/useerDataRefresh'
import {Encrypt} from "../../../../../../Functions/Functions"

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
         access: `${Encrypt(userData.user._id)}`,
         sessionKey: `Bearer ${Encrypt(userData.SessionId)}`
       },
     // cache: 'no-store', // Ensures fresh data on every request
    next: {
      revalidate: 60 ,// revalidate every 60 seconds
      cache: "force-cache"
    }
  })

  const VendorList = await res.json()

  return (
    <div className="flex flex-col">
        {/* Main Content Area */}
        <main className="flex-1 ">
          <ProductForm EXPRESS_PRIVATE_URL={baseUrl} userData={userData.user} businessData={userData.business} VendorList={VendorList}/>
        </main>
      </div>
  );
}



