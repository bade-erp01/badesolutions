"use client";

// One requisition (draft order): its lines, adding products, quantities, then checkout
// with the rep's ops code. Also prints the quotation PDF (same document as the ERP's draft page).

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import moment from "moment";
import { toast } from "sonner";
import { Clock, KeyRound, Mail, Phone, Plus, Printer, Search, ShoppingCart, Trash2 } from "lucide-react";
import api from "@/lib/api";
import { printQuotationPdf } from "@/lib/pdf/quotationPdf";
import { totalInWords, EXPRESS_PRIVATE_URL } from "../../../../../Functions/Functions";
import AppShell from "../../_ui/AppShell";
import { Alert, BottomBar, Button, Card, CardTitle, ConfirmSheet, Empty, Field, Input, Sheet, StatusBadge, When } from "../../_ui/ui";
import { currencyOf, money2 } from "../../_ui/format";

export default function RequisitionPage({ Business, bill, products = [], user }) {
  const router = useRouter();
  const userInfo = { user, business: Business };
  const currency = currencyOf(Business);
  const status = String(bill.billStatus || "");
  const isDraft = status.toLowerCase() === "draft";
  const isCancelled = status.toLowerCase() === "cancelled";
  const canEdit = user._id === bill.invoicerId && user.raiseInvoice && isDraft;
  const within24h = moment().diff(moment(bill.createdAt), "hours") < 24;
  const canCheckout =
    canEdit && (!Business.InvoiceRestriction || within24h) && (bill.orders?.length || 0) > 0;

  const [picker, setPicker] = useState(false);
  const [adding, setAdding] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [printing, setPrinting] = useState(false);

  const addProduct = async (code) => {
    setAdding(true);
    try {
      const product = products.find((p) => p.item?.ACDcode === code || p.item?.ADCcode === code);
      if (!product) throw new Error("Product not found");
      const res = await api(`/api/Draft/add/order/${bill._id}?productId=${code}&priceList=${bill.customer?.priceList}`, {
        method: "PUT",
        body: { product: product.storeId },
      });
      if (!res.data?.message) throw new Error(res.data?.error || "Couldn't add the product.");
      toast.success(res.data.message);
      setPicker(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAdding(false);
      router.refresh();
    }
  };

  const changeQty = async (lineId, value, toUpdate, storeId) => {
    const r = await api(`/api/Invoice/Cart/Update?user=${user._id}`, {
      method: "PUT",
      body: { lineId, value, toUpdate, billId: bill._id, storeId },
    });
    if (r.data?.message) {
      toast.success(r.data.message);
      mutate(`${EXPRESS_PRIVATE_URL}/api/Invoice/${bill._id}`);
    } else {
      toast.error(r.data?.error || r.error || "Couldn't update the quantity.");
    }
    router.refresh();
  };

  const removeLine = async (lineId) => {
    const r = await api(`/api/Draft/delete/order?user=${user._id}`, { method: "DELETE", body: { lineId, billId: bill._id } });
    if (r.data?.message) toast.success(r.data.message);
    else toast.error(r.data?.error || "Something went wrong.");
    router.refresh();
  };

  const deleteDraft = async () => {
    setDeleting(true);
    const r = await api(`/api/Draft/order/Delete/${bill._id}`, { method: "DELETE", headers: { "idempotency-key": `delete-${bill._id}` } });
    if (r.data?.message) {
      toast.success(r.data.message);
      router.push("/SalesPortal/Requisitions");
      router.refresh();
      return;
    }
    setDeleting(false);
    setConfirmDelete(false);
    toast.error(r.data?.error || "Couldn't delete the requisition.");
    router.refresh();
  };

  const print = async () => {
    setPrinting(true);
    try {
      await printQuotationPdf(Business, bill.customer, bill);
    } catch {
      toast.error("Couldn't make the PDF.");
    } finally {
      setPrinting(false);
    }
  };

  const subTotal = (Number(bill.subTotal) || 0) - (Number(bill.taxRate) || 0);

  return (
    <AppShell userData={userInfo} title={bill.customerName || "Requisition"} subtitle={`${status} · #${bill.billReferenceNo ?? ""}`} back tabs={false}>
      {/* Status */}
      <Card className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <StatusBadge status={status} />
          <span className="text-xs text-sp-muted">Created <When iso={bill.createdAt} /></span>
        </div>
        {Business.InvoiceRestriction && isDraft && <Countdown createdAt={bill.createdAt} />}
        <div className="space-y-1.5 text-sm">
          <p className="font-semibold">{bill.customerName}</p>
          {bill.customer?.billingAddress && <p className="text-sp-muted">{bill.customer.billingAddress}</p>}
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {bill.customer?.phone && (
              <a href={`tel:${bill.customer.phone}`} className="inline-flex items-center gap-1.5 text-sp-info">
                <Phone className="h-4 w-4" /> {bill.customer.phone}
              </a>
            )}
            {bill.customer?.Email && (
              <a href={`mailto:${bill.customer.Email}`} className="inline-flex min-w-0 items-center gap-1.5 text-sp-info">
                <Mail className="h-4 w-4 shrink-0" /> <span className="truncate">{bill.customer.Email}</span>
              </a>
            )}
          </div>
        </div>
      </Card>

      {/* Lines */}
      <Card>
        <CardTitle
          action={
            canEdit && (
              <Button size="sm" onClick={() => setPicker(true)} disabled={adding}>
                <Plus className="h-4 w-4" /> Add
              </Button>
            )
          }
        >
          Items ({bill.orders?.length || 0})
        </CardTitle>
        {(bill.orders || []).length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-sm text-sp-muted">No items yet.</p>
            {canEdit && (
              <Button className="mt-3" onClick={() => setPicker(true)}>
                <Plus className="h-5 w-5" /> Add a product
              </Button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-sp-line">
            {bill.orders.map((line) => (
              <OrderLine
                key={line._id}
                line={line}
                currency={currency}
                canEdit={canEdit}
                isDraft={isDraft}
                allowPcs={Boolean(Business.allowSkuSplitting)}
                onQty={(value, field) => changeQty(line._id, value, field, line.storeProductId)}
                onRemove={() => removeLine(line._id)}
              />
            ))}
          </ul>
        )}
      </Card>

      {/* Totals */}
      <Card className="divide-y divide-sp-line">
        <Line label="Subtotal" value={money2(subTotal, currency)} />
        <Line label="Tax" value={money2(bill.taxRate, currency)} />
        <Line label="Shipping" value={money2(bill.shippingFee, currency)} />
        {Number(bill.discount) > 0 && <Line label="Discount" value={money2(bill.discount, currency)} />}
        <div className="flex items-center justify-between gap-4 px-4 py-4">
          <span className="font-semibold">Total</span>
          <span className="text-xl font-bold tabular-nums">{money2(bill.grandTotal, currency)}</span>
        </div>
        <p className="px-4 py-3 text-sm italic text-sp-muted">{totalInWords(bill.grandTotal, Business.currency?.currency)}</p>
      </Card>

      {(Business.invoicePolicy || bill.RaiseBy) && (
        <Card className="space-y-3 p-4 text-sm">
          {bill.RaiseBy && (
            <p>
              <span className="text-sp-muted">Raised by </span>
              <span className="font-medium">{bill.RaiseBy}</span>
            </p>
          )}
          {Business.invoicePolicy && (
            <div>
              <p className="mb-1 font-semibold">Terms &amp; conditions</p>
              <p className="whitespace-pre-line text-sp-muted">{Business.invoicePolicy}</p>
            </div>
          )}
        </Card>
      )}

      {!isDraft && (
        <p className={`text-center text-sm font-semibold ${isCancelled ? "text-sp-bad" : "text-sp-muted"}`}>
          {status.toUpperCase()} / {bill.billReferenceNo} / {bill.invoicelocation}
        </p>
      )}

      {(canCheckout || isDraft || canEdit) && (
        <BottomBar>
          {canCheckout && (
            <Button variant="success" className="flex-1" onClick={() => setCheckout(true)}>
              <ShoppingCart className="h-5 w-5" /> Checkout
            </Button>
          )}
          {isDraft && (
            <Button variant="outline" className={canCheckout ? "" : "flex-1"} onClick={print} busy={printing} aria-label="Print quotation">
              {!printing && <Printer className="h-5 w-5" />} {canCheckout ? "" : "Print quotation"}
            </Button>
          )}
          {canEdit && (
            <Button variant="danger" onClick={() => setConfirmDelete(true)} aria-label="Delete requisition">
              <Trash2 className="h-5 w-5" />
            </Button>
          )}
        </BottomBar>
      )}

      <ProductPicker open={picker} onClose={() => setPicker(false)} products={products} busy={adding} onPick={addProduct} />

      <ConfirmSheet
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this requisition?"
        text="The requisition and all its items will be removed. This can't be undone."
        confirmLabel="Yes, delete it"
        variant="danger"
        busy={deleting}
        onConfirm={deleteDraft}
      />

      <CheckoutSheet open={checkout} onClose={() => setCheckout(false)} bill={bill} business={Business} currency={currency} />
    </AppShell>
  );
}

function Line({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 text-[15px]">
      <span className="text-sp-muted">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

function Countdown({ createdAt }) {
  // ticks in the browser only (the server's clock would not match the phone's)
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (now === null) return null;
  const left = moment(createdAt).add(24, "hours").valueOf() - now;
  if (left <= 0) return <Alert kind="bad">This requisition has expired.</Alert>;
  const d = moment.duration(left);
  return (
    <Alert kind="warn">
      <Clock className="mr-1.5 inline h-4 w-4" /> Expires in {Math.floor(d.asHours())}h {d.minutes()}m {d.seconds()}s
    </Alert>
  );
}

// Cases and pieces, like the ERP draft: pieces only when the business allows SKU splitting,
// and at most one case's worth (item.Pieces) per line, the limit the backend enforces.
function OrderLine({ line, currency, canEdit, isDraft, allowPcs, onQty, onRemove }) {
  const [removing, setRemoving] = useState(false);
  const perCase = Number(line.item?.Pieces) || 0;
  const save = (field) => (e) => {
    let v = Number(e.target.value);
    if (!Number.isFinite(v) || v < 0) v = 0;
    if (field === "pcs" && perCase && v > perCase) {
      toast.error(`${line.item?.Name} has ${perCase} pieces in a case. Enter ${perCase} or fewer pieces, or add a case.`);
      e.target.value = line.pcsReq || 0;
      return;
    }
    const before = Number(field === "Qty" ? line.Qty : line.pcsReq) || 0;
    if (v !== before) onQty(v, field);
  };

  return (
    <li className="space-y-3 px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          {isDraft || !line.item?._id ? (
            <p className="font-medium">{line.item?.Name}</p>
          ) : (
            <Link href={`/SalesPortal/Products/${line.item._id}`} className="font-medium text-sp-info">
              {line.item?.Name}
            </Link>
          )}
          <p className="text-xs text-sp-muted">
            {money2(line.priceListPrice, currency)} per case
            {perCase > 0 && ` · ${perCase} pcs per case`}
            {Number(line.promotionData) > 0 && ` · promo ${money2(line.promotionData, currency)}`}
          </p>
        </div>
        <span className="shrink-0 font-semibold tabular-nums">{money2(line.total, currency)}</span>
      </div>
      {canEdit ? (
        <div className="flex items-end gap-2">
          <label className="flex-1 space-y-1">
            <span className="text-xs font-medium text-sp-muted">Cases</span>
            <Input type="number" inputMode="numeric" min={0} defaultValue={line.Qty || 0} onBlur={save("Qty")} className="text-center" />
          </label>
          {allowPcs && (
            <label className="flex-1 space-y-1">
              <span className="text-xs font-medium text-sp-muted">Pieces</span>
              <Input type="number" inputMode="numeric" min={0} max={perCase || undefined} defaultValue={line.pcsReq || 0} onBlur={save("pcs")} className="text-center" />
            </label>
          )}
          {/* same 48px height as the quantity boxes; the icon size (not px-0, which md's px-5 overrode) keeps the bin visible */}
          <Button
            variant="danger"
            size="icon"
            onClick={async () => {
              setRemoving(true);
              await onRemove();
              setRemoving(false);
            }}
            busy={removing}
            aria-label={`Remove ${line.item?.Name}`}
          >
            {!removing && <Trash2 className="h-5 w-5" />}
          </Button>
        </div>
      ) : (
        <p className="text-sm text-sp-muted">
          {line.Qty || 0} case{line.Qty === 1 ? "" : "s"}
          {Number(line.pcsReq) > 0 && ` + ${line.pcsReq} pcs`}
        </p>
      )}
    </li>
  );
}

function ProductPicker({ open, onClose, products, busy, onPick }) {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    const all = products.filter((p) => p.item?.ACDcode || p.item?.ADCcode);
    if (!s) return all.slice(0, 60);
    return all
      .filter((p) => `${p.item?.Name || ""} ${p.item?.ACDcode || ""} ${p.item?.ADCcode || ""}`.toLowerCase().includes(s))
      .slice(0, 60);
  }, [products, q]);

  return (
    <Sheet open={open} onClose={busy ? undefined : onClose} title="Add a product">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-sp-muted" />
        <Input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${products.length} products`} className="pl-10" autoFocus />
      </div>
      {list.length === 0 ? (
        <Empty title="No product found" text="Try another name or code." />
      ) : (
        <ul className="-mx-5 divide-y divide-sp-line border-y border-sp-line">
          {list.map((p) => {
            const code = p.item.ACDcode || p.item.ADCcode;
            return (
              <li key={p.item._id || code}>
                <button type="button" disabled={busy} onClick={() => onPick(code)} className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-sp-bg disabled:opacity-50">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{p.item.Name || "Unnamed"}</p>
                    <p className="text-xs text-sp-muted">
                      {code} · in stock: {p.Case ?? 0} case{p.Case === 1 ? "" : "s"}, {p.pcs ?? 0} pcs
                    </p>
                  </div>
                  <Plus className="h-5 w-5 shrink-0 text-sp-muted" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Sheet>
  );
}

function CheckoutSheet({ open, onClose, bill, business, currency }) {
  const router = useRouter();
  const [ops, setOps] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!ops) return setError("Enter your operational code.");
    setBusy(true);
    setError("");
    const r = await api(`/api/wareHouse/Bill`, {
      method: "PATCH",
      body: {
        billId: bill._id,
        customer: bill.customer?._id,
        restriction: business?.InvoiceRestriction,
        ops, // ops code in the body, never the URL
      },
      headers: { "idempotency-key": `Draft-${bill._id}` },
    });
    setBusy(false);
    if (r.ok) {
      toast.success(r.data?.message || "Checked out.");
      setOps("");
      onClose();
      router.refresh();
    } else {
      setError(r.data?.error || r.error || "Checkout failed.");
    }
  };

  return (
    <Sheet open={open} onClose={busy ? undefined : onClose} title="Checkout">
      <form onSubmit={submit} className="space-y-4">
        <Alert kind="info">
          Checking out takes {money2(bill.grandTotal, currency)} of stock out of the billing location&apos;s inventory.
        </Alert>
        <Field label="Your operational code">
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-sp-muted" />
            <Input type="password" autoComplete="off" value={ops} onChange={(e) => setOps(e.target.value)} className="pl-10" autoFocus />
          </div>
        </Field>
        {error && <Alert>{error}</Alert>}
        <div className="flex gap-2 pt-1">
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" variant="success" className="flex-1" busy={busy}>
            {busy ? "Processing…" : "Confirm checkout"}
          </Button>
        </div>
      </form>
    </Sheet>
  );
}
