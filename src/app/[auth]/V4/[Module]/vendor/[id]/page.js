"use client";

import { useRouter,useParams } from "next/navigation";
import { ShoppingCartIcon, ShoppingBagIcon, BanknotesIcon } from "@heroicons/react/24/outline";
import { plsWait, ErrorMessage, SuccessToast } from "../../../../../../../Functions/Mics";
import api from "@/lib/api";
import moment from "moment";
import { useEffect, useState } from "react";
import Plotly from "plotly.js-dist-min";
import { Dencrypt } from "../../../../../../../Functions/Functions";
import Image from "next/image";

// Shadcn UI Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

export default function SingleVendorpage({
  AccountingFinder,
  userInfo,
  Backdata,
  wh,
  banks,
  Locations,
}) {
  const [user] = useState(userInfo);
  const [data] = useState(Backdata);
  const router = useRouter();
  const path = useParams()
  const [formData, setFormData] = useState({ ...Backdata });

  // Form Handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      plsWait("Updating...");
      const response = await api.patch(
        `/api/vendor/update/${Backdata._id}`,
        formData
      );
      if (!response.ok) throw new Error(response.error);

      if (response.data?.message) {
        SuccessToast(response.data.message);
        router.refresh();
      } else {
        throw new Error(response.data?.error || "Update failed");
      }
    } catch (error) {
      ErrorMessage(error.message || "Something went wrong");
    }
  };

  // ==================== New Purchase Order ====================
  const [poOpen, setPoOpen] = useState(false);
  const [poForm, setPoForm] = useState({
    warehouse: "",
    recievedDate: "",
    refNo: "",
    vendor: Backdata._id,
  });

  const handlePoSubmit = async () => {
    if (!poForm.warehouse || !poForm.recievedDate || !poForm.refNo) {
      ErrorMessage("All fields are required");
      return;
    }

    setPoOpen(false);
    plsWait("Setting things up...");

    try {
      const request = await api.post(`/api/purchase/request`, poForm);

      const res = request.data || {};

      if (res.newPurchase) {
        router.push(`/${path.auth}/V4/purchase/purchase/${res.newPurchase}`);
      } else {
        ErrorMessage(res.error || request.error || "Failed to create purchase order");
      }
    } catch (err) {
      ErrorMessage("An error occurred");
    }
  };

  // ==================== New G.I.T Request ====================
  const [gitOpen, setGitOpen] = useState(false);
  const [gitForm, setGitForm] = useState({
    warehouse: "",
    recievedDate: "",
    refNo: "",
    vendor: Backdata._id,
  });

  const handleGitSubmit = async () => {
    if (!gitForm.warehouse || !gitForm.recievedDate || !gitForm.refNo) {
      ErrorMessage("All fields are required");
      return;
    }

    setGitOpen(false);
    plsWait("Setting things up...");

    try {
      const request = await api.post(`/api/Transit`, gitForm);

      const res = request.data || {};

      if (res.newPurchase) {
        router.push(`/${path.auth}/V4/Transit/Transit/${res.newPurchase}`);
      } else {
        ErrorMessage(res.error || request.error || "Failed to create G.I.T request");
      }
    } catch (err) {
      ErrorMessage("An error occurred");
    }
  };

  // ==================== Post Payment ====================
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    reference: "",
    type: "",
    location: "",
  });

  const handlePaymentSubmit = async () => {
    if (!paymentForm.amount || !paymentForm.date || !paymentForm.type || !paymentForm.reference) {
      ErrorMessage("Amount, Date, Bank Journal, and Reference are required");
      return;
    }

    setPaymentOpen(false);
    plsWait("Registering Vendor payment…");

    try {
      const response = await api.post(`/api/Payable/Payment`, {
          vendor: Dencrypt(Backdata._id),
          Amount: paymentForm.amount,
          PaymentDate: paymentForm.date,
          billReferenceNo: `VND-PYMT-${paymentForm.reference}`,
          bankAccount: Dencrypt(paymentForm.type),
          location: paymentForm.location ? Dencrypt(paymentForm.location) : "",
          AccountatntId: `${userInfo.user.firstName} ${userInfo.user.lastName}`,
        });

      const data = response.data || {};

      if (!response.ok) throw new Error(data.error || response.error || "Payment failed");

      SuccessToast("Payment Registered and pending approval");
      window.location.href = `/${path.auth}/V4/accounting/accounting/vendorsPayment/${data.data}`;
    } catch (err) {
      ErrorMessage(err.message || "Something went wrong");
    }
  };

  return (
    <>
      <div className="p-4 sm:p-6 rounded-xl shadow-xl border">
        <form className="space-y-8" onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h4 className="text-xl sm:text-2xl font-bold break-words min-w-0">
              {Backdata.Name?.charAt(0).toUpperCase() + Backdata.Name?.slice(1)}
            </h4>
            <div className="px-6 py-2 rounded-full font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              ₦{Number(Backdata.Balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            {!formData.block_vendor && userInfo.user.raiseLpo && (
              <>
                {/* New Purchase Order */}
                <Dialog open={poOpen} onOpenChange={setPoOpen}>
                  <DialogTrigger asChild>
                    <Button variant="default" className="flex items-center gap-3">
                      <ShoppingBagIcon className="h-5 w-5" />
                      New Purchase Order
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>New Purchase Order</DialogTitle>
                      <DialogDescription>Fill in the details below</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Store / Warehouse</Label>
                        <Select onValueChange={(v) => setPoForm((prev) => ({ ...prev, warehouse: v }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select warehouse" />
                          </SelectTrigger>
                          <SelectContent>
                            {wh.map((w) => (
                              <SelectItem key={w._id} value={w._id}>
                                {w.WHName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Received Date</Label>
                        <Input
                          type="date"
                          value={poForm.recievedDate}
                          onChange={(e) => setPoForm((prev) => ({ ...prev, recievedDate: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Reference No</Label>
                        <Input
                          placeholder="Enter reference number"
                          value={poForm.refNo}
                          onChange={(e) => setPoForm((prev) => ({ ...prev, refNo: e.target.value }))}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setPoOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handlePoSubmit}>Submit</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* New G.I.T Request */}
                <Dialog open={gitOpen} onOpenChange={setGitOpen}>
                  <DialogTrigger asChild>
                    <Button variant="default" className="flex items-center gap-3">
                      <ShoppingCartIcon className="h-5 w-5" />
                      New G.I.T Request
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>New G.I.T Request</DialogTitle>
                      <DialogDescription>Fill in the details below</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Inbound Store</Label>
                        <Select onValueChange={(v) => setGitForm((prev) => ({ ...prev, warehouse: v }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select warehouse" />
                          </SelectTrigger>
                          <SelectContent>
                            {wh.map((w) => (
                              <SelectItem key={w._id} value={w._id}>
                                {w.WHName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Shipment Date</Label>
                        <Input
                          type="date"
                          value={gitForm.recievedDate}
                          onChange={(e) => setGitForm((prev) => ({ ...prev, recievedDate: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Reference No</Label>
                        <Input
                          placeholder="Enter reference number"
                          value={gitForm.refNo}
                          onChange={(e) => setGitForm((prev) => ({ ...prev, refNo: e.target.value }))}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setGitOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleGitSubmit}>Submit</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            )}

            {/* Post Payment */}
            {AccountingFinder && !formData.block_vendor && userInfo.user.postVendorPayment && (
              <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
                <DialogTrigger asChild>
                  <Button variant="default" className="flex items-center gap-3">
                    <BanknotesIcon className="h-5 w-5" />
                    Pay Supplier
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Register Payment</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>Amount (₦)</Label>
                      <Input
                        type="number"
                        value={paymentForm.amount}
                        onChange={(e) => setPaymentForm((prev) => ({ ...prev, amount: e.target.value }))}
                        placeholder="Enter amount"
                      />
                    </div>
                    <div>
                      <Label>Payment Date</Label>
                      <Input
                        type="date"
                        value={paymentForm.date}
                        onChange={(e) => setPaymentForm((prev) => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Reference</Label>
                      <Input
                        value={paymentForm.reference}
                        onChange={(e) => setPaymentForm((prev) => ({ ...prev, reference: e.target.value }))}
                        placeholder="Reference number"
                      />
                    </div>
                    <div>
                      <Label>Payment Journal</Label>
                      <Select onValueChange={(v) => setPaymentForm((prev) => ({ ...prev, type: v }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select bank/journal" />
                        </SelectTrigger>
                        <SelectContent>
                          {banks.map((bank) => (
                            <SelectItem key={bank._id} value={bank._id}>
                              {bank.NAME}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Select onValueChange={(v) => setPaymentForm((prev) => ({ ...prev, location: v }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          {Locations.map((loc) => (
                            <SelectItem key={loc._id} value={loc._id}>
                              {loc.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setPaymentOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handlePaymentSubmit}>Submit Payment</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Vendor Information */}
          <div className="border-b border-gray-200 pb-12">
            <h2 className="text-lg font-semibold ">Vendor Information</h2>
            <p className="mt-1 text-sm ">Ensure to provide correct information.</p>

            <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <Label htmlFor="Name">Name</Label>
                <Input id="Name" name="Name" value={formData.Name || ""} onChange={handleChange} required />
              </div>

              <div className="sm:col-span-2 sm:col-start-1">
                <Label htmlFor="Categories">Vendor Category</Label>
                <Select value={formData.Categories} onValueChange={(v) => setFormData((prev) => ({ ...prev, Categories: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Retail">Retail</SelectItem>
                    <SelectItem value="Distribution">Distribution</SelectItem>
                    <SelectItem value="Wholesale">Wholesale</SelectItem>
                    <SelectItem value="Manufacturer">Manufacturer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="email">Vendor Email</Label>
                <Input id="email" name="email" type="email" value={formData.email || ""} onChange={handleChange} />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="vendor_tel">Telephone Number</Label>
                <Input id="vendor_tel" name="vendor_tel" value={formData.vendor_tel || ""} onChange={handleChange} />
              </div>

              <div className="sm:col-span-2 sm:col-start-1">
                <Label htmlFor="Address">Address</Label>
                <Input id="Address" name="Address" value={formData.Address || ""} onChange={handleChange} />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="Account_num">Account Number</Label>
                <Input id="Account_num" name="Account_num" value={formData.Account_num || ""} onChange={handleChange} />
              </div>

              <div className="sm:col-span-2 sm:col-start-1">
                <Label htmlFor="Account_name">Account Title</Label>
                <Input id="Account_name" name="Account_name" value={formData.Account_name || ""} onChange={handleChange} />
              </div>

              <div className="sm:col-span-2 sm:col-start-1">
                <Label htmlFor="Bank_name">Bank Name</Label>
                <Input id="Bank_name" name="Bank_name" value={formData.Bank_name || ""} onChange={handleChange} />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="block_vendor">Block this vendor?</Label>
                <div className="mt-3">
                  <input
                    type="checkbox"
                    id="block_vendor"
                    name="block_vendor"
                    checked={formData.block_vendor || false}
                    onChange={handleChange}
                    className="h-5 w-5 rounded border-gray-300 text-indigo-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {user.user.editVendor && (
            <Button type="submit" size="lg">
              Update {formData.Name}
            </Button>
          )}
        </form>
      </div>
    </>
  );
}