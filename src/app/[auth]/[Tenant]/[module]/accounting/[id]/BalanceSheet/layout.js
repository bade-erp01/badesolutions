import Nav1 from "@/app/Components/Nav1";
import { fetchUser } from "../../../../../../../../Functions/useerDataRefresh";
import Footer2 from "@/app/Components/Footer2";
import { Encrypt } from "../../../../../../../../Functions/Mics";
import { notFound } from "next/navigation";
import BalanceSheet from "./page";
import moment from "moment"

export const metadata = {
  title: "Business Automated Dynamic Enterprise [B.A.D.E]",
  description: "Automate, Optimize, and Scale Your Business Operations",
  keywords: [
    /* ...keywords omitted for brevity... */
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

export default async function AccountingPage({ children, params }) {
  const userData = await fetchUser();
  const moduleList = await params;
  const baseUrl = process.env.EXPRESS_PRIVATE_URL;

  // check if user has access to crm and cash register
  const AccountingFinder = userData.user.Apps.find((app) => {
    return app.Name === "Accounting";
  });

  if (!AccountingFinder) {
    return notFound();
  }

  try {
    const res = await fetch(`${baseUrl}/api/Generate/BalanceSheet?period=${moment().year()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
        access: `${Encrypt(userData.user._id)}`,
        sessionKey: `Bearer ${Encrypt(userData.SessionId)}`
      },
      // cache: "force-cache",
      // next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch balance data");
    }

    const response = await res.json();

    return (
     <>
       <Nav1 user={userData.user} business={userData.business} page={`Balance sheet
        `} />
      <BalanceSheet baseUrl={baseUrl} userData={userData} data={response}/>
      <Footer2 />
     </>
    );
  } catch (err) {
    return (
      <div className="text-black p-6">
        Failed to load. Please try again later.
      </div>
    );
  }
}
