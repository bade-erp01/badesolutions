"use client";
import Swal from 'sweetalert2'
import { totalInWords, EXPRESS_PRIVATE_URL, Dencrypt } from "../../../Functions/Functions";
import { ErrorMessage, SuccessToast, plsWait } from "../../../Functions/Mics";

export const showDeliveryModal = (id, user, business) => {
  Swal.fire({
    title: `
      <div class="flex items-center gap-2 justify-center">
        <span class="text-2xl">📦</span>
        <h2 class="text-2xl font-bold text-gray-900">Delivery Details</h2>
      </div>
    `,
    html: `
      <div class="space-y-4 text-left text-gray-700">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-800 mb-2">Delivery Date *</label>
            <input type="date" id="deliveryDate" class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-800 mb-2">Delivery Fee *</label>
            <input type="number" id="deliveryFee" placeholder="0.00" class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-800 mb-2">Driver Name *</label>
            <input type="text" id="driverName" placeholder="Enter full name" class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-800 mb-2">Driver Contact *</label>
            <input type="tel" id="driverNumber" placeholder="+1 (555) 000-0000" class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
          </div>
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-800 mb-2">Vehicle Plate Number *</label>
          <input type="text" id="plateNumber" placeholder="e.g., ABC-1234" class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition uppercase">
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-800 mb-2">Delivery Remarks</label>
          <textarea id="deliveryRemarks" placeholder="Add any special instructions..." class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"></textarea>
        </div>

        <p class="text-xs text-gray-500 mt-3">* Required fields</p>
      </div>
    `,
    confirmButtonText: `<span class="font-semibold">Generate WayBill</span>`,
    cancelButtonText: `<span>Cancel</span>`,
    customClass: {
      popup: 'rounded-2xl shadow-2xl',
      htmlContainer: 'text-left',
      confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition duration-200 ease-in-out',
      cancelButton: 'bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2.5 rounded-lg font-medium transition duration-200 ease-in-out'
    },
    width: '520px',
    showCancelButton: true,
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

      const deliveryData = {
        DELIVERYDATE: deliveryDetails.deliveryDate,
        DriverName: deliveryDetails.driverName,
        DriverNumber: deliveryDetails.driverNumber,
        shippingFee: parseFloat(deliveryDetails.deliveryFee),
        vehicleNumber: deliveryDetails.plateNumber,
        DeliveryComment: deliveryDetails.deliveryRemarks,
        billId: id,
        userId: user._id,
        WayBillNo: `WB${Math.floor(Math.random() * 12345)}${deliveryDetails.plateNumber.substring(0, 3)}`
      };

      const url = `${EXPRESS_PRIVATE_URL}/api/delivery/${id}/${user.firstName}`

      fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          dbConnect: `Bearer ${business.rustyRoof}`,
          Authorization: `Bearer ${business.tenantId}`,
          // access: `${Dencrypt(user._id)}`,
        },
        body: JSON.stringify(deliveryData)
      }).then(response => {
        if (response.ok) {
          SuccessToast("WayBill generated successfully!");
          window.location.reload();
        } else {
          ErrorMessage("Failed to generate WayBill.");
        }
      }).catch(error => {
        ErrorMessage("An error occurred while generating WayBill.");
      });
    }
  })
}