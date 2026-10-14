"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChartBarIcon } from "@heroicons/react/24/outline"
import Swal from "sweetalert2"
import withReactContent from "sweetalert2-react-content"
import { Encrypt } from "../../../Functions/Functions"
import { plsWait, ErrorMessage } from "../../../Functions/Mics"

const MySwal = withReactContent(Swal)

export default function ExpenseReportModal({ userData, baseUrl }) {
    const [dateModalOpen, setDateModalOpen] = useState(false)
    const [Startdate, setStartDate] = useState("")
    const [Enddate, setEndDate] = useState("")

    const handleSubmit = async () => {
        plsWait("Generating report...")
        const request = await fetch(
            `${baseUrl}/api/ExpenseReport?Startdate=${Startdate}&Enddate=${Enddate}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
                    access: `${Encrypt(userData.user._id)}`,
                    sessionKey: `Bearer ${Encrypt(userData.SessionId)}`
                },
            }
        )
        const response = await request.json()

        // if respons has an error, show error message
        if (response.error || !request.ok || response.ExpensesList.length === 0) {
           ErrorMessage(response.error || "No  expenses found for the selected dates")
           return
        }
        setDateModalOpen(false)
        showExpenseSwal(response)
    }

    return (
        <>
            <Button className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition text-xs w-full" onClick={() => setDateModalOpen(true)}>
                <ChartBarIcon className="h-5 w-5 mr-2" />
                Generate Expense Report
            </Button>

            <Dialog open={dateModalOpen} onOpenChange={setDateModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Select Report Dates</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Input
                            type="date"
                            value={Startdate}
                            onChange={(e) => setStartDate(e.target.value)}
                            placeholder="Start Date"
                        />
                        <Input
                            type="date"
                            value={Enddate}
                            onChange={(e) => setEndDate(e.target.value)}
                            placeholder="End Date"
                        />
                        <Button onClick={handleSubmit}>Generate Report</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

function showExpenseSwal(data) {
    const filters = {
        store: "",
        category: "",
        account: "",
        payee: "",
    }

    const categories = [...new Set(data.ExpensesList.map((item) => item.category.type))]
    const payees = [...new Set(data.ExpensesList.map((item) => item.payee))]
    const AccountList = data.AccountList;
    const StoreList = data.Stores; 

    // function that finds and return store Name based on WHID
    const getStoreName = (WHID) => {
        const store = StoreList.find((s) => s._id === WHID)
        return store ? store.WHName : "Unknown Store"
    }

    //get bank account name based on account number
    const getAccountName = (accountNumber) => {
        const account = AccountList.find((a) => a._id === accountNumber)
        return account ? account.NAME : "Unknown Account"
    }

    const downloadCSV = (filtered) => {
        const headers = ["Ref No","Tag", "Store", "Acc. posted", "Payee","Payee Acc", "Category", "Date", "Status","Amount"]
        const rows = filtered.map((item) => [
            item.refNo,
            item.category.NAME,
            getStoreName(item.WHID),
            getAccountName(item.BankAccount),
            item.payee,
            item.payeebankAccount,
            item.category.type,
            item.Date,
            item.status,
            item.Amount,
        ])
        const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")
        const blob = new Blob([csv], { type: "text/csv" })
        const link = document.createElement("a")
        link.href = URL.createObjectURL(blob)
        link.download = `expense_report.csv`
        link.click()
    }

    const renderTable = () => {
        const filtered = data.ExpensesList.filter((item) => {
            const storeMatch = filters.store ? item.WHID === filters.store : true
            const categoryMatch = filters.category ? item.category.type === filters.category : true
            const accountMatch = filters.account ? item.BankAccount === filters.account : true
            const payeeMatch = filters.payee ? item.payee === filters.payee : true
            return storeMatch && categoryMatch && accountMatch && payeeMatch
        })

        const rows = filtered
            .map(
                (item) => `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 4px;">${item.refNo}</td>
                    <td style="padding: 4px;">${item.category.NAME}</td>
                    <td style="padding: 4px;">${getStoreName(item.WHID)}</td>
                    <td style="padding: 4px;">${getAccountName(item.BankAccount)}</td>
                    <td style="padding: 4px;">${item.payee}</td>
                    <td style="padding: 4px;">${item.payeebankAccount}</td>
                    <td style="padding: 4px;">${item.category.type}</td>
                    <td style="padding: 4px;">${item.Date}</td>
                    <td style="padding: 4px;">${item.status}</td>
                    <td style="padding: 4px;">${item.Amount}</td>
                </tr>
            `
            )
            .join("")

        return { html: rows, filtered }
    }

    MySwal.fire({
        title: "Expense Report",
        width: "90%",
        html: `
            <style> @media (max-width: 639px) { .swal2-html-container input, .swal2-html-container select, .swal2-html-container textarea { font-size: 16px !important; } } </style>
            <div style="margin-bottom: 8px; display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 8px;">
                <div>
                    <label style="font-weight: 600; font-size: 12px;">Filter by Store</label><br/>
                    <select id="storeFilter" style="padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px; width: 100%;">
                        <option value="">All Stores</option>
                        ${StoreList.map((s) => `<option value="${s._id}">${s.WHName}</option>`).join("")}
                    </select>
                </div>
                <div>
                    <label style="font-weight: 600; font-size: 12px;">Filter by Category</label><br/>
                    <select id="categoryFilter" style="padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px; width: 100%;">
                        <option value="">All Categories</option>
                        ${categories.map((c) => `<option value="${c}">${c}</option>`).join("")}
                    </select>
                </div>
            
                <div>
                    <label style="font-weight: 600; font-size: 12px;">Filter by Account</label><br/>
                    <select id="accountFilter" style="padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px; width: 100%;">
                        <option value="">All Accounts</option>
                        ${AccountList.map((a) => `<option value="${a._id}">${a.NAME}</option>`).join("")}
                    </select>
                </div>
                <div>
                    <label style="font-weight: 600; font-size: 12px;">Filter by Payee</label><br/>
                    <select id="payeeFilter" style="padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px; width: 100%;">
                        <option value="">All Payees</option>
                        ${payees.map((p) => `<option value="${p}">${p}</option>`).join("")}
                    </select>
                </div>
            </div>
            <button id="downloadBtn" style="margin-bottom: 8px; padding: 6px 12px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600;">Download CSV</button>
            <div style="overflow-x: auto; max-height: 280px;">
                <table style="width:100%; border-collapse: collapse; font-size: 12px;">
                    <thead style="background:#f0f0f0; font-weight:bold;">
                        <tr>
                            <th>Ref No</th>
                            <th>Tag</th>
                            <th>Store</th>
                            <th>Acc. Posted</th>
                            <th>Payee</th>
                            <th>Account</th>
                            <th>Category</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody id="tableBody">
                        ${renderTable().html}
                    </tbody>
                </table>
            </div>
        `,
        showCloseButton: true,
        showConfirmButton: false,
        didOpen: () => {
            const updateTable = () => {
                const { html, filtered } = renderTable()
                document.getElementById("tableBody").innerHTML = html
                document.getElementById("downloadBtn").onclick = () => downloadCSV(filtered)
            }

            document.getElementById("storeFilter").addEventListener("change", (e) => {
                filters.store = e.target.value
                updateTable()
            })
            document.getElementById("categoryFilter").addEventListener("change", (e) => {
                filters.category = e.target.value
                updateTable()
            })
            document.getElementById("accountFilter").addEventListener("change", (e) => {
                filters.account = e.target.value
                updateTable()
            })
            document.getElementById("payeeFilter").addEventListener("change", (e) => {
                filters.payee = e.target.value
                updateTable()
            })

            document.getElementById("downloadBtn").onclick = () => downloadCSV(renderTable().filtered)
        },
    })
}
