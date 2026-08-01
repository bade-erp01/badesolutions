import { fetchUser } from "../../../../../../Functions/useerDataRefresh";
import { notFound } from "next/navigation";
import Page from "./page";
import {Encrypt} from "../../../../../../Functions/Functions"

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

export default async function ExpenseLayout({ children, params }) {
  const userData = await fetchUser();

   const baseUrl = process.env.EXPRESS_PRIVATE_URL;

const [storeRes, ExpenseCat] = await Promise.all([
  fetch(`${baseUrl}/api/Stores`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
      sessionKey: `Bearer ${Encrypt(userData.SessionId)}`,
      access: `${Encrypt(userData.user._id)}`,
    },
    next: {
      revalidate: 120,
    },
  }),

  fetch(`${baseUrl}/api/ExpenseCat`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
      access: `${Encrypt(userData.user._id)}`,
      sessionKey: `Bearer ${Encrypt(userData.SessionId)}`,
    },
  }),
]);

const StoreList = await storeRes.json();
const ExpenseCatList = await ExpenseCat.json();

  // check if user has access to crm and cash register
  const ExpenseFinder = userData.user.Apps.find((app) => {
    return app.Name === "Expense";
  });

  if (!ExpenseFinder) {
    return notFound();
  }

  

  try {
    return (
      <div className="flex flex-col">

          {/* Main Content */}
          <main className="flex-1">
            <Page  StoreList={StoreList} businessData={userData.business} userData={userData.user} ExpenseCatList={ExpenseCatList} baseUrl={baseUrl}/>
          </main>
        </div>
    );
  } catch (err) {
    return (
      <div className="">
        Failed to load. Please try again later.
      </div>
    );
  }
}

