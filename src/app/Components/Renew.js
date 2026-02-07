"use client";

import React, {useState} from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {useRouter} from "next/navigation"
import {Encrypt,Dencrypt} from "../../../Functions/Functions"
import { ErrorMessage, plsWait } from "../../../Functions/Mics";

const RenewButton = ({id ,baseUrl,User}) => {
  const [user] = useState(Dencrypt(User))
  const MySwal = withReactContent(Swal);
  const router = useRouter();
  const redirectUrl = `${baseUrl}/api/Renew/Subscription/${id}`;

  const handleRenewClick = () => {
    MySwal.fire({
      title: <strong>Proceed to Payment</strong>,
      html: (
        <div className="text-sm text-gray-700">
          <p>You&apos;re about to renew your subscription and unlock premium features.</p>
          <p className="mt-2 font-medium text-indigo-600">Continue to secure payment?</p>
        </div>
      ),
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Yes, Proceed",
      cancelButtonText: "Cancel",
      buttonsStyling: false,
      customClass: {
        popup: "rounded-xl shadow-lg",
        confirmButton:
          "bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition-all font-semibold",
        cancelButton:
          "bg-gray-200 text-gray-800 px-6 py-2 rounded-full hover:bg-gray-300 transition-all font-medium",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        plsWait("Initiating secured Payment")
        const InitiatePayment = await fetch(redirectUrl,{
          method:"POST",
          body:JSON.stringify({}),
          headers:{
            Authorization:`Bearer ${id}`,
            access:Encrypt(user._id),
          }
        });

        const response = await InitiatePayment.json()
        if (response.data){
           router.push(response.data);
        }else{
          ErrorMessage(response.error)
        }
       
      }
    });
  };

  return (
    <span
      onClick={handleRenewClick}
      className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3 font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105 hover:from-indigo-600 hover:to-purple-700"
    >
      <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></span>
      Renew Subscription
    </span>
  );
};

export default RenewButton;
