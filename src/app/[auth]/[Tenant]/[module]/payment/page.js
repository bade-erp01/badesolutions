import { fetchUser } from "../../../../../../Functions/useerDataRefresh";
import PaymentListpage from "@/app/Components/PaymentList";
import bankAccount from "../../../../../../models/BankAccount"
import Customers from "../../../../../../models/Customer"
import CreditCustomerPayment from "../../../../../../models/Creditpayment"

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
  facicon:'/favicon'
};

export default async function paymentlayout({ children, params }) {
  const moduleList = await params;
  const userData = await fetchUser();
    
    const Accounts = await bankAccount.findByTenant(userData.business.tenantId).lean()
    const Customer = await Customers.findByTenant(userData.business.tenantId).lean()
    const Payments  = await CreditCustomerPayment.findByTenant(userData.business.tenantId).sort({_id:-1}).limit(5000).lean()

    // string all data for light weight
    const Accountslist = JSON.stringify(Accounts) || "[]"
    const CustomersList = JSON.stringify(Customer) || "[]"
    const PaymentList = JSON.stringify(Payments) || "[]"

  return (
    <>
    <PaymentListpage Payments={PaymentList} bank={Accountslist} Customers={CustomersList} userInfo={userData}/>
    </>
  );
}
