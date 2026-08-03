import React from "react";
import SingleEmployeeView from "./page";
import { Dencrypt, Encrypt } from "../../../../../../../Functions/Functions";
import { fetchUser } from "../../../../../../../Functions/useerDataRefresh";
import Businesses from "../../../../../../../models/Business";
import CalendarDemo from "@/app/Components/calendar"


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
          sessionKey: `Bearer ${Encrypt(userInfo.SessionId)}`
        },
        next: {
          revalidate: 120, // 2 minutes
        },
      },
    );

  const response = await userReq.json()

  const data = Dencrypt(response.employee);
  const custList = Dencrypt(response.cust);
  const StoreList = Dencrypt(response.stores);

  // get all business data
  const RawBusiness = await Businesses.find({
    isActive: true,
    isVerified: true,
  }).select("tenantId companyName").lean();
  
  const StringedBusiness = JSON.stringify(RawBusiness);
  const businessData = JSON.parse(StringedBusiness);

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
        <main className="flex-1 ">
              <SingleEmployeeView
                userInfo={userInfo.user}
                businessInfo={userInfo.business}
                SessionId={userInfo.SessionId}
                Backdata={data}
                module={Params?.module}
                businessData={businessData}
                storeList={StoreList}
                custList={custList || []}
              />
        </main>
      </div>
  );
}
