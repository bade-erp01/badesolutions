import React from 'react'
import Page from "./page"
import { notFound } from "next/navigation";
import { fetchUser } from "../../../../../../../../Functions/useerDataRefresh";
import { Encrypt, Dencrypt } from "../../../../../../../../Functions/Functions";
import moment from "moment"



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
  robots: "index, follow", // Allows search engines to index and follow links
  viewport: "width=device-width, initial-scale=1, theme-color=#f4a8ff", // Moved themeColor here
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
  facicon: "/favicon",
};

export default async function layout({params}) {
  const userData = await fetchUser();
  // First day of current month 
  const firstDay = moment().startOf("month").format("YYYY-MM-DD"); 
  // Last day of current month
  const lastDay = moment().endOf("month").format("YYYY-MM-DD");
  
  const baseUrl = process.env.EXPRESS_PRIVATE_URL;
    const res = await fetch(`${baseUrl}/api/Generate/profitandLoss?startDate=${firstDay}&endDate=${lastDay}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
        access: `${Encrypt(userData.user._id)}`,
      },
       next: { revalidate: 60 } // cache for 1 minutes
    });

    const data = await res.json()
    console.log(data)

    // decrypt the data

    // if(!DecryptedData.pnl || !res.ok){
    //   return notFound()
    // }

  return (
    <Page userData={userData} Data={data} EXPRESS_PRIVATE_URL={baseUrl}/>
  )
}
