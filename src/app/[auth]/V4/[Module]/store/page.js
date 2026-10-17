import { fetchUser } from "../../../../../../Functions/useerDataRefresh";
import Link from "next/link";
import ExcelDownloadBtn from "@/app/Components/ExcelDownloadBtn";
import { serverApi } from "@/lib/serverApi";

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
import { Store, ShoppingBag, Warehouse } from "lucide-react";
import {
  ChartPieIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  ShoppingCartIcon,
  ClipboardDocumentCheckIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import Notch from "@/app/Components/Notch";

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
  ogTitle:
    "Business Automated Dynamic Enterprise [B.A.D.E] | Next-Level Automation",
  ogDescription:
    "Streamline your business with AI-driven automation, real-time insights, and scalability",
  ogImage: "/assets/bade.png",
  ogUrl: "https://badesolutions.com.ng",
  twitterCard: "/assets/bade.png",
  twitterTitle: "Business Automated Dynamic Enterprise [B.A.D.E]",
  twitterDescription:
    "Automate and optimize your enterprise with cutting-edge business solutions",
  twitterImage: "/assets/bade.png",
  favicon: "/favicon.ico",
};

export default async function storelayout({ children, params }) {
  const moduleList = await params;
  const userData = await fetchUser();
  const res = await serverApi(`/api/Stores`);

  const StoreList = res.data;
  const stores = StoreList || [];

  return (
    <div className="flex flex-col">
      {/* Sidebar */}
      <Notch>
        {userData.user.isAdmin && (
          <Link
            href={`/${moduleList.auth}/V4/Forms/store`}
            className="flex items-center text-xs gap-3 p-3 rounded-md hover:bg-gray-700 transition"
          >
            <PlusCircleIcon className="h-6 w-6" />
            <span className="text-xs">New Store</span>
          </Link>
        )}

        {(userData?.user?.raiseLpo || userData?.user?.editVendor) && (
          <Link
            href={`/${moduleList.auth}/V4/vendor/vendor`}
            className="flex items-center text-xs gap-3 p-3 rounded-md hover:bg-gray-700 transition"
          >
            <UserGroupIcon className="h-6 w-6" />
            <span className="text-xs">Vendors Management</span>
          </Link>
        )}

        {(userData?.user?.raiseLpo || userData?.user?.allowInternalTransfers) && (
          <>
            <Link
              href={`/${moduleList.auth}/V4/transits/transits`}
              className="flex items-center text-xs gap-3 p-3 rounded-md hover:bg-gray-700 transition"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              <span className="text-xs">Goods in Transit</span>
            </Link>

            <Link
              href={`/${moduleList.auth}/V4/purchases/purchases`}
              className="flex items-center text-xs gap-3 p-3 rounded-md hover:bg-gray-700 transition"
            >
              <ShoppingBagIcon className="h-6 w-6" />
              <span className="text-xs">Purchase Order</span>
            </Link>

            <Link
              href={`/${moduleList.auth}/V4/product-transfer/product-transfer`}
              className="flex items-center text-xs gap-3 p-3 rounded-md hover:bg-gray-700 transition"
            >
              <ClipboardDocumentCheckIcon className="h-6 w-6" />
              <span className="text-xs">Product Transfer</span>
            </Link>
          </>
        )}

        {stores.length > 0 && (
          <ExcelDownloadBtn data={stores} page="store" />
        )}
      </Notch>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <UiCard className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center justify-between gap-2">
              Stores Overview
              <Badge variant="secondary">{stores.length} Stores</Badge>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>used as E-commerce?</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.length > 0 ? (
                  stores.map((store) => (
                    <TableRow key={store._id}>
                      <TableCell className="font-medium">
                        <Link href={`/${moduleList.auth}/V4/${moduleList.Module}/${moduleList.Module}/${store._id}`} className="text-indigo-500">
                          {store.WHName || "Unnamed Store"}
                        </Link>
                      </TableCell>
                      <TableCell>{store.InvoiceNo?.toUpperCase() || "—"}</TableCell>
                      <TableCell>{store.Address || "—"}</TableCell>
                      <TableCell>
                        {store.Tel || store.Email || "—"}
                      </TableCell>
                      <TableCell>
                        {store.E_commerce ? (
                          <Store className="h-6 w-6 text-muted-foreground" />
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={store.status === "Active" ? "default" : "secondary"}
                        >
                          {store.status || "Active"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell 
                      colSpan={6} 
                      className="h-24 text-center text-muted-foreground"
                    >
                      No stores found
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