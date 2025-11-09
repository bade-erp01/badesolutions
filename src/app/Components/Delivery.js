"use client";
import Swal from 'sweetalert2'
// import {useRouter} from "next/navigation"
import { totalInWords,EXPRESS_PRIVATE_URL ,Dencrypt} from "../../../Functions/Functions";
import { ErrorMessage, SuccessToast, plsWait } from "../../../Functions/Mics";

export const showDeliveryModal = (id,user,business) => {
    // const router = useRouter()
  Swal.fire({
    title: `
      <h2 class="text-3xl font-bold text-blue-700 mb-4">
        🚚 Delivery Details
      </h2>
    `,
    html: `
      <div class="space-y-5 text-left text-gray-800 text-sm">
        <div>
          <label class="block font-medium mb-1">Delivery Date</label>
          <input type="date" id="deliveryDate" class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400">
        </div>
        <div>
          <label class="block font-medium mb-1">Driver Name</label>
          <input type="text" id="driverName" class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400">
        </div>
        <div>
          <label class="block font-medium mb-1">Driver Number</label>
          <input type="text" id="driverNumber" class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400">
        </div>
        <div>
          <label class="block font-medium mb-1">Delivery Fee</label>
          <input type="number" id="deliveryFee" class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400">
        </div>
        <div>
          <label class="block font-medium mb-1">Dispatcher Plate Number</label>
          <input type="text" id="plateNumber" class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400">
        </div>
        <div>
          <label class="block font-medium mb-1">Delivery Remarks</label>
          <textarea id="deliveryRemarks" class="w-full px-4 py-2 border rounded-md resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-400"></textarea>
        </div>
      </div>
    `,
    confirmButtonText: `
      <span class="text-white text-sm font-semibold">📦 Generate WayBill</span>
    `,
    customClass: {
      popup: 'rounded-xl shadow-lg p-6',
      confirmButton: 'bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-md focus:outline-none'
    },
    width: '640px',
    showCloseButton: true,
    focusConfirm: false,
    preConfirm: () => {
      return {
        deliveryDate: document.getElementById('deliveryDate').value,
        driverName: document.getElementById('driverName').value,
        driverNumber: document.getElementById('driverNumber').value,
        deliveryFee: document.getElementById('deliveryFee').value,
        plateNumber: document.getElementById('plateNumber').value,
        deliveryRemarks: document.getElementById('deliveryRemarks').value
      }
    }
  }).then((result) => {
    if (result.isConfirmed) {
        plsWait("Generating WayBill...");
      const deliveryDetails = result.value;
        if (!deliveryDetails.deliveryDate || !deliveryDetails.driverName || !deliveryDetails.driverNumber || !deliveryDetails.deliveryFee || !deliveryDetails.plateNumber) {
            ErrorMessage("Please fill in all required fields.");
            return;
        }
        // Prepare the data to send to the backend
        const deliveryData = {
            DELIVERYDATE: deliveryDetails.deliveryDate,
            DriverName: deliveryDetails.driverName,
            DriverNumber: deliveryDetails.driverNumber,
            shippingFee: parseFloat(deliveryDetails.deliveryFee),
            vehicleNumber: deliveryDetails.plateNumber,
            DeliveryComment: deliveryDetails.deliveryRemarks,
            billId: id,
            userId: user._id,
            WayBillNo:`WB${Math.floor(Math.random()*12345)}${deliveryDetails.plateNumber.substring(0,3)}`
        };

      // Handle backend or navigation here
      const url = `${EXPRESS_PRIVATE_URL}/api/delivery/${id}/${user.firstName}`

        fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                dbConnect:`Bearer ${business.rustyRoof}`,
            },
            body: JSON.stringify(deliveryData)
        }).then(response => {
            if (response.ok) {
                SuccessToast("WayBill generated successfully!");
                window.location.reload(); // A quick workaround to force refresh
            } else {
                ErrorMessage("Failed to generate WayBill.");
            }
        }).catch(error => {
            ErrorMessage("An error occurred while generating WayBill.");
        });
    }
  })
}