import BusinessDatas from "./page";
import { fetchUser } from "../../../../../Functions/useerDataRefresh";
import { Dencrypt } from "../../../../../Functions/Functions";
import Nav1 from "@/app/Components/Nav1";
import BackButton from "@/app/Components/BackBotton";
import Link from "next/link";
import Image from "next/image";
import Footer2 from "@/app/Components/Footer2";
import Business from "../../../../../models/Business";
import { notFound } from "next/navigation";

export async function generateMetadata() {
  const userData = await fetchUser();
  const businessInfo = userData.business;

  return {
    title: `${businessInfo.companyName} | Business Automation & AI Solutions`,
    description: `Discover how Business Automated Dynamic Enterprise helps enterprises automate workflows, optimize processes, and scale operations with AI-powered business solutions.`,
    keywords: [
      businessInfo.companyName,
      "Business Automation",
      "Enterprise Solutions",
      "AI-powered Business",
      "Workflow Optimization",
      "Process Automation",
      "Digital Transformation",
      "Business Scalability",
      "AI Business Tools",
      "Operational Efficiency",
    ],
    author: businessInfo.companyName,
    robots:
      "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
    viewport: "width=device-width, initial-scale=1",
    themeColor: "#f4a8ff",
    openGraph: {
      title: `${businessInfo.companyName} | Next-Level Business Automation`,
      description: `Streamline your enterprise with AI-driven automation, real-time insights, and scalable solutions.`,
      url: "https://badesolutions.com.ng",
      siteName: businessInfo.companyName,
      type: "website",
      locale: "en_US",
      images: [
        {
          url: `${businessInfo.companyLogo}`,
          width: 1200,
          height: 630,
          alt: `${businessInfo.companyName} Logo`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${businessInfo.companyName} | AI Business Automation`,
      description:
        "Automate, optimize, and scale your enterprise with cutting-edge AI business solutions.",
      images: [`${businessInfo.companyLogo}`],
      creator: "@YourTwitterHandle", // optional if you have one
    },
    favicon: "/favicon.ico",
  };
}

export default async function SetUpLayout({ children, params }) {
  const userData = await fetchUser();
  const moduleList = await params;
  const baseUrl = process.env.EXPRESS_PRIVATE_URL;

  if (!userData.user.isAdmin) {
    return notFound();
  }

  const RawBusiness = await Business.findById(Dencrypt(moduleList.id))
    .select("-payStackApiKey")
    .lean();
  const parsedBusiness = JSON.parse(JSON.stringify(RawBusiness));
  const business = JSON.parse(JSON.stringify(parsedBusiness));

  if (!business) return notFound();

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Nav1
        user={userData.user}
        business={userData.business}
        page={`${business.companyName}`}
      />

      <div className="flex flex-1 text-white bt-2">
        {/* Sidebar (collapsible on mobile) */}
        <aside
          className="w-70 bg-[#1e1e20]/70 backdrop-blur-md text-white px-4 py-6 transition-all duration-300 max-h-[83dvh] md:block"
          style={{ overflowY: "auto" }}
        >
          <BackButton />
          <hr />
          <nav className="space-y-4  overflow-y-auto ">
            <br />
            <Link
              href={`/`}
              className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition"
            >
              <h3 className=" text-xs">
                Next Renual Fee: ₦{business.SubcriptionAmount.toLocaleString()}
              </h3>
            </Link>

            {userData?.user?.isAdmin &&
              userData.business.subscriptionplan === "Standard" && (
                <Link
                  href={`/auth/Apps`}
                  className="flex items-center gap-3 p-3 bg-gray-100/50 rounded-md hover:bg-gray-700 transition  text-xs"
                >
                  <Image
                    src="https://img.icons8.com/avantgarde/100/apple-app-store.png"
                    width={24}
                    height={24}
                    alt="Settings"
                  />
                  <small>App Store</small>
                </Link>
              )}

            <div
              className="bg-gray-700 rounded-lg shadow-md overflow-y-scroll max-h-[30vh]"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#4B5563 transparent",
              }}
            >
              <table className="min-w-full text-xs divide-y divide-gray-700">
                <thead>
                  <tr className="bg-gray-800 text-gray-200">
                    <th className="py-2 px-4 text-left">Date</th>
                    <th className="py-2 px-4 text-left">Reference</th>
                    <th className="py-2 px-4 text-left">Amount</th>
                    <th className="py-2 px-4 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {business.PaymentLogs?.map((log, index) => (
                    <tr key={index} className="border-b border-gray-700">
                      <td className="py-2 px-4 italic">{log.date}</td>
                      <td className="py-2 px-4 italic">{log.ref}</td>
                      <td className="py-2 px-4 italic">{log.amount}</td>
                      <td className="py-2 px-4 italic">{log.status}</td>
                    </tr>
                  )) || (
                    <tr>
                      <td
                        colSpan="3"
                        className="py-3 px-4 text-sm text-center text-gray-400"
                      >
                        No payment logs available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center gap-3 bg-white shadow-md p-4 rounded-md">
              <div className="shrink-0 w-10 h-10 overflow-hidden rounded-full border border-gray-300">
                <Image
                  height={10}
                  width={10}
                  src={business.currency?.currency.Flag}
                  alt={`${business.currency?.currency.CountryName} Flag`}
                  className="w-full h-full object-cover"
                />
              </div>

              <span className="text-lg font-semibold text-gray-800">
                {business.currency?.currency.CountryName}
              </span>
            </div>
          </nav>
        </aside>{" "}
        {/* Main Content Area */}
        <main className="flex-1 ">
          <section className="w-full p-2 max-w-7xl flex flex-col gap-6 rounded-lg  relative z-10 max-h-[83dvh] overflow-y-auto">
            <BusinessDatas
              data={business}
              userInfo={userData}
              baseUrl={baseUrl}
            />
            {/* {children} */}
          </section>
        </main>
      </div>
      <Footer2 />
    </div>
  );
}
