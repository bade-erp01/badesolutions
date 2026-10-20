import Link from "next/link";
import Image from "next/image";
import { ClipboardList, FileBarChart2, Map, Users } from "lucide-react";
import { PoweredByBade } from "./_ui/ui";

export const metadata = {
  title: "Sales Portal",
  description: "The BADE app for field sales reps: today's route, customers, orders and stock checks from your phone.",
};

const FEATURES = [
  [Map, "Today's route", "See who to visit today, call them, and get directions in one tap."],
  [Users, "Your customers", "Balances, statements, payments and new leads where you stand."],
  [ClipboardList, "Orders on the spot", "Build a requisition with the customer and send it for checkout."],
  [FileBarChart2, "Stock checks", "Count shelf and back-store stock with photos, in minutes."],
];

export default function SalesPortalLanding() {
  return (
    <main className="sales-app mx-auto flex min-h-dvh max-w-sm flex-col bg-sp-bg px-5 pb-8 text-sp-ink" style={{ paddingTop: "calc(24px + env(safe-area-inset-top, 0px))" }}>
      <div className="flex items-center justify-between gap-3">
        <Image src="/icons/icon-192.png" priority alt="BADE" width={44} height={44} className="h-11 w-11 rounded-2xl" />
        <Link href="/SalesPortal/Login" className="rounded-xl px-3 py-2 text-sm font-semibold hover:bg-sp-surface">
          Sign in
        </Link>
      </div>

      <div className="mt-10 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-sp-accent">BADE Sales</p>
        <h1 className="text-3xl font-bold leading-tight tracking-tight">Your sales day, in your pocket.</h1>
        <p className="text-[15px] text-sp-muted">Built for reps in the field. Works on any phone, made by BADE ERP.</p>
      </div>

      <ul className="mt-8 divide-y divide-sp-line overflow-hidden rounded-2xl border border-sp-line bg-sp-surface">
        {FEATURES.map(([Icon, title, text]) => (
          <li key={title} className="flex gap-3 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sp-bg">
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="font-semibold">{title}</p>
              <p className="text-sm text-sp-muted">{text}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-auto space-y-3 pt-8">
        <Link href="/SalesPortal/Login" className="flex h-12 w-full items-center justify-center rounded-xl bg-sp-ink text-[15px] font-semibold text-sp-on-ink hover:opacity-90">
          Sign in to the Sales Portal
        </Link>
        <Link href="/Pricing" className="flex h-12 w-full items-center justify-center rounded-xl border border-sp-line bg-sp-surface text-[15px] font-semibold hover:bg-sp-bg">
          Get BADE for your business
        </Link>
        <PoweredByBade className="pt-4" />
      </div>
    </main>
  );
}
