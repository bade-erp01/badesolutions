import TransferPage from "./page"
import { fetchUser } from "../../../../../../../../Functions/useerDataRefresh";
import { Encrypt,Dencrypt } from "../../../../../../../../Functions/Functions";
import Nav1 from "@/app/Components/Nav1"
import BackButton from "@/app/Components/BackBotton"
import Footer2 from "@/app/Components/Footer2";

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
    const [res] = await Promise.all([
      fetch(`${baseUrl}/api/Transfer/${moduleList.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
        dbConnect: `Bearer ${userData.business.rustyRoof}`,

      },
    }),

    ])
  
    if (!res.ok) {
      return (
        <p className="font-semibold text-lg-center text-center text-red-500">Something went wrong</p>
      ); 
    }
  
    const data = await res.json();
    const Transfer = Dencrypt(data.Transfer);
    const productsList = Dencrypt(data.products);

    return (
     <div className="flex flex-col">
       {/* Navigation Bar */}
       <Nav1
        user={userData.user}
        business={userData.business}
        page={`${Transfer.billReferenceNo?.toUpperCase() }`}
       />
   
       {/* Main Content Area */}
       <div className="flex flex-2 max-h-[83vh] overflow-y-hidden">
        {/* Aside (Left Sidebar) */}
        <aside className="w-72 bg-[#1e2939] text-white px-4 py-4 overflow-hidden">
         <BackButton />
         <hr className="my-4 border-gray-700" />
         <nav className="flex-grow">
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
             }) || <li className="py-3 px-4 text-sm">No activity logs.</li>}
            </ul>
           </div>
         </nav>
        </aside>
   
        {/* Main Content (Right Side) */}
        <main className="flex-1 overflow-hidden">
         <section className=" flex-2 max-w-screen-xl h-[83vh] overflow-y-scroll">
          <TransferPage bill={Transfer} products={productsList} Business={userData.business} user={userData.user} EXPRESS_PRIVATE_URL={baseUrl}/>;
         </section>
        </main>
       </div>
   
       {/* Footer */}
       <Footer2 />
     </div>
    );
  }
  