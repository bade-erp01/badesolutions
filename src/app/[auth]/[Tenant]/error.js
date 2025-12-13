"use client";
import { useRouter } from "next/navigation";
import React from "react";

export default function Tenanterror({ error }) {
  const router = useRouter();

  const handleRefresh = () => {
    // router.refresh();
     router.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-red-100">
            <svg 
              className="w-8 h-8 text-red-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            Something went wrong
          </h1>
          <div className="bg-gray-50 rounded p-4 mb-6">
            <p className="text-sm font-mono text-gray-600">
             Sorry, We couldn’t complete your request. Please refresh the page or contact support if it continues.
            </p>
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="w-full bg-black text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
