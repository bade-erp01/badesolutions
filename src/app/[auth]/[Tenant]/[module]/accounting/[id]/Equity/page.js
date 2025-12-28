"use client";
import Swal from 'sweetalert2';
import React, { useState } from "react";
import {useRouter} from "next/navigation";
import { plsWait,ErrorMessage,SuccessToast, Encrypt } from '../../../../../../../../Functions/Mics';

export default function Page({ data ,EXPRESS_PRIVATE_URL,userData}) {
  const Router = useRouter()
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const payments = data?.journals?.slice(0, 1050) || [];

  const totalPages = Math.ceil(payments.length / itemsPerPage);
  const paginatedPayments = payments?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


    const actionButton = async (action,id) => {
      try {
        const result = await Swal.fire({
          title: 'Do you want to proceed?',
          text: `proceeding with this action will update Equity value.`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
          // Perform PATCH request if user clicks OK
          plsWait("Updating...")
          const response = await fetch(
            `${EXPRESS_PRIVATE_URL}/api/Equity/journal/${Encrypt(id)}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
                access: `${Encrypt(userData.user._id)}`,
              },
              body: JSON.stringify({ status:action }),
            }
          );

          if (!response.ok) {
            throw new Error('Failed to update');
          }

          const data = await response.json();

          // show server message 
          SuccessToast(data.message)
          // refresh page
          Router.refresh()
        }
      } catch (err) {
      //  show error message 
      ErrorMessage(err.message)
      Router.refresh()
      }
    };

  return (
    <div className="min-h-screen shadow-md">
      {/* Header */}
      <div className="mb-6 bg-gray-600 p-3">
        <h1 className="text-2xl font-bold text-gray-100 mb-2">Equity Table</h1>
        <span className="italic text-blue-100 text-xs">
          Equity in business is the net worth of a company—what owners or
          shareholders truly possess after debts are cleared. It’s both a
          measure of financial strength and a foundation for growth..
        </span>
      </div>

      {/* Table */}
      <div className="rounded-lg overflow-hidden p-1 border">
        <div className="overflow-hidden w-full bg-black">
          <table className="w-full table-auto divide-y divide-gray-200 text-xs">
            <thead className="bg-gray-600 sticky top-0 z-10">
              <tr>
                {[ "Desc", "Type","Status","Raised-By", "Date", "Transaction", "Amount",""].map(
                  (header) => (
                    <th
                      key={header}
                      className="px-4 py-3 text-left font-medium  text-white uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="bg-gray-400 divide-y divide-gray-200">
              {paginatedPayments.map((item) => (
                <tr
                  key={item._id}
                  className="hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-4 py-2 truncate" title={item?.description}>
                    {item?.description?.slice(0, 12)}
                  </td>
                  <td className="px-4 py-2 truncate">
                    <span className="px-2 inline-flex text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {item.accountType}
                    </span>
                  </td>
                  <td className="px-4 py-2 truncate">
                    {item?.status}
                  </td>
                  <td className="px-4 py-2 truncate">
                    {item?.raisedBy}
                  </td>
                  <td className="px-4 py-2 truncate">
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 font-medium">
                    {item.debitCredit}
                  </td>
                  <td className="px-4 py-2 font-medium">
                    {item.amount?.$numberDecimal.toLocaleString(
                undefined,
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}
                  </td>
                   <td className="px-4 py-2 font-medium gap-2">
                    {item.status === "Pending" && (
                       <>
                    <span title="Confirm Entry and update balance"  onClick={()=> actionButton('Posted',item._id)} className="px-2 mr-2 inline-flex text-xs font-semibold rounded-full border-amber-50 shadow bg-green-200 text-black cursor-pointer">
                      Post
                    </span>
                     <span title="Delete Entry" onClick={()=> actionButton('delete',item._id)} className="px-2 mr-2 inline-flex text-xs font-semibold rounded-full border-amber-50 shadow bg-red-200 text-black cursor-pointer">
                      Delete
                    </span>
                    </>

                    )}
                    
                    {item.status === "Posted" && (
                      <span title="Cancel entry"  onClick={()=> actionButton('Reversed',item._id)} className="px-2 inline-flex text-xs font-semibold rounded-full border-amber-50 shadow bg-gray-700 text-white cursor-pointer">
                      Cancel
                      </span>
                    )}
                   
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="ml-3 px-4 py-2 border rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:items-center sm:justify-between w-full">
            <p className="text-sm text-gray-700">
              Page <span className="font-medium">{currentPage}</span> of{" "}
              <span className="font-medium">{totalPages}</span>
            </p>
            <div className="flex space-x-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-2 border rounded-md text-sm ${
                    currentPage === i + 1
                      ? "bg-indigo-50 border-indigo-500 text-indigo-600"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
