import React from 'react'
import NewCustomerForm from "./page"
import {fetchUser} from '../../../../../../Functions/useerDataRefresh'
import { serverApi } from "@/lib/serverApi"
import {notFound} from "next/navigation"


export const metadata = {
  title: "Business Automated Dynamic Enterprise [B.A.D.E]",
  description: "Business Automated Dynamic Enterprise [B.A.D.E] - Automate, Optimize, and Scale Your Business Operations",
  keywords: ["Business Automation", "Enterprise Solutions", "B.A.D.E", "AI-powered Business", "Workflow Optimization", "Process Automation"],
  author: "Business Automated Dynamic Enterprise",
  robots: "index, follow", // Allows search engines to index and follow links
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#f4a8ff", // Sets browser tab color (good for branding)
  ogTitle: "Business Automated Dynamic Enterprise [B.A.D.E] | Next-Level Automation",
  ogDescription: "Streamline your business with AI-driven automation, real-time insights, and scalability",
  ogImage: "/assets/bade.png", // Preview image when shared on social media
  ogUrl: "https://badesolutions.com.ng",
  twitterCard: "/assets/bade.png",
  twitterTitle: "Business Automated Dynamic Enterprise [B.A.D.E]",
  twitterDescription: "Automate and optimize your enterprise with cutting-edge business solutions",
  twitterImage: "/assets/bade.png",
};


export default async function crmLayout({ params }) {
  const userData = await fetchUser();

  if (!userData.user.createCustomer)  notFound()
    
  const moduleParams = params;
  const usersRes = await serverApi("/api/Users");
  const paresedSalesperson = (usersRes.data?.data || []).map(({ firstName, lastName, _id }) => ({ firstName, lastName, _id }));


  return (
    <div className="flex flex-col ">

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
         <NewCustomerForm userData={userData} businessData={userData.business} salesperson={paresedSalesperson}/>
        </main>
      </div>
  );
}
