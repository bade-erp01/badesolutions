import { pageMetadata } from "@/lib/seo";
import React from 'react'
export const metadata = pageMetadata({
  title: "Pricing: ERP Plans for Nigerian Businesses",
  description:
    "B.A.D.E ERP pricing in naira. Compare plans for accounting, inventory, POS, HR and payroll, and CRM, and start running your business from one cloud system.",
  path: "/Pricing",
  keywords: ["ERP pricing Nigeria", "ERP software price in Nigeria", "inventory software price Nigeria"],
});

export default function layout({children}) {
  return (
    <div>{children}</div>
  )
}
