import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // adjust import path to your shadcn setup
import Nav1 from "@/app/Components/Nav1";
import BackButton from "@/app/Components/BackBotton";
import { fetchUser } from "../../../../../../../Functions/useerDataRefresh";
import Card from "@/app/Components/Card";
import Link from "next/link";
import Footer2 from "@/app/Components/Footer2";
import ExcelDownloadBtn from "@/app/Components/ExcelDownloadBtn";
import StoreChart from "@/app/Components/StoreChart";
import { Encrypt } from "../../../../../../../Functions/Functions";
import {
  ShoppingCartIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import BulkUpdate from "@/app/Components/bulkUpdate"
import SideNavWrapper from "@/app/Components/sideNavWrapper";




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
      revalidate: 120,
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
        {/* Sidebar */}
        <SideNavWrapper
          className="w-70 bg-[#1e1e20]/70 backdrop-blur-md 
          text-white px-4 py-6 transition-all duration-300 max-h-[83dvh] overflow-y-auto md:block"
        >
          <BackButton />
          <hr />
          <nav className="space-y-4">
            {/* Purchase Order */}
            {(userData?.user?.raiseLpo ||
              userData?.user?.allowInternalTransfers) && (
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
            )}

            {/* Store Settings */}
            {userData.user.isAdmin && (
              <Link
                href={`/${userData.business.companyName}/${Params.Tenant}/${Params.module}/store/${Params.id}/store-settings`}
                className="flex items-center gap-3 px-3 py-2 rounded-lg transition duration-200"
              >
                <WrenchScrewdriverIcon className="h-6 w-6 text-gray-100" />
                <span className="text-sm font-medium">Store Settings</span>
              </Link>
            )}

            {/* Excel Download */}
            {data.products.length > 0 && (
              <ExcelDownloadBtn
                data={data?.products?.map((product) => ({
                  id: product._id,
                  Name: product.productName,
                  supplier: product.Vendor?.Name,
                  Case: product.currentQty,
                  Pcs: product.pcs,
                  ExpDate: product.expiryDate,
                  Category: product.category,
                  isActivated: product.isActivated,
                }))}
                page={`${data?.Store?.WHName || "Store"} inventory`}
              />
            )}

            {/* Bulk Update */}
            {userData.user.isAdmin && (
              <BulkUpdate
                tenantId={userData}
                collectionName={"inventory"}
                WHID={data.Store._id}
              />
            )}
          </nav>
        </SideNavWrapper>

        {/* Main Content */}
        <main className="flex-1">
          <section className="w-full max-w-7xl mx-auto flex flex-col gap-6 rounded-lg relative z-10 max-h-[83dvh] overflow-y-hidden">
            <div className="overflow-y-auto">
              {/* Chart */}
              {userData?.user?.c_levelDash && (
                <div className="m-3">
                  <StoreChart productsList={data.products} />
                </div>
              )}

              {/* Table */}
              <div className="p-4 bg-gray-200">
                <Table className="w-full text-black bg-gray-200">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-black">S/N</TableHead>
                      <TableHead className="text-black">Name</TableHead>
                      <TableHead className="text-black">Vendor</TableHead>
                      <TableHead className="text-black">Case</TableHead>
                      <TableHead className="text-black">Pcs</TableHead>
                      <TableHead className="text-black">Expiry Date</TableHead>
                      <TableHead className="text-black">Category</TableHead>
                      <TableHead className="text-black">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.products
                      ?.sort((a, b) => a.productName.localeCompare(b.productName))
                      .map((product, index) => (
                        <TableRow
                          key={product._id}
                          className={`hover:bg-gray-200 ${
                            index % 2 === 0 ? "bg-gray-50" : "bg-gray-100"
                          }`}
                        >
                          <TableCell className="text-black">
                            {index + 1}
                          </TableCell>
                          <TableCell className="text-indigo-800">
                            <Link href={`/${userData.business.companyName}/${Params.Tenant}/inventory/inventory/${Encrypt(product._id)}`}>
                              {product.productName}
                            </Link>
                          </TableCell>
                          <TableCell className="text-black">{product.Vendor?.Name}</TableCell>
                            <TableCell
                              className={`text-black ${
                                product.currentQty < 0
                                  ? "bg-red-100"
                                  : product.currentQty === 0
                                  ? "bg-yellow-100"
                                  : "bg-green-100"
                              }`}
                            >
                              {product.currentQty}
                            </TableCell>

                            <TableCell
                              className={`text-black ${
                                product.pcs < 0
                                  ? "bg-red-100"
                                  : product.pcs === 0
                                  ? "bg-yellow-100"
                                  : "bg-green-100"
                              }`}
                            >
                              {product.pcs}
                            </TableCell>
                          <TableCell className="text-black">{product.expiryDate}</TableCell>
                          <TableCell className="text-black">{product.category}</TableCell>
                          <TableCell className="text-black">
                            {product.isActivated ? "Active" : "Inactive"}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>

            </div>
          </section>
        </main>
      </div>
      <Footer2 />
    </div>
  );
}
