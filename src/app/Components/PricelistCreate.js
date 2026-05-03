"use client";

import React, { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorMessage, plsWait,SuccessToast } from "../../../Functions/Mics";
import { Encrypt } from "../../../Functions/Functions";

export default function AddPriceListModal({baseUrl,userData}) {
  const [priceListName, setPriceListName] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Count words
   */
  const wordCount = useMemo(() => {
    if (!priceListName.trim()) return 0;
    return priceListName.trim().split(/\s+/).length;
  }, [priceListName]);

  const maxWords = 3;
  const isOverLimit = wordCount > maxWords;

  /**
   * Submit Handler
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!priceListName.trim() || isOverLimit) return;

    try {
      plsWait("Creating new pricelist")
      setLoading(true);

      /**
       * Replace with your real endpoint
       */
      const response = await fetch(`${baseUrl}/api/pricelist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
           Authorization: `Bearer ${Encrypt(userData.user.tenantId)}`,
           access: `${Encrypt(userData.user._id)}`,
        },
        body: JSON.stringify({
          Name: priceListName.trim(),
        }),
      });

      const requestResponse = await response.json();

      if (!response.ok) {
        throw new Error(requestResponse.error);
      }

      setPriceListName("");
      SuccessToast(requestResponse.message)

    } catch (error) {
      ErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      {/* ONLY BUTTON VISIBLE INITIALLY */}
      <DialogTrigger asChild>
        <button className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition text-xs w-full">
          <Plus className="h-4 w-4" />
          Add Pricelist
        </button>
      </DialogTrigger>

      {/* MODAL APPEARS ON CLICK */}
      <DialogContent className="sm:max-w-md max-w-lg w-full rounded-sm">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            Add New Pricelist
          </DialogTitle>
          <DialogDescription>
            Note that {priceListName} can't be modified or deleted once created.
          </DialogDescription>
          <DialogDescription>
            Create a new pricing category for your business. Maximum {maxWords} words.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="pricelist">Pricelist Name</Label>

            <Input
              id="pricelist"
              type="text"
              placeholder="e.g. Stores, Wholesale Tier"
              value={priceListName}
              onChange={(e) => setPriceListName(e.target.value)}
              className="rounded-sm"
            />

            <div className="flex justify-between text-sm">
              <span
                className={
                  isOverLimit
                    ? "text-red-500 font-medium"
                    : "text-muted-foreground"
                }
              >
                {wordCount}/{maxWords} words
              </span>

              {isOverLimit && (
                <span className="text-red-500">
                  Maximum word count exceeded
                </span>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={!priceListName.trim() || isOverLimit || loading}
              className="w-full rounded-sm"
            >
              {loading ? "Creating..." : "Create Pricelist"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
