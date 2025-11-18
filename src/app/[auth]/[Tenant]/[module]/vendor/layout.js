
import { fetchUser } from "../../../../../../Functions/useerDataRefresh";
import {Encrypt} from "../../../../../../Functions/Functions"
import Nav1 from "@/app/Components/Nav1";
import Link from "next/link";
import Image from "next/image";
import {  UserGroupIcon,ShoppingCartIcon,ClipboardDocumentCheckIcon  } from "@heroicons/react/24/outline";
import ExcelDownloadBtn from "@/app/Components/ExcelDownloadBtn";
import Footer2 from "@/app/Components/Footer2";
import BackButton from "@/app/Components/BackBotton";

export const metadata = {
  title: "Business Automated Dynamic Enterprise [B.A.D.E]",
  description: "Business Automated Dynamic Enterprise [B.A.D.E] - Automate, Optimize, and Scale Your Business Operations",
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
    "Scalable ERP Solutions"
  ],
  author: "Business Automated Dynamic Enterprise",
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1, theme-color=#f4a8ff",
  ogTitle: "Business Automated Dynamic Enterprise [B.A.D.E] | Next-Level Automation",
  ogDescription: "Streamline your business with AI-driven automation, real-time insights, and scalability",
  ogImage: "/assets/bade.png",
  ogUrl: "https://badesolutions.com.ng",
  twitterCard: "/assets/bade.png",
  twitterTitle: "Business Automated Dynamic Enterprise [B.A.D.E]",
  twitterDescription: "Automate and optimize your enterprise with cutting-edge business solutions",
  twitterImage: "/assets/bade.png"
};


export default async function layout({children,params}) {
     const userData = await fetchUser();
     const Module = await params
     const baseUrl = process.env.EXPRESS_PRIVATE_URL;
       const res = await fetch(`${baseUrl}/api/Vendors`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Encrypt(userData.business.tenantId)}`,
            dbConnect:`Bearer ${userData.business.rustyRoof}`,
            access:`${Encrypt(userData.user._id)}`
          }
        })
    
        const vendorList = await res.json() 
        return (
            <div className="flex flex-col min-h-screen overflow-hidden">
              <Nav1
                user={userData.user}
                business={userData.business}
                page={`${Module.module}`}
                Module={vendorList}
              />
        
              <div className="flex flex-1 text-white bt-2">
                {/* Sidebar (collapsible on mobile) */}
                <aside
                   className="w-70 bg-[#1e1e20]/70 backdrop-blur-md text-white px-4 py-6 transition-all duration-300 max-h-[90dvh] md:block"
                   style={{ overflowY: "auto" }}
                >
                 <BackButton />
                  <hr />
                  <nav className="space-y-4">
                    <Link
                      href={`/${userData.business?.companyName
                        .toLowerCase()
                        .replace(/\s+/g, "-")
                        .replace(/[^a-z0-9-]/g, "")}/${Encrypt(
                        userData?.user._id
                      )}/Module/Forms/${Module.module.toLowerCase()}`}
                      className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition"
                    >
                      <Image
                        src="https://img.icons8.com/plasticine/100/create-new.png"
                        width={24}
                        height={24}
                        alt="Settings"
                      />
                      <small>New Vendor</small>
                    </Link>

                    {userData.user.raiseLpo || (userData.user.allowInternalTransfers && (
                    <Link
                      href={`/${userData.business?.companyName
                        .toLowerCase()
                        .replace(/\s+/g, "-")
                        .replace(/[^a-z0-9-]/g, "")}/${Encrypt(
                        userData?.user._id
                      )}/Module/Forms/purchase`}
                      className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition"
                    >
                      <ShoppingCartIcon class="h-6 w-6 text-gray-100" />
                      <small>Purchase Requests </small>
                    </Link>
                  ))}

                    {userData?.user?.isAdmin && vendorList.length > 0 && (
                      <ExcelDownloadBtn data={vendorList} page="Vendor list" />
                    )}
                    
                  </nav>
        
                  {/* Bottom Section with Settings Link */}
                 
                </aside>{" "}
                {/* Main Content Area */}
                <main className="flex-1 ">
                  <section className="w-full max-w-screen-xl mx-auto flex flex-col gap-6 rounded-lg p-3 relative z-10 max-h-[82dvh] overflow-y-auto">
                     {children}
                  </section>
                </main>
              </div>
              <Footer2 />
            </div>
          );
}
