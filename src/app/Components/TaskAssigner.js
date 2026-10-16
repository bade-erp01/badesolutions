"use client"

import {useState} from 'react'
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import {ErrorMessage,plsWait,SuccessToast} from "../../../Functions/Mics"
import {Encrypt} from "../../../Functions/Functions"
import {
  TicketIcon
} from "@heroicons/react/24/outline";

const MySwal = withReactContent(Swal);

export default function TaskAssigner({users, userInfo , EXPRESS_PRIVATE_URL}) {
    const navigation = useRouter()
    const [userList] = useState(users || [])

    const scheduleActivity = async () => {
        const result = await MySwal.fire({
            title: '<span class="text-2xl font-bold text-gray-900">Schedule an Activity</span>',
            html: `
            <div class="flex flex-col gap-5 text-left text-gray-700 p-2">
                <div class="space-y-2">
                <label for="swal-select1" class="block text-sm font-semibold text-gray-800">Activity</label>
                <select id="swal-select1" class="w-full px-4 py-2.5 text-base bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition text-gray-700 font-medium">
                    <option value="" disabled selected>Select Activity</option>
                    <option value="Meeting">📅 Meeting</option>
                    <option value="Call">📞 Call</option>
                    <option value="Visitation">👤 Visitation</option>
                    <option value="Raise Bill">📋 Raise Bill</option>
                    <option value="Collect Payment">💳 Collect Payment</option>
                    <option value="Send Invoice">📧 Send Invoice</option>
                    <option value="Others">🔧 Others</option>
                </select>
                </div>
                <div class="space-y-2">
                <label for="swal-assign" class="block text-sm font-semibold text-gray-800">Assign To</label>
                <select id="swal-assign" class="w-full px-4 py-2.5 text-base bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition text-gray-700 font-medium">
                    <option value="" disabled selected>Select assignee</option>
                    ${userList.map(emp => `<option value="${emp._id}">${emp.firstName} ${emp.lastName}</option>`).join('')}
                </select>
                </div>
                <div class="space-y-2">
                <label for="swal-input3" class="block text-sm font-semibold text-gray-800">Date</label>
                <input type="date" id="swal-input3" class="w-full px-4 py-2.5 text-base bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition text-gray-700" />
                </div>
                <div class="space-y-2">
                <label for="swal-textarea" class="block text-sm font-semibold text-gray-800">Additional Notes</label>
                <textarea id="swal-textarea" class="w-full px-4 py-2.5 text-base bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition text-gray-700 resize-none" rows="3" placeholder="Add any additional notes..."></textarea>
                </div>
            </div>
            `,
            customClass: {
            popup: "rounded-xl shadow-2xl",
            htmlContainer: "w-full",
            confirmButton: "bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-lg hover:shadow-lg transition font-semibold",
            cancelButton: "bg-gray-200 text-gray-800 px-6 py-2.5 rounded-lg hover:bg-gray-300 transition font-semibold",
            },
            buttonsStyling: false,
            showCancelButton: true,
            confirmButtonText: "Schedule Activity",
            cancelButtonText: "Cancel",
            preConfirm: () => {
            const activity = document.getElementById("swal-select1").value;
            const assignTo = document.getElementById("swal-assign").value;
            const datetime = document.getElementById("swal-input3").value;
            const notes = document.getElementById("swal-textarea").value;

            if (!activity || !assignTo || !datetime || !notes.trim()) {
                Swal.showValidationMessage("Please fill out all fields before scheduling.");
                return false;
            }
            return { activity, assignTo, datetime, notes };
            },
        });

        if (result.isConfirmed) {
            plsWait("");
            try {
                const data = await axios.put(
                    `${EXPRESS_PRIVATE_URL}/api/Activity_Schedula/${Encrypt(userInfo.user._id)}`,
                    {
                        ...result.value,
                        creatorID: `${userInfo.user.firstName} ${userInfo.user.lastName}` ,
                    },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${Encrypt(userInfo.business.tenantId)}`,
                            access: `${Encrypt(userInfo.user._id)}`,
                            sessionKey: `Bearer ${Encrypt(userInfo.SessionId)}`
                        },
                    }
                );
                SuccessToast(data.data.message);
                navigation.refresh();
            } catch (error) {
                ErrorMessage("Failed to schedule activity.");
            }
        }
    };

    return (
        <span onClick={scheduleActivity} className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition">
          <TicketIcon className="h-5 w-5 text-white" />
          <span className="text-xs">Schedule Activity</span>
        </span>
    );
}