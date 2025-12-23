"use client";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useState } from "react";
import { CreditCardIcon } from "@heroicons/react/24/outline";
import {
  plsWait,
  ErrorMessage,
  SuccessToast,
  Encrypt,
} from "../../../../Functions/Mics";
import { useRouter, useParams } from "next/navigation";

const MySwal = withReactContent(Swal);

const CreditNoteModal = ({ customersList, baseUrl, userData,BankAccounts }) => {
  const [customers] = useState(customersList);
  const Router = useRouter();
  const Path = useParams();

  const openModal = () => {
    const customerOptions = customers
      .map((c) => `<option value="${c._id}">${c.Username}</option>`)
      .join("");

      const BankOptions = BankAccounts
      .map((c) => `<option value="${c._id}">${c.NAME}</option>`)
      .join("");

    MySwal.fire({
      title:
        '<h2 class="text-sm font-bold text-gray-800 mb-4">Create Credit Note</h2>',
      html: `
        <div class="space-y-4">
          <div class="flex flex-col">
            <label class="text-left text-xs font-medium text-gray-700 mb-1">Date</label>
            <input type="date" id="creditDate" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-xs">
          </div>
          
          <div class="flex flex-col">
            <label class="text-left text-xs font-medium text-gray-700 mb-1">Amount</label>
            <input type="number" min=1 id="creditAmount" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-xs" placeholder="Enter amount">
          </div>

          <div class="flex flex-col">
            <label class="text-left text-xs font-medium text-gray-700 mb-1">Customer</label>
            <input type="text" id="customerSearch" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Search customer" oninput="filterCustomers(this.value)">
            <select id="customerDropdown" class="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-xs">
              ${customerOptions}
            </select>
          </div>

           <div class="flex flex-col">
            <label class="text-left text-xs font-medium text-gray-700 mb-1">Credit Account <i class="text-red-600">
              Choose this option only to log confirmed transactions — not estimates or drafts.
              </i>
            </label>
            <select id="bankDropdown" class="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-xs">
              <option value="" >Choose...</option>
              ${BankOptions}
            </select>
          </div>

          <div class="flex flex-col">
            <label class="text-left text-sm font-medium text-gray-700 mb-1">Remarks</label>
            <textarea id="creditRemarks" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-xs" rows="3" placeholder="Enter remarks"></textarea>
          </div>
        </div>
      `,
      customClass: {
        popup: "rounded-lg",
        confirmButton:
          "bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-md transition-colors duration-200 text-xs mr-3",
        cancelButton:
          "bg-red-200 hover:bg-red-300 text-gray-800 font-medium px-6 py-2 rounded-md transition-colors duration-200 text-xs",
      },
      showCloseButton: true,
      buttonsStyling: false,
      didOpen: () => {
        window.filterCustomers = function (searchTerm) {
          const dropdown = document.getElementById("customerDropdown");
          if (dropdown) {
            dropdown.innerHTML = customers
              .filter((c) =>
                c.Username.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((c) => `<option value="${c._id}">${c.Username}</option>`)
              .join("");
          }
        };
      },
      preConfirm: () => {
        const Date = document.getElementById("creditDate").value;
        const Total = document.getElementById("creditAmount").value;
        const reference = document.getElementById("creditRemarks").value;
        const customerId = document.getElementById("customerDropdown").value;
        const bankID = document.getElementById("bankDropdown").value;

        if (!Date || !Total || !customerId || !reference ) {
          Swal.showValidationMessage("Please fill in all required fields");
          return false;
        }

        return { Date, Total, reference, customerId, bankID: bankID || null };
      },
      confirmButtonText: "Create",
      showCancelButton: true,
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        plsWait("Working on things...please wait.");
        //  send this to your API here
        const request = await fetch(`${baseUrl}/api/Credit/new`, {
          method: "POST",
          body: JSON.stringify(result.value),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
            dbConnect: `Bearer ${userData.business.rustyRoof}`,
            access: `Bearer ${Encrypt(userData.user._id)}`,
          },
        });

        const response = await request.json();
        if (request.ok) {
          MySwal.fire({
            icon: "success",
            title: "Success!",
            text: "Credit note has been created successfully. Awaiting Approval",
            customClass: {
              popup: "rounded-lg",
              confirmButton:
                "bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-md transition-colors duration-200",
            },
            buttonsStyling: false,
          });
          //redirect to the cn for approval
          Router.push(
            `/${Path.auth}/${Path.Tenant}/${Path.module}/${Path.module}/credit-note/credit-note/${Encrypt(response.data)}`
          );
        } else {
          ErrorMessage(response.error);
        }
      }
    });
  };

  return (
    <button
      onClick={openModal}
      className=" hover:bg-gray-700 text-white p-4 rounded-md flex items-center gap-2 transition-colors duration-200 shadow-sm w-full text-xs"
    >
      <CreditCardIcon className="h-5 w-5 text-white" />
      Create Credit Note
    </button>
  );
};

export default CreditNoteModal;
