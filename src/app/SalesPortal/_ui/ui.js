"use client";

// Building blocks for the Sales Portal, in the style of the BADE delivery app:
// light grey page, white rounded cards, dark ink buttons and big touch targets.

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Loader2, X } from "lucide-react";
import { Toaster } from "sonner";
import { day, when } from "./format";
import { useSalesTheme } from "./theme";

// Times depend on the phone's time zone (the server runs in UTC), so they are written
// in the browser; the server sends just the date.
export function When({ iso, dateOnly = false }) {
  const [text, setText] = useState("");
  useEffect(() => setText(dateOnly ? day(iso) : when(iso)), [iso, dateOnly]);
  return <span suppressHydrationWarning>{text || day(iso)}</span>;
}

export function Toasts() {
  const [, , mode] = useSalesTheme(); // light or dark, as the rep chose in the menu
  return <Toaster position="top-center" theme={mode} richColors closeButton />;
}

const BTN_BASE =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition select-none disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sp-ink";
const BTN_SIZES = { md: "h-12 px-5 text-[15px]", sm: "h-9 px-3 text-sm", icon: "h-12 w-12 shrink-0" };
const BTN_VARIANTS = {
  primary: "bg-sp-ink text-sp-on-ink hover:opacity-90",
  success: "bg-sp-accent text-white hover:brightness-95",
  outline: "border border-sp-line bg-sp-surface text-sp-ink hover:bg-sp-bg",
  danger: "border border-sp-bad/30 bg-sp-bad-soft text-sp-bad hover:brightness-95",
  ghost: "text-sp-ink hover:bg-sp-bg",
};

export function buttonClass(variant = "primary", size = "md", className = "") {
  return `${BTN_BASE} ${BTN_SIZES[size] || BTN_SIZES.md} ${BTN_VARIANTS[variant] || BTN_VARIANTS.primary} ${className}`;
}

export function Button({ variant, size, className = "", type = "button", busy = false, children, disabled, ...props }) {
  return (
    <button type={type} className={buttonClass(variant, size, className)} disabled={disabled || busy} {...props}>
      {busy && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export function LinkButton({ variant, size, className = "", ...props }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}

export function Card({ className = "", ...props }) {
  return <div className={`rounded-2xl border border-sp-line bg-sp-surface ${className}`} {...props} />;
}

export function CardTitle({ children, action, className = "" }) {
  return (
    <div className={`flex items-center justify-between gap-3 border-b border-sp-line px-4 py-3 ${className}`}>
      <p className="text-sm font-semibold">{children}</p>
      {action}
    </div>
  );
}

export function Field({ label, hint, error, children, className = "" }) {
  return (
    <label className={`block space-y-1.5 ${className}`}>
      {label && <span className="text-sm font-medium text-sp-ink">{label}</span>}
      {children}
      {error ? (
        <span className="block text-sm text-sp-bad">{error}</span>
      ) : hint ? (
        <span className="block text-xs text-sp-muted">{hint}</span>
      ) : null}
    </label>
  );
}

const CONTROL =
  "w-full rounded-xl border border-sp-line bg-sp-surface px-4 text-base text-sp-ink outline-none placeholder:text-sp-muted focus:border-sp-ink focus:ring-2 focus:ring-sp-ink/10 disabled:bg-sp-bg disabled:text-sp-muted";

export function Input({ className = "", ...props }) {
  return <input className={`h-12 ${CONTROL} ${className}`} {...props} />;
}

export function Select({ className = "", children, ...props }) {
  return (
    <select className={`h-12 ${CONTROL} ${className}`} {...props}>
      {children}
    </select>
  );
}

export function Textarea({ className = "", ...props }) {
  return <textarea className={`min-h-24 py-3 ${CONTROL} ${className}`} {...props} />;
}

export function Alert({ kind = "bad", children, className = "" }) {
  const styles = {
    bad: "bg-sp-bad-soft text-sp-bad",
    ok: "bg-sp-accent-soft text-sp-accent",
    warn: "bg-sp-warn-soft text-sp-warn",
    info: "bg-sp-info-soft text-sp-info",
  };
  return (
    <div role={kind === "bad" ? "alert" : "status"} className={`rounded-xl px-4 py-3 text-sm ${styles[kind] || styles.bad} ${className}`}>
      {children}
    </div>
  );
}

const TONES = {
  ok: "bg-sp-accent-soft text-sp-accent",
  warn: "bg-sp-warn-soft text-sp-warn",
  bad: "bg-sp-bad-soft text-sp-bad",
  info: "bg-sp-info-soft text-sp-info",
  ink: "bg-sp-ink text-sp-on-ink",
  muted: "bg-sp-bg text-sp-muted ring-1 ring-sp-line",
};

export function Badge({ tone = "muted", children, className = "" }) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${TONES[tone] || TONES.muted} ${className}`}>
      {children}
    </span>
  );
}

// Bills, requisitions and stock cards: the colour follows the status word.
export function toneForStatus(status = "") {
  const s = String(status).toLowerCase();
  if (["cancelled", "canceled", "declined", "rejected", "failed", "expired"].includes(s)) return "bad";
  if (["draft", "pending", "open", "awaiting"].includes(s)) return "warn";
  if (["submitted", "closed", "approved", "paid", "delivered", "invoice", "invoiced", "completed", "done"].includes(s)) return "ok";
  return "info";
}

export function StatusBadge({ status }) {
  if (!status) return null;
  return <Badge tone={toneForStatus(status)}>{status}</Badge>;
}

export function Loading({ label = "Loading…" }) {
  return (
    <p className="flex items-center justify-center gap-2 py-10 text-center text-sm text-sp-muted">
      <Loader2 className="h-4 w-4 animate-spin" /> {label}
    </p>
  );
}

export function Empty({ icon: Icon, title, text, children }) {
  return (
    <Card className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      {Icon && <Icon className="h-8 w-8 text-sp-muted" />}
      {title && <p className="font-medium">{title}</p>}
      {text && <p className="text-sm text-sp-muted">{text}</p>}
      {children}
    </Card>
  );
}

// One tappable row in a list card: leading slot, title, meta line, trailing slot, chevron.
export function Row({ href, onClick, leading, title, meta, trailing, chevron = true }) {
  const inner = (
    <>
      {leading}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{title}</p>
        {meta && <p className="truncate text-xs text-sp-muted">{meta}</p>}
      </div>
      {trailing}
      {chevron && (href || onClick) && <ChevronRight className="h-4 w-4 shrink-0 text-sp-muted" />}
    </>
  );
  const cls = "flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-sp-bg active:bg-sp-bg";
  if (href) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls}>
        {inner}
      </button>
    );
  }
  return <div className={cls}>{inner}</div>;
}

export function Avatar({ src, name = "", size = 44, className = "" }) {
  const style = { width: size, height: size };
  if (src && (/^(https?:)?\/\//i.test(src) || /^\/[\w-]/.test(src))) {
    return (
       
      <img src={src} alt="" style={style} className={`shrink-0 rounded-xl border border-sp-line bg-white object-cover ${className}`} />
    );
  }
  const letters = String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] || "")
    .join("")
    .toUpperCase();
  return (
    <span style={style} className={`flex shrink-0 items-center justify-center rounded-xl bg-sp-bg text-sm font-semibold text-sp-muted ring-1 ring-sp-line ${className}`}>
      {letters || "?"}
    </span>
  );
}

// Two to four options in a pill bar, like the delivery app's "To deliver / Done" switch.
export function Segmented({ options, value, onChange, label = "Filter" }) {
  return (
    <div className="flex rounded-xl bg-sp-surface p-1 shadow-sm ring-1 ring-sp-line" role="tablist" aria-label={label}>
      {options.map(([key, text]) => (
        <button
          key={key}
          type="button"
          role="tab"
          aria-selected={value === key}
          onClick={() => onChange(key)}
          className={`flex-1 truncate rounded-lg px-2 py-2 text-sm font-semibold transition ${value === key ? "bg-sp-ink text-sp-on-ink" : "text-sp-muted"}`}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

// Horizontally scrolling filter chips (for status lists of unknown length).
export function Chips({ options, value, onChange, label = "Filter" }) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="group" aria-label={label}>
      {options.map(([key, text]) => (
        <button
          key={key}
          type="button"
          aria-pressed={value === key}
          onClick={() => onChange(key)}
          className={`h-9 shrink-0 whitespace-nowrap rounded-full px-4 text-sm font-semibold capitalize ${value === key ? "bg-sp-ink text-sp-on-ink" : "bg-sp-surface text-sp-muted ring-1 ring-sp-line"}`}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

export function Pager({ page, pages, onChange }) {
  if (!pages || pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-3 text-sm">
      <button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)} className="h-10 rounded-xl border border-sp-line bg-sp-surface px-4 font-medium disabled:opacity-40">
        Previous
      </button>
      <span className="tabular-nums text-sp-muted">
        {page} of {pages}
      </span>
      <button type="button" disabled={page >= pages} onClick={() => onChange(page + 1)} className="h-10 rounded-xl border border-sp-line bg-sp-surface px-4 font-medium disabled:opacity-40">
        Next
      </button>
    </div>
  );
}

// The fixed action bar at the bottom of a detail screen (thumb reach on a phone).
export function BottomBar({ children }) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 border-t border-sp-line bg-sp-surface/95 backdrop-blur"
      style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="mx-auto flex max-w-xl gap-2 px-4 pt-3">{children}</div>
    </div>
  );
}

// A panel that slides up from the bottom of the screen; replaces pop-up dialogs.
export function Sheet({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="sales-app fixed inset-0 z-[60] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close" onClick={onClose} />
      <div
        className="relative flex max-h-[90dvh] w-full max-w-xl flex-col rounded-t-3xl bg-sp-surface text-sp-ink shadow-2xl sm:rounded-3xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-sp-line sm:hidden" />
        <div className="flex items-center justify-between gap-3 px-5 pb-2 pt-3">
          <h2 className="text-lg font-bold tracking-tight">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-sp-muted hover:bg-sp-bg hover:text-sp-ink" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto px-5 pb-4">{children}</div>
        {footer && <div className="flex gap-2 border-t border-sp-line px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}

// "Are you sure?" as a bottom sheet.
export function ConfirmSheet({ open, onClose, title, text, confirmLabel = "Yes, continue", variant = "primary", busy, onConfirm }) {
  return (
    <Sheet
      open={open}
      onClose={busy ? undefined : onClose}
      title={title}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant={variant} className="flex-1" onClick={onConfirm} busy={busy}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {typeof text === "string" ? <p className="text-[15px] text-sp-muted">{text}</p> : text}
    </Sheet>
  );
}

// Collapsible card section (details, ledger, map …).
export function Section({ title, icon: Icon, open, onToggle, children, meta }) {
  return (
    <Card>
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
        {Icon && <Icon className="h-5 w-5 shrink-0 text-sp-muted" />}
        <span className="flex-1 font-semibold">{title}</span>
        {meta && <span className="text-xs text-sp-muted">{meta}</span>}
        <ChevronRight className={`h-4 w-4 shrink-0 text-sp-muted transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      {open && <div className="border-t border-sp-line">{children}</div>}
    </Card>
  );
}

export function KeyValue({ label, value, strong }) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3 text-[15px]">
      <span className="shrink-0 text-sp-muted">{label}</span>
      <span className={`min-w-0 break-words text-right ${strong ? "font-semibold" : ""}`}>{value ?? "—"}</span>
    </div>
  );
}

export function PoweredByBade({ className = "" }) {
  return (
    <p className={`text-center text-xs text-sp-muted ${className}`}>
      Powered by{" "}
      <a href="https://badesolutions.com.ng/?ref=sales-app" target="_blank" rel="noopener" className="font-semibold text-sp-ink underline-offset-2 hover:underline">
        BADE ERP
      </a>
    </p>
  );
}
