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
  CardTitle,
  CardDescription,
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Page({ data, Currentuser, business, baseUrl }) {
  const [expense] = useState(data.expense);
  const Router = useRouter();
  const [AccountList] = useState(data.Accounts || []);

  const [formData, setFormData] = useState({
    BankAccount: expense.BankAccount?._id || "",
    Amount: expense.Amount || "",
    paymentDate: expense.paymentDate?.slice(0, 10) || "",
    status: "",
    Accountant: `${Currentuser.firstName} ${Currentuser.lastName}`,
  });

  const getBankAccount = (accountId) => {
    const account = AccountList.find((acc) => acc._id === accountId);
    return account ? account.NAME : "N/A";
  };

  const statusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "reversed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const DeleteExpense = async () => {
    const confirm = await Swal.fire({
      title: "Delete Expense?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Delete",
    });

    if (!confirm.isConfirmed) return;

    try {
      plsWait("Deleting expense...");
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
        Swal.fire("Deleted!", "Expense has been deleted successfully.", "success");
        Router.back();
      } else {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete");
      }
    } catch (err) {
      ErrorMessage(err.message);
    }
  };

  const ActionBTN = async (action) => {
    const confirm = await Swal.fire({
      title: `Confirm ${action}`,
      text: `This will ${action.toLowerCase()} the expense and update ledger entries.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: action === "Approved" ? "#16a34a" : "#ef4444",
      confirmButtonText: `Yes, ${action}`,
    });

    if (!confirm.isConfirmed) return;

    try {
      setFormData((prev) => ({ ...prev, status: action }));

      if (action === "Approved" && (!formData.Amount || !formData.paymentDate || !formData.BankAccount)) {
        ErrorMessage("Please fill all required fields before approving.");
        return;
      }

      plsWait(`${action}ing expense...`);

      const res = await fetch(`${baseUrl}/api/Expense/${Encrypt(expense._id)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(business.tenantId)}`,
          access: `${Encrypt(Currentuser._id)}`,
          sessionKey: `Bearer ${Encrypt(Currentuser.SessionId)}`,
        },
        body: JSON.stringify(formData),
      });

      const response = await res.json();

      if (res.ok) {
        SuccessToast(response.message || "Action completed successfully");
        Router.refresh();
      } else {
        throw new Error(response.error || "Action failed");
      }
    } catch (err) {
      ErrorMessage(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-8 border-b">
            <div className="flex justify-center mb-6">
              {expense.image ? (
                <Image
                  src={expense.image}
                  alt="Expense Receipt"
                  width={160}
                  height={160}
                  className="rounded-xl object-contain border bg-muted p-2"
                  priority
                />
              ) : (
                <div className="w-40 h-40 flex items-center justify-center bg-muted rounded-xl border">
                  <span className="text-muted-foreground">No Receipt</span>
                </div>
              )}
            </div>

            <CardTitle className="text-2xl">Expense Details</CardTitle>
            <div className="flex justify-center mt-3">
              <Badge variant={statusVariant(expense.status)} className="text-sm px-4 py-1">
                {expense.status || "Unknown"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Reference Number</Label>
                <p className="text-xl font-semibold">{expense?.refNo}</p>
              </div>

              <div className="space-y-2">
                <Label>Payee</Label>
                <p className="font-medium">{expense.payee}</p>
              </div>

              <div className="space-y-2">
                <Label>Raised By</Label>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {Currentuser.firstName?.[0]}{Currentuser.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-medium">{expense?.initiatorId}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Request Date</Label>
                <p className="font-medium">{expense?.Date}</p>
              </div>

              <div className="space-y-2">
                <Label>Store / Location</Label>
                <p className="font-medium">{expense?.WHID?.WHName || "N/A"}</p>
              </div>

              <div className="space-y-2">
                <Label>Requested Amount</Label>
                {Currentuser.expenseApprover && expense.status === "pending" ? (
                  <Input
                    type="number"
                    value={formData.Amount}
                    onChange={(e) => setFormData({ ...formData, Amount: e.target.value })}
                    min={1}
                    step="any"
                  />
                ) : (
                  <p className="text-2xl font-bold text-primary">₦{expense?.Amount}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Payment Date</Label>
                {Currentuser.expenseApprover && expense.status === "pending" ? (
                  <Input
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                  />
                ) : (
                  <p className="font-medium">{expense?.paymentDate}</p>
                )}
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label>Expense Account</Label>
                {Currentuser.expenseApprover && expense.status === "pending" ? (
                  <Select
                    value={formData.BankAccount}
                    onValueChange={(val) => setFormData({ ...formData, BankAccount: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Bank Account" />
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
                  <p className="font-medium">{getBankAccount(expense?.BankAccount?._id)}</p>
                )}
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label>Remarks / Description</Label>
                <p className="text-muted-foreground bg-muted p-4 rounded-lg min-h-[80px]">
                  {expense?.remarks || "No additional remarks provided."}
                </p>
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-end">
              {Currentuser.expenseApprover && expense.status === "pending" && (
                <>
                  <Button onClick={DeleteExpense} variant="destructive" size="lg">
                    Delete Expense
                  </Button>

                  <Button 
                    onClick={() => ActionBTN("Approved")} 
                    size="lg"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Approve Expense
                  </Button>
                </>
              )}

              {Currentuser.expenseApprover && expense.status === "Approved" && (
                <Button 
                  onClick={() => ActionBTN("Reversed")} 
                  variant="destructive" 
                  size="lg"
                >
                  Reverse Expense
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}