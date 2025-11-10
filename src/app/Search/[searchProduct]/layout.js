
import { fetchUser } from '../../../../Functions/useerDataRefresh'
import {Encrypt,EXPRESS_PRIVATE_URL} from "../../../../Functions/Functions"
import Nav1 from '@/app/Components/Nav1';
import BackButton from '@/app/Components/BackBotton';
import Link from "next/link"
import Image from 'next/image';
import ExcelDownloadBtn from "@/app/Components/ExcelDownloadBtn";
import Footer2 from '@/app/Components/Footer2';
import SearchResultPage from './page'
import axios from "axios"

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

  // Use a single config object for axios
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
      "X-Requested-With": "XMLHttpRequest",
      dbConnect:`Bearer ${userData.business.rustyRoof}`,
      access:`${Encrypt(userData.user._id)}`,
    },
  };

  // make api request to server to get cached data
  const url = `${process.env.EXPRESS_PRIVATE_URL}/api/search/${moduleList.searchProduct}`;
  // Await axios call directly
  const { data } = await axios.get(url,config);

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Nav1
        user={userData.user}
        business={userData.business}
        page={`Search Result`}
      />

      <div className="flex flex-1 text-white bt-2">
        {/* Sidebar (collapsible on mobile) */}
        <aside
          className="w-70 bg-[#1e1e20]/70 backdrop-blur-md text-white px-4 py-6 transition-all duration-300 max-h-[83dvh] md:block"
          style={{ overflowY: "hidden" }}
        >
          <BackButton />
          <hr />
          <nav className="space-y-4  h-[520px] max-h-[600px] overflow-y-auto ">
           {data.length > 0 && (
              <ExcelDownloadBtn
                data={data}
                page={`Search result for ${moduleList?.searchProduct || "Unknown Module"}`}
              />
            )}
          </nav>

          {/* Bottom Section with Settings Link */}
        </aside>{" "}
        {/* Main Content Area */}
        <main className="flex-1 ">
          <section className="w-full max-w-screen-xl mx-auto flex flex-col gap-6 rounded-lg p-6 relative z-10 max-h-[83dvh] overflow-y-auto">
            {/* {children} */}
            <SearchResultPage result={data} linkData={userData} />
          </section>
        </main>
      </div>
      <Footer2 />
    </div>
  );
}

