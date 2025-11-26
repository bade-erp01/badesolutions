import Nav1 from "@/app/Components/Nav1";
import { fetchUser } from "../../../../../../../Functions/useerDataRefresh";
import Footer2 from "@/app/Components/Footer2";
import {Encrypt,Dencrypt} from "../../../../../../../Functions/Functions"
import DraftPurchasePage from './page'
import { notFound } from "next/navigation"; // Import the notFound function



export const metadata = {
  title: "Business Automated Dynamic Enterprise [B.A.D.E]",
  description: "Business Automated Dynamic Enterprise [B.A.D.E] - Automate, Optimize, and Scale Your Business Operations",
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
    "Scalable ERP Solutions"
  ],
  author: "Business Automated Dynamic Enterprise",
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1, theme-color=#f4a8ff",
  ogTitle: "Business Automated Dynamic Enterprise [B.A.D.E] | Next-Level Automation",
  ogDescription: "Streamline your business with AI-driven automation, real-time insights, and scalability",
  ogImage: "/assets/bade.png",
  ogUrl: "https://badesolutions.com.ng",
  twitterCard: "/assets/bade.png",
  twitterTitle: "Business Automated Dynamic Enterprise [B.A.D.E]",
  twitterDescription: "Automate and optimize your enterprise with cutting-edge business solutions",
  twitterImage: "/assets/bade.png",
  favicon:'/favicon.ico'
};

export default async function storelayout({ params }) { 
  const moduleList = await params;
  const userData = await fetchUser();

   const baseUrl = process.env.EXPRESS_PRIVATE_URL;
  const res = await fetch(`${baseUrl}/api/Purchase/${moduleList.id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userData.business.tenantId}`,
      dbConnect: `Bearer ${userData.business.rustyRoof}`,
    },
  });

  if (!res.ok) {
    return notFound(); // Correctly invoke the notFound function
  }

  const data = await res.json();


  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Nav1
        user={userData.user}
        business={userData.business}
        page={`RFP/${data.purchaseOrder.billReferenceNo}`}
      />

      <div>
        <DraftPurchasePage  user={userData.user} customer={data.vendor} bill={data.purchaseOrder} products={data.storeProductList} Business={userData.business} Whouse={data.WH} />
      </div>
      <Footer2 />
    </div>
  );
}
