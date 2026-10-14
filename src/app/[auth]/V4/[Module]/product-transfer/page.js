"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Encrypt } from "../../../../../../Functions/Functions";
import { FunnelIcon, ArrowPathIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import { BackwardIcon, ForwardIcon } from "@heroicons/react/24/outline";

import Notch from "@/app/Components/Notch";
import BackButton from "@/app/Components/BackBotton";
import ProductTransfer from "@/app/Components/ProductTransfer";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function TransferPage({ purchaseList, userData, VendorList, Store, baseUrl }) {
  const Params = useParams();
  const [purchaselist] = useState(purchaseList || []);

  const [Vendors] = useState(VendorList || []);
  const [Stores] = useState(Store || []);

  const [statusFilter, setStatusFilter] = useState("");
  const [vendorFilter, setVendorFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 15;

  const filteredPurchases = useMemo(() => {
    return purchaselist.filter((item) => {
      const vendorName = item.to || item.from || "";
      const statusMatch = !statusFilter || (item.status || "").toLowerCase() === statusFilter.toLowerCase();
      const vendorMatch = !vendorFilter || vendorName.toLowerCase() === vendorFilter.toLowerCase();
      const searchMatch =
        !searchQuery ||
        item.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendorName.toLowerCase().includes(searchQuery.toLowerCase());

      const startMatch = !startDate || new Date(item.recievedDate) >= new Date(startDate);
      const endMatch = !endDate || new Date(item.recievedDate) <= new Date(endDate);

      return statusMatch && vendorMatch && searchMatch && startMatch && endMatch;
    });
  }, [purchaselist, statusFilter, vendorFilter, startDate, endDate, searchQuery]);

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

  const statusColor = (status) => {
    if (!status) return "bg-gray-500";
    const s = status.toLowerCase();
    if (s.includes("draft")) return "bg-yellow-500 text-black";
    if (s.includes("approved")) return "bg-green-500";
    if (s.includes("rejected")) return "bg-red-500";
    if (s.includes("posted") || s.includes("warehouse") || s.includes("inventory")) return "bg-indigo-500";
    return "bg-gray-500";
  };

  const getStore = (id) =>{
    const StoreFind = Stores.find(store =>{
      return store._id === id
    })

    return StoreFind.WHName || "—"
  }

  return (
    <div className="flex">
      {/* Sidebar Filters */}
      <Notch>
        <BackButton />
        <hr className="border-white/10 my-4" />

        {userData?.user?.allowInternalTransfers && (
          <div className="px-4 mb-6">
            <ProductTransfer Store={Stores} userData={userData} baseUrl={baseUrl} />
          </div>
        )}

        <div className="px-4 space-y-6">
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5" />
            <h2 className="text-lg font-semibold ">Filters</h2>
            <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto">
              <ArrowPathIcon className="h-4 w-4 mr-1" /> Clear
            </Button>
          </div>

          {/* Status */}
          <div>
            <p className="text-sm mb-2">Status</p>
            <div className="flex flex-wrap gap-2">
              {["", "Draft", "approved", "Rejected", "POSTED TO WAREHOUSE"].map((s) => (
                <Button
                  key={s}
                  variant={statusFilter === s ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
                >
                  {s === "" ? "All" : s}
                </Button>
              ))}
            </div>
          </div>

          {/* Store */}
          <div>
            <p className="text-sm mb-2">Store</p>
            <Select value={vendorFilter} onValueChange={(v) => { setVendorFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="bg-[#0f1113] border-white/10">
                <SelectValue placeholder="All Stores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Stores</SelectItem>
                {Stores.map((store) => (
                  <SelectItem key={store._id} value={store.WHName}>
                    {store.WHName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-sm mb-1">Start Date</p>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                className="bg-[#0f1113] border-white/10"
              />
            </div>
            <div>
              <p className="text-sm mb-1">End Date</p>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                className="bg-[#0f1113] border-white/10"
              />
            </div>
          </div>
        </div>
      </Notch>

      {/* Main Content - Table */}
      <main className="flex-1 min-w-0">
        <Card>
          <CardHeader>
            <CardTitle>Product Transfers</CardTitle>
            <p className="text-sm text-muted-foreground">
              {filteredPurchases.length} records found
            </p>
          </CardHeader>

          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>From </TableHead>
                    <TableHead> To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPurchases.length > 0 ? (
                    paginatedPurchases.map((item) => (
                      <TableRow key={item._id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                           <Button asChild variant="outline" size="sm">
                            <Link href={`/${Params.auth}/V4/transfer/transfer/${Encrypt(item._id)}`}>
                              {item.billReferenceNo || item.reference || "—"}
                            </Link>
                          </Button>
                        </TableCell>
                        <TableCell>
                          {getStore(item.from) || "—"}
                        </TableCell>
                        <TableCell>
                          {getStore(item.to) || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColor(item.status)}>
                            {item.status || "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {item.recievedDate 
                            ? new Date(item.recievedDate).toLocaleDateString() 
                            : "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        No transfers found. Try adjusting your filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-3 mt-6">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1} -{" "}
                  {Math.min(currentPage * itemsPerPage, filteredPurchases.length)} of{" "}
                  {filteredPurchases.length}
                </p>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <BackwardIcon className="h-4 w-4 mr-2" /> Prev
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next <ForwardIcon className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}