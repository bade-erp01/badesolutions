'use client';

/**
 * Point of Sale — online only.
 *
 * Every sale is created and posted on the server (POST /api/Pos/checkout) exactly like a
 * posted sales invoice for the business's POS customer, and paid in the same request.
 * Nothing is stored in the browser: no cached products, no saved cart, no offline queue.
 * The POS sells in PIECES only: prices, VAT and stock (in pieces) come from the server;
 * the cart preview uses the same per-piece figures and the server re-prices before
 * payment (POST /api/Pos/quote).
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Wifi,
  WifiOff,
  Printer,
  CreditCard,
  Banknote,
  ArrowLeftRight,
  RefreshCw,
  AlertTriangle,
  Loader2,
  History,
  CheckCircle2,
  Receipt,
} from 'lucide-react';
import { Encrypt } from '../../../../../../Functions/Mics';
import { useUser } from '@/components/UserProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { EXPRESS_PRIVATE_URL } from '../../../../../../Functions/Functions';

// ============== CONSTANTS ==============
const LOW_STOCK_THRESHOLD = 10;
const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash', icon: Banknote },
  { id: 'transfer', label: 'Transfer', icon: ArrowLeftRight },
  { id: 'card', label: 'Card', icon: CreditCard },
];

const naira = (n, digits = 2) =>
  `₦${Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

// Same per-piece line math as the server (the draft-invoice formula's piece term)
const lineVat = (p, pcs) => round2((p.piecePrice * pcs * p.vatPercent) / 100);
const lineTotal = (p, pcs) => round2(p.piecePrice * pcs + (p.piecePrice * pcs * p.vatPercent) / 100);

// ============== COMPONENT ==============
export default function POS() {
  const { user } = useUser();

  const [config, setConfig] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]); // [{ storeId, quantity }] — quantity in pieces
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [discountType, setDiscountType] = useState('percent');
  const [discountValue, setDiscountValue] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState(null);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  // payment
  const [payOpen, setPayOpen] = useState(false);
  const [quote, setQuote] = useState(null);
  const [quoting, setQuoting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountTendered, setAmountTendered] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [opsCode, setOpsCode] = useState(''); // cashier signs the sale, like closing a sale in the ERP
  const attemptKeyRef = useRef(null); // one Idempotency-Key per payment attempt

  // receipt + history
  const [receipt, setReceipt] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState(null);

  const searchInputRef = useRef(null);

  const notify = useCallback((type, message, ms = 2500) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), ms);
  }, []);

  // ============== API ==============
  const headers = useCallback(
    (extra = {}) => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${Encrypt(user.business.tenantId)}`,
      access: `${Encrypt(user.user._id)}`,
      sessionKey: `Bearer ${Encrypt(user.SessionId)}`,
      ...extra,
    }),
    [user]
  );

  const api = useCallback(
    async (path, { method = 'GET', body, extraHeaders } = {}) => {
      const res = await fetch(`${EXPRESS_PRIVATE_URL}/api${path}`, {
        method,
        headers: headers(extraHeaders),
        body: body ? JSON.stringify(body) : undefined,
        cache: 'no-store',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const err = new Error(data.error || `Request failed (${res.status})`);
        err.details = data.details;
        err.status = res.status;
        throw err;
      }
      return data;
    },
    [headers]
  );

  const loadAll = useCallback(
    async ({ silent = false } = {}) => {
      if (!navigator.onLine) return;
      silent ? setIsRefreshing(true) : setIsLoading(true);
      try {
        const [cfg, prod] = await Promise.all([api('/Pos/config'), api('/Pos/products')]);
        setConfig(cfg);
        setProducts(prod.data || []);
      } catch (err) {
        notify('error', err.message || 'Could not load the POS. Check your connection.', 4000);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [api, notify]
  );

  // ============== INIT ==============
  useEffect(() => {
    if (!user?.user) return;
    loadAll();

    const updateOnline = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      if (online) loadAll({ silent: true });
    };
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);
    setIsOnline(navigator.onLine);
    return () => {
      window.removeEventListener('online', updateOnline);
      window.removeEventListener('offline', updateOnline);
    };
  }, [user, loadAll]);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const productById = useMemo(() => new Map(products.map((p) => [p.storeId, p])), [products]);

  // ============== CART ==============
  const available = (p) => p.stock; // pieces

  const addToCart = useCallback(
    (product) => {
      if (!isOnline) return notify('error', 'You are offline. Reconnect to sell.');
      setCart((prev) => {
        const existing = prev.find((i) => i.storeId === product.storeId);
        const next = (existing?.quantity || 0) + 1;
        if (next > available(product)) {
          notify('error', `Only ${product.stock} piece(s) of ${product.name} in stock`);
          return prev;
        }
        if (existing) return prev.map((i) => (i.storeId === product.storeId ? { ...i, quantity: next } : i));
        return [...prev, { storeId: product.storeId, quantity: 1 }];
      });
    },
    [isOnline, notify]
  );

  const updateQuantity = (storeId, qty) => {
    const product = productById.get(storeId);
    if (!product) return;
    if (qty <= 0) return setCart((prev) => prev.filter((i) => i.storeId !== storeId));
    if (qty > available(product)) return notify('error', `Only ${product.stock} piece(s) available`);
    setCart((prev) => prev.map((i) => (i.storeId === storeId ? { ...i, quantity: qty } : i)));
  };

  const removeFromCart = (storeId) => setCart((prev) => prev.filter((i) => i.storeId !== storeId));

  const clearCart = () => {
    setCart([]);
    setDiscountValue(0);
    setAmountTendered('');
  };

  // ============== BARCODE SCANNER ==============
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e) => {
      if (document.activeElement?.tagName === 'INPUT' && document.activeElement !== searchInputRef.current) return;
      const now = Date.now();
      if (now - lastKeyTime > 80) buffer = '';
      lastKeyTime = now;

      if (e.key === 'Enter') {
        if (buffer.length >= 4) {
          const code = buffer.toLowerCase();
          const product = products.find((p) => p.barcodes.some((b) => b.toLowerCase() === code) || p.storeId === buffer);
          if (!product) notify('error', `Barcode not found: ${buffer}`, 2000);
          else if (product.stock <= 0) notify('error', `${product.name} is out of stock`, 2000);
          else {
            addToCart(product);
            setSearch('');
            notify('success', `Added: ${product.name}`, 1500);
          }
        }
        buffer = '';
        return;
      }
      if (/^[0-9A-Za-z.\-']$/.test(e.key)) buffer += e.key;
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [products, addToCart, notify]);

  // ============== COMPUTED ==============
  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
    return ['All', ...cats.sort()];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase().trim();
    return products.filter((p) => {
      const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.barcodes.some((b) => b.toLowerCase().includes(q));
      return matchesSearch && (category === 'All' || p.category === category);
    });
  }, [products, search, category]);

  const cartLines = useMemo(
    () =>
      cart
        .map((i) => {
          const p = productById.get(i.storeId);
          return p ? { ...p, quantity: i.quantity, vat: lineVat(p, i.quantity), total: lineTotal(p, i.quantity) } : null;
        })
        .filter(Boolean),
    [cart, productById]
  );

  const subtotal = useMemo(() => round2(cartLines.reduce((s, l) => s + l.total, 0)), [cartLines]);
  const vatTotal = useMemo(() => round2(cartLines.reduce((s, l) => s + l.vat, 0)), [cartLines]);
  const discountAmount = useMemo(() => {
    const v = Number(discountValue) || 0;
    return round2(discountType === 'percent' ? (subtotal * Math.min(v, 100)) / 100 : Math.min(v, subtotal));
  }, [subtotal, discountType, discountValue]);
  const total = round2(subtotal - discountAmount);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const payTotal = quote?.grandTotal ?? total;
  const tenderedNum = parseFloat(amountTendered) || 0;
  const change = Math.max(0, round2(tenderedNum - payTotal));
  const canComplete =
    isOnline && quote?.ok && !submitting && opsCode.trim().length > 0 && (paymentMethod !== 'cash' || tenderedNum >= payTotal);

  // ============== CHECKOUT ==============
  const items = () => cart.map((i) => ({ storeId: i.storeId, pcs: i.quantity }));

  const openPayment = async () => {
    if (!cart.length) return;
    if (!isOnline) return notify('error', 'You are offline. Reconnect to sell.');
    if (config && !config.ready) return notify('error', 'The POS is not set up yet. Ask an admin.', 4000);
    setMobileCartOpen(false);
    setPayOpen(true);
    setQuote(null);
    setQuoting(true);
    setAmountTendered('');
    setOpsCode('');
    attemptKeyRef.current = `pos-${crypto.randomUUID()}`;
    try {
      setQuote(await api('/Pos/quote', { method: 'POST', body: { items: items(), discount: discountAmount } }));
    } catch (err) {
      setQuote({ ok: false, problems: [{ error: err.message }] });
    } finally {
      setQuoting(false);
    }
  };

  const completeSale = async () => {
    if (!canComplete) return;
    setSubmitting(true);
    try {
      const data = await api('/Pos/checkout', {
        method: 'POST',
        body: {
          items: items(),
          discount: discountAmount,
          payment: { method: paymentMethod, tendered: paymentMethod === 'cash' ? tenderedNum : undefined },
          ops: Encrypt(opsCode.trim()), // never sent in the URL
        },
        extraHeaders: { 'Idempotency-Key': attemptKeyRef.current },
      });
      setReceipt(data.receipt);
      setOpsCode('');
      setPayOpen(false);
      clearCart();
      loadAll({ silent: true }); // fresh stock after the sale
    } catch (err) {
      if (err.details?.length) {
        setQuote((q) => ({ ...(q || {}), ok: false, problems: err.details }));
        loadAll({ silent: true });
      }
      if (err.status === 401 || err.status === 429) setOpsCode(''); // wrong code / locked: type it again
      notify('error', err.message || 'The sale could not be completed. Nothing was charged.', 4000);
      attemptKeyRef.current = `pos-${crypto.randomUUID()}`; // a failed attempt may be retried with a new key
    } finally {
      setSubmitting(false);
    }
  };

  const openHistory = async () => {
    setHistoryOpen(true);
    setHistory(null);
    try {
      setHistory(await api('/Pos/sales?mine=1'));
    } catch (err) {
      setHistory({ error: err.message });
    }
  };

  const reprint = async (id) => {
    try {
      const data = await api(`/Pos/sales/${id}`);
      setReceipt(data.receipt);
      setHistoryOpen(false);
    } catch (err) {
      notify('error', err.message);
    }
  };

  const business = config?.business || {};

  // ============== RENDER ==============
  const CartBody = (
    <div className="p-3 space-y-2">
      {cartLines.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <ShoppingCart className="h-14 w-14 mb-3 opacity-30" />
          <p className="font-medium">Cart is empty</p>
          <p className="text-sm">Scan or add products</p>
        </div>
      ) : (
        cartLines.map((item) => (
          <div key={item.storeId} className="rounded-xl bg-muted/40 p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm leading-snug line-clamp-2">{item.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {naira(item.unitPrice)} / piece
                </div>
              </div>
              <div className="font-semibold text-sm whitespace-nowrap">{naira(item.total)}</div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={() => updateQuantity(item.storeId, item.quantity - 1)}>
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.storeId, parseInt(e.target.value, 10) || 0)}
                  className="w-14 h-8 text-center px-1 text-base sm:text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={() => updateQuantity(item.storeId, item.quantity + 1)}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
              <button onClick={() => removeFromCart(item.storeId)} className="text-xs text-destructive hover:underline">
                Remove
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const CartFooter = (
    <div className="border-t p-4 space-y-3 bg-muted/20 shrink-0">
      <div className="flex items-center gap-2">
        <Select value={discountType} onValueChange={setDiscountType}>
          <SelectTrigger className="w-[130px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="percent">% Discount</SelectItem>
            <SelectItem value="fixed">₦ Discount</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="number"
          min="0"
          value={discountValue || ''}
          onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
          placeholder="0"
          className="h-9 text-base sm:text-sm"
        />
      </div>
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Items (incl. VAT {naira(vatTotal)})</span>
          <span>{naira(subtotal)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
            <span>Discount</span>
            <span>−{naira(discountAmount)}</span>
          </div>
        )}
        <Separator className="my-2" />
        <div className="flex justify-between text-xl font-bold">
          <span>Total</span>
          <span>{naira(total)}</span>
        </div>
      </div>
      <Button size="lg" className="w-full h-12 text-base font-semibold" onClick={openPayment} disabled={!cart.length || !isOnline}>
        {isOnline ? `Charge • ${naira(total)}` : 'Offline — reconnect to sell'}
      </Button>
    </div>
  );

  return (
    <div className="lg:h-[calc(100dvh-8rem)] min-w-0 bg-background text-foreground flex flex-col font-sans lg:overflow-hidden">
      {/* ========== HEADER ========== */}
      <header className="shrink-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 print:hidden">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 gap-2">
          <div className="min-w-0">
            <h1 className="text-lg font-bold tracking-tight truncate">{business.name || 'Point of Sale'}</h1>
            <p className="text-xs text-muted-foreground truncate">
              {config?.warehouse?.name ? `${config.warehouse.name} · ` : ''}powered by Bade
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="outline" size="sm" onClick={openHistory} className="gap-1.5">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Today</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => loadAll({ silent: true })} disabled={!isOnline || isRefreshing} className="gap-1.5">
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
              <span className="hidden sm:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </Button>
            <Badge
              className={cn(
                'gap-1.5 px-3 py-1.5',
                isOnline ? 'bg-emerald-600 hover:bg-emerald-600 text-white' : 'bg-red-600 hover:bg-red-600 text-white'
              )}
            >
              {isOnline ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5 animate-pulse" />}
              <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
            </Badge>
            <div className="hidden md:block text-right text-sm">
              <div className="text-muted-foreground">Cashier</div>
              <div className="font-medium">{config?.cashier || user?.user?.firstName || '—'}</div>
            </div>
            <Button variant="outline" size="icon" className="relative lg:hidden" onClick={() => setMobileCartOpen(true)}>
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {!isOnline && (
          <div className="bg-red-600 text-white text-sm px-4 py-2 flex items-center gap-2">
            <WifiOff className="h-4 w-4" /> You are offline. Sales need a connection — nothing is saved on this device.
          </div>
        )}
        {config && !config.ready && (
          <div className="bg-amber-500/15 text-amber-800 dark:text-amber-300 text-sm px-4 py-2">
            <div className="flex items-center gap-2 font-medium">
              <AlertTriangle className="h-4 w-4" /> The POS is not ready to take payments:
            </div>
            <ul className="list-disc pl-10 text-xs mt-1">
              {config.problems.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        )}
      </header>

      {/* ========== TOAST ========== */}
      {toast && (
        <div
          className={cn(
            'fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg text-sm font-medium print:hidden max-w-[90vw]',
            toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-destructive text-destructive-foreground'
          )}
        >
          {toast.message}
        </div>
      )}

      {/* ========== MAIN ========== */}
      <div className="flex-1 flex min-h-0 lg:overflow-hidden print:hidden">
        <div className="flex-1 flex flex-col min-h-0 min-w-0 p-3 sm:p-6 lg:overflow-hidden">
          <div className="mb-4 space-y-3 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search product or scan barcode..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-12 text-base"
                autoFocus
              />
            </div>
            <div className="w-full overflow-x-auto overflow-y-hidden scrollbar-hide">
              <div className="flex gap-2 pb-1 min-w-max">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={category === cat ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCategory(cat)}
                    className="rounded-full shrink-0 whitespace-nowrap"
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 lg:overflow-hidden">
            <ScrollArea className="h-full">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <RefreshCw className="h-10 w-10 mb-3 animate-spin opacity-50" />
                  <p>Loading products...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2 sm:gap-3 pb-4 pr-0 lg:pr-3">
                    {filteredProducts.map((product) => {
                      const out = product.stock <= 0;
                      const low = product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD;
                      const unpriced = product.piecePrice <= 0;
                      const disabled = out || unpriced || !isOnline;
                      return (
                        <Card
                          key={product.storeId}
                          className={cn(
                            'cursor-pointer transition-all hover:shadow-md active:scale-[0.98]',
                            disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-primary'
                          )}
                          onClick={() => !disabled && addToCart(product)}
                        >
                          <CardContent className="p-3 flex flex-col h-full">
                            <div className="bg-muted/50 rounded-lg h-20 sm:h-24 flex items-center justify-center mb-3 relative overflow-hidden">
                              {product.image && product.image !== '/preview.png' ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="h-full w-full object-contain"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <span className="text-3xl font-bold text-muted-foreground/40">{product.name?.charAt(0) ?? '?'}</span>
                              )}
                              {(out || unpriced) && (
                                <div className="absolute inset-0 bg-background/70 flex items-center justify-center rounded-lg">
                                  <span className="text-xs font-semibold text-destructive">{out ? 'OUT OF STOCK' : 'NO PRICE'}</span>
                                </div>
                              )}
                            </div>
                            <div className="font-medium text-sm line-clamp-2 leading-tight flex-1">{product.name}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                              per piece{product.code ? ` · ${product.code}` : ''}
                            </div>
                            <div className="mt-2 flex items-center justify-between gap-1">
                              <span className="text-primary font-bold text-sm sm:text-base">{naira(product.unitPrice)}</span>
                              <Badge
                                variant={out ? 'destructive' : 'secondary'}
                                className={cn('text-[10px] px-1.5 gap-0.5', low && 'bg-amber-500/20 text-amber-700 dark:text-amber-400')}
                              >
                                {low && <AlertTriangle className="h-3 w-3" />}
                                {product.stock} pcs
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                  {filteredProducts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                      <Search className="h-12 w-12 mb-3 opacity-40" />
                      <p>No products found</p>
                    </div>
                  )}
                </>
              )}
            </ScrollArea>
          </div>
        </div>

        {/* Cart (desktop) */}
        <aside className="hidden lg:flex w-80 xl:w-96 border-l bg-card flex-col min-h-0 shrink-0">
          <div className="px-4 py-3 border-b flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <h2 className="font-semibold text-lg">Current Sale</h2>
              {cartCount > 0 && <Badge variant="secondary">{cartCount}</Badge>}
            </div>
            <Button variant="ghost" size="sm" onClick={clearCart} disabled={!cart.length} className="text-destructive hover:text-destructive">
              Clear
            </Button>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full">{CartBody}</ScrollArea>
          </div>
          {CartFooter}
        </aside>
      </div>

      {cart.length > 0 && (
        <div className="lg:hidden sticky bottom-0 z-30 border-t bg-background/95 backdrop-blur p-3 pr-24 print:hidden">
          <Button size="lg" className="w-full h-12 font-semibold" onClick={() => setMobileCartOpen(true)}>
            <ShoppingCart className="h-5 w-5 mr-2" />
            {cartCount} • {naira(total)}
          </Button>
        </div>
      )}

      {/* ========== MOBILE CART ========== */}
      <Dialog open={mobileCartOpen} onOpenChange={setMobileCartOpen}>
        <DialogContent className="sm:max-w-md h-[90dvh] flex flex-col p-0 gap-0 sm:rounded-2xl">
          <DialogHeader className="px-4 py-3 border-b shrink-0">
            <div className="flex items-center justify-between gap-2 pr-8">
              <DialogTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" /> Current Sale
                {cartCount > 0 && <Badge variant="secondary">{cartCount}</Badge>}
              </DialogTitle>
              <Button variant="ghost" size="sm" onClick={clearCart} disabled={!cart.length} className="text-destructive">
                Clear
              </Button>
            </div>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full">{CartBody}</ScrollArea>
          </div>
          {CartFooter}
        </DialogContent>
      </Dialog>

      {/* ========== PAYMENT ========== */}
      <Dialog
        open={payOpen}
        onOpenChange={(o) => {
          if (submitting) return;
          setPayOpen(o);
          if (!o) setOpsCode('');
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Take payment</DialogTitle>
            <DialogDescription>
              {quoting ? 'Checking prices and stock…' : quote?.ok ? `Total to pay: ${naira(payTotal)}` : 'This sale cannot be completed yet.'}
            </DialogDescription>
          </DialogHeader>

          {quoting ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4 py-1">
              {quote?.problems?.length > 0 && (
                <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive space-y-1">
                  {quote.problems.map((p, i) => (
                    <div key={i}>
                      {p.name ? <strong>{p.name}: </strong> : null}
                      {p.error}
                    </div>
                  ))}
                </div>
              )}

              {quote?.ok && (
                <>
                  <div className="rounded-md bg-muted/40 p-3 text-sm space-y-1">
                    <div className="flex justify-between"><span>Items (incl. VAT {naira(quote.vat)})</span><span>{naira(quote.subTotal)}</span></div>
                    {quote.discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>−{naira(quote.discount)}</span></div>}
                    <div className="flex justify-between font-semibold text-base pt-1"><span>Total</span><span>{naira(quote.grandTotal)}</span></div>
                    {Math.abs((quote.grandTotal || 0) - total) >= 0.01 && (
                      <p className="text-xs text-amber-600 pt-1">Prices or stock changed since the cart was built; this is the current total.</p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {PAYMENT_METHODS.map((m) => (
                      <Button
                        key={m.id}
                        variant={paymentMethod === m.id ? 'default' : 'outline'}
                        className="h-16 flex-col gap-1"
                        onClick={() => setPaymentMethod(m.id)}
                        disabled={submitting}
                      >
                        <m.icon className="h-5 w-5" />
                        <span className="text-xs">{m.label}</span>
                      </Button>
                    ))}
                  </div>

                  {paymentMethod === 'cash' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="tendered">Amount tendered</label>
                      <Input
                        id="tendered"
                        type="number"
                        inputMode="decimal"
                        value={amountTendered}
                        onChange={(e) => setAmountTendered(e.target.value)}
                        placeholder={String(payTotal)}
                        className="h-12 text-lg"
                        autoFocus
                        disabled={submitting}
                      />
                      <div className="flex flex-wrap gap-2">
                        {[payTotal, Math.ceil(payTotal / 1000) * 1000, Math.ceil(payTotal / 5000) * 5000]
                          .filter((v, i, a) => a.indexOf(v) === i)
                          .map((v) => (
                            <Button key={v} type="button" variant="outline" size="sm" onClick={() => setAmountTendered(String(v))}>
                              {naira(v, 0)}
                            </Button>
                          ))}
                      </div>
                      {tenderedNum >= payTotal ? (
                        <p className="text-emerald-600 dark:text-emerald-400 font-semibold">Change: {naira(change)}</p>
                      ) : amountTendered ? (
                        <p className="text-destructive text-sm">Short by {naira(payTotal - tenderedNum)}</p>
                      ) : null}
                    </div>
                  )}
                  {paymentMethod !== 'cash' && (
                    <p className="text-sm text-muted-foreground">
                      Confirm the {paymentMethod} payment of {naira(payTotal)} was received before completing.
                    </p>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="pos-ops">
                      Your ops code
                    </label>
                    <Input
                      id="pos-ops"
                      type="password"
                      inputMode="numeric"
                      autoComplete="off"
                      value={opsCode}
                      onChange={(e) => setOpsCode(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && canComplete && completeSale()}
                      placeholder="Sign this sale with your ops code"
                      className="h-11 text-base tracking-widest"
                      disabled={submitting}
                    />
                    <p className="text-xs text-muted-foreground">The sale is recorded under your name once your ops code is confirmed.</p>
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPayOpen(false)} disabled={submitting}>
              Back
            </Button>
            <Button onClick={completeSale} disabled={!canComplete}>
              {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              Complete sale
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========== RECEIPT ========== */}
      <Dialog open={Boolean(receipt)} onOpenChange={(o) => !o && setReceipt(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" /> Sale complete
            </DialogTitle>
            <DialogDescription>{receipt?.reference}</DialogDescription>
          </DialogHeader>
          {receipt && (
            <div className="text-sm space-y-1">
              <div className="flex justify-between"><span>Total</span><strong>{naira(receipt.grandTotal)}</strong></div>
              <div className="flex justify-between capitalize"><span>Paid by</span><span>{receipt.payment?.method}</span></div>
              {receipt.payment?.method === 'cash' && (
                <>
                  <div className="flex justify-between"><span>Tendered</span><span>{naira(receipt.payment.tendered)}</span></div>
                  <div className="flex justify-between text-emerald-600 font-semibold"><span>Change</span><span>{naira(receipt.payment.change)}</span></div>
                </>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="secondary" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" /> Print receipt
            </Button>
            <Button onClick={() => { setReceipt(null); searchInputRef.current?.focus(); }}>New sale</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========== TODAY'S SALES ========== */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85dvh] flex flex-col">
          <DialogHeader>
            <DialogTitle>My sales today</DialogTitle>
            {history && !history.error && (
              <DialogDescription>
                {history.count} sale{history.count === 1 ? '' : 's'} · {naira(history.total)}
                {Object.entries(history.byMethod || {}).map(([m, v]) => ` · ${m} ${naira(v, 0)}`).join('')}
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-y-auto">
            {!history ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : history.error ? (
              <p className="text-sm text-destructive">{history.error}</p>
            ) : history.sales.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No sales yet today.</p>
            ) : (
              <div className="divide-y">
                {history.sales.map((s) => (
                  <div key={s._id} className="flex items-center justify-between gap-2 py-2 text-sm">
                    <div className="min-w-0">
                      <div className="font-medium">{s.reference}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(s.time).toLocaleTimeString()} · {s.lines} line{s.lines === 1 ? '' : 's'} · <span className="capitalize">{s.method}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-semibold">{naira(s.total)}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Reprint" onClick={() => reprint(s._id)}>
                        <Receipt className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ========== PRINTABLE RECEIPT (80 mm) ========== */}
      <div className="hidden print:block">
        {receipt && (
          <div className="mx-auto text-black" style={{ width: '72mm', fontFamily: 'monospace', fontSize: '11px' }}>
            <div className="text-center mb-2">
              {business.logo && <img src={business.logo} alt="" style={{ maxHeight: '18mm', margin: '0 auto 2mm' }} />}
              <div style={{ fontSize: '14px', fontWeight: 700 }}>{business.name}</div>
              {business.address && <div>{business.address}</div>}
              {business.phone && <div>Tel: {business.phone}</div>}
              <div style={{ marginTop: '2mm' }}>{new Date(receipt.date).toLocaleString()}</div>
              <div>{receipt.reference}</div>
              <div>Cashier: {receipt.payment?.cashier || receipt.cashier}</div>
            </div>
            <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '1mm 0' }}>
              {receipt.lines.map((l, i) => (
                <div key={i} style={{ marginBottom: '1mm' }}>
                  <div>{l.name}</div>
                  <div className="flex justify-between">
                    <span>
                      {l.pcs} pcs x {naira(l.piecePrice)}
                      {l.vatPercent > 0 ? ` +${l.vatPercent}% VAT` : ''}
                    </span>
                    <span>{naira(l.total)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '1mm' }}>
              <div className="flex justify-between"><span>Subtotal</span><span>{naira(receipt.subTotal)}</span></div>
              {receipt.discount > 0 && <div className="flex justify-between"><span>Discount</span><span>-{naira(receipt.discount)}</span></div>}
              {receipt.vat > 0 && <div className="flex justify-between"><span>VAT included</span><span>{naira(receipt.vat)}</span></div>}
              <div className="flex justify-between" style={{ fontWeight: 700, fontSize: '13px', borderTop: '1px solid #000', marginTop: '1mm', paddingTop: '1mm' }}>
                <span>TOTAL</span><span>{naira(receipt.grandTotal)}</span>
              </div>
              <div className="flex justify-between" style={{ textTransform: 'capitalize' }}><span>Paid ({receipt.payment?.method})</span><span>{naira(receipt.payment?.tendered)}</span></div>
              {receipt.payment?.change > 0 && <div className="flex justify-between"><span>Change</span><span>{naira(receipt.payment.change)}</span></div>}
            </div>
            <div className="text-center" style={{ marginTop: '3mm' }}>
              <div>Thank you for your patronage!</div>
              <div>Goods sold are not returnable without this receipt.</div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        @media print {
          @page {
            size: 80mm auto;
            margin: 4mm;
          }
          body * {
            visibility: hidden;
          }
          .print\\:block,
          .print\\:block * {
            visibility: visible;
          }
          .print\\:block {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
