import React from "react";
import SettingsPage from "./page";
import { fetchUser } from "../../../../../Functions/useerDataRefresh";
import { serverApi } from "@/lib/serverApi";

export default async function layout({ children }) {
  const userData = await fetchUser();
  const businessInfo = userData.business;
  const baseUrl = process.env.EXPRESS_PRIVATE_URL;

  // Heavy caching – 1 hour (change number as needed)
  const cacheOptions = {
    next: {
      revalidate: 600, // 3600 = 1 hour | 7200 = 2 hours | 86400 = 24 hours
      tags: ["settings-data"],
    },
  };

  // Fetch Users, Customers and Stores in parallel with heavy caching
  const [usersRes, customersRes, storeRes] = await Promise.all([
    serverApi("/api/Users", cacheOptions),
    serverApi("/api/crm", cacheOptions),
    serverApi("/api/Stores", cacheOptions),
  ]);

  const [userList, customerList, storeList] = [
    usersRes.data,
    customersRes.data,
    storeRes.data,
  ];

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