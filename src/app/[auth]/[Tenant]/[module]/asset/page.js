import Card from "@/app/Components/Card";
import { fetchUser } from "../../../../../../Functions/useerDataRefresh";
import Nav1 from "@/app/Components/Nav1";
import Footer2 from "@/app/Components/Footer2";
import BackButton from "@/app/Components/BackBotton";
import { notFound } from "next/navigation";
import { TagIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { Encrypt, Dencrypt } from "../../../../../../Functions/Functions";
import ExcelDownloadBtn from "@/app/Components/ExcelDownloadBtn";

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

export default async function AssetLayout({ children, params }) {
  const userData = await fetchUser();
  const moduleList = await params;
  const baseUrl = process.env.EXPRESS_PRIVATE_URL;
  // check if user has access to crm and cash register
  const AssetFinder = userData.user.Apps.find((app) => {
    return app.Name === "Asset Register";
  });

  if (!AssetFinder) {
    return notFound();
  }

  const [Assets] = await Promise.all([
    fetch(`${baseUrl}/api/Assets`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
        sessionKey: `Bearer ${Encrypt(userData.SessionId)}`,
        access: `${Encrypt(userData.user._id)}`
      },
      next: {
        revalidate: 60,
      },
    }),
  ]);

  const assetList = await Assets.json();

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
            <nav className="space-y-2">
              <BackButton />
              <hr className="border-gray-100 mb-4" />
              {userData?.user?.AssetManager && (
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
                  <span className="text-xs">New Asset</span>
                </Link>
              )}

              {Dencrypt(assetList.Asset).length > 0 &&
                userData?.user?.AssetManager && (
                  <ExcelDownloadBtn
                    data={Dencrypt(assetList.Asset)}
                    page="Asset List"
                  />
                )}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <section className="w-full max-w-7xl mx-auto flex flex-col gap-6 rounded-lg p-2 relative z-10 max-h-[82dvh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-10">
                {Dencrypt(assetList.Asset) &&
                Dencrypt(assetList.Asset).length > 0 ? (
                  Dencrypt(assetList.Asset).map((element) => (
                    <Card
                      key={element._id}
                      data={element}
                      module={moduleList.module}
                    />
                  ))
                ) : (
                  <p className="text-center text-gray-500 col-span-full italic">
                    No assets to display
                  </p>
                )}
              </div>
            </section>
          </main>
        </div>

        <Footer2 />
      </div>
    );
  } catch (err) {
    console.log(err.message)
    return (
      <div className="text-black p-6">
        Failed to load. Please try again later.
      </div>
    );
  }
}
