"use client";

import { Dencrypt, Encrypt } from "../../../../../../../../Functions/Functions";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { plsWait, ErrorMessage, SuccessToast } from "../../../../../../../../Functions/Mics";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export default function Page({ staffs, store, currentStoreKeeper, EXPRESS_PRIVATE_URL, userId, SessionId }) {
  const Router = useRouter();

  const parsedStaffs = useMemo(() => {
    try {
      return JSON.parse(staffs);
    } catch {
      return [];
    }
  }, [staffs]);

  const [formData, setFormData] = useState({
    WHName: store.WHName || "",
    Email: store.Email || "",
    Address: store.Address || "",
    Status: store.Status || false,
    limit: store.limit?.$numberDecimal || "0",
    StoreManager: store.StoreManager || "",
    StoreKeeper: store.StoreKeeper || "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSwitchChange = (checked) => {
    setFormData((prev) => ({ ...prev, Status: checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    plsWait("Saving store settings...");

    try {
      const response = await fetch(`${EXPRESS_PRIVATE_URL}/api/warehouse/edit/${Encrypt(store._id)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(store.tenantId)}`,
          access: userId,
          sessionKey: `Bearer ${Encrypt(SessionId)}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update store");

      const data = await response.json();
      SuccessToast(data.result || "Store settings updated successfully");
      Router.refresh();
    } catch (error) {
      ErrorMessage(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {store.WHName?.toUpperCase()} Settings
          </CardTitle>
          <CardDescription>
            Manage warehouse information and assignments
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Store Name */}
              <div className="space-y-2">
                <Label htmlFor="WHName">Store Name</Label>
                <Input
                  id="WHName"
                  name="WHName"
                  value={formData.WHName}
                  onChange={handleChange}
                  placeholder="Main Warehouse"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="Email">Email Address or Tel.</Label>
                <Input
                  id="Email"
                  name="Email"
                  type="text"
                  value={formData.Email}
                  onChange={handleChange}
                  placeholder="warehouse@example.com"
                />
              </div>

              {/* Address */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="Address">Physical Address</Label>
                <Input
                  id="Address"
                  name="Address"
                  value={formData.Address}
                  onChange={handleChange}
                  placeholder="123 Warehouse Street, Abuja"
                />
              </div>

              {/* Status */}
              <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                <div>
                  <Label>Store Status</Label>
                  <p className="text-sm text-muted-foreground">
                    {formData.Status ? "Active and operational" : "Currently inactive"}
                  </p>
                </div>
                <Switch
                  checked={formData.Status}
                  onCheckedChange={handleSwitchChange}
                />
              </div>

              {/* Limit */}
              <div className="space-y-2">
                <Label htmlFor="limit">Stock Limit</Label>
                <Input
                  id="limit"
                  name="limit"
                  type="number"
                  step="any"
                  value={formData.limit}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>

              {/* Store Manager */}
              <div className="space-y-2">
                <Label>Store Manager</Label>
                <Select
                  name="StoreManager"
                  value={formData.StoreManager}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, StoreManager: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Store Manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {parsedStaffs.map((staff) => (
                      <SelectItem key={staff._id} value={staff._id}>
                        {staff.firstName} {staff.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Store Keeper */}
              <div className="space-y-2">
                <Label>Store Keeper</Label>
                <Select
                  name="StoreKeeper"
                  value={formData.StoreKeeper}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, StoreKeeper: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Store Keeper" />
                  </SelectTrigger>
                  <SelectContent>
                    {parsedStaffs.map((staff) => (
                      <SelectItem key={staff._id} value={staff._id}>
                        {staff.firstName} {staff.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit" size="lg" disabled={isLoading}>
                {isLoading ? "Saving Changes..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}