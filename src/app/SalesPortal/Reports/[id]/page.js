"use client";

// One stock report (stock card) at a customer's shop: for each product, what's on the shelf
// and in the back store (cases, pieces, batch, expiry), plus remarks and photos.

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Camera, CheckCircle2, ImageIcon, Loader2, LockOpen, Printer, Search, Upload, X } from "lucide-react";
import api from "@/lib/api";
import AppShell from "../../_ui/AppShell";
import { Alert, BottomBar, Button, Card, CardTitle, ConfirmSheet, Empty, Input, Pager, StatusBadge, Textarea, When } from "../../_ui/ui";
import { toNumber } from "../../_ui/format";

const PER_PAGE = 10;
const MAX_IMAGES = 10;

// toUpdate values must match the backend's StockCart_update cases exactly
const ZONES = {
  shelf: [
    ["Cases", "caseAvail", "number"],
    ["Pieces", "PcsAvil", "number"],
    ["Batch", "batchNo", "text"],
    ["Expiry", "expiryDate", "date"],
  ],
  back: [
    ["Cases", "backCaseAvail", "number"],
    ["Pieces", "backPcsAvail", "number"],
    ["Batch", "backBatchNo", "text"],
    ["Expiry", "backExpDate", "date"],
  ],
};

const fieldValue = (item, key, type) => (type === "number" ? toNumber(item[key]) : item[key] ? String(item[key]).slice(0, type === "date" ? 10 : undefined) : "");

export default function StockReportPage({ Business, bill, user }) {
  const router = useRouter();
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [remark, setRemark] = useState(bill?.remark || "");
  const [saving, setSaving] = useState(new Set());
  const [images, setImages] = useState(bill?.images || []);
  const [pending, setPending] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [confirm, setConfirm] = useState(null); // "Submitted" | "Pending"
  const [submitting, setSubmitting] = useState(false);
  const remarkTimer = useRef(null);
  const fileRef = useRef(null);
  const lastSaved = useRef({}); // what each box last saved, so leaving it again doesn't re-save
  const pendingRef = useRef(pending);
  pendingRef.current = pending;

  const status = bill?.status || "";
  const canEdit = user._id === bill.CreatorId && status.toLowerCase() === "pending";
  const customer = bill.CustomerId?.Username;

  const items = useMemo(
    () =>
      (bill?.Inventory || []).filter((e) => {
        const name = (e.productId?.Name || "").toLowerCase();
        return !name.startsWith("foc-") && name.includes(filter.toLowerCase());
      }),
    [bill, filter],
  );
  const pages = Math.ceil(items.length / PER_PAGE) || 1;
  const shown = items.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => setPage(1), [filter]);
  useEffect(() => () => pendingRef.current.forEach((p) => URL.revokeObjectURL(p.preview)), []);

  const mark = (key, on) =>
    setSaving((prev) => {
      const next = new Set(prev);
      if (on) next.add(key);
      else next.delete(key);
      return next;
    });

  const update = async (body, key) => {
    mark(key, true);
    const r = await api(`/api/Sales_Portal/stock/Position/Cart/Update/${bill._id}`, { method: "PUT", body });
    mark(key, false);
    if (!r.ok) toast.error(r.data?.error || "Couldn't save.");
    return r.ok;
  };

  const saveField = (item, key, type) => (e) => {
    let value = e.target.value;
    if (type === "number") {
      value = parseInt(value, 10);
      if (isNaN(value) || value < 0) value = 0;
    }
    const id = `${item._id}:${key}`;
    const before = id in lastSaved.current ? lastSaved.current[id] : fieldValue(item, key, type);
    if (String(value) === String(before)) return;
    lastSaved.current[id] = value;
    // billId is the inventory line's _id (matched by the backend's arrayFilters)
    update({ billId: item._id, value, toUpdate: key }, id);
  };

  const changeRemark = (value) => {
    setRemark(value);
    clearTimeout(remarkTimer.current);
    remarkTimer.current = setTimeout(() => update({ value, toUpdate: "remark" }, "remark"), 800);
  };

  const pickImages = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    const room = MAX_IMAGES - images.length - pending.length;
    if (room <= 0) return toast.error(`Up to ${MAX_IMAGES} photos.`);
    const ok = files.slice(0, room).filter((f) => {
      if (!f.type.startsWith("image/")) {
        toast.error(`${f.name} is not a photo.`);
        return false;
      }
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`${f.name} is over 5 MB.`);
        return false;
      }
      return true;
    });
    setPending((p) => [...p, ...ok.map((file) => ({ file, preview: URL.createObjectURL(file), id: `${Date.now()}-${Math.random()}` }))]);
  };

  const dropPending = (id) =>
    setPending((p) => {
      const t = p.find((x) => x.id === id);
      if (t) URL.revokeObjectURL(t.preview);
      return p.filter((x) => x.id !== id);
    });

  const removeImage = async (url) => {
    if (await update({ value: url, toUpdate: "removeImage" }, "images")) setImages((prev) => prev.filter((i) => (typeof i === "string" ? i : i?.url || i?.src) !== url));
  };

  const uploadImages = async () => {
    if (!pending.length) return;
    setUploading(true);
    const fd = new FormData();
    pending.forEach((p) => fd.append("images", p.file));
    const r = await api(`/api/Sales_Portal/stock/Position/Upload/${bill._id}`, { method: "POST", body: fd });
    setUploading(false);
    if (!r.ok) return toast.error(r.data?.error || "Upload failed.");
    toast.success(r.data?.message || "Photos uploaded.");
    setImages((prev) => [...prev, ...(r.data?.images || r.data?.urls || [])]);
    pending.forEach((p) => URL.revokeObjectURL(p.preview));
    setPending([]);
    router.refresh();
  };

  const setStatus = async () => {
    setSubmitting(true);
    const r = await api(`/api/Sales_Portal/stock/Position/${bill._id}`, { method: "PATCH", body: { status: confirm } });
    setSubmitting(false);
    if (!r.ok) return toast.error(r.data?.error || "Couldn't update the report.");
    toast.success(r.data?.message || "Report updated.");
    setConfirm(null);
    router.refresh();
  };

  return (
    <AppShell userData={{ user, business: Business }} title={customer || bill.Ref || "Stock report"} subtitle={bill.Ref ? String(bill.Ref).toUpperCase() : "Stock report"} back tabs={false}>
      <Card className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="truncate font-semibold">{customer}</p>
          <p className="text-xs text-sp-muted">Started <When iso={bill.createdAt} /></p>
        </div>
        <StatusBadge status={status} />
      </Card>

      {!canEdit && status.toLowerCase() === "pending" && <Alert kind="info">Only the rep who started this report can change it.</Alert>}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-sp-muted" />
        <Input type="search" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Search products" aria-label="Search products" className="pl-10" />
      </div>

      {shown.length === 0 ? (
        <Empty title={filter ? `No product matches “${filter}”` : "No products on this report"} />
      ) : (
        <ul className="space-y-3">
          {shown.map((item) => (
            <li key={item._id}>
              <Card>
                <div className="border-b border-sp-line px-4 py-3">
                  {item.productId?._id ? (
                    <Link href={`/SalesPortal/Products/${item.productId._id}`} className="line-clamp-2 font-semibold">
                      {item.productId?.Name}
                    </Link>
                  ) : (
                    <p className="font-semibold">{item.productId?.Name}</p>
                  )}
                </div>
                <div className="grid gap-4 p-4 sm:grid-cols-2">
                  {[
                    ["shelf", "On shelf"],
                    ["back", "Back store"],
                  ].map(([zone, label]) => (
                    <div key={zone} className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-sp-muted">{label}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {ZONES[zone].map(([fieldLabel, key, type]) => {
                          const busy = saving.has(`${item._id}:${key}`);
                          return (
                            <label key={key} className="space-y-1">
                              <span className="flex items-center gap-1 text-xs text-sp-muted">
                                {fieldLabel} {busy && <Loader2 className="h-3 w-3 animate-spin" />}
                              </span>
                              {canEdit ? (
                                <Input
                                  type={type}
                                  inputMode={type === "number" ? "numeric" : undefined}
                                  min={type === "number" ? 0 : undefined}
                                  defaultValue={fieldValue(item, key, type)}
                                  onBlur={saveField(item, key, type)}
                                  className={`h-11 px-3 ${type === "number" ? "text-center" : "text-sm"}`}
                                />
                              ) : (
                                <span className="block truncate text-[15px] font-medium">{fieldValue(item, key, type) || "—"}</span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Pager page={page} pages={pages} onChange={setPage} />

      <Card className="space-y-2 p-4">
        <div className="flex items-center justify-between">
          <label htmlFor="remark" className="text-sm font-semibold">
            Remarks
          </label>
          {saving.has("remark") && (
            <span className="flex items-center gap-1.5 text-xs text-sp-muted">
              <Loader2 className="h-3 w-3 animate-spin" /> Saving…
            </span>
          )}
        </div>
        <Textarea id="remark" value={remark} disabled={!canEdit} onChange={(e) => changeRemark(e.target.value)} placeholder="Anything the office should know about this shop" />
      </Card>

      <Card>
        <CardTitle
          action={
            canEdit && (
              <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={images.length + pending.length >= MAX_IMAGES}>
                <Camera className="h-4 w-4" /> Add
              </Button>
            )
          }
        >
          <span className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-sp-muted" /> Photos ({images.length + pending.length}/{MAX_IMAGES})
          </span>
        </CardTitle>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={pickImages} />
        <div className="space-y-3 p-3">
          {images.length + pending.length === 0 ? (
            <p className="py-6 text-center text-sm text-sp-muted">No photos yet.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {images.map((img, i) => {
                const src = typeof img === "string" ? img : img?.url || img?.src;
                return (
                  <div key={`img-${i}`} className="relative aspect-square overflow-hidden rounded-xl border border-sp-line bg-sp-bg">
                    { }
                    <img src={src} alt={`Stock photo ${i + 1}`} className="h-full w-full object-cover" loading="lazy" />
                    {canEdit && (
                      <button type="button" onClick={() => removeImage(src)} className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white" aria-label="Remove photo">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                );
              })}
              {pending.map((p) => (
                <div key={p.id} className="relative aspect-square overflow-hidden rounded-xl border-2 border-dashed border-sp-info/40 bg-sp-bg">
                  { }
                  <img src={p.preview} alt="Not uploaded yet" className="h-full w-full object-cover opacity-80" />
                  <span className="absolute bottom-1 left-1 rounded-full bg-sp-info px-2 py-0.5 text-[10px] font-semibold text-white">New</span>
                  <button type="button" onClick={() => dropPending(p.id)} className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white" aria-label="Remove photo">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {pending.length > 0 && (
            <Button className="w-full" onClick={uploadImages} busy={uploading}>
              {!uploading && <Upload className="h-5 w-5" />} {uploading ? "Uploading…" : `Upload ${pending.length} photo${pending.length === 1 ? "" : "s"}`}
            </Button>
          )}
        </div>
      </Card>

      <BottomBar>
        {status === "Pending" && (
          <Button variant="success" className="flex-1" onClick={() => setConfirm("Submitted")}>
            <CheckCircle2 className="h-5 w-5" /> Close report
          </Button>
        )}
        {status === "Submitted" && (
          <Button className="flex-1" onClick={() => setConfirm("Pending")}>
            <LockOpen className="h-5 w-5" /> Reopen report
          </Button>
        )}
        <Button variant="outline" className={status === "Pending" || status === "Submitted" ? "" : "flex-1"} onClick={() => window.print()} aria-label="Print">
          <Printer className="h-5 w-5" /> {status === "Pending" || status === "Submitted" ? "" : "Print"}
        </Button>
      </BottomBar>

      <ConfirmSheet
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        title={confirm === "Submitted" ? "Close this report?" : "Reopen this report?"}
        text={confirm === "Submitted" ? "The counts are sent to the office and can't be changed unless the report is reopened." : "The report can be edited again."}
        confirmLabel={confirm === "Submitted" ? "Yes, close it" : "Yes, reopen"}
        variant={confirm === "Submitted" ? "success" : "primary"}
        busy={submitting}
        onConfirm={setStatus}
      />
    </AppShell>
  );
}
