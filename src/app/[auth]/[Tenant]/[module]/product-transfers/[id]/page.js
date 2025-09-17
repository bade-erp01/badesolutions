import React from 'react';

export default function ProductTransfersPage({ Transfer }) {
  return (
    <div className="bg-white text-gray-800 p-6 font-sans max-w-full mx-auto border border-gray-200 rounded-xl shadow-lg">
      <header className="border-b border-gray-300 pb-4 mb-6">
        <h1 className="text-center text-3xl font-extrabold text-indigo-600">Product Transfer Invoice</h1>
        <p className="text-center text-sm text-gray-500 mt-1">Bill Reference No: <span className="font-medium">{Transfer.billReferenceNo}</span></p>
      </header>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">📦 Transfer Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <p><span className="font-semibold text-gray-600">Status:</span> {Transfer.status}</p>
          <p><span className="font-semibold text-gray-600">Transfer Date:</span> {Transfer.transferedDate}</p>
          <p><span className="font-semibold text-gray-600">CFO Approval:</span> <span className={Transfer.cfoApproval ? 'text-green-600' : 'text-yellow-600'}>{Transfer.cfoApproval ? 'Approved' : 'Pending'}</span></p>
          <p><span className="font-semibold text-gray-600">Store Keeper Approval:</span> <span className={Transfer.storeKeeperApproval ? 'text-green-600' : 'text-yellow-600'}>{Transfer.storeKeeperApproval ? 'Approved' : 'Pending'}</span></p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">🧾 Orders</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-indigo-50 text-indigo-700">
              <tr>
                <th className="text-left px-4 py-3 border">Product</th>
                <th className="text-left px-4 py-3 border">Qty</th>
                <th className="text-left px-4 py-3 border">Transaction</th>
                <th className="text-left px-4 py-3 border">Received</th>
              </tr>
            </thead>
            <tbody>
              {Transfer.orders.map((order, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 border">{order.item?.productName || '—'}</td>
                  <td className="px-4 py-3 border">{order.Qty}</td>
                  <td className="px-4 py-3 border">{order.trns}</td>
                  <td className="px-4 py-3 border">{order.rec}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
