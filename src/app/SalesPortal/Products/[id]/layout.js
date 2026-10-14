import React from "react";
import { fetchUser } from "../../../../../Functions/whoIsSalesPerson";
import { redirect } from "next/navigation";
import { Encrypt, Dencrypt } from "../../../../../Functions/Functions";
import SingleProductpage from "./page";
import BackButton from "@/app/Components/BackBotton";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const metadata = {
  title: "B.A.D.E ERP Platform",
  description:
    "Configure and manage your stores with B.A.D.E — Nigeria’s leading AI-powered ERP solution for businesses of all sizes. Built for scalability, automation, and real-time insights.",
  keywords: [
    "Store Management",
    "ERP Nigeria",
    "Business Automation",
    "B.A.D.E",
    "AI ERP",
    "Retail Optimization",
    "Inventory Control",
    "Bernard Fidels Ogoh",
    "ERP Abuja",
    "ERP Lagos",
    "ERP Port Harcourt",
    "Nigerian Business Software",
    "SME ERP",
    "Enterprise Resource Planning",
    "AI Business Tools",
    "Affordable ERP Nigeria",
    "Scalable ERP",
    "Digital Transformation",
    "Next-gen ERP",
    "Business Intelligence",
    "Workflow Automation",
    "Store Settings Dashboard",
    "Tenant Management",
    "Multi-store ERP",
  ],
  author: "Business Automated Dynamic Enterprise [B.A.D.E]",
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1, theme-color=#f4a8ff",
  ogTitle: " B.A.D.E ERP Platform",
  ogDescription:
    "Take control of your store operations with B.A.D.E — the smart ERP for Nigerian enterprises.",
  ogImage: "/assets/store-settings-og.png",
  ogUrl: "https://badesolutions.com.ng/storelayout",
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: " B.A.D.E ERP Platform",
  twitterDescription:
    "Manage your stores with ease using B.A.D.E — Nigeria’s AI-powered ERP solution.",
  twitterImage: "/assets/store-settings-og.png",
  applicationName: "B.A.D.E ERP",
  creator: "Bernard Fidels Ogoh",
  favicon: "favicon.ico",
};

export const dynamic = "force-dynamic";

export default async function layout({ params }) {
  const userData = await fetchUser();
  const baseUrl = process.env.EXPRESS_PRIVATE_URL;
  const SessionId = Dencrypt(userData?.SessionId);
  const Params = await params;

  // Redirect if either user OR business is missing
  if (
    !userData?.user ||
    !userData?.business ||
    !SessionId ||
    userData.user.status !== "active" ||
    SessionId !== userData.user.SessionId ||
    !userData.user.isSalesRep
  ) {
    redirect("/SalesPortal/Login");
  }

  let data;

  try {
    const res = await fetch(`${baseUrl}/api/Product/${Params.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
        access: `${Encrypt(userData.user._id)}`,
        sessionKey: `Bearer ${userData.SessionId}`,
      },
    });

    data = await res.json();

    if (!res.ok) {
      return (
        <div className="flex min-h-[70vh] items-center justify-center p-6">
          <Alert variant="destructive" className="max-w-md">
            <AlertTitle>Unable to load product</AlertTitle>
            <AlertDescription>
              Failed to load product data. Please try again later.
            </AlertDescription>
          </Alert>
        </div>
      );
    }
  } catch (err) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-6">
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>Unable to load product</AlertTitle>
          <AlertDescription>
            Failed to load product data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const product = data?.product;

  return (
    <div className="min-h-dvh bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          {/* Left – Product info */}
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-9 w-9 shrink-0 border shadow-sm">
              <AvatarImage
                src={product?.image || product?.Image || "/preview.png"}
                alt={product?.Name}
              />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                {product?.Name?.charAt(0)?.toUpperCase() || "P"}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold tracking-tight text-foreground">
                {product?.Name || "Product"}
              </h1>
              {product?.SKU || product?.barcode ? (
                <p className="truncate text-xs text-muted-foreground">
                  {product.SKU || product.barcode}
                </p>
              ) : null}
            </div>

            {product?.status && (
              <Badge
                variant={
                  product.status === "active" || product.status === "Active"
                    ? "default"
                    : "secondary"
                }
                className="hidden sm:inline-flex capitalize"
              >
                {product.status}
              </Badge>
            )}
          </div>

          {/* Right – Back button */}
          <div className="flex items-center gap-2 shrink-0">
            <BackButton />
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6">
        <SingleProductpage
          userInfo={userData.user}
          businessInfo={userData.business}
          Backdata={product}
        />
      </main>
    </div>
  );
}