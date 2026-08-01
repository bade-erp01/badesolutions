import { fetchUser } from "../../../../../../Functions/useerDataRefresh";
import { Encrypt } from "../../../../../../Functions/Functions";
import Nav1 from "@/app/Components/Nav1";
import Link from "next/link";
import Image from "next/image";
import {
  PlusCircleIcon,
  ShoppingCartIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import ExcelDownloadBtn from "@/app/Components/ExcelDownloadBtn";
import BackButton from "@/app/Components/BackBotton";
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
};

export default async function layout({ children, params }) {
  const userData = await fetchUser();
  const Module = await params;
  const baseUrl = process.env.EXPRESS_PRIVATE_URL;
  const res = await fetch(`${baseUrl}/api/Vendors`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
      access: `${Encrypt(userData.user._id)}`,
      sessionKey: `Bearer ${Encrypt(userData.SessionId)}`,
    },
  });

  const vendorList = await res.json();
  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Notch>
        <BackButton />
        <hr />
        {userData.user.isAdmin && (
          <Link
            href={`/${Module.auth}/V4/Forms/vendor`}
            className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition"
          >
            <PlusCircleIcon className="h-6 w-6 text-gray-100" />
            <small>New Vendor</small>
          </Link>
        )}

        {userData.user.raiseLpo ||
          (userData.user.allowInternalTransfers && (
            <Link
              href={`/${Module.auth}/V4/purchases/purchases`}
              className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition"
            >
              <ShoppingCartIcon class="h-6 w-6 text-gray-100" />
              <small>Purchase Requests </small>
            </Link>
          ))}

        {userData?.user?.isAdmin && vendorList.length > 0 && (
          <ExcelDownloadBtn data={vendorList} page="Vendor list" />
        )}

        {/* Bottom Section with Settings Link */}
      </Notch>
      {/* Main Content Area */}
      <main className="flex-1 ">{children}</main>
    </div>
  );
}
