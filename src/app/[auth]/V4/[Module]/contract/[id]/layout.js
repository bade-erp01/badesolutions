import { fetchUser } from "../../../../../../../Functions/useerDataRefresh";
import { notFound } from "next/navigation";
import { Dencrypt } from "../../../../../../../Functions/Functions";
import { serverApi } from "@/lib/serverApi";
import ContractDetailsPage from "./page";
import SuspenenseFallBack from "@/app/Components/SuspenenseFallBack";
import { Suspense } from "react";

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

export default async function ExpenseLayout({ children, params }) {
  const userData = await fetchUser();
  const moduleList = await params;

  // fetch all credit payment from all bank account
  const res = await serverApi(`/api/Contract/${moduleList.id}`);

  const data = res.data || {};

  if (!data.data) return notFound();

  const suspensewRite = Dencrypt(data.data)

  return (
    <Suspense fallback={<SuspenenseFallBack pagedata={`${suspensewRite.contractNumber}`} />}>
      <ContractDetailsPage
        data={Dencrypt(data.data)}
        payment={Dencrypt(data.payments)}
        Currentuser={userData.user}
        business={userData.business}
      />
    </Suspense>
  );
}
