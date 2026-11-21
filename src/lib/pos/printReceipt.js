// POS receipt printing on 80 mm roll paper. The receipt is written into a hidden iframe that
// holds only the receipt, sized to the roll (72 mm of print width) and as long as its content,
// then printed. (Printing the POS page itself and hiding the rest of the app at print time gave
// a blank Letter/A4 page: the receipt sat inside the app layout and "@page { size: 80mm auto }"
// isn't valid CSS, so the paper size was ignored.)

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const money = (n) =>
  `₦${Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const row = (left, right, style = "") => `<div class="row"${style ? ` style="${style}"` : ""}><span>${left}</span><span>${right}</span></div>`;

/** The receipt as a complete HTML document (also used to preview it). */
export function receiptHtml(receipt, business = {}) {
  const r = receipt || {};
  const pay = r.payment || {};
  const when = r.date ? new Date(r.date) : new Date();
  const lines = (r.lines || [])
    .map(
      (l) => `
      <div class="line">
        <div class="name">${esc(l.name)}</div>
        ${row(`${esc(l.pcs)} pcs × ${esc(money(l.piecePrice))}${Number(l.vatPercent) > 0 ? ` +${esc(l.vatPercent)}% VAT` : ""}`, esc(money(l.total)))}
      </div>`,
    )
    .join("");
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${esc(r.reference || "Receipt")}</title>
<style>
  @page { size: 80mm 200mm; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #fff; color: #000; }
  body { width: 80mm; }
  .receipt { width: 72mm; margin: 0 auto; padding: 3mm 0 5mm; font-family: "Courier New", Courier, monospace; font-size: 11px; line-height: 1.35; }
  .center { text-align: center; }
  .shop { font-size: 14px; font-weight: 700; }
  .logo { display: block; max-height: 18mm; max-width: 50mm; margin: 0 auto 2mm; }
  .rule { border-top: 1px dashed #000; margin: 2mm 0; }
  .row { display: flex; justify-content: space-between; gap: 2mm; }
  .row span:last-child { white-space: nowrap; }
  .line { margin-bottom: 1.5mm; }
  .name { word-break: break-word; }
  .total { font-size: 13px; font-weight: 700; border-top: 1px solid #000; margin-top: 1mm; padding-top: 1mm; }
  .muted { font-size: 10px; }
</style></head>
<body><div class="receipt">
  <div class="center">
    ${business.logo ? `<img class="logo" src="${esc(business.logo)}" alt="">` : ""}
    <div class="shop">${esc(business.name)}</div>
    ${business.address ? `<div>${esc(business.address)}</div>` : ""}
    ${business.phone ? `<div>Tel: ${esc(business.phone)}</div>` : ""}
    <div style="margin-top:2mm">${esc(when.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }))}</div>
    <div>${esc(r.reference)}</div>
    <div>Cashier: ${esc(pay.cashier || r.cashier)}</div>
    ${r.customer ? `<div>Customer: ${esc(r.customer)}</div>` : ""}
  </div>
  <div class="rule"></div>
  ${lines}
  <div class="rule"></div>
  ${row("Subtotal", esc(money(r.subTotal)))}
  ${Number(r.discount) > 0 ? row("Discount", `-${esc(money(r.discount))}`) : ""}
  ${Number(r.vat) > 0 ? row("VAT included", esc(money(r.vat))) : ""}
  <div class="row total"><span>TOTAL</span><span>${esc(money(r.grandTotal))}</span></div>
  ${row(`Paid (${esc(pay.method || "")})`, esc(money(pay.tendered ?? r.grandTotal)))}
  ${Number(pay.change) > 0 ? row("Change", esc(money(pay.change))) : ""}
  <div class="rule"></div>
  <div class="center">
    <div>Thank you for your patronage!</div>
    <div class="muted">Goods sold are not returnable without this receipt.</div>
  </div>
</div></body></html>`;
}

/** Prints the receipt on the POS printer (the browser's print dialog, 80 mm paper). */
export function printReceipt(receipt, business = {}) {
  if (typeof window === "undefined") return;
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:80mm;height:0;border:0;visibility:hidden;";
  document.body.appendChild(frame);
  const doc = frame.contentDocument || frame.contentWindow.document;
  doc.open();
  doc.write(receiptHtml(receipt, business));
  doc.close();

  const go = () => {
    // the paper is as long as the receipt (a roll printer cuts there)
    const px = doc.body.scrollHeight || 600;
    const mm = Math.ceil((px * 25.4) / 96) + 2;
    const style = doc.createElement("style");
    style.textContent = `@page { size: 80mm ${mm}mm; margin: 0; }`;
    doc.head.appendChild(style);
    frame.contentWindow.focus();
    frame.contentWindow.print();
    setTimeout(() => frame.remove(), 60000);
  };
  // wait for the logo (if any) so it isn't printed blank
  const imgs = [...doc.images];
  if (!imgs.length) return setTimeout(go, 50);
  let left = imgs.length;
  const done = () => (--left <= 0 ? go() : null);
  imgs.forEach((img) => (img.complete ? done() : (img.onload = img.onerror = done)));
}
