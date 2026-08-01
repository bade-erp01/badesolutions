
import { fetchUser } from "../../../../../../Functions/useerDataRefresh";
import Storelayout from "./page"
import {Encrypt,Dencrypt} from "../../../../../../Functions/Functions"

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
  twitterImage: "/assets/bade.png"
};


export default async function layout({children}) {
     const userData = await fetchUser();

      const baseUrl = process.env.EXPRESS_PRIVATE_URL;
       const res = await fetch(`${baseUrl}/api/Purchasees`, {
         method: "GET",
         headers: {
           "Content-Type": "application/json",
           "Authorization": `Bearer ${Encrypt(userData.business.tenantId)}`,
            access:`${Encrypt(userData.user._id)}`,
            sessionKey: `Bearer ${Encrypt(userData.SessionId)}`
         }
       })
     
       const data = await res.json()
  
    //  get vendor list
    const VendorList = data.VendorList
    const purchaseList = data.purcghaseList
    const Store = data.Store

  return <Storelayout purchaseList={purchaseList} userData={userData} VendorList={VendorList} Store={Store}/>
}
