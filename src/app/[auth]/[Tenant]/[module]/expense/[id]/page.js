"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

import {
  plsWait,
  ErrorMessage,
  SuccessToast,
  Encrypt,
} from "../../../../../../../Functions/Mics";

import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export default function Page({ data, Currentuser, business, baseUrl }) {
  const [expense] = useState(data.expense);
  const Router = useRouter();
  const [AccountList] = useState(data.Accounts || []);

  const [formData, setFormData] = useState({
    BankAccount: "",
    Amount: expense.Amount || "",
    paymentDate: expense.paymentDate?.slice(0, 10) || "",
    status: "",
    Accountant: `${Currentuser.firstName} ${Currentuser.lastName}`,
  });

  const getBankAccount = (accountId) => {
    const account = AccountList.find((acc) => acc._id === accountId);
    return account ? account.NAME : "N/A";
  };

  const DeleteExpense = async () => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This action will permanently delete the expense.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it",
    });

    if (!confirm.isConfirmed) return;

    try {
      plsWait("Submitting delete request...");
      const res = await fetch(`${baseUrl}/api/Expense/${Encrypt(expense._id)}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(business.tenantId)}`,
          access: `${Encrypt(Currentuser._id)}`,
          sessionKey: `Bearer ${Encrypt(Currentuser.SessionId)}`,
        },
      });

      if (res.ok) {
        Swal.fire("Deleted!", "Expense has been deleted.", "success");
        Router.back();
      } else {
        const error = await res.json();
        throw new Error(error.error);
      }
    } catch (err) {
      ErrorMessage(err.message);
    }
  };

  const ActionBTN = async (action) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: `This action will set Expense as ${action} and register entries into ledgers.`,
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: action === "Approved" ? "#16a34a" : "#ef4444",
      confirmButtonText: "Yes, Proceed",
    });

    if (!confirm.isConfirmed) return;

    try {
      setFormData((prev) => ({ ...prev, status: action }));

      if (action === "Approved" && (!formData.Amount || !formData.paymentDate || !formData.BankAccount)) {
        ErrorMessage("Please fill in all required fields.");
        return;
      }

      plsWait(`Submitting ${action} request...`);

      const res = await fetch(`${baseUrl}/api/Expense/${Encrypt(expense._id)}`, {
        method: "PATCH",
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(business.tenantId)}`,
          access: `${Encrypt(Currentuser._id)}`,
          sessionKey: `Bearer ${Encrypt(Currentuser.SessionId)}`,
        },
      });

      const response = await res.json();

      if (res.ok) {
        SuccessToast(response.message);
        Router.refresh();
        location.reload();
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      ErrorMessage(err.message);
      Router.refresh();
    }
  };

  return (
    <div className="max-w-full p-3 m-3 md:py-10">
      <Card className="shadow-md">
        <CardHeader className="text-center pb-8">
          <div className="flex justify-center mb-4">
            {expense.image ? (
              <Image
                src={expense.image}
                alt="Expense"
                width={100}
                height={100}
                className="rounded-lg object-contain"
                priority={true}
              />
            ) : (
              <div className="w-[180px] h-[180px] flex items-center justify-center bg-gray-100 text-gray-500 rounded-lg">
                No Image Available
              </div>
            )}
          </div>

          {/* Status Tracker */}
          <div className="flex items-center justify-center gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full ${expense.status === "pending" ? "bg-yellow-500" : "bg-gray-300"}`} />
              <span className="text-xs mt-1">Pending</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-300" />
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full ${expense.status === "Approved" ? "bg-green-600" : "bg-gray-300"}`} />
              <span className="text-xs mt-1">Approved</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-300" />
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full ${expense.status === "Reversed" ? "bg-red-600" : "bg-gray-300"}`} />
              <span className="text-xs mt-1">Reversed</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Reference No</Label>
              <p className="text-xl font-semibold text-gray-800 mt-1">{expense?.refNo}</p>
            </div>

            <div>
              <Label>Payee</Label>
              <p className="font-medium mt-1">{expense.payee}</p>
            </div>

            <div>
              <Label>Raised By</Label>
              <p className="font-medium mt-1">{expense?.initiatorId}</p>
            </div>

            <div>
              <Label>Request Date</Label>
              <p className="font-medium mt-1">{expense?.Date}</p>
            </div>

            <div>
              <Label>Store</Label>
              <p className="font-medium mt-1">{expense?.WHID?.WHName}</p>
            </div>

            <div>
              <Label>Requested Amount</Label>
              {Currentuser.expenseApprover && expense.status === "pending" ? (
                <Input
                  type="number"
                  value={formData.Amount}
                  onChange={(e) => setFormData({ ...formData, Amount: e.target.value })}
                  min={1}
                  step="any"
                  className="mt-1"
                />
              ) : (
                <p className="font-medium mt-1">₦{expense?.Amount}</p>
              )}
            </div>

            <div>
              <Label>Payment Date</Label>
              {Currentuser.expenseApprover && expense.status === "pending" ? (
                <Input
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                  className="mt-1"
                />
              ) : (
                <p className="font-medium mt-1">{expense?.paymentDate}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label>Expense Account</Label>
              {Currentuser.expenseApprover && expense.status === "pending" ? (
                <Select
                  value={formData.BankAccount}
                  onValueChange={(val) => setFormData({ ...formData, BankAccount: val })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select Account" />
                  </SelectTrigger>
                  <SelectContent>
                    {AccountList.map((acc) => (
                      <SelectItem key={acc._id} value={acc._id}>
                        {acc.NAME}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="font-medium mt-1">{expense?.BankAccount?.NAME || "N/A"}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label>Remarks</Label>
              <p className="mt-1 text-gray-600">{expense?.remarks || "No remarks"}</p>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            {Currentuser.expenseApprover && expense.status === "pending" && (
              <>
                <Button onClick={() => ActionBTN("Approved")} className="bg-green-600 hover:bg-green-700">
                  Approve Expense
                </Button>

                <Button onClick={DeleteExpense} variant="destructive">
                  Delete Expense
                </Button>
              </>
            )}

            {Currentuser.expenseApprover && expense.status === "Approved" && (
              <Button onClick={() => ActionBTN("Reversed")} variant="destructive">
                Reverse Expense
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}