import React from "react";
import Nav1 from "@/app/Components/Nav1";
import { fetchUser } from "../../../../../../../../Functions/useerDataRefresh";
import Footer2 from "@/app/Components/Footer2";
import Users from '../../../../../../../../models/Users'
import Page from './page'
import BackButton from "@/app/Components/BackBotton";

export const metadata = {
  title: "Stores Settings | B.A.D.E ERP Platform",
  description:
    "Configure and manage your stores with B.A.D.E — Nigeria’s leading AI-powered ERP solution for businesses of all sizes. Built for scalability, automation, and real-time insights.",
  keywords: [
    "Store Management",
    "ERP Nigeria",
    "Business Automation",
    "B.A.D.E",
    "AI ERP",
    "Retail Optimization",
    "Inventory Control",
    "Bernard Fidels Ogoh",
    "ERP Abuja",
    "ERP Lagos",
    "ERP Port Harcourt",
    "Nigerian Business Software",
    "SME ERP",
    "Enterprise Resource Planning",
    "AI Business Tools",
    "Affordable ERP Nigeria",
    "Scalable ERP",
    "Digital Transformation",
    "Next-gen ERP",
    "Business Intelligence",
    "Workflow Automation",
    "Store Settings Dashboard",
    "Tenant Management",
    "Multi-store ERP",
  ],
  author: "Business Automated Dynamic Enterprise [B.A.D.E]",
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1, theme-color=#f4a8ff",
  ogTitle: "Store Settings | B.A.D.E ERP Platform",
  ogDescription:
    "Take control of your store operations with B.A.D.E — the smart ERP for Nigerian enterprises.",
  ogImage: "/assets/store-settings-og.png",
  ogUrl: "https://badesolutions.com.ng/storelayout",
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: "Store Settings | B.A.D.E ERP Platform",
  twitterDescription:
    "Manage your stores with ease using B.A.D.E — Nigeria’s AI-powered ERP solution.",
  twitterImage: "/assets/store-settings-og.png",
  themeColor: "#f4a8ff",
  applicationName: "B.A.D.E ERP",
  creator: "Bernard Fidels Ogoh",
  favicon: "favicon.ico",
};

export default async function storelayout({ children, params }) {
  const userData = await fetchUser();
  const Employee = await Users.findByTenant(userData.business.tenantId).lean();
  const Params = await params
  const baseUrl = process.env.EXPRESS_PRIVATE_URL;
  const res = await fetch(`${baseUrl}/api/Stores/${Params.id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userData.business.tenantId}`,
      dbConnect: `Bearer ${userData.business.rustyRoof}`,
    },
    // next: {
      //   revalidate: 120, // 2 minutes
      // },
    });
    
    const data = await res.json();
    const stores = data.Store;

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Nav1
        user={userData.user}
        business={userData.business}
        page={`${stores.WHName} Settings`}
      />

      <div className="flex flex-1 text-white bt-2">
        <aside
          className="w-75 bg-[#1e1e20]/70 backdrop-blur-md text-white px-4 py-6 transition-all duration-300 h-[500px] max-h-[600px] overflow-y-auto md:block"
          style={{ maxHeight: "600px", overflowY: "scroll" }}
        >
          <BackButton />
          <hr />
          <nav className="space-y-4">
            
          </nav>
        </aside>

        <main className="flex-1">
          <section className="w-full max-w-screen-xl p-1 mx-auto flex flex-col gap-6 rounded-lg relative z-10 h-[500px] overflow-y-auto">
            <Page staffs={JSON.stringify(Employee)} store={stores} />
          </section>
        </main>
      </div>
      <Footer2 />
    </div>
  );
}
