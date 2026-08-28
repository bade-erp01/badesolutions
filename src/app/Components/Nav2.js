"use client";

import React, { useState } from "react";
import { Search, Menu, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Nav2({ onToggleSideNav, navtitle, onSearchChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    onToggleSideNav();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    onSearchChange?.(searchTerm);
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Left – Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="truncate text-base font-semibold tracking-tight text-foreground">
            {navtitle}
          </h1>
        </div>

        {/* Center – Search (only when not Dashboard) */}
        {navtitle && navtitle !== "Dashboard" && (
          <form
            onSubmit={handleSearch}
            className="hidden sm:flex flex-1 max-w-md items-center gap-2 mx-4"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder={`Search ${navtitle}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <Button type="submit" size="sm" className="shrink-0">
              Search
            </Button>
          </form>
        )}

        {/* Right – Menu Toggle */}
        <div className="flex items-center gap-2">
          {/* Mobile search trigger could go here later */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            className="h-9 w-9"
          >
            {isOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Optional: Mobile search row (visible only on small screens) */}
      {navtitle && navtitle !== "Dashboard" && (
        <div className="sm:hidden border-t px-4 py-2">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder={`Search ${navtitle}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <Button type="submit" size="sm">
              Search
            </Button>
          </form>
        </div>
      )}
    </header>
  );
}