"use client"
import React from 'react';
import Image from 'next/image';
import Swal from 'sweetalert2';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { plsWait, ErrorMessage, SuccessToast } from '../../../../../../../Functions/Mics';
import { EXPRESS_PRIVATE_URL, Encrypt } from "../../../../../../../Functions/Functions"

export default function SinglePaymentPage({ userInfo, payment, cust, bank }) {
  const router = useRouter()

  const paymentAction = async (id, action) => {
    const result = await Swal.fire({
      title: `Confirm to set Payment status to ${action}?`,
      text: "Proceeding with this action will also reflect on the journal entry in the customer's Transaction Ledger!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Proceed!",
    });

    if (!result.isConfirmed) return;

    try {
      plsWait('Processing...')
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const res = await fetch(
        `${EXPRESS_PRIVATE_URL}/api/payment/revoke/${Encrypt(id)}?action=${action}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
             Authorization: `Bearer ${Encrypt(userInfo.business.tenantId)}`,
             access: `${Encrypt(userInfo.user._id)}`,
            "idempotency-key" : `payment-${action}-${id}`
          },
          body: JSON.stringify({ date: moment().format("L") }),
        }
      );

      const data = await res.json();

      if (data.message) {
        SuccessToast(data.message);
        router.refresh();
      } else {
        throw new Error(data.error || "Unknown error occurred");
      }
    } catch (error) {
      ErrorMessage(error.message);
    }
  };

  const statusColors = {
    pending: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    posted: 'bg-green-50 border-green-200 text-green-800',
    Reversed: 'bg-red-50 border-red-200 text-red-800',
    Reject: 'bg-gray-50 border-gray-200 text-gray-800'
  };

  const getStatusBadge = (status) => {
    const colors = statusColors[status] || 'bg-gray-100 border-gray-300 text-gray-700';
    return `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${colors}`;
  };

  return (
    <section className="min-h-screen text-xs">
      <div className=" mx-auto bg-gray-50 border border-gray-200 shadow-sm">
        {/* Header Card */}
        <div className="bg-white overflow-hidden mb-4 border border-gray-100">
          <div className="bg-linear-to-r from-gray-800 to-gray-700  md:p-8 flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-4 mb-6 md:mb-0 w-full md:w-auto">
              <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20">
                <Image
                  src={payment.image || `https://img.icons8.com/hands/100/card-in-use.png`}
                  alt="Payment"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div className="text-white flex-1">
                <h1 className="text-2xl font-bold mb-1">{cust?.Username.toUpperCase() || 'Customer'}</h1>
                <p className="text-gray-300 text-sm italic">Payment Created on: {moment(payment.createdAt).format("dddd DD MMMM YYYY [at] hh:mm A")}</p>
              </div>
            </div>
            <div className={`${getStatusBadge(payment.status)} shadow-md`}>
              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
            </div>
          </div>

          {/* Reference Info */}
          <div className="px-6 md:px-8 py-6 p-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Collection Reference</p>
                <p className="text-base font-mono font-bold text-gray-900">{payment.collectionRef}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Payment Reference</p>
                <p className="text-base font-mono font-bold text-gray-900">{payment?.paymentReferenceNo.toUpperCase()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Bank</p>
                <p className="text-base font-bold text-gray-900">{bank?.NAME || '—'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2 p-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Amount</label>
              <input type="text" value={payment?.crAmount || payment?.drAmount } disabled readOnly className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-semibold" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Payment Date</label>
              <input type="text" value={payment?.PaymentDate || ''} disabled readOnly className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-semibold" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Registered By</label>
              <input type="text" value={payment?.Accountant || ''} disabled readOnly className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-semibold" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Payment Gateway</label>
              <input type="text" value={payment?.type || ''} disabled readOnly className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-semibold" />
            </div>
          </div>

          {/* Actions Section */}
        <div className="space-y-4 p-3">
          {payment.status === 'pending' && userInfo?.user?.isAccountant && (
            <div className="bg-linear-to-r from-yellow-50 to-amber-50 rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
              <p className="text-sm font-semibold text-yellow-900 mb-4 flex items-center gap-2">
                <span className="text-lg">⚠️</span> Pending Approval
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => paymentAction(`${payment._id}`, `posted`)}
                  className="flex-1 bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-4 text-sm rounded-lg transition duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <span>✓</span> Confirm Payment Entry
                </button>
                <button
                  onClick={() => paymentAction(`${payment._id}`, `Reject`)}
                  className="flex-1 bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-4 text-sm rounded-lg transition duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <span>✕</span> Cancel Entry
                </button>
              </div>
            </div>
          )}

          {payment.status === 'posted' && userInfo?.user?.isAccountant && (
            <div className=" p-6 border-l-4 border-orange-500">
              <p className="text-sm font-semibold text-orange-900 mb-4 flex items-center gap-2">
                <span className="text-lg">🔄</span> Reverse Payment
              </p>
              <button
                onClick={() => paymentAction(`${payment._id}`, `Reversed`)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 text-sm rounded-lg transition duration-200 shadow-md hover:shadow-lg"
              >
                Reverse Payment Entry
              </button>
            </div>
          )}

          <p className="text-gray-600 text-sm italic">Last edited on: {moment(payment.updatedAt).format("dddd DD MMMM YYYY [at] hh:mm A")}</p>
        </div>
      </div>
    </section>
  );
}

// Enhanced Detail Card Component
function DetailCard({ label, value, highlight = false }) {
  return (
    <div className="">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{label}</label>
      <p className={`text-lg font-bold ${highlight ? 'text-blue-600' : 'text-gray-900'}`}>
        {value || '—'}
      </p>
    </div>
  );
}
