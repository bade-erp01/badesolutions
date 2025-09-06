import React from 'react'
import SingleProductpage  from "./page"
import { Dencrypt } from '../../../../../../../Functions/Functions'
import { fetchUser } from '../../../../../../../Functions/useerDataRefresh';
import dbConnect from "../../../../../../../lib/mongoose";
import Products from "../../../../../../../models/Products";
import {WHouse,storeProduct} from "../../../../../../../models/Stores"
import axios from "axios"



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
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1, theme-color=#f4a8ff",
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
  favicon:'favicon.ico'
};


export default async function layout({params}) {
    await dbConnect()
    const userInfo = await fetchUser();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const decoy = await params;
    // Step 1: Get all tenant warehouses
    const stores = await WHouse.findByTenant(userInfo.business.tenantId).lean();

    // Step 2: Decrypt product ID
    const decryptedProductId = Dencrypt(decoy.id);

    // Step 3: Fetch products per warehouse and format output
    const storeProducts = await Promise.all(
      stores.map(async store => {
        const products = await storeProduct.findByTenant(
          userInfo.business.tenantId,
          { productId: decryptedProductId, WHIDS: store._id }
        ).lean();

        return {
          warehouseName: store.WHName,
          products
        };
      })
    );

    // Step 4: Display result

    // // find the store product by id
    // const product = await storeProduct.findById({productId : Dencrypt(decoy.id)});

      const res = await axios.get(
        `${baseUrl}/api/ProductsApi/${Dencrypt(decoy.id)}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userInfo.business.tenantId}`,
          },
        }
      );
    
      const data = await res.data;
    
    return (
    <div>
         <SingleProductpage userInfo={userInfo.user} businessInfo={userInfo.business} Backdata={data.Product} vendor={data.Vend} module={decoy.module} storeProducts={JSON.stringify(storeProducts)}/>
    </div>
   
  )
}
