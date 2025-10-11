import React from 'react'
import Nav1 from "@/app/Components/Nav1";
import { fetchUser } from "../../../../../../../../../Functions/useerDataRefresh";
import Footer2 from "@/app/Components/Footer2";
import BackButton from "@/app/Components/BackBotton";
import {Encrypt} from "../../../../../../../../../Functions/Mics"
import Page from "./page"

export const metadata = {
  title: "Business Automated Dynamic Enterprise [B.A.D.E]",
  description: "Automate, Optimize, and Scale Your Business Operations",
  keywords: [/* ...keywords omitted for brevity... */],
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

export default async function layout({params}) {
    const userData = await fetchUser();
    const moduleList = await params;
    // fetch all credit payment from all bank account
  const baseUrl = process.env.EXPRESS_PRIVATE_URL;
    const res = await fetch(`${baseUrl}/api/DebitNote/${moduleList.dn}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData.business.tenantId}`,
        dbConnect: `Bearer ${userData.business.rustyRoof}`,
        access: `${Encrypt(userData.user._id)}`,
      },
    });
  
    const data = await res.json()
try {
   
    return (
      <div className="flex flex-col min-h-screen overflow-hidden">
        <Nav1
          user={userData.user}
          business={userData.business}
          page={`${data.DebitId}`}
        />

        <div className="flex flex-1 text-white bt-2">
          {/* Sidebar */}
          <aside
            className="w-72 bg-[#1e1e20] backdrop-blur-md text-white px-4 py-6 transition-all duration-300 max-h-[90dvh] md:block"
            style={{ overflowY: "auto" }}
          >
            <h2 className="text-lg font-bold mb-4">{data.DebitId}</h2>
            <hr className="border-gray-100 mb-4" />
            <nav className="space-y-2">
              <BackButton />

            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <section className="w-full max-w-screen-xl mx-auto flex flex-col gap-6 rounded-lg p-3 relative z-10 max-h-[90dvh] overflow-y-auto">
             <Page data={data} userData={userData} baseurl={baseUrl}/>
            </section>
          </main>
        </div>

        <Footer2 />
      </div>
    );
  } catch (err) {
    return (
      <div className="text-black p-6">
        Failed to load. Please try again later.
      </div>
    );
  }
}
