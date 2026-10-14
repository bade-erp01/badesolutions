"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import Swal from "sweetalert2";
import Image from "next/image";
import SuspenenseFallBack from "@/app/Components/SuspenenseFallBack";
import {
  Encrypt,
  EXPRESS_PRIVATE_URL,
} from "../../../../../Functions/Functions";
import {
  ErrorMessage,
  SuccessToast,
  plsWait,
} from "../../../../../Functions/Mics";
import moment from "moment";
import { useRouter } from "next/navigation";
import { Printer, Loader2, Upload, X, ImageIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;
const MAX_IMAGES = 10;

export default function DraftInvoicePage({ Business, bill, user }) {
  const [Singlebill] = useState(bill);
  const [filterText, setFilterText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [remark, setRemark] = useState(bill?.remark || "");
  const [savingKeys, setSavingKeys] = useState(new Set());
  const [existingImages, setExistingImages] = useState(bill?.images || []);
  const [newImages, setNewImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const router = useRouter();
  const remarkTimer = useRef(null);
  const fileInputRef = useRef(null);

  const totalImageCount = existingImages.length + newImages.length;

  const filteredInventory =
    Singlebill?.Inventory?.filter((entry) => {
      const name = entry.productId?.Name || "";
      return (
        !name.toLowerCase().startsWith("foc-") &&
        name.toLowerCase().includes(filterText.toLowerCase())
      );
    }) || [];

  const totalPages = Math.ceil(filteredInventory.length / ITEMS_PER_PAGE) || 1;
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayedItems = filteredInventory.slice(
    startIdx,
    startIdx + ITEMS_PER_PAGE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filterText]);

  useEffect(() => {
    Swal.close();
  }, []);

  useEffect(() => {
    return () => {
      newImages.forEach((img) => URL.revokeObjectURL(img.preview));
    };
  }, []);

  const canEdit =
    user._id === Singlebill.CreatorId &&
    Singlebill.status?.toLowerCase() === "pending";

  const isPending = Singlebill?.status?.toLowerCase() === "pending";

  const fieldKey = (itemId, field) => `${itemId}:${field}`;

  const setSaving = (key, isSaving) => {
    setSavingKeys((prev) => {
      const next = new Set(prev);
      if (isSaving) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  // ─── Inventory field update (matches StockCart_update) ────────────────────
  // Backend expects:
  //   params.id  → stock position _id
  //   billId     → Inventory line _id  (arrayFilters)
  //   toUpdate   → field name
  //   value      → new value
  const handleFieldUpdate = async (itemId, value, toUpdate) => {
    const key = fieldKey(itemId, toUpdate);
    setSaving(key, true);

    try {
      const url = `${EXPRESS_PRIVATE_URL}/api/Sales_Portal/stock/Position/Cart/Update/${Encrypt(Singlebill._id)}`;
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(Business.tenantId)}`,
          access: `${Encrypt(user._id)}`,
          sessionKey: `Bearer ${Encrypt(user.SessionId)}`,
        },
        body: JSON.stringify({
          billId: itemId, // Inventory.$[elem]._id
          value,
          toUpdate,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        SuccessToast(data.message || "Update successful");
      } else {
        ErrorMessage(data.error || "Update failed");
      }
    } catch {
      ErrorMessage("Unexpected error occurred");
    } finally {
      setSaving(key, false);
    }
  };

  // ─── Document-level remark (toUpdate: "remark") ───────────────────────────
  const handleRemarkChange = (value) => {
    setRemark(value);
    if (remarkTimer.current) clearTimeout(remarkTimer.current);

    remarkTimer.current = setTimeout(async () => {
      setSaving("remark", true);
      try {
        const url = `${EXPRESS_PRIVATE_URL}/api/Sales_Portal/stock/Position/Cart/Update/${Encrypt(Singlebill._id)}`;
        const res = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Encrypt(Business.tenantId)}`,
            access: `${Encrypt(user._id)}`,
            sessionKey: `Bearer ${user.SessionId}`,
          },
          body: JSON.stringify({
            value,
            toUpdate: "remark",
          }),
        });
        const data = await res.json();
        if (res.ok) SuccessToast(data.message || "Update successful");
        else ErrorMessage(data.error || "Failed to save remark");
      } catch {
        ErrorMessage("Failed to save remark");
      } finally {
        setSaving("remark", false);
      }
    }, 800);
  };

  // ─── Image handlers ───────────────────────────────────────────────────────
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remaining = MAX_IMAGES - totalImageCount;
    if (remaining <= 0) {
      ErrorMessage(`Maximum of ${MAX_IMAGES} images allowed`);
      e.target.value = "";
      return;
    }

    const accepted = files.slice(0, remaining).filter((f) => {
      if (!f.type.startsWith("image/")) {
        ErrorMessage(`${f.name} is not an image`);
        return false;
      }
      if (f.size > 5 * 1024 * 1024) {
        ErrorMessage(`${f.name} is larger than 5MB`);
        return false;
      }
      return true;
    });

    setNewImages((prev) => [
      ...prev,
      ...accepted.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        id: `${Date.now()}-${Math.random()}`,
      })),
    ]);
    e.target.value = "";
  };

  const removeNewImage = (id) => {
    setNewImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter((img) => img.id !== id);
    });
  };

  const removeExistingImage = async (imageUrl) => {
    if (!canEdit) return;
    setSaving("images", true);
    try {
      const url = `${EXPRESS_PRIVATE_URL}/api/Sales_Portal/stock/Position/Cart/Update/${Encrypt(Singlebill._id)}`;
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(Business.tenantId)}`,
          access: `${Encrypt(user._id)}`,
          sessionKey: `Bearer ${user.SessionId}`,
        },
        body: JSON.stringify({
          value: imageUrl,
          toUpdate: "removeImage",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setExistingImages((prev) => prev.filter((img) => img !== imageUrl));
        SuccessToast(data.message || "Update successful");
      } else {
        ErrorMessage(data.error || "Failed to remove image");
      }
    } catch {
      ErrorMessage("Failed to remove image");
    } finally {
      setSaving("images", false);
    }
  };

  const uploadImages = async () => {
    if (!newImages.length || !canEdit) return;
    setUploadingImages(true);
    try {
      const formData = new FormData();
      newImages.forEach((img) => formData.append("images", img.file));

      const res = await fetch(
        `${EXPRESS_PRIVATE_URL}/api/Sales_Portal/stock/Position/Upload/${Encrypt(Singlebill._id)}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${Encrypt(Business.tenantId)}`,
            access: `${Encrypt(user._id)}`,
            sessionKey: `Bearer ${user.SessionId}`,
          },
          body: formData,
        },
      );

      const data = await res.json();
      if (res.ok) {
        SuccessToast(data.message || "Images uploaded");
        const uploaded = data.images || data.urls || [];
        setExistingImages((prev) => [...prev, ...uploaded]);
        newImages.forEach((img) => URL.revokeObjectURL(img.preview));
        setNewImages([]);
        router.refresh();
      } else {
        ErrorMessage(data.error || "Upload failed");
      }
    } catch {
      ErrorMessage("Failed to upload images");
    } finally {
      setUploadingImages(false);
    }
  };

  // ─── Submit status ────────────────────────────────────────────────────────
  async function submitEntry({ status }) {
    const result = await Swal.fire({
      title: "Confirm Submission",
      text: "Are you sure you want to submit this entry?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, submit",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      plsWait("Submitting...");
      const url = `${EXPRESS_PRIVATE_URL}/api/Sales_Portal/stock/Position/${Encrypt(Singlebill._id)}`;
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(Business.tenantId)}`,
          access: `${Encrypt(user._id)}`,
          sessionKey: `Bearer ${user.SessionId}`,
        },
        body: JSON.stringify({ status }),
      });

      const resultData = await response.json();
      if (response.ok) {
        SuccessToast(resultData.message);
        router.refresh();
      } else {
        ErrorMessage(resultData.error || "Failed to update status");
      }
    } catch (err) {
      ErrorMessage(
        err.message || "Something went wrong while updating status.",
      );
    }
  }

  // ─── Parse Decimal128 / number safely ─────────────────────────────────────
  const toNumber = (val) => {
    if (val == null) return 0;
    if (typeof val === "object" && val.$numberDecimal != null) {
      return parseFloat(val.$numberDecimal) || 0;
    }
    return Number(val) || 0;
  };

  // ─── Shelf / Back Store field group ───────────────────────────────────────
  // toUpdate values MUST match StockCart_update switch cases exactly
  const renderShelfFields = (item, zone) => {
    // zone: "shelf" | "back"
    const fields =
      zone === "shelf"
        ? [
            {
              label: "Case",
              toUpdate: "caseAvail",
              type: "number",
              getValue: () => toNumber(item.caseAvail),
            },
            {
              label: "PCS",
              toUpdate: "PcsAvil",
              type: "number",
              getValue: () => toNumber(item.PcsAvil),
            },
            {
              label: "Batch",
              toUpdate: "batchNo",
              type: "text",
              getValue: () => item.batchNo || "",
            },
            {
              label: "Exp",
              toUpdate: "expiryDate",
              type: "date",
              getValue: () => item.expiryDate || "",
            },
          ]
        : [
            {
              label: "Case",
              toUpdate: "backCaseAvail",
              type: "number",
              getValue: () => toNumber(item.backCaseAvail),
            },
            {
              label: "PCS",
              toUpdate: "backPcsAvail",
              type: "number",
              getValue: () => toNumber(item.backPcsAvail),
            },
            {
              label: "Batch",
              toUpdate: "backBatchNo",
              type: "text",
              getValue: () => item.backBatchNo || "",
            },
            {
              label: "Exp",
              toUpdate: "backExpDate",
              type: "date",
              getValue: () => item.backExpDate || "",
            },
          ];

    return (
      <div className="grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-4 sm:gap-3 text-xs">
        {fields.map((f) => {
          const key = fieldKey(item._id, f.toUpdate);
          const isSaving = savingKeys.has(key);

          return (
            <div key={f.toUpdate} className="space-y-1">
              <span className="flex items-center gap-1 text-[11px] uppercase text-muted-foreground font-medium">
                {f.label}
                {isSaving && (
                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                )}
              </span>

              {canEdit ? (
                <Input
                  type={f.type}
                  defaultValue={f.getValue()}
                  min={f.type === "number" ? 0 : undefined}
                  disabled={isSaving}
                  className={cn(
                    "h-9 w-full text-center text-base sm:h-8 sm:text-xs",
                    isSaving && "opacity-60",
                  )}
                  onBlur={(e) => {
                    let val = e.target.value;
                    if (f.type === "number") {
                      val = parseInt(val, 10);
                      if (isNaN(val) || val < 0) val = 0;
                    }
                    // billId = inventory line _id (matches arrayFilters)
                    handleFieldUpdate(item._id, val, f.toUpdate);
                  }}
                />
              ) : (
                <span className="font-medium block truncate">
                  {f.getValue() || "—"}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Suspense fallback={<SuspenenseFallBack pagedata={"Stock Report"} />}>
      <div className="mx-auto max-w-6xl space-y-6 p-3 sm:p-6 m-2 sm:m-6 bg-white shadow-2xl border border-border text-xs">
        {/* Status + Date */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Badge
            variant={isPending ? "destructive" : "default"}
            className="w-fit text-xs sm:text-sm px-3 py-1 capitalize"
          >
            {Singlebill?.status}
          </Badge>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Created on:{" "}
            <span className="font-medium text-foreground">
              {moment(Singlebill?.createdAt).format(
                "dddd DD MMMM YYYY [at] hh:mm A",
              )}
            </span>
          </p>
        </div>

        {/* Company + Customer */}
        <div className="border-t border-b py-5 sm:py-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <Avatar className="h-14 w-14 sm:h-16 sm:w-16 border shrink-0 rounded-2xl">
              <AvatarImage
                src={Business.companyLogo}
                alt="logo"
                className="object-cover"
              />
              <AvatarFallback className="rounded-2xl text-sm">
                {Business.companyName?.[0] || "C"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold tracking-tight truncate">
                {Singlebill.CustomerId?.Username?.toUpperCase()}
              </h3>
            </div>
          </div>
        </div>

        {/* Image Uploader (TOP) */}
        {canEdit && (
          <Card className="p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1 min-w-0">
                <Label className="text-sm font-medium">Upload Images</Label>
                <p className="text-xs text-muted-foreground">
                  Max {MAX_IMAGES} · PNG/JPG · 5MB each · {totalImageCount}/
                  {MAX_IMAGES}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageSelect}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={totalImageCount >= MAX_IMAGES}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Select Images
                </Button>
                {newImages.length > 0 && (
                  <Button
                    type="button"
                    onClick={uploadImages}
                    disabled={uploadingImages}
                    className="w-full sm:w-auto"
                  >
                    {uploadingImages ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading…
                      </>
                    ) : (
                      <>Upload {newImages.length}</>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {newImages.length > 0 && (
              <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-2">
                {newImages.map((img) => (
                  <div
                    key={img.id}
                    className="relative aspect-square rounded-lg overflow-hidden border bg-muted group"
                  >
                    <Image
                      src={img.preview}
                      alt="preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(img.id)}
                      className="absolute top-1 right-1 h-7 w-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <Badge className="absolute bottom-1 left-1 text-[9px] px-1 py-0">
                      New
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {Singlebill.status === "Pending" && (
              <Button
                onClick={() => submitEntry({ status: "Submitted" })}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
              >
                Close card
              </Button>
            )}
            {Singlebill.status === "Submitted" && (
              <Button
                onClick={() => submitEntry({ status: "Pending" })}
                className="w-full sm:w-auto"
              >
                Open card
              </Button>
            )}
          </div>
          <Button variant="secondary" className="w-full sm:w-auto">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>

        {/* Filter */}
        <Input
          type="search"
          placeholder="Search products..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />

        {/* Table */}
        <Card className="overflow-hidden">
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-[10px] sm:text-xs uppercase font-semibold min-w-[130px]">
                    Product
                  </TableHead>
                  <TableHead className="text-[10px] sm:text-xs uppercase font-semibold text-center min-w-[200px]">
                    On Shelf
                  </TableHead>
                  <TableHead className="text-[10px] sm:text-xs uppercase font-semibold text-center min-w-[200px] border-l border-border">
                    Back Store
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedItems.length > 0 ? (
                  displayedItems.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="align-top py-3">
                        <a
                          href={`/SalesPortal/Products/${Encrypt(
                            item?.productId?._id,
                          )}`}
                          className="text-primary hover:underline text-xs font-medium line-clamp-2"
                        >
                          {item?.productId?.Name}
                        </a>
                      </TableCell>
                      <TableCell className="py-3 align-top">
                        {renderShelfFields(item, "shelf")}
                      </TableCell>
                      <TableCell className="py-3 align-top border-l border-border">
                        {renderShelfFields(item, "back")}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="h-24 text-center text-muted-foreground text-sm"
                    >
                      No products found matching &quot;{filterText}&quot;
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          {filteredInventory.length > 0 && (
            <>
              <Separator />
              <div className="flex flex-wrap items-center justify-center gap-3 py-4 px-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    currentPage > 1 && setCurrentPage(currentPage - 1)
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    currentPage < totalPages && setCurrentPage(currentPage + 1)
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </Card>

        {/* Remarks */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="remark" className="text-sm font-medium">
              Remarks
            </Label>
            {savingKeys.has("remark") && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving…
              </span>
            )}
          </div>
          <Textarea
            id="remark"
            placeholder="Write any remarks or notes here..."
            value={remark}
            disabled={!canEdit}
            onChange={(e) => handleRemarkChange(e.target.value)}
            className="min-h-[100px] resize-y text-base sm:text-sm"
          />
        </div>

        {/* Image Gallery (BOTTOM) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-medium">
              Photos ({existingImages.length + newImages.length})
            </Label>
          </div>

          {existingImages.length === 0 && newImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-muted-foreground">
              <ImageIcon className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm">No images uploaded yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {existingImages.map((url, i) => {
                const src =
                  typeof url === "string" ? url : url?.url || url?.src;
                return (
                  <div
                    key={`existing-${i}`}
                    className="relative aspect-square rounded-lg overflow-hidden border bg-muted group"
                  >
                    <Image
                      src={src}
                      alt={`Stock photo ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, 20vw"
                    />
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => removeExistingImage(src)}
                        className="absolute top-1.5 right-1.5 h-8 w-8 rounded-full bg-black/60 text-white flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}

              {newImages.map((img) => (
                <div
                  key={img.id}
                  className="relative aspect-square rounded-lg overflow-hidden border-2 border-dashed border-primary/40 bg-muted group"
                >
                  <Image
                    src={img.preview}
                    alt="pending"
                    fill
                    className="object-cover opacity-80"
                    unoptimized
                  />
                  <Badge className="absolute bottom-1.5 left-1.5 text-[9px]">
                    Pending
                  </Badge>
                  <button
                    type="button"
                    onClick={() => removeNewImage(img.id)}
                    className="absolute top-1.5 right-1.5 h-8 w-8 rounded-full bg-black/60 text-white flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Suspense>
  );
}
