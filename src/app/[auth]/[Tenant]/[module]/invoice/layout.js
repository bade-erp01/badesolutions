import Nav1 from "@/app/Components/Nav1";
import { fetchUser } from "../../../../../../Functions/useerDataRefresh";
import Footer2 from "@/app/Components/Footer2";
import BackButton from "@/app/Components/BackBotton";
import SalesDashboard from "@/app/Components/Salesddash";
import InvoiceLandingPage from "./page";
import SalesRportModal from "@/app/Components/Reports/SalesReport";
import DeliveryRportModal from "@/app/Components/Reports/DeliveryReport";
import SalesDumpModal from "@/app/Components/Reports/salesDump";
import EMPLOYEES from "../../../../../../models/Users";
import { Encrypt } from "../../../../../../Functions/Functions";
import SideNavWrapper from "@/app/Components/sideNavWrapper"


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
  const moduleList = await params;
  const userData = await fetchUser();
  const user = await EMPLOYEES.findByTenant(userData.business.tenantId).select("-Apps").lean();
  const stringedUser = JSON.stringify(user);
  const parsedUser = JSON.parse(stringedUser);
  const baseUrl = process.env.EXPRESS_PRIVATE_URL;

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Nav1
        user={userData.user}
        business={userData.business}
        page={moduleList.module}
        Module={[{}]}
      />

      <div className="flex flex-1 text-white bt-2 ">
        <SideNavWrapper>
          <BackButton />
          <hr />
          <nav className="space-y-4">
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
              />

              </>
            )}

            {userData?.user?.c_levelDash && (
              <SalesDashboard  business={userData.business} baseUrl={baseUrl} />
            )}
            
          </nav>
        </SideNavWrapper>

        <main className="flex-1">
         <section className="w-full max-w-7xl mx-auto flex flex-col gap-6 rounded-lg p-2 relative max-h-[81dvh] overflow-y-auto">
              <InvoiceLandingPage baseUrl={baseUrl} userData={userData} />
          </section>
        </main>
      </div>

      <Footer2 />
    </div>
  );
}
