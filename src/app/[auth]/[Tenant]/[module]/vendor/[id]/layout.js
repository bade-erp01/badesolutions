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
  const baseUrl = process.env.EXPRESS_PRIVATE_URL;
  const Params = await params;

  const [res,Acc] = await Promise.all([
    await fetch(`${baseUrl}/api/Vendor/${Params.id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
      access:`${Encrypt(userData.user._id)}`,
      sessionKey: `Bearer ${Encrypt(userData.SessionId)}`
    },
    // Optional: Add caching headers if needed
    next: { revalidate: 120 }, // Revalidate every 2 minutes
  }),

  // get all bank  accounts
  await fetch(`${baseUrl}/api/Bank/Accounts`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
      access:`${Encrypt(userData.user._id)}`,
      sessionKey: `Bearer ${Encrypt(userData.SessionId)}`
    },
    // Optional: Add caching headers if needed
    next: { revalidate: 120 }, // Revalidate every 2 minutes
  })

  
  ])

  // check if business has Accounting module enabled
const AccountingFinder = userData.business.modules.find(app=>{
    return app.Name === "Accounting"
  })

  if (!res.ok || !Acc.ok) {
    // Handle error gracefully
    return (
      <div className="text-center text-red-500">
        Failed to load vendor data. Please try again later.
      </div>
    );
  }

  const req = await res.json();
  const Accs = await Acc.json();

  return (
    <div>
      <SingleVendorpage AccountingFinder={AccountingFinder} banks={Accs} Backdata={req.vendor} Locations={req.Locations} wh={req.WH} userInfo={userData} baseUrl={baseUrl} />
    </div>
  );
}
