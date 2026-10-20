import Nav1 from "@/app/Components/Nav1";
import { fetchUser } from "../../../../../../../../Functions/useerDataRefresh";
import { serverApi } from "@/lib/serverApi";
import BackButton from "@/app/Components/BackBotton";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

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
  robots: "index, follow", // Allows search engines to index and follow links
  viewport: "width=device-width, initial-scale=1, theme-color=#f4a8ff", // Moved themeColor here
  ogTitle:
    "Business Automated Dynamic Enterprise [B.A.D.E] | Next-Level Automation",
  ogDescription:
    "Streamline your business with AI-driven automation, real-time insights, and scalability",
  ogImage: "/assets/bade.png", // Preview image when shared on social media
  ogUrl: "https://badesolutions.com.ng",
  twitterCard: "/assets/bade.png",
  twitterTitle: "Business Automated Dynamic Enterprise [B.A.D.E]",
  twitterDescription:
    "Automate and optimize your enterprise with cutting-edge business solutions",
  twitterImage: "/assets/bade.png",
  facicon: "/favicon",
};

export default async function paymentlayout({ children, params }) {
  const moduleList = await params;
  const userData = await fetchUser();
  const res = await serverApi(`/api/Bank/Accounts`);

  const data = res.data || {};

  return (
    <div className="flex flex-col">
       
        {/* Main Content Area */}
        <main className="flex-1 ">
           {data.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 p-1">
                {data.map((account) => (
                  <Link
                    key={account._id}
                    href={`/${moduleList.auth}/V4/accounting/accounting/Bank-Accounts/Bank-Accounts/${account._id}`}
                    title={account.NAME}
                    className="block w-full h-full text-xs"
                    style={{ textDecoration: "none" }}
                  >
                    <div className="flex flex-row items-center gap-4 border hover:border-amber-100 rounded-md shadow-sm px-4 py-3 hover:shadow-md transition duration-200 animate__animated animate__fadeInUp min-h-20 w-full h-full">
                      <Image
                        src={'https://img.icons8.com/isometric/50/bank.png'}
                        width={60}
                        height={60}
                        alt={"photo"}
                        className="rounded-md object-cover w-16 h-16 shrink-0"
                        quality={100}
                        priority={true}
                      />
                      <div className="flex flex-col justify-center w-full min-w-0">
                        <p className=" font-semibold  truncate text-xs">
                          {account.NAME}
                        </p>
                        <small className=" mt-1 text-xs">
                         {userData.business.currency?.currency.Symbol}{account.Balance}
                        </small>
                      </div>
                    </div>
                  </Link>
                ))}
                
              </div>
            ) : (
              <div className="w-full h-full flex flex-col justify-center items-center">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-500 text-center">
                  No Bank Accounts Found
                </h1>
                <p className="text-gray-400 mt-2">
                  Please add bank accounts to view them here.
                </p>
              </div>
            )}
        </main>
      </div>
  );
}
