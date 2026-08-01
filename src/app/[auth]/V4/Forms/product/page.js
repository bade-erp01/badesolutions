"use client";

import { useState } from "react";
import {
  plsWait,
  SuccessToast,
  ErrorMessage,
} from "../../../../../../Functions/Mics";
import { Encrypt } from "../../../../../../Functions/Functions";
import axios from "axios";
import { useRouter,useParams } from "next/navigation";
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
import { Loader2 } from "lucide-react";   // ← Add this import

export default function ProductForm({
  userData,
  businessData,
  VendorList,
  EXPRESS_PRIVATE_URL,
}) {
  const [user] = useState(userData);
  const [business] = useState(businessData);
  const router = useRouter();
  const Path = useParams()

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
  });

  const [isLoading, setIsLoading] = useState(false);   // ← New state

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

  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Encrypt(businessData.tenantId)}`,
      access: `${Encrypt(userData._id)}`,
      sessionKey: `Bearer ${Encrypt(userData.SessionId)}`,
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);     // ← Start loading

    try {
      plsWait("Creating Product...");

      const url = `${EXPRESS_PRIVATE_URL}/api/Product/Create-new`;

      const { data } = await axios.post(url, formData, config);

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
        });

        router.push(
          `/${Path.auth}/V4/product/product/${data.data}`
        );
      } else {
        throw new Error(data.error || "Unexpected error occurred.");
      }
    } catch (error) {
      ErrorMessage("Failed to create product.");
    } finally {
      setIsLoading(false);    // ← Stop loading
    }
  };

  return (
    <div className="">
      <div className="">
        <Card className="shadow-xl">
          <CardHeader className=" rounded-t-lg">
            <CardTitle className="text-3xl">Create Product</CardTitle>
            <p className=" mt-2">
              Ensure to provide correct information for your product
            </p>
          </CardHeader>
          <Separator/>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Product Information */}
              <div>
                <h3 className="text-lg font-semibold mb-6 pb-2 border-b">
                  Product Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      onValueChange={(value) => handleSelectChange("Vendor", value)}
                      disabled={isLoading}
                      required
                    >
                      <SelectTrigger>
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

                  <div className="flex items-center gap-8 pt-6 lg:col-span-3">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="Sellable"
                        checked={formData.Sellable}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("Sellable", !!checked)
                        }
                        disabled={isLoading}
                      />
                      <Label htmlFor="Sellable" className="cursor-pointer font-medium">
                        Sell on ERP
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="Ecom_sale"
                        checked={formData.Ecom_sale}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("Ecom_sale", !!checked)
                        }
                        disabled={isLoading}
                      />
                      <Label htmlFor="Ecom_sale" className="cursor-pointer font-medium">
                        Sell on E-commerce
                      </Label>
                    </div>
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
                  <Button 
                    type="submit" 
                    size="lg" 
                    disabled={isLoading}
                  >
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