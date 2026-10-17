import { fetchUser } from "../../../../../../../../Functions/useerDataRefresh";
import Notch from "@/app/Components/Notch";
import BackButton from "@/app/Components/BackBotton";
import { serverApi } from "@/lib/serverApi";
import Page from "./page"
import Link from "next/link"
import DebtorsReportModal from "@/app/Components/Reports/DebtorsReport";
import ReceivablesAgingModal from "@/app/Components/Reports/AgingSchedul";
import { CreditCardIcon,BanknotesIcon } from "@heroicons/react/24/outline";
import { notFound } from 'next/navigation';

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

    const usersRes = await serverApi(`/api/Users`)
    const parsedUsers = usersRes.data?.data || []

   // check if user has access to crm and cash register
  const AccountingFinder = userData.user.Apps.find(app=>{
    return app.Name === "Accounting"
  })

  if(!AccountingFinder){
    return notFound()
  }

  
  // fetch all credit payment from all bank account
    const res = await serverApi(`/api/crm`);

    const data = res.data
  try {
   
    return (
      <div className="flex flex-col">
          {/* Sidebar */}
          <Notch>
              <BackButton />
              
                {(userData.user.creditOfficer || userData.user.isAccountant)  && (
                 <>
                  <Link
                  href={`/${moduleList.auth}/V4/${moduleList.Module}/${moduleList.Module}/credit-note/credit-note`}
                  title={"Credit Notes"}
                  className="flex items-center gap-3 p-3 rounded-md  transition"
                  >
                   <CreditCardIcon className="h-5 w-5 " />
                   <span className="text-xs">Credit Notes</span>
                 </Link>
                 
                  <Link
                   href={`/${moduleList.auth}/V4/${moduleList.Module}/${moduleList.Module}/debit-note/debit-note`}
                   title={"Debit Notes"}
                   className="flex items-center gap-3 p-3 rounded-md  transition"
                 >
                   <BanknotesIcon className="h-5 w-5" />
                   <span className="text-xs">Debit Notes</span>
                 </Link>
                 </>
                )}
               
              <DebtorsReportModal users={parsedUsers} business={userData.business} data={data} />
              <ReceivablesAgingModal data={data} />
          </Notch>

          {/* Main Content */}
          <main className="flex-1">
             <Page data={data.filter((entry) => entry.Debt > 0)} />
          </main>
        </div>
    );
  } catch (err) {
    return (
      <div>
        Failed to load. Please try again later.
      </div>
    );
  }
}
