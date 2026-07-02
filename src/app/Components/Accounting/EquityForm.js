"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Encrypt } from "../../../../Functions/Functions";
import {
  ErrorMessage,
  SuccessToast,
} from "../../../../Functions/Mics";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Label } from "@/components/ui/label";

export default function EquityForm({
  EXPRESS_PRIVATE_URL,
  user,
  Accounts,
  VendorsList,
}) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    amount: "",
    date: "",
    description: "",
    accountType: "",
    bank: "",
    vendor: "",
  });

  const handleSubmit = async () => {
    try {
      const {
        amount,
        date,
        description,
        accountType,
        bank,
        vendor,
      } = formData;

      if (
        !amount ||
        !date ||
        !description ||
        !accountType ||
        !bank
      ) {
        return ErrorMessage("All fields are required");
      }

      setLoading(true);

      let debitCredit = "credit";

      switch (accountType) {
        case "drawings":
          debitCredit = "debit";
          break;

        case "ownersCapital":
        case "retainedEarnings":
        case "shareCapital":
        case "reserves":
        case "OtherIncome":
        default:
          debitCredit = "credit";
      }

      const response = await fetch(
        `${EXPRESS_PRIVATE_URL}/api/Equity/journal`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Encrypt(
              user.tenantId
            )}`,
            access: Encrypt(user._id),
            sessionKey: `Bearer ${Encrypt(user.SessionId)}`
          },
          body: JSON.stringify({
            accountType,
            amount: Number(amount),
            debitCredit,
            date,
            description,
            raisedBy: `${user.firstName} ${user.lastName}`,
            bank,
            vendor: vendor || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to create entry"
        );
      }

      SuccessToast(data.message);

      setOpen(false);

      setFormData({
        amount: "",
        date: "",
        description: "",
        accountType: "",
        bank: "",
        vendor: "",
      });

      router.refresh();
    } catch (error) {
      ErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="
            flex items-center gap-3
            p-3 rounded-md
            bg-gray-500
            hover:bg-gray-600
            transition
            text-xs
            w-full
          "
        >
          Register  Entry
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            New Entry
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div>
            <Label>Amount</Label>
            <Input
              type="number"
              min="1"
              value={formData.amount}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  amount: e.target.value,
                }))
              }
              placeholder="Amount (₦)"
            />
          </div>

          <div>
            <Label>Date</Label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  date: e.target.value,
                }))
              }
            />
          </div>

          <div>
            <Label>Description</Label>
            <Input
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Description"
            />
          </div>

          <div>
            <Label>Account Type</Label>

            <Select
              value={formData.accountType}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  accountType: value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose account type" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="ownersCapital">
                  Owners Capital
                </SelectItem>

                <SelectItem value="OtherIncome">
                  Other Income
                </SelectItem>

                <SelectItem value="drawings">
                  Drawings
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Bank Account</Label>

            <Select
              value={formData.bank}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  bank: value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose Bank" />
              </SelectTrigger>

              <SelectContent>
                {Accounts.map((account) => (
                  <SelectItem
                    key={account._id}
                    value={account._id}
                  >
                    {account.NAME}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Vendor (Optional)</Label>

            <Select
              value={formData.vendor}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  vendor: value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose Vendor" />
              </SelectTrigger>

              <SelectContent>
                {VendorsList.map((vendor) => (
                  <SelectItem
                    key={vendor._id}
                    value={vendor._id}
                  >
                    {vendor.Name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? "Creating Entry..."
              : "Create Entry"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}