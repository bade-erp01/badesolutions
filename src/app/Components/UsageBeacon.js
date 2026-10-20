"use client";

// Anonymous page counts (backend lib/usageStats.js): which ERP screens are opened, on phones
// (below 768px) or wider screens, so the phone design is built for the screens people use.
// Sends the address only; the backend keeps just the page pattern (no business, no ids).

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import api from "@/lib/api";

export default function UsageBeacon() {
  const pathname = usePathname();
  const last = useRef("");

  useEffect(() => {
    if (!pathname || pathname === last.current) return;
    last.current = pathname;
    const device = typeof window !== "undefined" && window.innerWidth < 768 ? "phone" : "desktop";
    api.post("/api/usage/page", { path: pathname, device }).catch(() => {});
  }, [pathname]);

  return null;
}
