"use client";

// In-app notifications: bell with unread count and the user's list.
// Backend: GET /api/notifications, PATCH /api/notifications/seen { id? }, DELETE
// /api/notifications (lib/notifications.js). New ones arrive live as the "inbox:new"
// socket event (WebSocketProvider), so the list updates without a reload.

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import moment from "moment";
import { AlertTriangle, Bell, CheckCheck, CheckCircle2, Info, Trash2, XCircle } from "lucide-react";

import api from "@/lib/api";
import { useOptionalWebSocket } from "@/app/Components/WebSocketProvider";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const noSubscribe = () => () => {};

const LEVEL_ICON = {
  info: <Info className="h-4 w-4 text-sky-600" />,
  success: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
  warning: <AlertTriangle className="h-4 w-4 text-amber-600" />,
  error: <XCircle className="h-4 w-4 text-red-600" />,
};

// navigate={false} (Sales Portal): a click only marks the notification as read. Its link points
// into the ERP, which a sales rep must not be sent to.
export default function NotificationBell({ navigate = true }) {
  const router = useRouter();
  // pages outside the realtime provider still get the list, just not live updates
  const subscribe = useOptionalWebSocket()?.subscribe ?? noSubscribe;
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unseen, setUnseen] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const apply = useCallback((data) => {
    setItems(data?.items || []);
    setUnseen(data?.unseen || 0);
  }, []);

  const load = useCallback(async () => {
    const r = await api.get("/api/notifications");
    setLoading(false);
    if (r.ok) {
      apply(r.data);
      setError("");
    } else setError(r.error || "Could not load notifications");
  }, [apply]);

  useEffect(() => {
    load();
  }, [load]);

  // a new one arrives live
  useEffect(
    () =>
      subscribe("inbox:new", (n) => {
        if (!n?._id) return;
        setItems((list) => [n, ...list.filter((x) => x._id !== n._id)].slice(0, 100));
        setUnseen((c) => c + 1);
      }),
    [subscribe],
  );

  // after the socket reconnects, catch up on anything missed while offline
  useEffect(() => subscribe("authenticated", () => load()), [subscribe, load]);

  const markSeen = async (id) => {
    const r = await api.patch("/api/notifications/seen", id ? { id } : {});
    if (r.ok) apply(r.data);
  };

  const openItem = (n) => {
    if (!n.seen) {
      setItems((list) => list.map((x) => (x._id === n._id ? { ...x, seen: true } : x)));
      setUnseen((c) => Math.max(0, c - 1));
      markSeen(n._id);
    }
    if (navigate && n.url) {
      setOpen(false);
      router.push(n.url);
    }
  };

  const clearAll = async () => {
    const r = await api.del("/api/notifications");
    if (r.ok) apply(r.data);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative shrink-0" aria-label={`Notifications${unseen ? `, ${unseen} unread` : ""}`}>
          <Bell className="h-5 w-5" />
          {unseen > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-none text-white">
              {unseen > 99 ? "99+" : unseen}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[min(24rem,calc(100vw-1rem))] p-0">
        <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-xs text-muted-foreground">{unseen ? `${unseen} unread` : "You're all caught up"}</p>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" disabled={!unseen} onClick={() => markSeen()}>
              <CheckCheck className="mr-1 h-4 w-4" /> Mark all read
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!items.length} onClick={clearAll} aria-label="Clear all notifications">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="max-h-[min(28rem,70dvh)] overflow-y-auto">
          {loading ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">Loading…</p>
          ) : error ? (
            <div className="px-4 py-8 text-center text-sm">
              <p className="text-red-600">{error}</p>
              <Button variant="link" size="sm" onClick={load}>
                Try again
              </Button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center text-sm text-muted-foreground">
              <Bell className="h-8 w-8 opacity-30" />
              No notifications yet
            </div>
          ) : (
            <ul className="divide-y">
              {items.map((n) => (
                <li key={n._id}>
                  <button
                    type="button"
                    onClick={() => openItem(n)}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-muted/60 ${n.seen ? "" : "bg-sky-50/60 dark:bg-sky-950/20"}`}
                  >
                    <span className="mt-0.5 shrink-0">{LEVEL_ICON[n.level] || LEVEL_ICON.info}</span>
                    <span className="min-w-0 flex-1">
                      <span className={`block break-words text-sm ${n.seen ? "text-muted-foreground" : "font-medium text-foreground"}`}>{n.title}</span>
                      {n.message && <span className="mt-0.5 block break-words text-xs text-muted-foreground">{n.message}</span>}
                      {n.createdAt && <span className="mt-1 block text-[11px] text-muted-foreground">{moment(n.createdAt).fromNow()}</span>}
                    </span>
                    {!n.seen && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sky-600" aria-label="Unread" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
