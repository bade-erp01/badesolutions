import React from "react";
import { fetchUser } from "../../../../../Functions/whoIsSalesPerson";
import { redirect } from "next/navigation";
import { serverApi } from "@/lib/serverApi";
import StockReportPage from "./page";
import AppShell from "../../_ui/AppShell";
import { Alert } from "../../_ui/ui";

export const metadata = {
  title: "Stock report",
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

  let stock = null;
  try {
    const res = await serverApi(`/api/Sales_Portal/stock/position/${id}`, {
      cache: "no-store", // personal, changing data: always fresh (it was cached for 60 s, so new lines showed late)
    });
    if (res.ok) stock = res.data?.newStock || null;
  } catch {
    stock = null;
  }

  if (!stock) {
    return (
      <AppShell userData={userData} title="Stock report" back="/SalesPortal/Reports" tabs={false}>
        <Alert>We couldn&apos;t load this stock report. Check your connection and try again.</Alert>
      </AppShell>
    );
  }

  return <StockReportPage user={userData.user} bill={stock} Business={userData.business} />;
}
