'use client';

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
} from 'lucide-react';
import { Encrypt } from "../../../../../../Functions/Mics";
import { useUser } from "@/components/UserProvider";
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
import { EXPRESS_PRIVATE_URL } from "../../../../../../Functions/Functions";

// ============== CONSTANTS ==============
const TAX_RATE = 0.075; // 7.5%
const LOW_STOCK_THRESHOLD = 10;

// ============== STORAGE KEYS ==============
const STORAGE_KEYS = {
  PRODUCTS: 'pos_products',
  CART: 'pos_cart',
  PENDING_SALES: 'pos_pending_sales',
  LAST_SYNC: 'pos_last_sync',
};

// ============== NORMALIZE API PRODUCT ==============
function normalizeProduct(raw) {
  const item = raw.item || raw;
  const id = String(item._id || raw.productId || '');
  const name = item.Name || item.name || 'Unnamed Product';
  const category = item.category || 'Uncategorized';
  const price = Number(item.Pricelist1 ?? item.Pricelist2 ?? item.Pricelist3 ?? 0) || 0;
  const stock = Number(raw.Case ?? item.virtualQty ?? 0) || 0;
  const pcs = Number(raw.pcs ?? 0) || 0;
  const piecesPerCase = Number(item.Pieces ?? 1) || 1;
  const umo = item.UMO || 'UNIT';
  const image = item.image || null;
  const barcode = item.ACDcode || item.product_code || item.Manufacture_code || id;
  const vat = Number(item.VAT?.$numberDecimal ?? item.VAT ?? TAX_RATE * 100) / 100;

  return {
    id,
    name,
    category,
    price,
    stock,
    pcs,
    piecesPerCase,
    umo,
    image,
    barcode,
    vat,
    _raw: raw,
  };
}

// ============== COMPONENT ==============
export default function POS() {
  const { user } = useUser();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [discountType, setDiscountType] = useState('percent');
  const [discountValue, setDiscountValue] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountTendered, setAmountTendered] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [lastSale, setLastSale] = useState(null);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const [scanFeedback, setScanFeedback] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  const searchInputRef = useRef(null);
  const printRef = useRef(null);

  // ============== API ==============
  const fetchProducts = useCallback(async () => {
    const res = await fetch(`${EXPRESS_PRIVATE_URL}/api/Pos/products`, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Encrypt(user.business.tenantId)}`,
        access: `${Encrypt(user.user._id)}`,
        sessionKey: `Bearer ${Encrypt(user.SessionId)}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch products: ${res.status}`);
    }

    const data = await res.json();
    console.log(data);

    const list = Array.isArray(data) ? data : data.data ?? data.products ?? [];
    return list.map(normalizeProduct);
  }, [user]);

  const syncSale = useCallback(async (sale) => {
    await new Promise((r) => setTimeout(r, 400));
    console.log('Synced sale to server:', sale.id);
    return { success: true };
  }, []);

  // ============== INVENTORY HELPERS ==============
  const saveProducts = useCallback((updatedProducts) => {
    setProducts(updatedProducts);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updatedProducts));
  }, []);

  const getPendingSales = () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_SALES) || '[]');
  };

  const savePendingSales = (sales) => {
    localStorage.setItem(STORAGE_KEYS.PENDING_SALES, JSON.stringify(sales));
    setPendingCount(sales.length);
  };

  const deductStock = useCallback((items) => {
    setProducts((prev) => {
      const updated = prev.map((p) => {
        const sold = items.find((i) => i.id === p.id);
        if (sold) {
          return { ...p, stock: Math.max(0, p.stock - sold.quantity) };
        }
        return p;
      });
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // ============== SYNC / LOAD ==============
  const syncInventory = useCallback(async () => {
    if (!navigator.onLine) return;

    setIsSyncing(true);
    try {
      const pending = getPendingSales();
      const stillPending = [];

      for (const sale of pending) {
        try {
          await syncSale(sale);
        } catch {
          stillPending.push(sale);
        }
      }
      savePendingSales(stillPending);

      const serverProducts = await fetchProducts();
      saveProducts(serverProducts);

      const now = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, now);
      setLastSyncTime(now);

      setScanFeedback({ type: 'success', message: 'Inventory synced successfully' });
      setTimeout(() => setScanFeedback(null), 2500);
    } catch (err) {
      console.error('Sync failed:', err);
      setScanFeedback({ type: 'error', message: 'Sync failed. Will retry later.' });
      setTimeout(() => setScanFeedback(null), 2500);
    } finally {
      setIsSyncing(false);
    }
  }, [fetchProducts, saveProducts, syncSale]);

  const loadProducts = useCallback(async () => {
    setIsLoadingProducts(true);

    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (saved) {
      try {
        setProducts(JSON.parse(saved));
      } catch {
        // ignore
      }
    }

    if (navigator.onLine) {
      try {
        const serverProducts = await fetchProducts();
        saveProducts(serverProducts);

        const now = new Date().toISOString();
        localStorage.setItem(STORAGE_KEYS.LAST_SYNC, now);
        setLastSyncTime(now);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        if (!saved) {
          setScanFeedback({
            type: 'error',
            message: 'Could not load products. Check your connection.',
          });
          setTimeout(() => setScanFeedback(null), 3000);
        }
      }
    }

    setIsLoadingProducts(false);
  }, [fetchProducts, saveProducts]);

  // ============== INIT ==============
  useEffect(() => {
    loadProducts();

    const savedCart = localStorage.getItem(STORAGE_KEYS.CART);
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch {}
    }

    setPendingCount(getPendingSales().length);
    const last = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    if (last) setLastSyncTime(last);

    const updateOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      if (online) syncInventory();
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [loadProducts, syncInventory]);

  // Persist cart
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  // Auto-focus search
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // ============== BARCODE SCANNER ==============
  useEffect(() => {
    let barcode = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e) => {
      if (
        document.activeElement?.tagName === 'INPUT' &&
        document.activeElement !== searchInputRef.current
      ) {
        return;
      }

      const now = Date.now();
      if (now - lastKeyTime > 80) barcode = '';
      lastKeyTime = now;

      if (e.key === 'Enter') {
        if (barcode.length >= 4) {
          const product = products.find(
            (p) =>
              p.barcode === barcode ||
              p.id === barcode ||
              (p.barcode && p.barcode.toLowerCase().includes(barcode.toLowerCase()))
          );

          if (product) {
            if (product.stock <= 0) {
              setScanFeedback({ type: 'error', message: `${product.name} is out of stock` });
            } else {
              addToCart(product);
              setSearch('');
              setScanFeedback({ type: 'success', message: `Added: ${product.name}` });
            }
          } else {
            setScanFeedback({ type: 'error', message: `Barcode not found: ${barcode}` });
          }
          setTimeout(() => setScanFeedback(null), 2000);
        }
        barcode = '';
        return;
      }

      if (/^[0-9A-Za-z.\-']$/.test(e.key)) {
        barcode += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [products]);

  // ============== COMPUTED ==============
  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
    return ['All', ...cats.sort()];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase().trim();
    return products.filter((p) => {
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.toLowerCase().includes(q)) ||
        p.id.toLowerCase().includes(q);
      const matchesCategory = category === 'All' || p.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const discountAmount = useMemo(() => {
    if (discountType === 'percent') return (subtotal * discountValue) / 100;
    return Math.min(discountValue, subtotal);
  }, [subtotal, discountType, discountValue]);

  const taxable = Math.max(0, subtotal - discountAmount);
  const tax = taxable * TAX_RATE;
  const total = taxable + tax;

  const change = useMemo(() => {
    const tendered = parseFloat(amountTendered) || 0;
    return Math.max(0, tendered - total);
  }, [amountTendered, total]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // ============== CART ACTIONS ==============
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      const currentQty = existing ? existing.quantity : 0;

      if (currentQty + 1 > product.stock) {
        setScanFeedback({
          type: 'error',
          message: `Only ${product.stock} ${product.umo || 'unit'}(s) left in stock`,
        });
        setTimeout(() => setScanFeedback(null), 2000);
        return prev;
      }

      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, qty) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;

    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.id !== id));
      return;
    }

    if (qty > product.stock) {
      setScanFeedback({
        type: 'error',
        message: `Only ${product.stock} available`,
      });
      setTimeout(() => setScanFeedback(null), 2000);
      return;
    }

    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i))
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountValue(0);
    setAmountTendered('');
  };

  // ============== CHECKOUT ==============
  const handleCheckout = () => {
    if (cart.length === 0) return;

    for (const item of cart) {
      const product = products.find((p) => p.id === item.id);
      if (!product || product.stock < item.quantity) {
        setScanFeedback({
          type: 'error',
          message: `Insufficient stock for ${item.name}`,
        });
        setTimeout(() => setScanFeedback(null), 2500);
        return;
      }
    }

    const sale = {
      id: `SALE-${Date.now()}`,
      items: cart,
      subtotal,
      discount: discountAmount,
      tax,
      total,
      paymentMethod,
      amountTendered: parseFloat(amountTendered) || total,
      change,
      timestamp: new Date().toISOString(),
      offline: !isOnline,
      synced: false,
    };

    deductStock(cart);

    const history = JSON.parse(localStorage.getItem('pos_sales') || '[]');
    history.unshift(sale);
    localStorage.setItem('pos_sales', JSON.stringify(history.slice(0, 200)));

    if (!isOnline) {
      const pending = getPendingSales();
      pending.push(sale);
      savePendingSales(pending);
    } else {
      syncSale(sale).catch(() => {
        const pending = getPendingSales();
        pending.push(sale);
        savePendingSales(pending);
      });
    }

    setLastSale(sale);
    setShowCheckout(true);
  };

  const completeSale = () => {
    clearCart();
    setShowCheckout(false);
    setLastSale(null);
    setMobileCartOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  // ============== RENDER ==============
  return (
    <div className="lg:h-[calc(100dvh-8rem)] min-w-0 bg-background text-foreground flex flex-col font-sans lg:overflow-hidden">
      {/* ========== HEADER ========== */}
      <header className="shrink-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 print:hidden">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold tracking-tight">Point of Sale</h1>
              <p className="text-xs text-muted-foreground">powered by Bade</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={syncInventory}
              disabled={!isOnline || isSyncing}
              className="gap-1.5"
            >
              <RefreshCw className={cn('h-4 w-4', isSyncing && 'animate-spin')} />
              <span className="hidden sm:inline">
                {isSyncing ? 'Syncing...' : 'Sync'}
              </span>
              {pendingCount > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 px-1.5">
                  {pendingCount}
                </Badge>
              )}
            </Button>

            <Badge
              variant={isOnline ? 'default' : 'secondary'}
              className={cn(
                'gap-1.5 px-3 py-1.5',
                isOnline
                  ? 'bg-emerald-600 hover:bg-emerald-600 text-white'
                  : 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
              )}
            >
              {isOnline ? (
                <Wifi className="h-3.5 w-3.5" />
              ) : (
                <WifiOff className="h-3.5 w-3.5 animate-pulse" />
              )}
              <span className="hidden sm:inline">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </Badge>

            <div className="hidden md:block text-right text-sm">
              <div className="text-muted-foreground">Cashier</div>
              <div className="font-medium">Admin</div>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="relative lg:hidden"
              onClick={() => setMobileCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* ========== SCAN / SYNC FEEDBACK ========== */}
      {scanFeedback && (
        <div
          className={cn(
            'fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg text-sm font-medium print:hidden',
            scanFeedback.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-destructive text-destructive-foreground'
          )}
        >
          {scanFeedback.message}
        </div>
      )}

      {/* ========== MAIN LAYOUT ========== */}
      <div className="flex-1 flex min-h-0 lg:overflow-hidden print:hidden">
        {/* LEFT: Products – independent scroll */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0 p-3 sm:p-6 lg:overflow-hidden">
          {/* Search + Categories (fixed) */}
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

          {/* Product grid – scrolls independently */}
          <div className="flex-1 min-h-0 lg:overflow-hidden">
            <ScrollArea className="h-full">
              {isLoadingProducts && products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <RefreshCw className="h-10 w-10 mb-3 animate-spin opacity-50" />
                  <p>Loading products...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2 sm:gap-3 pb-4 pr-0 lg:pr-3">
                    {filteredProducts.map((product) => {
                      const isOutOfStock = product.stock <= 0;
                      const isLowStock =
                        product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD;

                      return (
                        <Card
                          key={product.id}
                          className={cn(
                            'cursor-pointer transition-all hover:shadow-md active:scale-[0.98]',
                            isOutOfStock
                              ? 'opacity-60 cursor-not-allowed'
                              : 'hover:border-primary'
                          )}
                          onClick={() => !isOutOfStock && addToCart(product)}
                        >
                          <CardContent className="p-3 flex flex-col h-full">
                            <div className="bg-muted/50 rounded-lg h-20 sm:h-24 flex items-center justify-center mb-3 relative overflow-hidden">
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="h-full w-full object-contain"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <span className="text-3xl font-bold text-muted-foreground/40">
                                  {product.name?.charAt(0) ?? '?'}
                                </span>
                              )}
                              {isOutOfStock && (
                                <div className="absolute inset-0 bg-background/70 flex items-center justify-center rounded-lg">
                                  <span className="text-xs font-semibold text-destructive">
                                    OUT OF STOCK
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="font-medium text-sm line-clamp-2 leading-tight flex-1">
                              {product.name}
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                              {product.umo}
                            </div>
                            <div className="mt-2 flex items-center justify-between gap-1">
                              <span className="text-primary font-bold text-sm sm:text-base">
                                ₦{Number(product.price).toLocaleString()}
                              </span>
                              <Badge
                                variant={isOutOfStock ? 'destructive' : 'secondary'}
                                className={cn(
                                  'text-[10px] px-1.5 gap-0.5',
                                  isLowStock &&
                                    !isOutOfStock &&
                                    'bg-amber-500/20 text-amber-700 dark:text-amber-400'
                                )}
                              >
                                {isLowStock && !isOutOfStock && (
                                  <AlertTriangle className="h-3 w-3" />
                                )}
                                {product.stock}
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

        {/* RIGHT: Cart (Desktop) – independent scroll */}
        <aside className="hidden lg:flex w-80 xl:w-96 border-l bg-card flex-col min-h-0 shrink-0">
          {/* Cart header */}
          <div className="px-4 py-3 border-b flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <h2 className="font-semibold text-lg">Current Sale</h2>
              {cartCount > 0 && <Badge variant="secondary">{cartCount}</Badge>}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCart}
              disabled={cart.length === 0}
              className="text-destructive hover:text-destructive"
            >
              Clear
            </Button>
          </div>

          {/* Cart items – scrolls independently */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-3 space-y-2">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <ShoppingCart className="h-14 w-14 mb-3 opacity-30" />
                    <p className="font-medium">Cart is empty</p>
                    <p className="text-sm">Scan or add products</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl bg-muted/40 p-3 space-y-2"
                    >
                      {/* Name + line total */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm leading-snug line-clamp-2">
                            {item.name}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            ₦{Number(item.price).toLocaleString()} / {item.umo || 'unit'}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-semibold text-sm whitespace-nowrap">
                            ₦{(item.price * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Quantity controls + remove */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(item.id, parseInt(e.target.value) || 1)
                            }
                            className="w-12 h-8 text-center px-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-xs text-destructive hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Cart footer (fixed) */}
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
                className="h-9"
              />
            </div>

            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>₦{subtotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Discount</span>
                  <span>-₦{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Tax (7.5%)</span>
                <span>
                  ₦{tax.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>
                  ₦{total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full h-12 text-base font-semibold"
              onClick={handleCheckout}
              disabled={cart.length === 0}
            >
              Checkout • ₦
              {total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </Button>
          </div>
        </aside>
      </div>

      {cart.length > 0 && (
        <div className="lg:hidden sticky bottom-0 z-30 border-t bg-background/95 backdrop-blur p-3 pr-24 print:hidden">
          <Button
            size="lg"
            className="w-full h-12 font-semibold"
            onClick={() => setMobileCartOpen(true)}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            {cartCount} • ₦
            {total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </Button>
        </div>
      )}

      {/* ========== MOBILE CART ========== */}
      <Dialog open={mobileCartOpen} onOpenChange={setMobileCartOpen}>
        <DialogContent className="sm:max-w-md h-[90dvh] flex flex-col p-0 gap-0 sm:rounded-2xl">
          <DialogHeader className="px-4 py-3 border-b shrink-0">
            <div className="flex items-center justify-between gap-2 pr-8">
              <DialogTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Current Sale
                {cartCount > 0 && <Badge variant="secondary">{cartCount}</Badge>}
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                disabled={cart.length === 0}
                className="text-destructive"
              >
                Clear
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full px-4">
              <div className="py-3 space-y-2">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <ShoppingCart className="h-14 w-14 mb-3 opacity-30" />
                    <p>Cart is empty</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl bg-muted/40 p-3 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm leading-snug line-clamp-2">
                            {item.name}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            ₦{Number(item.price).toLocaleString()} / {item.umo || 'unit'}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-semibold text-sm whitespace-nowrap">
                            ₦{(item.price * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(item.id, parseInt(e.target.value) || 1)
                            }
                            className="w-12 h-8 text-center px-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-xs text-destructive hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="border-t p-4 space-y-3 shrink-0">
            <div className="flex items-center gap-2">
              <Select value={discountType} onValueChange={setDiscountType}>
                <SelectTrigger className="w-[120px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">% Off</SelectItem>
                  <SelectItem value="fixed">₦ Off</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                min="0"
                value={discountValue || ''}
                onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="h-9"
              />
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>₦{subtotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span>-₦{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Tax</span>
                <span>
                  ₦{tax.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-1">
                <span>Total</span>
                <span>
                  ₦{total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full h-12"
              onClick={handleCheckout}
              disabled={cart.length === 0}
            >
              Checkout • ₦
              {total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ========== CHECKOUT MODAL ========== */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Complete Payment</DialogTitle>
            <p className="text-muted-foreground">
              Total:{' '}
              <span className="font-bold text-foreground">
                ₦
                {lastSale?.total.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </span>
            </p>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'cash', label: 'Cash', icon: Banknote },
                { id: 'card', label: 'Card', icon: CreditCard },
                { id: 'transfer', label: 'Transfer', icon: ArrowLeftRight },
              ].map((m) => (
                <Button
                  key={m.id}
                  variant={paymentMethod === m.id ? 'default' : 'outline'}
                  className="h-16 flex-col gap-1"
                  onClick={() => setPaymentMethod(m.id)}
                >
                  <m.icon className="h-5 w-5" />
                  <span className="text-xs">{m.label}</span>
                </Button>
              ))}
            </div>

            {paymentMethod === 'cash' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount Tendered</label>
                <Input
                  type="number"
                  value={amountTendered}
                  onChange={(e) => setAmountTendered(e.target.value)}
                  placeholder="0"
                  className="h-12 text-lg"
                  autoFocus
                />
                {parseFloat(amountTendered) >= (lastSale?.total || 0) && (
                  <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    Change: ₦
                    {change.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCheckout(false)}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print A3
            </Button>
            <Button onClick={completeSale}>Complete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========== PRINTABLE RECEIPT ========== */}
      <div className="hidden print:block">
        <div
          ref={printRef}
          className="p-12 mx-auto text-black"
          style={{ width: '297mm', minHeight: '420mm' }}
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight">SuperMart</h1>
            <p className="text-lg text-gray-600">123 Market Road, Lagos</p>
            <p className="text-sm">Tel: +234 800 000 0000</p>
            <p className="text-sm mt-2">
              {new Date().toLocaleString()} • Receipt #{lastSale?.id || '—'}
            </p>
            {!isOnline && (
              <p className="text-amber-700 font-medium mt-1">(Processed Offline)</p>
            )}
          </div>

          <table className="w-full text-left mb-8">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="py-2 text-lg">Item</th>
                <th className="py-2 text-lg text-center">Qty</th>
                <th className="py-2 text-lg text-right">Price</th>
                <th className="py-2 text-lg text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {(lastSale?.items || cart).map((item) => (
                <tr key={item.id} className="border-b border-gray-300">
                  <td className="py-3 text-base">
                    {item.name}
                    {item.umo && (
                      <span className="text-sm text-gray-500 ml-1">({item.umo})</span>
                    )}
                  </td>
                  <td className="py-3 text-center text-base">{item.quantity}</td>
                  <td className="py-3 text-right text-base">
                    ₦{Number(item.price).toLocaleString()}
                  </td>
                  <td className="py-3 text-right text-base font-medium">
                    ₦{(item.price * item.quantity).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-80 space-y-2 text-lg">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₦{(lastSale?.subtotal || subtotal).toLocaleString()}</span>
              </div>
              {(lastSale?.discount || discountAmount) > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount</span>
                  <span>
                    -₦{(lastSale?.discount || discountAmount).toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax (7.5%)</span>
                <span>
                  ₦
                  {(lastSale?.tax || tax).toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
              <div className="flex justify-between text-2xl font-bold border-t-2 border-black pt-3">
                <span>TOTAL</span>
                <span>
                  ₦
                  {(lastSale?.total || total).toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
              {lastSale?.paymentMethod === 'cash' && (
                <>
                  <div className="flex justify-between pt-2">
                    <span>Tendered</span>
                    <span>₦{lastSale.amountTendered.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Change</span>
                    <span>₦{lastSale.change.toLocaleString()}</span>
                  </div>
                </>
              )}
              <div className="pt-2 text-base">
                Payment:{' '}
                <strong className="capitalize">
                  {lastSale?.paymentMethod || paymentMethod}
                </strong>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center text-sm text-gray-600">
            <p>Thank you for shopping with us!</p>
            <p className="mt-1">Goods once sold are not returnable without receipt.</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* Hide scrollbar but keep scroll functionality */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        @media print {
          @page {
            size: A3 portrait;
            margin: 15mm;
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