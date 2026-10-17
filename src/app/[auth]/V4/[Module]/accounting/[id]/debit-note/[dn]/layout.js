import React from "react";
import { fetchUser } from "../../../../../../../../../Functions/useerDataRefresh";
import { serverApi } from "@/lib/serverApi";
import Page from "./page";

export const metadata = {
  title: "Business Automated Dynamic Enterprise [B.A.D.E]",
  description: "Automate, Optimize, and Scale Your Business Operations",
  keywords: [
    /* ...keywords omitted for brevity... */
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

export default async function layout({ params }) {
  const userData = await fetchUser();
  const moduleList = await params;
  // fetch all credit payment from all bank account
  const baseUrl = process.env.EXPRESS_PRIVATE_URL;
  const res = await serverApi(`/api/DebitNote/${moduleList.dn}`);

  const data = res.data || {};
  try {
    return (
      <div className="flex flex-col">
        {/* Main Content */}
        <main className="flex-1">
          <Page data={data} userData={userData} baseurl={baseUrl} />
        </main>
      </div>
    );
  } catch (err) {
    return (
      <div className="">
        Failed to load. Please try again later.
      </div>
    );
  }
}
