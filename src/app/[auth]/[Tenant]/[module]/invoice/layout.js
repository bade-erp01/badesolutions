import Nav1 from "@/app/Components/Nav1";
import { fetchUser } from "../../../../../../Functions/useerDataRefresh";
import Link from "next/link";
import Image from "next/image";
import Footer2 from "@/app/Components/Footer2";
import BackButton from "@/app/Components/BackBotton";
import Invoice from "../../../../../../models/Invoices";
import Customer from "../../../../../../models/Customer";
import EMPLOYEES from "../../../../../../models/Users";
import {WHouse} from"../../../../../../models/Stores"
import {Encrypt} from "../../../../../../Functions/Functions"
import InvoiceLandingPage from "./page"
import {ArrowTrendingUpIcon} from "@heroicons/react/24/outline"
import SalesRportModal from "@/app/Components/Reports/SalesReport";
import DeliveryRportModal from "@/app/Components/Reports/DeliveryReport";

export const metadata = {
  title:
    "Business Automated Dynamic Enterprise [B.A.D.E]",
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
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#f4a8ff", // Sets browser tab color (good for branding)
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

export default async function Employeelayout({ children, params }) {
  const moduleList = await params;
  const userData = await fetchUser();
  const InvoiceList = await Invoice.findByTenant(userData.business.tenantId).sort({ _id: -1 }).lean();
  const customersList =  await Customer.findByTenant(userData.business.tenantId).sort({ _id: -1 }).lean();
  const Stores = await WHouse.findByTenant(userData.business.tenantId).sort({ _id: -1 }).lean();
  const users = await EMPLOYEES.findByTenant(userData.business.tenantId).sort({ firstName: 1 }).lean();

  return (
    <div className="flex flex-col min-h-screen overflow-hidden ">
      <Nav1
        user={userData.user}
        business={userData.business}
        page={moduleList.module}
        Module={JSON.stringify(InvoiceList)}
      />

      <div
        className="flex flex-1 text-white bt-2"
      >
        {/* Sidebar (collapsible on mobile) */}
        <aside
          className={` bg-[#1e1e20]/80 backdrop-blur-lg
              text-white px-4 py-6 transition-all duration-300 h-[520px] max-h-[600px] overflow-y-auto md:block`}
          style={{ maxHeight: "600px", overflowY: "scroll" }}
        >
         <BackButton />
          <hr />
          <nav className="space-y-4">
            {/* sales report modal */}
            <SalesRportModal data={JSON.stringify(InvoiceList)} customers={JSON.stringify(customersList)} Stores={JSON.stringify(Stores)} users={JSON.stringify(users)}/>

            <DeliveryRportModal data={JSON.stringify(InvoiceList)} customers={JSON.stringify(customersList)} Stores={JSON.stringify(Stores)} users={JSON.stringify(users)}/>
          </nav>

          
        </aside>{" "}
        {/* Main Content Area */}
        <main className="flex-1 ">
          <section className="relative w-full h-[520px] max-h-[600px] flex-grow overflow-x-auto shadow-inner backdrop-blur-md bg-[#0e0e11]/5 p-1 rounded-xl">
            {/* {children} */}
            <InvoiceLandingPage billList={JSON.stringify(InvoiceList)} userData={userData} />
          </section>
        </main>
      </div>
      <Footer2 />
    </div>
  );
}
