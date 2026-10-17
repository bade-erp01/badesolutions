import { fetchUser } from "../../../../../../../../Functions/useerDataRefresh";
import { serverApi } from "@/lib/serverApi";
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
    const res = await serverApi(`/api/Generate/BalanceSheet?period=${moment().year()}`);

    if (!res.ok) {
      throw new Error("Failed to fetch balance data");
    }

    const response = res.data;

    return <BalanceSheet baseUrl={baseUrl} userData={userData} data={response}/>;

  } catch (err) {
    return (
      <div className="">
        Failed to load. Please try again later.
      </div>
    );
  }
}
