"use client";

// Contract templates the business uploads (Word with {placeholders}, or a fillable PDF). A
// contract's chosen template downloads filled in once the contract is paid in full.
// Backend: controllers/contractExtras.js, lib/contracts/templates.js.

import { useEffect, useState } from "react";
import { FileText, Loader2, Trash2, Upload } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ErrorMessage, SuccessToast } from "../../../../../../Functions/Mics";

const MAX = 1024 * 1024;

const readAsDataUrl = (file) => new Promise((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(r.result);
  r.onerror = () => reject(new Error("Could not read the file"));
  r.readAsDataURL(file);
});

export default function ContractTemplates({ isAdmin }) {
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState(null);
  const [fields, setFields] = useState({});
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const [t, f] = await Promise.all([api.get("/api/Contract/templates"), api.get("/api/Contract/template-fields")]);
    setTemplates(t.ok ? t.data.templates || [] : []);
    if (f.ok) setFields(f.data.fields || {});
  };
  useEffect(() => { if (open) load(); }, [open]);

  const upload = async () => {
    if (!file) return;
    if (file.size > MAX) return ErrorMessage("The file must be 1 MB or smaller");
    setBusy(true);
    try {
      const data = await readAsDataUrl(file);
      const r = await api.post("/api/Contract/templates", { name: name.trim() || file.name, fileName: file.name, data });
      if (!r.ok) throw new Error(r.data?.error || r.error || "Not uploaded");
      SuccessToast(r.data.message);
      setName("");
      setFile(null);
      load();
    } catch (err) {
      ErrorMessage(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (t) => {
    if (!window.confirm(`Delete the template "${t.name}"? Contracts using it will have no template.`)) return;
    const r = await api.del(`/api/Contract/templates/${encodeURIComponent(t._id)}`);
    if (!r.ok) return ErrorMessage(r.data?.error || r.error || "Not deleted");
    SuccessToast("Template deleted");
    load();
  };

  return (
    <>
      <Button variant="outline" className="gap-2" onClick={() => setOpen(true)}>
        <FileText className="h-4 w-4" /> Templates
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Contract templates</DialogTitle>
            <DialogDescription>
              Your own document — e.g. a completion certificate — filled in with the contract&apos;s details. It can be downloaded from a contract once the contract is paid in full.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 text-sm">
            <div className="space-y-2">
              {templates === null ? (
                <p className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</p>
              ) : templates.length === 0 ? (
                <p className="text-muted-foreground">No templates yet.</p>
              ) : (
                <ul className="divide-y rounded-md border">
                  {templates.map((t) => (
                    <li key={t._id} className="flex items-center gap-3 p-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1 min-w-0">
                        <span className="font-medium">{t.name}</span>
                        <span className="block text-xs text-muted-foreground truncate">
                          {t.fileKind === "pdf" ? "PDF form" : "Word"} · {t.fileName} · {(t.placeholders || []).length} placeholder(s)
                          {t.unknownPlaceholders?.length ? ` · unknown: ${t.unknownPlaceholders.join(", ")}` : ""}
                        </span>
                      </span>
                      {isAdmin && (
                        <Button size="icon" variant="ghost" onClick={() => remove(t)} title="Delete"><Trash2 className="h-4 w-4" /></Button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {isAdmin && (
              <div className="rounded-md border p-4 space-y-3">
                <p className="font-medium">Upload a template</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="tplName">Name</Label>
                    <Input id="tplName" value={name} onChange={(e) => setName(e.target.value)} placeholder="Completion certificate" maxLength={120} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="tplFile">File (.docx or .pdf, up to 1 MB)</Label>
                    <Input id="tplFile" type="file" accept=".docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  </div>
                </div>
                <Button onClick={upload} disabled={!file || busy} className="gap-2">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload
                </Button>
              </div>
            )}

            <div className="rounded-md bg-muted/40 p-4 space-y-2">
              <p className="font-medium">How to make one</p>
              <p className="text-muted-foreground">
                <b>Word:</b> type placeholders in braces where the details should go, e.g. <code>{"{customer.name}"}</code> or <code>{"{contract.total}"}</code>. The download is a filled Word file.
              </p>
              <p className="text-muted-foreground">
                <b>PDF:</b> add text form fields (in a PDF editor) and name each one like a placeholder without braces, e.g. <code>customer.name</code>. The download is a filled PDF.
                In a PDF, amounts are written “NGN” and accented letters lose their accent (the standard PDF fonts can&apos;t print ₦ or ẹ, ọ, ṣ); Word keeps them.
              </p>
              <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1 pt-1">
                {Object.entries(fields).map(([k, v]) => (
                  <p key={k} className="text-xs"><code className="text-indigo-600">{`{${k}}`}</code> <span className="text-muted-foreground">{v}</span></p>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
