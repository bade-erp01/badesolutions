
import { fetchUser } from "../../../../../../../Functions/useerDataRefresh";
import { Encrypt, Dencrypt } from "../../../../../../../Functions/Functions";
import DraftPurchasePage from "./page";
import { notFound } from "next/navigation";
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
  favicon: "/favicon.ico",
};

export default async function storelayout({ params, children }) {
  // Await searchParams (required in Next.js App Router)
  const resolvedSearchParams = await params;
  const query = resolvedSearchParams.id;

  if (!query) {
    return notFound();
  }

  const userData = await fetchUser();
  const baseUrl = process.env.EXPRESS_PRIVATE_URL;

  const res = await fetch(`${baseUrl}/api/Purchase/${query}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
      sessionKey: `Bearer ${Encrypt(userData.SessionId)}`,
      access: `${Encrypt(userData.user._id)}`,
    },
    // next: { revalidate: 60 }, // cache for 1 minute
  });

  if (!res.ok) {
    return notFound();
  }

  const data = await res.json();

  return (
    <div className="flex flex-col">
      {/* Sidebar */}
      <Notch>
        <BackButton />
        <hr />
          <div className="bg-gray-700 rounded-lg shadow-md overflow-hidden">
            <ul className="divide-y divide-gray-700">
              {data.purchaseOrder?.ActivityLog?.map((log, index) => {
                return (
                  <li key={index} className="py-3 px-4 text-xs text-italic">
                    <div className="flex justify-between items-center">
                      <span className="text-italic">{log.logMsg}</span>
                    </div>
                    <hr className="border-gray-500" />
                  </li>
                );
              }) || <li className="py-3 px-4 text-sm">No activity logs.</li>}
            </ul>
          </div>
      </Notch>

      {/* Main Content */}
      <main className="flex-1">
        <DraftPurchasePage
          user={userData.user}
          customer={data.vendor}
          bill={data.purchaseOrder}
          products={data.storeProductList}
          Business={userData.business}
          Whouse={data.WH}
        />
      </main>
    </div>
  );
}
