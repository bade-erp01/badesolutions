"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export default function useWebSocket({
  url,
  onMessage,
  onOpen,
  onAuthenticated,
  onClose,
  onError,
  reconnect = true,
  reconnectDelay = 3000,
} = {}) {
  const socketRef = useRef(null);
  const manuallyClosedRef = useRef(false);
  const [status, setStatus] = useState("disconnected");

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
    if (!url) {
      console.error("Socket.IO URL is missing");
      return;
    }

    if (socketRef.current?.connected) return;

    manuallyClosedRef.current = false;
    setStatus("connecting");

    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    // Authenticated by the backend session cookie.
    const socket = io(url, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: reconnect,
      reconnectionAttempts: 10,
      reconnectionDelay: reconnectDelay,
      reconnectionDelayMax: 30000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setStatus("connected");
      if (onOpen) onOpen();
    });

    socket.on("authenticated", (data) => {
      setStatus("connected");
      if (onAuthenticated) {
        onAuthenticated({ type: "authenticated", ...data });
      }
    });

    socket.on("connect_error", (err) => {
      setStatus("error");
      if (onError) onError(err);
    });

    socket.on("disconnect", (reason) => {
      setStatus("disconnected");
      if (onClose) onClose(reason);
    });

    // All other server events
    socket.onAny((eventName, payload) => {
      if (
        eventName === "connect" ||
        eventName === "disconnect" ||
        eventName === "connect_error" ||
        eventName === "authenticated"
      ) {
        return;
      }

      const data =
        payload && typeof payload === "object"
          ? { type: eventName, ...payload }
          : { type: eventName, payload };

      if (onMessage) onMessage(data, payload);
    });
  }, [
    url,
    onMessage,
    onOpen,
    onAuthenticated,
    onClose,
    onError,
    reconnect,
    reconnectDelay,
  ]);

  const sendMessage = useCallback((data) => {
    if (!socketRef.current?.connected) {
      console.warn("Socket.IO is not connected");
      return false;
    }

    if (data && typeof data === "object" && data.type) {
      const { type, ...rest } = data;
      socketRef.current.emit(type, rest);
    } else {
      socketRef.current.emit("message", data);
    }

    return true;
  }, []);

  useEffect(() => {
    connect();

    return () => {
      manuallyClosedRef.current = true;
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [connect]);

  return {
    socket: socketRef.current,
    status,
    sendMessage,
    connect,
    disconnect,
  };
}