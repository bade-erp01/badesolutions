import Notch from "@/app/Components/Notch";
import { fetchUser } from "../../../../../../../../../Functions/useerDataRefresh";
import { Encrypt,Dencrypt } from "../../../../../../../../../Functions/Functions";
import Footer2 from "@/app/Components/Footer2";
import BackButton from "@/app/Components/BackBotton";
import BankStatement from "@/app/Components/Reports/BankStatement"
import { notFound } from "next/navigation";
import Page from "./page"
import moment from "moment";

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

export default async function paymentlayout({ children, params }) {
  const moduleList = await params;
  const userData = await fetchUser();
  const baseUrl = process.env.EXPRESS_PRIVATE_URL;
  const res = await fetch(`${baseUrl}/api/Bank/Account/${moduleList.account}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
      access: `${Encrypt(userData.user._id)}`,
      sessionKey: `Bearer ${Encrypt(userData.SessionId)}`
    },
    next: { revalidate: 60 } // cache for 1 minutes
  });

  const data = await res.json();
  if(!data.account) return notFound()

  return (
    <div className="flex flex-col overflow-hidden">
        <Notch>
          <BackButton />
          <hr />
            {/* Sidebar content can go here */}
            <span  className="group flex items-center gap-4 p-3 rounded-md hover:bg-gray-700 transition text-sm w-full">
             Current Bal: {data.account.Balance.toLocaleString()}
            </span>
             <span  className="group flex items-center gap-4 p-3 rounded-md hover:bg-gray-700 transition text-xs w-full">
             Updated: {moment(data.account.updatedAt).fromNow()}
            </span>

            <BankStatement  dataArray={data.Entries} bank={data.account}/>
        </Notch>
        {/* Main Content Area */}
        <main className="flex-1 ">
          <Page data={data}/>
        </main>
      </div>
  );
}
