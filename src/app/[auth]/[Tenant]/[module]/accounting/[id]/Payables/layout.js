import Nav1 from "@/app/Components/Nav1";
import { fetchUser } from "../../../../../../../../Functions/useerDataRefresh";
import Footer2 from "@/app/Components/Footer2";
import BackButton from "@/app/Components/BackBotton";
import {Encrypt} from "../../../../../../../../Functions/Mics"
import Page from "./page"
import Link from "next/link"
import Image from "next/image"
import { CreditCardIcon,BanknotesIcon } from "@heroicons/react/24/outline";
import PayableRegister from "@/app/Components/Reports/PayableRegister";
import { notFound } from 'next/navigation';
import SharePdfMinimal from "@/app/Components/ShareViaBluthoot";

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
  const AccountingFinder = userData.user.Apps.find(app=>{
    return app.Name === "Accounting"
  })

  if(!AccountingFinder){
    return notFound()
  }

  // check if user has access to crm and cash register
  const StoreFinder = userData.user.Apps.find(app=>{
    return app.Name === "Stores Operations"
  })

  

  // fetch all credit payment from all bank account 
  const baseUrl = process.env.EXPRESS_PRIVATE_URL;
    const [vendors,Banks] = await Promise.all([
        fetch(`${baseUrl}/api/Vendors`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
        dbConnect: `Bearer ${userData.business.rustyRoof}`,
        access: `${Encrypt(userData.user._id)}`,
      },
      next: { revalidate: 120 }, // Revalidate every 2 minutes
    }),

    //  get all banks 
     fetch(`${baseUrl}/api/Bank/Accounts`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
        dbConnect: `Bearer ${userData.business.rustyRoof}`,
        access: `${Encrypt(userData.user._id)}`,
      },
      next: { revalidate: 120 }, // Revalidate every 2 minutes
    })

    ])
    
    const VendorList = await vendors.json()
    const BanksList = await Banks.json()

  try {
   
    return (
      <div className="flex flex-col min-h-screen overflow-hidden">
        <Nav1
          user={userData.user}
          business={userData.business}
          page={` ${moduleList.id}`}
        />

        <div className="flex flex-1 text-white bt-2">
          {/* Sidebar */}
          <aside
            className="w-72 bg-[#1e1e20]/70 backdrop-blur-md text-white px-4 py-6 transition-all duration-300 max-h-[83dvh] md:block"
            style={{ overflowY: "auto" }}
          >
            <BackButton />
            <hr className="border-gray-100 mb-4" />
            <nav className="space-y-2">
              
                {(userData.user.creditOfficer || userData.user.isAccountant)  && (
                 <>
                  <Link
                  href={`/${userData.business.companyName.replace(/\s+/g, "")}/${Encrypt(userData.user._id)}/${moduleList.module}/${moduleList.module}/Vendor-CreditNote/Vendor-CreditNote`}
                  title={"Credit Notes"}
                  className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition"
                  >
                   <CreditCardIcon className="h-5 w-5 text-gray-100" />
                   <span className="text-xs">Vendor Credit Notes</span>
                 </Link>
                 
                  <Link
                   href={`/${userData.business.companyName.replace(/\s+/g, "")}/${Encrypt(userData.user._id)}/${moduleList.module}/${moduleList.module}/Vendor-DebitNote/Vendor-DebitNote`}
                   title={"Debit Notes"}
                   className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition"
                 >
                   <BanknotesIcon className="h-5 w-5 text-gray-100" />
                   <span className="text-xs">Vendor Debit Notes</span>
                 </Link>
                 </>
                )}

              {StoreFinder && (
                <Link
                  href={`/${userData.business.companyName}/${Encrypt(userData.user._id)}/${StoreFinder.url
                    .toLowerCase()
                    .replace(/\s+/g, "")}/${StoreFinder.url
                    .toLowerCase()
                    .replace(/\s+/g, "")}`}
                  title={StoreFinder.Description || StoreFinder.description}
                  className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition"
                >
                  <Image
                    src={
                      StoreFinder.icon || "https://img.icons8.com/deco/48/open-box.png"
                    }
                    width={24}
                    height={24}
                    alt={StoreFinder.Name}
                  />
                  <span className="text-xs">{StoreFinder.Name}</span>
                </Link>
              )}
               
              <PayableRegister
                banks={BanksList}
                customers={VendorList}
                userData={userData}
                baseUrl={baseUrl}
              />

              {/* <SharePdfMinimal/> */}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <section className="w-full max-w-screen-xl mx-auto flex flex-col gap-6 rounded-lg p-3 relative z-10 max-h-[83dvh] overflow-y-auto">
              <Page VendorList={VendorList} userData={userData} baseUrl={baseUrl} BanksList={BanksList}/>
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
