import Nav1 from "@/app/Components/Nav1";
import { fetchUser } from "../../../../../../Functions/useerDataRefresh";
import dbConnect from "../../../../../../lib/mongoose"
import Link from "next/link";
import Card from "@/app/Components/Card";
import Footer2 from "@/app/Components/Footer2";
import ExcelDownloadBtn from "@/app/Components/ExcelDownloadBtn";
import { Encrypt } from "../../../../../../Functions/Functions";
import {ChartPieIcon, ShoppingBagIcon, UserGroupIcon,ShoppingCartIcon,ClipboardDocumentCheckIcon,PlusCircleIcon } from "@heroicons/react/24/outline";


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
  const moduleList = await params;
  const userData = await fetchUser();
  const baseUrl = process.env.EXPRESS_PRIVATE_URL;
  const res = await fetch(`${baseUrl}/api/Stores`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userData.business.tenantId}`,
      dbConnect: `Bearer ${userData.business.rustyRoof}`,
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
          className="w-70 bg-[#1e1e20]/70 backdrop-blur-md text-white px-4 py-6 transition-all duration-300 max-h-[83dvh] md:block"
          style={{ overflowY: "auto" }}
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
              )}/Module/Forms/${moduleList.module.toLowerCase()}`}
              className="flex items-center text-xs gap-3 p-3 rounded-md hover:bg-gray-700 transition"
            >
              <PlusCircleIcon className="h-6 w-6 text-gray-100"/>
              <span className="text-xs">New Store</span>
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
                  className="flex items-center text-xs gap-3 p-3 rounded-md hover:bg-gray-700 transition"
                >
                  <UserGroupIcon
                    aria-hidden="true"
                    className="h-6 w-6 text-gray-100"
                  />
                  <span className="text-xs">Vendors Management</span>
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
                  )}/Transit/Forms/Transit`}
                  className="flex items-center text-xs gap-3 p-3 rounded-md hover:bg-gray-700 transition"
                >
                  <ShoppingCartIcon className="h-6 w-6 text-gray-100" />
                  <span className="text-xs">Purchase Request</span>
                </Link>


                <Link
                  href={`/${userData.business?.companyName
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^a-z0-9-]/g, "")}/${Encrypt(
                    userData?.user._id
                  )}/purchase/Forms/purchase`}
                  className="flex items-center text-xs gap-3 p-3 rounded-md hover:bg-gray-700 transition"
                >
                  <ShoppingBagIcon className="h-6 w-6 text-gray-100" />
                 <span className="text-xs">Purchase Order</span>
                </Link>

                <Link
                  href={`/${userData.business?.companyName
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^a-z0-9-]/g, "")}/${Encrypt(
                    userData?.user._id
                  )}/Module/product-transfers`}
                  className="flex items-center text-xs gap-3 p-3 rounded-md hover:bg-gray-700 transition"
                >
                  <ClipboardDocumentCheckIcon className="h-6 w-6 text-gray-100" />
                  <span className="text-xs">Product Transfer</span>
                </Link>
            </>
          )}
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
