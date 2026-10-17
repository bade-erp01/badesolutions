"use client";

// The customer page's Sales section: the customer's invoices with their order lines, loaded
// only when the section is opened (GET /api/crm/:id/sales). The page itself only loads
// invoice summaries, which keeps it small.

import { useEffect, useState } from "react";
import api from "@/lib/api";
import CustomerSales from "@/app/Components/CustomerSales";

export default function CustomerSalesLoader({ customerParamId, customer, business, Rep }) {
  const [sales, setSales] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api.get(`/api/crm/${encodeURIComponent(customerParamId)}/sales`).then((r) => {
      if (cancelled) return;
      if (r.ok && Array.isArray(r.data?.Sales)) setSales(r.data.Sales);
      else setError(r.error || "Could not load this customer's sales.");
    });
    return () => {
      cancelled = true;
    };
  }, [customerParamId]);

  if (error) return <p className="py-3 text-sm text-red-600">{error}</p>;
  if (!sales) return <p className="py-3 text-sm text-muted-foreground">Loading sales…</p>;
  return <CustomerSales Sales={sales} customer={customer} business={business} Rep={Rep} />;
}
