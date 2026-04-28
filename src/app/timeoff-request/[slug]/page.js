"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDays } from "lucide-react";
import {plsWait,ErrorMessage, SuccessToast} from "../../../../Functions/Mics";
import {Encrypt} from "../../../../Functions/Functions";
import { useRouter } from "next/navigation";

export default function Page({user,baseUrl}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    leaveType: "",
    days: 0,
    startDate: "",
    endDate: "",
    description: "",
    RefNo: `REF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,

  });
  const router = useRouter();
  const leaveType =  [
        "Annual Leave",
        "Maternity Leave",
        "Paternity Leave",
        "Sick Leave",
        "Casual Leave",
        "Study Leave",
        "Unpaid Leave",
      ]

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      plsWait("Submitting your request...");
      setLoading(true);

      const res = await fetch(`${baseUrl}/api/timeoff`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(user.tenantId)}`,
          access: `${Encrypt(user._id)}`,
        },
        body: JSON.stringify(Encrypt(form)),
      });

      if (!res.ok) throw new Error("Failed to submit request");

      const data = await res.json();
      console.log("Submitted:", data);

      SuccessToast("Request submitted successfully");

      setForm({
        leaveType: "",
        days: 0,
        startDate: "",
        endDate: "",
        description: "",
        RefNo: `REF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      });
    } catch (err) {
      console.error(err);
      ErrorMessage("Submission failed");
    } finally {
      router.refresh();
    }
  };

  return (
    <main className="min-h-screen bg-zinc-100 flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-3xl shadow-2xl rounded-3xl border-zinc-200">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 text-white">
            <CalendarDays className="h-7 w-7" />
          </div>
          <CardTitle className="text-3xl font-semibold tracking-tight text-zinc-900">
            Time Off Request
          </CardTitle>
          <CardDescription className="text-base text-zinc-600 max-w-xl mx-auto">
            Submit your leave request for approval. Complete the form below.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="">
              <div className="space-y-2">
                <Label>Full Name</Label>
               <p className="font-semibold p-1 w-full border rounded"> {user.firstName} {user.lastName}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Days Assigned</Label>
               <p className="text-sm p-1 "> {user.LeaveDaysCount || 0} days Left</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Reference No:</Label>
               <p className="text-sm p-1 font-bold"> {form.RefNo }</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Request Type</Label>
                <Select
                  onValueChange={(val) => handleChange("leaveType", val)}
                  value={form.leaveType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveType.map((element) => (
                      <SelectItem key={element} value={element}>{element}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Number of Days</Label>
                <Input
                  type="number"
                  value={form.days}
                  onChange={(e) => handleChange("days", e.target.value)}
                  placeholder="e.g. 5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => handleChange("endDate", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Reason / Notes</Label>
              <Textarea
                className="min-h-[140px]"
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Provide details..."
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
             {user.LeaveDaysCount && (
               <Button
                type="submit"
                className="flex-1 rounded-2xl h-12 text-base"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Request"}
              </Button>
            )}
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}