import { fetchUser } from "../../../../../../Functions/useerDataRefresh";
import { Encrypt } from "../../../../../../Functions/Mics";
import Card from "@/app/Components/Card";
import { notFound } from "next/navigation";

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

export default async function page({ params }) {
  const userData = await fetchUser();
  const moduleList = await params;

  // fetch all credit payment from all bank account
  const baseUrl = process.env.EXPRESS_PRIVATE_URL;
  const [res] = await Promise.all([
    fetch(`${baseUrl}/api/ExpenseList?page=1&limit=5`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData.business.tenantId}`,
        dbConnect: `Bearer ${userData.business.rustyRoof}`,
        access: `${Encrypt(userData.user._id)}`,
      },
    }),

  ])
  

  const data = await res.json();
  

  try {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-10">
        {data.expenses.map((element) => (
          <Card key={element._id} data={element} module={moduleList.module} />
        ))}
      </div>
    );
  } catch (err) {
    return <p>{err.message}</p>;
  }
}
