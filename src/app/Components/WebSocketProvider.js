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
import { Encrypt } from "../../../Functions/Functions";
import { useRouter } from "next/navigation";

const SOCKET_URL = "https://api.badesolutions.com.ng";

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children, user }) {
  const socketRef = useRef(null);
  const manuallyClosedRef = useRef(false);
  const listenersRef = useRef(new Map());
  const reconnectAlertShownRef = useRef(false);
  const router = useRouter();

  const [status, setStatus] = useState("disconnected");

  const auth = useMemo(() => {
    if (!user?.business?.tenantId || !user?.user?._id || !user?.SessionId) {
      return null;
    }

    return {
      authorization: `Bearer ${Encrypt(user.business.tenantId)}`,
      access: Encrypt(user.user._id),
      sessionkey: `Bearer ${Encrypt(user.SessionId)}`,
    };
  }, [user]);

  const notifyListeners = useCallback((eventType, data) => {
    const listeners = listenersRef.current.get(eventType);
    if (!listeners) return;

    listeners.forEach((listener) => {
      try {
        listener(data);
      } catch (error) {
        // console.error(`WebSocket listener error for ${eventType}:`, error);
      }
    });
  }, []);

  // ========== Professional Toast + Sound ==========
  const showNotification = useCallback(
    ({
      icon = "info",
      title = "Notification",
      text = "",
      actionLabel = null,
      onAction = null,
      playSound = true, // ← new option
    }) => {
      // Play sound only if allowed
      if (playSound) {
        try {
          let soundFile =
            "/sounds/universfield-system-notification-02-352442.mp3";

          if (icon === "success")
            soundFile =
              "/sounds/universfield-system-notification-02-352442.mp3";
          if (icon === "error")
            soundFile =
              "/sounds/universfield-error-notification-012-132111.mp3";
          if (icon === "warning")
            soundFile =
              "/sounds/swoosh-sound-effect-for-fight-scenes-or-transitions-2-149890.mp3";

          const audio = new Audio(soundFile);
          audio.volume = 0.6;
          audio.play().catch(() => {
            // Browser may block autoplay until user interacts with the page
          });
        } catch (err) {
          // ignore audio errors
        }
      }

      const options = {
        description: text,
        duration: Infinity, // stays until dismissed
      };

      // Add "View" button if provided
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
      auth: {
        authorization: auth.authorization,
        access: auth.access,
        sessionkey: auth.sessionkey,
      },
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
      reconnectAlertShownRef.current = false;
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

      notifyListeners("error", {
        type: "error",
        message: error?.message || "Unable to connect to the realtime server.",
      });

      if (!reconnectAlertShownRef.current) {
        reconnectAlertShownRef.current = true;
        showNotification({
          icon: "warning",
          title: "Connection Lost",
          text: "Realtime updates are temporarily unavailable. Reconnecting...",
        });
      }
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

      const data =
        payload && typeof payload === "object"
          ? { type: eventName, ...payload }
          : { type: eventName, payload };

      notifyListeners(eventName, data);
      notifyListeners("message", data);
    });
  }, [auth, notifyListeners, showNotification]);

  const sendMessage = useCallback((data) => {
    const socket = socketRef.current;

    if (!socket?.connected) {
      console.warn("Socket is not connected");
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
    const unsubNotification = subscribe("notification", (data) => {
      showNotification({
        icon: "info",
        title: "Notification",
        text: data?.message || "You have a new notification.",
      });
    });

    const unsubInvoice = subscribe("invoice:new", (data) => {
      showNotification({
        icon: "info",
        title: "Invoice Notification",
        text: data?.message || " ",
        actionLabel: "View",
        playSound: false, // ← no sound
        onAction: () => {
          const invoiceId = data?._id || data?.id;
          if (invoiceId) {
            router.push(
              `/Notification/V4/Sales/Sales/${Encrypt(invoiceId)}`
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
        playSound: false, // ← no sound
      });
    });

    const unsubError = subscribe("error", (data) => {
      if (!data?.message) return;

      showNotification({
        icon: "error",
        title: "Realtime Error",
        text: data.message,
      });
    });

    return () => {
      unsubNotification();
      unsubInvoice();
      unsubPayment();
      unsubError();
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

export function useWebSocket() {
  const context = useContext(WebSocketContext);

  if (!context) {
    throw new Error("useWebSocket must be used inside WebSocketProvider");
  }

  return context;
}

export default WebSocketProvider;