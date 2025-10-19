import Nav1 from "@/app/Components/Nav1";
import BackButton from "@/app/Components/BackBotton";
import { fetchUser } from "../../../../../../../Functions/useerDataRefresh";
import Card from "@/app/Components/Card"
import Link from "next/link";
import Footer2 from "@/app/Components/Footer2";
import ExcelDownloadBtn from "@/app/Components/ExcelDownloadBtn";
import { Encrypt } from "../../../../../../../Functions/Functions";
import {
  ChartPieIcon,
  UserGroupIcon,
  ShoppingCartIcon,
  ClipboardDocumentCheckIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

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
  favicon: "favicon.ico",
};

export default async function storelayout({ children, params }) {
  const userData = await fetchUser();
  const Params = await params;

  const baseUrl = process.env.EXPRESS_PRIVATE_URL;
  const res = await fetch(`${baseUrl}/api/Stores/${Params.id}`, {
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

  const data = await res.json();

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Nav1
        user={userData.user}
        business={userData.business}
        page={`${data.Store.WHName} Inventory`}
      />

      <div className="flex flex-1 text-white bt-2">
        {/* Sidebar (collapsible on mobile) */}
        <aside
          className={`w-70 bg-[#1e1e20]/70 backdrop-blur-md 
              text-white px-4 py-6 transition-all duration-300 max-h-[83dvh] overflow-y-auto md:block`}
          style={{ overflowY: "auto" }}
        >
          <BackButton />
          <hr />
          <nav className="space-y-4">
            {/* create purchase */}
            {(userData?.user?.raiseLpo ||
              userData?.user?.allowInternalTransfers) && (
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
                  <small>Purchase Order</small>
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
                  <small>Product Transfers</small>
                </Link>
              </>
            )}
            {/* store settings */}
            <Link
              href={`/${userData.business.companyName}/${Params.Tenant}/${Params.module}/store/${Params.id}/store-settings`}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition duration-200 not-visited:bg-purple-500/20`}
            >
              <WrenchScrewdriverIcon className="h-6 w-6 text-gray-100" />
              <span className="text-sm font-medium">Store Settings</span>
            </Link>

            {data.products.length > 0 && (
              <ExcelDownloadBtn
                data={data.products}
                page={`${data.Store?.WHName || "Store"} inventory`}
              />
            )}
          </nav>
        </aside>{" "}
        {/* Main Content Area */}
        <main className="flex-1 ">
          <section className="w-full max-w-screen-xl p-1 mx-auto flex flex-col gap-6 rounded-lg  relative z-10 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 max-h-[80dvh]">
              {data.products
                .sort((a, b) => a.productName.localeCompare(b.productName))
                .map((element) => (
                  <Card
                    key={element._id}
                    data={element}
                    module="inventory"
                    className="shadow-lg rounded-lg bg-white hover:shadow-xl transition-shadow duration-300"
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
