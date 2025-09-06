"use client"
import React from 'react';
import Image from 'next/image'; // Make sure this is imported if you're using Next.js
import Swal from 'sweetalert2';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { plsWait ,ErrorMessage,SuccessToast} from '../../../../../../../Functions/Mics';
import {EXPRESS_PRIVATE_URL} from "../../../../../../../Functions/Functions"
import {  PrinterIcon } from "@heroicons/react/24/outline";
import PaymentReceipt from "@/app/Components/PrintReciept"

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
      `${ EXPRESS_PRIVATE_URL}/${userInfo.business.companyName}/payment/revoke/${id}?action=${action}&user=${userInfo.user._id}`,
      {
        method: "PATCH",
        headers: { 
            "Content-Type": "application/json" 
        },
        body: JSON.stringify({ date: moment().format("L") }),
      }
    );

    const data = await res.json();

    if (data.message) {
      SuccessToast(data.message);
      router.refresh(); // using router.reload() from next/router for SPA
    } else {
      throw new Error(data.error || "Unknown error occurred");
    }
  } catch (error) {
    ErrorMessage(error.message);
  }
};

  return (
    <section className=" mx-auto p-6 md:p-10 bg-white shadow-xl rounded-xl animate__animated animate__fadeIn">
      {/* Header Section */}
      <div className="flex flex-col items-center mb-8">
        
          <Image
            src={`https://img.icons8.com/dusk/64/cash-in-hand.png`}
            alt="Payment Image"
            width={90}
            height={90}
            className="rounded-xl object-contain"
          />
        <h2 className="mt-4 text-2xl font-semibold text-gray-800">{cust?.Username.toUpperCase() || 'Customer'}</h2>
        <p className="text-sm text-gray-500">
          <strong>{payment.collectionRef}/{payment?.paymentReferenceNo.toUpperCase()}</strong>
        </p>
        <p className="text-sm text-gray-500">
          <strong>Bank:</strong> {bank?.NAME || 'Unavailable'}
        </p>
      </div>

      {/* Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Detail label="Amount" value={payment?.crAmount} />
        <Detail label="Registered By" value={payment?.Accountant} />
        <Detail label="Date" value={payment?.PaymentDate} />
        <Detail label="Status" value={payment?.status} />
        <Detail label="Gateway" value={payment?.type} />
      </div>

      {/* Admin Actions */}
      {payment.status === 'pending' && userInfo?.user?.isAccountant && (
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <button
            type="submit"
            onClick={()=>paymentAction(`${payment._id}`,`posted`)}
            className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-6 rounded-md transition duration-200"
          >
            Confirm Payment Entry
          </button>
          <button
            type="submit"
            onClick={()=>paymentAction(`${payment._id}`,`Reject`)}
            className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-md transition duration-200"
          >
            Cancel Payment Entry
          </button>
        </div>
      )}
      {/* reverse payment */}
      {payment.status === 'posted' && userInfo?.user?.isAccountant && (
        <div className='flex flex-col md:flex-row gap-4 justify-center'>
        <button
            type="submit"
            onClick={()=>paymentAction(`${payment._id}`,`Reversed`)}
           className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-6 rounded-md transition duration-200"
          >
           Reverse Payment
          </button>

        </div>
      )}
      {(payment.status === 'posted' && (userInfo?.user?.isAccountant || userInfo?.user?.postPayment)) && (
        <PaymentReceipt business={userInfo.business} payment={payment} cust={cust?.Username.toUpperCase()}/>
      )}


       {/* Activity Log */}
        <div className="mt-10">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Activity Log
          </h3>
          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md p-4 bg-gray-50 text-sm text-gray-700 space-y-2">
            {payment.ActivityLog?.map((log, index) => (
              <p key={index}>• {log.logMsg}</p>
            ))}
          </div>
        </div>
    </section>
  );
}

// Reusable detail component
function Detail({ label, value }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      <p className="text-md text-gray-800">{value || '—'}</p>
    </div>
  );
}
