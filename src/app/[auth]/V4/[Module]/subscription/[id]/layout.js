import React, { Suspense, lazy } from "react";
import BackButton from "@/app/Components/BackBotton";
import Notch from "@/app/Components/Notch";
import Page from "./page";
import { fetchUser } from "../../../../../../../Functions/useerDataRefresh";
import { Encrypt, Dencrypt } from "../../../../../../../Functions/Functions";

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
  ogImage: "/assets/bade.png",
  ogUrl: "https://badesolutions.com.ng",
  twitterCard: "/assets/bade.png",
  twitterTitle: "Business Automated Dynamic Enterprise [B.A.D.E]",
  twitterDescription:
    "Automate and optimize your enterprise with cutting-edge business solutions",
  twitterImage: "/assets/bade.png",
  favicon: "/favicon.ico",
};

export default async function StoreLayout2({ children, params }) {
  const userData = await fetchUser();
  const baseUrl = process.env.EXPRESS_PRIVATE_URL;
  const query = await params;

  const res = await fetch(`${baseUrl}/api/Subscription/${query.id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
      sessionKey: `Bearer ${Encrypt(userData.SessionId)}`,
      access: `${Encrypt(userData.user._id)}`,
    }
  });

  if (!res.ok) {
    return notFound();
  }

  const data = await res.json(); 

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Notch>
        <BackButton />
        <hr />
      </Notch>

      {/* Main Content */}
      <main className="flex-1">
          <Page data={Dencrypt(data.data)} baseUrl={baseUrl} subscribers={Dencrypt(data.subscribers)}/>
      </main>
    </div>
  );
}
