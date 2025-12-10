import { fetchUser } from "../../../../../../Functions/useerDataRefresh";
import { Encrypt,Dencrypt } from "../../../../../../Functions/Functions";
import Card from "@/app/Components/Card";

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

export default async function page({data,params}) {
  const moduleList = await params

  try {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-10">
        {data && data.length > 0 ? (
          data.map((element) => (
            <Card key={element._id} data={element} module={moduleList.module} />
          ))
        ) : (
          <p className="text-center text-gray-500 col-span-full italic">
            No assets to display
          </p>
        )}
      </div>
    )
  } catch (err) {
    return <p className="text-black">{err.message}</p>;
  }
}
