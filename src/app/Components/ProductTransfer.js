"use client"
import React from "react";
import Swal from "sweetalert2";
import "sweetalert2/src/sweetalert2.scss";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import {Encrypt} from "../../../Functions/Functions"
import {ErrorMessage,SuccessToast,plsWait} from "../../../Functions/Mics"
import {useRouter} from "next/navigation"

export default function ProductTransfer({Store,userData,baseUrl}) {
    const router = useRouter()
    const getStore = (id) =>{
        const WH = Store.find(str =>{
            return str._id === id
        })
        return WH?.WHName || "N/A"
    }
    const openTransferModal = async () => {
        const options = (Store || []).map(s => `<option value="${s._id}">${s.WHName}</option>`).join("");

        const today = new Date().toISOString().slice(0, 10);

        const result = await Swal.fire({
            title: "Schedule Product Transfer",
            showCloseButton: true,
            width: 640,
            html: `
              <div style="display:flex;flex-direction:column;gap:12px;font-family:inherit">
            <div style="display:flex;gap:10px;align-items:center">
              <div style="flex:1;min-width:0">
                <label for="swal-from" style="display:block;font-weight:600;margin-bottom:4px;font-size:13px">From</label>
                <select id="swal-from" class="swal2-select" aria-label="From" style="width:80%">
                  <option value="">Select From</option>
                  ${options}
                </select>
              </div>

              <button id="swal-swap" type="button" title="Swap From/To" style="background:#eef2ff;border:1px solid #e6e9f2;border-radius:6px;padding:8px;cursor:pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#4f46e5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h13M3 7l4-4M3 7l4 4M21 17H8M21 17l-4-4M21 17l-4 4"/></svg>
              </button>

              <div style="flex:1;min-width:0">
                <label for="swal-to" style="display:block;font-weight:600;margin-bottom:4px;font-size:13px">To</label>
                <select id="swal-to" class="swal2-select" aria-label="To" style="width:80%">
                  <option value="">Select To</option>
                  ${options}
                </select>
              </div>
            </div>

            <div>
              <label for="swal-date" style="display:block;font-weight:600;margin-bottom:4px;font-size:13px">Transfer Date</label>
              <input id="swal-date" class="swal2-input" type="date" min="${today}" value="${today}" style="width:80%;box-sizing:border-box" />
            </div>

            <div id="swal-preview" style="padding:10px;border-radius:8px;background:#f8fafc;border:1px solid #e6eef7;font-size:13px;color:#0f172a">
              <strong>Preview:</strong> Select source, destination and date to see details.
            </div>
              </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: "Schedule Transfer",
            willOpen: () => {
            const fromEl = document.getElementById("swal-from");
            const toEl = document.getElementById("swal-to");
            const dateEl = document.getElementById("swal-date");
            const swapBtn = document.getElementById("swal-swap");
            const preview = document.getElementById("swal-preview");

            const updatePreview = () => {
                const from = fromEl.value || "—";
                const to = toEl.value || "—";
                const date = dateEl.value || "—";
                const same = from && to && from === to;
                preview.innerHTML = `
                  <div style="display:flex;gap:8px;align-items:center">
                <div style="flex:1"><strong>From:</strong> ${getStore(from)}</div>
                <div style="flex:1"><strong>To:</strong> ${getStore(to)}</div>
                <div style="flex:1;text-align:right"><strong>Date:</strong> ${date}</div>
                  </div>
                  ${same ? '<div style="margin-top:8px;color:#b91c1c;font-size:12px">Source and destination cannot be the same.</div>' : ''}
                `;
            };

            swapBtn.addEventListener("click", () => {
                const tmp = fromEl.value;
                fromEl.value = toEl.value;
                toEl.value = tmp;
                updatePreview();
            });

            fromEl.addEventListener("change", updatePreview);
            toEl.addEventListener("change", updatePreview);
            dateEl.addEventListener("change", updatePreview);

            // initial preview
            updatePreview();
            },
            preConfirm: () => {
            const from = document.getElementById("swal-from").value;
            const to = document.getElementById("swal-to").value;
            const date = document.getElementById("swal-date").value;
            if (!from || !to || !date) {
                Swal.showValidationMessage("Please select From, To and a valid Date.");
                return false;
            }
            if (from === to) {
                Swal.showValidationMessage("From and To cannot be the same location.");
                return false;
            }
            return { from, to, date };
            },
        });

        if (result && result.value) {
            plsWait("Creating Transfer Request...")
            const { from, to, date } = result.value;
            // handle submission (API call, state update, etc.)
            const request = await fetch(`${baseUrl}/api/Transfer`,{
                method:"POST",
                body:JSON.stringify({from, to, date, user:`${userData.user.firstName} ${userData.user.lastName}`}),
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
                    dbConnect: `Bearer ${userData.business.rustyRoof}`,

                },
            })

            if (request.ok){
              // redirect to Form page
              router.push(``)
            }else{
              ErrorMessage('Something went wrong')
            }
           
        }
    };

    return (
        <div>
            <button onClick={openTransferModal}
            className="flex items-center gap-3 bg-gray-300 text-black/70 p-3 rounded-md hover:bg-gray-700 transition hover:text-gray-100 text-sm w-full"
            >
              <PlusCircleIcon className="h-4 w-4 text-gray-100" />
              <span className="">Start New Product Transfer</span>
            </button>
        </div>
    );
}