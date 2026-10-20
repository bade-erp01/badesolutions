"use client";

// Pages of an app-store app the current business hasn't installed (business.lockedApps from
// GET /api/v1/Session, backend lib/appGuard.js) show "not installed" instead of the page, for
// everyone, admins too: a user who switched business may still carry the app or its links.
// The backend refuses those apps' requests as well; this only keeps the page from opening.
// Paths: /<slug>/V4/<Module>/<app url>/...

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { PackageX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppInstalledGuard({ lockedApps = [], businessName = "", children }) {
  const pathname = usePathname() || "";
  const { auth } = useParams() || {};
  const app = (pathname.split("/")[4] || "").toLowerCase();
  const locked = app && lockedApps.some((u) => String(u).toLowerCase() === app);
  if (!locked) return children;

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="max-w-md space-y-4 rounded-xl border bg-card p-6 text-center shadow-sm">
        <PackageX className="mx-auto h-10 w-10 text-muted-foreground" />
        <h1 className="text-lg font-semibold">This app isn&apos;t installed</h1>
        <p className="text-sm text-muted-foreground">
          {businessName || "This business"} doesn&apos;t have this app. If you just switched business, the app belongs to the
          one you left. An administrator can add it from the app store.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button asChild variant="outline">
            <Link href={`/${auth}/V4`}>Back to dashboard</Link>
          </Button>
          <Button asChild>
            <Link href={`/${auth}/Apps`}>App store</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
