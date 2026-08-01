import Card from "@/app/Components/Card";
import ProductSalesChart from "@/app/Components/productChart";
import { fetchUser } from "../../../../../../Functions/useerDataRefresh";
import Link from "next/link";
import ProductXLSXDownload from "@/app/Components/productListXLSX.js";
import StockReportModal from "@/app/Components/Reports/StockReport";
import StockandSalesReport from "@/app/Components/Reports/StockandSalesReport";
import BulkUpdate from "@/app/Components/bulkUpdate";
import { Encrypt } from "../../../../../../Functions/Functions";
import PurchaseDumpModal from "@/app/Components/Reports/PurchaseDump";
import AddPriceListModal from "@/app/Components/PricelistCreate";
import { Plus,Package } from "lucide-react";
import Notch from "@/app/Components/Notch";

export const metadata = {
  title: "Business Automated Dynamic Enterprise [B.A.D.E]",
  description: "Automate, Optimize, and Scale Your Business Operations",
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
  ogTitle: "Business Automated Dynamic Enterprise [B.A.D.E]",
  ogDescription: "Streamline your business with AI-driven automation",
  ogImage: "/assets/bade.png",
  ogUrl: "https://badesolutions.com.ng",
  twitterCard: "/assets/bade.png",
  twitterTitle: "Business Automated Dynamic Enterprise [B.A.D.E]",
  twitterDescription: "Automate and optimize your enterprise",
  twitterImage: "/assets/bade.png",
  favicon: "favicon.ico",
};

export default async function Productlayout({ children, params }) {
  const userData = await fetchUser();
  const moduleList = await params;
  const baseUrl = process.env.EXPRESS_PRIVATE_URL;

  try {
    const res = await fetch(`${baseUrl}/api/Products`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
        access: `${Encrypt(userData.user._id)}`,
        sessionKey: `Bearer ${Encrypt(userData.SessionId)}`,
      },
      next: { revalidate: 120 }, // cache for 1 minutes
    });

    if (!res.ok) throw new Error("Failed to fetch product data");

    const { productList, vendorList, storeList } = await res.json();

    return (
      <div className="flex flex-col min-h-screen overflow-hidden">
        {/* Sidebar */}
        <Notch>
          {userData?.user?.createProduct && (
            <Link
              href={`/${moduleList.auth}/V4/Forms/product`}
              className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition"
            >
              <Plus className="h-4 w-4" />
              <span className="text-xs">New Product</span>
            </Link>
          )}

          {userData?.user?.ReportUser && (
            <>
              <StockReportModal baseUrl={baseUrl} userData={userData} />
              <StockandSalesReport baseUrl={baseUrl} userData={userData} />
              <PurchaseDumpModal
                business={userData.business}
                EXPRESS_PRIVATE_URL={baseUrl}
                Products={productList}
                storesData={storeList}
                vendorsData={vendorList}
                userData={userData}
              />
              <ProductXLSXDownload productList={productList} />
            </>
          )}

          {userData?.user?.isAdmin && (
            <>
              <BulkUpdate
                tenantId={userData}
                collectionName="product"
                WHID={userData?._id}
              />
              <AddPriceListModal baseUrl={baseUrl} userData={userData} />
            </>
          )}
        </Notch>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {productList.length > 0 ? (
            <>
              {userData?.user?.c_levelDash && (
                <ProductSalesChart productsList={productList} />
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-10">
                {productList
                  .sort((a, b) => a.Name.trim().localeCompare(b.Name.trim()))
                  .map((element) => (
                    <Card
                      key={element._id}
                      data={element}
                      module="product"
                      url={`/${moduleList.auth}/V4/${moduleList.Module}/${moduleList.Module}/${Encrypt(element._id)}`}
                    />
                  ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
              <div className="w-20 h-20 rounded-full bg-gray-800/60 flex items-center justify-center mb-6">
                <Package className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-100 mb-2">
                No products yet
              </h3>
              <p className="text-sm text-gray-400 max-w-sm mb-6">
                Get started by adding your first product. Once you create one,
                it will appear here.
              </p>
              {userData?.user?.createProduct && (
                <Link
                  href={`/${moduleList.auth}/V4/Forms/product`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition"
                >
                  <Plus className="h-4 w-4" />
                  Create Product
                </Link>
              )}
            </div>
          )}
        </main>
      </div>
    );
  } catch (err) {
    return <div className="">Failed to load. Please try again later.</div>;
  }
}
