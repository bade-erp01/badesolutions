
import { fetchUser } from "../../../../../../../../Functions/useerDataRefresh";
import { serverApi } from "@/lib/serverApi";
import { notFound } from "next/navigation";
import FinancialOverview from "./page"

export const metadata = {
  title: "Business Automated Dynamic Enterprise [B.A.D.E]",
  description: "Automate, Optimize, and Scale Your Business Operations",
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

export default async function AccountingPage({ children, params }) {
  const userData = await fetchUser();
  const moduleList = await params;

  // check if user has access to crm and cash register
  const AccountingFinder = userData.user.Apps.find((app) => {
    return app.Name === "Accounting";
  });

  if (!AccountingFinder) {
    return notFound();
  }

  // fetch all credit payment from all bank account
  const baseUrl = process.env.EXPRESS_PRIVATE_URL;
  const res = await serverApi(`/api/COA`);

  const data = res.data || {};

  try {
    return (
      <div className="flex flex-col">
         
          {/* Main Content */}
          <main className="flex-1">
           <FinancialOverview data={data.COA} url={baseUrl} userData={userData}/>
          </main>
        </div>
    );
  } catch (err) {
    return (
      <div className="">
        Failed to load. Please try again later.{err.message}
      </div>
    );
  }
}

