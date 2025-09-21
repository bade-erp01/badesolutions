import Nav1 from "@/app/Components/Nav1";
import { fetchUser } from "../../../../../../../Functions/useerDataRefresh";
import Footer2 from "@/app/Components/Footer2";
import {Encrypt,Dencrypt} from "../../../../../../../Functions/Functions"
// Removed unused import BackButton
import DraftPurchasePage from './page'
import PurchaseOrder from "../../../../../../../models/purchaseOrders";
import { WHouse, storeProduct} from "../../../../../../../models/Stores";
import Vendor from "../../../../../../../models/Vendors";
import { notFound } from "next/navigation"; // Import the notFound function



export const metadata = {
  title: "Business Automated Dynamic Enterprise [B.A.D.E]",
  description: "Business Automated Dynamic Enterprise [B.A.D.E] - Automate, Optimize, and Scale Your Business Operations",
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
    "Scalable ERP Solutions"
  ],
  author: "Business Automated Dynamic Enterprise",
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1, theme-color=#f4a8ff",
  ogTitle: "Business Automated Dynamic Enterprise [B.A.D.E] | Next-Level Automation",
  ogDescription: "Streamline your business with AI-driven automation, real-time insights, and scalability",
  ogImage: "/assets/bade.png",
  ogUrl: "https://badesolutions.com.ng",
  twitterCard: "/assets/bade.png",
  twitterTitle: "Business Automated Dynamic Enterprise [B.A.D.E]",
  twitterDescription: "Automate and optimize your enterprise with cutting-edge business solutions",
  twitterImage: "/assets/bade.png",
  favicon:'/favicon.ico'
};

export default async function storelayout({ params }) { 
  const moduleList = await params;
  const userData = await fetchUser();
const items = await PurchaseOrder.findById(Dencrypt(moduleList.id)).lean();
// if not found show 404 page
if (!items) {
  return notFound(); // Correctly invoke the notFound function
}

 const StoreLists = await WHouse.findById(items.WHID).lean();
 const StoreListsStr = JSON.stringify(StoreLists);
 const StoreListsObj = JSON.parse(StoreListsStr);

 const VendorList = await Vendor.findById(items.Vendor).lean();
  const VendorListStr = JSON.stringify(VendorList);
  const VendorListObj = JSON.parse(VendorListStr);

   const storeProductList = await storeProduct.findByTenant(userData.business.tenantId,{ WHIDS: StoreLists._id,
          isActivated:true,
          isAservice: false,
          Vendor:VendorList._id}).lean();
  const storeProductStr = JSON.stringify(storeProductList);
  const storeProductPar = JSON.parse(storeProductStr);

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Nav1
        user={userData.user}
        business={userData.business}
        page={items.billReferenceNo}
      />

      <div>
        <DraftPurchasePage  user={userData.user} customer={VendorListObj} bill={items} products={storeProductPar} Business={userData.business} Whouse={StoreListsObj} />
      </div>
      <Footer2 />
    </div>
  );
}
