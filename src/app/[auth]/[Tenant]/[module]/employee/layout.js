import Nav1 from "@/app/Components/Nav1";
import { fetchUser } from "../../../../../../Functions/useerDataRefresh";
import Footer2 from "@/app/Components/Footer2";
import ExcelDownloadBtn from "@/app/Components/ExcelDownloadBtn";
import BackButton from "@/app/Components/BackBotton";

export async function generateMetadata() {
  const userData = await fetchUser();
  const businessInfo = userData.business;

  return {
    title: `${businessInfo.companyName} || Employee List`,
    description: `${businessInfo.companyName} - Automate, Optimize, and Scale Your Business Operations`,
    keywords: [
      businessInfo.companyName,
      "Business Automation",
      "Enterprise Solutions",
      "AI-powered Business",
      "Workflow Optimization",
      "Process Automation",
    ],
    author: businessInfo.companyName,
    robots: "index, follow",
    viewport: "width=device-width, initial-scale=1",
    themeColor: "#f4a8ff",
    openGraph: {
      title: `${businessInfo.companyName} | Next-Level Automation`,
      description: `Streamline your business with AI-driven automation, real-time insights, and scalability`,
      url: "https://badesolutions.com.ng",
      images: ["/assets/bade.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: businessInfo.companyName,
      description: "Automate and optimize your enterprise with cutting-edge business solutions",
      images: ["/assets/bade.png"],
    },
    favicon:"/favicon.ico"
  };
}


export default async function Employeelayout({ children, params }) {
  const moduleList = await params;
  const userData = await fetchUser();
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
          className="w-70 bg-[#1e1e20]/70 backdrop-blur-md text-white px-4 py-6 transition-all duration-300 max-h-[83dvh] md:block"
          style={{ overflowY: "auto" }}
        >
          <BackButton/>
          <hr />
          <nav className="space-y-4  max-h-[83dvh] overflow-y-hidden ">
            {userData?.user?.isAdmin && EmployeeList.length > 0 && (
              <ExcelDownloadBtn data={EmployeeList} page="employee" />
            )}
            
          </nav>
        </aside>{" "}
        {/* Main Content Area */}
        <main className="flex-1 ">
          <section className="w-full max-w-screen-xl mx-auto flex flex-col gap-6 rounded-lg p-6 relative z-10 max-h-[82dvh] overflow-y-auto">
            {children}
          </section>
        </main>
      </div>
      <Footer2 />
    </div>
  );
}
