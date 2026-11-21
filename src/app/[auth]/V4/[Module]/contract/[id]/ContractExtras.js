"use client";

// A contract's instalment schedule (run by the Subscriptions engine: reminders, pay links,
// saved-card charges, overdue follow-up, completes itself when paid in full) and its document
// template, which downloads once the contract is paid in full.
// Backend: controllers/contractExtras.js.

import { useEffect, useState } from "react";
import { Download, Link2, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { ErrorMessage, SuccessToast } from "../../../../../../../Functions/Mics";

const naira = (n) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 2 }).format(Number(n || 0));
const lagosToday = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" }).format(new Date());
const STATUS = { active: "Active", past_due: "Overdue", paused: "Paused", completed: "Completed", stopped: "Stopped" };
const box = "rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden";
const btn = "inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-60";
const primary = "inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-60";

export default function ContractExtras({ contractId }) {
  const [info, setInfo] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState({ startDate: lagosToday(), graceDays: 7, Whatsapp: false, Sms: false, autoCharge: true });
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState("");

  const load = async () => {
    const r = await api.get(`/api/Contract/${contractId}/schedule`);
    if (r.ok) {
      setInfo(r.data);
      if (r.data.schedule) {
        const s = r.data.schedule;
        setForm({ startDate: s.startDate || lagosToday(), graceDays: s.graceDays ?? 7, Whatsapp: !!s.Whatsapp, Sms: !!s.Sms, autoCharge: s.autoCharge !== false });
      }
    }
    const t = await api.get("/api/Contract/templates");
    if (t.ok) setTemplates(t.data.templates || []);
  };
  useEffect(() => { load(); }, [contractId]);

  const saveSchedule = async () => {
    setBusy("schedule");
    const r = await api.post(`/api/Contract/${contractId}/schedule`, { ...form, graceDays: Number(form.graceDays) });
    setBusy("");
    if (!r.ok) return ErrorMessage(r.data?.error || r.error || "Not saved");
    SuccessToast(r.data.message);
    setEditing(false);
    load();
  };

  const change = async (action) => {
    if (action === "stop" && !window.confirm("Stop the instalment schedule? No more reminders or charges.")) return;
    setBusy(action);
    const r = await api.patch(`/api/Contract/${contractId}/schedule`, { action });
    setBusy("");
    if (!r.ok) return ErrorMessage(r.data?.error || r.error || "Not changed");
    SuccessToast(r.data.message);
    load();
  };

  const chooseTemplate = async (templateId) => {
    const r = await api.patch(`/api/Contract/${contractId}/template`, { templateId: templateId || null });
    if (!r.ok) return ErrorMessage(r.data?.error || r.error || "Not saved");
    SuccessToast(r.data.message);
    load();
  };

  const download = async () => {
    setBusy("download");
    try {
      const { API_URL } = await import("@/lib/api");
      const res = await fetch(`${API_URL}/api/Contract/${contractId}/certificate`, { credentials: "include" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "The document could not be made");
      }
      const blob = await res.blob();
      const name = (/filename="([^"]+)"/.exec(res.headers.get("Content-Disposition") || "") || [])[1] || "contract-document";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      ErrorMessage(err.message);
    } finally {
      setBusy("");
    }
  };

  const payLink = async () => {
    const r = await api.get(`/api/subscriptions/pay-link?kind=con&id=${contractId}`);
    if (!r.ok) return ErrorMessage(r.data?.error || r.error || "No pay link");
    try { await navigator.clipboard.writeText(r.data.url); SuccessToast("Pay link copied: send it to the customer"); } catch { window.prompt("Pay link", r.data.url); }
  };

  if (!info) return <section className={box}><div className="p-6 text-sm text-zinc-500 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading schedule…</div></section>;

  const s = info.schedule;
  const p = info.position;
  const paidInFull = Number(info.paid) + 0.005 >= Number(info.total || 0) && Number(info.total) > 0;
  const closedContract = ["terminated", "completed"].includes(info.status);

  return (
    <>
      <section className={box}>
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Instalment schedule</h3>
          {s && <span className="text-xs font-medium px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">{STATUS[s.status] || s.status}</span>}
        </div>
        <div className="p-6 space-y-4 text-sm">
          {s && s.enabled && !editing ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div><p className="text-xs text-zinc-500">Paid</p><p className="font-semibold">{naira(info.paid)}</p></div>
                <div><p className="text-xs text-zinc-500">Due now</p><p className={`font-semibold ${p?.dueNow > 0 ? "text-rose-600" : ""}`}>{naira(p?.dueNow)}</p></div>
                <div><p className="text-xs text-zinc-500">Next due</p><p className="font-semibold">{p?.nextDueDate || "—"}</p></div>
                <div><p className="text-xs text-zinc-500">Left to pay</p><p className="font-semibold">{naira(p?.remaining)}</p></div>
              </div>
              <p className="text-xs text-zinc-500">Due dates: {(p?.dates || []).join(", ")}. Reminders by email{s.Whatsapp ? ", WhatsApp" : ""}{s.Sms ? ", SMS" : ""}; {s.autoCharge !== false ? "saved cards are charged on each due date" : "saved cards are not charged"}; overdue {s.graceDays ?? 7} days after a due date.</p>
              <div className="flex flex-wrap gap-2">
                {p?.dueNow > 0 && <button className={btn} onClick={payLink}><Link2 className="w-4 h-4" /> Copy pay link</button>}
                {["active", "past_due"].includes(s.status) && <button className={btn} disabled={busy !== ""} onClick={() => change("pause")}>Pause</button>}
                {s.status === "paused" && <button className={btn} disabled={busy !== ""} onClick={() => change("resume")}>Resume</button>}
                {s.status !== "completed" && <button className={btn} disabled={busy !== ""} onClick={() => setEditing(true)}>Change</button>}
                {s.status !== "completed" && <button className={btn} disabled={busy !== ""} onClick={() => change("stop")}>Stop</button>}
              </div>
            </>
          ) : closedContract ? (
            <p className="text-zinc-500">This contract is {info.status}.</p>
          ) : (
            <>
              <p className="text-zinc-500">
                Let the Subscriptions engine follow this contract&apos;s instalments: a reminder before each due date, a pay link (or the customer&apos;s saved card) on the due date,
                overdue follow-up, and the contract completes itself once paid in full. No new invoices are raised — the contract&apos;s invoice already holds the amount.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="space-y-1"><span className="text-xs font-medium">First due date</span>
                  <input type="date" className="w-full h-10 rounded-md border px-3 bg-transparent" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></label>
                <label className="space-y-1"><span className="text-xs font-medium">Days to pay before overdue</span>
                  <input type="number" min={0} max={90} className="w-full h-10 rounded-md border px-3 bg-transparent" value={form.graceDays} onChange={(e) => setForm({ ...form, graceDays: e.target.value })} /></label>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.autoCharge} onChange={(e) => setForm({ ...form, autoCharge: e.target.checked })} /> Charge the customer&apos;s saved card on each due date</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.Whatsapp} onChange={(e) => setForm({ ...form, Whatsapp: e.target.checked })} /> Also remind by WhatsApp</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.Sms} onChange={(e) => setForm({ ...form, Sms: e.target.checked })} /> Also remind by SMS (₦8 each from your SMS credit)</label>
              </div>
              <div className="flex gap-2">
                <button className={primary} disabled={busy !== ""} onClick={saveSchedule}>{busy === "schedule" ? "Saving…" : s && s.enabled ? "Save changes" : "Start the schedule"}</button>
                {editing && <button className={btn} onClick={() => setEditing(false)}>Cancel</button>}
              </div>
            </>
          )}
        </div>
      </section>

      <section className={box}>
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Document on completion</h3>
        </div>
        <div className="p-6 space-y-3 text-sm">
          {templates.length === 0 ? (
            <p className="text-zinc-500">No templates yet. An administrator can upload one under Contracts → Templates.</p>
          ) : (
            <label className="space-y-1 block"><span className="text-xs font-medium">Template</span>
              <select className="w-full h-10 rounded-md border px-3 bg-transparent" value={info.templateId || ""} onChange={(e) => chooseTemplate(e.target.value)}>
                <option value="">No template</option>
                {templates.map((t) => <option key={t._id} value={t._id}>{t.name} ({t.fileKind === "pdf" ? "PDF" : "Word"})</option>)}
              </select>
            </label>
          )}
          <button className={primary} disabled={!info.templateId || !paidInFull || busy !== ""} onClick={download}
            title={!paidInFull ? "Available once the contract is paid in full" : ""}>
            {busy === "download" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download document
          </button>
          {!paidInFull && <p className="text-xs text-zinc-500">Available once the contract is paid in full ({naira(info.paid)} of {naira(info.total)} paid).</p>}
        </div>
      </section>
    </>
  );
}
