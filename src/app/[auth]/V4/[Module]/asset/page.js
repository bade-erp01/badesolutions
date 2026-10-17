import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { 
  Card as UiCard, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchUser } from "../../../../../../Functions/useerDataRefresh";
import { Separator } from "@/components/ui/separator";
import BackButton from "@/app/Components/BackBotton";
import { notFound } from "next/navigation";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { Dencrypt } from "../../../../../../Functions/Functions";
import { serverApi } from "@/lib/serverApi";
import ExcelDownloadBtn from "@/app/Components/ExcelDownloadBtn";
import Notch from "@/app/Components/Notch";

export const metadata = {
  title: "Business Automated Dynamic Enterprise [B.A.D.E]",
  description: "Automate, Optimize, and Scale Your Business Operations",
  keywords: [
    "Business Automation",
    "Enterprise Solutions",
    "B.A.D.E",
    "AI-powered Business",
    "Workflow Optimization",
    "Process Automation",
    "ERP in Nigeria",
    "Bernard fidels ogoh",
    "ERP in Abuja",
    "ERP in Lagos",
    "ERP in Port Harcourt",
    "Locally built ERP",
    "ERP for SMEs",
    "ERP for Enterprises",
    "ERP for Startups",
    "ERP for Corporates",
    "AI-powered ERP",
    "AI-driven Business Solutions",
    "AI Automation",
    "Affordable ERP",
    "Scalable ERP Solutions",
  ],
  author: "Business Automated Dynamic Enterprise",
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1, theme-color=#f4a8ff",
  ogTitle: "Business Automated Dynamic Enterprise [B.A.D.E]",
  ogDescription: "Streamline your business with AI-driven automation",
  ogImage: "/assets/bade.png",
  ogUrl: "https://badesolutions.com.ng",
  twitterCard: "/assets/bade.png",
  twitterTitle: "Business Automated Dynamic Enterprise [B.A.D.E]",
  twitterDescription: "Automate and optimize your enterprise",
  twitterImage: "/assets/bade.png",
  favicon: "favicon.ico",
};

export default async function AssetLayout({ children, params }) {
  const userData = await fetchUser();
  const moduleList = await params;

  const AssetFinder = userData.user.Apps.find((app) => {
    return app.Name === "Asset Register";
  });

  if (!AssetFinder) {
    return notFound();
  }

  const Assets = await serverApi("/api/Assets", { next: { revalidate: 60 } });

  const assetList = Assets.data || {};
  const assets = Dencrypt(assetList.Asset) || [];

  // KPI Calculations
  const totalAssets = assets.length;
  const totalValue = assets.reduce((sum, asset) => {
    const value = Number(asset.CurrentValue) || 0;
    return sum + value;
  }, 0);

  const depreciatedAssets = assets.filter(
    (asset) => (asset.status || asset.Status || "").toLowerCase() === "depreciated"
  ).length;

  const runningAssets = assets.filter(
    (asset) => (asset.status).toLowerCase() === "running"
  ).length;

  // Helper functions
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "running":
        return <Badge variant="default">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "depreciated":
        return <Badge variant="destructive">Depreciated</Badge>;
      default:
        return <Badge variant="outline">{status || "Unknown"}</Badge>;
    }
  };

  return (
    <div className="flex">
      <Notch>
        <BackButton />
        <hr className="border-gray-100 mb-4" />

        {userData?.user?.AssetManager && (
          <Link
            href={`/${moduleList.auth}/V4/Forms/asset`}
            className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition"
          >
            <PlusCircleIcon className="h-6 w-6" />
            <span className="text-xs">New Asset</span>
          </Link>
        )}

        {assets.length > 0 && userData?.user?.AssetManager && (
          <ExcelDownloadBtn data={assets} page="Asset List" />
        )}
      </Notch>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <UiCard className="shadow-sm">
          <CardHeader>
            <CardTitle>Asset Management</CardTitle>
          </CardHeader>

          {/* KPI Cards */}
          <CardContent className="pb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Total Assets */}
              <UiCard className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-gray-900">
                <CardContent className="p-4 lg:p-6">
                  <p className="text-sm text-muted-foreground">Total Assets</p>
                  <p className="text-2xl lg:text-3xl font-bold mt-2 break-all">{totalAssets}</p>
                </CardContent>
              </UiCard>

              {/* Total Value */}
              <UiCard className="bg-gradient-to-br from-green-50 to-white dark:from-green-950 dark:to-gray-900">
                <CardContent className="p-4 lg:p-6">
                  <p className="text-sm text-muted-foreground">Total Asset Value</p>
                  <p className="text-2xl lg:text-3xl font-bold mt-2 break-all">
                    ₦{totalValue.toLocaleString()}
                  </p>
                </CardContent>
              </UiCard>

              {/* Depreciated Assets */}
              <UiCard className="bg-gradient-to-br from-orange-50 to-white dark:from-orange-950 dark:to-gray-900">
                <CardContent className="p-4 lg:p-6">
                  <p className="text-sm text-muted-foreground">Depreciated Assets</p>
                  <p className="text-2xl lg:text-3xl font-bold mt-2 break-all text-orange-600">{depreciatedAssets}</p>
                </CardContent>
              </UiCard>

              {/* Running / Active Assets */}
              <UiCard className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950 dark:to-gray-900">
                <CardContent className="p-4 lg:p-6">
                  <p className="text-sm text-muted-foreground">Running Assets</p>
                  <p className="text-2xl lg:text-3xl font-bold mt-2 break-all text-emerald-600">{runningAssets}</p>
                </CardContent>
              </UiCard>
            </div>

            <Separator className="mb-6" />

            {/* Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead>Acquisition Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.length > 0 ? (
                  assets.map((asset) => (
                    <TableRow key={asset._id}>
                      <TableCell className="font-medium">
                        <Link href={`/${moduleList.auth}/V4/${moduleList.Module}/${moduleList.Module}/${asset._id}`} className="text-indigo-500">
                         {asset.Name || "Unnamed Asset"}
                        </Link>
                      </TableCell>
                      <TableCell>{asset.AssetCode || "—"}</TableCell>
                      <TableCell className="text-right">
                        {asset.CurrentValue 
                          ? `₦${Number(asset.CurrentValue).toLocaleString()}`
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {asset.PurchsedDate 
                          ? new Date(asset.PurchsedDate).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(asset.status || asset.Status)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No assets to display
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </UiCard>
      </main>
    </div>
  );
}