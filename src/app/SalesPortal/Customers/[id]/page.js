"use client";

// One customer: balance, contact, quick actions (sell, stock check, payment, statement,
// support ticket), then details, ledger, location and sales history in sections.

import { useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import {
  Camera,
  Download,
  FileText,
  History,
  LifeBuoy,
  LocateFixed,
  Mail,
  MapPin,
  Navigation,
  Paperclip,
  Phone,
  ReceiptText,
  ShoppingCart,
  SquarePen,
  Wallet,
} from "lucide-react";
import api from "@/lib/api";
import { saveCustomerStatementPdf } from "@/lib/pdf/customerStatementPdf";
import { downloadExcel } from "../../../../../Functions/Functions";
import TextToSpeechPlayer from "@/app/Components/TextToSpeech";
import CustomerSalesLoader from "@/app/Components/CustomerSalesLoader";
import GenerealSalesMargin from "@/app/Components/GenerealSalesMargin";
import AppShell from "../../_ui/AppShell";
import { Alert, Badge, BottomBar, Button, Card, CardTitle, ConfirmSheet, Field, Input, Pager, Section, Select, Sheet, Textarea, When } from "../../_ui/ui";
import { currencyOf, day, mapEmbed, mapsLink, money, money2, whatsappLink } from "../../_ui/format";
import { WhatsAppLogo } from "../../_ui/icons";

const LEDGER_PAGE = 10;

export default function CustomerPage({ userInfo, data, cust }) {
  const params = useParams();
  const router = useRouter();
  const user = userInfo.user;
  const business = userInfo.business;
  const currency = currencyOf(business);

  const [open, setOpen] = useState({});
  const toggle = (k) => setOpen((o) => ({ ...o, [k]: !o[k] }));
  const [sheet, setSheet] = useState(null); // payment | statement | ticket | geo
  const [busy, setBusy] = useState(""); // sell | stock

  if (!cust) {
    return (
      <AppShell userData={userInfo} title="Customer" back tabs={false}>
        <Alert>Customer not found.</Alert>
      </AppShell>
    );
  }

  const debt = Number(cust.Debt) || 0;
  const address = cust.billingAddress || cust.deliveryAddress || cust.street || "";
  const sales = data.Bills || [];
  const canSell = user.raiseInvoice && !cust.blocked && cust.location && cust.priceList;
  const canPay = user.postPayment && !cust.blocked && cust.BankJournal;
  const directions = mapsLink({ latitude: cust.latitude, longitude: cust.longitude, address: address || cust.state });
  const wa = whatsappLink(cust.phone);

  const sell = async () => {
    setBusy("sell");
    const r = await api.post(`/api/Sales_Portal/requisition/new/${user._id}`, { customer: cust._id, whId: cust.location });
    if (r.ok && r.data?.result) {
      router.push(`/SalesPortal/Requisitions/${r.data.result}`);
      return;
    }
    setBusy("");
    toast.error(r.data?.error || r.error || "Couldn't start the requisition.");
  };

  const captureStock = async () => {
    setBusy("stock");
    const r = await api.post(`/api/Sales_Portal/stock/position/new`, { leadId: cust._id });
    if (r.ok && r.data?.data) {
      router.push(`/SalesPortal/Reports/${r.data.data}`);
      return;
    }
    setBusy("");
    toast.error("Couldn't start a stock report for this customer.");
    router.refresh();
  };

  const actions = [
    canSell && { key: "sell", icon: ShoppingCart, label: "Sell to customer", onClick: sell },
    { key: "stock", icon: Camera, label: "Capture stock level", onClick: captureStock },
    canPay && { key: "payment", icon: Wallet, label: "Register payment", onClick: () => setSheet("payment") },
    { key: "statement", icon: ReceiptText, label: "Statement (PDF)", onClick: () => setSheet("statement") },
    { key: "ticket", icon: LifeBuoy, label: "Support ticket", onClick: () => setSheet("ticket") },
  ].filter(Boolean);

  return (
    <AppShell userData={userInfo} title={cust.Username} subtitle={cust.CompanyName || cust.CustomerCode || "Customer"} back tabs={false}>
      {/* Balance */}
      <Card className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-sp-muted">{debt > 0 ? "Owes you" : debt < 0 ? `${business.companyName} owes them` : "Balance"}</p>
            <p className={`text-3xl font-bold tabular-nums tracking-tight ${debt > 0 ? "text-sp-bad" : debt < 0 ? "text-sp-accent" : ""}`}>
              {money2(Math.abs(debt), currency)}
            </p>
          </div>
          {cust.blocked ? <Badge tone="bad">Blocked</Badge> : cust.status ? <Badge tone="ok">{cust.status}</Badge> : null}
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-xl bg-sp-bg px-3 py-2">
            <p className="text-xs text-sp-muted">Credit limit</p>
            <p className="font-semibold tabular-nums">{money(cust.creditLimit, currency)}</p>
          </div>
          <div className="rounded-xl bg-sp-bg px-3 py-2">
            <p className="text-xs text-sp-muted">{debt > 0 && cust.lastPayDate ? "Owing for" : "Payment terms"}</p>
            <p className="truncate font-semibold">
              {debt > 0 && cust.lastPayDate && moment(cust.lastPayDate).isValid()
                ? `${moment().diff(moment(cust.lastPayDate), "days")} days`
                : cust.paymentTerms || "—"}
            </p>
          </div>
        </div>
        <div className="-mx-1 flex items-center justify-between text-sp-muted">
          <TextToSpeechPlayer text={customerSummary(cust)} />
        </div>
      </Card>

      {/* Contact */}
      <Card className="divide-y divide-sp-line">
        <div className="flex items-start gap-3 p-4">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-sp-muted" />
          <div className="min-w-0 flex-1 space-y-1 text-[15px]">
            <p>{address || "No address on file."}</p>
            {(cust.contactPerson || cust.ContactPerson) && <p className="text-sm text-sp-muted">Contact: {cust.contactPerson || cust.ContactPerson}</p>}
            {cust.Email && (
              <a href={`mailto:${cust.Email}`} className="flex items-center gap-1.5 text-sm text-sp-info">
                <Mail className="h-4 w-4" /> <span className="truncate">{cust.Email}</span>
              </a>
            )}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 p-3">
          {cust.phone ? (
            <a href={`tel:${cust.phone}`} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-sp-line text-sm font-semibold hover:bg-sp-bg">
              <Phone className="h-4 w-4" /> Call
            </a>
          ) : (
            <span className="inline-flex h-11 items-center justify-center rounded-xl border border-sp-line text-sm text-sp-muted">No phone</span>
          )}
          {wa ? (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-sp-line text-sm font-semibold hover:bg-sp-bg">
              <WhatsAppLogo className="h-5 w-5" /> Chat
            </a>
          ) : (
            <span className="inline-flex h-11 items-center justify-center rounded-xl border border-sp-line text-sm text-sp-muted">—</span>
          )}
          {directions ? (
            <a href={directions} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-sp-line text-sm font-semibold hover:bg-sp-bg">
              <Navigation className="h-4 w-4" /> Go
            </a>
          ) : (
            <span className="inline-flex h-11 items-center justify-center rounded-xl border border-sp-line text-sm text-sp-muted">No map</span>
          )}
        </div>
      </Card>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        {actions.map(({ key, icon: Icon, label, onClick }) => (
          <button
            key={key}
            type="button"
            onClick={onClick}
            disabled={Boolean(busy)}
            className="flex min-h-20 flex-col items-start justify-between gap-2 rounded-2xl border border-sp-line bg-sp-surface p-4 text-left text-sm font-semibold transition hover:border-sp-ink/30 disabled:opacity-60"
          >
            <Icon className={`h-5 w-5 ${busy === key ? "animate-pulse" : "text-sp-muted"}`} />
            {busy === key ? "Opening…" : label}
          </button>
        ))}
      </div>

      {/* Sales this year */}
      <Card>
        <CardTitle>Sales this year</CardTitle>
        <div className="p-2">
          <GenerealSalesMargin yearlysales={sales} warehouses={[]} />
        </div>
      </Card>

      <Section title="Details" icon={SquarePen} open={open.details} onToggle={() => toggle("details")} meta={user.editCustomer ? "Edit" : ""}>
        <DetailsForm cust={cust} states={data.AllStates || []} canEdit={Boolean(user.editCustomer)} onGeo={() => setSheet("geo")} />
      </Section>

      <Section title="Ledger" icon={FileText} open={open.ledger} onToggle={() => toggle("ledger")} meta={`${data.transcations?.length || 0}`}>
        <Ledger rows={data.transcations || []} cust={cust} business={business} currency={currency} />
      </Section>

      <Section title="Location" icon={MapPin} open={open.location} onToggle={() => toggle("location")}>
        <div className="space-y-3 p-3">
          {mapEmbed({ latitude: cust.latitude, longitude: cust.longitude, address: cust.state }) ? (
            <iframe
              title="Customer location"
              src={mapEmbed({ latitude: cust.latitude, longitude: cust.longitude, address: cust.state })}
              className="h-64 w-full rounded-xl border border-sp-line"
              loading="lazy"
            />
          ) : (
            <p className="py-6 text-center text-sm text-sp-muted">No location saved yet.</p>
          )}
          <Button variant="outline" className="w-full" onClick={() => setSheet("geo")}>
            <LocateFixed className="h-5 w-5" /> I&apos;m at the customer: save location
          </Button>
        </div>
      </Section>

      <Section title="Sales history" icon={History} open={open.pipeline} onToggle={() => toggle("pipeline")}>
        <div className="p-3">
          {open.pipeline && <CustomerSalesLoader customerParamId={params.id} customer={cust} business={business} Rep={[]} />}
        </div>
      </Section>

      <p className="pb-2 text-center text-xs text-sp-muted">
        Registered <When iso={cust.createdAt} dateOnly /> · Updated <When iso={cust.updatedAt} dateOnly />
      </p>

      {(canSell || canPay) && (
        <BottomBar>
          {canSell && (
            <Button className="flex-1" onClick={sell} busy={busy === "sell"} disabled={Boolean(busy)}>
              {busy !== "sell" && <ShoppingCart className="h-5 w-5" />} Sell to customer
            </Button>
          )}
          {canPay && (
            <Button variant={canSell ? "outline" : "primary"} className={canSell ? "" : "flex-1"} onClick={() => setSheet("payment")} aria-label="Register payment">
              <Wallet className="h-5 w-5" /> {canSell ? "" : "Register payment"}
            </Button>
          )}
        </BottomBar>
      )}

      <PaymentSheet open={sheet === "payment"} onClose={() => setSheet(null)} cust={cust} user={user} currency={currency} />
      <StatementSheet open={sheet === "statement"} onClose={() => setSheet(null)} cust={cust} business={business} />
      <TicketSheet open={sheet === "ticket"} onClose={() => setSheet(null)} cust={cust} />
      <GeoSheet open={sheet === "geo"} onClose={() => setSheet(null)} cust={cust} />
    </AppShell>
  );
}

// Read-aloud summary for the rep (the "Read summary" button).
function customerSummary(customer) {
  const totalDebt = customer.Debt || 0;
  const purchaseHistory = customer.SandS || [];
  const isOwing = totalDebt > 0;
  const lastPay = customer.lastPayDate
    ? new Date(customer.lastPayDate).toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" })
    : "No payment recorded";

  let advice;
  if (!customer.lastPayDate) {
    advice = "No payment history detected. Consider initiating engagement with a welcome offer, starter bundle, or introductory discount to build trust.";
  } else if (isOwing && totalDebt > 100000) {
    advice = "Customer has a high outstanding balance. Recommend a structured repayment plan, possibly with milestone-based incentives to encourage timely settlement.";
  } else if (isOwing && totalDebt > 50000) {
    advice = "Customer owes a significant amount. A loyalty-based discount or flexible payment option may improve recovery and retention.";
  } else if (isOwing && totalDebt <= 5000) {
    advice = "Minor outstanding balance. A gentle reminder or automated nudge may suffice to prompt payment.";
  } else if (!isOwing && purchaseHistory.length >= 5) {
    advice = "Customer demonstrates strong purchasing behavior. Consider offering exclusive access to premium products, early-bird promotions, or a referral incentive.";
  } else if (!isOwing && purchaseHistory.length >= 3) {
    advice = "Customer is consistent and reliable. Upselling complementary products or bundling services could enhance value and increase average order size.";
  } else if (!isOwing && purchaseHistory.length === 1) {
    advice = "Customer has made a single purchase. Follow up with a personalized recommendation or limited-time offer to encourage repeat business.";
  } else {
    advice = "Maintain regular communication, and consider seasonal campaigns or loyalty perks to deepen engagement.";
  }

  return `
     Customer Profile: ${customer.Username}

     Account Summary:
    - Current Balance: ₦${totalDebt?.toLocaleString()}.
    - Last Payment Date: ${lastPay},

    Strategic Insight:
    ${advice}
    `;
}

function DetailsForm({ cust, states, canEdit, onGeo }) {
  const router = useRouter();
  const [form, setForm] = useState({ bankJournal: "", ...cust });
  const [busy, setBusy] = useState(false);

  const set = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    const r = await api.patch(`/api/customer/update/${cust._id}`, form);
    setBusy(false);
    if (r.ok && r.data?.message) {
      toast.success(r.data.message);
      router.refresh();
    } else {
      toast.error(r.data?.error || r.error || "Couldn't save the changes.");
    }
  };

  const input = (label, name, props = {}) => (
    <Field label={label}>
      <Input name={name} value={form[name] ?? ""} onChange={set} disabled={!canEdit || props.disabled} {...props} />
    </Field>
  );

  const stateOptions = states.map((s) => (typeof s === "object" ? { value: s.value, label: s.label } : { value: s, label: s }));

  return (
    <form onSubmit={save} className="space-y-6 p-4">
      <fieldset className="space-y-4">
        <legend className="mb-3 text-xs font-semibold uppercase tracking-wide text-sp-muted">Business</legend>
        {input("Business name", "Username")}
        {input("Customer code", "CustomerCode", { disabled: true })}
        {input("Tax ID (TIN)", "TIN")}
        {input("Industry", "industryType")}
        <Field label="Customer type">
          <Select name="customerType" value={form.customerType || ""} onChange={set} disabled={!canEdit}>
            <option value="">Choose…</option>
            <option value="Business">Business</option>
            <option value="Individual">Individual</option>
          </Select>
        </Field>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-3 text-xs font-semibold uppercase tracking-wide text-sp-muted">Contact</legend>
        {input("Email", "Email", { type: "email", inputMode: "email" })}
        {input("Phone", "phone", { type: "tel", inputMode: "tel" })}
        {input("Contact person", "contactPerson")}
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-3 text-xs font-semibold uppercase tracking-wide text-sp-muted">Location</legend>
        {input("Country", "country")}
        <Field label="State">
          <Select name="state" value={form.state || ""} onChange={set} disabled={!canEdit}>
            <option value={form.state || ""}>{form.state || "Choose…"}</option>
            {stateOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Address">
          <Input name="billingAddress" value={form.billingAddress ?? form.street ?? ""} onChange={set} disabled={!canEdit} />
        </Field>
        {input("Region", "Region")}
        {input("Merchandiser", "merchandiser")}
        <div className="grid grid-cols-2 gap-3">
          {input("Latitude", "latitude", { inputMode: "decimal" })}
          {input("Longitude", "longitude", { inputMode: "decimal" })}
        </div>
        <button type="button" onClick={onGeo} className="inline-flex items-center gap-1.5 text-sm font-medium text-sp-info">
          <LocateFixed className="h-4 w-4" /> Use my current location (at the customer)
        </button>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-3 text-xs font-semibold uppercase tracking-wide text-sp-muted">Terms</legend>
        <Field label="Payment terms">
          <Select name="paymentTerms" value={form.paymentTerms || ""} onChange={set} disabled={!canEdit}>
            <option value="">Choose…</option>
            {[...new Set([cust.paymentTerms, "Cash on Delivery", "Credit customer", "Payment before delivery"].filter(Boolean))].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Preferred shipping">
          <Select name="preferredShippingMethod" value={form.preferredShippingMethod || ""} onChange={set} disabled={!canEdit}>
            <option value="">Choose…</option>
            {[...new Set([cust.preferredShippingMethod, "Air", "Sea", "Land"].filter(Boolean))].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </Field>
        {cust.Email && (
          <label className="flex items-center gap-3 rounded-xl border border-sp-line px-4 py-3 text-[15px]">
            <input type="checkbox" name="NewsFeedSubscription" checked={Boolean(form.NewsFeedSubscription)} onChange={set} disabled={!canEdit} className="h-5 w-5 accent-sp-ink" />
            Send a quarterly statement by email
          </label>
        )}
      </fieldset>

      {canEdit && (
        <Button type="submit" className="w-full" busy={busy}>
          {busy ? "Saving…" : "Save changes"}
        </Button>
      )}
    </form>
  );
}

function Ledger({ rows, cust, business, currency }) {
  const [page, setPage] = useState(1);
  const pages = Math.ceil(rows.length / LEDGER_PAGE);
  const current = rows.slice((page - 1) * LEDGER_PAGE, page * LEDGER_PAGE);
  const debt = Number(cust.Debt) || 0;

  if (!rows.length) return <p className="px-4 py-8 text-center text-sm text-sp-muted">No transactions yet.</p>;

  return (
    <div>
      <ul className="divide-y divide-sp-line">
        {current.map((tx, i) => (
          <li key={i} className="flex items-start gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-medium" title={tx.ReferenceNo}>
                {tx.ReferenceNo}
              </p>
              <p className="text-xs text-sp-muted">
                {day(tx.Date)}
                {tx.CreditAmount > 0 && <span className="text-sp-accent"> · CR {money(tx.CreditAmount, currency)}</span>}
                {tx.DebitAmount > 0 && <span className="text-sp-bad"> · DR {money(tx.DebitAmount, currency)}</span>}
              </p>
            </div>
            <span className={`shrink-0 text-sm font-semibold tabular-nums ${tx.Balance < 0 ? "text-sp-accent" : ""}`}>{money(tx.Balance, currency)}</span>
          </li>
        ))}
      </ul>
      <div className="space-y-3 border-t border-sp-line p-3">
        <Pager page={page} pages={pages} onChange={setPage} />
        <Alert kind={debt < 0 ? "ok" : debt > 0 ? "warn" : "info"}>
          {debt < 0
            ? `${business.companyName} owes ${cust.Username} ${money2(Math.abs(debt), currency)}.`
            : debt > 0
              ? `${cust.Username} owes ${business.companyName} ${money2(debt, currency)}.`
              : "The account is settled."}
        </Alert>
        <Button variant="outline" className="w-full" onClick={() => downloadExcel(rows, `${String(cust.Username || "").substring(0, 8)} transaction`)}>
          <Download className="h-5 w-5" /> Download as Excel
        </Button>
      </div>
    </div>
  );
}

function PaymentSheet({ open, onClose, cust, user, currency }) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ amount: "", date: today, reference: "", type: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const close = () => {
    if (busy) return;
    setDone(null);
    setError("");
    setForm({ amount: "", date: today, reference: "", type: "" });
    onClose();
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.date || !form.type) return setError("Amount, date and payment method are needed.");
    // cash without a reference gets one made up
    const reference = form.reference.trim() || (form.type === "Cash" ? `Cash-${Date.now()}` : "");
    if (!reference) return setError("Enter the transfer reference.");
    setBusy(true);
    setError("");
    const r = await api.post(`/api/Payment/${cust._id}`, {
      customer: cust._id,
      Amount: form.amount,
      Date: form.date,
      paymentReferenceNo: reference,
      type: form.type,
      Accountant: `${user.firstName} ${user.lastName}`,
    });
    setBusy(false);
    if (!r.ok) return setError(r.data?.error || r.error || "Payment failed. Please try again.");
    setDone({ ...form, reference, id: r.data?.data });
  };

  return (
    <Sheet open={open} onClose={close} title={done ? "Payment registered" : "Register payment"}>
      {done ? (
        <div className="space-y-4">
          <Alert kind="ok">The payment was registered and is waiting for approval.</Alert>
          <Card className="divide-y divide-sp-line">
            <div className="flex justify-between px-4 py-3 text-[15px]">
              <span className="text-sp-muted">Amount</span>
              <span className="font-semibold">{money(done.amount, currency)}</span>
            </div>
            <div className="flex justify-between px-4 py-3 text-[15px]">
              <span className="text-sp-muted">Date</span>
              <span>{done.date}</span>
            </div>
            <div className="flex justify-between gap-4 px-4 py-3 text-[15px]">
              <span className="text-sp-muted">Reference</span>
              <span className="truncate">{done.reference}</span>
            </div>
            <div className="flex justify-between px-4 py-3 text-[15px]">
              <span className="text-sp-muted">Method</span>
              <span>{done.type}</span>
            </div>
          </Card>
          <div className="flex gap-2">
            {done.id && (
              <a href={`/auth/V4/payment/payment/${done.id}?Module=payment`} className="inline-flex h-12 items-center justify-center rounded-xl border border-sp-line px-4 text-[15px] font-semibold">
                View
              </a>
            )}
            <Button className="flex-1" onClick={close}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <p className="text-sm text-sp-muted">Payment received from {cust.Username}.</p>
          <Field label={`Amount${currency ? ` (${currency})` : ""}`}>
            <Input name="amount" type="number" min="1" step="any" inputMode="decimal" value={form.amount} onChange={set} required autoFocus />
          </Field>
          <Field label="Date">
            <Input name="date" type="date" value={form.date} max={today} onChange={set} required />
          </Field>
          <Field label="Method">
            <div className="grid grid-cols-2 gap-2">
              {["Cash", "Transfer"].map((m) => (
                <label key={m} className={`flex h-12 cursor-pointer items-center justify-center rounded-xl border text-[15px] font-semibold ${form.type === m ? "border-sp-ink bg-sp-ink text-sp-on-ink" : "border-sp-line"}`}>
                  <input type="radio" name="type" value={m} checked={form.type === m} onChange={set} className="sr-only" />
                  {m}
                </label>
              ))}
            </div>
          </Field>
          <Field label="Reference" hint={form.type === "Cash" ? "Optional for cash: one is made up if left empty." : "The bank transfer reference."}>
            <Input name="reference" value={form.reference} onChange={set} />
          </Field>
          {error && <Alert>{error}</Alert>}
          <div className="flex gap-2 pt-1">
            <Button variant="outline" onClick={close} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" variant="success" className="flex-1" busy={busy}>
              {busy ? "Registering…" : "Register payment"}
            </Button>
          </div>
        </form>
      )}
    </Sheet>
  );
}

function StatementSheet({ open, onClose, cust, business }) {
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = today.slice(0, 8) + "01";
  const [start, setStart] = useState(monthStart);
  const [end, setEnd] = useState(today);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const generate = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await api.get(`/api/customerReport/${cust._id}?Start=${start}&End=${end}`);
      const tx = res.data || [];
      if (!res.ok || tx.length < 1) throw new Error(res.data?.error || "No transactions in this period.");

      // Same document as the ERP customer page (src/lib/pdf/customerStatementPdf.js).
      await saveCustomerStatementPdf({ business, cust, startDate: start, endDate: end, transactions: tx });
      toast.success("Statement saved to your phone.");
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} onClose={busy ? undefined : onClose} title="Statement">
      <form onSubmit={generate} className="space-y-4">
        <p className="text-sm text-sp-muted">A PDF of {cust.Username}&apos;s transactions for the period.</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="From">
            <Input type="date" value={start} max={end} onChange={(e) => setStart(e.target.value)} required />
          </Field>
          <Field label="To">
            <Input type="date" value={end} min={start} max={today} onChange={(e) => setEnd(e.target.value)} required />
          </Field>
        </div>
        {error && <Alert>{error}</Alert>}
        <div className="flex gap-2 pt-1">
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" busy={busy}>
            {busy ? "Preparing…" : "Download PDF"}
          </Button>
        </div>
      </form>
    </Sheet>
  );
}

function TicketSheet({ open, onClose, cust }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [sla, setSla] = useState("");
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);
  const maxWords = 200;
  const words = message.trim().split(/\s+/).filter(Boolean).length;

  // shrink to 800×600 JPEG, then upload; the server returns the stored URLs
  const upload = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = async () => {
          try {
            let { width, height } = img;
            if (width > height && width > 800) {
              height *= 800 / width;
              width = 800;
            } else if (height > 600) {
              width *= 600 / height;
              height = 600;
            }
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            canvas.getContext("2d").drawImage(img, 0, 0, width, height);
            const r = await api(`/api/attachement`, { method: "POST", body: { image: canvas.toDataURL("image/jpeg", 0.7) } });
            const urls = r.data?.data || [];
            setPhotos((p) => [...p, ...urls.map((url) => ({ _id: uuidv4(), url }))]);
            resolve(Boolean(r.data?.message));
          } catch {
            resolve(false);
          }
        };
        img.onerror = () => resolve(false);
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });

  const pick = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    const ok = files.filter((f) => {
      if (f.size > 1024 * 1024) {
        toast.error(`“${f.name}” is over 1 MB.`);
        return false;
      }
      if (!f.type.startsWith("image/")) {
        toast.error(`“${f.name}” is not a photo.`);
        return false;
      }
      return true;
    });
    if (!ok.length) return;
    setUploading(true);
    const results = await Promise.all(ok.map(upload));
    setUploading(false);
    const good = results.filter(Boolean).length;
    if (good < results.length) toast.error(`${results.length - good} photo(s) failed to upload.`);
  };

  const send = async () => {
    if (!words) return;
    setBusy(true);
    setError("");
    const r = await api(`/api/tickets/${cust._id}`, { method: "POST", body: { message, attachments: photos, SLA: sla } });
    setBusy(false);
    if (r.data?.message) {
      toast.success(r.data.message);
      setMessage("");
      setSla("");
      setPhotos([]);
      onClose();
      router.refresh();
    } else {
      setError(r.data?.error || r.error || "Couldn't create the ticket.");
    }
  };

  return (
    <Sheet open={open} onClose={busy ? undefined : onClose} title="Support ticket">
      <Field label="What's the problem?" hint={`${words}/${maxWords} words`}>
        <Textarea
          value={message}
          onChange={(e) => {
            if (e.target.value.trim().split(/\s+/).filter(Boolean).length <= maxWords) setMessage(e.target.value);
          }}
          placeholder={`Describe the issue at ${cust.Username}`}
          className="min-h-32"
        />
      </Field>
      <Field label="Priority">
        <div className="grid grid-cols-3 gap-2">
          {["Low", "Medium", "High"].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setSla(p)}
              aria-pressed={sla === p}
              className={`h-11 rounded-xl border text-sm font-semibold ${sla === p ? "border-sp-ink bg-sp-ink text-sp-on-ink" : "border-sp-line"}`}
            >
              {p}
            </button>
          ))}
        </div>
      </Field>
      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={pick} />
      <Button variant="outline" className="w-full" onClick={() => fileRef.current?.click()} busy={uploading}>
        {!uploading && <Paperclip className="h-5 w-5" />} {uploading ? "Uploading…" : `Attach photos${photos.length ? ` (${photos.length})` : ""}`}
      </Button>
      {error && <Alert>{error}</Alert>}
      <Button className="w-full" onClick={send} disabled={!words || uploading} busy={busy}>
        {busy ? "Sending…" : "Create ticket"}
      </Button>
    </Sheet>
  );
}

// Save the rep's GPS position as the customer's location.
function GeoSheet({ open, onClose, cust }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const save = () => {
    if (!navigator.geolocation) {
      toast.error("This phone can't share its location.");
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        const r = await api.patch(`/api/customer/update/${cust._id}`, { latitude, longitude });
        setBusy(false);
        if (!r.ok) {
          toast.error(r.data?.error || r.error || "Couldn't save the location.");
          return;
        }
        toast.success("Customer location saved.");
        onClose();
        router.refresh();
      },
      (err) => {
        setBusy(false);
        toast.error(
          err.code === err.PERMISSION_DENIED
            ? "Location permission was denied."
            : err.code === err.TIMEOUT
              ? "Getting your location took too long. Try again outside or near a window."
              : "Couldn't get your location.",
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  return (
    <ConfirmSheet
      open={open}
      onClose={onClose}
      title="Save customer location?"
      text={`Your phone's GPS position will be saved as ${cust.Username}'s location. Only do this while you are at their premises with location turned on.`}
      confirmLabel={busy ? "Getting location…" : "Yes, save location"}
      busy={busy}
      onConfirm={save}
    />
  );
}
