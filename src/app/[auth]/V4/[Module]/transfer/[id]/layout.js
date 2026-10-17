import TransferPage from "./page"
import { fetchUser } from "../../../../../../../Functions/useerDataRefresh";
import { Dencrypt } from "../../../../../../../Functions/Functions";
import { serverApi } from "@/lib/serverApi";
import BackButton from "@/app/Components/BackBotton"
import Notch from "@/app/Components/Notch";



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

    const [res] = await Promise.all([
      serverApi(`/api/Transfer/${moduleList.id}`),
    ])
  
    if (!res.ok) {
      return (
        <p className="font-semibold">Something went wrong</p>
      ); 
    }
  
    const data = res.data || {};
    const Transfer = Dencrypt(data.Transfer);
    const productsList = Dencrypt(data.products);

    return (
     <div className="flex flex-col">
        <Notch>
         <BackButton />
         <hr className="my-4 border-gray-700" />
         
           <div className="bg-gray-700 rounded-lg shadow-md overflow-hidden">
           
            <ul className="divide-y divide-gray-700">
             {Transfer.ActivityLog?.map((log, index) => {
               return (
                <li key={index} className="py-3 px-4 text-xs">
                 <div className="flex justify-between items-center">
                   <span>{log.logMsg}</span>
                 </div>
                 <hr className="border-gray-500" />
                </li>
               );
             }) || <li className="py-3 px-4">No activity logs.</li>}
            </ul>
           </div>
        </Notch>
   
        {/* Main Content (Right Side) */}
        <main className="flex-1">
           <TransferPage bill={Transfer} products={productsList} Business={userData.business} user={userData.user}/>;
        </main>
       </div>
    );
  }
  