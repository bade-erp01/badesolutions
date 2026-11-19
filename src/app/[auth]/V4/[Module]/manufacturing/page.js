"use client";

// Manufacturing (paid add-on, needs Inventory costing): bills of materials, production orders
// (release → issue components → receive finished goods → close), traceability and work in progress.
// Backend: /api/manufacturing/* (controllers/manufacturing.js).
// Roles: bills of materials = admin or "edit product"; orders = admin or warehouse manager;
// closing an order = admin, accountant or CFO. Quantities are in pieces.

import { useEffect, useMemo, useState } from "react";
import moment from "moment";
import { AlertTriangle, CheckCircle2, Factory, GitBranch, Loader2, Lock, PackageCheck, PackageMinus, Plus, RefreshCw, Trash2, X } from "lucide-react";

import BackButton from "@/app/Components/BackBotton";
import Notch from "@/app/Components/Notch";
import api from "@/lib/api";
import { useUser } from "@/components/UserProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SuccessToast } from "../../../../../../Functions/Mics";

const naira = (n) => `₦${(Number(n) || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const when = (d) => (d ? moment(d).format("DD MMM YYYY, HH:mm") : "—");
const key = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
const enc = (id) => encodeURIComponent(id);
const num = (n) => (Number(n) || 0).toLocaleString("en-NG");

const ORDER_STATUS = {
  draft: { label: "Draft", style: "bg-slate-500 hover:bg-slate-500 text-white" },
  released: { label: "Released", style: "bg-sky-600 hover:bg-sky-600 text-white" },
  inProgress: { label: "In progress", style: "bg-amber-500 hover:bg-amber-500 text-white" },
  completed: { label: "Completed", style: "bg-emerald-600 hover:bg-emerald-600 text-white" },
  closed: { label: "Closed", style: "bg-slate-800 hover:bg-slate-800 text-white" },
  cancelled: { label: "Cancelled", style: "bg-red-600 hover:bg-red-600 text-white" },
};
const BOM_STATUS = {
  draft: { label: "Draft", style: "bg-slate-500 hover:bg-slate-500 text-white" },
  active: { label: "Active", style: "bg-emerald-600 hover:bg-emerald-600 text-white" },
  archived: { label: "Archived", style: "bg-slate-300 hover:bg-slate-300 text-slate-700" },
};
const ENTRY_STATE = { pending: "in progress", done: "done", review: "needs review", failed: "failed" };

const selectClass = "h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring";

export default function Manufacturing() {
  const currentUser = useUser();
  const me = currentUser?.user?.user || {};
  const canEditBom = me.isAdmin === true || me.editProduct === true;
  const canRun = me.isAdmin === true || me.wareHouseManager === true;
  const canClose = me.isAdmin === true || me.isAccountant === true || me.isCFO === true;

  const [tab, setTab] = useState("orders");
  const [closed, setClosed] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [costingMode, setCostingMode] = useState(null); // null = unknown

  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [boms, setBoms] = useState([]);
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("open");
  const [wip, setWip] = useState(null);

  const [orderId, setOrderId] = useState(null);
  const [order, setOrder] = useState(null);
  const [trace, setTrace] = useState(null);
  const [newOrder, setNewOrder] = useState(null); // { bomId, warehouseId, plannedQty, note }
  const [bomForm, setBomForm] = useState(null); // { id?, rev?, productId, productName, note, lines: [{ productId, productName, qtyPer, scrapPct }] }

  const productName = useMemo(() => new Map(products.map((p) => [String(p._id), p.Name])), [products]);
  const storeName = useMemo(() => new Map(stores.map((s) => [String(s._id), s.WHName || "Unnamed store"])), [stores]);
  const activeBoms = useMemo(() => boms.filter((b) => b.status === "active"), [boms]);

  // 403 with an add-on message: the business doesn't have Manufacturing (or Inventory costing)
  const fail = (r) => {
    if (r.status === 403 && /add-on/i.test(r.error || "")) setClosed(r.error);
    else setError(r.error);
  };

  const loadBoms = async () => {
    const r = await api.get("/api/manufacturing/boms");
    if (r.ok) setBoms(r.data?.data || []);
    else fail(r);
    return r;
  };
  const loadOrders = async () => {
    const r = await api.get("/api/manufacturing/orders");
    if (r.ok) setOrders(r.data?.data || []);
    else fail(r);
    return r;
  };
  const loadWip = async () => {
    const r = await api.get("/api/manufacturing/wip");
    if (r.ok) setWip(r.data?.data || null);
    else fail(r);
  };
  const loadOrder = async (id = orderId) => {
    if (!id) return;
    const r = await api.get(`/api/manufacturing/orders/${enc(id)}`);
    if (r.ok) setOrder(r.data?.data || null);
    else fail(r);
  };

  const loadAll = async () => {
    setLoading(true);
    setError("");
    setClosed("");
    const first = await loadBoms();
    if (first.ok) {
      await loadOrders();
      const [p, c] = await Promise.all([api.get("/api/Products"), api.get("/api/inventory-costing/status")]);
      if (p.ok) {
        setProducts((p.data?.productList || []).filter((x) => !x.isAservice).sort((a, b) => String(a.Name).localeCompare(String(b.Name))));
        setStores(p.data?.storeList || []);
      }
      setCostingMode(c.ok ? c.data?.data?.mode || "off" : null);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);
  useEffect(() => {
    if (tab === "wip" && !closed) loadWip();
  }, [tab]);

  const post = async (name, path, body, { method = "post", idem = false } = {}) => {
    setBusy(name);
    setError("");
    const opts = idem ? { headers: { "Idempotency-Key": key() } } : undefined;
    const r = method === "patch" ? await api.patch(path, body ?? {}, opts) : await api.post(path, body ?? {}, opts);
    setBusy("");
    if (!r.ok) {
      fail(r);
      return { ok: false, r };
    }
    if (r.data?.message) SuccessToast(r.data.message);
    return { ok: true, data: r.data };
  };

  const openOrder = async (id) => {
    setOrderId(id);
    setOrder(null);
    setTrace(null);
    await loadOrder(id);
  };
  const refreshOrder = async () => {
    await Promise.all([loadOrder(), loadOrders()]);
  };

  // ── orders ────────────────────────────────────────────────────────────────────────────────
  const shownOrders = useMemo(() => {
    if (statusFilter === "all") return orders;
    if (statusFilter === "open") return orders.filter((o) => ["draft", "released", "inProgress", "completed"].includes(o.status));
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  const createOrder = async () => {
    const out = await post("createOrder", "/api/manufacturing/orders", { bomId: newOrder.bomId, warehouseId: newOrder.warehouseId, plannedQty: Number(newOrder.plannedQty), note: newOrder.note }, { idem: true });
    if (!out.ok) return;
    setNewOrder(null);
    await loadOrders();
    if (out.data?.data?._id) openOrder(out.data.data._id);
  };

  // ── bills of materials ────────────────────────────────────────────────────────────────────
  const startBom = (from) =>
    setBomForm(
      from
        ? {
            id: from.status === "draft" ? from._id : undefined,
            rev: from.status === "draft" ? from.rev : undefined,
            fixed: true,
            productId: from.productId,
            productName: from.productName,
            note: from.status === "draft" ? from.note || "" : "",
            lines: from.components.map((c) => ({ productId: c.productId, productName: c.productName, qtyPer: String(c.qtyPer), scrapPct: String(c.scrapPct || 0) })),
          }
        : { productId: "", productName: "", note: "", lines: [{ productId: "", productName: "", qtyPer: "1", scrapPct: "0" }] },
    );

  const saveBom = async () => {
    const components = bomForm.lines.filter((l) => l.productId).map((l) => ({ productId: l.productId, qtyPer: Number(l.qtyPer), scrapPct: Number(l.scrapPct || 0) }));
    const out = bomForm.id
      ? await post("saveBom", `/api/manufacturing/boms/${enc(bomForm.id)}`, { components, note: bomForm.note, rev: bomForm.rev }, { method: "patch" })
      : await post("saveBom", "/api/manufacturing/boms", { productId: bomForm.productId, components, note: bomForm.note }, { idem: true });
    if (!out.ok) return;
    if (bomForm.id) SuccessToast("Draft saved.");
    setBomForm(null);
    await loadBoms();
  };
  const bomAction = async (b, what) => {
    const out = await post(`${what}:${b._id}`, `/api/manufacturing/boms/${enc(b._id)}/${what}`, {});
    if (out.ok) await loadBoms();
  };

  return (
    <div className="flex flex-col min-w-0">
      <Notch>
        <BackButton />
      </Notch>

      <main className="p-4 space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <Factory className="h-5 w-5" /> Manufacturing <Badge variant="secondary">Add-on</Badge>
            </h1>
            <p className="text-sm text-muted-foreground">Bills of materials and production orders: issue components, receive finished goods, track work in progress.</p>
          </div>
          <Button variant="outline" onClick={loadAll} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="ml-2">Refresh</span>
          </Button>
        </div>

        {error && (
          <p className="text-sm text-red-600 flex items-start gap-1" role="alert">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" /> {error}
          </p>
        )}

        {closed && (
          <Card>
            <CardContent className="pt-6 flex items-start gap-3">
              <Lock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium">Manufacturing isn&apos;t available</p>
                <p className="text-sm text-muted-foreground">{closed}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {loading && !closed && boms.length === 0 && orders.length === 0 && <p className="text-sm text-muted-foreground">Loading…</p>}

        {!closed && !loading && costingMode && !["shadow", "live"].includes(costingMode) && (
          <Card className="border-amber-300">
            <CardContent className="pt-6 text-sm flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                Inventory costing is not switched on yet. You can prepare bills of materials now, but production orders need it (an admin or the
                CFO switches it on under Accounting → Inventory Costing).
              </span>
            </CardContent>
          </Card>
        )}

        {!closed && (
          <>
            <div className="flex flex-wrap gap-2">
              {[
                ["orders", "Production orders"],
                ["boms", "Bills of materials"],
                ["wip", "Work in progress"],
              ].map(([k, label]) => (
                <Button key={k} size="sm" variant={tab === k ? "default" : "outline"} onClick={() => setTab(k)}>
                  {label}
                </Button>
              ))}
            </div>

            {/* ── production orders ─────────────────────────────────────────────────────── */}
            {tab === "orders" && (
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
                <Card>
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <select className={selectClass} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="open">Open orders</option>
                        <option value="all">All orders</option>
                        {Object.entries(ORDER_STATUS).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v.label}
                          </option>
                        ))}
                      </select>
                      {canRun && (
                        <Button size="sm" className="ml-auto" onClick={() => setNewOrder({ bomId: activeBoms[0]?._id || "", warehouseId: stores[0]?._id || "", plannedQty: "", note: "" })}>
                          <Plus className="h-4 w-4" />
                          <span className="ml-1">New order</span>
                        </Button>
                      )}
                    </div>

                    {newOrder && (
                      <div className="rounded-md border p-3 space-y-3 text-sm">
                        <p className="font-medium">New production order</p>
                        {activeBoms.length === 0 ? (
                          <p className="text-muted-foreground">No product has an active bill of materials yet. Create one under &quot;Bills of materials&quot;.</p>
                        ) : (
                          <div className="grid gap-2 sm:grid-cols-2">
                            <label className="space-y-1">
                              <span className="text-xs text-muted-foreground">Product to make</span>
                              <select className={`${selectClass} w-full`} value={newOrder.bomId} onChange={(e) => setNewOrder({ ...newOrder, bomId: e.target.value })}>
                                {activeBoms.map((b) => (
                                  <option key={b._id} value={b._id}>
                                    {b.productName} (v{b.version})
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label className="space-y-1">
                              <span className="text-xs text-muted-foreground">Warehouse</span>
                              <select className={`${selectClass} w-full`} value={newOrder.warehouseId} onChange={(e) => setNewOrder({ ...newOrder, warehouseId: e.target.value })}>
                                {stores.map((s) => (
                                  <option key={s._id} value={s._id}>
                                    {s.WHName || "Unnamed store"}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label className="space-y-1">
                              <span className="text-xs text-muted-foreground">Pieces to make</span>
                              <Input type="number" min="1" step="1" value={newOrder.plannedQty} onChange={(e) => setNewOrder({ ...newOrder, plannedQty: e.target.value })} />
                            </label>
                            <label className="space-y-1">
                              <span className="text-xs text-muted-foreground">Note (optional)</span>
                              <Input value={newOrder.note} maxLength={500} onChange={(e) => setNewOrder({ ...newOrder, note: e.target.value })} />
                            </label>
                          </div>
                        )}
                        {newOrder.bomId && Number(newOrder.plannedQty) > 0 && (
                          <Requirements bom={activeBoms.find((b) => b._id === newOrder.bomId)} qty={Number(newOrder.plannedQty)} />
                        )}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={createOrder}
                            disabled={busy === "createOrder" || !newOrder.bomId || !newOrder.warehouseId || !Number.isInteger(Number(newOrder.plannedQty)) || Number(newOrder.plannedQty) <= 0}
                          >
                            {busy === "createOrder" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create draft"}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setNewOrder(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead className="text-right">Made / planned</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {shownOrders.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center text-muted-foreground">
                                No production orders here yet.
                              </TableCell>
                            </TableRow>
                          )}
                          {shownOrders.map((o) => (
                            <TableRow key={o._id} className={`cursor-pointer ${o._id === orderId ? "bg-muted" : ""}`} onClick={() => openOrder(o._id)}>
                              <TableCell className="font-medium whitespace-nowrap">
                                {o.ref}
                                <div className="text-xs text-muted-foreground">{moment(o.createdAt).format("DD MMM YYYY")}</div>
                              </TableCell>
                              <TableCell>{o.bom?.productName}</TableCell>
                              <TableCell className="text-right">
                                {num(o.receivedQty)} / {num(o.plannedQty)}
                              </TableCell>
                              <TableCell>
                                <Badge className={ORDER_STATUS[o.status]?.style}>{ORDER_STATUS[o.status]?.label || o.status}</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                {orderId && (
                  <OrderPanel
                    order={order}
                    trace={trace}
                    storeName={storeName}
                    canRun={canRun}
                    canClose={canClose}
                    busy={busy}
                    post={post}
                    onChanged={refreshOrder}
                    onTrace={async () => {
                      const r = await api.get(`/api/manufacturing/orders/${enc(orderId)}/trace`);
                      if (r.ok) setTrace(r.data?.data || null);
                      else fail(r);
                    }}
                    onClose={() => {
                      setOrderId(null);
                      setOrder(null);
                      setTrace(null);
                    }}
                  />
                )}
              </div>
            )}

            {/* ── bills of materials ────────────────────────────────────────────────────── */}
            {tab === "boms" && (
              <div className="space-y-4">
                {canEditBom && !bomForm && (
                  <Button size="sm" onClick={() => startBom(null)}>
                    <Plus className="h-4 w-4" />
                    <span className="ml-1">New bill of materials</span>
                  </Button>
                )}

                {bomForm && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        {bomForm.id ? "Edit draft" : bomForm.productId ? `New version: ${bomForm.productName}` : "New bill of materials"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <label className="block space-y-1 max-w-md">
                        <span className="text-xs text-muted-foreground">Finished product</span>
                        {bomForm.fixed ? (
                          <p className="font-medium">{bomForm.productName}</p>
                        ) : (
                          <ProductPicker products={products} value={bomForm.productId} label={bomForm.productName} onPick={(p) => setBomForm({ ...bomForm, productId: p._id, productName: p.Name })} />
                        )}
                      </label>

                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Components: pieces of each component for <b>one piece</b> of the finished product (fractions allowed, e.g. 0.5), and
                          the scrap you expect (0–50 %).
                        </p>
                        {bomForm.lines.map((l, i) => (
                          <div key={i} className="flex flex-wrap items-center gap-2">
                            <div className="w-full sm:w-72">
                              <ProductPicker
                                products={products.filter((p) => String(p._id) !== String(bomForm.productId))}
                                value={l.productId}
                                label={l.productName}
                                onPick={(p) => setBomForm({ ...bomForm, lines: bomForm.lines.map((x, j) => (j === i ? { ...x, productId: p._id, productName: p.Name } : x)) })}
                              />
                            </div>
                            <Input
                              className="w-28"
                              type="number"
                              min="0"
                              step="any"
                              placeholder="Pieces"
                              value={l.qtyPer}
                              onChange={(e) => setBomForm({ ...bomForm, lines: bomForm.lines.map((x, j) => (j === i ? { ...x, qtyPer: e.target.value } : x)) })}
                            />
                            <div className="flex items-center gap-1">
                              <Input
                                className="w-20"
                                type="number"
                                min="0"
                                max="50"
                                step="any"
                                value={l.scrapPct}
                                onChange={(e) => setBomForm({ ...bomForm, lines: bomForm.lines.map((x, j) => (j === i ? { ...x, scrapPct: e.target.value } : x)) })}
                              />
                              <span className="text-xs text-muted-foreground">% scrap</span>
                            </div>
                            <Button size="icon" variant="ghost" aria-label="Remove component" onClick={() => setBomForm({ ...bomForm, lines: bomForm.lines.filter((_, j) => j !== i) })} disabled={bomForm.lines.length === 1}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button size="sm" variant="outline" onClick={() => setBomForm({ ...bomForm, lines: [...bomForm.lines, { productId: "", productName: "", qtyPer: "1", scrapPct: "0" }] })}>
                          <Plus className="h-4 w-4" />
                          <span className="ml-1">Add component</span>
                        </Button>
                      </div>

                      <label className="block space-y-1 max-w-md">
                        <span className="text-xs text-muted-foreground">Note (optional)</span>
                        <Input value={bomForm.note} maxLength={500} onChange={(e) => setBomForm({ ...bomForm, note: e.target.value })} />
                      </label>

                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveBom} disabled={busy === "saveBom" || !bomForm.productId || !bomForm.lines.some((l) => l.productId)}>
                          {busy === "saveBom" ? <Loader2 className="h-4 w-4 animate-spin" /> : bomForm.id ? "Save draft" : "Create draft"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setBomForm(null)}>
                          Cancel
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">A draft is used by nothing until you make it active. Orders keep a copy of the version they were made from.</p>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardContent className="pt-4 overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Finished product</TableHead>
                          <TableHead>Version</TableHead>
                          <TableHead>Components (per piece)</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {boms.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                              No bills of materials yet.
                            </TableCell>
                          </TableRow>
                        )}
                        {boms.map((b) => (
                          <TableRow key={b._id} className={b.status === "archived" ? "opacity-60" : ""}>
                            <TableCell className="font-medium">{b.productName || productName.get(b.productId) || b.productId}</TableCell>
                            <TableCell>
                              v{b.version}
                              <div className="text-xs text-muted-foreground">{moment(b.createdAt).format("DD MMM YYYY")}</div>
                            </TableCell>
                            <TableCell className="text-xs">
                              {b.components.map((c) => (
                                <div key={c.lineId}>
                                  {c.qtyPer} × {c.productName}
                                  {c.scrapPct ? ` (+${c.scrapPct}% scrap)` : ""}
                                </div>
                              ))}
                              {b.note && <div className="text-muted-foreground mt-1">{b.note}</div>}
                            </TableCell>
                            <TableCell>
                              <Badge className={BOM_STATUS[b.status]?.style}>{BOM_STATUS[b.status]?.label || b.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right whitespace-nowrap space-x-1">
                              {canEditBom && b.status === "draft" && (
                                <>
                                  <Button size="sm" variant="outline" onClick={() => startBom(b)}>
                                    Edit
                                  </Button>
                                  <Button size="sm" onClick={() => bomAction(b, "activate")} disabled={busy === `activate:${b._id}`}>
                                    {busy === `activate:${b._id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : "Make active"}
                                  </Button>
                                </>
                              )}
                              {canEditBom && b.status !== "draft" && !bomForm && (
                                <Button size="sm" variant="outline" onClick={() => startBom(b)}>
                                  New version
                                </Button>
                              )}
                              {canEditBom && b.status !== "archived" && (
                                <Button size="sm" variant="ghost" className="text-red-600" onClick={() => bomAction(b, "archive")} disabled={busy === `archive:${b._id}`}>
                                  Archive
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ── work in progress ──────────────────────────────────────────────────────── */}
            {tab === "wip" && (
              <Card>
                <CardContent className="pt-4 space-y-3">
                  <p className="text-sm">
                    Value of components issued to open orders and not yet turned into finished goods:{" "}
                    <b>{wip ? naira(wip.total) : "…"}</b>
                  </p>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Made / planned</TableHead>
                          <TableHead className="text-right">Work in progress</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {wip && wip.orders.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                              No order has work in progress.
                            </TableCell>
                          </TableRow>
                        )}
                        {(wip?.orders || []).map((o) => (
                          <TableRow
                            key={o.id}
                            className="cursor-pointer"
                            onClick={() => {
                              setTab("orders");
                              openOrder(o.id);
                            }}
                          >
                            <TableCell className="font-medium">{o.ref}</TableCell>
                            <TableCell>{o.product}</TableCell>
                            <TableCell>
                              <Badge className={ORDER_STATUS[o.status]?.style}>{ORDER_STATUS[o.status]?.label || o.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {num(o.receivedQty)} / {num(o.plannedQty)}
                            </TableCell>
                            <TableCell className="text-right">{naira(o.wip)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <p className="text-xs text-muted-foreground">From the inventory costing; the most recent couple of minutes of movements may not be costed yet.</p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}

/** What an order of `qty` pieces needs, from the bill of materials (same rounding as the backend). */
function Requirements({ bom, qty }) {
  if (!bom) return null;
  return (
    <div className="text-xs text-muted-foreground">
      Needs:{" "}
      {bom.components
        .map((c) => `${num(Math.ceil(c.qtyPer * qty * (1 + (c.scrapPct || 0) / 100) - 1e-9))} × ${c.productName}`)
        .join(" · ")}
    </div>
  );
}

/** Searchable product picker (the product list can be long). */
function ProductPicker({ products, value, label, onPick }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const matches = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (s ? products.filter((p) => String(p.Name || "").toLowerCase().includes(s)) : products).slice(0, 30);
  }, [products, q]);
  return (
    <div className="relative">
      <Input
        placeholder="Search product"
        value={open ? q : label || (value ? "(product)" : "")}
        onFocus={() => {
          setQ("");
          setOpen(true);
        }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onChange={(e) => setQ(e.target.value)}
      />
      {open && (
        <div className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md border bg-background shadow-md">
          {matches.length === 0 && <p className="p-2 text-xs text-muted-foreground">No product matches.</p>}
          {matches.map((p) => (
            <button
              type="button"
              key={p._id}
              className="block w-full px-3 py-1.5 text-left text-sm hover:bg-muted"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onPick(p);
                setOpen(false);
              }}
            >
              {p.Name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function OrderPanel({ order, trace, storeName, canRun, canClose, busy, post, onChanged, onTrace, onClose }) {
  const [shortage, setShortage] = useState(null);
  const [issueQty, setIssueQty] = useState({});
  const [receipt, setReceipt] = useState({ pieces: "", scrap: "0", final: false });
  const [cancelReason, setCancelReason] = useState("");
  const [confirm, setConfirm] = useState(""); // "cancel" | "closeShort"

  useEffect(() => {
    setShortage(null);
    setIssueQty({});
    setReceipt({ pieces: "", scrap: "0", final: false });
    setConfirm("");
    setCancelReason("");
  }, [order?._id]);

  if (!order) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">Loading the order…</CardContent>
      </Card>
    );
  }

  const id = enc(order._id);
  const s = order.status;
  const remaining = Math.max(0, order.plannedQty - order.receivedQty);
  const unsettled = [...(order.issues || []), ...(order.receipts || [])].filter((e) => e.state === "review" || e.state === "pending");

  const release = async (allowShortage) => {
    const out = await post("release", `/api/manufacturing/orders/${id}/release`, { allowShortage });
    if (out.ok) {
      setShortage(null);
      return onChanged();
    }
    const details = out.r?.data?.details;
    if (out.r?.status === 409 && Array.isArray(details) && details.length) setShortage(details);
  };
  const issue = async (lines) => {
    const out = await post("issue", `/api/manufacturing/orders/${id}/issue`, lines ? { lines } : {}, { idem: true });
    if (out.ok) setIssueQty({});
    await onChanged();
  };
  const receive = async () => {
    const out = await post("receive", `/api/manufacturing/orders/${id}/receive`, { pieces: Number(receipt.pieces), scrap: Number(receipt.scrap || 0), final: receipt.final }, { idem: true });
    if (out.ok) setReceipt({ pieces: "", scrap: "0", final: false });
    await onChanged();
  };
  const close = async (short) => {
    const out = await post("close", `/api/manufacturing/orders/${id}/close`, { short });
    if (out.ok) setConfirm("");
    await onChanged();
  };
  const cancel = async () => {
    const out = await post("cancel", `/api/manufacturing/orders/${id}/cancel`, { reason: cancelReason });
    if (out.ok) setConfirm("");
    await onChanged();
  };

  const chosenLines = Object.entries(issueQty)
    .map(([lineId, pieces]) => ({ lineId, pieces: Number(pieces) }))
    .filter((l) => l.pieces > 0);
  const issueValid = chosenLines.every((l) => Number.isInteger(l.pieces));
  const anythingToIssue = order.components.some((c) => c.required - c.issued > 0);

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-start justify-between gap-2">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            {order.ref} <Badge className={ORDER_STATUS[s]?.style}>{ORDER_STATUS[s]?.label || s}</Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {order.bom?.productName} (bill of materials v{order.bom?.version}) · {storeName.get(String(order.warehouseId)) || "warehouse"}
          </p>
        </div>
        <Button size="icon" variant="ghost" aria-label="Close panel" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Mini label="Planned" value={num(order.plannedQty)} />
          <Mini label="Made" value={num(order.receivedQty)} />
          <Mini label="Scrap" value={num(order.scrapQty)} />
          <Mini label="Created" value={moment(order.createdAt).format("DD MMM YYYY")} hint={order.createdByName} />
        </div>
        {order.note && <p className="text-muted-foreground">Note: {order.note}</p>}
        {s === "closed" && (
          <p className="flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Closed {when(order.closedAt)}
            {order.closedShort ? " (short)" : ""}
            {order.wipScrapped ? `; ${naira(order.wipScrapped)} of work in progress went to scrap.` : "."}
          </p>
        )}
        {s === "cancelled" && <p className="text-muted-foreground">Cancelled {when(order.cancelledAt)}{order.cancelReason ? `: ${order.cancelReason}` : ""}.</p>}
        {unsettled.length > 0 && (
          <p className="text-amber-700 flex items-start gap-1">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            {unsettled.length} issue/receipt step(s) are unfinished or need review. They are finished automatically after a couple of minutes; anything
            marked &quot;needs review&quot; must be checked against the stock (see the inventory costing daily check).
          </p>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Component</TableHead>
                <TableHead className="text-right">Needed</TableHead>
                <TableHead className="text-right">Issued</TableHead>
                <TableHead className="text-right">Still to issue</TableHead>
                {canRun && ["released", "inProgress"].includes(s) && <TableHead className="text-right">Issue now</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.components.map((c) => {
                const left = c.required - c.issued;
                const short = (order.shortages || []).find((x) => x.lineId === c.lineId);
                return (
                  <TableRow key={c.lineId}>
                    <TableCell>
                      {c.productName}
                      <div className="text-xs text-muted-foreground">
                        {c.qtyPer} per piece{c.scrapPct ? ` +${c.scrapPct}% scrap` : ""}
                      </div>
                      {short && <div className="text-xs text-red-600">Only {num(short.available)} in stock</div>}
                    </TableCell>
                    <TableCell className="text-right">{num(c.required)}</TableCell>
                    <TableCell className="text-right">{num(c.issued)}</TableCell>
                    <TableCell className="text-right">{num(left)}</TableCell>
                    {canRun && ["released", "inProgress"].includes(s) && (
                      <TableCell className="text-right">
                        <Input
                          className="w-24 ml-auto h-8"
                          type="number"
                          min="0"
                          max={left}
                          step="1"
                          disabled={left <= 0}
                          value={issueQty[c.lineId] ?? ""}
                          onChange={(e) => setIssueQty({ ...issueQty, [c.lineId]: e.target.value })}
                        />
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {shortage && (
          <div className="rounded-md border border-amber-300 p-3 space-y-2">
            <p className="font-medium flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Not all components are in stock
            </p>
            <ul className="list-disc pl-5 text-muted-foreground">
              {shortage.map((x) => (
                <li key={x.lineId}>
                  {x.product}: needs {num(x.needed)}, {num(x.available)} in stock
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => release(true)} disabled={busy === "release"}>
                Release anyway
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShortage(null)}>
                Not now
              </Button>
            </div>
          </div>
        )}

        {/* actions */}
        <div className="space-y-3">
          {canRun && s === "draft" && !shortage && (
            <Button size="sm" onClick={() => release(false)} disabled={busy === "release"}>
              {busy === "release" ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackageMinus className="h-4 w-4" />}
              <span className="ml-1">Release</span>
            </Button>
          )}

          {canRun && ["released", "inProgress"].includes(s) && anythingToIssue && (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => issue(null)} disabled={busy === "issue"}>
                {busy === "issue" ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackageMinus className="h-4 w-4" />}
                <span className="ml-1">Issue everything still needed</span>
              </Button>
              <Button size="sm" variant="outline" onClick={() => issue(chosenLines)} disabled={busy === "issue" || !chosenLines.length || !issueValid}>
                Issue the quantities entered
              </Button>
            </div>
          )}

          {canRun && s === "inProgress" && (
            <div className="rounded-md border p-3 space-y-2">
              <p className="font-medium">Receive finished goods</p>
              <div className="flex flex-wrap items-end gap-2">
                <label className="space-y-1">
                  <span className="text-xs text-muted-foreground">Good pieces</span>
                  <Input className="w-28" type="number" min="1" step="1" value={receipt.pieces} onChange={(e) => setReceipt({ ...receipt, pieces: e.target.value })} />
                </label>
                <label className="space-y-1">
                  <span className="text-xs text-muted-foreground">Scrapped pieces</span>
                  <Input className="w-28" type="number" min="0" step="1" value={receipt.scrap} onChange={(e) => setReceipt({ ...receipt, scrap: e.target.value })} />
                </label>
                <Button
                  size="sm"
                  onClick={receive}
                  disabled={busy === "receive" || !Number.isInteger(Number(receipt.pieces)) || Number(receipt.pieces) <= 0 || !Number.isInteger(Number(receipt.scrap || 0)) || Number(receipt.scrap || 0) < 0}
                >
                  {busy === "receive" ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackageCheck className="h-4 w-4" />}
                  <span className="ml-1">Receive</span>
                </Button>
              </div>
              <label className="flex items-start gap-2">
                <Checkbox checked={receipt.final} onCheckedChange={(v) => setReceipt({ ...receipt, final: v === true })} />
                <span>
                  This is the last receipt for the order (it then takes all the remaining component cost). {remaining > 0 ? `${num(remaining)} piece(s) of the plan are still to make; ` : ""}
                  reaching the planned quantity completes the order automatically.
                </span>
              </label>
            </div>
          )}

          {canClose && s === "completed" && (
            <Button size="sm" onClick={() => close(false)} disabled={busy === "close"}>
              {busy === "close" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              <span className="ml-1">Close the order</span>
            </Button>
          )}
          {canClose && s === "inProgress" && confirm !== "closeShort" && (
            <Button size="sm" variant="outline" onClick={() => setConfirm("closeShort")}>
              Close short…
            </Button>
          )}
          {confirm === "closeShort" && (
            <div className="rounded-md border border-amber-300 p-3 space-y-2">
              <p>Close the order without making the rest? Any work in progress left goes to Manufacturing Scrap.</p>
              <div className="flex gap-2">
                <Button size="sm" variant="destructive" onClick={() => close(true)} disabled={busy === "close"}>
                  {busy === "close" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Close short"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setConfirm("")}>
                  Keep it open
                </Button>
              </div>
            </div>
          )}
          {["completed", "inProgress"].includes(s) && canClose && (
            <p className="text-xs text-muted-foreground">Closing needs the order&apos;s movements costed first; that happens a few minutes after the last issue or receipt.</p>
          )}

          {canRun && ["draft", "released"].includes(s) && !(order.issues || []).length && confirm !== "cancel" && (
            <Button size="sm" variant="ghost" className="text-red-600" onClick={() => setConfirm("cancel")}>
              Cancel the order…
            </Button>
          )}
          {confirm === "cancel" && (
            <div className="rounded-md border p-3 space-y-2">
              <Input placeholder="Reason (optional)" maxLength={300} value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
              <div className="flex gap-2">
                <Button size="sm" variant="destructive" onClick={cancel} disabled={busy === "cancel"}>
                  {busy === "cancel" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cancel order"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setConfirm("")}>
                  Keep it
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* history */}
        {((order.issues || []).length > 0 || (order.receipts || []).length > 0) && (
          <details className="text-xs">
            <summary className="cursor-pointer text-muted-foreground">History</summary>
            <ul className="mt-2 space-y-1">
              {[
                ...(order.issues || []).map((e) => ({ ...e, text: `Issued ${num(e.pieces)} × ${order.components.find((c) => c.lineId === e.lineId)?.productName || "component"}` })),
                ...(order.receipts || []).map((e) => ({ ...e, text: `Received ${num(e.pieces)} piece(s)${e.scrap ? `, ${num(e.scrap)} scrapped` : ""}${e.final ? " (last receipt)" : ""}` })),
              ]
                .sort((a, b) => new Date(a.at) - new Date(b.at))
                .map((e) => (
                  <li key={e.id} className={e.state === "review" || e.state === "failed" ? "text-red-600" : ""}>
                    {when(e.at)}: {e.text} — {ENTRY_STATE[e.state] || e.state}
                  </li>
                ))}
            </ul>
          </details>
        )}

        {/* traceability */}
        {["inProgress", "completed", "closed"].includes(s) && (
          <div className="space-y-2">
            {!trace ? (
              <Button size="sm" variant="outline" onClick={onTrace}>
                <GitBranch className="h-4 w-4" />
                <span className="ml-1">Trace batches</span>
              </Button>
            ) : (
              <div className="rounded-md border p-3 space-y-3">
                <p className="font-medium">Traceability</p>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Component batches used</p>
                  {trace.components.length === 0 ? (
                    <p className="text-xs text-muted-foreground">None yet.</p>
                  ) : (
                    <ul className="text-xs space-y-0.5">
                      {trace.components.map((c, i) => (
                        <li key={i}>
                          {c.product}: {num(c.pieces)} pc{c.pending ? " (not costed yet)" : ` from batch ${c.lotNo || (c.layerId || "").slice(-8)} · ${naira(c.value)}`}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Finished-goods batches made</p>
                  {trace.output.length === 0 ? (
                    <p className="text-xs text-muted-foreground">None yet.</p>
                  ) : (
                    <ul className="text-xs space-y-0.5">
                      {trace.output.map((o, i) => (
                        <li key={i}>
                          {num(o.pieces)} pc{o.pending ? " (not costed yet)" : ` at ${naira(o.unitCost)} each (${naira(o.value)}), ${when(o.receivedAt)}`}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <p className="text-xs">Work in progress now: {naira(trace.wip)}</p>
                <p className="text-xs text-muted-foreground">{trace.note}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Mini({ label, value, hint }) {
  return (
    <div className="rounded-md border p-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
      {hint && <p className="text-xs text-muted-foreground truncate">{hint}</p>}
    </div>
  );
}
