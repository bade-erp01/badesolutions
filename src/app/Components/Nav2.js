"use client";
import React, { useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Nav2({ onToggleSideNav, navtitle, onSearchChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    onToggleSideNav();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    onSearchChange(searchTerm);
  };

  return (
    <nav className="sticky top-0 z-20 backdrop-blur w-full bg-[#fcfcfcda] p-2 shadow-xs shadow-gray-400 border-b border-slate-200">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <h1 className="text-md font-black tracking-tight text-slate-900">
          {navtitle}
        </h1>

        {/* Search Bar */}
        {navtitle && (
          <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 mx-8 max-w-md">
            <div className="relative w-full">
              <Input
                type="search"
                placeholder={`Search ${navtitle}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <Button type="submit" size="sm" variant="default">
              Search
            </Button>
          </form>
        )}

        {/* Toggle button */}
        <button
          onClick={handleToggle}
          className="rounded-lg  px-5 py-2 text-sm font-semibold text-slate-900 transition hover:text-slate-800"
          aria-label="Toggle Menu"
        >
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          )}
        </button>
      </div>
    </nav>
  );
}
