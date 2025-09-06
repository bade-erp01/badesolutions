import React from 'react'
import SingleEmployeeView  from "./page"
import { Dencrypt } from '../../../../../../../Functions/Functions'
import { fetchUser } from '../../../../../../../Functions/useerDataRefresh';
import dbConnect from "../../../../../../../lib/mongoose";
import Users from "../../../../../../../models/Users"


export default async function layout({children,params}) {
    await dbConnect()
    const Params = await params;
    const userInfo = await fetchUser();
     const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
      const res = await fetch(`${baseUrl}/api/EmployeeUpdate?userId=${Dencrypt(await Params?.id)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${ userInfo.business.tenantId}`
        }
      })
      const data = await res.json();
    return (
    <div>
         <SingleEmployeeView userInfo={userInfo.user} businessInfo={userInfo.business} Backdata={data} module={Params?.module}/>
    </div>
   
  )
}
