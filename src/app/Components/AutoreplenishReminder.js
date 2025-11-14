"use client"
import React, { useState } from 'react'
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { Encrypt } from '../../../Functions/Functions';
import{ErrorMessage,SuccessToast,plsWait,} from "../../../Functions/Mics"
 
export default function ReplenishFeature({storeProduct,business,user,baseUrl}) {
    const [isReplenishing] = useState(storeProduct.autoReplenishment)


    const showModal = async () => {
        // Show your modal here using swal, display a form with 2 inputs: Replenish Level and Replenish Quantity
        // On form submit, send a POST request to /api/AutoReplenish with body: { storeProductId, replenishLevel, replenishQuantity }
        // On success, set isReplenishing to true
        let replenishLevel = prompt(`Enter Min stock Level (case quantity) for ${storeProduct.productName}  [MONITOR]:`, `${storeProduct.replenishMin || 0}`);
        let replenishQuantity = prompt(`Enter Replenish Quantity (case quantity) for ${storeProduct.productName} [REPLENISH]:`, `${storeProduct.replenishQty || 0}`);
        if (replenishLevel === '' || replenishQuantity === '') {
            alert('Replenish Level and Quantity cannot be empty.');
            return;
        }

        if (replenishLevel !== null && replenishQuantity !== null) {
            plsWait("")
            await fetch(`${baseUrl}/api/Replenish/${Encrypt(storeProduct._id)}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                dbConnect: `Bearer ${business.rustyRoof}`,
                access: `${Encrypt(user._id)}`,
              },
              body: JSON.stringify({
                replenishLevel,
                replenishQuantity,
                user:`${user.firstName} ${user.lastName}`,
              }),
            })
              .then((response) => {
                if (response.ok) {
                  SuccessToast(response.message || "Auto-replenishment activated successfully");
                  location.reload();
                } else {
                  throw new Error("Failed to activate auto-replenishment");
                }
              })
              .catch((error) => {
                ErrorMessage(error.message);
                location.reload();
              });
        }
    }

    return (
  <span
    onClick={showModal}
    disabled={isReplenishing}
    className={`flex items-center gap-2 px-4 py-2 
    ${isReplenishing ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-red-300 hover:bg-red-600 text-black'} 
    rounded disabled:opacity-50`}
  >
    <CheckCircleIcon className={`h-5 w-5`} />
    {isReplenishing ? 'Monitoring...' : 'Activate Stock level Monitor'}
  </span>
);

}
