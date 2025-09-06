import Nav1 from "@/app/Components/Nav1";
import { fetchUser } from "../../../../../../Functions/useerDataRefresh";
import Link from "next/link";
import Card from "@/app/Components/Card";
import Image from "next/image";
import Footer2 from "@/app/Components/Footer2";
import ExcelDownloadBtn from "@/app/Components/ExcelDownloadBtn";
import { Encrypt } from "../../../../../../Functions/Functions";
import {ChartPieIcon,  UserGroupIcon,ShoppingCartIcon,ClipboardDocumentCheckIcon,PlusCircleIcon } from "@heroicons/react/24/outline";

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
  favicon:'/favicon.ico'
};

export default async function storelayout({ children, params }) {
  const module = await params;
  const userData = await fetchUser();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const res = await fetch(`${baseUrl}/api/storeApi`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userData.business.tenantId}`,
    },
    next: {
      revalidate: 120, // 2 minutes
    },
  });


  const StoreList = await res.json();

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Nav1
        user={userData.user}
        business={userData.business}
        page={`${"Stores"}`}
        Module={StoreList}
      />

      <div className="flex flex-1 text-white bt-2">
        {/* Sidebar (collapsible on mobile) */}
        <aside
          className={`w-70 bg-[#1e1e20]/70 backdrop-blur-md 
              text-white px-4 py-6 transition-all duration-300 h-[500px] max-h-[600px] overflow-y-auto md:block`}
          style={{ maxHeight: "600px", overflowY: "scroll" }}
        >
          <h2 className="text-lg text-white font-bold mb-4">
            Store Management
          </h2>
          <hr />
          <nav className="space-y-4">
            {userData.user.isAdmin && (
            <Link
              href={`/${userData.business?.companyName
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, "")}/${Encrypt(
                userData?.user._id
              )}/Module/Forms/${module.module.toLowerCase()}`}
              className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition"
            >
              <PlusCircleIcon className="h-6 w-6 text-gray-100"/>
              <small>New Store</small>
            </Link>
          )}
          
          {(userData?.user?.raiseLpo || userData?.user?.editVendor) && (
            <>
                <Link
                  href={`/${userData.business?.companyName
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^a-z0-9-]/g, "")}/${Encrypt(
                    userData?.user._id
                  )}/vendor/vendor`}
                  className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition"
                >
                  <UserGroupIcon
                    aria-hidden="true"
                    className="h-6 w-6 text-gray-100"
                  />
                  <small>Vendors Management</small>
                </Link>
            </>
          )}

            {/* create purchase */}
           {(userData?.user?.raiseLpo || userData?.user?.allowInternalTransfers) && (
            <>
                <Link
                  href={`/${userData.business?.companyName
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^a-z0-9-]/g, "")}/${Encrypt(
                    userData?.user._id
                  )}/purchase/Forms/purchase`}
                  className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition"
                >
                  <ShoppingCartIcon className="h-6 w-6 text-gray-100" />
                  <small>Purchase Requests</small>
                </Link>

                <Link
                  href={`/${userData.business?.companyName
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^a-z0-9-]/g, "")}/${Encrypt(
                    userData?.user._id
                  )}/Module/Forms/transfer`}
                  className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition"
                >
                  <ClipboardDocumentCheckIcon className="h-6 w-6 text-gray-100" />
                  <small>Product Transfer Request</small>
                </Link>
            </>
          )}

              <Link
                href={`/auth/Apps`}
                className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition"
                >
                < ChartPieIcon className="h-7 w-7 text-gray-100" />
                <small>Reporting</small>
              </Link>
                { StoreList.length > 0 && (
                  <ExcelDownloadBtn data={StoreList} page="store" />
                )}
          </nav>

        </aside>{" "}
        {/* Main Content Area */}
        <main className="flex-1 ">
          <section className="w-full max-w-screen-xl p-1 mx-auto flex flex-col gap-6 rounded-lg  relative z-10 h-[500px] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
              {StoreList.map((element) => (
                <Card
                  key={element._id}
                  data={JSON.parse(JSON.stringify(element))}
                  module={"store"}
                />
              ))}
            </div>
          </section>
        </main>
      </div>
      <Footer2 />
    </div>
  );
}
