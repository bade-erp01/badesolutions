"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";
import { toast } from "sonner";
import { API_URL } from "@/lib/api";
import { useRouter } from "next/navigation";

// Same backend (and so the same session cookie domain) as src/lib/api.js. The old
// fallback sent production browsers to http://localhost:3000 whenever
// NEXT_PUBLIC_API_URL was unset (EXPRESS_PRIVATE_URL is never exposed to the browser).
const SOCKET_URL = API_URL || undefined; // "" (same-origin dev proxy) → this site

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children, user }) {
  const socketRef = useRef(null);
  const manuallyClosedRef = useRef(false);
  const listenersRef = useRef(new Map());
  const router = useRouter();

  const [status, setStatus] = useState("disconnected");

  // The socket authenticates with the session cookie (withCredentials); this only decides
  // whether to connect, and reconnects when the user or business changes.
  const auth = useMemo(() => {
    if (!user?.business?.tenantId || !user?.user?._id) {
      return null;
    }

    return `${user.business.tenantId}:${user.user._id}`;
  }, [user?.business?.tenantId, user?.user?._id]);

  const notifyListeners = useCallback((eventType, data) => {
    const listeners = listenersRef.current.get(eventType);
    if (!listeners) return;

    listeners.forEach((listener) => {
      try {
        listener(data);
      } catch (error) {
        // fail quietly
      }
    });
  }, []);

  // ========== Toast + Sound (only when connected) ==========
  const showNotification = useCallback(
    ({
      icon = "info",
      title = "Notification",
      text = "",
      actionLabel = null,
      onAction = null,
      playSound = false,
      sticky = false, // stays until closed (things someone has to act on)
    }) => {
      // If socket is not connected, do nothing
      if (!socketRef.current?.connected) return;

      // Play sound only if allowed
      if (playSound) {
        try {
          let soundFile =
            "/sounds/universfield-system-notification-02-352442.mp3";

          if (icon === "success") {
            soundFile =
              "/sounds/universfield-system-notification-02-352442.mp3";
          }
          if (icon === "error") {
            soundFile =
              "/sounds/universfield-error-notification-012-132111.mp3";
          }
          if (icon === "warning") {
            soundFile =
              "/sounds/swoosh-sound-effect-for-fight-scenes-or-transitions-2-149890.mp3";
          }

          const audio = new Audio(soundFile);
          audio.volume = 0.6;
          audio.play().catch(() => {});
        } catch (err) {
          // ignore audio errors
        }
      }

      const options = {
        description: text,
        // only alerts that need action stay; everything else closes by itself
        duration: sticky ? Infinity : 8000,
      };

      if (actionLabel && typeof onAction === "function") {
        options.action = {
          label: actionLabel,
          onClick: onAction,
        };
      }

      if (icon === "success") {
        toast.success(title, options);
      } else if (icon === "error") {
        toast.error(title, options);
      } else if (icon === "warning") {
        toast.warning(title, options);
      } else {
        toast(title, options);
      }
    },
    [],
  );

  const disconnect = useCallback(() => {
    manuallyClosedRef.current = true;

    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setStatus("disconnected");
  }, []);

  const connect = useCallback(() => {
    if (!auth) return;
    if (socketRef.current?.connected) return;

    manuallyClosedRef.current = false;
    setStatus("connecting");

    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 30000,
      timeout: 10000,
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setStatus("connected");
    });

    socket.on("authenticated", (data) => {
      setStatus("connected");
      notifyListeners("authenticated", {
        type: "authenticated",
        ...data,
      });
    });

    socket.on("connect_error", (error) => {
      setStatus("error");

      // Fail quietly — no toast, no sound
      notifyListeners("error", {
        type: "error",
        message: error?.message || "Unable to connect to the realtime server.",
      });
    });

    socket.on("disconnect", (reason) => {
      if (manuallyClosedRef.current) {
        setStatus("disconnected");
        return;
      }

      setStatus("disconnected");
      notifyListeners("disconnect", {
        type: "disconnect",
        reason,
      });
    });

    socket.onAny((eventName, payload) => {
      if (
        eventName === "connect" ||
        eventName === "disconnect" ||
        eventName === "connect_error"
      ) {
        return;
      }

      // Extra safety: ignore events if not connected
      if (!socket.connected) return;

      const data =
        payload && typeof payload === "object"
          ? { type: eventName, ...payload }
          : { type: eventName, payload };

      notifyListeners(eventName, data);
      notifyListeners("message", data);
    });
  }, [auth, notifyListeners]);

  const sendMessage = useCallback((data) => {
    const socket = socketRef.current;

    if (!socket?.connected) {
      return false;
    }

    if (data && typeof data === "object" && data.type) {
      const { type, ...rest } = data;
      socket.emit(type, rest);
    } else {
      socket.emit("message", data);
    }

    return true;
  }, []);

  const subscribe = useCallback((eventType, listener) => {
    if (!eventType || typeof listener !== "function") {
      return () => {};
    }

    if (!listenersRef.current.has(eventType)) {
      listenersRef.current.set(eventType, new Set());
    }

    const listeners = listenersRef.current.get(eventType);
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) {
        listenersRef.current.delete(eventType);
      }
    };
  }, []);

  useEffect(() => {
    if (!auth) {
      disconnect();
      return;
    }

    connect();

    return () => {
      manuallyClosedRef.current = true;
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [auth, connect, disconnect]);

  
  // ========== Global Event Listeners ==========
  useEffect(() => {
    // lib/notifications.js notify(): { title, message, url, level }
    // lib/notifications.js notify(): { title, message, url, level, priority }
    // priority "action": stays until closed, with sound; "security" (sign-ins): closes by itself
    const unsubNotification = subscribe("notification", (data) => {
      const url = typeof data?.url === "string" && data.url.startsWith("/") ? data.url : "";
      const action = data?.priority === "action";
      showNotification({
        icon: ["success", "warning", "error"].includes(data?.level) ? data.level : "info",
        title: data?.title || "Notification",
        text: data?.message && data.message !== data.title ? data.message : "",
        actionLabel: url ? "View" : null,
        onAction: url ? () => router.push(url) : null,
        playSound: action,
        sticky: action,
      });
    });

    const unsubInvoice = subscribe("invoice:new", (data) => {
      showNotification({
        icon: "info",
        title: "Invoice Notification",
        text: data?.message || " ",
        actionLabel: "View",
        playSound: false,
        onAction: () => {
          const invoiceId = data?._id || data?.id;
          if (invoiceId) {
            router.push(
              `/Notification/V4/Sales/Sales/${invoiceId}`
            );
          }
        },
      });
    });

    const unsubPayment = subscribe("payment:posted", (data) => {
      showNotification({
        icon: "success",
        title: "Payment Notification",
        text: data?.message || "A new payment has been posted.",
        playSound: false,
      });
    });

    const unsubProduct = subscribe("product:notification", (data) => {
      showNotification({
        icon: "success",
        title: "Product Notification",
        text:
          data?.message || "A new product notification has been received.",
        playSound: false,
      });
    });

    const unsubCustomer = subscribe("customer:new", (data) => {
      showNotification({
        icon: "success",
        title: "Customer Notification",
        text:
          data?.message || "A new customer notification has been received.",
      });
    });

    const unsubPurchase = subscribe("purchase:new", (data) => {
      showNotification({
        icon: "success",
        title: "Purchase Notification",
        text:
          data?.message || "A new purchase notification has been received.",
        playSound: false,
      });
    });

    const unsubError = subscribe("error", (data) => {
      if (!data?.message) return;

      showNotification({
        icon: "error",
        title: "Error",
        text: data.message,
        playSound: true,
        sticky: true,
      });
    });

    // Daily Business Report
    const unsubDailyReport = subscribe("daily-report", (data) => {
      const text = [
        data?.yesterdaySale,
        data?.yesterdayRevenue,
        data?.topDebtor,
        data?.newCustomers,
        data?.debtorsCount,
        data?.TotalDebt,
      ].filter(Boolean).join("\n");

      showNotification({
        icon: "info",
        title: data?.message || "Daily Business Report",
        text: text || "Yesterday's business report is ready.",
      });
    });

    return () => {
      unsubNotification();
      unsubInvoice();
      unsubPayment();
      unsubProduct();
      unsubCustomer();
      unsubPurchase();
      unsubError();
      unsubDailyReport();
    };
  }, [subscribe, showNotification, router]);

  const value = useMemo(
    () => ({
      socket: socketRef.current,
      status,
      connected: status === "connected",
      sendMessage,
      connect,
      disconnect,
      subscribe,
    }),
    [status, sendMessage, connect, disconnect, subscribe],
  );

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

/** The realtime context, or null outside WebSocketProvider. */
export function useOptionalWebSocket() {
  return useContext(WebSocketContext);
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);

  if (!context) {
    throw new Error("useWebSocket must be used inside WebSocketProvider");
  }

  return context;
}

export default WebSocketProvider;