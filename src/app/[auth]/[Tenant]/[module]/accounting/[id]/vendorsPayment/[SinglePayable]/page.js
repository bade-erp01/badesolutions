"use client"

import React from 'react'
import {Dencrypt} from "../../../../../../../../../Functions/Functions"
import Image from "next/image"
import moment from "moment"

export default function Page({ data,userInfo}) {
  const payment = Dencrypt(data)
  
  return (
    <section className="  p-6 md:p-10 bg-white shadow-md rounded-xl animate__animated animate__fadeIn">
          {/* Header Section */}
          <div className="flex flex-col items-center mb-8">
            
              <Image
                src={`https://img.icons8.com/dusk/64/cash-in-hand.png`}
                alt="Payment Image"
                width={90}
                height={90}
                className="rounded-xl object-contain"
              />
            <h2 className="mt-4 text-2xl font-semibold text-gray-800">{payment?.vendor?.Name.toUpperCase() || 'Vendor'}</h2>
            <p className="text-sm text-gray-500">
              <strong>{payment?.billReferenceNo.toUpperCase()}</strong>
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
          {/* {(payment.status === 'posted' && (userInfo?.user?.isAccountant || userInfo?.user?.postPayment)) && (
            <PaymentReceipt business={userInfo.business} payment={payment} cust={payment?.vendor?.Name.toUpperCase()}/>
          )} */}
        </section>
  )
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
