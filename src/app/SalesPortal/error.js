"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CloudOff } from "lucide-react";

export default function SalesPortalError({ reset }) {
  const router = useRouter();

  return (
    <div className="sales-app flex min-h-dvh items-center justify-center bg-sp-bg px-4">
      <div className="w-full max-w-sm space-y-4 rounded-2xl border border-sp-line bg-sp-surface p-6 text-center">
        <CloudOff className="mx-auto h-8 w-8 text-sp-muted" />
        <div className="space-y-1">
          <h1 className="text-lg font-bold tracking-tight">Something went wrong</h1>
          <p className="text-sm text-sp-muted">We couldn&apos;t load this screen. Check your connection and try again.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            router.refresh();
            reset?.();
          }}
          className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-sp-ink text-[15px] font-semibold text-sp-on-ink"
        >
          Try again
        </button>
        <Link href="/SalesPortal/Dashboard" className="block text-sm font-medium text-sp-info">
          Go to home
        </Link>
      </div>
    </div>
  );
}
