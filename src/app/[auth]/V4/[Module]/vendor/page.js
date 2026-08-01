import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard } from "lucide-react";
import Link from "next/link";

import { fetchUser } from "../../../../../../Functions/useerDataRefresh";
import { Encrypt } from "../../../../../../Functions/Functions";

export const metadata = {
  title: "Business Automated Dynamic Enterprise [B.A.D.E]",
  description:
    "Business Automated Dynamic Enterprise [B.A.D.E] - Automate, Optimize, and Scale Your Business Operations",
  keywords: [
    "Business Automation",
    "Enterprise Solutions",
    "B.A.D.E",
    "AI-powered Business",
    "Workflow Optimization",
    "Process Automation",
  ],
  author: "Business Automated Dynamic Enterprise",
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#f4a8ff",
  ogTitle: "Business Automated Dynamic Enterprise [B.A.D.E] | Next-Level Automation",
  ogDescription:
    "Streamline your business with AI-driven automation, real-time insights, and scalability",
  ogImage: "/assets/bade.png",
  ogUrl: "https://badesolutions.com.ng",
  twitterCard: "/assets/bade.png",
  twitterTitle: "Business Automated Dynamic Enterprise [B.A.D.E]",
  twitterDescription:
    "Automate and optimize your enterprise with cutting-edge business solutions",
  twitterImage: "/assets/bade.png",
};

export default async function Vendorlayout({ params }) {
  const userData = await fetchUser();
  const Module = await params;
  const baseUrl = process.env.EXPRESS_PRIVATE_URL;

  const res = await fetch(`${baseUrl}/api/vendors`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
      access: `${Encrypt(userData.user._id)}`,
      sessionKey: `Bearer ${Encrypt(userData.SessionId)}`,
    },
  });

  const vendorList = await res.json();

  // KPI Calculations
  const totalVendors = vendorList.length;
  const totalPayable = vendorList.reduce((sum, vendor) => {
    return sum + (Number(vendor.Balance) || 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Vendors Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalVendors}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total registered vendors
            </p>
          </CardContent>
        </Card>

        {/* Total Payable Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ₦{totalPayable.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total outstanding balance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Vendors Table */}
      <div className="w-full">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Vendor Name</TableHead>
                <TableHead>Office Address</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendorList.length > 0 ? (
                vendorList.map((vendor, index) => (
                  <TableRow key={vendor._id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">
                      <Link
                        className="text-blue-600 hover:underline"
                        href={`/${Module.auth}/V4/${Module.Module}/${Module.Module}/${Encrypt(
                          vendor._id
                        )}`}
                      >
                        {vendor.Name || "N/A"}
                      </Link>
                    </TableCell>
                    <TableCell>{vendor.Address || "N/A"}</TableCell>
                    <TableCell>{vendor.email || "N/A"}</TableCell>
                    <TableCell>{vendor.vendor_tel || "N/A"}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          (vendor.Balance || 0) < 0
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        ₦{(vendor.Balance || 0).toLocaleString()}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No vendors found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}