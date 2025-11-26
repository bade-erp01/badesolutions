"use client";
import Nav1 from "@/app/Components/Nav1";
import Footer2 from "@/app/Components/Footer2";
import ProductTransfer from "@/app/Components/ProductTransfer"
import BackButton from "@/app/Components/BackBotton";
import Link from "next/link"
import Image from "next/image"
import { FunnelIcon, BackwardIcon, ForwardIcon, ArrowPathIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import {Encrypt} from "../../../../../../Functions/Functions"

export default function TransferPage({ purchaseList, userData, VendorList,Store,baseUrl }) {
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
    <div className="flex flex-col max-h-[83dvh] overflow-hidden min-h-screen">
      <Nav1 user={userData.user} business={userData.business} page={`Product Transfer`} Module={filteredPurchases} />

      <div className="flex flex-1 text-white bt-2 max-h-[82dvh] overflow-hidden">
        {/* Sidebar Filters */}
       <aside className="w-70 bg-[#1e1e20]/70 backdrop-blur-md text-white px-4 py-6 transition-all duration-300 md:block ">
          <BackButton />
          <hr className=" border-white/10" />
          {userData?.user?.allowInternalTransfers && (
            <div className="pt-2">
              <ProductTransfer Store={Stores} userData={userData} baseUrl={baseUrl}/>
            </div>
          )}
          <br/>
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

          {/* Status */}
          <label className="block mb-3">
            <div className="text-sm text-white/70 mb-1">Status</div>
            <div className="flex flex-wrap gap-2">
              {["", "Draft", "approved", "Rejected", "POSTED TO WAREHOUSE"].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatusFilter(s);
                    setCurrentPage(1);
                  }}
                  className={`text-sm px-3 py-1 rounded-full border ${statusFilter === s ? "border-indigo-400 bg-indigo-600/30" : "border-white/8"} ${
                    s === "" ? "opacity-80" : ""
                  }`}
                >
                  {s === "" ? "All" : s}
                </button>
              ))}
            </div>
          </label>

         
          <label className="block mb-3">
            <div className="text-sm text-white/70 mb-1">Store</div>
            <select
              value={vendorFilter}
              onChange={(e) => {
                setVendorFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-md bg-[#0f1113] border border-white/10 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All stores</option>
              {Stores.map((v) => (
                <option key={v._id} value={v.WHName}>
                  {v.WHName}
                </option>
              ))}
            </select>
          </label>

          {/* Date range */}
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
                className="w-full px-3 py-2 rounded-md bg-[#0f1113] border border-white/10 text-sm outline-none"
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
                className="w-full px-3 py-2 rounded-md bg-[#0f1113] border border-white/10 text-sm outline-none"
              />
            </div>
          </div>

        </aside>

        {/* Main content */}
        <main className="flex-1 min-h-[80dvh] p-3">
        
          {/* Grid of cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {paginatedPurchases.length > 0 ? (
              paginatedPurchases.map((element) => (
                  <Link key={element._id} href={`/${Params.auth}/${Params.Tenant}/${Params.module}/Forms/transfer/${`${Encrypt(element._id)}`}`} title={element.billReferenceNo} className="block w-full h-full text-xs" style={{ textDecoration: "none" }}>
                       <div className="flex flex-row items-center gap-4 bg-white border border-gray-200 rounded-md shadow-sm px-4 py-3 hover:shadow-md transition duration-200 animate__animated animate__fadeInUp min-h-[80px] w-full h-full">
                         <Image
                           src={`/preview.png`}
                           width={60}
                           height={60}
                           alt={"photo"}
                           className="rounded-md object-cover w-16 h-16"
                           quality={100}
                           priority={true}
                         />
                         <div className="flex flex-col justify-center w-full">
                           <p className=" font-semibold text-gray-800 truncate text-xs">{truncate(element.billReferenceNo)}</p>
                           <small className="text-gray-500 mt-1 text-xs">{truncate(element.status)}</small>
                         </div>
                       </div>
                     </Link>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-black">
                <div className="text-lg font-medium mb-2">No purchase requests found</div>
                <div className="text-sm">Try clearing filters or changing the date range.</div>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-black">
              Showing {(filteredPurchases.length === 0) ? 0 : (currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredPurchases.length)} of {filteredPurchases.length}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded bg-black/60 disabled:opacity-40"
              >
                <BackwardIcon className="h-4 w-4 inline" /> Prev
              </button>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded bg-black/60 disabled:opacity-40"
              >
                Next <ForwardIcon className="h-4 w-4 inline" />
              </button>
            </div>
          </div>
        </main>
      </div>
      <Footer2 />
    </div>
  );
}
