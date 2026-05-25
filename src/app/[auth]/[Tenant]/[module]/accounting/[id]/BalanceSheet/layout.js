import Nav1 from "@/app/Components/Nav1";
import { fetchUser } from "../../../../../../../../Functions/useerDataRefresh";
import Footer2 from "@/app/Components/Footer2";
import { Separator } from "@/components/ui/separator";
import { Encrypt } from "../../../../../../../../Functions/Mics";
import { notFound } from "next/navigation";
import BackButton from "@/app/Components/BackBotton";
import BalanceSheet from "./page";

export const metadata = {
  title: "Business Automated Dynamic Enterprise [B.A.D.E]",
  description: "Automate, Optimize, and Scale Your Business Operations",
  keywords: [
    /* ...keywords omitted for brevity... */
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
  const baseUrl = process.env.EXPRESS_PRIVATE_URL;

  // check if user has access to crm and cash register
  const AccountingFinder = userData.user.Apps.find((app) => {
    return app.Name === "Accounting";
  });

  if (!AccountingFinder) {
    return notFound();
  }

  try {
    const res = await fetch(`${baseUrl}/api/Generate/BalanceSheet`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
        access: `${Encrypt(userData.user._id)}`,
      },
      // cache: "force-cache",
      // next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch balance data");
    }

    const response = await res.json();

    return (
      <div className="flex flex-col min-h-screen overflow-hidden">
        <Nav1
          user={userData.user}
          business={userData.business}
          page={`${moduleList.id}`}
        />

        <div className="flex flex-1 text-white bt-2">
          {/* Sidebar */}
          <aside
            className="w-72 bg-[#1e1e20]/70 backdrop-blur-md text-white px-4 py-6 transition-all duration-300 max-h-[90dvh] md:block"
            style={{ overflowY: "auto" }}
          >
            <nav className="">
              <BackButton />
              <Separator className="my-2" />
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <section className="w-full max-w-screen-xl mx-auto flex flex-col gap-6 rounded-lg p-3 relative z-10 max-h-[83dvh] overflow-y-auto">
              <BalanceSheet baseUrl={baseUrl} userData={userData} data={response}/>
            </section>
          </main>
        </div>

        <Footer2 />
      </div>
    );
  } catch (err) {
    return (
      <div className="text-black p-6">
        Failed to load. Please try again later.
      </div>
    );
  }
}
