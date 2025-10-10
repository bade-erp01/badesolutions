import Nav1 from "@/app/Components/Nav1";
import { fetchUser } from "../../../../../../../../Functions/useerDataRefresh";
import Footer2 from "@/app/Components/Footer2";
import BackButton from "@/app/Components/BackBotton";
import {Encrypt} from "../../../../../../../../Functions/Mics"
import Page from "./page"
import Link from "next/link"
import Image from "next/image"
import DebtorsReportModal from "@/app/Components/Reports/DebtorsReport";
import ReceivablesAgingModal from "@/app/Components/Reports/AgingSchedul";
import { CreditCardIcon,BanknotesIcon } from "@heroicons/react/24/outline";
import CashregisterReport from "@/app/Components/Reports/CashregisterReport";
import { notFound } from 'next/navigation';

export const metadata = {
  title: "Business Automated Dynamic Enterprise [B.A.D.E]",
  description: "Automate, Optimize, and Scale Your Business Operations",
  keywords: [/* ...keywords omitted for brevity... */],
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
  const crmFinder = userData.user.Apps.find(app=>{
    return app.Name === "CRM"
  })

  const cashRegister = userData.user.Apps.find(app=>{
    return app.Name === "Cash Register"
  })

  // fetch all credit payment from all bank account
  const baseUrl = process.env.EXPRESS_PRIVATE_URL;
    const res = await fetch(`${baseUrl}/api/cashRegister`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData.business.tenantId}`,
        dbConnect: `Bearer ${userData.business.rustyRoof}`,
        access: `${Encrypt(userData.user._id)}`,
      },
    });
  
    const data = await res.json()

  try {
   
    return (
      <div className="flex flex-col min-h-screen overflow-hidden">
        <Nav1
          user={userData.user}
          business={userData.business}
          page={`${moduleList.module} / ${moduleList.id}`}
        />

        <div className="flex flex-1 text-white bt-2">
          {/* Sidebar */}
          <aside
            className="w-72 bg-[#1e1e20]/70 backdrop-blur-md text-white px-4 py-6 transition-all duration-300 max-h-[83dvh] md:block"
            style={{ overflowY: "auto" }}
          >
            <h2 className="text-lg font-bold mb-4">{moduleList.id}</h2>
            <hr className="border-gray-100 mb-4" />
            <nav className="space-y-2">
              <BackButton />
              
                {(userData.user.creditOfficer || userData.user.isAccountant)  && (
                 <>
                  <Link
                  href={`/${userData.business.companyName.replace(/\s+/g, "")}/${Encrypt(userData.user._id)}/${moduleList.module}/${moduleList.module}/credit-note/credit-note`}
                  title={"Credit Notes"}
                  className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition"
                  >
                   <CreditCardIcon className="h-5 w-5 text-gray-100" />
                   <span className="text-xs">Credit Notes</span>
                 </Link>
                 
                  <Link
                   href={`/${userData.business.companyName.replace(/\s+/g, "")}/${Encrypt(userData.user._id)}/${moduleList.module}/${moduleList.module}/debit-note/debit-note`}
                   title={"Debit Notes"}
                   className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition"
                 >
                   <BanknotesIcon className="h-5 w-5 text-gray-100" />
                   <span className="text-xs">Debit Notes</span>
                 </Link>
                 </>
                )}
              {crmFinder && (
                <Link
                  href={`/${userData.business.companyName}/${Encrypt(userData.user._id)}/${crmFinder.url
                    .toLowerCase()
                    .replace(/\s+/g, "")}/${crmFinder.url
                    .toLowerCase()
                    .replace(/\s+/g, "")}`}
                  title={crmFinder.Description || ""}
                  className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition"
                >
                  <Image
                    src={
                      crmFinder.icon || "https://img.icons8.com/deco/48/open-box.png"
                    }
                    width={24}
                    height={24}
                    alt={crmFinder.Name}
                  />
                  <span className="text-xs">{crmFinder.Name}</span>
                </Link>
              )}

               {cashRegister && (
                <Link
                  href={`/${userData.business.companyName}/${Encrypt(userData.user._id)}/${cashRegister.url
                    .toLowerCase()
                    .replace(/\s+/g, "")}/${cashRegister.url
                    .toLowerCase()
                    .replace(/\s+/g, "")}`}
                  title={cashRegister.Description || ""}
                  className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition"
                >
                  <Image
                    src={
                      cashRegister.icon || "https://img.icons8.com/deco/48/open-box.png"
                    }
                    width={24}
                    height={24}
                    alt={cashRegister.Name}
                  />
                  <span className="text-xs">{cashRegister.Name}</span>
                </Link>
              )}
               
              <DebtorsReportModal data={data.Customers} />
              <ReceivablesAgingModal data={data.Customers} />
              <CashregisterReport
                dataArray={data.Payments}
                banks={data.Accounts}
                customers={data.Customers}
              />
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <section className="w-full max-w-screen-xl mx-auto flex flex-col gap-6 rounded-lg p-3 relative z-10 max-h-[83dvh] overflow-y-auto">
              <Page data={data} />
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
