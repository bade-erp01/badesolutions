"use client";

import BackButton from "@/app/Components/BackBotton";
const NaijaStates = require("naija-state-local-government");
import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { Encrypt, ErrorMessage, SuccessToast, plsWait } from "../../../../../../../Functions/Mics";
import { EXPRESS_PRIVATE_URL } from "../../../../../../../Functions/Functions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";

export default function NewEmployeeForm({ userData, baseUrl }) {
  const states = NaijaStates.states();
  const [formData, setFormData] = useState({});
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    plsWait("Please wait... Do not refresh this page");

    try {
      const response = await fetch(
        `${baseUrl}/api/createUser/${Encrypt(userData.user._id)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
            access: `${Encrypt(userData.user._id)}`,
            sessionKey: `Bearer ${Encrypt(userData.SessionId)}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (!response.ok) throw new Error(result.error);

      SuccessToast(result.message);
      setFormData({});
      router.refresh();

      setTimeout(() => {
        router.push(
          `/${userData.business.companyName}/${Encrypt(
            userData.business.tenantId
          )}/employee/employee/${result.user}?Modules=employee`
        );
      }, 2000);
    } catch (error) {
      ErrorMessage(error);
    }
  };

  return (
    <div className="min-h-screen py-3 w-full">
      <Card className="mt-6 shadow-xl">
          {/* Header */}
          <CardHeader className="bg-gradient-to-r from-zinc-900 to-zinc-800 text-white rounded-t-xl">
            <div className="flex items-center gap-3">
              <UserCircleIcon className="w-8 h-8" />
              <div>
                <CardTitle className="text-3xl">New User Profile</CardTitle>
                <p className="text-zinc-400 mt-1">
                  Add a new employee to your organization
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Personal Information */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <UserCircleIcon className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold">Personal Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      required
                      onChange={handleChange}
                      placeholder="John"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      required
                      onChange={handleChange}
                      placeholder="Doe"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="Email">Email Address *</Label>
                    <Input
                      id="Email"
                      name="Email"
                      type="email"
                      required
                      onChange={handleChange}
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="DOB">Date of Birth *</Label>
                    <Input
                      id="DOB"
                      name="DOB"
                      type="date"
                      required
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telephone">Telephone *</Label>
                    <Input
                      id="telephone"
                      name="telephone"
                      type="tel"
                      required
                      onChange={handleChange}
                      placeholder="+234 XXX XXX XXXX"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workTelephone">Work Line</Label>
                    <Input
                      id="workTelephone"
                      name="workTelephone"
                      type="tel"
                      onChange={handleChange}
                      placeholder="+234 XXX XXX XXXX"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Location Information */}
              <div>
                <h2 className="text-xl font-semibold mb-6">Location Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="Country">Country</Label>
                    <Input
                      id="Country"
                      name="Country"
                      defaultValue="Nigeria"
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stateOfOrigin">State / Province</Label>
                    <Select
                      onValueChange={(value) =>
                        handleSelectChange("stateOfOrigin", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                <Button
                  type="submit"
                  size="lg"
                  className="flex-1 sm:flex-none text-base font-medium"
                >
                  Register New User
                </Button>

                <PurchaseLicenseButton formData={formData} userData={userData} />
              </div>
            </form>
          </CardContent>
        </Card>
    </div>
  );
}

export function PurchaseLicenseButton({ formData, userData }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [licenses, setLicenses] = useState("");
  const [summary, setSummary] = useState(null);

  const calculatePrice = () => {
    const numberOfUsers = parseInt(licenses);
    if (!numberOfUsers || numberOfUsers < 1) {
      ErrorMessage("Please enter a valid number (minimum 1)");
      return;
    }

    const baseAmount = formData.plan === "Basic" ? 900 : 1200;
    const vat = baseAmount * numberOfUsers * 0.075;
    const total = (baseAmount * numberOfUsers + vat) * 12;

    setSummary({ numberOfUsers, baseAmount, vat, total });
  };

  const proceedPayment = async () => {
    if (!summary) return;

    try {
      plsWait("Processing payment...");

      const response = await fetch(`${EXPRESS_PRIVATE_URL}/purchase/License`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(userData.business._id)}`,
          sessionKey: `Bearer ${Encrypt(userData.SessionId)}`,
        },
        body: JSON.stringify({
          numberOfUsers: summary.numberOfUsers,
          plan: formData.plan,
          totalAmount: summary.total,
        }),
      });

      if (!response.ok) throw new Error("Payment request failed");

      const data = await response.json();
      SuccessToast("Redirecting to payment...");
      router.push(data.data);
    } catch (error) {
      ErrorMessage(error.message);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={() => setOpen(true)}
        className="flex-1 sm:flex-none border-zinc-800 hover:bg-zinc-900 hover:text-white"
      >
        Purchase Licenses
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Purchase User Licenses</DialogTitle>
            <DialogDescription>
              Enter the number of licenses you want to purchase.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="licenses">Number of Licenses</Label>
              <Input
                id="licenses"
                type="number"
                min={1}
                value={licenses}
                onChange={(e) => setLicenses(e.target.value)}
                placeholder="Enter number of licenses"
              />
            </div>

            <Button onClick={calculatePrice} className="w-full">
              Calculate Price
            </Button>

            {summary && (
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Number of Licenses</span>
                      <span className="font-medium">{summary.numberOfUsers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base Amount (per license)</span>
                      <span>₦{summary.baseAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>
                        ₦{(summary.baseAmount * summary.numberOfUsers).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">VAT (7.5%)</span>
                      <span className="text-amber-600">
                        ₦{summary.vat.toLocaleString()}
                      </span>
                    </div>

                    <Separator />

                    <div className="flex justify-between text-base font-semibold">
                      <span>Total (12 months)</span>
                      <span>₦{summary.total.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={proceedPayment}
              disabled={!summary}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Proceed to Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}