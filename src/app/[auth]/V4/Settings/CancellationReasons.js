"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorMessage, SuccessToast } from "../../../../../Functions/Mics";

const MAX_REASONS = 50;
const MAX_LENGTH = 1000;

export default function CancellationReasons({ isAdmin }) {
  const [reasons, setReasons] = useState(null);
  const [newReason, setNewReason] = useState("");
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const response = await api.get("/api/CancellationReasons");
    if (!response.ok) {
      setReasons([]);
      return ErrorMessage(response.error || "Could not load cancellation reasons");
    }
    setReasons(response.data?.data || []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (method, body) => {
    setBusy(true);
    const response = method === "post"
      ? await api.post("/api/CancellationReasons", body)
      : method === "patch"
        ? await api.patch("/api/CancellationReasons", body)
        : await api("/api/CancellationReasons", { method: "DELETE", body });
    setBusy(false);
    if (!response.ok) return ErrorMessage(response.error || "Could not save cancellation reasons");
    setReasons(response.data?.data || []);
    return true;
  };

  const add = async (event) => {
    event.preventDefault();
    const reason = newReason.trim();
    if (!reason) return;
    if (await save("post", { reason })) {
      setNewReason("");
      SuccessToast("Cancellation reason added");
    }
  };

  const update = async (event) => {
    event.preventDefault();
    const reason = editing?.value?.trim();
    if (!reason || reason === editing.original) return;
    if (await save("patch", { oldReason: editing.original, reason })) {
      setEditing(null);
      SuccessToast("Cancellation reason updated");
    }
  };

  const remove = async (reason) => {
    if (!window.confirm(`Remove cancellation reason "${reason}"?`)) return;
    if (await save("delete", { reason })) SuccessToast("Cancellation reason removed");
  };

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-lg font-semibold">Invoice cancellation reasons</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage the reasons staff can select when processing a full invoice return. {reasons ? `${reasons.length} of ${MAX_REASONS} configured.` : ""}
        </p>
      </header>

      {!isAdmin && (
        <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          Only an admin can change cancellation reasons.
        </p>
      )}

      {isAdmin && (
        <form onSubmit={add} className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={newReason}
            onChange={(event) => setNewReason(event.target.value)}
            maxLength={MAX_LENGTH}
            placeholder="Add a cancellation reason"
            aria-label="New cancellation reason"
          />
          <Button type="submit" disabled={busy || !newReason.trim() || (reasons?.length || 0) >= MAX_REASONS}>
            Add reason
          </Button>
        </form>
      )}

      <div className="divide-y rounded-md border">
        {reasons === null ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">Loading…</p>
        ) : reasons.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">No cancellation reasons configured.</p>
        ) : reasons.map((reason) => (
          <div key={reason} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
            {editing?.original === reason ? (
              <form onSubmit={update} className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row">
                <Input
                  value={editing.value}
                  onChange={(event) => setEditing((current) => ({ ...current, value: event.target.value }))}
                  maxLength={MAX_LENGTH}
                  aria-label="Edit cancellation reason"
                  autoFocus
                />
                <Button type="submit" disabled={busy || !editing.value.trim()}>Save</Button>
                <Button type="button" variant="outline" disabled={busy} onClick={() => setEditing(null)}>Cancel</Button>
              </form>
            ) : (
              <>
                <span className="min-w-0 flex-1 break-words text-sm">{reason}</span>
                {isAdmin && (
                  <div className="flex shrink-0 gap-2">
                    <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => setEditing({ original: reason, value: reason })}>Edit</Button>
                    <Button type="button" variant="destructive" size="sm" disabled={busy} onClick={() => remove(reason)}>Remove</Button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
