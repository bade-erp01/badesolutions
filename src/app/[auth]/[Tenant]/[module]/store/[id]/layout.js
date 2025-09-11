import Nav1 from "@/app/Components/Nav1";
import BackButton from "@/app/Components/BackBotton";
import dbConnect from "../../../../../../../lib/mongoose";
import { fetchUser } from "../../../../../../../Functions/useerDataRefresh";
import { WHouse, storeProduct } from "../../../../../../../models/Stores";
import { Dencrypt } from "../../../../../../../Functions/Functions";
import Link from "next/link";
import Page from "./page"
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
  await dbConnect();
  const userData = await fetchUser();
  const Params = await params;
  const Store = await WHouse.findById(Dencrypt(Params?.id)).lean();
  const products = await storeProduct
    .findByTenant(userData.business.tenantId, { WHIDS: Store._id })
    .sort({ _id: -1 }) // newest first
    .lean();

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Nav1
        user={userData.user}
        business={userData.business}
        page={`${Store.WHName} Inventory`}
        // Module={products}
      />

      <div className="flex flex-1 text-white bt-2">
        {/* Sidebar (collapsible on mobile) */}
        <aside
          className={`w-70 bg-[#1e1e20]/70 backdrop-blur-md 
              text-white px-4 py-6 transition-all duration-300 h-[520px] max-h-[600px] overflow-y-auto md:block`}
          style={{ maxHeight: "580px", overflowY: "auto" }}
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
              href={`/${userData.business.companyName}/${Params.Tenant}/${Params.module}/store/store-settings?store=${Params.id}`}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition duration-200 not-visited:bg-purple-500/20`}
            >
              <WrenchScrewdriverIcon className="h-6 w-6 text-gray-100" />
              <span className="text-sm font-medium">Store Settings</span>
            </Link>

            {products.length > 0 && <ExcelDownloadBtn data={products} page={`${Store?.WHName || "Store"} inventory`} />}
          </nav>
        </aside>{" "}
        {/* Main Content Area */}
        <main className="flex-1 ">
          <section className="w-full max-w-screen-xl p-1 mx-auto flex flex-col gap-6 rounded-lg  relative z-10 h-[520px] overflow-y-auto">
              {/* display storeProduct here */}
              <Page products={JSON.stringify(products)}/>
          </section>
        </main>
      </div>
      <Footer2 />
    </div>
  );
}
