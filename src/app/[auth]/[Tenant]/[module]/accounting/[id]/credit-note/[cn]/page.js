import React from 'react'

export default function Page({ data }) {
  return (
    <div className="p-6 w-full bg-white shadow-lg rounded-lg">
      {/* Header */}
      <div className="border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Credit Note Details</h1>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Credit Note ID</label>
            <p className="mt-1 text-gray-800">{data?.CreditId}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">Customer</label>
            <p className="mt-1 text-gray-800">{data?.customer}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Total Amount</label>
            <p className="mt-1 text-gray-800">₦{data?.Total?.toLocaleString()}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Status</label>
            <span className={`inline-block px-3 py-1 mt-1 rounded-full text-sm ${
              data?.status === 'Closed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {data?.status}
            </span>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Date</label>
            <p className="mt-1 text-gray-800">{new Date(data?.Date).toLocaleDateString()}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Raised By</label>
            <p className="mt-1 text-gray-800">{data?.raisedBy}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Approved By</label>
            <p className="mt-1 text-gray-800">{data?.ApprovedBy}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Remarks</label>
            <p className="mt-1 text-gray-800">{data?.reference}</p>
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="mt-8 border-t pt-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Activity Log</h2>
        <div className="space-y-2">
          {data?.ActivityLog?.map((activity, index) => (
            <div key={index} className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
              {activity.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}