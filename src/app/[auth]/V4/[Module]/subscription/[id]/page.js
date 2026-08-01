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

export default function Page({ data, baseUrl, subscribers }) {
  const [formData, setFormData] = useState({
    title: "",
    plan: "",
    fee: "",
    status: "",
    completionDate: "",
    description: "",
  });

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
      console.error(error);
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
                          <TableHead>Username</TableHead>
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
                            <TableRow key={subscriber._id}>
                              <TableCell className="font-medium">
                                {subscriber.Username ?? ""}
                              </TableCell>

                              <TableCell>{subscriber.Email || "-"}</TableCell>

                              <TableCell>
                                {subscriber.phone || "-"}
                              </TableCell>

                              <TableCell className="text-right">
                                <Badge
                                  variant={
                                    Number(subscriber.debt || 0) > 0
                                      ? "destructive"
                                      : "secondary"
                                  }
                                >
                                  ₦
                                  {Number(subscriber.debt || 0).toLocaleString()}
                                </Badge>
                              </TableCell>
                            </TableRow>
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
