import React from 'react'

export default function SuspenenseFallBack({pagedata}) {
  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[60dvh] p-4 sm:p-8">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500 mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Loading {pagedata}…
        </h3>
        
        <p className="text-sm text-gray-900 dark:text-gray-300 text-center">
          We're securely retrieving your {pagedata} data. This usually takes a few seconds.
        </p>
      </div>
    </div>
  )
}

