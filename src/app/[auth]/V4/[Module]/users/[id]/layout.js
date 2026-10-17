import React from "react";
import SingleEmployeeView from "./page";
import { Dencrypt } from "../../../../../../../Functions/Functions";
import { serverApi } from "@/lib/serverApi";
import { fetchUser } from "../../../../../../../Functions/useerDataRefresh";
import CalendarDemo from "@/app/Components/calendar"


export default async function layout({ children, params }) {
  const Params = await params;
  const userInfo = await fetchUser();
  const userReq = await serverApi(`/api/user/${Params.id}`);

  const response = userReq.data || {};

  const data = Dencrypt(response.employee);
  const custList = Dencrypt(response.cust);
  const StoreList = Dencrypt(response.stores);

  // businesses this admin can assign (own + given), from the backend
  const tenantsReq = await serverApi("/api/assignable-tenants");
  const businessData = tenantsReq.ok && Array.isArray(tenantsReq.data) ? tenantsReq.data : [];

  return (
    <div className="flex flex-col min-w-0">
        <main className="flex-1 min-w-0">
              <SingleEmployeeView
                userInfo={userInfo.user}
                businessInfo={userInfo.business}
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
