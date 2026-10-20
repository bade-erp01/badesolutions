import React from "react";
import { fetchUser } from "../../../../../Functions/whoIsSalesPerson";
import { redirect } from "next/navigation";
import { serverApi } from "@/lib/serverApi";
import CustomerPage from "./page";
import AppShell from "../../_ui/AppShell";
import { Alert } from "../../_ui/ui";

export const metadata = {
  title: "Customer",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function layout({ params }) {
  const userData = await fetchUser();
  const { id } = await params;

  // Redirect if either user OR business is missing
  if (
    !userData?.user ||
    !userData?.business ||
    userData.user.status !== "active" ||
    !userData.user.isSalesRep
  ) {
    redirect(userData?.reason === "elsewhere" ? "/SalesPortal/Login?reason=elsewhere" : "/SalesPortal/Login");
  }

  let data;
  try {
    const res = await serverApi(`/api/crm/${id}`, {
      cache: "no-store", // personal, changing data: always fresh (it was cached for 60 s, so new lines showed late)
    });
    if (res.ok) data = res.data;
  } catch {
    data = null;
  }

  if (!data?.result) {
    return (
      <AppShell userData={userData} title="Customer" back="/SalesPortal/Customers" tabs={false}>
        <Alert>We couldn&apos;t load this customer. Check your connection and try again.</Alert>
      </AppShell>
    );
  }

  return <CustomerPage userInfo={userData} data={data} cust={data.result} />;
}
