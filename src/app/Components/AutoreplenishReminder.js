"use client";

import React, { useState } from "react";

import { CheckCircleIcon } from "@heroicons/react/24/outline";

import { Encrypt } from "../../../Functions/Functions";

import {
  ErrorMessage,
  SuccessToast,
  plsWait,
} from "../../../Functions/Mics";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Badge } from "@/components/ui/badge";

export default function ReplenishFeature({
  storeProduct,
  business,
  user,
  baseUrl,
}) {
  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const [replenishLevel, setReplenishLevel] = useState(
    storeProduct.replenishMin || 0,
  );

  const [replenishQuantity, setReplenishQuantity] = useState(
    storeProduct.replenishQty || 0,
  );

  const [isReplenishing] = useState(
    storeProduct.autoReplenishment,
  );

  const handleSubmit = async () => {
    try {
      if (
        replenishLevel === "" ||
        replenishQuantity === ""
      ) {
        return ErrorMessage(
          "Replenish level and quantity are required.",
        );
      }

      setLoading(true);

      plsWait("");

      const response = await fetch(
        `${baseUrl}/api/Replenish/${Encrypt(
          storeProduct._id,
        )}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",

            dbConnect: `Bearer ${business.rustyRoof}`,

            access: `${Encrypt(user._id)}`,
          },

          body: JSON.stringify({
            replenishLevel,

            replenishQuantity,

            user: `${user.firstName} ${user.lastName}`,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to action auto replenishment",
        );
      }

      SuccessToast(
        data.message ||
          "Auto replenishment updated successfully",
      );

      setOpen(false);

      location.reload();
    } catch (error) {
      ErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={
            isReplenishing ? "default" : "secondary"
          }
          className={`gap-2 rounded-sm ${
            isReplenishing
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-red-100 hover:bg-red-200 text-red-700"
          }`}
        >
          {isReplenishing && (
            <CheckCircleIcon className="h-4 w-4" />
          )}

          {isReplenishing
            ? "Monitoring Active"
            : "Monitor Level"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Auto Replenishment Settings
          </DialogTitle>

          <DialogDescription>
            Configure minimum stock threshold and
            replenishment quantity for this product.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/40">
            <div>
              <p className="font-medium text-sm">
                {storeProduct.productName}
              </p>

              <p className="text-xs text-muted-foreground">
                Current Inventory Status
              </p>
            </div>

            <div className="flex gap-2">
              <Badge variant="outline">
                Case: {storeProduct.currentQty || 0}
              </Badge>

              <Badge variant="secondary">
                Pcs: {storeProduct.pcs || 0}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="replenishLevel">
              Minimum Stock Level (Cases)
            </Label>

            <Input
              id="replenishLevel"
              type="number"
              min={0}
              value={replenishLevel}
              onChange={(e) =>
                setReplenishLevel(e.target.value)
              }
              placeholder="Enter minimum stock level"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="replenishQuantity">
              Replenish Quantity (Cases)
            </Label>

            <Input
              id="replenishQuantity"
              type="number"
              min={0}
              value={replenishQuantity}
              onChange={(e) =>
                setReplenishQuantity(e.target.value)
              }
              placeholder="Enter replenish quantity"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-black hover:bg-gray-900 text-white"
          >
            {loading
              ? "Updating..."
              : "Save Configuration"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}