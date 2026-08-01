import Notch from "@/app/Components/Notch";
import { fetchUser } from "../../../../../../../../Functions/useerDataRefresh";
import BackButton from "@/app/Components/BackBotton";
import { Encrypt } from "../../../../../../../../Functions/Mics";
import Link from "next/link";
import { notFound } from "next/navigation";
import CreditNoteModal from "@/app/Components/Accounting/CreditNoteModal";
import CreditnoteTable from "@/app/Components/CreditnoteTable";

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
  const AccountingFinder = userData.user.Apps.find((app) => {
    return app.Name === "Accounting";
  });

  if (!AccountingFinder) {
    return notFound();
  }

  // check if user has access to crm and cash register
  const crmFinder = userData.user.Apps.find((app) => {
    return app.Name === "CRM";
  });

  const cashRegister = userData.user.Apps.find((app) => {
    return app.Name === "Cash Register";
  });

  // fetch all credit payment from all bank account
  const baseUrl = process.env.EXPRESS_PRIVATE_URL;
  const res = await fetch(`${baseUrl}/api/Customer/Memo`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
      access: `${Encrypt(userData.user._id)}`,
      sessionKey: `Bearer ${Encrypt(userData.SessionId)}`,
    },
  });

  const data = await res.json();

  try {
    return (
      <div className="flex flex-col min-h-screen overflow-hidden">
        {/* Sidebar */}
        <Notch>
          <BackButton />

          {(userData.user.creditOfficer || userData.user.isAccountant) && (
            <CreditNoteModal
              customersList={data.customers}
              baseUrl={baseUrl}
              userData={userData}
              BankAccounts={data.bankAccounts}
            />
          )}
        </Notch>

        {/* Main Content */}
        <main className="flex-1">
          <CreditnoteTable data={data} />
        </main>
      </div>
    );
  } catch (err) {
    return (
      <div className="">
        Failed to load. Please try again later.
      </div>
    );
  }
}
