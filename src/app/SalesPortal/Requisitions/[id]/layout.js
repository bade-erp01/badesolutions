import React from "react";
import { fetchUser } from "../../../../../Functions/whoIsSalesPerson";
import { redirect } from "next/navigation";
import { serverApi } from "@/lib/serverApi";
import RequisitionPage from "./page";
import AppShell from "../../_ui/AppShell";
import { Alert } from "../../_ui/ui";

export const metadata = {
  title: "Requisition",
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

  let data = null;
  let error = "";
  try {
    const res = await serverApi(`/api/Invoice/${id}`, {
      cache: "no-store", // personal, changing data: always fresh (it was cached for 60 s, so new lines showed late)
    });
    data = res.data;
    if (!res.ok) error = data?.error || "Failed to load the requisition.";
  } catch (err) {
    error = err.message || "Failed to load the requisition.";
  }

  if (error || !data?.Inv) {
    return (
      <AppShell userData={userData} title="Requisition" back="/SalesPortal/Requisitions" tabs={false}>
        <Alert>{error || "This requisition was not found."}</Alert>
      </AppShell>
    );
  }

  return (
    <RequisitionPage
      user={userData.user}
      bill={data.Inv}
      products={data.products || []}
      Business={userData.business}
    />
  );
}
