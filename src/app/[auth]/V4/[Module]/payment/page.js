import PaymentListpage from "@/app/Components/PaymentList";
import Nav1 from "@/app/Components/Nav1";
import { fetchUser } from "../../../../../../Functions/useerDataRefresh";
import { serverApi } from "@/lib/serverApi";
import BackButton from "@/app/Components/BackBotton";
import CashregisterReport from "@/app/Components/Reports/CashregisterReport";
import Notch from "@/app/Components/Notch";

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
  const res = await serverApi("/api/cashRegister", {
     next: { revalidate: 60 } // cache for 1 minutes
  });

  const data = res.data || {}

  // get sales rep names and manager 
    const usersRes = await serverApi("/api/Users");
    const parsedUsers = (usersRes.data?.data || []).map(({ _id, firstName, lastName }) => ({
      _id,
      firstName,
      lastName,
    }));

  return (
    <div className="flex flex-col">
        {/* Sidebar (collapsible on mobile) */}
        <Notch
          className={`bg-[#1e1e20]/80 backdrop-blur-lg
          text-white px-4 py-6 transition-all duration-300 max-h-[83dvh] overflow-y-auto md:block`}
          style={{ overflowY: "auto" }}
        >
          <BackButton />
            {userData?.user?.ReportUser && (
              <CashregisterReport
                dataArray={data.Payments}
                banks={data.Accounts}
                customers={data.Customers}
                Employees={parsedUsers}
              />
            )}
        </Notch>
        {/* Main Content Area */}
        <main className="flex-1 ">
           <PaymentListpage Payments={data.Payments} bank={data.Accounts} Customers={data.Customers} userInfo={userData}/>
        </main>
      </div>
  );
}
