import { fetchUser } from "../../../../../../../Functions/useerDataRefresh";
import SingleVendorpage from "./page";
import { Encrypt } from "../../../../../../../Functions/Functions";

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
  ogTitle: "Next-Level Automation",
  ogDescription:
    "Streamline your business with AI-driven automation, real-time insights, and scalability",
  ogImage: "/assets/bade.png",
  ogUrl: "https://badesolutions.com.ng",
  twitterCard: "/assets/bade.png",
  twitterTitle: "Business Automated Dynamic Enterprise [B.A.D.E]",
  twitterDescription:
    "Automate and optimize your enterprise with cutting-edge business solutions",
  twitterImage: "/assets/bade.png",
  favicon:"/facicon.ico"
};

export default async function SingleVendorPagelayout({ params }) {
  const userData = await fetchUser();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const Params = await params;

  const res = await fetch(`${baseUrl}/api/vendors/${Params.id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
    },
    // Optional: Add caching headers if needed
    next: { revalidate: 120 }, // Revalidate every 2 minutes
  });

  if (!res.ok) {
    // Handle error gracefully
    return (
      <div className="text-center text-red-500">
        Failed to load vendor data. Please try again later.
      </div>
    );
  }

  const req = await res.json();

  return (
    <div>
      <SingleVendorpage Backdata={req.vendor} wh={req.WH} userInfo={userData} />
    </div>
  );
}
