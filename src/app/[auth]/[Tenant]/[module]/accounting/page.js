import Nav1 from "@/app/Components/Nav1";
import { fetchUser } from "../../../../../../Functions/useerDataRefresh";
import Footer2 from "@/app/Components/Footer2";
import Link from "next/link";
import StockReportModal from "@/app/Components/Reports/StockReport";
import StockandSalesReport from "@/app/Components/Reports/StockandSalesReport";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  DocumentChartBarIcon,
  DocumentTextIcon,
  BanknotesIcon,
  PresentationChartLineIcon,
  BuildingLibraryIcon,
  CubeIcon,
  ShoppingCartIcon,
  TableCellsIcon
} from "@heroicons/react/24/outline";
import {Encrypt} from "../../../../../../Functions/Mics"
import { notFound } from 'next/navigation';
import SalesRportModal from "@/app/Components/Reports/SalesReport";
import EMPLOYEES from "../../../../../../models/Users";

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
  const user = await EMPLOYEES.findByTenant(userData.business.tenantId).lean();
  const stringedUser = JSON.stringify(user);
  const parsedUser = JSON.parse(stringedUser);
  const baseUrl = process.env.EXPRESS_PRIVATE_URL;
  
    // check if user has access to crm and cash register
    const AccountingFinder = userData.user.Apps.find(app=>{
      return app.Name === "Accounting"
    })
  
    if(!AccountingFinder){
      return notFound()
    }

  try {
   const MenuItems = [
  { label: "Expense Report", icon: CurrencyDollarIcon, url: 'ExpenseReport' },
  { label: "Balance Sheet", icon: DocumentChartBarIcon, url: 'BalanceSheet' },
  { label: "Account Receivable", icon: DocumentTextIcon, url: 'Receivables' },
  { label: "Account Payables", icon: BanknotesIcon, url: 'Payables' },
  { label: "Profit & Loss", icon: PresentationChartLineIcon, url: 'ProfitLoss' },
  { label: "Revenue Center", icon: BuildingLibraryIcon, url: 'RevenueCenter' },
  { label: "Chart of Accounts", icon: TableCellsIcon, url: 'Chart-Of-Accounts' },
];

    return (
      <div className="flex flex-col min-h-screen overflow-hidden">
        <Nav1
          user={userData.user}
          business={userData.business}
          page={moduleList.module}
        />

        <div className="flex flex-1 text-white bt-2">
          {/* Sidebar */}
          <aside
            className="w-72 bg-[#1e1e20]/70 backdrop-blur-md text-white px-4 py-6 transition-all duration-300 max-h-[90dvh] md:block"
            style={{ overflowY: "auto" }}
          >
            {/* <h2 className="text-lg font-bold mb-4">Accounting</h2>
            <hr className="border-gray-100 mb-4" /> */}
            <nav className="space-y-2">
              <SalesRportModal
                business={userData.business}
                baseUrl={baseUrl}
                user={parsedUser}
              />
              {MenuItems.map(({ label, icon: Icon, url }, index) => (
                <Link
                  key={index}
                  href={`/${userData.business.companyName}/${Encrypt(
                    userData.user._id
                  )}/${moduleList.module}/${moduleList.module}/${url}/${url}`}
                  className="group flex items-center gap-4 p-3 rounded-md hover:bg-gray-700 transition text-sm w-full"
                >
                  <Icon className="h-5 w-5 text-[#fcfcfc] group-hover:scale-110 transition-transform" />
                  <span className="group-hover:text-[#f9f6fa]">{label}</span>
                </Link>
              ))}
              <StockReportModal baseUrl={baseUrl} userData={userData} />
              <StockandSalesReport baseUrl={baseUrl} userData={userData} />
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <section className="w-full max-w-screen-xl mx-auto flex flex-col gap-6 rounded-lg p-3 relative z-10 max-h-[90dvh] overflow-y-auto">
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
        Failed to load. Please try again later.
      </div>
    );
  }
}
