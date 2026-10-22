"use client";

// Settings → Price lists: the business's price lists, read only.
//   GET /api/priceLists   [{ _id, Name }]

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ErrorMessage } from "../../../../../Functions/Mics";
import { pricelistSetter } from "../../../../../Functions/Functions";

export default function PriceLists({ business }) {
  // "Pricelist1"… are stored codes: show the business's own name for each (pricelistSetter)
  const nameOf = (name) => (business && pricelistSetter(name, business)) || name;
  const [lists, setLists] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      const r = await api.get("/api/priceLists");
      if (!r.ok) {
        setLists([]);
        return ErrorMessage(r.error);
      }
      const data = r.data?.data;
      setLists(Array.isArray(data) ? data : []);
    })();
  }, []);

  const shown = useMemo(() => {
    const s = search.trim().toLowerCase();
    return (lists || []).filter((l) => !s || String(nameOf(l.Name) || "").toLowerCase().includes(s));
  }, [lists, search, business]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Price lists</h2>
        <p className="text-sm text-muted-foreground max-w-2xl">
          The price lists your business sells on. Each product has a price on every list, and each customer is billed
          from the list assigned to them. This view is read only.
          {lists ? ` ${lists.length} price list${lists.length === 1 ? "" : "s"}.` : ""}
        </p>
      </div>

      {(lists?.length || 0) > 8 && (
        <Input placeholder="Search price lists" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
      )}

      <div className="rounded-md border overflow-x-auto max-w-2xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead>Price list</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lists === null ? (
              <TableRow>
                <TableCell colSpan={2} className="h-20 text-center text-muted-foreground">Loading…</TableCell>
              </TableRow>
            ) : shown.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="h-20 text-center text-muted-foreground">
                  {lists.length ? "No price list matches." : "No price lists set up yet."}
                </TableCell>
              </TableRow>
            ) : (
              shown.map((l, i) => (
                <TableRow key={l._id || l.Name}>
                  <TableCell className="text-muted-foreground tabular-nums">{i + 1}</TableCell>
                  <TableCell className="font-medium">{nameOf(l.Name)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
