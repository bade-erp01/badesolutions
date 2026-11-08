"use client";

import { useState } from "react";
import { LayoutGrid, List, Columns3, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Card from "@/app/Components/Card";
import { useParams } from "next/navigation";

export default function ProductGrid({ productList, moduleParams }) {
  const [view, setView] = useState("grid");
  const [page, setPage] = useState(1);
  const params = useParams();
  const perPage = 200;

  const sorted = [...productList].sort((a, b) => a.Name.trim().localeCompare(b.Name.trim()));
  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const paged = sorted.slice((page - 1) * perPage, page * perPage);
  const categories = Array.from(new Set(paged.map((p) => p.category || "Uncategorized")));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <button onClick={() => setView("grid")} className={`p-2 rounded border border-gray-200 dark:border-gray-700 ${view === "grid" ? "bg-gray-200 dark:bg-gray-700" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}><LayoutGrid className="h-4 w-4" /></button>
        <button onClick={() => setView("list")} className={`p-2 rounded border border-gray-200 dark:border-gray-700 ${view === "list" ? "bg-gray-200 dark:bg-gray-700" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}><List className="h-4 w-4" /></button>
        <button onClick={() => setView("kanban")} className={`p-2 rounded border border-gray-200 dark:border-gray-700 ${view === "kanban" ? "bg-gray-200 dark:bg-gray-700" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}><Columns3 className="h-4 w-4" /></button>
      </div>

      {view === "grid" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
          {paged.map((element) => (
            <Card key={element._id} data={element} module="product" url={`/${params.auth}/V4/${params.Module}/${params.Module}/${element._id}`} />
          ))}
        </div>
      )}

      {view === "list" && (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 dark:border-gray-700">
            <thead><tr className="bg-gray-100 dark:bg-gray-800">
              <th className="p-2 text-left">Name</th><th className="p-2 text-left">Category</th><th className="p-2 text-left">Price</th><th className="p-2 text-left">Stock</th>
            </tr></thead>
            <tbody>
              {paged.map((p) => (
                <tr key={p._id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="p-2"><Link href={`/${params.auth}/V4/${params.Module}/${params.Module}/${p._id}`} className="text-blue-600 hover:underline">{p.Name}</Link></td>
                  <td className="p-2">{p.category || "—"}</td>
                  <td className="p-2">{p.sellingPrice}</td>
                  <td className="p-2">{p.totalStock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === "kanban" && (
        <div className="flex gap-4 overflow-x-auto">
          {categories.map((cat) => (
            <div key={cat} className="min-w-[260px] bg-gray-50 dark:bg-gray-800 rounded p-3">
              <h3 className="font-semibold mb-2">{cat}</h3>
              {paged.filter((p) => (p.category || "Uncategorized") === cat).map((p) => (
                <div key={p._id} className="bg-white dark:bg-gray-900 rounded shadow p-2 mb-2 text-sm border border-gray-200 dark:border-gray-700">{p.Name}</div>
              ))}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 justify-center mt-4">
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="p-2 rounded border border-gray-200 dark:border-gray-700 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
        <span className="text-sm">Page {page} of {totalPages}</span>
        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-2 rounded border border-gray-200 dark:border-gray-700 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
      </div>
    </div>
  );
}