'use client';

import { useEffect, useState } from 'react';
import Link from "next/link"
import {useParams} from "next/navigation"
import {Encrypt} from "../../../Functions/Mics"

export default function VendorCreditnoteTable({ data,vendorsList }) {
  const [creditNotes, setCreditNotes] = useState(data?.VendorMemos || data);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const notesPerPage = 10;
  const Path = useParams()

  const link = (id)=>{
    try{
      if(Path.id === "Vendor-DebitNote"){
        return `/${Path.auth}/${Path.Tenant}/${Path.module}/${Path.module}/Vendor-DebitNote/Vendor-DebitNote/${Encrypt(id)}`
      }else{
        return `/${Path.auth}/${Path.Tenant}/${Path.module}/${Path.module}/Vendor-CreditNote/Vendor-CreditNote/${Encrypt(id)}`
      }
    }catch(err){

    }
  }

  const findVendor = (id)=>{
    try{
      const vendorName = vendorsList.find(vendor =>{
        return vendor._id === id
      })

      return vendorName.Name || "N/A"
    }catch(err){
      return "N/A"
    }
  }

  useEffect(() => {
    setFilteredNotes(creditNotes);
  }, [creditNotes]);

  const totalPages = Math.ceil(filteredNotes.length / notesPerPage);
  const startIndex = (currentPage - 1) * notesPerPage;
  const endIndex = startIndex + notesPerPage;

  

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-3 bg-gray-300">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-black mb-2">{Path.id}</h1>
        <p className="text-gray-600">Manage and track your {Path.id} issued.</p>
      </div>


      {/* Table */}
      <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-gray-900 text-gray-300">
              <tr>
                <th className="px-6 py-4 font-medium">Ref #</th>
                <th className="px-6 py-4 font-medium">Vendor</th>
                <th className="px-6 py-4 font-medium">Accountant</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 text-xs">
              {filteredNotes.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 mb-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-lg">No {Path.id} found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredNotes.slice(startIndex, endIndex).map((note, index) => (
                  <tr key={index} className="hover:bg-gray-700/50 transition-colors duration-200 text-xs">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={link(note?._id)} className='text-blue-300'>
                      {note?.CreditId || note?.DebitId}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{findVendor(note.VendorId)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{note.raisedBy}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      {Number(note.Total).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(note.Date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        note.status === 'Closed' ? 'bg-green-500/20 text-green-400' :
                        note.status === 'Open' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {note.status.charAt(0).toUpperCase() + note.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filteredNotes.length > 0 && (
        <div className="flex justify-between items-center mt-6 bg-gray-800 px-6 py-4 rounded-lg">
          <button
            className="px-4 py-2 bg-gray-700 rounded-md text-gray-300 hover:bg-gray-600 
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">
              Page <span className="font-medium text-white">{currentPage}</span> of{' '}
              <span className="font-medium text-white">{totalPages}</span>
            </span>
          </div>
          <button
            className="px-4 py-2 bg-gray-700 rounded-md text-gray-300 hover:bg-gray-600 
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
