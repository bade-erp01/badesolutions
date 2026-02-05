import React from 'react'
import Page from "./page"
import { fetchUser } from "../../../../../../../Functions/useerDataRefresh";
import { Encrypt, Dencrypt } from "../../../../../../../Functions/Functions";
import { notFound } from "next/navigation";
import Nav1 from "@/app/Components/Nav1";
import Footer2 from "@/app/Components/Footer2";
import BackButton from "@/app/Components/BackBotton";
import Users from "../../../../../../../models/Users"

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



export default async function layout({params}) {

    const userData = await fetchUser();
      const moduleList = await params;
      const baseUrl = process.env.EXPRESS_PRIVATE_URL;
      // check if user has access to crm and cash register
      const AssetFinder = userData.user.Apps.find((app) => {
        return app.Name === "Asset Register";
      });
    
      if (!AssetFinder) {
        return notFound();
      }

      const users = await Users.findByTenant(userData.business.tenantId)
      const StringedUsers = JSON.stringify(users)
      const ParsedUser = JSON.parse(StringedUsers)
    
      const [Assets,Stores] = await Promise.all([
        fetch(`${baseUrl}/api/asset/${moduleList.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
            dbConnect: `Bearer ${userData.business.rustyRoof}`,
          },
        }),

        fetch(`${baseUrl}/api/Stores`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userData.business.tenantId}`,
          dbConnect: `Bearer ${userData.business.rustyRoof}`,
        },
        next: {
          revalidate: 120,
        },
      }),


      ]);
    
      const asset = await Assets.json();
      const StoreList = await Stores.json()
      const DecryptedAsset = Dencrypt(asset.Asset)

      if(!DecryptedAsset){
        return notFound()
      }

       return (
            <div className="flex flex-col min-h-screen overflow-hidden">
              <Nav1
                user={userData.user}
                business={userData.business}
                page={`${DecryptedAsset.Name}`}
              />
      
              <div className="flex flex-1 text-white bt-2 overflow-hidden">
                {/* Sidebar */}
                <aside
                  className="w-72 bg-[#1e1e20]/70 backdrop-blur-md text-white px-4 py-6 transition-all duration-300 max-h-[83dvh] md:block"
                  style={{ overflowY: "auto" }}
                >
                  <nav className="space-y-2">
                    <BackButton />
                    <hr className="border-gray-100 mb-4" />
                      {/* display some fileds here */}
                      <div className="bg-gray-700 rounded-lg shadow-md overflow-hidden">
        
                      <ul className="divide-y divide-gray-700">
                          <li  className="py-3 px-4 text-xs text-italic">
                            <div className="flex justify-between items-center">
                              <span className="text-italic">Depreciation Value: 
                                {DecryptedAsset.ResidualValue.$numberDecimal} 
                                </span>
                            </div>
                            <hr className="border-gray-500" />
                          </li>

                          <li  className="py-3 px-4 text-xs text-italic">
                            <div className="flex justify-between items-center">
                              <span className="text-italic">Asset Depreciation: {" "} 
                                {DecryptedAsset.runDepreciation ? "Active" : "Inactive"}
                                </span>
                            </div>
                            <hr className="border-gray-500" />
                          </li>

                          <li  className="py-3 px-4 text-xs text-italic">
                            <div className="flex justify-between items-center">
                              <span className="text-italic">Depreciation Type: {DecryptedAsset.DepreciationType}</span>
                            </div>
                            <hr className="border-gray-500" />
                          </li>

                          <li  className="py-3 px-4 text-xs text-italic">
                            <div className="flex justify-between items-center">
                              <span className="text-italic">Depreciation Count: {DecryptedAsset.CycleCount}</span>
                            </div>
                            <hr className="border-gray-500" />
                          </li>
                      </ul>
                      </div>
                  </nav>
                </aside>
      
                {/* Main Content */}
                <main className="flex-1">
                  <section className="w-full max-w-7xl mx-auto flex flex-col gap-6 rounded-lg p-2 relative z-10 max-h-[82dvh] overflow-y-auto">
                     <Page DecryptedAsset={DecryptedAsset} StoreList={StoreList} userInfo={userData} users={ParsedUser} baseUrl={baseUrl}/>
                  </section>
                </main>
              </div>
      
              <Footer2 />
            </div>
          );

    }
    