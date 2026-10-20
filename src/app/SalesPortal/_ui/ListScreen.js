"use client";

// The list screens of the Sales Portal (products, customers, stock reports, requisitions):
// a search box, optional status filter, and one card of tappable rows.

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, FileBarChart2, LocateFixed, Package, Search, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import AppShell from "./AppShell";
import { Alert, Avatar, Button, Card, Chips, Empty, Field, Input, Row, Segmented, Sheet, StatusBadge, Textarea } from "./ui";
import { currencyOf, day, money } from "./format";

const STEP = 30;

const lower = (v) => String(v ?? "").toLowerCase();
const time = (v) => new Date(v || 0).getTime() || 0;
const customerName = (c) => (c && typeof c === "object" ? c.Username : "");

const MODULES = {
  Products: {
    title: "Products",
    icon: Package,
    search: (p) => [p.Name, p.ADCcode, p.ACDcode, p.category, p.Manufacturer],
    sort: (a, b) => String(a.Name || "").trim().localeCompare(String(b.Name || "").trim()),
    empty: ["No products yet", "Products from your business appear here."],
    placeholder: "Search name or code",
  },
  Customers: {
    title: "My customers",
    icon: Users,
    search: (c) => [c.Username, c.Name, c.CustomerCode, c.phone, c.ContactPerson, c.contactPerson, c.Email],
    sort: (a, b) => String(a.Username || a.Name || "").trim().localeCompare(String(b.Username || b.Name || "").trim()),
    empty: ["No customers yet", "Customers assigned to you appear here. Add a lead to start."],
    placeholder: "Search name, code or phone",
  },
  Reports: {
    title: "Stock reports",
    icon: FileBarChart2,
    search: (r) => [r.Ref, r.status, customerName(r.CustomerId)],
    sort: (a, b) => time(b.createdAt) - time(a.createdAt),
    status: (r) => r.status,
    empty: ["No stock reports yet", "Open a customer and tap “Capture stock level” to start one."],
    placeholder: "Search reference or customer",
  },
  Requisitions: {
    title: "Requisitions",
    icon: ClipboardList,
    search: (r) => [r.billReferenceNo, r.billStatus, r.customerName],
    sort: (a, b) => time(b.createdAt || b.startDate) - time(a.createdAt || a.startDate) || (Number(b.billReferenceNo) || 0) - (Number(a.billReferenceNo) || 0),
    status: (r) => r.billStatus,
    empty: ["No requisitions yet", "Open a customer and tap “Sell to customer” to raise one."],
    placeholder: "Search reference, customer or status",
  },
};

export default function ListScreen({ userData, module, items = [], error = "" }) {
  const cfg = MODULES[module];
  const currency = currencyOf(userData?.business);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [limit, setLimit] = useState(STEP);
  const [addOpen, setAddOpen] = useState(false);

  const all = useMemo(() => [...(Array.isArray(items) ? items : [])].sort(cfg.sort), [items, cfg]);

  // status filter: the statuses actually present, most common first
  const statuses = useMemo(() => {
    if (!cfg.status) return [];
    const counts = new Map();
    all.forEach((it) => {
      const s = cfg.status(it);
      if (s) counts.set(s, (counts.get(s) || 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([s]) => s);
  }, [all, cfg]);

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all.filter((it) => {
      if (status !== "all" && cfg.status?.(it) !== status) return false;
      if (!q) return true;
      return cfg.search(it).some((v) => lower(v).includes(q));
    });
  }, [all, search, status, cfg]);

  useEffect(() => setLimit(STEP), [search, status]);

  const filterOptions = [["all", `All ${all.length}`], ...statuses.map((s) => [s, s])];

  return (
    <AppShell userData={userData} title={cfg.title} subtitle={`${all.length} in total`}>
      {error && <Alert>{error}</Alert>}

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-sp-muted" />
          <Input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={cfg.placeholder} aria-label={cfg.placeholder} className="pl-10" />
        </div>
        {module === "Customers" && (
          <Button onClick={() => setAddOpen(true)} aria-label="Add a new lead" className="px-4">
            <UserPlus className="h-5 w-5" /> <span className="hidden min-[380px]:inline">Lead</span>
          </Button>
        )}
      </div>

      {statuses.length > 1 &&
        (statuses.length <= 2 ? (
          <Segmented options={filterOptions} value={status} onChange={setStatus} label="Status" />
        ) : (
          <Chips options={filterOptions} value={status} onChange={setStatus} label="Status" />
        ))}

      {all.length === 0 && !error ? (
        <Empty icon={cfg.icon} title={cfg.empty[0]} text={cfg.empty[1]}>
          {module === "Customers" && (
            <Button className="mt-2" onClick={() => setAddOpen(true)}>
              <UserPlus className="h-5 w-5" /> Add a lead
            </Button>
          )}
        </Empty>
      ) : shown.length === 0 ? (
        <Empty title="Nothing matches" text={search.trim() ? `No results for “${search.trim()}”.` : "Nothing with this status."} />
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-sp-line">
            {shown.slice(0, limit).map((it) => (
              <li key={it._id}>
                <ItemRow module={module} item={it} currency={currency} />
              </li>
            ))}
          </ul>
          {shown.length > limit && (
            <button type="button" onClick={() => setLimit(limit + STEP)} className="w-full border-t border-sp-line py-3 text-sm font-semibold text-sp-info">
              Show more ({shown.length - limit})
            </button>
          )}
        </Card>
      )}

      {module === "Customers" && <AddLeadSheet open={addOpen} onClose={() => setAddOpen(false)} userData={userData} />}
    </AppShell>
  );
}

function ItemRow({ module, item: it, currency }) {
  const href = `/SalesPortal/${module}/${it._id}`;

  if (module === "Products") {
    return (
      <Row
        href={href}
        leading={<Avatar src={it.image || it.Image} name={it.Name} size={44} className="object-contain" />}
        title={it.Name}
        meta={[it.ADCcode || it.ACDcode, it.category, it.UMO].filter(Boolean).join(" · ")}
      />
    );
  }

  if (module === "Customers") {
    const name = it.Username || it.Name;
    const debt = Number(it.Debt) || 0;
    return (
      <Row
        href={href}
        leading={<Avatar src={it.Image || it.image} name={name} size={44} />}
        title={name}
        meta={[it.CustomerCode, it.phone].filter(Boolean).join(" · ")}
        trailing={debt > 0 ? <span className="shrink-0 text-sm font-semibold tabular-nums text-sp-bad">{money(debt, currency)}</span> : null}
      />
    );
  }

  if (module === "Reports") {
    return (
      <Row
        href={href}
        title={customerName(it.CustomerId) || it.Ref}
        meta={[it.Ref, day(it.createdAt)].filter(Boolean).join(" · ")}
        trailing={<StatusBadge status={it.status} />}
      />
    );
  }

  return (
    <Row
      href={href}
      title={it.customerName || `${it.billStatus}/${it.billReferenceNo}`}
      meta={[it.billReferenceNo && `#${it.billReferenceNo}`, day(it.createdAt || it.startDate)].filter(Boolean).join(" · ")}
      trailing={
        <span className="flex shrink-0 flex-col items-end gap-1">
          {it.grandTotal != null && <span className="text-sm font-semibold tabular-nums">{money(it.grandTotal, currency)}</span>}
          <StatusBadge status={it.billStatus} />
        </span>
      }
    />
  );
}

// "Add a lead": a new prospect with the address filled in from where the rep stands.
function AddLeadSheet({ open, onClose, userData }) {
  const router = useRouter();
  const blank = { salesPerson: userData?.user?._id, signUpVia: "sales-app" };
  const [form, setForm] = useState(blank);
  const [locating, setLocating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const locate = () => {
    if (!("geolocation" in navigator)) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        let billingAddress;
        try {
          const apiKey = "838e5f01c66d4d97a7334734fbd2e10a";
          const res = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}&no_annotations=1`);
          const data = await res.json();
          if (data.results?.length > 0) {
            const c = data.results[0].components;
            billingAddress =
              [c.house_number, c.road, c.suburb || c.neighbourhood, c.city || c.town || c.village, c.state, c.country].filter(Boolean).join(", ") ||
              data.results[0].formatted;
          }
        } catch {
          // the address stays for the rep to type
        }
        setForm((f) => ({ ...f, latitude, longitude, ...(billingAddress && !f.billingAddress ? { billingAddress } : {}) }));
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  // look up the address each time the sheet opens
  useEffect(() => {
    if (open) locate();
  }, [open]);

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const r = await api.post("/api/Sales/Register-customer", form);
    setBusy(false);
    if (!r.ok) {
      setError(r.data?.message || r.error || "Couldn't save the lead. Please try again.");
      return;
    }
    toast.success(r.data?.message || "Lead saved.");
    setForm(blank);
    onClose();
    if (r.data?.newCustomer) router.push(`/SalesPortal/Customers/${r.data.newCustomer}`);
    else router.refresh();
  };

  return (
    <Sheet open={open} onClose={busy ? undefined : onClose} title="New lead">
      <form id="add-lead" onSubmit={submit} className="space-y-4">
        <Field label="Business name">
          <Input required name="Username" value={form.Username || ""} onChange={set} placeholder="ABC Enterprises Ltd." />
        </Field>
        <Field label="Contact person">
          <Input required name="ContactPerson" value={form.ContactPerson || ""} onChange={set} placeholder="Full name" autoComplete="name" />
        </Field>
        <Field label="Phone">
          <Input required type="tel" name="phone" value={form.phone || ""} onChange={set} placeholder="0803 123 4567" inputMode="tel" autoComplete="tel" />
        </Field>
        <Field label="Email (optional)">
          <Input type="email" name="Email" value={form.Email || ""} onChange={set} placeholder="company@example.com" inputMode="email" />
        </Field>
        <Field label="Office address" hint={locating ? "Finding your address…" : form.latitude ? "Location saved with the lead." : ""}>
          <Textarea required name="billingAddress" value={form.billingAddress || ""} onChange={set} placeholder="Street, area, city" className="resize-none" />
        </Field>
        {!form.latitude && !locating && (
          <button type="button" onClick={locate} className="inline-flex items-center gap-1.5 text-sm font-medium text-sp-info">
            <LocateFixed className="h-4 w-4" /> Use my current location
          </button>
        )}
        {error && <Alert>{error}</Alert>}
        <div className="flex gap-2 pt-1">
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" busy={busy}>
            {busy ? "Saving…" : "Save lead"}
          </Button>
        </div>
      </form>
    </Sheet>
  );
}
