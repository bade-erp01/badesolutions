import React from 'react'
import SingleEmployeeView  from "./page"
import { Dencrypt,Encrypt } from '../../../../../../../Functions/Functions'
import { fetchUser } from '../../../../../../../Functions/useerDataRefresh';
import Users from "../../../../../../../models/Users"


export default async function layout({children,params}) {
  const Params = await params;
  const userInfo = await fetchUser();
    //  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    //   const res = await fetch(`${baseUrl}/api/EmployeeUpdate?userId=${Dencrypt(await Params?.id)}`, {
    //     method: "GET",
    //     headers: {
    //       "Content-Type": "application/json",
    //       // "Authorization": `Bearer ${ userInfo.business.tenantId}`,
    //       // dbConnect:`Bearer ${userInfo.business.rustyRoof}`,
    //       // access:`${Encrypt(userInfo.user._id)}`
    //     }
    //   })
    const RawEmployee = await Users.findById(Dencrypt(Params?.id)).lean()
    const StringedEmployee = JSON.stringify(RawEmployee)
    const data = JSON.parse(StringedEmployee);

    return (
    <div>
         <SingleEmployeeView userInfo={userInfo.user} businessInfo={userInfo.business} Backdata={data} module={Params?.module}/>
    </div>
   
  )
}
