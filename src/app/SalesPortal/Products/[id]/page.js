"use client";

// One product: photo and code, this year's sales by the rep, details, price lists, reviews.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import moment from "moment";
import Plotly from "plotly.js-dist-min";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { toast } from "sonner";
import { Star, TrendingUp } from "lucide-react";
import api from "@/lib/api";
import { pricelistSetter } from "../../../../../Functions/Functions";
import AppShell from "../../_ui/AppShell";
import { Badge, Button, Card, CardTitle, Field, KeyValue, Loading, Textarea } from "../../_ui/ui";
import { currencyOf, day, money2, toNumber } from "../../_ui/format";
import { useSalesTheme } from "../../_ui/theme";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function ProductPage({ userInfo, businessInfo, Backdata }) {
  const p = Backdata;
  const currency = currencyOf(businessInfo);
  const code = p.ADCcode || p.ACDcode;
  const vat = toNumber(p.VAT);

  useProductTour(p.Name);

  return (
    <AppShell userData={{ user: userInfo, business: businessInfo }} title={p.Name || "Product"} subtitle={code || "Product"} back tabs={false}>
      <Card className="flex items-center gap-4 p-4">
        { }
        <img src={p.image || "/preview.png"} alt={p.Name} className="h-24 w-24 shrink-0 rounded-xl border border-sp-line bg-white object-contain" />
        <div className="min-w-0 flex-1 space-y-2">
          <p className="font-semibold leading-snug">{p.Name}</p>
          <div className="flex flex-wrap gap-1.5">
            {code && <Badge tone="ink">{code}</Badge>}
            {p.category && <Badge>{p.category}</Badge>}
          </div>
        </div>
        {p.QrCode && (
           
          <img id="qrcode" src={p.QrCode} alt="Product QR code" className="h-20 w-20 shrink-0 rounded-lg border border-sp-line bg-white p-1" />
        )}
      </Card>

      <SalesChart productId={p._id} business={businessInfo} user={userInfo} currency={currency} />

      <Card id="others" className="divide-y divide-sp-line">
        <CardTitle className="border-b-0">Details</CardTitle>
        <KeyValue label="Category" value={p.category} />
        <KeyValue label="Sub-category" value={p.Subcategory} />
        <KeyValue label="Manufacturer" value={p.Manufacturer} />
        <KeyValue label="Barcode" value={p.Manufacture_code} />
        <KeyValue label="Unit" value={p.UMO} />
        <KeyValue label={`Pieces per ${p.UMO || "case"}`} value={p.Pieces} />
        <KeyValue label="VAT" value={`${vat}%`} />
      </Card>

      <Card>
        <CardTitle>Prices</CardTitle>
        {p.PriceLists?.length > 0 ? (
          <ul className="divide-y divide-sp-line">
            {p.PriceLists.map((price, i) => {
              const promoOn = Number(price.promo) > 0 && (!price.PromoDate || moment(price.PromoDate).isSameOrAfter(moment(), "day"));
              return (
                <li key={i} className="space-y-1 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="min-w-0 truncate font-medium">{pricelistSetter(price.Name ?? "Unknown price list", businessInfo)}</span>
                    <span className="shrink-0 font-semibold tabular-nums">{money2(price.price, currency)}</span>
                  </div>
                  <p className="text-xs text-sp-muted">
                    {price.vat ? `${vat}% VAT applied` : "No VAT"}
                    {Number(price.promo) > 0 && (
                      <span className={promoOn ? "text-sp-accent" : ""}>
                        {" "}
                        · Discount {money2(price.promo, currency)}
                        {price.PromoDate ? ` until ${day(price.PromoDate)}` : ""}
                      </span>
                    )}
                  </p>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="px-4 py-6 text-center text-sm text-sp-muted">No prices set.</p>
        )}
        <p className="border-t border-sp-line px-4 py-3 text-xs text-sp-muted">Prices are changed in the main ERP by an administrator.</p>
      </Card>

      <ReviewForm user={userInfo} product={p} />
    </AppShell>
  );
}

// This rep's sales of the product, month by month, this year.
function SalesChart({ productId, business, user, currency }) {
  const [months, setMonths] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      const r = await api.get(`/api/SalseandStock?Year=${moment().format("YYYY")}`);
      if (!alive) return;
      if (!r.ok) return setError("Couldn't load sales for this product.");
      const totals = new Array(12).fill(0);
      (r.data?.invoice || [])
        .filter((inv) => inv.salesPerson === user._id)
        .forEach((inv) =>
          (inv.orders || []).forEach((o) => {
            if (o.item?._id === productId) totals[moment(inv.startDate).month()] += Number(o.total) || 0;
          }),
        );
      setMonths(totals);
    })().catch(() => alive && setError("Couldn't load sales for this product."));
    return () => {
      alive = false;
    };
  }, [productId, user._id]);

  const total = months ? months.reduce((a, b) => a + b, 0) : 0;

  const [, , mode] = useSalesTheme();
  useEffect(() => {
    if (!months) return;
    // the Sales Portal's colours for the current light / dark mode
    const css = getComputedStyle(document.documentElement);
    const ink = css.getPropertyValue("--color-sp-ink").trim() || "#111827";
    const muted = css.getPropertyValue("--color-sp-muted").trim() || "#6b7280";
    const line = css.getPropertyValue("--color-sp-line").trim() || "#e5e7eb";
    const colour = business?.Color || ink;
    Plotly.newPlot(
      "myPlot",
      [{ x: MONTHS, y: months, type: "scatter", mode: "lines+markers", line: { color: colour, width: 3 }, marker: { color: colour } }],
      {
        autosize: true, margin: { l: 44, r: 12, t: 12, b: 32 }, paper_bgcolor: "rgba(0,0,0,0)", plot_bgcolor: "rgba(0,0,0,0)",
        font: { size: 11, color: muted }, xaxis: { gridcolor: line, zerolinecolor: line }, yaxis: { gridcolor: line, zerolinecolor: line },
      },
      { responsive: true, displayModeBar: false },
    );
  }, [months, business, mode]);

  return (
    <Card id="code">
      <CardTitle action={<TrendingUp className="h-4 w-4 text-sp-muted" />}>Your sales this year</CardTitle>
      {error ? (
        <p className="px-4 py-8 text-center text-sm text-sp-muted">{error}</p>
      ) : !months ? (
        <Loading label="Loading sales…" />
      ) : (
        <div className="p-3">
          <p className="px-1 text-2xl font-bold tabular-nums">{money2(total, currency)}</p>
          <p className="px-1 text-xs text-sp-muted">Estimated net sales in {moment().format("YYYY")}</p>
          <div id="myPlot" className="mt-2 h-56 w-full" />
        </div>
      )}
    </Card>
  );
}

function useProductTour(product) {
  useEffect(() => {
    if (typeof window === "undefined" || !product) return;
    let seen = null;
    try {
      seen = localStorage.getItem("ProductTour");
    } catch {
      return;
    }
    if (seen) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem("ProductTour", "ProductTour");
      } catch {
        // tour shows again next time
      }
      driver({
        showProgress: true,
        popoverClass: "driverjs-theme",
        steps: [
          { element: "#code", popover: { title: "Product sales insight", description: `Your estimated sales of ${product} this year.`, side: "bottom", align: "start" } },
          { element: "#qrcode", popover: { title: "QR code", description: "Scan the QR code to view the product on another device.", side: "left", align: "end" } },
          { element: "#others", popover: { title: "VAT & others", description: "VAT and other details of the product.", side: "top", align: "start" } },
        ],
      }).drive();
    }, 60000); // after a minute on the page
    return () => clearTimeout(t);
  }, [product]);
}

function ReviewForm({ user, product }) {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!comment.trim()) return toast.error("Write a short comment first.");
    setBusy(true);
    const r = await api.post(`/api/product/review/${product._id}`, { comment, rating, userId: user._id, userName: user.firstName });
    setBusy(false);
    if (!r.ok) return toast.error(r.data?.error || "Error saving review.");
    toast.success(r.data?.message || "Review submitted.");
    setComment("");
    setRating(0);
    router.refresh();
  };

  return (
    <Card className="space-y-4 p-4">
      <p className="font-semibold">What do customers say about it?</p>
      <Field label="Comment">
        <Textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={500} placeholder="Feedback from the field…" />
      </Field>
      <div className="space-y-1.5">
        <p className="text-sm font-medium">Rating</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((v) => (
            <button key={v} type="button" onClick={() => setRating(v)} className="rounded-lg p-1.5" aria-label={`${v} star${v > 1 ? "s" : ""}`} aria-pressed={rating >= v}>
              <Star className={`h-7 w-7 ${rating >= v ? "fill-amber-400 text-amber-400" : "text-sp-line"}`} />
            </button>
          ))}
        </div>
      </div>
      <Button className="w-full" onClick={submit} busy={busy}>
        {busy ? "Sending…" : "Submit review"}
      </Button>
    </Card>
  );
}
