import React from "react";
import SettingsPage from "./page";
import { fetchUser } from "../../../../../Functions/useerDataRefresh";
import { Encrypt } from "../../../../../Functions/Functions";

export default async function layout({ children }) {
  const userData = await fetchUser();
  const businessInfo = userData.business;
  const baseUrl = process.env.EXPRESS_PRIVATE_URL;

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
    sessionKey: `Bearer ${Encrypt(userData.SessionId)}`,
    access: `${Encrypt(userData.user._id)}`,
  };

  // Heavy caching – 1 hour (change number as needed)
  const cacheOptions = {
    next: {
      revalidate: 600, // 3600 = 1 hour | 7200 = 2 hours | 86400 = 24 hours
      tags: ["settings-data"],
    },
  };

  // Fetch Users, Customers and Stores in parallel with heavy caching
  const [usersRes, customersRes, storeRes] = await Promise.all([
    fetch(`${baseUrl}/api/Users`, {
      method: "GET",
      headers,
      ...cacheOptions,
    }),
    fetch(`${baseUrl}/api/crm`, {
      method: "GET",
      headers,
      ...cacheOptions,
    }),
    fetch(`${baseUrl}/api/Stores`, {
      method: "GET",
      headers,
      ...cacheOptions,
    }),
  ]);

  const [userList, customerList, storeList] = await Promise.all([
    usersRes.json(),
    customersRes.json(),
    storeRes.json(),
  ]);

  return (
    <SettingsPage
      userList={userList}
      customerList={customerList}
      storeList={storeList}
      userData={userData}
      businessInfo={businessInfo}
      baseUrl={baseUrl}
    />
  );
}