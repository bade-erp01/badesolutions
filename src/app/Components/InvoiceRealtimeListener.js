"use client";
import { useWebSocket } from "@/app/Components/WebSocketProvider";
import { useEffect } from "react";

export default function InvoiceRealtimeListener({
  onInvoiceCreated,
}) {
  const { subscribe } = useWebSocket();

  useEffect(() => {
    const unsubscribe = subscribe(
      "invoice.created",
      (event) => {
        const invoiceId = event?.data?.invoiceId;

        if (!invoiceId) {
          return;
        }

        onInvoiceCreated?.({
          invoiceId,
        });
      }
    );

    return unsubscribe;
  }, [subscribe, onInvoiceCreated]);

  return null;
}