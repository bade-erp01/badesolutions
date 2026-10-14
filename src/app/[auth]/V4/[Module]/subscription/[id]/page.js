"use client";

import React, { useState, useEffect, Suspense } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import SuspenenseFallBack from "@/app/Components/SuspenenseFallBack";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Encrypt } from "../../../../../../../Functions/Functions";

export default function Page({ data, baseUrl, subscribers }) {
  const [formData, setFormData] = useState({
    title: "",
    plan: "",
    fee: "",
    status: "",
    completionDate: "",
    description: "",
    generatDebit: false,
    Whatsapp: false,
    assignedContract: "",
  });

  const path = useParams();

  useEffect(() => {
    if (data) {
      setFormData({
        title: data.title || "",
        plan: data.plan || "",
        fee: data.fee ?? "",
        status: data.status || "",
        completionDate: data.completionDate ?? "",
        description: data.description || "",
        generatDebit: data.generatDebit ?? false,
        Whatsapp: data.Whatsapp ?? false,
        assignedContract: data.assignedContract || "",
      });
    }
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      status: value,
    }));
  };

  const handleContractChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      assignedContract: value,
    }));
  };

  const handleSwitchChange = (name, checked) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${baseUrl}/api/subscriptions/${data._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          fee: Number(formData.fee),
          completionDate: Number(formData.completionDate),
        }),
      });

      if (!res.ok) throw new Error("Update failed");
      alert("Updated successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to update");
    }
  };

  if (!data) {
    return <div className="p-6 text-muted-foreground">No data available</div>;
  }

  const totalDebt =
    subscribers?.reduce((acc, sub) => acc + Number(sub.Debt || 0), 0) || 0;

  return (
    <Suspense fallback={<SuspenenseFallBack pagedata={`${formData.title}`} />}>
      <div className="">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-xl min-w-0 break-words">{formData.title}</CardTitle>
              <Badge
                variant={
                  formData.status === "pending" ? "secondary" : "default"
                }
              >
                {formData.status || data.status}
              </Badge>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-8">
              {/* Main Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Plan (read-only) */}
                <div className="space-y-2">
                  <Label>Payment Schedule</Label>
                  <div className="flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm">
                    {formData.plan || "—"}
                  </div>
                </div>

                {/* Fee */}
                <div className="space-y-2">
                  <Label htmlFor="fee">Fee</Label>
                  <Input
                    id="fee"
                    name="fee"
                    type="number"
                    value={formData.fee}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label htmlFor="completionDate">Duration (Months)</Label>
                  <Input
                    id="completionDate"
                    name="completionDate"
                    type="number"
                    min={1}
                    value={formData.completionDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Assign Contract */}
                <div className="space-y-2">
                  <Label htmlFor="assignedContract">Assign Contract</Label>
                  <Select
                    value={formData.assignedContract}
                    onValueChange={handleContractChange}
                  >
                    <SelectTrigger id="assignedContract">
                      <SelectValue placeholder="Select a contract" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contract-1">Contract 1</SelectItem>
                      <SelectItem value="contract-2">Contract 2</SelectItem>
                      <SelectItem value="contract-3">Contract 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                />
              </div>

              <Separator />

              {/* Settings */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Settings</Label>

                {/* Generate Debit */}
                <div className="flex items-center space-x-3">
                  <Switch
                    id="generatDebit"
                    checked={formData.generatDebit}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("generatDebit", checked)
                    }
                  />
                  <Label htmlFor="generatDebit">
                    Generate debit receipt after subscription job is triggered
                  </Label>
                </div>

                {/* WhatsApp */}
                <div className="mt-4 pt-4 border-t border-border bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Switch
                      id="Whatsapp"
                      checked={formData.Whatsapp}
                      onCheckedChange={(checked) =>
                        handleSwitchChange("Whatsapp", checked)
                      }
                      className="mt-0.5"
                    />
                    <div className="text-sm">
                      <Label
                        htmlFor="Whatsapp"
                        className="font-medium text-amber-700 dark:text-amber-400"
                      >
                        Send credit receipt via WhatsApp
                      </Label>
                      <p className="text-amber-600/80 dark:text-amber-500 mt-1">
                        This service may attract extra charges.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Subscribers */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Subscribers</Label>
                  <Badge variant="secondary">
                    {subscribers?.length || 0} Subscriber
                    {subscribers?.length === 1 ? "" : "s"}
                  </Badge>
                </div>

                <Card className="shadow-none">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Customer</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead className="text-right">
                            Outstanding Bal.
                          </TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {subscribers?.length > 0 ? (
                          <>
                            {subscribers.map((subscriber) => (
                              <TableRow key={subscriber._id}>
                                <TableCell className="font-medium">
                                  <Link
                                    className="text-indigo-600 hover:underline"
                                    href={`/${path.auth}/V4/contract/contract/${Encrypt(
                                      subscriber._id
                                    )}`}
                                  >
                                    {subscriber.Username ?? "—"}
                                  </Link>
                                </TableCell>
                                <TableCell>{subscriber.Email || "—"}</TableCell>
                                <TableCell>{subscriber.phone || "—"}</TableCell>
                                <TableCell className="text-right">
                                  ₦
                                  {Number(subscriber.Debt || 0).toLocaleString()}
                                </TableCell>
                              </TableRow>
                            ))}

                            {/* Total row */}
                            <TableRow className="bg-muted/50 font-medium">
                              <TableCell>Total</TableCell>
                              <TableCell></TableCell>
                              <TableCell></TableCell>
                              <TableCell className="text-right">
                                <Badge
                                  variant={
                                    totalDebt > 0 ? "destructive" : "secondary"
                                  }
                                >
                                  ₦{totalDebt.toLocaleString()}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          </>
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="h-24 text-center text-muted-foreground"
                            >
                              No subscribers found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              {/* Activity Log */}
              <div className="space-y-2">
                <Label>Activity Log</Label>
                <div className="rounded-md border bg-muted/40 p-4 space-y-1.5">
                  {data.activityLog?.length > 0 ? (
                    data.activityLog.map((log, index) => (
                      <p key={index} className="text-sm text-muted-foreground">
                        • {log}
                      </p>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No activity yet
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Meta Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium text-foreground">Created:</span>{" "}
                  {new Date(data.createdAt).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium text-foreground">Updated:</span>{" "}
                  {new Date(data.updatedAt).toLocaleString()}
                </div>
                <div className="sm:col-span-2">
                  <span className="font-medium text-foreground">ID:</span>{" "}
                  <span className="font-mono text-xs break-all">
                    {typeof data._id === "object"
                      ? data._id.$oid || data._id
                      : data._id}
                  </span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-wrap justify-end gap-3 border-t pt-6">
              <Button type="button" variant="outline">
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Suspense>
  );
}