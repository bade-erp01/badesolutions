"use client";

import React, { useEffect, useRef, useState } from "react";
import { Bot, Loader2, Send, Sparkles, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/components/UserProvider";

const SUGGESTIONS = [
  "Which invoices are still unpaid this month?",
  "Total sales by customer for the last 30 days",
  "How many invoices were issued this week and what are they worth?",
  "Show the 5 largest invoices this year",
];

const TOOL_LABELS = {
  search_invoices: "Searching invoices…",
  get_invoice: "Opening the invoice…",
  summarize_invoices: "Adding up the numbers…",
};

export default function AssistantPage() {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [activity, setActivity] = useState("");
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, activity]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const appendToLastAssistant = (text) =>
    setMessages((prev) => {
      const next = [...prev];
      const last = next[next.length - 1];
      if (last?.role === "assistant") next[next.length - 1] = { ...last, content: last.content + text };
      else next.push({ role: "assistant", content: text });
      return next;
    });

  const send = async (question) => {
    const content = (question ?? input).trim();
    if (!content || busy) return;
    setError("");
    setInput("");
    const history = [...messages, { role: "user", content }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setBusy(true);
    setActivity("Thinking…");

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch("/api/agent/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        let message = `Request failed (${res.status}).`;
        try {
          message = (await res.json()).error || message;
        } catch {}
        throw new Error(message);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let gotText = false;
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const evt = JSON.parse(line);
          if (evt.type === "text") {
            gotText = true;
            setActivity("");
            appendToLastAssistant(evt.text);
          } else if (evt.type === "tool") {
            setActivity(TOOL_LABELS[evt.name] || "Working…");
          } else if (evt.type === "error") {
            setError(evt.message);
          }
        }
      }
      if (!gotText) {
        setMessages((prev) => (prev[prev.length - 1]?.content === "" ? prev.slice(0, -1) : prev));
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message || "Something went wrong.");
        setMessages((prev) => (prev[prev.length - 1]?.content === "" ? prev.slice(0, -1) : prev));
      }
    } finally {
      setBusy(false);
      setActivity("");
      abortRef.current = null;
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Sparkles className="h-5 w-5 shrink-0" />
            Invoice Assistant
          </CardTitle>
          <CardDescription className="text-sm">
            Ask about {user?.business?.companyName || "your"} sales invoices in plain language. The assistant can read invoices, not change them.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="max-h-[55dvh] min-h-[40dvh] space-y-4 overflow-y-auto rounded-lg border bg-muted/30 p-3 sm:p-4">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Try one of these, or type your own question:</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <Button key={s} type="button" variant="outline" size="sm" className="h-auto whitespace-normal text-left" onClick={() => send(s)}>
                      {s}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 sm:gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <div className="mt-1 hidden h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground sm:flex">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`max-w-[88%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm leading-relaxed sm:max-w-[80%] ${
                    m.role === "user" ? "bg-primary text-primary-foreground" : "bg-background border"
                  }`}
                >
                  {m.content || (busy && i === messages.length - 1 ? <span className="text-muted-foreground">{activity || "…"}</span> : "")}
                </div>
                {m.role === "user" && (
                  <div className="mt-1 hidden h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted sm:flex">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {busy && activity && messages[messages.length - 1]?.content && (
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> {activity}
              </p>
            )}
            <div ref={bottomRef} />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex flex-col gap-2 sm:flex-row sm:items-end"
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="e.g. What does Acme Ltd still owe us?"
              rows={2}
              disabled={busy}
              className="min-h-[44px] flex-1 resize-none text-base sm:text-sm"
            />
            <Button type="submit" disabled={busy || !input.trim()} className="h-11 w-full gap-2 sm:w-auto">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
