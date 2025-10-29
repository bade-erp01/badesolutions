import Nav1 from "@/app/Components/Nav1";
import { fetchUser } from "../../../../../../../../Functions/useerDataRefresh";
import Footer2 from "@/app/Components/Footer2";
import BackButton from "@/app/Components/BackBotton";
import { Encrypt } from "../../../../../../../../Functions/Mics";
import { notFound } from "next/navigation";
import Card from "@/app/Components/Card";

export const metadata = {
  title: "Business Automated Dynamic Enterprise [B.A.D.E]",
  description: "Automate, Optimize, and Scale Your Business Operations",
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
  ogTitle: "Business Automated Dynamic Enterprise [B.A.D.E]",
  ogDescription: "Streamline your business with AI-driven automation",
  ogImage: "/assets/bade.png",
  ogUrl: "https://badesolutions.com.ng",
  twitterCard: "/assets/bade.png",
  twitterTitle: "Business Automated Dynamic Enterprise [B.A.D.E]",
  twitterDescription: "Automate and optimize your enterprise",
  twitterImage: "/assets/bade.png",
  favicon: "favicon.ico",
};

export default async function AccountingPage({ children, params }) {
  const userData = await fetchUser();
  const moduleList = await params;

  // check if user has access to crm and cash register
  const AccountingFinder = userData.user.Apps.find((app) => {
    return app.Name === "Accounting";
  });

  if (!AccountingFinder) {
    return notFound();
  }

  // fetch all credit payment from all bank account
  const baseUrl = process.env.EXPRESS_PRIVATE_URL;
  const res = await fetch(`${baseUrl}/api/COA`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userData.business.tenantId}`,
      dbConnect: `Bearer ${userData.business.rustyRoof}`,
      access: `${Encrypt(userData.user._id)}`,
    },
  });

  const data = await res.json();

  try {
    return (
      <div className="flex flex-col min-h-screen overflow-hidden">
        <Nav1
          user={userData.user}
          business={userData.business}
          page={`${moduleList.id}`}
        />

        <div className="flex flex-1 text-white bt-2 max-h-screen">
          {/* Sidebar */}
          <aside
            className="w-72 bg-[#1e1e20] backdrop-blur-md text-white px-4 py-6 transition-all duration-300 max-h-[100dvh] md:block"
            style={{ overflowY: "auto" }}
          >
            {/* <h2 className="text-lg font-bold mb-4">{moduleList.id}</h2>
            <hr className="border-gray-100 mb-4" /> */}
            <nav className="space-y-2">
              <BackButton />
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <section className="w-full max-w-screen-xl mx-auto flex flex-col gap-6 rounded-lg p-3 relative z-10 max-h-[100dvh] overflow-y-auto">
              {/* display sharts of accounts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-10">
              {data.sort((a, b) => a.accountCode.localeCompare(b.accountCode))
                .map((element) => (
                  <Card key={element._id} data={element} module={"Chart-Of-Accounts"} />
                ))}
                </div>
            </section>
          </main>
        </div>

        <Footer2 />
      </div>
    );
  } catch (err) {
    return (
      <div className="text-black p-6">
        Failed to load. Please try again later.{err.message}
      </div>
    );
  }
}
