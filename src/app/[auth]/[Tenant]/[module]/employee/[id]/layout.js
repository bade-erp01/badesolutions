import React from "react";
import SingleEmployeeView from "./page";
import { Dencrypt, Encrypt } from "../../../../../../../Functions/Functions";
import { fetchUser } from "../../../../../../../Functions/useerDataRefresh";
import Businesses from "../../../../../../../models/Business";
import Nav1 from "@/app/Components/Nav1";
import Footer2 from "@/app/Components/Footer2";
import BackButton from "@/app/Components/BackBotton";

export default async function layout({ children, params }) {
  const Params = await params;
  const userInfo = await fetchUser();
  const baseUrl = process.env.EXPRESS_PRIVATE_URL;

  const userReq = await fetch(
      `${baseUrl}/api/user/${Params.id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(userInfo.business.tenantId)}`,
          access: `${Encrypt(userInfo.user._id)}`,
        },
      },
    );

  const response = await userReq.json()

  const data = Dencrypt(response.employee);

  // get all business data
  const RawBusiness = await Businesses.find({
    isActive: true,
    isVerified: true,
  }).select("tenantId companyName").lean();
  
  const StringedBusiness = JSON.stringify(RawBusiness);
  const businessData = JSON.parse(StringedBusiness);

  // fetch store 
  const res = await fetch(`${baseUrl}/api/Stores`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userInfo.business.tenantId}`,
      dbConnect: `Bearer ${userInfo.business.rustyRoof}`,
    },
    next: {
      revalidate: 120, // 2 minutes
    },
  });


  const StoreList = await res.json();

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Nav1
        user={userInfo.user}
        business={userInfo.business}
        page={`${data?.firstName || "Unknown"} ${data?.lastName || ""}`}
      />
      <div className="flex flex-1 text-white bt-2">
        {/* Sidebar (collapsible on mobile) */}
        <aside
          className="w-70 bg-[#1e1e20]/70 backdrop-blur-md text-white px-4 py-6 transition-all duration-300 max-h-[83dvh] md:block"
          style={{ overflowY: "auto" }}
        >
          <BackButton />
          <hr />
          <nav className="space-y-4  max-h-[83dvh] overflow-y-hidden ">
           
          </nav>
        </aside>{" "}
        {/* Main Content Area */}
        <main className="flex-1 ">
          <section className="w-full max-w-screen-xl mx-auto flex flex-col gap-6 rounded-lg  relative z-10 max-h-[82dvh] overflow-y-auto">
            
              <SingleEmployeeView
                userInfo={userInfo.user}
                businessInfo={userInfo.business}
                Backdata={data}
                module={Params?.module}
                businessData={businessData}
                storeList={StoreList || []}
              />
          </section>
        </main>
      </div>
      <Footer2 />
    </div>
  );
}
