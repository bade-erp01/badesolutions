
import dbConnect from "../../../../../../lib/mongoose";
import {fetchUser} from "../../../../../../Functions/useerDataRefresh"
import Users from "../../../../../../models/Users"
import Link from "next/link";
import Card from "@/app/Components/Card";

export const metadata = {
  title: "Business Automated Dynamic Enterprise [B.A.D.E] || Employee List",
  description:
    "Business Automated Dynamic Enterprise [B.A.D.E] - Automate, Optimize, and Scale Your Business Operations",
  keywords: [
    "Business Automation",
    "Enterprise Solutions",
    "B.A.D.E",
    "AI-powered Business",
    "Workflow Optimization",
    "Process Automation",
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

export default async function EmployeeListpage() {
  await dbConnect()
  const userData = await fetchUser();
  const businessInfo = userData.business;

  const EmployeeList = await Users.findByTenant(businessInfo.tenantId).lean();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {EmployeeList.map(employee => (
           <Card key={employee._id} data={JSON.parse(JSON.stringify(employee))} module={'employee'}/> 
        ))}
    </div>
  )
}
