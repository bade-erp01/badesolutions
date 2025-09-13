import Nav1 from "@/app/Components/Nav1";
import { fetchUser } from "../../../../../../Functions/useerDataRefresh";
import Link from "next/link";
import Footer2 from "@/app/Components/Footer2";
import ExcelDownloadBtn from "@/app/Components/ExcelDownloadBtn";
import { Encrypt } from "../../../../../../Functions/Functions";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { storeProduct, WHouse } from "../../../../../../models/Stores";
import ProductTransfer from "../../../../../../models/ProductTransfers";

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

export default async function TransferPage({ params }) {
  const moduleList = await params;
  const userData = await fetchUser();
  const TransfersList = await ProductTransfer.findByTenant(
    userData.business.tenantId
  ).sort({_id:-1}).lean();

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Nav1
        user={userData.user}
        business={userData.business}
        page={`${moduleList.module}`}
        Module={TransfersList}
      />

      <div className="flex flex-1 text-white bt-2">
        {/* Sidebar (collapsible on mobile) */}
        <aside
          className={`w-70  bg-[#1e1e20]/70 backdrop-blur-md text-white px-4 py-6 transition-all duration-300 overflow-none h-h-[520px] max-h-[600px] md:block`}
          style={{ maxHeight: "600px", overflowY: "auto" }}
        >
          <h2 className="text-lg text-white font-bold mb-4">
            Product Transfers
          </h2>
          <hr />
          <nav className="space-y-4 ">
            {userData?.user?.createProduct && (
              <Link
                href={`/${userData.business?.companyName
                  .toLowerCase()
                  .replace(/\s+/g, "-")
                  .replace(/[^a-z0-9-]/g, "")}/${Encrypt(
                  userData?.user._id
                )}/Module/Forms/${moduleList.module.toLowerCase()}`}
                className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition"
              >
                <PlusCircleIcon className="h-4 w-4 text-gray-100" />
                <span className="text-xs">New Transfer</span>
              </Link>
            )}

            <ExcelDownloadBtn
              data={JSON.stringify(TransfersList)}
              page="Transfered Products"
            />
          </nav> 
        </aside>{" "}
        {/* Main Content Area */}
        <main className="flex-1 ">
          <section className="w-full max-w-screen-xl mx-auto flex flex-col gap-6 rounded-lg p-3 relative z-10 h-[520px] overflow-y-auto">
            {/* show each  transfer */}
            {TransfersList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-800 text-white rounded-lg">
                  <thead>
                    <tr className="bg-gray-700">
                      <th className="px-4 py-2 text-left">Product</th>
                      <th className="px-4 py-2 text-left">From Warehouse</th>
                      <th className="px-4 py-2 text-left">To Warehouse</th>
                      <th className="px-4 py-2 text-left">Quantity</th>
                      <th className="px-4 py-2 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransfersList.map((transfer, index) => (
                      <tr
                        key={index}
                        className={`${
                          index % 2 === 0 ? "bg-gray-800" : "bg-gray-700"
                        }`}
                      >
                        <td className="px-4 py-2">{transfer.billReferenceNo}</td>
                        <td className="px-4 py-2">{transfer.from}</td>
                        <td className="px-4 py-2">{transfer.to}</td>
                        <td className="px-4 py-2">{transfer.orders.length}</td>
                        <td className="px-4 py-2">
                          {new Date(transfer.transferedDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-300 text-center mt-20">
                No transfers found.
              </p>
            )}
          </section>
        </main>
      </div>
      <Footer2 />
    </div>
  );
}
