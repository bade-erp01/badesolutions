"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { NewspaperIcon } from "@heroicons/react/24/outline";
import { ErrorMessage, SuccessToast, plsWait } from "../../../Functions/Mics";
import api from "@/lib/api";

export default function DeliveryModal({ id, user, business }) {
  const [open, setOpen] = useState(false);

  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryFee, setDeliveryFee] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverNumber, setDriverNumber] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [deliveryRemarks, setDeliveryRemarks] = useState("");

  // the business's delivery fees (Settings → Delivery Fees), offered as choices; any other
  // amount can still be typed in
  const [fees, setFees] = useState(null);
  useEffect(() => {
    if (!open || fees !== null) return;
    (async () => {
      const r = await api.get("/api/DeliveryFees");
      setFees(r.ok ? (r.data?.data || []).filter((f) => f.active).sort((a, b) => a.price - b.price || a.name.localeCompare(b.name)) : []);
    })();
  }, [open, fees]);
  const naira = (n) => `₦${Number(n || 0).toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;
  const pickedFee = (fees || []).find((f) => deliveryFee !== "" && Number(deliveryFee) === Number(f.price));

  const handleSubmit = async () => {
    if (!deliveryDate || !driverName || !driverNumber || !deliveryFee || !plateNumber) {
      ErrorMessage("Please fill in all required fields.");
      return;
    }

    plsWait("Generating Invoice...");

    const deliveryData = {
      DELIVERYDATE: deliveryDate,
      DriverName: driverName,
      DriverNumber: driverNumber,
      shippingFee: parseFloat(deliveryFee),
      vehicleNumber: plateNumber,
      DeliveryComment: deliveryRemarks,
      billId: id,
      userId: user._id,
      WayBillNo: `WB${Math.floor(Math.random() * 12345)}${plateNumber.substring(0, 3)}`
    };

    const url = `/api/delivery/${id}/${user.firstName}`;

    try {
      const response = await api.patch(url, deliveryData, {
        headers: {
          "idempotency-key": `delivery-${id}`,
        },
      });
      if (response.status === 0) throw new Error(response.error);

      if (response.ok) {
        SuccessToast("Invoice generated successfully!");
        setOpen(false); // close modal after success
        window.location.reload();
      } else {
        ErrorMessage("Failed to generate WayBill.");
      }
    } catch (error) {
      ErrorMessage("An error occurred while generating WayBill.");
    }
  };

  return (
    <>
      {/* Trigger button */}
      <button
        title="Convert to Invoice and Generate WayBill"
        onClick={() => setOpen(true)}
        className="group inline-flex items-center gap-3 px-3 py-3 rounded-lg bg-gray-600 text-gray-100 font-semibold border border-gray-200 hover:shadow-lg hover:border-gray-400 hover:text-white transition duration-200 ease-in-out mr-1"
      >
        <NewspaperIcon className="w-5 h-5" />
        <span>Generate Invoice</span>
      </button>

      {/* Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold ">
              Invoice Details
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-left ">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="mb-2">Invoice Date *</Label>
                <Input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
              </div>
              <div>
                <Label className="mb-2" htmlFor="delivery-fee">Delivery Fee *</Label>
                {fees?.length > 0 && (
                  <select
                    aria-label="Choose one of your delivery fees"
                    className="mb-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base sm:text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={pickedFee?._id || ""}
                    onChange={(e) => {
                      const f = fees.find((x) => x._id === e.target.value);
                      if (f) setDeliveryFee(String(f.price));
                    }}
                  >
                    <option value="">{deliveryFee === "" ? "Choose a delivery fee…" : "Other amount (typed below)"}</option>
                    {fees.map((f) => (
                      <option key={f._id} value={f._id}>
                        {f.name} — {naira(f.price)}
                      </option>
                    ))}
                  </select>
                )}
                <Input
                  id="delivery-fee"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  placeholder={fees?.length ? "or type another amount" : "0.00"}
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="mb-2">Driver Name *</Label>
                <Input type="text" placeholder="Enter full name" value={driverName} onChange={(e) => setDriverName(e.target.value)} />
              </div>
              <div>
                <Label className="mb-2">Driver Contact *</Label>
                <Input type="tel" placeholder="+1 (555) 000-0000" value={driverNumber} onChange={(e) => setDriverNumber(e.target.value)} />
              </div>
            </div>

            <div>
              <Label className="mb-2">Vehicle Plate Number *</Label>
              <Input type="text" placeholder="e.g., ABC-1234" className="uppercase" value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} />
            </div>

            <div>
              <Label className="mb-2">Invoice Remarks</Label>
              <Textarea placeholder="Add any special instructions..." value={deliveryRemarks} onChange={(e) => setDeliveryRemarks(e.target.value)} />
            </div>

            <p className="text-xs  mt-3">* Required fields</p>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Convert to Invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
