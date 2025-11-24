"use client";

import React, { useState, useRef } from "react";

// Simple exponential backoff retry for fetch
async function fetchWithRetries(url, options = {}, retries = 3, baseDelayMs = 500, onProgress) {
  let attempt = 0;
  let lastErr;
  while (attempt <= retries) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // Stream reading to report progress
      const contentLength = Number(res.headers.get("content-length")) || 0;
      const reader = res.body.getReader();
      const chunks = [];
      let received = 0;

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        if (contentLength && typeof onProgress === "function") {
          onProgress(Math.min(100, Math.floor((received / contentLength) * 100)));
        }
      }

      // Merge chunks to a Blob
      const blob = new Blob(chunks, { type: "application/pdf" });
      return blob;
    } catch (err) {
      lastErr = err;
      if (attempt === retries) break;
      const delay = baseDelayMs * Math.pow(2, attempt);
      await new Promise((r) => setTimeout(r, delay));
      attempt += 1;
    }
  }
  throw lastErr || new Error("Fetch failed");
}

// Optional compression using CompressionStream (gzip)
// Not all browsers support this; we detect and fallback.
async function maybeCompressPdfBlob(blob, onStatus) {
  // Only attempt compression if browser supports it and file is sizable
  const sizeMB = blob.size / (1024 * 1024);
  if (typeof CompressionStream === "undefined" || sizeMB < 2) {
    onStatus?.(`Compression skipped (${sizeMB.toFixed(2)} MB).`);
    return { blob, filename: "document.pdf" };
  }

  try {
    onStatus?.("Compressing (gzip)...");
    const cs = new CompressionStream("gzip");
    const compressedStream = blob.stream().pipeThrough(cs);

    const compressedBlob = await new Response(compressedStream).blob();

    // If compression is larger (rare), keep original
    if (compressedBlob.size >= blob.size) {
      onStatus?.("Compression not effective, using original.");
      return { blob, filename: "document.pdf" };
    }

    onStatus?.(
      `Compressed ${sizeMB.toFixed(2)} MB → ${(compressedBlob.size / (1024 * 1024)).toFixed(2)} MB.`
    );
    return { blob: compressedBlob, filename: "document.pdf.gz" };
  } catch (e) {
    onStatus?.("Compression failed, using original.");
    return { blob, filename: "document.pdf" };
  }
}

export default function SharePdfMinimal({ pdfUrl = "/docs/sample.pdf" }) {
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const busyRef = useRef(false);

  async function handleShare() {
    if (busyRef.current) return;
    busyRef.current = true;
    setStatus("Fetching PDF...");
    setProgress(0);

    try {
      // 1) Fetch with progress + retries
      const blob = await fetchWithRetries(
        pdfUrl,
        { cache: "no-store" },
        2, // retries
        600, // base delay
        (pct) => setProgress(pct)
      );

      // 2) Optional compression (if supported and large)
      const { blob: outBlob, filename } = await maybeCompressPdfBlob(blob, (msg) => setStatus(msg));

      // 3) Create a shareable File
      const file = new File([outBlob], filename, {
        type: outBlob.type || "application/pdf",
        lastModified: Date.now(),
      });

      // 4) Capability checks
      if (!navigator.canShare || !navigator.canShare({ files: [file] })) {
        setStatus("Sharing files is not supported on this device/browser.");
        busyRef.current = false;
        return;
      }

      // 5) Share via OS sheet
      setStatus("Opening share sheet...");
      await navigator.share({
        title: "Share PDF",
        text: "Please review this PDF.",
        files: [file],
      });

      setStatus("Shared successfully.");
      setProgress(100);
    } catch (err) {
      // Retry final share attempt if it failed for transient reasons
      if (String(err?.message || "").toLowerCase().includes("domexception")) {
        try {
          setStatus("Retrying share...");
          await navigator.share({
            title: "Share PDF",
            text: "Please review this PDF.",
            files: [
              new File([new Blob([await (await fetch(pdfUrl)).arrayBuffer()], { type: "application/pdf" })], "document.pdf", {
                type: "application/pdf",
              }),
            ],
          });
          setStatus("Shared successfully.");
          setProgress(100);
          busyRef.current = false;
          return;
        } catch (err2) {
          setStatus(`Share failed: ${err2.message || err2}`);
        }
      } else {
        setStatus(`Failed: ${err.message || err}`);
      }
    } finally {
      busyRef.current = false;
    }
  }

  // Minimal UI
  return (
    <div style={{ maxWidth: 420, margin: "24px auto", padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <button onClick={handleShare} style={{ padding: "8px 12px" }}>
          Share PDF
        </button>
        <small style={{ color: "#666" }}>{status}</small>
      </div>

      {/* Minimal progress indicator */}
      <div style={{ height: 6, background: "#eee", borderRadius: 4, overflow: "hidden" }}>
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background: "#4caf50",
            transition: "width 200ms ease",
          }}
        />
      </div>

      <small style={{ display: "block", marginTop: 6, color: "#888" }}>{progress}%</small>
    </div>
  );
}
