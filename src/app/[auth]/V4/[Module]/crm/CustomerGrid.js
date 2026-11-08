"use client";

import { useState } from "react";
import { LayoutGrid, List, Columns3, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Card from "@/app/Components/Card";
import { Encrypt } from "../../../../../../Functions/Mics";
import { useParams } from 'next/navigation';

export default function CustomerGrid({ customerList, moduleParams }) {
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [view, setView] = useState("grid");
  const [page, setPage] = useState(1);
  const params = useParams();
  const perPage = 200;

  const sortedCustomers = [...customerList].sort((a, b) =>
    a.Username.localeCompare(b.Username),
  );

  const paged = selectedLetter
    ? sortedCustomers.filter((c) => {
        const firstChar = c.Username.charAt(0);
        if (selectedLetter === "#") {
          return !/[a-z0-9]/i.test(firstChar);
        }
        return firstChar.toLowerCase() === selectedLetter.toLowerCase();
      })
    : sortedCustomers;

  const totalPages = Math.max(1, Math.ceil(paged.length / perPage));
  const paged = paged.slice((page - 1) * perPage, page * perPage);

  const numbers = Array.from({ length: 10 }, (_, i) => i.toString());
  const uppercase = Array.from({ length: 26 }, (_, i) =>
    String.fromCharCode(65 + i),
  );
  const specials = ["#"];
  const alphabet = [...specials, ...numbers, ...uppercase];

  const categories = Array.from(
    new Set(paged.map((c) => c.category || "Uncategorized")),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <button
          onClick={() => setView("grid")}
          className={`p-2 rounded border border-gray-200 dark:border-gray-700 ${view === "grid" ? "bg-gray-200 dark:bg-gray-700" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
        >
          <LayoutGrid className="h-4 w-4" />
        </button>
        <button
          onClick={() => setView("list")}
          className={`p-2 rounded border border-gray-200 dark:border-gray-700 ${view === "list" ? "bg-gray-200 dark:bg-gray-700" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
        >
          <List className="h-4 w-4" />
        </button>
        <button
          onClick={() => setView("kanban")}
          className={`p-2 rounded border border-gray-200 dark:border-gray-700 ${view === "kanban" ? "bg-gray-200 dark:bg-gray-700" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
        >
          <Columns3 className="h-4 w-4" />
        </button>
      </div>

      {view === "grid" && (
        <div className="flex flex-wrap pr-12 sm:pr-20">
          {paged.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 flex-1 min-w-0">
              {paged.map((element) => (
                <Card
                  key={element._id}
                  data={element}
                  module={moduleParams}
                  url={`/${params.auth}/V4/${params.Module}/${params.Module}/${Encrypt(element._id)}`}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-700">
              <p className="mb-6 text-red-400">
                Oops... "{selectedLetter}" does not match with any customer name.
              </p>
            </div>
          )}
          <div
            className="fixed right-0 top-20 bottom-24 w-10 sm:w-16 z-30 flex flex-col items-center space-y-2 bg-white/80 shadow-md p-2"
            style={{ scrollbarWidth: "thin", overflowY: "scroll", overflowX: "hidden" }}
          >
            {alphabet.map((letter) => (
              <button
                key={letter}
                onClick={() => setSelectedLetter(letter)}
                className={`text-xs text-black ${selectedLetter === letter ? "px-2 py-1 bg-gray-300 text-indigo-500" : "hover:text-gray-300"}`}
              >
                {letter}
              </button>
            ))}
            <button
              onClick={() => setSelectedLetter(null)}
              className="mt-4 px-1 py-1 rounded bg-red-400 text-black text-xs"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {view === "list" && (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 dark:border-gray-700">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Phone</th>
                <th className="p-2 text-left">Category</th>
                <th className="p-2 text-left">Balance</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((c) => (
                <tr key={c._id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="p-2">
                    <Link
                      href={`/${params.auth}/V4/${params.Module}/${params.Module}/${Encrypt(c._id)}`}
                      className="text-blue-600 hover:underline"
                    >
                      {c.Username}
                    </Link>
                  </td>
                  <td className="p-2">{c.Email}</td>
                  <td className="p-2">{c.phone}</td>
                  <td className="p-2">{c.category || "—"}</td>
                  <td className="p-2">{c.Debt}</td>
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
              {paged
                .filter((c) => (c.category || "Uncategorized") === cat)
                .map((c) => (
                  <div key={c._id} className="bg-white dark:bg-gray-900 rounded shadow p-2 mb-2 text-sm border border-gray-200 dark:border-gray-700">
                    {c.Username}
                  </div>
                ))}
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2 justify-center mt-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          className="p-2 rounded border border-gray-200 dark:border-gray-700 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          className="p-2 rounded border border-gray-200 dark:border-gray-700 disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
