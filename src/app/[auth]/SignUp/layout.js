import { pageMetadata } from "@/lib/seo";
import React from 'react'
export const metadata = pageMetadata({
  title: "Sign Up: Create Your B.A.D.E ERP Account",
  description:
    "Create your B.A.D.E ERP business account and start managing accounting, inventory, POS and sales, HR and payroll from one cloud system.",
  // every /{tenant}/SignUp shows this page: they all point to one URL
  path: "/auth/SignUp",
});

export default function layout({children}) {
  return (
    <div>{children}</div>
  )
}
