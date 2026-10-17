
import { fetchUser } from "../../../../../../Functions/useerDataRefresh";
import BackButton from "@/app/Components/BackBotton";
import DashboardCharts from "@/app/Components/Salesddash";
import InvoiceLandingPage from "./page";
import SalesRportModal from "@/app/Components/Reports/SalesReport";
import DeliveryRportModal from "@/app/Components/Reports/DeliveryReport";
import SalesDumpModal from "@/app/Components/Reports/salesDump";
import { serverApi } from "@/lib/serverApi";
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
    "ERP in Nigeria",
    "Bernard fidels ogoh",
    "ERP for SMEs",
    "Scalable ERP Solutions",
  ],
  author: "Business Automated Dynamic Enterprise",
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#f4a8ff",
  ogTitle: "Next-Level Automation",
  ogDescription: "Streamline your business with AI-driven automation",
  ogImage: "/assets/bade.png",
  ogUrl: "https://badesolutions.com.ng",
  twitterCard: "/assets/bade.png",
  twitterTitle: "B.A.D.E",
  twitterDescription: "Automate and optimize your enterprise",
  twitterImage: "/assets/bade.png",
};

export default async function Employeelayout({ children, params }) {
  const userData = await fetchUser();
  // GET /api/Users -> { success, data: [{ _id, firstName, lastName, Email, image, status }] }
  const usersRes = await serverApi("/api/Users");
  const parsedUser = usersRes.ok ? usersRes.data?.data || [] : [];
  const baseUrl = process.env.EXPRESS_PRIVATE_URL;

  return (
    <div className="flex flex-col min-w-0">
      <div className="flex flex-1 min-w-0 text-white bt-2 ">
        <Notch>
            <BackButton />
            {userData?.user?.ReportUser && (
              <>
              <SalesRportModal
              business={userData.business}
              baseUrl={baseUrl}
              user={parsedUser}
              />

              <DeliveryRportModal
              baseUrl={baseUrl}
              business={userData.business}
              user={parsedUser}
              />

              <SalesDumpModal
              baseUrl={baseUrl}
              business={userData.business}
              user={parsedUser}
              Employees={parsedUser}
              activeUser={userData.user}
              />

              </>
            )}

            {userData?.user?.c_levelDash && (
              <DashboardCharts  business={userData.business} baseUrl={baseUrl} />
            )}
        </Notch>

        <main className="flex-2 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
