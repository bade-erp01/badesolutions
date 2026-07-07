"use client"
import React from 'react'
import {useRouter, useParams} from "next/navigation"
import { plsWait,ErrorMessage,Encrypt,SuccessToast } from '../../../../../../../../../Functions/Mics';
import {Dencrypt} from "../../../../../../../../../Functions/Functions"


export default function Page({ data,userData,baseurl }) {
  const Router = useRouter()
  const Params = useParams()

  const handleApprove = async (action) => {
    if (!confirm(`Are you sure you want to ${action} this debit note?`)) return;
    plsWait('')
    try {
      const response = await fetch(`${baseurl}/api/Debit/Memo/${Params.dn}`,
        {
          method: "PATCH",
          body:JSON.stringify({
            ApprovedBy:`${userData.user.firstName} ${userData.user.lastName}`,
            action:action
          }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
            access: `Bearer ${Encrypt(userData.user._id)}`,
            sessionKey: `Bearer ${Encrypt(userData.SessionId)}`,
            "idempotency-key" : `DN-${action}-${Dencrypt(Params.cn)}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to approve Debit note');
      const request = await response.json()
      SuccessToast(request.message)
      if(action === "Delete"){
        Router.push(`/${Params.auth}/${Params.Tenant}/${Params.module}/${Params.module}/debit-note/debit-note`)
      }else{
        Router.refresh();
      }
    } catch (error) {
      ErrorMessage(error.message);
      Router.refresh();
    }
  };

  return (
    <div className="p-6 w-full bg-white shadow-lg rounded-lg">
      {/* Header */}
      <div className="border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Debit Note Details</h1>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Debit Note ID</label>
            <p className="mt-1 text-gray-800">{data?.DebitId}</p>
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
            <label className="text-sm font-medium text-gray-600">Debit Account </label>
            <p className="mt-1 text-gray-800">{data?.bankID?.bankName}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Status</label>
            <span
              className={`inline-block px-3 py-1 mt-1 rounded-full text-sm ${
                data?.status === 'Closed'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {data?.status}
            </span>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Date</label>
            <p className="mt-1 text-gray-800">
              {new Date(data?.Date).toLocaleDateString()}
            </p>
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

      {/* Action Buttons */}
      <div className="mt-8 flex gap-4">
       {data?.status ==="Closed" && (
         <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          
        >
          Print
        </button>
       )}
        {(data?.status ==="Open" &&  userData.user.creditOfficer) && (
        <button
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={()=>handleApprove("Closed")}
        >
          Approve
        </button>
        )}
        {(data?.status ==="Open" &&  userData.user.creditOfficer) && (
        <button
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={()=>handleApprove("Delete")}
        >
          Delete
        </button>
        )}
        {(data?.status ==="Closed" &&  userData.user.creditOfficer) && (
        <button
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={()=>handleApprove("Reversed")}
        >
          Reverse
        </button>
        )}
      </div>
    </div>
  );
}
