import Nav1 from "@/app/Components/Nav1";
import { fetchUser } from "../../../../../../Functions/useerDataRefresh";
import Link from "next/link";
import Image from "next/image";
import Footer2 from "@/app/Components/Footer2";
import BackButton from "@/app/Components/BackBotton";
import ExcelDownloadBtn from "@/app/Components/ExcelDownloadBtn";
import {Encrypt} from "../../../../../../Functions/Functions"
import { ChartPieIcon, BackwardIcon, ForwardIcon } from "@heroicons/react/24/outline";
import bankAccount from "../../../../../../models/BankAccount"
import Customers from "../../../../../../models/Customer"
import CashregisterReport from "@/app/Components/Reports/CashregisterReport";

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
};

export default async function paymentlayout({ children, params }) {
  const module = await params;
  const userData = await fetchUser();
   const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const res = await fetch(`${baseUrl}/api/cashRegister`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ userData.business.tenantId}`
      }
    })
    
    const Accountslist = await bankAccount.findByTenant(userData.business.tenantId).lean()
    const CustomersList = await Customers.findByTenant(userData.business.tenantId).lean()
    const PaymentList = await res.json()

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Nav1
        user={userData.user}
        business={userData.business}
        page={`${module.module}`}
        Module={PaymentList}
      />

      <div
        className="flex flex-1 text-white bt-2 "
       
      >
        {/* Sidebar (collapsible on mobile) */}
        <aside
          className={`bg-[#1e1e20]/80 backdrop-blur-lg
          text-white px-4 py-6 transition-all duration-300 h-[500px] max-h-[600px] overflow-y-auto md:block`}
          style={{ maxHeight: "600px", overflowY: "scroll" }}
        >
         <BackButton />
          <hr />
          <nav className="space-y-4">
            <CashregisterReport data={PaymentList} banks={JSON.stringify(Accountslist)} customers={JSON.stringify(CustomersList)}/>
          </nav>
        </aside>{" "}
        {/* Main Content Area */}
        <main className="flex-1 ">
          <section className="w-full max-w-screen-xl mx-auto flex flex-col gap-6 rounded-lg p-6 relative z-10 h-[500px] overflow-y-auto">
            {children}
          </section>
        </main>
      </div>
      <Footer2 />
    </div>
  );
}
