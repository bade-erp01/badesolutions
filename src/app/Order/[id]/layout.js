import React from "react";
import Page from "./page";
import {Dencrypt,Encrypt} from "../../../../Functions/Functions"
import { notFound } from "next/navigation";

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

// Server components can be async
export default async function Layout({ params }) {
  const baseUrl = process.env.EXPRESS_PRIVATE_URL;
  const  Token  = await params;

  // decode without verifying signature
    const decoded = Dencrypt(Token.id);

    if (!decoded || !decoded.id || !decoded.tenantId) {
      return notFound()
    }

  // find the ware house storekeeper from the bill whId and return the user
  const verifyBillStoreKeeper = await fetch(`${baseUrl}/api/Order/verify/${Encrypt(decoded.id)}`, {
    method: "GET",  
    cache: "no-store",      // disable caching
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${Encrypt(decoded.tenantId)}`,
    },
  });

  const invoice = await verifyBillStoreKeeper.json();

  if(!verifyBillStoreKeeper.ok) return (
    <div className="bg-white flex items-center justify-center min-h-screen">
      <div className="text-center">
        {/* <!-- Large 404 --> */}
        <h1 className="inline-block border-r border-gray-300 mr-5 pr-6 text-lg font-bold align-top cursor-pointer">
          Error!
        </h1>

        {/* <!-- Message --> */}
        <div className="inline-block text-left">
          <h2 className="text-sm font-normal text-gray-600 mb-2">
            {invoice.error || "Sorry, We couldn’t complete your request at the moment..!"}
          </h2>
        </div>
      </div>
    </div>
  );

  return <Page invoice={invoice} />;
}

