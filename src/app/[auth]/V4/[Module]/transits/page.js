"use client";
import Nav1 from "@/app/Components/Nav1";
import Footer2 from "@/app/Components/Footer2";
import BackButton from "@/app/Components/BackBotton";
import Link from "next/link";
import Image from "next/image";
import { UserGroupIcon, FunnelIcon, ArrowPathIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { Encrypt } from "../../../../../../Functions/Functions";
import Notch from "@/app/Components/Notch";

// Shadcn UI Components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function TransferPage({ purchaseList, userData, VendorList, Store, baseUrl }) {
  const Params = useParams();
  const [purchaselist] = useState(purchaseList || []);
  const truncate = (str, length = 20) =>
    str && str.length > length ? str.substring(0, length) + "..." : str;

  const [Vendors] = useState(VendorList || []);
  const [Stores] = useState(Store || []);
  const [statusFilter, setStatusFilter] = useState("");
  const [vendorFilter, setVendorFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 19;

  const getVendorNameById = (id) => {
    const vendor = Vendors.find((v) => v._id === id);
    return vendor?.Name || "";
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

  const filteredPurchases = useMemo(() => {
    const list = purchaselist || [];
    return list.filter((item) => {
      const vendorName = item.to || item.from;
      const statusMatch = !statusFilter || (item.status || "").toLowerCase() === statusFilter.toLowerCase();
      const vendorMatch = !vendorFilter || vendorName.toLowerCase() === vendorFilter.toLowerCase();
      const searchMatch =
        !searchQuery ||
        (item?.reference || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item?.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendorName.toLowerCase().includes(searchQuery.toLowerCase());
      const startMatch = !startDate || new Date(item.recievedDate) >= new Date(startDate);
      const endMatch = !endDate || new Date(item.recievedDate) <= new Date(endDate);

      return statusMatch && vendorMatch && searchMatch && startMatch && endMatch;
    });
  }, [statusFilter, vendorFilter, startDate, endDate, searchQuery, purchaselist, Vendors]);

  const totalPages = Math.max(1, Math.ceil(filteredPurchases.length / itemsPerPage));
  const paginatedPurchases = filteredPurchases.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
        {/* Sidebar Filters */}
        <Notch>
          <BackButton />
          <hr className="border-white/10" />

          {(userData?.user?.allowInternalTransfers || userData?.user?.raiseLpo) && (
            <Link
              href={`${Params.auth}/V4/vendor/vendor`}
              className="flex items-center text-xs gap-3 p-3 rounded-md hover:bg-gray-700 transition"
            >
              <UserGroupIcon aria-hidden="true" className="h-6 w-6 text-gray-100" />
              <span className="text-xs">Vendors Management</span>
            </Link>
          )}

          <br />
          <div className="flex items-center gap-2 mb-4">
            <FunnelIcon className="h-5 w-5 text-white/60" />
            <h2 className="text-lg font-semibold text-white/90">Filters</h2>
            <button
              onClick={clearFilters}
              className="ml-auto flex items-center gap-1 text-sm bg-white/5 hover:bg-white/8 px-3 py-1 rounded"
              title="Clear filters"
            >
              <ArrowPathIcon className="h-4 w-4 text-white/60" />
              Clear
            </button>
          </div>

          {/* Status Filter */}
          <label className="block mb-3">
            <div className="text-sm text-white/70 mb-1">Status</div>
            <div className="flex flex-wrap gap-2">
              {["", "Draft", "Pending", "Converted"].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatusFilter(s);
                    setCurrentPage(1);
                  }}
                  className={`text-sm px-3 py-1 rounded-full border ${
                    statusFilter === s ? "border-indigo-400 bg-indigo-600/30" : "border-white/8"
                  } ${s === "" ? "opacity-80" : ""}`}
                >
                  {s === "" ? "All" : s}
                </button>
              ))}
            </div>
          </label>

          {/* Store Filter */}
          <label className="block mb-3">
            <div className="text-sm text-white/70 mb-1">Store</div>
            <select
              value={vendorFilter}
              onChange={(e) => {
                setVendorFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-md bg-[#0f1113] border border-white/10 text-base sm:text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All stores</option>
              {Stores?.map((v) => (
                <option key={v._id} value={v.WHName}>
                  {v.WHName}
                </option>
              ))}
            </select>
          </label>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <div className="text-sm text-white/70 mb-1 flex items-center gap-1">
                <CalendarDaysIcon className="h-4 w-4 text-white/60" />
                <span>Start</span>
              </div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-md bg-[#0f1113] border border-white/10 text-base sm:text-sm outline-none"
              />
            </div>

            <div>
              <div className="text-sm text-white/70 mb-1 flex items-center gap-1">
                <CalendarDaysIcon className="h-4 w-4 text-white/60 rotate-180" />
                <span>End</span>
              </div>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-md bg-[#0f1113] border border-white/10 text-base sm:text-sm outline-none"
              />
            </div>
          </div>
        </Notch>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Store</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPurchases.length > 0 ? (
                    paginatedPurchases.map((element) => (
                      <TableRow key={element._id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          <Link
                            href={`/${Params.auth}/V4/Transit/Transit/${Encrypt(element._id)}`}
                            className="hover:underline"
                          >
                            {truncate(element.billReferenceNo || element.reference)}
                          </Link>
                        </TableCell>
                        <TableCell>{element.to || element.from || "N/A"}</TableCell>
                        <TableCell>{getVendorNameById(element.vendor) || "Internal"}</TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={`capitalize ${statusColor(element.status)} text-white`}
                          >
                            {element.status || "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {element.recievedDate
                            ? new Date(element.recievedDate).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center">
                        <div className="text-lg font-medium mb-2">No records found</div>
                        <div className="text-sm text-gray-500">Try adjusting your filters</div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pagination */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * itemsPerPage + 1} -{" "}
              {Math.min(currentPage * itemsPerPage, filteredPurchases.length)} of {filteredPurchases.length}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </main>
      </div>
  );
}