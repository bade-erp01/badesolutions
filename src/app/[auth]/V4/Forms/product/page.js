"use client";

import { useState } from "react";
import {
  plsWait,
  SuccessToast,
  ErrorMessage,
} from "../../../../../../Functions/Mics";
import api from "@/lib/api";
import { useRouter, useParams } from "next/navigation";
// shadcn/ui components
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function ProductForm({
  userData,
  businessData,
  VendorList,
  EXPRESS_PRIVATE_URL,
}) {
  const [user] = useState(userData);
  const [business] = useState(businessData);
  const router = useRouter();
  const Path = useParams();

  const [formData, setFormData] = useState({
    Name: "",
    UOM: "",
    category: "",
    Vendor: "",
    color: "#000000",
    Description: "",
    Sellable: true,
    Ecom_sale: false,
    Manufacturer: "",
    VAT: 0,
    Pieces: 1,
    BuyingPrice: 0,
    Manufacture_code: "",
    Nafdac: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleCheckboxChange = (name, checked) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      plsWait("Creating Product...");

      const r = await api.post("/api/Product/Create-new", formData);
      if (!r.ok) throw new Error(r.error);
      const { data } = r;

      if (data.Message) {
        SuccessToast(data.Message);

        // Reset form
        setFormData({
          Name: "",
          UOM: "",
          category: "",
          Vendor: "",
          color: "#000000",
          Description: "",
          Sellable: true,
          Ecom_sale: false,
          Manufacturer: "",
          VAT: 0,
          Pieces: 1,
          BuyingPrice: 0,
          Manufacture_code: "",
          Nafdac: "",
        });

        router.push(`/${Path.auth}/V4/product/product/${data.data}`);
      } else {
        throw new Error(data.error || "Unexpected error occurred.");
      }
    } catch (error) {
      ErrorMessage("Failed to create product.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="">
      <div className="">
        <Card className="shadow-xl">
          <CardHeader className="rounded-t-lg">
            <CardTitle className="text-2xl sm:text-3xl">Create Product</CardTitle>
            <p className="mt-2">
              Ensure to provide correct information for your product
            </p>
          </CardHeader>
          <Separator />

          <CardContent className="p-4 sm:p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Product Information */}
              <div>
                <h3 className="text-lg font-semibold mb-6 pb-2 border-b">
                  Product Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="Name">Product Name</Label>
                    <Input
                      id="Name"
                      name="Name"
                      required
                      placeholder="e.g., Wireless Headphones"
                      value={formData.Name}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      name="category"
                      placeholder="e.g., Electronics"
                      value={formData.category}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="BuyingPrice">Vendor Price</Label>
                    <Input
                      id="BuyingPrice"
                      name="BuyingPrice"
                      type="number"
                      step="any"
                      required
                      placeholder="0.00"
                      value={formData.BuyingPrice}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="Manufacturer">Manufacturer</Label>
                    <Input
                      id="Manufacturer"
                      name="Manufacturer"
                      placeholder="Manufacturer name"
                      value={formData.Manufacturer}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="Pieces">Pieces in Carton</Label>
                    <Input
                      id="Pieces"
                      name="Pieces"
                      type="number"
                      required
                      placeholder="0"
                      value={formData.Pieces}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="Vendor">Vendor</Label>
                    <Select
                      value={formData.Vendor}
                      onValueChange={(value) =>
                        handleSelectChange("Vendor", value)
                      }
                      disabled={isLoading}
                      required
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Vendor..." />
                      </SelectTrigger>
                      <SelectContent>
                        {VendorList.map((vendor) => (
                          <SelectItem key={vendor._id} value={vendor._id}>
                            {vendor.Name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="UOM">Unit of Measure</Label>
                    <Input
                      id="UOM"
                      name="UOM"
                      placeholder="e.g., pcs, kg, box"
                      value={formData.UOM}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>

                  {/* ========== NEW FIELDS ========== */}
                  <div className="space-y-2">
                    <Label htmlFor="Manufacture_code">Manufacture Code (Barcode)</Label>
                    <Input
                      id="Manufacture_code"
                      name="Manufacture_code"
                      placeholder="e.g., 6154000412715"
                      value={formData.Manufacture_code}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="Nafdac">NAFDAC Number</Label>
                    <Input
                      id="Nafdac"
                      name="Nafdac"
                      placeholder="NAFDAC registration number"
                      value={formData.Nafdac}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                  {/* ========== END NEW FIELDS ========== */}

                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      name="color"
                      type="color"
                      className="h-10 p-1 cursor-pointer"
                      value={formData.color}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="VAT">VAT (%)</Label>
                    <Input
                      id="VAT"
                      name="VAT"
                      type="number"
                      step="any"
                      placeholder="0"
                      value={formData.VAT}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>

                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Description</h3>
                <Textarea
                  id="Description"
                  name="Description"
                  placeholder="Write a simple and concise description about this product..."
                  value={formData.Description}
                  onChange={handleChange}
                  className="min-h-[120px] resize-y"
                  disabled={isLoading}
                />
              </div>

              {/* Submit Button with Loading */}
              <div className="flex justify-end pt-6 border-t">
                {user.createProduct && (
                  <Button type="submit" size="lg" disabled={isLoading} className="w-full sm:w-auto">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Creating Product...
                      </>
                    ) : (
                      "Create Product"
                    )}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}