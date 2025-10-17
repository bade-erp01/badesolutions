
import Card from "@/app/Components/Card";
import ProductSalesChart from "@/app/Components/productChart";
import Nav1 from "@/app/Components/Nav1";
import { fetchUser } from "../../../../../../Functions/useerDataRefresh";
import Link from "next/link";
import Footer2 from "@/app/Components/Footer2";
import ExcelDownloadBtn from "@/app/Components/ExcelDownloadBtn";
import StockReportModal from "@/app/Components/Reports/StockReport";
import StockandSalesReport from "@/app/Components/Reports/StockandSalesReport";
import BulkUploader from "@/app/Components/BulkUploadProduct";
import { Encrypt } from "../../../../../../Functions/Functions";
import { PlusCircleIcon } from "@heroicons/react/24/outline";

export const metadata = {
  title: "Business Automated Dynamic Enterprise [B.A.D.E]",
  description: "Automate, Optimize, and Scale Your Business Operations",
  keywords: [],
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
        Authorization: `Bearer ${userData.business.tenantId}`,
        dbConnect: `Bearer ${userData.business.rustyRoof}`,
        access: `${Encrypt(userData.user._id)}`
      }
    });

    if (!res.ok) throw new Error("Failed to fetch product data");

    const {
      productList,
      // inventoryItem,
      // ReportInventory,
      // storeList,
      // vendorList,
      // PurchaseOrderList,
      // invoiceList
    } = await res.json();

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
                    .replace(/[^a-z0-9-]/g, "")}/${Encrypt(userData.user._id)}/Module/Forms/${moduleList.module.toLowerCase()}`}
                  className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition"
                >
                  <PlusCircleIcon className="h-4 w-4 text-gray-100" />
                  <span className="text-xs">New Product</span>
                </Link>
              )}

              {/* <StockReportModal
                data={inventoryItem} 
                 Stores={storeList} 
                vendors={vendorList} 
                 prodductList={productList} 


                baseUrl={baseUrl}
                userData={userData}
              /> */}

              {/* <StockandSalesReport
                prouctlist={productList}
                PurchaseOrderList={PurchaseOrderList}
                InvoiceList={invoiceList}
                Stores={storeList}
                vendors={vendorList}
                inventoryItem={ReportInventory}
              /> */}

              {userData?.user?.isAdmin && (
                <BulkUploader tenantId={userData} collectionName="product" />
              )}

              <ExcelDownloadBtn data={productList} page="product" />
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <section className="w-full max-w-screen-xl mx-auto flex flex-col gap-6 rounded-lg p-3 relative ">
              <div className="max-h-[83dvh] overflow-y-auto">
                {userData.user.c_levelDash && (
                  <ProductSalesChart productsList={productList} />
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-10">
                  {productList.sort((a, b) => a.Name.localeCompare(b.Name)).map(element => (
                    <Card key={element._id} data={element} module={'product'} />
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
