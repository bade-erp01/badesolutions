import Link from "next/link";
import Notch from "@/app/Components/Notch";
import {
  UserGroupIcon,
  ShoppingCartIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { fetchUser } from "../../../../../../Functions/useerDataRefresh";
import BackButton from "@/app/Components/BackBotton";
import StoreForm from "./page";

export const metadata = {
  title: "Stores Settings | B.A.D.E ERP Platform",
  description:
    "Configure and manage your stores with B.A.D.E — Nigeria’s leading AI-powered ERP solution for businesses of all sizes. Built for scalability, automation, and real-time insights.",
  keywords: [
    "Store Management",
    "ERP Nigeria",
    "Business Automation",
    "B.A.D.E",
    "AI ERP",
    "Retail Optimization",
    "Inventory Control",
    "Bernard Fidels Ogoh",
    "ERP Abuja",
    "ERP Lagos",
    "ERP Port Harcourt",
    "Nigerian Business Software",
    "SME ERP",
    "Enterprise Resource Planning",
    "AI Business Tools",
    "Affordable ERP Nigeria",
    "Scalable ERP",
    "Digital Transformation",
    "Next-gen ERP",
    "Business Intelligence",
    "Workflow Automation",
    "Store Settings Dashboard",
    "Tenant Management",
    "Multi-store ERP",
  ],
  author: "Business Automated Dynamic Enterprise [B.A.D.E]",
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1, theme-color=#f4a8ff",
  ogTitle: "Store Settings | B.A.D.E ERP Platform",
  ogDescription:
    "Take control of your store operations with B.A.D.E — the smart ERP for Nigerian enterprises.",
  ogImage: "/assets/store-settings-og.png",
  ogUrl: "https://badesolutions.com.ng/storelayout",
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: "Store Settings | B.A.D.E ERP Platform",
  twitterDescription:
    "Manage your stores with ease using B.A.D.E — Nigeria’s AI-powered ERP solution.",
  twitterImage: "/assets/store-settings-og.png",
  themeColor: "#f4a8ff",
  applicationName: "B.A.D.E ERP",
  creator: "Bernard Fidels Ogoh",
  favicon: "/favicon.ico",
};

export default async function StoreLayout({ children, params }) {
  const userData = await fetchUser();
  const Params = await params;

  return (
    <div className="flex flex-col min-w-0">
      <Notch>
        <BackButton />
        <hr />

        {(userData?.user?.raiseLpo || userData?.user?.editVendor) && (
          <>
            <Link
              href={`/${Params.auth}/V4/vendor/vendor`}
              className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition text-xs"
            >
              <UserGroupIcon
                aria-hidden="true"
                className="h-6 w-6 text-gray-100"
              />
              <small>Vendors Management</small>
            </Link>
          </>
        )}

        {/* create purchase */}
        {(userData?.user?.raiseLpo ||
          userData?.user?.allowInternalTransfers) && (
          <>
            <Link
              href={`/${Params.auth}/V4/purchases/purchases`}
              className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition text-xs"
            >
              <ShoppingCartIcon className="h-6 w-6 text-gray-100" />
              <small>Purchase Requests</small>
            </Link>

            <Link
              href={`/${Params.auth}/V4/product-transfer/product-transfer`}
              className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition text-xs"
            >
              <ClipboardDocumentCheckIcon className="h-6 w-6 text-gray-100" />
              <small>Product Transfer Request</small>
            </Link>
          </>
        )}
      </Notch>
      {/* Main Content Area */}
      <main className="flex-1 ">
        <StoreForm business={userData.business} user={userData.user} />
      </main>
    </div>
  );
}
