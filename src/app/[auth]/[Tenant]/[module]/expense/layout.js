import Nav1 from "@/app/Components/Nav1";
import { fetchUser } from "../../../../../../Functions/useerDataRefresh";
import Footer2 from "@/app/Components/Footer2";
import BackButton from "@/app/Components/BackBotton";
import { notFound } from "next/navigation";
import { TagIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { Encrypt } from "../../../../../../Functions/Mics";
import ExpenseCategoryModal from "@/app/Components/CreateExpenseCat";

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
  const moduleList = await params;
  const baseUrl = process.env.EXPRESS_PRIVATE_URL;
  // check if user has access to crm and cash register
  const ExpenseFinder = userData.user.Apps.find((app) => {
    return app.Name === "Expense";
  });

  if (!ExpenseFinder) {
    return notFound();
  }

  const [cat] = await Promise.all([
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

  const catList = await cat.json();

  try {
    return (
      <div className="flex flex-col min-h-screen overflow-hidden">
        <Nav1
          user={userData.user}
          business={userData.business}
          page={`${moduleList.module}`}
          Module={[{}]}
        />

        <div className="flex flex-1 text-white bt-2 overflow-hidden">
          {/* Sidebar */}
          <aside
            className="w-72 bg-[#1e1e20]/70 backdrop-blur-md text-white px-4 py-6 transition-all duration-300 max-h-[83dvh] md:block"
            style={{ overflowY: "auto" }}
          >
            {/* <h2 className="text-lg font-bold mb-4">{moduleList.id}</h2>  */}
            <nav className="space-y-2">
              <BackButton />
              <hr className="border-gray-100 mb-4" />
              {userData?.user?.expenseUser && (
                <Link
                  href={`/${userData.business.companyName
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^a-z0-9-]/g, "")}/${Encrypt(
                    userData.user._id
                  )}/Module/Forms/${moduleList.module.toLowerCase()}`}
                  className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition"
                >
                  <PlusCircleIcon className="h-6 w-6 text-gray-100" />
                  <span className="text-xs">New Expense</span>
                </Link>
              )}

              {/* show all expense group/tags */}
              <div className="bg-blue-50 p-2 text-xs rounded-sm">
                <p className="text-amber-700 font-semibold">Expense Tags</p>
                  {catList.map((tag) => (
                <p className="italic text-xs text-gray-600" key={tag._id}>
                  * {tag.NAME}
                </p>
              ))}
              {userData?.user?.expenseManager && (
                <ExpenseCategoryModal />
              )}
              </div>

            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <section className="w-full max-w-screen-xl mx-auto flex flex-col gap-6 rounded-lg p-2 relative z-10 max-h-[82dvh] overflow-y-auto">
              {/* display Charts of accounts */}
              {children}
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
