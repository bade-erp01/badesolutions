import React from "react";
import { fetchUser } from "../../../../../Functions/whoIsSalesPerson";
import { redirect } from "next/navigation";
import { serverApi } from "@/lib/serverApi";
import ProductPage from "./page";
import AppShell from "../../_ui/AppShell";
import { Alert } from "../../_ui/ui";

export const metadata = {
  title: "Product",
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

  let product = null;
  try {
    const res = await serverApi(`/api/Product/${id}`);
    if (res.ok) product = res.data?.product || null;
  } catch {
    product = null;
  }

  if (!product) {
    return (
      <AppShell userData={userData} title="Product" back="/SalesPortal/Products" tabs={false}>
        <Alert>We couldn&apos;t load this product. Check your connection and try again.</Alert>
      </AppShell>
    );
  }

  return <ProductPage userInfo={userData.user} businessInfo={userData.business} Backdata={product} />;
}
