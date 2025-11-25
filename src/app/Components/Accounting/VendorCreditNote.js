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

const VendorCreditNoteModal = ({
    customersList,
    baseUrl,
    userData,
    BankAccounts,
}) => {
    const [customers] = useState(customersList);
    const Router = useRouter();
    const Path = useParams();

    const openModal = () => {
        const customerOptions = customers
            .map(
                (c) =>
                    `<option value="${c._id}" class="py-2 px-3">${c.Name}</option>`
            )
            .join("");

        // const BankOptions = BankAccounts
        //     .map(
        //         (c) =>
        //             `<option value="${c._id}" class="py-2 px-3">${c.NAME}</option>`
        //     )
        //     .join("");

        MySwal.fire({
            title:
                '<div class="flex items-center gap-2 mb-4"><span class="bg-blue-100 text-blue-700 rounded-full px-2 py-1 text-xs font-bold">Credit Note</span><h2 class="text-base font-semibold text-gray-800">Create Vendor Credit Note</h2></div>',
            html: `
                <div class="space-y-5">
                    <div class="flex flex-col">
                        <label class="text-xs font-semibold text-gray-700 mb-1">Date</label>
                        <input type="date" id="creditDate" class="w-full px-4 py-2 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition" />
                    </div>
                    <div class="flex flex-col">
                        <label class="text-xs font-semibold text-gray-700 mb-1">Amount</label>
                        <input type="number" min=1 id="creditAmount" class="w-full px-4 py-2 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition" placeholder="Enter amount" />
                    </div>
                    <div class="flex flex-col">
                        <label class="text-xs font-semibold text-gray-700 mb-1">Vendor</label>
                        <input type="text" id="customerSearch" class="w-full px-4 py-2 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm mb-2 transition" placeholder="Search vendors" oninput="filterCustomers(this.value)" />
                        <select id="customerDropdown" class="w-full px-4 py-2 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition">
                            ${customerOptions}
                        </select>
                    </div>
                    <div class="flex flex-col">
                        <label class="text-xs font-semibold text-gray-700 mb-1">Remarks</label>
                        <textarea id="creditRemarks" class="w-full px-4 py-2 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition" rows="3" placeholder="Enter remarks"></textarea>
                    </div>
                </div>
            `,
            customClass: {
                popup: "rounded-xl p-0",
                confirmButton:
                    "bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors duration-200 text-sm mr-3 shadow",
                cancelButton:
                    "bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-2 rounded-lg transition-colors duration-200 text-sm shadow",
            },
            showCloseButton: true,
            buttonsStyling: false,
            didOpen: () => {
                window.filterCustomers = function (searchTerm) {
                    const dropdown = document.getElementById("customerDropdown");
                    if (dropdown) {
                        dropdown.innerHTML = customers
                            .filter((c) =>
                                c.Name.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            .map(
                                (c) =>
                                    `<option value="${c._id}" class="py-2 px-3">${c.Name}</option>`
                            )
                            .join("");
                    }
                };
            },
            preConfirm: () => {
                const Date = document.getElementById("creditDate").value;
                const Total = document.getElementById("creditAmount").value;
                const reference = document.getElementById("creditRemarks").value;
                const customerId = document.getElementById("customerDropdown").value;
                // const bankID = document.getElementById("bankDropdown").value;

                if (!Date || !Total || !customerId || !reference ) {
                    Swal.showValidationMessage("Please fill in all required fields");
                    return false;
                }

                return { Date, Total, reference, VendorId:customerId };
            },
            confirmButtonText: "Create",
            showCancelButton: true,
            cancelButtonText: "Cancel",
        }).then(async (result) => {
            if (result.isConfirmed) {
                plsWait("Working on things..please wait.");
                const request = await fetch(`${baseUrl}/api/VendorCredit`, {
                    method: "POST",
                    body: JSON.stringify(result.value),
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${userData.business.tenantId}`,
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
                            popup: "rounded-xl",
                            confirmButton:
                                "bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors duration-200 text-sm shadow",
                        },
                        buttonsStyling: false,
                    });
                    Router.push(
                        `/${Path.auth}/${Path.Tenant}/${Path.module}/${Path.module}/Vendor-CreditNote/Vendor-CreditNote/${Encrypt(
                            response.data
                        )}`
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

export default VendorCreditNoteModal;
