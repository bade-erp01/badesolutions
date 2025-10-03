import { fetchUser } from "../../../../../../Functions/useerDataRefresh";
import Users from "../../../../../../models/Users";
import Card from "@/app/Components/Card";

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
      description: "Automate and optimize your enterprise with cutting-edge business solutions",
      images: ["/assets/bade.png"],
    },
    favicon:"/favicon.ico"
  };
}

// ✅ Page Component
export default async function EmployeeListpage() {
  const userData = await fetchUser();
  const businessInfo = userData.business;

  const RawEMP = await Users.findByTenant(businessInfo.tenantId).lean();
  const StringedEMP = JSON.stringify(RawEMP)
  const EmployeeList = JSON.parse(StringedEMP)


  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
      {EmployeeList
        .sort((a, b) => a.firstName.localeCompare(b.firstName))
        .map((employee) => (
          <Card
            key={employee._id}
            data={employee}
            module="employee"
          />
        ))}
    </div>
  );
}