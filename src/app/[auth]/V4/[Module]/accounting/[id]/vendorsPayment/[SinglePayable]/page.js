"use client"

import React from 'react'
import {Dencrypt,Encrypt} from "../../../../../../../../../Functions/Functions"
import Image from "next/image"
import moment from "moment"
import {SuccessToast,ErrorMessage,plsWait} from "../../../../../../../../../Functions/Mics"
import Swal from "sweetalert2/dist/sweetalert2.js";
import {useRouter} from "next/navigation"


export default function Page({ data,userInfo,baseUrl}) {
  const payment = Dencrypt(data)
  const router = useRouter();
  // delete
const Delete = async () => {

  const result = await Swal.fire({
    title: "Are you sure you want to delete?",
    text: "This action is irreversible",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, Proceed!",
  });

  if (!result.isConfirmed) return;

  try {
    plsWait("deleting...");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const res = await fetch(`${baseUrl}/api/Payable/${Encrypt(payment._id)}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        access: `${Encrypt(userInfo.user._id)}`,
        Authorization: `Bearer ${Encrypt(userInfo.business.tenantId)}`,
        sessionKey: `Bearer ${Encrypt(userData.SessionId)}`
      },
    });

    const data = await res.json();

    if (data.message) {
      SuccessToast(data.message);
      router.back(); // SPA-friendly refresh
    } else {
      throw new Error(data.error || "Unknown error occurred");
    }
  } catch (error) {
    ErrorMessage(error.message);
  }
}

  const paymentAction = async (action) => {
    const result = await Swal.fire({
      title: `Confirm to set Payment status to ${action}?`,
      text: "Proceeding with this action will also reflect on the Bank journal entry and Vendors's Transaction Ledger!",
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
        `${baseUrl}/api/Payable/update/${Encrypt(payment._id)}`,
        {
          method: "PATCH",
          headers: { 
              "Content-Type": "application/json",
               access:`${Encrypt(userInfo.user._id)}`,
               Authorization: `Bearer ${Encrypt(userInfo.business.tenantId)}`,
               sessionKey: `Bearer ${Encrypt(userInfo.SessionId)}`
          },
          body: JSON.stringify({action,user:`${userInfo.user.firstName} ${userInfo.user.lastName}` }),
        }
      );
  
      const data = await res.json();
  
      if (data.message) {
        SuccessToast(data.message);
        location.reload(); // using router.reload() from next/router for SPA
      } else {
        throw new Error(data.error || "Unknown error occurred");
      }
    } catch (error) {
      ErrorMessage(error.message);
    }
  };
  
  return (
    <section className="  p-4 sm:p-6 md:p-10 bg-white shadow-md rounded-xl animate__animated animate__fadeIn">
          {/* Header Section */}
          <div className="flex flex-col items-center mb-8">
            
              <Image
                src={`https://img.icons8.com/dusk/64/cash-in-hand.png`}
                alt="Payment Image"
                width={90}
                height={90}
                className="rounded-xl object-contain"
              />
            <h2 className="mt-4 text-xl sm:text-2xl font-semibold text-gray-800 text-center break-words">{payment?.vendor?.Name?.toUpperCase() || 'Vendor'}</h2>
            <p className="text-sm text-gray-500">
              <strong>{payment?.billReferenceNo?.toUpperCase()}</strong>
            </p>
            <p className="text-sm text-gray-500">
              <strong>Bank:</strong> {payment?.bankAccount?.NAME || 'Unavailable'}
            </p>
          </div>
    
          {/* Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Detail label="Amount" value={payment?.Amount} />
            <Detail label="Registered By" value={payment?.AccountatntId} />
            <Detail label="Date" value={moment(payment?.PaymentDate).format('YYYY-MM-DD')} />
            <Detail label="Trace" value={payment?.status} />
            <Detail label="Status" value={payment?.ledgerStatus} />
          </div>
    
          {/* Admin Actions */}
          {payment.ledgerStatus === 'pending' && userInfo?.user?.isAccountant && (
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button
                type="submit"
                onClick={()=>paymentAction(`posted`)}
                className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-6 rounded-md transition duration-200"
              >
                Confirm Payment Entry
              </button>
              <button
                type="submit"
                onClick={Delete}
                className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-md transition duration-200"
              >
                Delete Payment Entry
              </button>
            </div>
          )}
          {/* reverse payment */}
          {payment.ledgerStatus === 'posted' && userInfo?.user?.isAccountant && (
            <div className='flex flex-col md:flex-row gap-4 justify-center'>
            <button
                type="submit"
                onClick={()=>paymentAction(`Reversed`)}
               className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-6 rounded-md transition duration-200"
              >
               Reverse Payment
              </button>
    
            </div>
          )}
        </section>
  )
}


// Reusable detail component
function Detail({ label, value }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      <p className="text-base text-gray-800 break-words">{value || '—'}</p>
    </div>
  );
}
