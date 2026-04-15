"use client";

import { useState, useEffect, Suspense} from "react";
import Swal from "sweetalert2";
import Image from "next/image";
import SuspenenseFallBack from "@/app/Components/SuspenenseFallBack";
import {Encrypt, EXPRESS_PRIVATE_URL} from "../../../../../Functions/Functions";
import{ ErrorMessage, SuccessToast, plsWait,} from "../../../../../Functions/Mics";
import moment from "moment";
import {
  TrashIcon,
  PrinterIcon,
} from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

const ITEMS_PER_PAGE = 10;

export default function DraftInvoicePage({ Business, bill, user }) {
  const [Singlebill] = useState(bill);
  const [filterText, setFilterText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  // Filter inventory data
  const filteredInventory =
    Singlebill?.Inventory.filter((entry) => {
      const name = entry.productId?.Name || "";
      return (
        !name.toLowerCase().startsWith("foc-") &&
        name.toLowerCase().includes(filterText.toLowerCase())
      );
    }) || [];

  // Calculate pagination
  const totalPages = Math.ceil(filteredInventory.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const displayedItems = filteredInventory.slice(startIdx, endIdx);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterText]);

  useEffect(() => {
    Swal.close();
  }, []);

  const userInfo = {
    user: user,
    business: Business,
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleQtyChange = async (lineId, value, toUpdate, billId, storeId) => {
        plsWait("Updating...");
        try {
            const url = `${EXPRESS_PRIVATE_URL}/api/Sales_Portal/stock/Position/Cart/Update/${Encrypt(Singlebill._id)}`;
            const request = await fetch(url, {
                method: 'PUT',
                body: JSON.stringify({ lineId, value, toUpdate, billId, storeId }),
                headers: { 
                  'content-type': 'application/json',
                  Authorization: `Bearer ${Encrypt(userInfo?.user?.tenantId)}`,
                  access: `${Encrypt(userInfo?.user?._id)}`,
                 },
            });

            const response = await request.json();
            response.message ? SuccessToast(response.message) : ErrorMessage(response.error);
        } catch (err) {
            ErrorMessage("Unexpected error occurred");
        }
    };


  async function submitEntry({status}) {
    const result = await Swal.fire({
      title: "Confirm Submission",
      text: "Are you sure you want to submit this entry?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, submit",
      cancelButtonText: "Cancel"
    });

    if (!result.isConfirmed) return;

    try {
      plsWait("Submitting...");
      const url = `${EXPRESS_PRIVATE_URL}/api/Sales_Portal/stock/Position/${Encrypt(Singlebill._id)}`;
      const response = await fetch(url, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(userInfo?.user?.tenantId)}`,
          access: `${Encrypt(userInfo?.user?._id)}`,
        },
        body: JSON.stringify({ status })
      });

      const resultData = await response.json();

      if (response.ok) {
        SuccessToast(resultData.message);
        router.refresh();
      } else {
        ErrorMessage(resultData.error || "Failed to update status");
      }
    } catch (err) {
      ErrorMessage(err.message || "Something went wrong while updating status.");
    }
  }

  return (
    <Suspense fallback={<SuspenenseFallBack pagedata={"Stock Report"} />}>
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 bg-white shadow-2xl text-xs m-6 animate__animated animate__fadeIn invoicecontainer border border-gray-200">
        {/* Status + Created Date */}
        <div className="grid gap-3 sm:flex sm:items-center sm:justify-between mb-8">
          <span
            className={`inline-flex items-center px-4 py-2 rounded-full font-semibold text-sm sm:text-base tracking-wide shadow-sm border ${
              Singlebill?.status === "pending"
                ? "bg-red-50 text-red-600 border-red-200"
                : "bg-indigo-50 text-indigo-700 border-indigo-200"
            }`}
          >
            {Singlebill?.status}
          </span>
          <div className="text-left sm:text-right text-xs sm:text-sm text-gray-900 tracking-tight">
            Created on:{" "}
            <span className="font-medium">
              {moment(Singlebill?.createdAt).format(
                "dddd DD MMMM YYYY [at] hh:mm A"
              )}
            </span>
          </div>
        </div>

        {/* Company + Customer Info */}
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr] border-t border-b py-8 mb-6">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="shrink-0 w-20 h-20 rounded-2xl overflow-hidden border border-gray-200 bg-white">
                <Image
                  src={userInfo.business.companyLogo}
                  width={90}
                  height={90}
                  alt="logo"
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="min-w-0 space-y-1 text-sm text-gray-700">
                <h3 className="textsm font-extrabold text-gray-900 tracking-tight truncate">
                  {Singlebill.CustomerId.Username.toUpperCase()}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            {Singlebill.status === "Pending" && (
              <button onClick={() => submitEntry({ status: "Submited" })} className="w-full md:w-auto px-5 py-2 rounded-md font-semibold text-base shadow border border-green-500 bg-green-600 text-white inline-flex items-center justify-center hover:bg-green-700 transition duration-200 ease-in-out">
                <span>Close card</span>
              </button>
            )}

             {Singlebill.status === "Submitted" && (
              <button onClick={() => submitEntry({ status: "Pending" })} className="w-full md:w-auto px-5 py-2 rounded-md font-semibold text-base shadow border border-indigo-500 bg-indigo-600 text-white inline-flex items-center justify-center hover:bg-indigo-700 transition duration-200 ease-in-out">
                <span>Open card</span>
              </button>
            )}
          </div>

          <button
            title={`Download and Print ${Singlebill.billStatus}`}
            className="w-full md:w-auto px-5 py-2 rounded-md font-semibold text-base inline-flex items-center justify-center bg-gray-800 text-white hover:bg-gray-900 transition duration-200 ease-in-out"
          >
            <PrinterIcon className="h-5 w-5 mr-2" />
            <span className="whitespace-nowrap">Print</span>
          </button>
        </div>

        {/* Filter Input */}
        <div className="mb-6">
          <input
            type="search"
            placeholder="Search products..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Product Table */}
        <div className="rounded-sm border border-gray-200 bg-white mb-8 overflow-x-auto">
          <table className="min-w-[900px] w-full text-center">
            <thead className="bg-gray-50 text-gray-700 uppercase text-[10px] sm:text-xs">
              <tr>
                {["Product", "Case", "PCS", "Batch", "Exp Date"].map(
                  (th, i) => (
                    <th
                      key={i}
                      className="px-4 py-3 font-semibold whitespace-nowrap text-center"
                    >
                      {th}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="text-gray-800">
              {displayedItems.length > 0 ? (
                displayedItems.map((item,index) => (
                  <tr
                    key={item._id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-2 text-indigo-700 text-center text-xs">
                      <a
                        href={`/SalesPortal/Products/${Encrypt(
                          item?.productId?._id
                        )}`}
                        className="hover:underline block truncate"
                      >
                        {item?.productId?.Name}
                      </a>
                    </td>
                    <td className="px-4 py-2 text-center text-xs">
                      {user._id === Singlebill.CreatorId &&
                      Singlebill.status.toLowerCase() === "pending" ? (
                        <input
                          type="number"
                          defaultValue={
                            item.caseAvail?.$numberDecimal
                              ? parseFloat(item.caseAvail.$numberDecimal)
                              : 0
                          }
                          min={0}
                          onBlur={(e) => {
                            let val = parseInt(e.target.value, 10);
                            if (val < 0) val = 0;
                            handleQtyChange(
                              Singlebill._id,
                              val,
                              "caseAvail",
                              item._id,
                            );
                          }}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-center bg-gray-50"
                        />
                      ) : item.caseAvail?.$numberDecimal ? (
                        parseFloat(item.caseAvail.$numberDecimal)
                      ) : (
                        0
                      )}
                    </td>

                    <td className="px-4 py-2 text-center text-xs">
                      {user._id === Singlebill.CreatorId &&
                      Singlebill.status.toLowerCase() === "pending" ? (
                        <input
                          type="number"
                          defaultValue={
                            item.PcsAvil?.$numberDecimal
                              ? parseFloat(item.PcsAvil.$numberDecimal)
                              : 0
                          }
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-center bg-gray-50"
                          onBlur={(e) => {
                            let val = parseInt(e.target.value, 10);
                            if (val < 0) val = 0;
                            handleQtyChange(
                              Singlebill._id,
                              val,
                              "PcsAvil",
                              item._id,
                            );
                          }}
                        />
                      ) : item.PcsAvil?.$numberDecimal ? (
                        parseFloat(item.PcsAvil.$numberDecimal)
                      ) : (
                        0
                      )}
                    </td>

                    <td className="px-4 py-2 text-center text-xs">
                      {user._id === Singlebill.CreatorId &&
                      Singlebill.status?.toLowerCase() === "pending" ? (
                        <input
                          type="text"
                          defaultValue={item.batchNo || ""}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-center bg-gray-50"
                          onBlur={(e) => {

                            handleQtyChange(
                              Singlebill._id,
                              e.target.value,
                              "batchNo",
                              item._id,
                            );
                          }}
                        />
                      ) : (
                        item.batchNo
                      )}
                    </td>

                    <td className="px-4 py-2 text-center text-xs">
                      {user._id === Singlebill.CreatorId &&
                      Singlebill.status?.toLowerCase() === "pending" ? (
                        <input
                          type="date"
                          defaultValue={item.expDate || ""}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-center bg-gray-50"
                          onBlur={(e) => {

                            handleQtyChange(
                              Singlebill._id,
                              e.target.value,
                              "expiryDate",
                              item._id,
                            );
                          }}
                        />
                      ) : (
                        item.expDate
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-4 py-6 text-center text-gray-500 text-sm"
                  >
                    No products found matching "{filterText}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {filteredInventory.length > 0 && (
            <div className="flex justify-center items-center gap-4 py-4">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </Suspense>
  );
}
