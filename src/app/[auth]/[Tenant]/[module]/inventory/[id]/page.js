'use client';

import { EXPRESS_PRIVATE_URL } from "../../../../../../../Functions/Functions";
import Image from "next/image";
import { useState } from "react";
import {
  plsWait,
  Encrypt,
  SuccessToast,
  ErrorMessage,
} from "../../../../../../../Functions/Mics";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function SingleStoreProductpage({ storeProduct, userInfo }) {
  const router = useRouter();
  const [formData, setFormData] = useState({ ...storeProduct });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : Number(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      plsWait("Updating Fields...");
      const response = await axios.patch(
        `${EXPRESS_PRIVATE_URL}/api/Adjust/Product/${Encrypt(formData._id)}`,
        {
          currentQty: formData.currentQty,
          pcs: formData.pcs,
          isActivated: formData.isActivated,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Encrypt(userInfo.business.tenantId)}`,
            access: `${Encrypt(userInfo.user._id)}`,
            sessionKey: `Bearer ${Encrypt(userInfo.SessionId)}`
          },
        }
      );

      if (response.data.message) {
        SuccessToast(response.data.message);
        router.refresh();
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      ErrorMessage("Update failed: " + error.message);
    }
  };

  return (
    <div className="m-5 p-4 rounded shadow-2xl border bg-white">
      <h2 className="text-sm font-bold text-gray-800">
        {storeProduct.productName}
      </h2>

      <div className="w-full flex justify-center">
        <Image
          src={storeProduct.image || "/preview.png"}
          alt="Product Image"
          width={180}
          height={180}
          className="rounded-lg object-contain"
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CASE */}
          <div>
            <Label htmlFor="currentQty" className={'text-black'}>CASE</Label>
            <Input
              type="number"
              id="currentQty"
              name="currentQty"
              value={formData.currentQty}
              onChange={handleChange}
              className="text-black"
            />
          </div>

          {/* PCS */}
          <div>
            <Label htmlFor="pcs" className={'text-black'}>PCS</Label>
            <Input
              type="number"
              id="pcs"
              name="pcs"
              value={formData.pcs}
              onChange={handleChange}
              className="text-black"
            />
          </div>

          {/* isActivated toggle */}
          <div className="col-span-2 flex items-center space-x-2 pt-2">
            <Switch
              id="isActivated"
              checked={formData.isActivated}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isActivated: checked }))
              }
            />
            <Label htmlFor="isActivated">
              {formData.isActivated ? "Activated" : "Deactivated"}
            </Label>
          </div>
        </div>

        {userInfo?.user?.isAdmin && !formData?.FOCProId && (
          <div className="space-y-2">
            <p className="text-xs text-yellow-700 bg-yellow-100 border border-yellow-300 rounded-md px-4 py-2">
              ⚠️ Ensure this product is <strong>not being billed</strong> when the update is performed.
            </p>
            <Button type="submit" variant="default" className="cursor-pointer">
              Update Product
            </Button>
          </div>
        )}
      </form>

      {/* Audit Log */}
      <Card className="mt-10">
        <CardHeader>
          <CardTitle>Audit Log</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-6 pl-6 border-l border-gray-300">
              {storeProduct.ActivitiyLog?.map((log, index) => (
                <div key={index} className="relative">
                  <div className="absolute -left-3 top-1 w-3 h-3 bg-gray-500 rounded-full"></div>
                  <div className="text-xs text-gray-700">
                    <p className="font-medium">{log.message}</p>
                    {log.timestamp && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
