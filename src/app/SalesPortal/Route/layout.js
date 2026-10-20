import React from "react";
import { fetchUser } from "../../../../Functions/whoIsSalesPerson";
import { redirect } from "next/navigation";
import { serverApi } from "@/lib/serverApi";
import Page from "./page";

export const metadata = {
  title: "Today's route",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function layout() {
  const userData = await fetchUser();

  // Redirect if either user OR business is missing
  if (
    !userData?.user ||
    !userData?.business ||
    userData.user.status !== "active" ||
    !userData.user.isSalesRep
  ) {
    redirect(userData?.reason === "elsewhere" ? "/SalesPortal/Login?reason=elsewhere" : "/SalesPortal/Login");
  }

  let route = [];
  let error = "";

  try {
    const res = await serverApi(`/api/Sales_Portal/Route/${userData.user._id}`, {
      cache: "no-store", // personal, changing data: always fresh (it was cached for 60 s, so new lines showed late)
    });
    if (res.ok) route = res.data?.todayRoute || [];
    else error = res.error || "Couldn't load today's route. Please try again.";
  } catch (err) {
    error = err.message || "Couldn't load today's route. Please try again.";
  }

  return <Page userInfo={userData} data={route} error={error} />;
}
