"use client";

import { useState } from "react";
import Image from "next/image";
import { plsWait, ErrorMessage, SuccessToast } from "../../../../../../../Functions/Mics";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

const ITEMS_PER_PAGE = 10;

export default function Page({ DecryptedAsset, StoreList, userInfo, users }) {
  const [Stores] = useState(StoreList);
  const [formData, setFormData] = useState(DecryptedAsset || {});
  const [user] = useState(userInfo);
  const [usersList] = useState(users || []);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  const activityLogs = DecryptedAsset?.AcivityLog || [];
  const totalPages = Math.ceil(activityLogs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedLogs = activityLogs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      plsWait("Updating asset...");
      const r = await api.patch(
        `/api/update/asset/${DecryptedAsset._id}`,
        formData
      );
      if (!r.ok) throw new Error(r.error);
      const data = r.data;

      if (data?.message) {
        SuccessToast("Asset updated successfully");
        router.refresh();
      } else {
        throw new Error(data?.error || "Update failed");
      }
    } catch (error) {
      ErrorMessage(error.message || "Something went wrong");
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex-1 p-0 sm:p-4 min-w-0">
        <Card className="shadow-xl border-0 flex flex-col">
          <form onSubmit={handleSubmit} className="flex flex-col flex-1">
            {/* Header */}
            <CardHeader className="border-b pb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="min-w-0">
                  <CardTitle className="text-2xl sm:text-3xl break-words">{formData.Name}</CardTitle>
                  <CardDescription className="mt-1">
                    Asset Code: <span className="font-mono font-medium">{formData.AssetCode}</span>
                  </CardDescription>
                </div>
                <Badge
                  variant={
                    formData.status === "Running"
                      ? "default"
                      : formData.status === "Sold"
                      ? "secondary"
                      : "destructive"
                  }
                  className="text-sm px-5 py-1.5"
                >
                  {formData.status}
                </Badge>
              </div>
            </CardHeader>

            {/* Scrollable Content Area */}
            <CardContent className="flex-1">
              {/* Image & Basic Info */}
              <div className="flex flex-col p-3 sm:flex-row items-start gap-6">
                <div className="w-40 h-40 rounded-2xl overflow-hidden border bg-muted flex-shrink-0">
                  <Image
                    height={70}
                    width={70}
                    src={formData.image || "https://img.icons8.com/stickers/100/decentralized-network.png"}
                    alt="Asset"
                    className="object-cover w-full h-full"
                    priority
                  />
                </div>

                <div className="space-y-4 flex-1 pt-2">
                  <div>
                    <Label className="text-muted-foreground">Current Location</Label>
                    <p className="text-lg sm:text-xl font-medium mt-1 break-words">{formData.Location?.WHName || "Not Assigned"}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2">
                <div className="space-y-2">
                  <Label htmlFor="Name">Asset Name</Label>
                  <Input
                    id="Name"
                    name="Name"
                    value={formData.Name || ""}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Location</Label>
                  <Select
                    value={formData.Location?._id || ""}
                    onValueChange={(value) => handleSelectChange("Location", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {Stores.map((store) => (
                        <SelectItem key={store._id} value={store._id}>
                          {store.WHName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Assigned To</Label>
                  <Select
                    value={formData.AssignedTo?._id || ""}
                    onValueChange={(value) => handleSelectChange("AssignedTo", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {usersList.map((u) => (
                        <SelectItem key={u._id} value={u._id}>
                          {u.firstName} {u.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="SerialNumber">Serial Number</Label>
                  <Input
                    id="SerialNumber"
                    name="SerialNumber"
                    value={formData.SerialNumber || ""}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="PurchasedValue">Purchase Value</Label>
                  <Input
                    id="PurchasedValue"
                    name="PurchasedValue"
                    type="number"
                    step="any"
                    min="0"
                    value={formData.PurchasedValue || 0}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ResidualValue">Residual Value</Label>
                  {!DecryptedAsset.runDepreciation ? (
                    <Input
                      id="ResidualValue"
                      name="ResidualValue"
                      type="number"
                      step="any"
                      min="0"
                      value={Number(formData.ResidualValue) || 0}
                      onChange={handleChange}
                      required
                    />
                  ) : (
                    <div className="px-4 py-2.5 bg-muted rounded-md text-sm">
                      {formData.ResidualValue?.$numberDecimal || "0.00"}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="PurchsedDate">Purchase Date</Label>
                  <Input
                    id="PurchsedDate"
                    name="PurchsedDate"
                    type="date"
                    value={formData.PurchsedDate || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Current Value</Label>
                  {!DecryptedAsset.runDepreciation ? (
                    <Input
                      name="CurrentValue"
                      type="number"
                      step="any"
                      value={formData.CurrentValue || 0}
                      onChange={handleChange}
                    />
                  ) : (
                    <div className="px-4 py-2.5 bg-muted rounded-md text-sm">
                      {DecryptedAsset?.CurrentValue || 0}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Category">Category</Label>
                  <Input
                    id="Category"
                    name="Category"
                    value={formData.Category || ""}
                    onChange={handleChange}
                    placeholder="Equipment, Furniture, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="usefulYear">Useful Life (Months)</Label>
                  {!DecryptedAsset.runDepreciation ? (
                    <Input
                      id="usefulYear"
                      name="usefulYear"
                      type="number"
                      min="0"
                      value={formData.usefulYear || 0}
                      onChange={handleChange}
                    />
                  ) : (
                    <div className="px-4 py-2.5 bg-muted rounded-md text-sm">
                      {DecryptedAsset?.usefulYear} months
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vendor">Supplier / Vendor</Label>
                  <Input
                    id="vendor"
                    name="vendor"
                    value={formData.vendor || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Depreciation Checkbox */}
              <div className="flex items-center space-x-3 bg-muted/50 p-4 rounded-xl">
                <Checkbox
                  id="runDepreciation"
                  name="runDepreciation"
                  checked={formData.runDepreciation || false}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, runDepreciation: checked }))
                  }
                />
                <Label htmlFor="runDepreciation" className="cursor-pointer font-medium">
                  Activate Depreciation Schedule
                </Label>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  placeholder="Additional information about this asset..."
                  rows={4}
                />
              </div>

              {/* Depreciation Schedule */}
              {activityLogs.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
                      <h3 className="font-semibold text-lg">Depreciation Schedule</h3>
                      <p className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                      </p>
                    </div>

                    <Card>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Depreciation Amount</TableHead>
                            <TableHead>Asset Value After</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedLogs.map((log, index) => (
                            <TableRow key={index}>
                              <TableCell>{log.Date}</TableCell>
                              <TableCell className="font-medium">
                                ₦{parseFloat(log.DepreciatedValue?.$numberDecimal || 0).toFixed(2)}
                              </TableCell>
                              <TableCell className="font-medium">
                                ₦{parseFloat(log.Assetvalue || 0).toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Card>
                  </div>
                </>
              )}

              {/* Submit Buttons */}
              {user.user.AssetManager && (
                <div className="pt-8 border-t mt-auto">
                  {DecryptedAsset.status === "Running" && (
                    <Button type="submit" size="lg" className="w-full sm:w-auto">
                      Save Changes
                    </Button>
                  )}

                  {DecryptedAsset.status !== "Running" && DecryptedAsset.AcivityLog?.length === 0 && (
                    <Button type="submit" variant="destructive" size="lg" className="w-full sm:w-auto">
                      Delete Asset
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}