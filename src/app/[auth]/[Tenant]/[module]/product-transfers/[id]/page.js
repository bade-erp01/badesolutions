import React from 'react';

export default function ProductTransfersPage({ Transfer }) {
  return (
    <div className="bg-white text-gray-800 p-8 font-sans max-w-4xl mx-auto border border-gray-300 rounded-lg shadow-md">
      {/* Invoice Header */}
      <header className="border-b border-gray-300 pb-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-indigo-600">Company Name</h1>
            <p className="text-sm text-gray-500">123 Business Street, City, Country</p>
            <p className="text-sm text-gray-500">Email: info@company.com | Phone: +123 456 7890</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-gray-700">Invoice</h2>
            <p className="text-sm text-gray-500">Date: {new Date().toLocaleDateString()}</p>
            <p className="text-sm text-gray-500">Invoice #: {Transfer.billReferenceNo}</p>
          </div>
        </div>
      </header>

      {/* Transfer Details */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Transfer Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <p><span className="font-semibold text-gray-600">Status:</span> {Transfer.status}</p>
          <p><span className="font-semibold text-gray-600">Transfer Date:</span> {Transfer.transferedDate}</p>
          <p><span className="font-semibold text-gray-600">CFO Approval:</span> <span className={Transfer.cfoApproval ? 'text-green-600' : 'text-yellow-600'}>{Transfer.cfoApproval ? 'Approved' : 'Pending'}</span></p>
          <p><span className="font-semibold text-gray-600">Store Keeper Approval:</span> <span className={Transfer.storeKeeperApproval ? 'text-green-600' : 'text-yellow-600'}>{Transfer.storeKeeperApproval ? 'Approved' : 'Pending'}</span></p>
        </div>
      </section>

      {/* Orders Table */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Order Details</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left px-4 py-3 border">Product</th>
                <th className="text-left px-4 py-3 border">Quantity</th>
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

      {/* Footer */}
      <footer className="border-t border-gray-300 pt-6 mt-8 text-sm text-gray-500">
        <p>Thank you for your business!</p>
        <p className="mt-2">Terms: Payment is due within 30 days. Late payments may be subject to additional fees.</p>
      </footer>
    </div>
  );
}
