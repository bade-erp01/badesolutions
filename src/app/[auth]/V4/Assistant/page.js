"use client";

import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Send,
  Sparkles,
  User,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/components/UserProvider";
import { EXPRESS_PRIVATE_URL, Encrypt } from "../../../../../Functions/Functions";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SUGGESTIONS = [
  // Financial statements
  "What was our profit last month?",
  "Compare our profit for the last three months",
  "What were our biggest expenses last month?",
  "Show me our balance sheet",
  "How much do we have in the bank right now?",
  "What is our gross margin this month so far?",
  // Day-to-day
  "Which customers owe us the most money right now?",
  "How much did we collect in payments this month, cash vs transfer?",
  "Show the 5 largest invoices this year",
  "What is low on stock in the head office warehouse?",
  "Top 5 products by revenue last month",
  "Who on the team can post payments?",
];

const TOOL_LABELS = {
  search_invoices: "Searched invoices",
  get_invoice: "Opened an invoice",
  summarize_invoices: "Totalled invoices",
  top_products: "Ranked products",
  search_customers: "Looked up customers",
  customer_statement: "Read a customer statement",
  search_payments: "Checked payments",
  stock_levels: "Checked stock",
  search_employees: "Looked up staff",
  get_income_statement: "Prepared the income statement",
  get_balance_sheet: "Prepared the balance sheet",
  propose_change: "Checked the requested change",
};

const WAITING_STEPS = ["Thinking…", "Looking through your records…", "Adding up the numbers…", "Almost there…"];

// ---------------------------------------------------------------------------
// Markdown styling (answers contain tables, lists and bold text)
// ---------------------------------------------------------------------------

const mdComponents = {
  p: ({ node, ...p }) => <p className="mb-2 last:mb-0" {...p} />,
  ul: ({ node, ...p }) => <ul className="mb-2 list-disc pl-5 last:mb-0" {...p} />,
  ol: ({ node, ...p }) => <ol className="mb-2 list-decimal pl-5 last:mb-0" {...p} />,
  li: ({ node, ...p }) => <li className="mb-0.5" {...p} />,
  h1: ({ node, ...p }) => <h3 className="mb-2 mt-1 font-semibold" {...p} />,
  h2: ({ node, ...p }) => <h3 className="mb-2 mt-1 font-semibold" {...p} />,
  h3: ({ node, ...p }) => <h3 className="mb-2 mt-1 font-semibold" {...p} />,
  h4: ({ node, ...p }) => <h4 className="mb-1 mt-1 font-medium" {...p} />,
  hr: () => <hr className="my-2 border-border" />,
  code: ({ node, ...p }) => <code className="rounded bg-muted px-1 py-0.5 text-[0.85em]" {...p} />,
  table: ({ node, ...p }) => (
    <div className="my-2 overflow-x-auto">
      <table className="w-full border-collapse text-xs" {...p} />
    </div>
  ),
  th: ({ node, ...p }) => <th className="border-b px-2 py-1 text-left font-semibold" {...p} />,
  td: ({ node, ...p }) => <td className="border-b px-2 py-1 align-top" {...p} />,
};

// ---------------------------------------------------------------------------
// Small pieces
// ---------------------------------------------------------------------------

function ToolTrail({ toolCalls }) {
  if (!toolCalls?.length) return null;
  return (
    <details className="mt-2 text-xs text-muted-foreground">
      <summary className="cursor-pointer select-none">How I found this ({toolCalls.length})</summary>
      <ul className="mt-1 space-y-0.5 pl-4">
        {toolCalls.map((t, i) => (
          <li key={i} className={t.ok ? "" : "text-destructive"}>
            {TOOL_LABELS[t.name] || t.name}
            {!t.ok && " (failed)"}
          </li>
        ))}
      </ul>
    </details>
  );
}

function ActionCard({ action }) {
  const target = action.target || {};
  const subject = target.billReferenceNo
    ? `Invoice ${target.billReferenceNo}${target.customerName ? ` · ${target.customerName}` : ""}`
    : target.customer
      ? `${target.customer.name}${target.customer.code ? ` (${target.customer.code})` : ""}`
      : null;

  return (
    <div className="mt-2 rounded-lg border bg-muted/40 p-3 text-xs">
      <div className="flex items-center gap-2 font-medium">
        {action.allowed ? (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
        ) : (
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
        )}
        <span>{action.label}</span>
      </div>
      {subject && <p className="mt-1 text-muted-foreground">{subject}</p>}
      {action.reason && <p className="mt-1">{action.reason}</p>}
      {action.checks?.length > 0 && (
        <ul className="mt-1 list-disc space-y-0.5 pl-4">
          {action.checks.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-muted-foreground">
        {action.allowed ? "Ready to do in the ERP: " : "Where this is done: "}
        <span className="font-medium text-foreground">{action.howTo}</span>
      </p>
      <p className="mt-1 text-muted-foreground">The assistant does not make changes; please confirm it there.</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AssistantPage() {
  const { user } = useUser();
  const [messages, setMessages] = useState([]); // { role: "user"|"assistant", content, toolCalls?, proposedActions?, error? }
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [waitStep, setWaitStep] = useState(0);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy, waitStep]);

  useEffect(() => () => abortRef.current?.abort(), []);

  // Rotate the waiting message while a request is in flight
  useEffect(() => {
    if (!busy) return undefined;
    setWaitStep(0);
    const id = setInterval(() => setWaitStep((s) => Math.min(s + 1, WAITING_STEPS.length - 1)), 4000);
    return () => clearInterval(id);
  }, [busy]);

  const send = async (question) => {
    const AGENT_URL = `${EXPRESS_PRIVATE_URL}/api/Invoice/agent`;
    const REQUEST_TIMEOUT_MS = 90000; // financial statements can take up to ~40s; the backend may also queue for 15s
    const MAX_HISTORY = 10;

    const content = (question ?? input).trim();
    if (!content || busy) return;
    setError("");
    setInput("");

    // Backend history format: [{ role: "user" | "model", text }]
    const history = messages
      .filter((m) => !m.error && m.content)
      .slice(-MAX_HISTORY)
      .map((m) => ({ role: m.role === "assistant" ? "model" : "user", text: m.content }));

    setMessages((prev) => [...prev, { role: "user", content }]);
    setBusy(true);

    const controller = new AbortController();
    abortRef.current = controller;
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(AGENT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(user.user.tenantId)}`,
          access: `${Encrypt(user.user._id)}`,
          sessionKey: `Bearer ${Encrypt(user.user.SessionId)}`,
        },
        credentials: "include",
        body: JSON.stringify({ question: content, history }),
        signal: controller.signal,
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        let message = body.error || `Request failed (${res.status}).`;
        if (res.status === 401) message = body.error || "Your session has expired. Please sign in again.";
        if ((res.status === 429 || res.status === 503) && body.retryAfter) {
          message = `${body.error || "The assistant is busy."} Try again in ${body.retryAfter} seconds.`;
        }
        throw new Error(message);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: body.answer || "I could not produce an answer for that question.",
          toolCalls: body.toolCalls || [],
          proposedActions: body.proposedActions || [],
        },
      ]);
    } catch (err) {
      if (err.name === "AbortError" && !timedOut) return; // page closed
      const message = timedOut
        ? "That took too long. Please try again or ask a narrower question."
        : err.message || "Something went wrong.";
      setError(message);
      setMessages((prev) => [...prev, { role: "assistant", content: message, error: true }]);
    } finally {
      clearTimeout(timer);
      setBusy(false);
      abortRef.current = null;
    }
  };

  const resetChat = () => {
    abortRef.current?.abort();
    setMessages([]);
    setError("");
    setInput("");
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="w-full space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Sparkles className="h-5 w-5 shrink-0" />
                Kamsi, your business assistant
              </CardTitle>
              <CardDescription className="mt-1 text-sm">
                Ask about {user?.business?.companyName || "your"} invoices, customer balances, payments, stock, staff,
                profit and loss, and the balance sheet in plain language. Kamsi reads your records and can check a change
                for you, but never changes anything itself.
              </CardDescription>
            </div>
            {messages.length > 0 && (
              <Button type="button" variant="ghost" size="sm" onClick={resetChat} disabled={busy} className="shrink-0 gap-1">
                <RotateCcw className="h-4 w-4" /> New chat
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="max-h-[55dvh] min-h-[40dvh] space-y-4 overflow-y-auto rounded-lg border bg-muted/30 p-3 sm:p-4">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Try one of these, or type your own question:</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <Button
                      key={s}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-auto whitespace-normal text-left"
                      onClick={() => send(s)}
                    >
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
                  className={`max-w-[88%] break-words rounded-2xl px-3 py-2 text-sm leading-relaxed sm:max-w-[80%] ${
                    m.role === "user"
                      ? "whitespace-pre-wrap bg-primary text-primary-foreground"
                      : m.error
                        ? "border border-destructive/40 bg-destructive/5 text-destructive"
                        : "border bg-background"
                  }`}
                >
                  {m.role === "assistant" && !m.error ? (
                    <>
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                        {m.content}
                      </ReactMarkdown>
                      {m.proposedActions?.map((a, j) => (
                        <ActionCard key={j} action={a} />
                      ))}
                      <ToolTrail toolCalls={m.toolCalls} />
                    </>
                  ) : (
                    m.content
                  )}
                </div>
                {m.role === "user" && (
                  <div className="mt-1 hidden h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted sm:flex">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {busy && (
              <div className="flex justify-start gap-2 sm:gap-3">
                <div className="mt-1 hidden h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground sm:flex">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl border bg-background px-3 py-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {WAITING_STEPS[waitStep]}
                </div>
              </div>
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
              placeholder="e.g. What was our profit last month?"
              rows={2}
              maxLength={2000}
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
