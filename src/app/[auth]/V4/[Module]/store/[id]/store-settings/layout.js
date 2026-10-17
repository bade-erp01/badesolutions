import React from "react";
import Nav1 from "@/app/Components/Nav1";
import { fetchUser } from "../../../../../../../../Functions/useerDataRefresh";
import Footer2 from "@/app/Components/Footer2";
import { serverApi } from "@/lib/serverApi";
import Page from './page'
import BackButton from "@/app/Components/BackBotton";
import SideNavWrapper from "@/app/Components/sideNavWrapper";




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

export default async function storelayout({ params }) {
  const userData = await fetchUser();
  // GET /api/Users -> { success, data: [{ _id, firstName, lastName, Email, image, status }] }
  const usersRes = await serverApi("/api/Users");
  const Employee = usersRes.ok ? usersRes.data?.data || [] : [];
  const Params = await params;
  const res = await serverApi(`/api/Stores/${Params.id}`);

    const data = res.data || {};
    const stores = data.Store;

    // find current storekeeper from employee list
    const currentStoreKeeper = Employee.find(staff => String(staff._id) === String(stores.StoreKeeper));

  return (
    <div className="flex flex-col ">
        <main className="flex-1">
          <Page staffs={JSON.stringify(Employee)} store={stores} currentStoreKeeper={currentStoreKeeper} />
        </main>
      </div>
  );
}
