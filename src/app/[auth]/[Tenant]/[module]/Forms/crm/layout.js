import React from 'react'
import NewCustomerForm from "./page"
import Nav1 from '@/app/Components/Nav1'
import Footer2 from '@/app/Components/Footer2'
import {fetchUser} from '../../../../../../../Functions/useerDataRefresh'
import User from "../../../../../../../models/Users"



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

export default async function CustomerFormlayout() {
    const userData = await fetchUser();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/UsersApi`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ userData.business.tenantId}`
      }
    })

    const salesperson = await res.json(); // Ensure customer data is available

  return (
    <>
   <Nav1  user={userData.user} business={userData.business} page={'Customer Form'} />
    <NewCustomerForm userData={userData} businessData={userData.business} salesperson={salesperson} />
    <Footer2 />
    </>
  )
}
