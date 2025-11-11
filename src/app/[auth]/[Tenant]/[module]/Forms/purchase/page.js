"use client";
import Nav1 from "@/app/Components/Nav1";
import { FunnelIcon, BackwardIcon, ForwardIcon } from "@heroicons/react/24/outline";
import Footer2 from "@/app/Components/Footer2";
import ExcelDownloadBtn from "@/app/Components/ExcelDownloadBtn";
import BackButton from "@/app/Components/BackBotton";
import Card from "@/app/Components/Card";
import { useState, useMemo } from "react";
import { useParams } from "next/navigation";

export default function Storelayout({ purchaseList, userData, VendorList }) {
  const Params = useParams();
  const [purchaselist] = useState(purchaseList);
  const [statusFilter, setStatusFilter] = useState("");
  const [vendorFilter, setVendorFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [Vendors] = useState(VendorList);
  const itemsPerPage = 12;

  // Helper function moved outside useMemo for stable reference
  const getVendorNameById = (id) => {
    const vendor = Vendors.find((v) => v._id === id);
    return vendor?.Name || "";
  };

  // Memoized filtered purchases
  const filteredPurchases = useMemo(() => {
    const pendingOrders = purchaselist || [];

    return pendingOrders.filter((item) => {
      const vendorName = getVendorNameById(item.Vendor) || "";
      const statusMatch =
        !statusFilter || item.status?.toLowerCase() === statusFilter.toLowerCase();
      const vendorMatch =
        !vendorFilter || vendorName.toLowerCase().includes(vendorFilter.toLowerCase());
      const startMatch =
        !startDate || new Date(item.recievedDate) >= new Date(startDate);
      const endMatch =
        !endDate || new Date(item.recievedDate) <= new Date(endDate);

      return statusMatch && vendorMatch && startMatch && endMatch;
    });
  }, [statusFilter, vendorFilter, startDate, endDate, purchaselist, Vendors]);

  const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);
  const paginatedPurchases = filteredPurchases.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
     <div className="flex flex-col max-h-[100dvh] overflow-hidden">
      <Nav1
        user={userData.user}
        business={userData.business}
        page={`purchase`}
        Module={filteredPurchases}
      />

      <div className="flex flex-1 text-white bt-2 max-h-[100dvh]">
        <aside className="bg-[#1e1e20]/80 backdrop-blur-lg text-white px-4 py-6 transition-all duration-300  max-h-[100dvh] overflow-y-hidden md:block">
          <BackButton />
          <hr className="my-4 border-white/20" />

          {/* Filters Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white/80">Filter Options</h2>

            {/* Status Filter */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-white/70">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className=" px-3 py-2 rounded-md bg-[#2a2a2e] border border-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All</option>
                <option value="Draft">Draft</option>
                <option value="approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="POSTED TO WAREHOUSE">Posted to inventory</option>
              </select>
            </div>

            {/* Vendor Filter */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-white/70">Vendor</label>
              <select
                value={vendorFilter}
                onChange={(e) => {
                  setVendorFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-md bg-[#2a2a2e] border border-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Vendors</option>
                {Vendors.map((vendor) => (
                  <option key={vendor._id} value={vendor.Name}>
                    {vendor.Name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-white/70">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 rounded-md bg-[#2a2a2e] border border-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-white/70">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 rounded-md bg-[#2a2a2e] border border-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Export Button */}
            {userData?.user?.isAdmin && filteredPurchases.length > 0 && (
              <div className="pt-4">
                <ExcelDownloadBtn data={filteredPurchases} page={Params.module} />
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="relative w-full max-h-[83vh] flex-grow overflow-x-hidden shadow-inner backdrop-blur-md bg-[#0e0e11]/5 p-1 rounded-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
            {paginatedPurchases.map((element) => (
              <Card
                key={element._id}
                data={{ ...element, vendorName: getVendorNameById(element.Vendor) }}
                module={`purchase-request`}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="mt-4 flex justify-between items-center px-4">
            <span className="text-sm text-white/60">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm rounded bg-black hover:bg-black disabled:opacity-30"
              >
                <BackwardIcon className="h-4 w-4 text-gray-500" /> prev
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm rounded bg-black hover:bg-black disabled:opacity-30"
              >
                <ForwardIcon className="h-4 w-4 text-gray-500" /> Next
              </button>
            </div>
          </div>
        </main>
      </div>
      <Footer2 />
    </div>
  );
}
