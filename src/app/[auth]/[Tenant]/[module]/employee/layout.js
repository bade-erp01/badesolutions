import Nav1 from "@/app/Components/Nav1";
import { fetchUser } from "../../../../../../Functions/useerDataRefresh";
import Footer2 from "@/app/Components/Footer2";
import ExcelDownloadBtn from "@/app/Components/ExcelDownloadBtn";

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
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#f4a8ff", // Sets browser tab color (good for branding)
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
};

export default async function Employeelayout({ children, params }) {
  const moduleList = await params;
  const userData = await fetchUser();
  // await dbConnect("BadeAdmin")
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const res = await fetch(`${baseUrl}/api/UsersApi`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userData.business.tenantId}`,
      dbConnect:`Bearer ${`BadeAdmin`}`,
    },
  });
  const EmployeeList = await await res.json();
  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Nav1
        user={userData.user}
        business={userData.business}
        page={`${moduleList.module}`}
        Module={EmployeeList}
      />

      <div className="flex flex-1 text-white bt-2">
        {/* Sidebar (collapsible on mobile) */}
        <aside
          className={`w-70  bg-[#1e1e20]/70 backdrop-blur-md 
              text-white px-4 py-6 transition-all duration-300 h-[510px] max-h-[600px] overflow-y-hidden md:block`}
          style={{ maxHeight: "600px", overflowY: "hidden" }}
        >
          <h2 className="text-lg  text-white font-bold mb-4">
            Employee Management
          </h2>
          <hr />
          <nav className="space-y-4  h-[500px] max-h-[600px] overflow-y-hidden ">
            {userData?.user?.isAdmin && EmployeeList.length > 0 && (
              <ExcelDownloadBtn data={EmployeeList} page="employee" />
            )}
            
          </nav>
        </aside>{" "}
        {/* Main Content Area */}
        <main className="flex-1 ">
          <section className="w-full max-w-screen-xl mx-auto flex flex-col gap-6 rounded-lg p-6 relative z-10 h-[500px] overflow-y-auto">
            {children}
          </section>
        </main>
      </div>
      <Footer2 />
    </div>
  );
}
