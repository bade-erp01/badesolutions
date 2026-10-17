import { fetchUser } from "../../../../../../../Functions/useerDataRefresh";
import { serverApi } from "@/lib/serverApi";
import SinglePymentpage from "./page";
import BackButton from "@/app/Components/BackBotton"
import PaymentReceipt from "@/app/Components/PrintReciept";
import DialogDemo from "@/app/Components/AssignPayToInv";
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
  robots: "index, follow", // Allows search engines to index and follow links
  viewport: "width=device-width, initial-scale=1, theme-color=#f4a8ff", // Moved themeColor here
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

export default async function paymentlayout({ params }) {
  const decoy = await params;
  const userData = await fetchUser();

  const res = await serverApi(`/api/cashRegister/${decoy.id}`);
  if (!res.ok) throw new Error(res.error);

  const data = res.data;
  return (
     <div className="flex flex-col">
         {/* Sidebar (collapsible on mobile) */}
         <Notch >
           <BackButton />
           <hr />
           {(data.Payment.status === 'posted' && (userData?.user?.isAccountant )) && (
              <PaymentReceipt business={userData.business} payment={data.Payment} cust={data.Payment.customer?.Username.toUpperCase()} />
          )}

          {data?.Payment?.status === "posted" && !data?.Payment?.BillNo &&
            (userData?.user?.isAccountant || userData?.user?.postPayment) && (
              <DialogDemo
                PayId={data.Payment}
                pendingInvoices={data.pendingInvoices}
                userData={userData}
                baseUrl={process.env.EXPRESS_PRIVATE_URL2}
              />
          )}
          
         </Notch>{" "}
         {/* Main Content Area */}
         <main className="flex-1 ">
           <SinglePymentpage
              userInfo={userData}
              payment={data.Payment}
              cust={data.Payment.customer}
              bank={data.Payment.bankAccount}
            />
         </main>
       </div>
   );
}
