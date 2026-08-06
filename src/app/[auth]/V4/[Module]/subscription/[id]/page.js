"use client";

import React, { useState, useEffect, Suspense, lazy } from "react";
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
import { Switch } from "@/components/ui/switch"
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
import Link from "next/link"
import {useParams} from "next/navigation"
import {Encrypt, Dencrypt} from "../../../../../../../Functions/Functions";


export default function Page({ data, baseUrl, subscribers }) {
  const [formData, setFormData] = useState({
    title: "",
    plan: "",
    fee: "",
    status: "",
    completionDate: "",
    description: "",
  });
  const path = useParams()

  useEffect(() => {
    if (data) {
      setFormData({
        title: data.title || "",
        plan: data.plan || "",
        fee: data.fee || "",
        status: data.status || "",
        completionDate: data.completionDate || "",
        description: data.description || "",
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
      alert("Failed to update");
    }
  };

  if (!data) {
    return <div className="p-6 text-muted-foreground">No data available</div>;
  }

  return (
    <Suspense fallback={<SuspenenseFallBack pagedata={`${formData.title}`} />}>
      <div className="">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl"> {formData.title} </CardTitle>
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
              {/* Main Fields - Grid */}
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

                {/* Plan */}
                <div className="space-y-2">
                  <Label htmlFor="plan">Payment Schedul</Label>
                  <h5>{formData.plan}</h5>
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

                {/* Status - Dropdown */}
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
              </div>

              {/* Description - Full width */}
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

              <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Settings</Label>
              </div>

              <div className="flex items-center space-x-2">
              <Switch
                id="create-invoice-after-subscription"
                // checked={enabled}
                // onCheckedChange={setEnabled}
              />
                <Label htmlFor="create-invoice-after-subscription">
                  Generate debit reciept after subscription job triggered.
                </Label>
              </div>

              {/* Additional Cost Notice */}
              <div className="mt-6 pt-4 border-t border-border bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4">
                <div className="flex gap-3">
                    <Switch
                      id="Whatsapp"
                      // checked={enabled}
                      // onCheckedChange={setEnabled}
                    />
                  <div className="text-sm">
                    <Label htmlFor="" className="font-medium text-amber-700 dark:text-amber-400">
                      Send credit reciept via Whatsapp
                    </Label>
                    <p className="text-amber-600/80 dark:text-amber-500">
                      This service may attract extra charges.
                    </p>
                  </div>
                </div>
              </div>

               <div className="space-y-2">
                <Label htmlFor="completionDate">Assign Contract</Label>
                <select
                  id="completionDate"
                  name="completionDate"
                  value={formData.completionDate}
                  onChange={handleChange}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select a contract</option>
                  <option value="1">Contract 1</option>
                  <option value="2">Contract 2</option>
                  <option value="3">Contract 3</option>
                  {/* Add more options as needed */}
                </select>
              </div>

              {/* settings */}

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
                          subscribers.map((subscriber) => (
                            <>
                            <TableRow key={subscriber._id}>
                              <TableCell className="font-medium">
                                <Link className="text-indigo-300" href={`/${path.auth}/V4/contract/contract/${Encrypt(subscriber._id)}`}>{subscriber.Username ?? ""}</Link>
                              </TableCell>

                              <TableCell>{subscriber.Email || "-"}</TableCell>

                              <TableCell>
                                {subscriber.phone || "-"}
                              </TableCell>

                              <TableCell className="text-right">
                                ₦{Number(subscriber.Debt || 0).toLocaleString()}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Total</TableCell>
                              <TableCell></TableCell>
                              <TableCell></TableCell>
                              <TableCell className="text-right">
                                <Badge
                                  variant={
                                    Number(subscriber.Debt || 0) > 0
                                      ? "destructive"
                                      : "secondary"
                                  }
                                >
                                  ₦
                                   {subscribers ? subscribers.reduce((acc, subscriber) => acc + Number(subscriber.Debt || 0), 0).toLocaleString() : "0"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                            </>
                          ))
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
                  <span className="font-mono text-xs">{data._id}</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-end gap-3 border-t pt-6">
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
