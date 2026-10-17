
import { fetchUser } from '../../../../../../Functions/useerDataRefresh'
import BackButton from '@/app/Components/BackBotton';
import SearchResultPage from './page'
import { serverApi } from "@/lib/serverApi"
import { redirect } from "next/navigation";

export const metadata = {
  title: "Business Automated Dynamic Enterprise [B.A.D.E]",
  description: "Business Automated Dynamic Enterprise [B.A.D.E] - Automate, Optimize, and Scale Your Business Operations",
  keywords: ["Business Automation", "Enterprise Solutions", "B.A.D.E", "AI-powered Business", "Workflow Optimization", "Process Automation"],
  author: "Business Automated Dynamic Enterprise",
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#f4a8ff",
  ogTitle: "Business Automated Dynamic Enterprise [B.A.D.E] | Next-Level Automation",
  ogDescription: "Streamline your business with AI-driven automation, real-time insights, and scalability",
  ogImage: "/assets/bade.png",
  ogUrl: "https://badesolutions.com.ng",
  twitterCard: "favicon.ico",
  twitterTitle: "Business Automated Dynamic Enterprise [B.A.D.E]",
  twitterDescription: "Automate and optimize your enterprise with cutting-edge business solutions",
  twitterImage: "favicon.ico",
  favicon: "favicon.ico",
};

export default async function searchLayout({children, params }) {
  const userData = await fetchUser();
  const moduleList = await params;

  if (!userData) {
    redirect("/");
  }

  // make api request to server to get cached data
  const r = await serverApi(`/api/search/${moduleList.searchProduct}`);
  if (!r.ok) throw new Error(r.error);
  const { data } = r;

  return (
    <div className="flex flex-col min-w-0">
        {/* Main Content Area */}
        <main className="flex-1 ">
          <SearchResultPage result={data} linkData={userData} baseUrl={process.env.EXPRESS_PRIVATE_URL}/>
        </main>
      </div>
  );
}

