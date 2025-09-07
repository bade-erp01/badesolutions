import Nav1 from "@/app/Components/Nav1";
import { fetchUser } from "../../../../../../Functions/useerDataRefresh";
import Link from "next/link";
import Image from "next/image";
import Footer2 from "@/app/Components/Footer2";
import ExcelDownloadBtn from "@/app/Components/ExcelDownloadBtn";
import StockReportModal from "@/app/Components/Reports/StockReport"
import StockandSalesReport from "@/app/Components/Reports/StockandSalesReport"
import {Encrypt} from "../../../../../../Functions/Functions"
import { ChartPieIcon, BackwardIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import {storeProduct,WHouse} from "../../../../../../models/Stores"
import Vendor from "../../../../../../models/Vendors"
import PurchaseOrder from "../../../../../../models/purchaseOrders"
import Invoice from "../../../../../../models/Invoices"
import BulkUploader from "@/app/Components/BulkUploadProduct"


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
  ogImage: "/assets/bade.png", // Preview image when shared on social media
  ogUrl: "https://badesolutions.com.ng",
  twitterCard: "/assets/bade.png",
  twitterTitle: "Business Automated Dynamic Enterprise [B.A.D.E]",
  twitterDescription:
    "Automate and optimize your enterprise with cutting-edge business solutions",
  twitterImage: "/assets/bade.png",
  favicon: "favicon.ico",
};

export default async function Productlayout({ children, params }) {
  const module = await params;
  const userData = await fetchUser();

   const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
   const res = await fetch(`${baseUrl}/api/ProductsApi`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${userData.business.tenantId}`
      }, 
       cache: 'no-store', // Ensures fresh data on every request
      //   next: {
      //   revalidate: 60 ,// revalidate every 60 seconds
      //   cache: "force-cache"
      // }
    })
    const inventoryItem = await storeProduct.find({
      tenantId: userData.business.tenantId,
      $or: [
        { currentQty: { $gt: 0 } },
        { pcs: { $gt: 0 } }
      ]
    }).lean();
    const ReportInventory = await storeProduct.findByTenant(userData.business.tenantId,).lean();
    const storeList = await WHouse.findByTenant(userData.business.tenantId).lean()
    const VendorList = await Vendor.findByTenant(userData.business.tenantId).lean()
    const PurchaseOrderList = await PurchaseOrder.findByTenant(userData.business.tenantId).lean()
    const InvoiceList  = await Invoice.findByTenant(userData.business.tenantId).lean()
    const ProductList = await res.json();

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Nav1
        user={userData.user}
        business={userData.business}
        page={`${module.module}`}
        Module={ProductList}
      />

      <div
        className="flex flex-1 text-white bt-2"
      >
        {/* Sidebar (collapsible on mobile) */}
        <aside
          className={`w-70  bg-[#1e1e20]/70 backdrop-blur-md text-white px-4 py-6 transition-all duration-300 overflow-none h-h-[520px] max-h-[600px] md:block`}
          style={{ maxHeight: "600px", overflowY: "auto" }}
        >
         <h2 className="text-lg text-white font-bold mb-4">Product Management</h2>
          <hr />
          <nav className="space-y-4 ">
            {userData?.user?.createProduct && (
              <Link
                href={`/${userData.business?.companyName
                  .toLowerCase()
                  .replace(/\s+/g, "-")
                  .replace(/[^a-z0-9-]/g, "")}/${Encrypt(userData?.user._id)}/Module/Forms/${module.module.toLowerCase()}`}
              className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition"
            >
             <PlusCircleIcon className="h-4 w-4 text-gray-100" />
              <span className="text-xs">New Product</span>
            </Link>
            )}

            <StockReportModal data={JSON.stringify(inventoryItem)} Stores={JSON.stringify(storeList)} vendors={JSON.stringify(VendorList)} prodductList={ProductList}/>

            <StockandSalesReport prouctlist={ProductList} PurchaseOrderList={JSON.stringify(PurchaseOrderList)} InvoiceList={JSON.stringify(InvoiceList)} Stores={JSON.stringify(storeList)} vendors={JSON.stringify(VendorList)} inventoryItem={JSON.stringify(ReportInventory)}/>

              {userData?.user?.isAdmin && (
              <BulkUploader tenantId={userData.business.tenantId} collectionName={'product'} />
             )}

              <ExcelDownloadBtn
                data={JSON.stringify(ProductList)}
                page="product"
              />
          </nav>

        </aside>{" "}
        {/* Main Content Area */}
        <main className="flex-1 ">
          <section className="w-full max-w-screen-xl mx-auto flex flex-col gap-6 rounded-lg p-3 relative z-10 h-[520px] overflow-y-auto">
            {children}
          </section>
        </main>
      </div>
      <Footer2 />
    </div>
  );
}
