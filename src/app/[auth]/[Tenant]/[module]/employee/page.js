import Nav1 from "@/app/Components/Nav1";
import { fetchUser } from "../../../../../../Functions/useerDataRefresh";
import Footer2 from "@/app/Components/Footer2";
import ExcelDownloadBtn from "@/app/Components/ExcelDownloadBtn";
import BackButton from "@/app/Components/BackBotton";
import { Encrypt } from "../../../../../../Functions/Functions";
import Card from "@/app/Components/Card";
import TaskAssigner from "@/app/Components/TaskAssigner"



// ✅ Dynamic Metadata for SEO
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
      description:
        "Automate and optimize your enterprise with cutting-edge business solutions",
      images: ["/assets/bade.png"],
    },
    favicon: "/favicon.ico",
  };
}

// ✅ Page Component
export default async function EmployeeListpage({ params }) {
  const userData = await fetchUser();
  const moduleList = await params;
  const baseUrl = process.env.EXPRESS_PRIVATE_URL;
  const res = await fetch(`${baseUrl}/api/Users`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
      access: `${Encrypt(userData.user._id)}`,
    },
  });

  const EmployeeList = await res.json();
  
  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Nav1
        user={userData.user}
        business={userData.business}
        page={`${moduleList.module}`}
        Module={[{}]}
      />

      <div className="flex flex-1 text-white bt-2">
        {/* Sidebar (collapsible on mobile) */}
        <aside
          aside
          className="hidden lg:block w-70 bg-[#1e1e20]/70 backdrop-blur-md text-white px-4 py-6 transition-all duration-300"
          style={{ overflowY: "auto" }}
        >
          <BackButton />
          <hr />
          <nav className="space-y-4  max-h-[83dvh] overflow-y-hidden ">
            {userData?.user?.isAdmin && EmployeeList.data.length > 0 && (
              <ExcelDownloadBtn data={EmployeeList.data} page="employee" />
            )}
            <TaskAssigner users={EmployeeList.data} userInfo={userData}  EXPRESS_PRIVATE_URL={baseUrl}/>
          </nav>
        </aside>{" "}
        {/* Main Content Area */}
        <main className="flex-1 ">
          <section className="w-full max-w-screen-xl mx-auto flex flex-col gap-6 rounded-lg p-6 relative z-10 max-h-[82dvh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
              {EmployeeList.data.sort((a, b) =>
                a.firstName.localeCompare(b.firstName),
              ).map((employee) => (
                <Card key={employee._id} data={employee} module="employee" />
              ))}
            </div>
          </section>
        </main>
      </div>
      <Footer2 />
    </div>
  );
}
