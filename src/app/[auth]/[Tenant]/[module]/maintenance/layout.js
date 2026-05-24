import Nav1 from "@/app/Components/Nav1";
import { fetchUser } from "../../../../../../Functions/useerDataRefresh";
import Footer2 from "@/app/Components/Footer2";
import BackButton from "@/app/Components/BackBotton";
import Page from "./page";
import EMPLOYEES from "../../../../../../models/Users";
import { Encrypt } from "../../../../../../Functions/Functions";
import SideNavWrapper from "@/app/Components/sideNavWrapper";


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

export default async function layout({ children, params }) {
  const moduleList = await params;
  const userData = await fetchUser();
  const baseUrl = process.env.EXPRESS_PRIVATE_URL;

  const MaitainanceData = await fetch(`${baseUrl}/api/maintenance`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
        access: `${Encrypt(userData.user._id)}`,
      },
    });

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Nav1
        user={userData.user}
        business={userData.business}
        page={moduleList.module}
        Module={[{}]}
      />

      <div className="flex flex-1 text-white bt-2 ">
        <SideNavWrapper  className={`bg-[#1e1e20]/80 backdrop-blur-lg
          text-white px-4 py-6 transition-all duration-300 max-h-[83dvh] overflow-y-auto md:block`}
          style={{ overflowY: "auto" }}>
          <BackButton />
          <hr />
          <nav className="space-y-4">
            
          </nav>
        </SideNavWrapper>

        <main className="flex-1">
         <section className="w-full max-w-7xl mx-auto flex flex-col gap-6 rounded-lg p-2 relative max-h-[81dvh] overflow-y-auto">
              <Page baseUrl={baseUrl} userData={userData} />
          </section>
        </main>
      </div>

      <Footer2 />
    </div>
  );
}
