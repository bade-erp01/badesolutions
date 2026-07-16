"use client";
import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Encrypt } from "../../../Functions/Functions";
import { ErrorMessage, plsWait } from "../../../Functions/Mics";

// shadcn/ui components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function ProductTransfer({ Store, userData, baseUrl }) {
  const router = useRouter();
  const Params = useParams();

  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const getStore = (id) => {
    const WH = Store.find((str) => str._id === id);
    return WH?.WHName || "N/A";
  };

  const handleSubmit = async () => {
    if (!from || !to || !date) {
      ErrorMessage("Please select From, To and a valid Date.");
      return;
    }
    if (from === to) {
      ErrorMessage("From and To cannot be the same location.");
      return;
    }

    plsWait("Creating Transfer Request...");
    const request = await fetch(`${baseUrl}/api/Transfer`, {
      method: "POST",
      body: JSON.stringify({
        from,
        to,
        date,
        user: `${userData.user.firstName} ${userData.user.lastName}`,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
        access: `${Encrypt(userData.user._id)}`,
        sessionKey: `Bearer ${Encrypt(userData.SessionId)}`,
      },
    });

    const response = await request.json();

    if (request.ok) {
      setOpen(false);
      router.push(
        `/${Params.auth}/${Params.Tenant}/${Params.module}/Forms/transfer/${response.data}`
      );
    } else {
      ErrorMessage("Something went wrong");
    }
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            className="w-full flex items-center gap-3 font-semibold bg-black text-white hover:bg-zinc-800"
          >
            Start New Product Transfer
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>Schedule Product Transfer</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium">From</label>
                <Select onValueChange={setFrom}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select From" />
                  </SelectTrigger>
                  <SelectContent>
                    {Store.map((s) => (
                      <SelectItem key={s._id} value={s._id}>
                        {s.WHName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <label className="text-sm font-medium">To</label>
                <Select onValueChange={setTo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select To" />
                  </SelectTrigger>
                  <SelectContent>
                    {Store.map((s) => (
                      <SelectItem key={s._id} value={s._id}>
                        {s.WHName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Transfer Date</label>
              <Input
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <Card className="p-4 text-sm">
              <strong>Preview:</strong>
              <div className="flex justify-between mt-2">
                <span>From: {getStore(from)}</span>
                <span>To: {getStore(to)}</span>
                <span>Date: {date}</span>
              </div>
              {from && to && from === to && (
                <p className="text-red-600 text-xs mt-2">
                  Source and destination cannot be the same.
                </p>
              )}
            </Card>
          </div>

          <DialogFooter>
            <Button variant="default" onClick={handleSubmit}>Schedule Transfer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
