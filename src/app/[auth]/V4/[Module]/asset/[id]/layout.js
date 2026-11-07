import React from 'react'
import Page from "./page"
import { fetchUser } from "../../../../../../../Functions/useerDataRefresh";
import { Dencrypt } from "../../../../../../../Functions/Functions";
import { serverApi } from "@/lib/serverApi";
import { notFound } from "next/navigation";
import Notch from "@/app/Components/Notch";
import BackButton from "@/app/Components/BackBotton";

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

      const [UsersRes, Assets, Stores] = await Promise.all([
        serverApi("/api/Users"),
        serverApi(`/api/asset/${moduleList.id}`),
        serverApi("/api/Stores", { next: { revalidate: 120 } }),
      ]);

      const ParsedUser = UsersRes.data?.data || []
      const asset = Assets.data || {};
      const StoreList = Stores.data
      const DecryptedAsset = Dencrypt(asset.Asset)

      if(!DecryptedAsset){
        return notFound()
      }

       return (
            <div className="flex">
                {/* Sidebar */}
                <Notch>
                  <BackButton />
                    <hr className="border-gray-100 mb-4" />
                      {/* display some fileds here */}
                      <div className="rounded-lg shadow-md overflow-hidden">
        
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
                </Notch>
      
                {/* Main Content */}
                <main className="overflow-hidden  w-full">
                  <Page DecryptedAsset={DecryptedAsset} StoreList={StoreList} userInfo={userData} users={ParsedUser} baseUrl={baseUrl}/>
                </main>
              </div>
          );

    }
    