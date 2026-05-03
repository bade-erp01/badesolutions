import Card from "@/app/Components/Card";
import ProductSalesChart from "@/app/Components/productChart";
import Nav1 from "@/app/Components/Nav1";
import { fetchUser } from "../../../../../../Functions/useerDataRefresh";
import Link from "next/link";
import Footer2 from "@/app/Components/Footer2";
import ExcelDownloadBtn from "@/app/Components/ExcelDownloadBtn";
import StockReportModal from "@/app/Components/Reports/StockReport";
import StockandSalesReport from "@/app/Components/Reports/StockandSalesReport";
import BulkUpdate from "@/app/Components/bulkUpdate";
import { Encrypt } from "../../../../../../Functions/Functions";
import PurchaseDumpModal from "@/app/Components/Reports/PurchaseDump";
import AddPriceListModal from "@/app/Components/PricelistCreate";
import { Plus } from "lucide-react";

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
      },
      next: { revalidate: 120 }, // cache for 1 minutes
    });

    if (!res.ok) throw new Error("Failed to fetch product data");

    const { productList, vendorList, storeList } = await res.json();

    return (
      <div className="flex flex-col min-h-screen overflow-hidden">
        <Nav1
          user={userData.user}
          business={userData.business}
          page={moduleList.module}
          Module={[{}]}
        />

        <div className="flex flex-1 text-white bt-2 max-h-[82dvh] overflow-hidden">
          {/* Sidebar */}
          <aside
            className="w-70 bg-[#1e1e20]/70 backdrop-blur-md text-white px-4 py-6 transition-all duration-300 md:block "
            style={{ overflowY: "auto" }}
          >
            <h2 className="text-lg font-bold mb-4">Product Management</h2>
            <hr />
            <nav className="space-y-4">
              {userData?.user?.createProduct && (
                <Link
                  href={`/${userData.business.companyName
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(
                      /[^a-z0-9-]/g,
                      "",
                    )}/${Encrypt(userData.user._id)}/Module/Forms/${moduleList.module.toLowerCase()}`}
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
                  />

                  <ExcelDownloadBtn
                    data={productList
                      .sort((a, b) =>
                        a.Name.trim().localeCompare(b.Name.trim()),
                      )
                      .map((product) => ({
                        id: product._id,
                        Name: product.Name,
                        Description: product.Description,
                        category: product.category,
                        sub_category: product.subcategory,
                        Manufacturer: product.Manufacturer,
                        code: product.ADCcode || product.ACDcode,
                        Sales_count: product.TotalSale,
                        Pieces: product.Pieces,
                        Buying_Price: product.BuyingPrice,
                        Manufacture_code: product.Manufacture_code,
                        FOC: product.isAservice ? "Yes" : "No",
                        Pricelist1: product.Pricelist1 || 0,
                        Pricelist2: product.Pricelist2 || 0,
                        Pricelist3: product.Pricelist3 || 0,
                        Pricelist4: product.Pricelist4 || 0,
                        Pricelist5: product.Pricelist5 || 0,
                        Pricelist6: product.Pricelist6 || 0,
                        Pricelist7: product.Pricelist7 || 0,
                        Pricelist1Promo: product.Pricelist1Promo || 0,
                        Pricelist2Promo: product.Pricelist2Promo || 0,
                        Pricelist3Promo: product.Pricelist3Promo || 0,
                        Pricelist4Promo: product.Pricelist4Promo || 0,
                        Pricelist5Promo: product.Pricelist5Promo || 0,
                        Pricelist6Promo: product.Pricelist6Promo || 0,
                        Pricelist7Promo: product.Pricelist7Promo || 0,
                        Pricelist1_PromoEndDate:
                          product.Pricelist1PromoDate || "",
                        Pricelist2_PromoEndDate:
                          product.Pricelist2PromoDate || "",
                        Pricelist3_PromoEndDate:
                          product.Pricelist3PromoDate || "",
                        Pricelist4_PromoEndDate:
                          product.Pricelist4PromoDate || "",
                        Pricelist5_PromoEndDate:
                          product.Pricelist5PromoDate || "",
                        Pricelist6_PromoEndDate:
                          product.Pricelist6PromoDate || "",
                        Pricelist7_PromoEndDate:
                          product.Pricelist7PromoDate || "",
                      }))}
                    page="product"
                  />
                </>
              )}
              
              {userData?.user?.isAdmin && (
                <>
                <BulkUpdate
                  tenantId={userData}
                  collectionName="product"
                  WHID={userData?._id}
                />
                <AddPriceListModal baseUrl={baseUrl} userData={userData}/>
                </>
              )}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <section className="w-full max-w-7xl mx-auto flex flex-col gap-6 rounded-lg p-3 relative ">
              <div className="max-h-[83dvh] overflow-y-auto">
                {userData.user.c_levelDash && (
                  <ProductSalesChart productsList={productList} />
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-10">
                  {productList
                    .sort((a, b) => a.Name.trim().localeCompare(b.Name.trim()))
                    .map((element) => (
                      <Card
                        key={element._id}
                        data={element}
                        module={"product"}
                      />
                    ))}
                </div>
              </div>
            </section>
          </main>
        </div>

        <Footer2 />
      </div>
    );
  } catch (err) {
    return (
      <div className="text-black p-6">
        Failed to load. Please try again later.
      </div>
    );
  }
}
