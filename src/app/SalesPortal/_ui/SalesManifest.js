"use client";

// The Sales Portal installs as its own app ("BADE Sales", opens on /SalesPortal). Next.js puts
// the ERP's manifest (src/app/manifest.js) on every page and a section can't override it, so
// the link is pointed at public/salesportal.webmanifest here, on every Sales Portal page.

import { useEffect } from "react";

const SALES_MANIFEST = "/salesportal.webmanifest";

export default function SalesManifest() {
  useEffect(() => {
    let link = document.querySelector('link[rel="manifest"]');
    const previous = link?.getAttribute("href") || null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "manifest";
      document.head.appendChild(link);
    }
    link.setAttribute("href", SALES_MANIFEST);
    return () => {
      // leaving the Sales Portal (client-side navigation into the ERP): give the ERP its own back
      if (previous) link.setAttribute("href", previous);
    };
  }, []);
  return null;
}
