import React from 'react'
import NewCustomerForm from "./page"
import Nav1 from '@/app/Components/Nav1'
import Footer2 from '@/app/Components/Footer2'
import {fetchUser} from '../../../../../../../Functions/useerDataRefresh'
import EMPLOYEES from "../../../../../../../models/Users"
import {
  ClipboardDocumentListIcon,
  PlusCircleIcon
} from "@heroicons/react/24/outline";
import BackButton from "@/app/Components/BackBotton";
import { Encrypt } from '../../../../../../../Functions/Mics'
import Link from 'next/link'


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


export default async function crmLayout({ params }) {
  const userData = await fetchUser();
  const moduleParams = params;
  const salesperson = await EMPLOYEES.findByTenant(userData.business.tenantId).lean();

  return (
    <div className="flex flex-col h-screen">
      <Nav1
        user={userData.user}
        business={userData.business}
        page={`New customer`}
      />

      <div className="flex flex-1 overflow-hidden text-white">
        {/* Sidebar */}
        <aside className="bg-[#1e1e20]/70 backdrop-blur-md w-72 px-4 py-6 overflow-hidden">
          <BackButton />
          <hr />
          <nav className="space-y-4">
           
            {userData?.user?.raiseInvoice && (
              <Link
                href={`/${userData.business.companyName
                  .toLowerCase()
                  .replace(/\s+/g, "-")
                  .replace(/[^a-z0-9-]/g, "")}/${Encrypt(userData.user._id)}/invoice/invoice`}
                className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition"
              >
                <ClipboardDocumentListIcon className="h-6 w-6 text-gray-100" />
                <span className="text-xs">Invoicing</span>
              </Link>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <section className="w-full max-w-screen-xl mx-auto flex flex-col gap-6 rounded-lg p-6">
            <NewCustomerForm userData={userData} businessData={userData.business} salesperson={salesperson} />
          </section>
        </main>
      </div>

      <Footer2 />
    </div>
  );
}
