import TransferPage from "./page"
import { fetchUser } from "../../../../../../Functions/useerDataRefresh";
import { Encrypt,Dencrypt } from "../../../../../../Functions/Functions";

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
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1, theme-color=#f4a8ff",
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
  favicon: "favicon.ico",
};


export default async function Productlayout({ children, params }) {
  const moduleList = await params;
  const userData = await fetchUser();

    const baseUrl = process.env.EXPRESS_PRIVATE_URL;
    const [res,stores] = await Promise.all([
      fetch(`${baseUrl}/api/Transfers`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
        sessionKey: `Bearer ${Encrypt(userData.SessionId)}`,
        access: `${Encrypt(userData.user._id)}`

      },
      next: { revalidate: 60 } // cache for 1 minutes
    }),

    // get all store
    fetch(`${baseUrl}/api/Stores`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData.business.tenantId}`,
        sessionKey: `Bearer ${Encrypt(userData.SessionId)}`,
        access: `${Encrypt(userData.user._id)}`
      },
       next: { revalidate: 60 } // cache for 1 minutes
    })

    ])
  
    if (!res.ok) {
      return (
        <p className="font-semibold text-lg-center text-center text-red-500">Something went wrong</p>
      ); 
    }
  
    const data = await res.json();
    const TransfersList = Dencrypt(data.TransferList)
    const StoreList = await stores.json()

   return <TransferPage purchaseList={TransfersList} userData={userData} Store={StoreList} baseUrl={baseUrl}/>;
}
