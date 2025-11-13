"use client";
import Nav1 from "@/app/Components/Nav1";
import Footer2 from "@/app/Components/Footer2";
import ExcelDownloadBtn from "@/app/Components/ExcelDownloadBtn";
import BackButton from "@/app/Components/BackBotton";
import Card from "@/app/Components/Card";
import { FunnelIcon, BackwardIcon, ForwardIcon, MagnifyingGlassIcon, XMarkIcon, ArrowPathIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import PurchaseReportModal from "@/app/Components/Reports/PurchaseReport";

export default function Storelayout({ purchaseList, userData, VendorList,Store }) {
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
      const vendorName = getVendorNameById(item.Vendor) || "";
      const statusMatch = !statusFilter || (item.status || "").toLowerCase() === statusFilter.toLowerCase();
      const vendorMatch = !vendorFilter || vendorName.toLowerCase().includes(vendorFilter.toLowerCase());
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
      <Nav1 user={userData.user} business={userData.business} page={`purchase`} Module={filteredPurchases} />

      <div className="flex flex-1 text-white gap-6 p-2">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-80 bg-[#111114]/70 backdrop-blur-lg p-4 shadow-lg sticky top-6 self-start h-fit">
          <BackButton />
          <hr className="my-4 border-white/10" />

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

          {/* Search */}
          {/* <label className="block mb-3">
            <div className="text-sm text-white/70 mb-1">Search</div>
            <div className="relative">
              <input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search vendor, ref, description..."
                className="w-full pl-10 pr-3 py-2 rounded-md bg-[#0f1113] border border-white/10 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-white/50 absolute left-3 top-2.5" />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-2 top-2.5">
                  <XMarkIcon className="h-5 w-5 text-white/60" />
                </button>
              )}
            </div>
          </label> */}

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

          {/* Vendor */}
          <label className="block mb-3">
            <div className="text-sm text-white/70 mb-1">Vendor</div>
            <input
              list="vendors"
              value={vendorFilter}
              onChange={(e) => {
                setVendorFilter(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Type or choose vendor"
              className="w-full px-3 py-2 rounded-md bg-[#0f1113] border border-white/10 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <datalist id="vendors">
              {Vendors.map((v) => (
                <option key={v._id} value={v.Name} />
              ))}
            </datalist>
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

          {/* Export button */}
          {userData?.user?.isAdmin && paginatedPurchases.length > 0 && (
            <div className="pt-2">
              {/* <ExcelDownloadBtn data={paginatedPurchases} page={Params.module} /> */}
              <PurchaseReportModal data={purchaseList} Vendors={Vendors} Stores={Stores}/>
            </div>
          )}

          {/* Summary */}
          <div className="mt-4 pt-4 border-t border-white/5 text-sm">
            <div className="flex justify-between text-white/80">
              <span>Results</span>
              <strong>{filteredPurchases.length}</strong>
            </div>
            <div className="flex justify-between text-white/80 mt-2">
              <span>Showing</span>
              <strong>
                {(paginatedPurchases.length === 0 && filteredPurchases.length > 0) ? `${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(currentPage * itemsPerPage, filteredPurchases.length)}` : `${paginatedPurchases.length}`}
              </strong>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-h-[83dvh] p-3">
        
          {/* Grid of cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {paginatedPurchases.length > 0 ? (
              paginatedPurchases.map((element) => (
                 <Card
                  key={element._id}
                  data={element}
                  module={`purchase-request`}
                  />
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

              {/* Simple page numbers */}
              {/* <div className="hidden sm:flex items-center gap-1 px-2">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded ${page === currentPage ? "bg-indigo-600" : "bg-white/5"}`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div> */}

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
