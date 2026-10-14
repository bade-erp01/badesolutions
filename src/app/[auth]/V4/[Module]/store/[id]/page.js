import BackButton from "@/app/Components/BackBotton";
import { fetchUser } from "../../../../../../../Functions/useerDataRefresh";
import Link from "next/link";
import ExcelDownloadBtn from "@/app/Components/ExcelDownloadBtn";
import StoreChart from "@/app/Components/StoreChart";
import { Encrypt } from "../../../../../../../Functions/Functions";
import {
  ShoppingCartIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import BulkUpdate from "@/app/Components/bulkUpdate";
import InventoryTable from "./InventoryTable"
import Notch from "@/app/Components/Notch";

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
  favicon: "/favicon.ico",
};


export default async function page({ children, params }) {
  const userData = await fetchUser();
  const Params = await params;

  const baseUrl = process.env.EXPRESS_PRIVATE_URL;
  const res = await fetch(`${baseUrl}/api/Stores/${Params.id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
      sessionKey: `Bearer ${Encrypt(userData.SessionId)}`,
      access: `${Encrypt(userData.user._id)}`,
    },
    next: { revalidate: 120 },
  });

  const data = await res.json();

  return (
    <div className="flex flex-col">
      {/* Sidebar */}
      <Notch>
        <BackButton />
        <hr />

        {/* Purchase Order */}
        {(userData?.user?.raiseLpo || userData?.user?.allowInternalTransfers) && (
          <Link
            href={`/${Params.auth}/V4/purchases/purchases`}
            className="flex items-center gap-3 p-3 rounded-md  transition"
          >
            <ShoppingCartIcon className="h-6 w-6 " />
            <small>Purchase Order</small>
          </Link>
        )}

        {/* Store Settings */}
        {userData.user.isAdmin && (
          <Link
            href={`/${Params.auth}/V4/${Params.Module}/${Params.Module}/${Params.id}/store-settings`}
            className="flex items-center gap-3 px-3 py-2 rounded-lg transition duration-200"
          >
            <WrenchScrewdriverIcon className="h-6 w-6 " />
            <span className="text-sm font-medium">Store Settings</span>
          </Link>
        )}

        {/* Excel Download */}
        {data.products?.length > 0 && (
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
      </Notch>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <div className="overflow-y-auto">
          {/* Chart */}
          {userData?.user?.c_levelDash && (
            <div className="m-3">
              <StoreChart productsList={data.products} />
            </div>
          )}

          {/* Enhanced Table */}
          <InventoryTable
            data={data}
          />
        </div>
      </main>
    </div>
  );
}