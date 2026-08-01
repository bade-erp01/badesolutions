import React, { Children } from "react";
import SettingsPage from "./page";
import { fetchUser } from "../../../../../Functions/useerDataRefresh";
import { Encrypt, Dencrypt } from "../../../../../Functions/Functions";

export default async function layout({ children }) {
  const userData = await fetchUser();
  const businessInfo = userData.business;
  const baseUrl = process.env.EXPRESS_PRIVATE_URL;

  const req = await Promise.all([
    fetch(`${baseUrl}/api/Users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
        sessionKey: `Bearer ${Encrypt(userData.SessionId)}`,
        access: `${Encrypt(userData.user._id)}`,
      },
    }),
  ]);

  // req is an array of Response objects, so parse them:
  const [userList] = await Promise.all(req.map((r) => r.json()));

  return (<SettingsPage userList={userList} userData={userData} businessInfo={businessInfo} baseUrl={baseUrl}/>);
}
