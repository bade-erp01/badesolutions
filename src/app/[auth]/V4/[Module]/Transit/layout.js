import { fetchUser } from "../../../../../../Functions/useerDataRefresh";
import TransitPage from "./page";
import { Encrypt, Dencrypt } from "../../../../../../Functions/Functions";
import BackButton from "@/app/Components/BackBotton";
import Notch from "@/app/Components/Notch";
import { notFound } from "next/navigation";

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
  try {
    const userData = await fetchUser();
    const Pramas = await params;

    const baseUrl = process.env.EXPRESS_PRIVATE_URL;
    const res = await fetch(`${baseUrl}/api/Transit/${Pramas.transit}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
        access: `${Encrypt(userData.user._id)}`,
        sessionKey: `Bearer ${Encrypt(userData.SessionId)}`,
      },
    });

    if (!res.ok) {
      return notFound();
    }

    const data = await res.json();
    const DecryptedData = Dencrypt(data.transit);
    const DecryptedProducts = Dencrypt(data.products);

    return (
      <div className="flex flex-col">
        {/* Sidebar */}
        <Notch>
          <BackButton />
          <hr />
          <div className="rounded-lg shadow-md overflow-hidden">
            <ul className="divide-y divide-gray-700">
              {DecryptedData.ActivityLog?.map((log, index) => {
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
          <TransitPage
            DecryptedData={DecryptedData}
            userData={userData}
            products={DecryptedProducts}
            EXPRESS_PRIVATE_URL={baseUrl}
            Business={userData.business}
            user={userData.user}
          />
        </main>
      </div>
    );
  } catch (error) {
    return <div>Something went wrong</div>;
  }
}
