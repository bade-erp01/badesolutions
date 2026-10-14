"use client";
import {
  FunnelIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useState, useMemo } from "react";
import PurchaseReportModal from "@/app/Components/Reports/PurchaseReport";
import Notch from "@/app/Components/Notch";
import { Separator } from "@/components/ui/separator";
import BackButton from "@/app/Components/BackBotton";
import {useRouter, useParams} from "next/navigation"
// Shadcn UI Imports
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {Encrypt} from "../../../../../../Functions/Functions"



export default function Storelayout({
  purchaseList,
  userData,
  VendorList,
  Store,
}) {
  const [purchaselist] = useState(purchaseList || []);
  const [Vendors] = useState(VendorList || []);
  const [Stores] = useState(Store || []);
  const router = useRouter()
  const params = useParams()
  const [statusFilter, setStatusFilter] = useState("");
  const [vendorFilter, setVendorFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 20;

  const getVendorNameById = (id) => {
    const vendor = Vendors.find((v) => v._id === id);
    return vendor?.Name || "Unknown Vendor";
  };

  const getStore = (storeId) => {
    const store = Stores.find((s) => s._id === storeId);
    return store?.WHName || "-";
  };

  const statusColor = (status) => {
    if (!status) return "bg-gray-500 text-white";
    const s = status.toLowerCase();
    if (s.includes("pending")) return "bg-yellow-500 hover:bg-yellow-600 text-black";
    if (s.includes("approved")) return "bg-green-500 hover:bg-green-600 text-white";
    if (s.includes("rejected")) return "bg-red-500 hover:bg-red-600 text-white";
    if (s.includes("posted") || s.includes("warehouse") || s.includes("inventory"))
      return "bg-indigo-500 hover:bg-indigo-600 text-white";
    return "bg-gray-500 hover:bg-gray-600 text-white";
  };

  const getStatusVariant = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes("pending")) return "warning";
    if (s.includes("approved")) return "default";
    if (s.includes("rejected")) return "destructive";
    if (s.includes("posted") || s.includes("warehouse") || s.includes("inventory"))
      return "outline";
    return "outline";
  };

  const filteredPurchases = useMemo(() => {
    const list = purchaselist || [];
    return list.filter((item) => {
      const vendorName = getVendorNameById(item.Vendor) || "";
      const itemStatus = (item.status || "").toLowerCase();
      const filterStatus = statusFilter.toLowerCase();

      const statusMatch =
        !statusFilter ||
        (filterStatus === "pending" && itemStatus.includes("pending")) ||
        (filterStatus === "approved" && itemStatus.includes("approved")) ||
        (filterStatus === "rejected" && itemStatus.includes("rejected")) ||
        (filterStatus.includes("posted") &&
          (itemStatus.includes("posted") ||
            itemStatus.includes("warehouse") ||
            itemStatus.includes("inventory")));

      const vendorMatch =
        !vendorFilter ||
        vendorName.toLowerCase().includes(vendorFilter.toLowerCase());

      const searchMatch =
        !searchQuery ||
        (item?.billReferenceNo || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item?.Remarks || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item?.status || "").toLowerCase().includes(searchQuery.toLowerCase());

      const startMatch = !startDate || new Date(item.recievedDate) >= new Date(startDate);
      const endMatch = !endDate || new Date(item.recievedDate) <= new Date(endDate + "T23:59:59");

      return statusMatch && vendorMatch && searchMatch && startMatch && endMatch;
    });
  }, [statusFilter, vendorFilter, startDate, endDate, searchQuery, purchaselist, Vendors]);

  // ==================== KPI CALCULATIONS ====================
  const totalPurchaseValue = filteredPurchases.filter((entry) => entry.status === "POSTED TO WAREHOUSE" ).reduce((sum, item) => {
    return sum + (Number(item.grandTotal) || Number(item.totalAmount) || 0);
  }, 0);

  const postedToWarehouseCount = filteredPurchases.filter((p) =>
    (p.status || "").toLowerCase().includes("posted") ||
    (p.status || "").toLowerCase().includes("warehouse")
  ).length;

  const approvedCount = filteredPurchases.filter((p) =>
    (p.status || "").toLowerCase().includes("approved")
  ).length;

  // const pendingCount = filteredPurchases.filter((p) => {
  //   (p.status || "").toLowerCase().includes("pending")
  // }).length;

  const totalPages = Math.max(1, Math.ceil(filteredPurchases.length / itemsPerPage));
  const paginatedPurchases = filteredPurchases.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const clearFilters = () => {
    setStatusFilter("");
    setVendorFilter("");
    setStartDate("");
    setEndDate("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col">
      <Notch className="w-full bg-[#1e1e20]/90 backdrop-blur-md px-6 py-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">Purchase</h1>
            <Badge variant="outline" className="text-xs">
              {filteredPurchases.length} total
            </Badge>
          </div>
        </div>
        <Separator />
        <BackButton />

        <div className="flex items-center gap-2 mb-5">
          <FunnelIcon className="h-5 w-5 text-white/60" />
          <h2 className="text-lg font-semibold text-white/90">Filters</h2>
          <Button
            onClick={clearFilters}
            variant="ghost"
            size="sm"
            className="ml-auto text-white/70 hover:text-white hover:bg-white/10"
          >
            <ArrowPathIcon className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <Label className="text-sm mb-1.5 block">Search</Label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-white/50" />
              <Input
                placeholder="Search reference, description, or vendor..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="pl-10 bg-[#0f1113] border-white/10 text-white placeholder:text-white/50"
              />
            </div>
          </div>

          <div>
            <Label className="text-white/70 text-sm mb-1.5 block">Status</Label>
            <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setCurrentPage(1); }}>
              <SelectTrigger className="bg-[#0f1113] border-white/10 text-white">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="POSTED TO WAREHOUSE">Posted / Warehouse</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-white/70 text-sm mb-1.5 block">Vendor</Label>
            <Input
              list="vendors"
              value={vendorFilter}
              onChange={(e) => { setVendorFilter(e.target.value); setCurrentPage(1); }}
              placeholder="Filter by vendor..."
              className="bg-[#0f1113] border-white/10 text-white placeholder:text-white/50"
            />
            <datalist id="vendors">
              {Vendors.map((v) => (
                <option key={v._id} value={v.Name} />
              ))}
            </datalist>
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <Label className="text-white/70 text-sm mb-1.5 flex items-center gap-1.5">
              <CalendarDaysIcon className="h-4 w-4" /> Start Date
            </Label>
            <Input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }} className="bg-[#0f1113] border-white/10 text-white" />
          </div>
          <div>
            <Label className="text-white/70 text-sm mb-1.5 flex items-center gap-1.5">
              <CalendarDaysIcon className="h-4 w-4 rotate-180" /> End Date
            </Label>
            <Input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }} className="bg-[#0f1113] border-white/10 text-white" />
          </div>
        </div>

        {userData?.user?.isAdmin && filteredPurchases.length > 0 && (
          <div className="mt-6">
            <PurchaseReportModal data={purchaseList} Vendors={Vendors} Stores={Stores} />
          </div>
        )}
      </Notch>

      {/* ==================== SHADCN KPI CARDS ==================== */}
      <div className="sm:px-6 -mt-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Posted to Inventory</p>
              <p className="text-3xl sm:text-4xl font-semibold mt-3 text-indigo-600">
                {postedToWarehouseCount}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-3xl sm:text-4xl font-semibold mt-3 text-emerald-600">
                {approvedCount}
              </p>
            </CardContent>
          </Card>

          {/* <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-3xl sm:text-4xl font-semibold mt-3 text-amber-600">
                {pendingCount}
              </p>
            </CardContent>
          </Card> */}

          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Total Purchase Value</p>
              <p className="text-lg font-semibold mt-3 text-emerald-600">
                ₦{totalPurchaseValue.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <div className="rounded-xl border border-white/10 bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-white/10">
                <TableHead className="font-semibold">Reference</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Vendor</TableHead>
                <TableHead className="font-semibold">Store</TableHead>
                <TableHead className="max-w-md font-semibold">Remark</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="w-28 text-right font-semibold">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPurchases.length > 0 ? (
                paginatedPurchases.map((element) => {
                  const vendorName = getVendorNameById(element.Vendor);
                  return (
                    <TableRow key={element._id} className="hover:bg-white/5 border-b border-white/10">
                      <TableCell className="font-medium">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/${params.auth}/V4/purchase/purchase/${Encrypt(element._id)}`)}>
                          {element.billReferenceNo || "-"}
                        </Button>
                        </TableCell>
                      <TableCell>
                        {element.recievedDate
                          ? new Date(element.recievedDate).toLocaleDateString("en-GB", {
                              day: "2-digit", month: "short", year: "numeric",
                            })
                          : "-"}
                      </TableCell>
                      <TableCell>{vendorName}</TableCell>
                      <TableCell>{getStore(element.WHID)}</TableCell>
                      <TableCell className="max-w-md truncate">{element.Remarks || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(element.status)} className={`${statusColor(element.status)} font-medium border-none`}>
                          {element.status || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {element.grandTotal}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center">
                    <div className="text-2xl font-medium text-white/70 mb-2">No results found</div>
                    <p className="text-white/50">Try adjusting your filters or search terms</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {filteredPurchases.length > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
            <div className="text-white/60">
              Showing <span className="font-medium text-white">{(currentPage - 1) * itemsPerPage + 1}</span> -{" "}
              <span className="font-medium text-white">
                {Math.min(currentPage * itemsPerPage, filteredPurchases.length)}
              </span>{" "}
              of <span className="font-medium text-white">{filteredPurchases.length}</span>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                Previous
              </Button>
              <div className="px-4 py-2 bg-white/5 rounded-md text-white/80 font-medium min-w-[60px] text-center">
                {currentPage} / {totalPages}
              </div>
              <Button variant="outline" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                Next
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}