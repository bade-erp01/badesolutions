
import Nav1 from "@/app/Components/Nav1";
import { fetchUser } from "../../../../../../../Functions/useerDataRefresh";
import Footer2 from "@/app/Components/Footer2";
import BackButton from "@/app/Components/BackBotton";
import { notFound } from "next/navigation";
import Page from "./page";

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

export default async function ExpenseLayout({ children, params }) {
  const userData = await fetchUser();

   const baseUrl = process.env.EXPRESS_PRIVATE_URL;

const [storeRes, ExpenseCat] = await Promise.all([
  fetch(`${baseUrl}/api/Stores`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userData.business.tenantId}`,
      dbConnect: `Bearer ${userData.business.rustyRoof}`,
    },
    next: {
      revalidate: 120,
    },
  }),
  fetch(`${baseUrl}/api/ExpenseCat`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userData.business.tenantId}`,
      dbConnect: `Bearer ${userData.business.rustyRoof}`,
    },
    next: {
      revalidate: 120,
    },
  }),
]);

const StoreList = await storeRes.json();
const ExpenseCatList = await ExpenseCat.json();


  // check if user has access to crm and cash register
  const ExpenseFinder = userData.user.Apps.find((app) => {
    return app.Name === "Expense";
  });

  if (!ExpenseFinder) {
    return notFound();
  }

  

  try {
    return (
      <div className="flex flex-col min-h-screen overflow-hidden">
        <Nav1
          user={userData.user}
          business={userData.business}
          page="Register Vendor"
        />

        <div className="flex flex-1 text-white bt-2 max-h-screen">
          {/* Sidebar */}
          <aside
            className="w-72 bg-[#1e1e20]/70 backdrop-blur-md text-white px-4 py-6 transition-all duration-300 max-h-[83dvh] md:block"
            style={{ overflowY: "auto" }}
          >
            {/* <h2 className="text-lg font-bold mb-4">{moduleList.id}</h2>  */}
            <nav className="space-y-2">
              <BackButton />
              <hr className="border-gray-100 mb-4" />
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <section className="w-full max-w-screen-xl mx-auto flex flex-col gap-6 rounded-lg p-3 relative z-10 max-h-[83dvh] overflow-y-auto">
              {/* display Charts of accounts */}
              <Page  StoreList={StoreList} businessData={userData.business} userData={userData.user} ExpenseCatList={ExpenseCatList} baseUrl={baseUrl}/>
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

